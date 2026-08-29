// evaluations-ui.js - UI para crear y rendir evaluaciones
import { createEvaluation, getEvaluations, getEvaluation, deleteEvaluation, submitEvaluationAttempt, parsePdfTextToQuestions, getEvaluationAttempts } from "./evaluations.js";
import { authReady, getUid } from "./firebase.js";

let tempQuestions = [
  { id: "q1", statement: "", topic: "General", type: "open", options: [], correctAnswer: "", points: 1 }
];
let currentTakeEval = null;
let currentTakeAnswers = {};

function renderQuestionsEditor() {
  const container = document.getElementById("eval-questions-editor");
  if (!container) return;
  container.innerHTML = tempQuestions.map((q, idx) => `
    <div style="background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:10px;padding:0.75rem;display:flex;flex-direction:column;gap:0.5rem">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong style="font-size:0.85rem">Pregunta ${idx+1}</strong>
        <button onclick="removeEvalQuestion(${idx})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.9rem">✕ Quitar</button>
      </div>
      <textarea class="form-control" placeholder="Enunciado" rows="2" oninput="updateEvalQuestion(${idx},'statement',this.value)">${q.statement}</textarea>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem">
        <input class="form-control" placeholder="Tema (ej: Matrices)" value="${q.topic}" oninput="updateEvalQuestion(${idx},'topic',this.value)">
        <select class="form-control" onchange="updateEvalQuestion(${idx},'type',this.value)">
          <option value="open" ${q.type==="open"?"selected":""}>Abierta (texto)</option>
          <option value="multiple_choice" ${q.type==="multiple_choice"?"selected":""}>Multiple choice (UBA XXI)</option>
        </select>
      </div>
      ${q.type==="multiple_choice" ? `
        <input class="form-control" placeholder="Opciones separadas por | Ej: A) 1 | B) 2 | C) 3" value="${(q.options||[]).join(' | ')}" oninput="updateEvalQuestionOptions(${idx},this.value)">
        <input class="form-control" placeholder="Respuesta correcta (ej: B)" value="${q.correctAnswer}" oninput="updateEvalQuestion(${idx},'correctAnswer',this.value)">
      ` : ``}
    </div>
  `).join("");
}

window.updateEvalQuestion = (idx, field, value) => { tempQuestions[idx][field]=value; };
window.updateEvalQuestionOptions = (idx, value) => { tempQuestions[idx].options = value.split("|").map(s=>s.trim()).filter(Boolean); };
window.removeEvalQuestion = (idx) => { tempQuestions.splice(idx,1); if(tempQuestions.length===0) tempQuestions.push({id:`q1`,statement:"",topic:"General",type:"open",options:[],correctAnswer:"",points:1}); renderQuestionsEditor(); };
window.addEvalQuestion = () => { tempQuestions.push({id:`q${tempQuestions.length+1}`,statement:"",topic:"General",type:"open",options:[],correctAnswer:"",points:1}); renderQuestionsEditor(); };
window.autoGenerateMock = () => {
  tempQuestions = [
    {id:"q1",statement:"1. Halle los autovalores de la matriz A = [[2,1],[1,2]]",topic:"Autovalores",type:"open",options:[],correctAnswer:"",points:2},
    {id:"q2",statement:"2. ¿Cuál es la definición de matriz diagonalizable? A) Existe P invertible tal que P⁻¹AP diagonal | B) Tiene determinante 0 | C) Es simétrica",topic:"Diagonalización",type:"multiple_choice",options:["A) Existe P invertible","B) Tiene determinante 0","C) Es simétrica"],correctAnswer:"A",points:2},
    {id:"q3",statement:"3. Verdadero o falso: Todo autovector es no nulo. A) Verdadero | B) Falso",topic:"Autovectores",type:"multiple_choice",options:["A) Verdadero","B) Falso"],correctAnswer:"A",points:1}
  ];
  renderQuestionsEditor();
  document.getElementById("eval-title").value = "Ejemplo - Álgebra II";
};

