// examiner.js - Modo Examinador estricto con examState controlado por frontend
import { logAttempt } from "./firebase.js";

function getChat() { return window.getActiveChat ? window.getActiveChat() : null; }
function save() { if (window.saveChatsToStorage) window.saveChatsToStorage(); }

export function getExamState() {
  const c = getChat();
  return c ? c.examState : null;
}

export function isExamActive() {
  const s = getExamState();
  return s && s.active;
}

export function startExam({ totalQuestions, difficulty, topics, strictMaterial }) {
  const chat = getChat();
  if (!chat) return;
  chat.examState = {
    active: true,
    questionNumber: 0,
    totalQuestions: Number(totalQuestions) || 5,
    difficulty: difficulty || "media",
    topics: topics || "todos",
    strictMaterial: !!strictMaterial,
    currentQuestion: null,
    results: [],
    score: 0,
    startedAt: new Date().toISOString()
  };
  save();
  renderExaminerPanel();
  // Mensaje inicial para que el backend genere la primera pregunta
  const intro = `Iniciar examen. Configuración: ${chat.examState.totalQuestions} preguntas, dificultad ${chat.examState.difficulty}, temas: ${chat.examState.topics}, modo: ${strictMaterial ? "solo material (no inventar)" : "mixto"}. Generá la primera pregunta en JSON.`;
  // Usar handleSend interno con examState
  window.handleExaminerStart && window.handleExaminerStart(intro);
}

export function endExam() {
  const chat = getChat();
  if (!chat || !chat.examState) return;
  const s = chat.examState;
  s.active = false;
  s.finishedAt = new Date().toISOString();
  // Generar informe final
  const correct = s.results.filter(r=>r.result==="correct").length;
  const partial = s.results.filter(r=>r.result==="partially_correct").length;
  const incorrect = s.results.filter(r=>r.result==="incorrect").length;
  const pct = s.results.length ? Math.round((s.score / s.results.length)*100) : 0;
  const topicsMap = {};
  s.results.forEach(r=>{
    const t = r.topic || "General";
    if (!topicsMap[t]) topicsMap[t]= {correct:0, total:0};
    topicsMap[t].total++;
    if (r.result==="correct") topicsMap[t].correct++;
  });
  let report = `📊 **EXAMEN FINALIZADO**\n\n**Puntaje:** ${s.score}/${s.results.length} (${pct}%) — ${correct} correctas, ${partial} parciales, ${incorrect} incorrectas\n\n`;
  report += `**Por tema:**\n`;
  for (const [topic, v] of Object.entries(topicsMap)) {
    const p = Math.round((v.correct/v.total)*100);
    const icon = p>=70?"✅":p>=40?"⚠️":"❌";
    report += `${icon} ${topic}: ${v.correct}/${v.total} (${p}%)\n`;
  }
  // Guardar en perfil como intentos también
  report += `\n_Revisa "Mi Progreso" para ver el detalle por intento._`;
  if (window.appendMessageDOM) window.appendMessageDOM("agent", report);
  save();
  renderExaminerPanel();
}

export function handleExaminerQuestion(json) {
  const chat = getChat();
  if (!chat || !chat.examState) return;
  const s = chat.examState;
  s.questionNumber = (s.questionNumber || 0) + 1;
  s.currentQuestion = json;
  save();
  renderExaminerPanel();
  // Mostrar pregunta en chat
  const qText = `**Pregunta ${s.questionNumber}/${s.totalQuestions}** [${json.topic || "General"} - ${json.difficulty || s.difficulty}]\n\n${json.question}\n\n*Responde en el chat. Solo 1 respuesta por turno.*`;
  if (window.appendMessageDOM) window.appendMessageDOM("agent", qText);
}

export async function handleExaminerEvaluation(json, userAnswer) {
  const chat = getChat();
  if (!chat || !chat.examState) return;
  const s = chat.examState;
  const result = json.result || "incorrect";
  const score = Number(json.score) || (result==="correct"?1: result==="partially_correct"?0.5:0);
  s.results.push({
    questionNumber: s.questionNumber,
    question: s.currentQuestion?.question || "",
    topic: json.topic || s.currentQuestion?.topic || "General",
    answer: userAnswer,
    result,
    score,
    main_error: json.main_error || null,
    feedback: json.feedback || "",
    mastery_estimate: json.mastery_estimate || null
  });
  s.score += score;
  // Guardar intento individual para perfil académico
  try {
    await logAttempt({
      subject: s.topics !== "todos" ? s.topics : (json.topic || "General"),
      topic: json.topic || "General",
      result: result==="correct"?"correct": result==="partially_correct"?"partial":"incorrect",
      attempts: 1,
      hintsUsed: 0,
      timeSpentSec: null,
      confidence: null,
      errorType: json.main_error ? "conceptual" : null,
      exerciseSnippet: s.currentQuestion?.question?.slice(0,200) || "",
      mode: "examinador",
      chatId: chat.id
    });
  } catch(e){ console.warn("No se pudo guardar attempt examinador:", e.message); }

  // Feedback breve
  const icon = result==="correct" ? "✅ Correcta" : result==="partially_correct" ? "🟡 Parcialmente correcta" : "❌ Incorrecta";
  let fb = `**${icon}** (${score}/1)\n`;
  if (json.main_error) fb += `*Error:* ${json.main_error}\n`;
  if (json.feedback) fb += `${json.feedback}\n`;
  if (window.appendMessageDOM) window.appendMessageDOM("agent", fb);

  save();
  renderExaminerPanel();

  if (s.questionNumber >= s.totalQuestions) {
    setTimeout(()=> {
      if (s.active && s.questionNumber >= s.totalQuestions) {
        endExam();
      }
    }, 800);
  } else {
    // Auto-generar siguiente pregunta sin que el usuario tenga que escribir "siguiente"
    setTimeout(()=> {
      if (s.active && window.handleExaminerStart) {
        window.handleExaminerStart(`Generar siguiente pregunta ${s.questionNumber+1}/${s.totalQuestions} en JSON. No evalúes, solo pregunta.`);
      }
    }, 900);
  }
}

