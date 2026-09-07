// dashboard.js - Panel personal de progreso y estadísticas (sin IA, sin costo)
import { db, getUid, authReady } from "./firebase.js";
import { collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getEvaluations, getEvaluationAttempts } from "./evaluations.js";

let cachedData = null;

async function loadAllUserData() {
  const uid = getUid();
  if (!uid) return null;
  try {
    const [attempts, evaluations, evalAttempts] = await Promise.all([
      getDocs(query(collection(db, `users/${uid}/attempts`), orderBy("createdAt", "desc"), limit(200))).then(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      getEvaluations().catch(() => []),
      getEvaluationAttempts().catch(() => [])
    ]);
    return { attempts, evaluations, evalAttempts };
  } catch (e) {
    console.error("dashboard load error:", e);
    return null;
  }
}

function computeSubjectStats(data) {
  if (!data) return {};
  const subjects = {};
  const addSubject = (name) => {
    if (!subjects[name]) subjects[name] = { total: 0, correct: 0, evals: 0, evalScore: 0, evalCount: 0, topics: {} };
  };
  data.attempts.forEach(a => {
    const s = a.subject || "General";
    addSubject(s);
    subjects[s].total++;
    if (a.result === "correct") subjects[s].correct++;
    const t = a.topic || "General";
    if (!subjects[s].topics[t]) subjects[s].topics[t] = { total: 0, correct: 0 };
    subjects[s].topics[t].total++;
    if (a.result === "correct") subjects[s].topics[t].correct++;
  });
  data.evalAttempts.forEach(ea => {
    const s = ea.evaluationTitle || "Evaluación";
    addSubject(s);
    subjects[s].evals++;
    subjects[s].evalScore += ea.score10 || 0;
    subjects[s].evalCount++;
    if (ea.perTopic) {
      Object.entries(ea.perTopic).forEach(([topic, stats]) => {
        if (!subjects[s].topics[topic]) subjects[s].topics[topic] = { total: 0, correct: 0 };
        subjects[s].topics[topic].total += stats.total || 0;
        subjects[s].topics[topic].correct += stats.correct || 0;
      });
    }
  });
  return subjects;
}

function getWeakAreas(subjects) {
  const weak = [];
  Object.entries(subjects).forEach(([name, stats]) => {
    Object.entries(stats.topics).forEach(([topic, tStats]) => {
      if (tStats.total >= 2) {
        const pct = Math.round((tStats.correct / tStats.total) * 100);
        if (pct < 70) weak.push({ subject: name, topic, pct, total: tStats.total, correct: tStats.correct });
      }
    });
  });
  return weak.sort((a, b) => a.pct - b.pct).slice(0, 5);
}

function getRecentActivity(data) {
  const items = [];
  data.attempts.slice(0, 10).forEach(a => {
    const icon = a.result === "correct" ? "✅" : a.result === "incorrect" ? "❌" : "🟡";
    const date = a.createdAt?.toDate ? a.createdAt.toDate() : null;
    items.push({ icon, text: `${a.subject} / ${a.topic}`, date, type: "attempt" });
  });
  data.evalAttempts.slice(0, 5).forEach(ea => {
    const date = ea.createdAt?.toDate ? ea.createdAt.toDate() : null;
    items.push({ icon: "📝", text: `${ea.evaluationTitle} — ${ea.score10}/10`, date, type: "eval" });
  });
  items.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
  return items.slice(0, 10);
}

function computeOverallStats(data) {
  const totalAttempts = data.attempts.length;
  const correctAttempts = data.attempts.filter(a => a.result === "correct").length;
  const totalEvals = data.evalAttempts.length;
  const avgScore = totalEvals > 0 ? Math.round(data.evalAttempts.reduce((s, e) => s + (e.score10 || 0), 0) / totalEvals * 10) / 10 : 0;
  const bestScore = totalEvals > 0 ? Math.max(...data.evalAttempts.map(e => e.score10 || 0)) : 0;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  return { totalAttempts, correctAttempts, totalEvals, avgScore, bestScore, accuracy };
}

function renderDashboard(data) {
  const container = document.getElementById("dashboard-stats");
  if (!container) return;

  if (!data || (data.attempts.length === 0 && data.evalAttempts.length === 0)) {
    container.innerHTML = `
      <div style="text-align:center;padding:2.5rem 1.5rem;background:var(--bg-card);border:1px dashed var(--border-color);border-radius:14px;margin-bottom:1.5rem">
        <div style="font-size:2.2rem;margin-bottom:0.6rem">📊</div>
        <h3 style="font-size:1rem;color:var(--text-primary);margin-bottom:0.4rem">Tu dashboard está vacío</h3>
        <p style="font-size:0.82rem;color:var(--text-muted);max-width:400px;margin:0 auto;line-height:1.5">
          Cuando completes tus primeras evaluaciones o registres intentos de estudio, vas a empezar a ver tu progreso acá.
        </p>
        <div style="margin-top:1rem;display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap">
          <button onclick="window.switchView('evaluaciones')" style="background:var(--primary);color:white;border:none;border-radius:8px;padding:0.5rem 1rem;font-size:0.8rem;cursor:pointer;font-weight:600">📝 Crear evaluación</button>
          <button onclick="window.openAttemptModal && window.openAttemptModal()" style="background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem 1rem;font-size:0.8rem;cursor:pointer">📊 Registrar intento</button>
        </div>
      </div>`;
    return;
  }

  const stats = computeOverallStats(data);
  const subjects = computeSubjectStats(data);
  const weak = getWeakAreas(data);
  const activity = getRecentActivity(data);
  const subjectEntries = Object.entries(subjects).sort((a, b) => (b[1].evalCount + b[1].total) - (a[1].evalCount + a[1].total)).slice(0, 6);

  let html = '';

  html += `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:0.7rem;margin-bottom:1.2rem">
    <div class="gam-card" style="padding:1rem;text-align:center">
      <div style="font-size:1.5rem;font-weight:700;color:var(--accent-cyan)">${stats.totalAttempts}</div>
      <div style="font-size:0.75rem;color:var(--text-muted)">Intentos</div>
    </div>
    <div class="gam-card" style="padding:1rem;text-align:center">
      <div style="font-size:1.5rem;font-weight:700;color:#22c55e">${stats.accuracy}%</div>
      <div style="font-size:0.75rem;color:var(--text-muted)">Precisión</div>
    </div>
    <div class="gam-card" style="padding:1rem;text-align:center">
      <div style="font-size:1.5rem;font-weight:700;color:#f59e0b">${stats.avgScore || '—'}</div>
      <div style="font-size:0.75rem;color:var(--text-muted)">Promedio</div>
    </div>
    <div class="gam-card" style="padding:1rem;text-align:center">
      <div style="font-size:1.5rem;font-weight:700;color:#8b5cf6">${stats.bestScore || '—'}</div>
      <div style="font-size:0.75rem;color:var(--text-muted)">Mejor nota</div>
    </div>
  </div>`;

  if (subjectEntries.length > 0) {
    html += `<div class="gam-card" style="padding:1rem;margin-bottom:1rem">
      <h4 style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.7rem">Progreso por materia</h4>
      <div style="display:flex;flex-direction:column;gap:0.6rem">`;
    subjectEntries.forEach(([name, stats]) => {
      const total = stats.total + stats.correct;
      const pct = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
      const avg = stats.evalCount > 0 ? (stats.evalScore / stats.evalCount).toFixed(1) : null;
      const color = pct >= 70 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444';
      html += `<div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem">
          <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary)">${name}</span>
          <span style="font-size:0.72rem;color:var(--text-muted)">${avg ? `Prom: ${avg}/10` : `${stats.total} intentos`}</span>
        </div>
        <div style="height:6px;background:var(--bg-secondary);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.6s ease"></div>
        </div>
      </div>`;
    });
    html += `</div></div>`;
  }

  if (weak.length > 0) {
    html += `<div class="gam-card" style="padding:1rem;margin-bottom:1rem;border-left:3px solid #f59e0b">
      <h4 style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.6rem">⚠️ Tus puntos a reforzar</h4>
      <div style="display:flex;flex-direction:column;gap:0.4rem">`;
    weak.forEach(w => {
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.4rem 0.6rem;background:var(--bg-secondary);border-radius:6px">
        <span style="font-size:0.8rem"><strong>${w.topic}</strong> <span style="color:var(--text-muted)">— ${w.subject}</span></span>
        <span style="font-size:0.75rem;color:${w.pct < 50 ? '#ef4444' : '#f59e0b'};font-weight:600">${w.pct}%</span>
      </div>`;
    });
    html += `</div></div>`;
  }

  if (activity.length > 0) {
    html += `<div class="gam-card" style="padding:1rem;margin-bottom:1rem">
      <h4 style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.6rem">Actividad reciente</h4>
      <div style="display:flex;flex-direction:column;gap:0.3rem">`;
    activity.forEach(item => {
      const dateStr = item.date ? item.date.toLocaleDateString("es-AR", { day: "numeric", month: "short" }) : "";
      html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:0.3rem 0;font-size:0.8rem">
        <span>${item.icon} ${item.text}</span>
        <span style="color:var(--text-muted);font-size:0.7rem">${dateStr}</span>
      </div>`;
    });
    html += `</div></div>`;
  }

  if (window.ExerciseBank) {
    const subjects = window.ExerciseBank.getSubjects();
    html += `<div class="gam-card" style="padding:1rem;margin-bottom:1rem">
      <h4 style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.6rem">📚 Práctica rápida (sin IA)</h4>
      <div style="display:flex;flex-wrap:wrap;gap:0.5rem">`;
    subjects.forEach(s => {
      const count = window.ExerciseBank.EXERCISE_BANK[s]?.length || 0;
      html += `<button onclick="window.startPractice('${s}')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem 0.8rem;font-size:0.78rem;cursor:pointer;color:var(--text-primary);text-align:left">
        <div style="font-weight:600">${s}</div>
        <div style="font-size:0.68rem;color:var(--text-muted)">${count} ejercicios</div>
      </button>`;
    });
    html += `</div></div>`;
  }

  container.innerHTML = html;
}

async function refreshDashboard() {
  const data = await loadAllUserData();
  cachedData = data;
  renderDashboard(data);
  if (window.refreshAnalytics) window.refreshAnalytics();
}

window.startPractice = async function(subject) {
  if (!window.ExerciseBank) return;
  const quiz = window.ExerciseBank.generatePracticeQuiz(subject, { count: 5 });
  if (!quiz) { alert("No hay ejercicios disponibles para esta materia"); return; }
  try {
    const evalId = await window.evaluationsAPI.createEvaluation(quiz);
    alert("Evaluación creada: " + quiz.title + "\n\nAndá a la pestaña Evaluaciones para resolverla.");
    if (window.switchView) window.switchView("evaluaciones");
    if (window.refreshEvaluations) window.refreshEvaluations();
  } catch (e) {
    alert("Error: " + e.message);
  }
};

window.refreshExerciseBank = function() {
  const grid = document.getElementById("exercise-bank-grid");
  if (!grid || !window.ExerciseBank) return;
  const subjects = window.ExerciseBank.getSubjects();
  let html = '';
  subjects.forEach(s => {
    const exercises = window.ExerciseBank.EXERCISE_BANK[s] || [];
    const count = exercises.length;
    const topics = [...new Set(exercises.map(e => e.topic))];
    html += `<button onclick="window.startPractice('${s}')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;text-align:left;cursor:pointer;transition:all 0.15s;font-family:inherit" onmouseover="this.style.borderColor='var(--primary)';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border-color)';this.style.transform='none'">
      <div style="font-size:0.85rem;font-weight:700;color:var(--text-primary);margin-bottom:0.2rem">${s}</div>
      <div style="font-size:0.68rem;color:var(--text-muted)">${count} ejercicios · ${topics.length} temas</div>
      <div style="display:flex;gap:0.25rem;margin-top:0.35rem;flex-wrap:wrap">
        ${topics.slice(0,3).map(t => `<span style="font-size:0.58rem;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:4px;padding:0.1rem 0.3rem;color:var(--text-muted)">${t}</span>`).join('')}
        ${topics.length > 3 ? `<span style="font-size:0.58rem;color:var(--text-muted)">+${topics.length - 3}</span>` : ''}
      </div>
    </button>`;
  });
  grid.innerHTML = html;
};

window.refreshDashboard = refreshDashboard;
window.addEventListener("fiuba-auth-ready", () => setTimeout(refreshDashboard, 800));