window.openCreateEvalModal = () => {
  if (!getUid()) { alert("Iniciá sesión para crear evaluaciones"); return; }
  if (tempQuestions.length===0) tempQuestions=[{id:"q1",statement:"",topic:"General",type:"open",options:[],correctAnswer:"",points:1}];
  renderQuestionsEditor();
  document.getElementById("create-eval-modal")?.classList.add("open");
};
window.closeCreateEvalModal = () => document.getElementById("create-eval-modal")?.classList.remove("open");

window.digitalizeLastPdf = async () => {
  const chat = window.getActiveChat ? window.getActiveChat() : null;
  const docs = chat?.loadedDocuments || [];
  const last = docs[docs.length-1];
  if (!last) {
    alert("Primero subí un PDF de un parcial en 'Materiales Académicos'.");
    return;
  }
  console.log("PDF digitalizado:", last.filename, "texto:", (last.text||"").length, "chars");
  // Si es foto (poco texto) usamos imagen del enunciado como vos sugerís
  if (!last.text || last.text.trim().length < 80) {
    const file = window.lastUploadedFile;
    if (!file) { alert("No hay archivo para renderizar como imagen. Re-subí el PDF."); return; }
    if (!confirm("El Altillo suele ser foto (sin texto). ¿Querés crear la evaluación usando la imagen del enunciado? Podés pegar el texto manualmente después.")) return;
    try {
      const pagesToShow = Math.min(last.pages || 1, 3);
      tempQuestions = [];
      for (let p=1; p<=pagesToShow; p++) {
        const img = await getPdfPageAsImage(file, p, 1.2);
        tempQuestions.push({ id:`q${p}`, statement:`Enunciado página ${p} (imagen)`, statementImage: img.dataUrl, topic:"General", type:"open", options:[], correctAnswer:"", points:1 });
      }
      renderQuestionsEditor();
      const titleInput = document.getElementById("eval-title");
      if (titleInput && !titleInput.value) titleInput.value = last.filename.replace(".pdf","").slice(0,40);
      alert(`Se crearon ${tempQuestions.length} preguntas con imagen del PDF. Editá el enunciado o dejá la imagen tal cual y rendí.`);
      return;
    } catch(e){ console.error(e); alert("No se pudo renderizar imagen: "+e.message); return; }
  }
  // Intentar con IA (backend) si hay texto
  const quizType = document.getElementById('quiz-type')?.value || 'mixto';
  const quizCount = document.getElementById('quiz-count')?.value || '10';
  const btn = document.querySelector('button[onclick="digitalizeLastPdf()"]');
  const oldText = btn ? btn.textContent : '';
  if (btn) { btn.textContent = '⏳ Generando con IA...'; btn.disabled = true; }
  try {
    const apiBase = (window.getApiBase ? window.getApiBase() : (localStorage.getItem('fiuba_agent_api_base') || 'https://fiuba-agent-backend-1.onrender.com')).replace(/\/+$/,'');
    const userApiKey = (window.getUserGeminiKey ? window.getUserGeminiKey() : (localStorage.getItem('fiuba_gemini_key')||''));
    const resp = await fetch(apiBase + '/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: last.text, quizType, count: parseInt(quizCount), userApiKey })
    });
    const data = await resp.json();
    if (resp.ok && data.questions && data.questions.length > 0) {
      tempQuestions = data.questions;
      // Para pensamiento computacional y PDFs con código en imagen: adjuntar imagen de la página a cada pregunta
      // Si el PDF tiene código, el texto extraído no lo tiene; mostramos la imagen del enunciado junto al texto
      try {
        const file = window.lastUploadedFile;
        if (file && last.pages) {
          const pagesToRender = Math.min(last.pages, 3);
          // Renderizar páginas como imágenes para adjuntar
          const pageImages = [];
          for (let p=1; p<=pagesToRender; p++) {
            const img = await getPdfPageAsImage(file, p, 1.1);
            pageImages.push(img.dataUrl);
          }
          // Asignar imagen a cada pregunta según proximidad de página (reparto equitativo)
          // Si el enunciado es corto (<120 chars) o menciona "código" es probable que necesite imagen
          tempQuestions.forEach((q, idx) => {
            const needsImage = q.statement.length < 150 || /c[oó]digo|programa|funci[oó]n|algoritmo/i.test(q.statement);
            if (needsImage || pageImages.length === 1) {
              const pageIdx = Math.min(Math.floor(idx / Math.max(1, tempQuestions.length / pageImages.length)), pageImages.length - 1);
              q.statementImage = pageImages[pageIdx];
            }
          });
        }
      } catch(imgErr){ console.warn('No se pudo adjuntar imagen', imgErr); }
      renderQuestionsEditor();
      const titleInput = document.getElementById("eval-title");
      if (titleInput && !titleInput.value) titleInput.value = last.filename.replace(".pdf","").slice(0,40);
      alert(`IA generó ${tempQuestions.length} preguntas (${quizType}) con imagen del enunciado. Revisalas y guardá.`);
      return;
    }
    throw new Error(data.error || 'IA no devolvió preguntas');
  } catch(e) {
    console.warn('IA falló, fallback a parser local', e);
    const parsed = parsePdfTextToQuestions(last.text);
    if (parsed.length === 0) {
      tempQuestions = [{id:"q1",statement:last.text.slice(0,800),topic:"General",type:"open",options:[],correctAnswer:"",points:1}];
    } else {
      tempQuestions = parsed;
    }
    renderQuestionsEditor();
    const titleInput = document.getElementById("eval-title");
    if (titleInput && !titleInput.value) titleInput.value = last.filename.replace(".pdf","").slice(0,40);
    alert(`IA no disponible, se detectaron ${tempQuestions.length} preguntas con parser local. Revisalas y guardá. (${e.message})`);
  } finally {
    if (btn) { btn.textContent = oldText || '📄 Digitalizar con IA'; btn.disabled = false; }
  }
};