export function renderExaminerPanel() {
  const panel = document.getElementById("examiner-panel");
  const chat = getChat();
  if (!panel || !chat) return;
  if (chat.mode !== "examinador") {
    panel.classList.add("hidden");
    return;
  }
  const s = chat.examState;
  if (!s || !s.active) {
    // Mostrar config para iniciar
    panel.classList.remove("hidden");
    panel.innerHTML = `
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:1rem;margin-bottom:1rem">
        <h4 style="font-family:var(--font-heading);margin-bottom:0.6rem">📝 Configurar examen</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.6rem;margin-bottom:0.6rem">
          <div class="form-group" style="margin:0"><label>Cant. preguntas</label><select id="exam-total" class="form-control"><option value="5" selected>5</option><option value="10">10</option><option value="3">3</option></select></div>
          <div class="form-group" style="margin:0"><label>Dificultad</label><select id="exam-diff" class="form-control"><option value="baja">Baja</option><option value="media" selected>Media</option><option value="alta">Alta</option></select></div>
        </div>
        <div class="form-group" style="margin-bottom:0.6rem"><label>Temas (o "todos")</label><input id="exam-topics" class="form-control" placeholder="todos o ej: Autovectores, Diagonalización" value="todos"></div>
        <label style="display:flex;gap:0.5rem;align-items:center;font-size:0.82rem;margin-bottom:0.75rem"><input type="checkbox" id="exam-strict" checked> Solo material cargado (no inventar)</label>
        <button class="btn-new-chat" onclick="window.startExamFromUI()" style="width:100%">Iniciar examen</button>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.5rem">Cargá primero tus PDFs en "Materiales" para que el examen se base en ellos. Estado guardado por chat.</div>
      </div>
    `;
  } else {
    panel.classList.remove("hidden");
    const pct = s.results.length ? Math.round((s.score / s.results.length)*100) : 0;
    panel.innerHTML = `
      <div style="background:var(--bg-card);border:1px solid var(--border-active);border-radius:12px;padding:0.85rem;margin-bottom:1rem;display:flex;flex-direction:column;gap:0.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="font-family:var(--font-heading)">📝 Examen ${s.questionNumber}/${s.totalQuestions}</strong>
          <button class="btn-secondary" onclick="window.endExamFromUI()" style="padding:0.3rem 0.6rem;font-size:0.75rem">Finalizar</button>
        </div>
        <div style="background:rgba(255,255,255,0.08);border-radius:8px;height:8px;overflow:hidden"><div style="height:100%;background:linear-gradient(90deg,var(--primary),var(--accent-cyan));width:${(s.questionNumber/s.totalQuestions)*100}%"></div></div>
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-secondary)"><span>${s.results.length} respondidas</span><span>${pct}% · ${s.score}/${s.results.length}</span><span>${s.difficulty}</span></div>
        <div style="font-size:0.7rem;color:var(--text-muted)">Temas: ${s.topics} ${s.strictMaterial ? "· Solo material" : ""}</div>
      </div>
    `;
  }
}

window.startExamFromUI = () => {
  const total = document.getElementById("exam-total")?.value || "5";
  const diff = document.getElementById("exam-diff")?.value || "media";
  const topics = document.getElementById("exam-topics")?.value || "todos";
  const strict = document.getElementById("exam-strict")?.checked;
  startExam({ totalQuestions: total, difficulty: diff, topics, strictMaterial: strict });
};
window.endExamFromUI = () => { if(confirm("¿Finalizar examen?")) endExam(); };
window.renderExaminerPanel = renderExaminerPanel;

// Exponer para app.js
window.examinerAPI = { startExam, endExam, handleExaminerQuestion, handleExaminerEvaluation, renderExaminerPanel, getExamState };