window.handleCreateEvaluation = async () => {
  const title = document.getElementById("eval-title")?.value.trim();
  if (!title) { alert("Poné un título"); return; }
  const validQs = tempQuestions.filter(q=>q.statement.trim());
  if (validQs.length===0) { alert("Agregá al menos una pregunta con enunciado"); return; }
  try {
    await createEvaluation({ title, source: "Altillo", questions: validQs });
    closeCreateEvalModal();
    document.getElementById("eval-title").value="";
    tempQuestions=[{id:"q1",statement:"",topic:"General",type:"open",options:[],correctAnswer:"",points:1}];
    await refreshEvaluations();
    alert("✅ Evaluación creada. Ahora tocala en la lista para rendirla.");
  } catch(e){ alert("Error: "+e.message); console.error(e); }
};

async function refreshEvaluations() {
  try {
    const list = await getEvaluations();
    const attempts = await getEvaluationAttempts().catch(()=>[]);
    const container = document.getElementById("evaluations-list");
    const badge = document.getElementById("evals-count");
    if (badge) badge.textContent = `${list.length}`;
    // Sidebar list (compact)
    if (container) {
      if (list.length===0) {
        container.innerHTML = `<div style="font-size:0.75rem;color:var(--text-muted);text-align:center;padding:0.4rem">Aún no hay evaluaciones. Creá una desde un PDF del Altillo.</div>`;
      } else {
        container.innerHTML = list.map(ev => `
          <div class="attempt-chip" style="flex-direction:column;align-items:stretch;gap:0.3rem">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong style="font-size:0.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px" title="${ev.title}">${ev.title}</strong>
              <button onclick="openTakeEvalModal('${ev.id}')" style="background:var(--primary);color:white;border:none;border-radius:6px;padding:0.25rem 0.5rem;font-size:0.7rem;cursor:pointer">Rendir</button>
            </div>
            <span style="font-size:0.7rem;color:var(--text-muted)">${ev.questions?.length||0} preguntas · ${ev.source}</span>
            <button onclick="handleDeleteEval('${ev.id}')" style="background:none;border:none;color:var(--text-muted);font-size:0.68rem;cursor:pointer;text-align:left">🗑️ Eliminar</button>
          </div>
        `).join("");
      }
    }
    // Dashboard view (bonita)
    const grid = document.getElementById("evaluaciones-dashboard-grid");
    const statsEl = document.getElementById("evaluaciones-stats");
    const emptyEl = document.getElementById("evaluaciones-empty");
    const attemptsEl = document.getElementById("evaluaciones-attempts");
    if (grid) {
      if (list.length === 0) {
        grid.innerHTML = "";
        if (emptyEl) emptyEl.classList.remove("hidden");
        if (statsEl) statsEl.innerHTML = "";
        if (attemptsEl) attemptsEl.innerHTML = "";
        return;
      }
      if (emptyEl) emptyEl.classList.add("hidden");
      // Stats
      const totalQs = list.reduce((a,ev)=>a+(ev.questions?.length||0),0);
      const avgScore = attempts.length ? Math.round(attempts.reduce((a,x)=>a+(x.percentage||0),0)/attempts.length) : 0;
      if (statsEl) {
        statsEl.innerHTML = `
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:0.9rem;text-align:center">
            <div style="font-size:1.4rem;font-weight:800;color:var(--accent-cyan)">${list.length}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem">Evaluaciones creadas</div>
          </div>
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:0.9rem;text-align:center">
            <div style="font-size:1.4rem;font-weight:800;color:var(--primary)">${totalQs}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem">Preguntas totales</div>
          </div>
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:0.9rem;text-align:center">
            <div style="font-size:1.4rem;font-weight:800;color:${avgScore>=70?'var(--success)':avgScore>=40?'var(--warning)':'var(--text-muted)'}">${attempts.length ? avgScore+'%' : '—'}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem">Promedio general</div>
          </div>
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:0.9rem;text-align:center">
            <div style="font-size:1.4rem;font-weight:800;color:var(--text-primary)">${attempts.length}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem">Intentos registrados</div>
          </div>`;
      }
      // Cards
      grid.innerHTML = list.map(ev => {
        const qCount = ev.questions?.length||0;
        const hasMC = ev.questions?.some(q=>q.type==='multiple_choice');
        const typeLabel = hasMC ? 'Interactiva' : 'A desarrollar';
        const typeColor = hasMC ? 'var(--accent-cyan)' : 'var(--primary)';
        const lastAttempt = attempts.find(a=>a.evaluationId===ev.id);
        const scoreBadge = lastAttempt ? `<span style="background:${lastAttempt.percentage>=70?'rgba(16,185,129,0.15)':lastAttempt.percentage>=40?'rgba(245,158,11,0.15)':'rgba(239,68,68,0.15)'};color:${lastAttempt.percentage>=70?'var(--success)':lastAttempt.percentage>=40?'var(--warning)':'var(--danger)'};border:1px solid currentColor;padding:0.15rem 0.45rem;border-radius:20px;font-size:0.7rem;font-weight:700">${lastAttempt.percentage}%</span>` : `<span style="background:rgba(255,255,255,0.06);color:var(--text-muted);padding:0.15rem 0.45rem;border-radius:20px;font-size:0.7rem">Sin intentar</span>`;
        return `
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:14px;padding:1rem;display:flex;flex-direction:column;gap:0.7rem;transition:all 0.2s;position:relative;overflow:hidden">
          <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg, ${typeColor}, var(--primary));opacity:0.8"></div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
            <h4 style="font-family:var(--font-heading);font-size:0.92rem;color:var(--text-primary);line-height:1.3;flex:1">${ev.title}</h4>
            ${scoreBadge}
          </div>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
            <span style="font-size:0.68rem;background:rgba(255,255,255,0.06);color:var(--text-secondary);padding:0.2rem 0.45rem;border-radius:20px;border:1px solid var(--border-color)">${qCount} preguntas</span>
            <span style="font-size:0.68rem;background:${typeColor}15;color:${typeColor};padding:0.2rem 0.45rem;border-radius:20px;border:1px solid ${typeColor}30">${typeLabel}</span>
            <span style="font-size:0.68rem;background:rgba(255,255,255,0.04);color:var(--text-muted);padding:0.2rem 0.45rem;border-radius:20px">${ev.source}</span>
          </div>
          <div style="display:flex;gap:0.5rem;margin-top:auto;padding-top:0.3rem">
            <button onclick="openTakeEvalModal('${ev.id}')" style="flex:1;background:var(--primary);color:white;border:none;border-radius:8px;padding:0.5rem;font-size:0.82rem;font-weight:600;cursor:pointer;transition:all 0.15s">▶ Rendir ahora</button>
            <button onclick="handleDeleteEval('${ev.id}')" title="Eliminar" style="background:rgba(255,255,255,0.06);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem 0.7rem;font-size:0.8rem;cursor:pointer;color:var(--text-muted)">🗑️</button>
          </div>
        </div>`;
      }).join("");
      // Attempts history
      if (attemptsEl) {
        if (attempts.length === 0) {
          attemptsEl.innerHTML = "";
        } else {
          attemptsEl.innerHTML = `
            <h3 style="font-family:var(--font-heading);font-size:0.95rem;color:var(--text-primary);margin-bottom:0.6rem">Historial reciente</h3>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
              ${attempts.slice(0,5).map(a=>`
                <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem 0.85rem;display:flex;justify-content:space-between;align-items:center">
                  <div>
                    <div style="font-size:0.82rem;font-weight:600;color:var(--text-primary)">${a.evaluationTitle}</div>
                    <div style="font-size:0.7rem;color:var(--text-muted)">${a.correct}/${a.total} correctas · ${a.totalPoints? a.earnedPoints+'/'+a.totalPoints+' pts':''}</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:1rem;font-weight:800;color:${a.percentage>=70?'var(--success)':a.percentage>=40?'var(--warning)':'var(--danger)'}">${a.percentage}%</div>
                    <div style="font-size:0.68rem;color:var(--text-muted)">${a.score10}/10</div>
                  </div>
                </div>
              `).join("")}
            </div>`;
        }
      }
    }
  } catch(e){ console.error(e); }
}
window.handleDeleteEval = async (id) => { if(!confirm("¿Eliminar evaluación?")) return; await deleteEvaluation(id); refreshEvaluations(); };

window.openTakeEvalModal = async (evalId) => {
  const ev = await getEvaluation(evalId);
  if (!ev) { alert("No se encontró"); return; }
  currentTakeEval = ev;
  currentTakeAnswers = {};
  document.getElementById("take-eval-title").textContent = ev.title;
  document.getElementById("take-eval-result").innerHTML = "";
  const body = document.getElementById("take-eval-body");
  body.innerHTML = ev.questions.map((q, idx) => `
    <div style="background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:10px;padding:0.85rem;margin-bottom:0.7rem" id="qcard_${q.id}">
      <div style="font-weight:600;margin-bottom:0.4rem;white-space:pre-wrap">${idx+1}. ${q.statement} <span style="font-size:0.7rem;color:var(--text-muted)">[${q.topic}]</span></div>
      ${q.statementImage ? `<img src="${q.statementImage}" style="max-width:100%;border-radius:8px;border:1px solid var(--border-color);margin-bottom:0.5rem">` : ``}
      ${q.type==="multiple_choice" ? `
        <div style="display:flex;flex-direction:column;gap:0.4rem">
          ${(q.options||[]).map(opt=>{
            const letter = opt.trim().charAt(0).toUpperCase();
            return `<label style="display:flex;gap:0.5rem;align-items:center;font-size:0.85rem;cursor:pointer;padding:0.35rem;border-radius:6px;border:1px solid transparent" id="opt_${q.id}_${letter}">
              <input type="radio" name="ans_${q.id}" value="${letter}" onchange="setTakeAnswer('${q.id}',this.value);checkImmediate('${q.id}','${letter}')"> ${opt}
            </label>`;
          }).join("")}
          ${(!q.options||q.options.length===0) ? `<input class="form-control" placeholder="Tu respuesta: A, B, C o D" oninput="setTakeAnswer('${q.id}',this.value)">` : ``}
        </div>
        <div id="feedback_${q.id}" style="margin-top:0.5rem;font-size:0.82rem;min-height:1.2rem"></div>
      ` : `
        <textarea class="form-control" rows="3" placeholder="Escribí tu respuesta..." oninput="setTakeAnswer('${q.id}',this.value)"></textarea>
        <div style="font-size:0.7rem;color:var(--text-muted);margin-top:0.3rem">Transcripción exacta del PDF — podés usar imagen del enunciado si prefierís (próximamente).</div>
      `}
    </div>
  `).join("");
  document.getElementById("take-eval-modal")?.classList.add("open");
};
window.closeTakeEvalModal = () => document.getElementById("take-eval-modal")?.classList.remove("open");
window.setTakeAnswer = (qid, val) => { currentTakeAnswers[qid]=val; };
window.checkImmediate = (qid, selected) => {
  const q = currentTakeEval?.questions.find(x=>x.id===qid);
  if (!q || !q.correctAnswer) return;
  const correct = q.correctAnswer.trim().toUpperCase();
  const isCorrect = selected.toUpperCase() === correct;
  const fb = document.getElementById(`feedback_${qid}`);
  if (fb) fb.innerHTML = isCorrect ? `<span style="color:var(--success);font-weight:700">✅ Correcto! (${correct})</span>` : `<span style="color:var(--danger);font-weight:700">❌ Incorrecto. Correcta: ${correct}</span>`;
  // pintar opción
  document.querySelectorAll(`[id^="opt_${qid}_"]`).forEach(el=>{
    el.style.borderColor="transparent"; el.style.background="transparent";
  });
  const selEl = document.getElementById(`opt_${qid}_${selected.toUpperCase()}`);
  if (selEl) {
    selEl.style.borderColor = isCorrect ? "var(--success)" : "var(--danger)";
    selEl.style.background = isCorrect ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)";
  }
};

window.handleSubmitEvaluation = async () => {
  if (!currentTakeEval) return;
  const answers = currentTakeEval.questions.map(q=>({questionId:q.id, answer: (currentTakeAnswers[q.id]||"").trim()}));
  const unanswered = answers.filter(a=>!a.answer).length;
  if (unanswered>0 && !confirm(`Te faltan ${unanswered} respuestas. ¿Enviar igual?`)) return;
  try {
    const result = await submitEvaluationAttempt(currentTakeEval, answers);
    const perTopicHtml = Object.entries(result.perTopic).map(([topic, s])=> {
      const pct = s.total? Math.round((s.correct/s.total)*100):0;
      const color = pct>=70?"var(--success)": pct>=40?"var(--warning)":"var(--danger)";
      return `<div style="display:flex;justify-content:space-between;font-size:0.82rem;padding:0.3rem 0"><span>${topic}</span><span style="color:${color};font-weight:700">${pct}% (${s.correct}/${s.total})</span></div>`;
    }).join("");
    document.getElementById("take-eval-result").innerHTML = `
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:1rem;margin-top:0.5rem">
        <h3 style="font-family:var(--font-heading);text-align:center;margin-bottom:0.5rem">Nota: ${result.score10}/10 — ${result.percentage}%</h3>
        <div style="text-align:center;font-size:0.8rem;color:var(--text-muted);margin-bottom:0.75rem">${result.correct}/${result.total} correctas${result.autoMsg}</div>
        <div style="border-top:1px solid var(--border-color);padding-top:0.5rem">${perTopicHtml || "<div style='font-size:0.8rem;color:var(--text-muted)'>Sin desglose por tema</div>"}</div>
      </div>
    `;
    refreshEvaluations();
  } catch(e){ alert("Error: "+e.message); console.error(e); }
};

// Init
authReady.then(()=> refreshEvaluations());
window.addEventListener("fiuba-auth-ready", refreshEvaluations);
window.refreshEvaluations = refreshEvaluations;
