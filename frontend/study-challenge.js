// study-challenge.js - Desafío de Estudio: quiz relámpago gamificado (sin IA)
const CHALLENGE_KEY = 'fiuba_study_challenge';

function loadChallengeState() {
  try { return JSON.parse(localStorage.getItem(CHALLENGE_KEY)) || { bestScores: {}, totalCorrect: 0, totalAnswered: 0, streak: 0, bestStreak: 0, history: [] }; }
  catch { return { bestScores: {}, totalCorrect: 0, totalAnswered: 0, streak: 0, bestStreak: 0, history: [] }; }
}

function saveChallengeState(s) { localStorage.setItem(CHALLENGE_KEY, JSON.stringify(s)); }

let challengeActive = false;
let challengeQuestions = [];
let challengeIdx = 0;
let challengeScore = 0;
let challengeStartTime = 0;
let challengeSubject = '';

function startChallenge(subject) {
  if (!window.ExerciseBank) return;
  const all = window.ExerciseBank.EXERCISE_BANK[subject] || [];
  if (all.length === 0) { alert('No hay ejercicios para esta materia'); return; }

  challengeSubject = subject;
  challengeQuestions = [...all].sort(() => Math.random() - 0.5).slice(0, 10);
  challengeIdx = 0;
  challengeScore = 0;
  challengeStartTime = Date.now();
  challengeActive = true;
  renderChallengeQuestion();
}

function renderChallengeQuestion() {
  const container = document.getElementById('challenge-content');
  if (!container || !challengeActive) return;

  if (challengeIdx >= challengeQuestions.length) {
    finishChallenge();
    return;
  }

  const q = challengeQuestions[challengeIdx];
  const elapsed = Math.round((Date.now() - challengeStartTime) / 1000);
  const progress = ((challengeIdx) / challengeQuestions.length) * 100;

  let html = `
    <div class="ch-header">
      <div class="ch-progress-bar"><div class="ch-progress-fill" style="width:${progress}%"></div></div>
      <div class="ch-stats-row">
        <span class="ch-stat">${challengeIdx + 1} / ${challengeQuestions.length}</span>
        <span class="ch-stat ch-score">${challengeScore} pts</span>
        <span class="ch-stat ch-timer">${elapsed}s</span>
      </div>
    </div>

    <div class="ch-question-card">
      <div class="ch-topic-badge">${q.topic}</div>
      <div class="ch-diff-badge ch-diff-${q.difficulty}">${q.difficulty}</div>
      <p class="ch-statement">${q.statement}</p>
    </div>`;

  if (q.type === 'multiple_choice') {
    html += `<div class="ch-options">`;
    q.options.forEach((opt, i) => {
      const letter = opt.charAt(0);
      html += `<button class="ch-option" onclick="window.answerChallenge('${letter}')">${opt}</button>`;
    });
    html += `</div>`;
  } else {
    html += `
      <div class="ch-open-answer">
        <input id="ch-answer-input" class="ch-input" placeholder="Tu respuesta..." onkeydown="if(event.key==='Enter')window.answerChallengeOpen()">
        <button onclick="window.answerChallengeOpen()" class="ch-btn-answer">Responder</button>
      </div>`;
  }

  html += `<button onclick="window.skipChallenge()" class="ch-skip">Saltar →</button>`;
  container.innerHTML = html;

  const input = document.getElementById('ch-answer-input');
  if (input) setTimeout(() => input.focus(), 100);
}

function finishChallenge() {
  challengeActive = false;
  const elapsed = Math.round((Date.now() - challengeStartTime) / 1000);
  const pct = Math.round((challengeScore / challengeQuestions.length) * 100);

  const state = loadChallengeState();
  state.totalCorrect += challengeScore;
  state.totalAnswered += challengeQuestions.length;
  if (!state.bestScores[challengeSubject] || challengeScore > state.bestScores[challengeSubject]) {
    state.bestScores[challengeSubject] = challengeScore;
  }
  state.history.unshift({ subject: challengeSubject, score: challengeScore, total: challengeQuestions.length, time: elapsed, date: new Date().toISOString() });
  state.history = state.history.slice(0, 20);
  saveChallengeState(state);

  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '💪' : pct >= 40 ? '📚' : '🔄';
  const msg = pct >= 80 ? '¡Excelente!' : pct >= 60 ? '¡Bien!' : pct >= 40 ? 'Seguí practicando' : 'No te rindás';

  const container = document.getElementById('challenge-content');
  if (!container) return;

  container.innerHTML = `
    <div class="ch-result">
      <div class="ch-result-emoji">${emoji}</div>
      <h3 class="ch-result-title">${msg}</h3>
      <div class="ch-result-score">${challengeScore}/${challengeQuestions.length}</div>
      <p class="ch-result-pct">${pct}% de aciertos</p>
      <div class="ch-result-details">
        <span>Tiempo: ${elapsed}s</span>
        <span>Promedio: ${(elapsed / challengeQuestions.length).toFixed(1)}s/pregunta</span>
      </div>
      <div class="ch-result-actions">
        <button onclick="window.startChallenge('${challengeSubject}')" class="ch-btn-retry">🔄 Intentar de nuevo</button>
        <button onclick="window.showChallengeStats()" class="ch-btn-stats">📊 Ver estadísticas</button>
      </div>
    </div>`;
}

window.answerChallenge = function(answer) {
  if (!challengeActive) return;
  const q = challengeQuestions[challengeIdx];
  const correct = answer.toUpperCase() === q.correctAnswer.toUpperCase();
  if (correct) challengeScore++;
  challengeIdx++;
  renderChallengeQuestion();
};

window.answerChallengeOpen = function() {
  if (!challengeActive) return;
  const input = document.getElementById('ch-answer-input');
  const answer = input?.value.trim();
  if (!answer) return;
  const q = challengeQuestions[challengeIdx];
  const correct = answer.toLowerCase().includes(q.correctAnswer.toLowerCase().slice(0, 5));
  if (correct) challengeScore++;
  challengeIdx++;
  renderChallengeQuestion();
};

window.skipChallenge = function() {
  if (!challengeActive) return;
  challengeIdx++;
  renderChallengeQuestion();
};

window.showChallengeStats = function() {
  const state = loadChallengeState();
  const container = document.getElementById('challenge-content');
  if (!container) return;

  const globalPct = state.totalAnswered > 0 ? Math.round((state.totalCorrect / state.totalAnswered) * 100) : 0;

  let html = `
    <div class="ch-stats-page">
      <h3 class="ch-stats-title">📊 Estadísticas del Desafío</h3>
      <div class="ch-stats-grid">
        <div class="ch-stat-card">
          <div class="ch-stat-val">${state.totalCorrect}</div>
          <div class="ch-stat-lbl">Correctas</div>
        </div>
        <div class="ch-stat-card">
          <div class="ch-stat-val">${state.totalAnswered}</div>
          <div class="ch-stat-lbl">Total</div>
        </div>
        <div class="ch-stat-card">
          <div class="ch-stat-val">${globalPct}%</div>
          <div class="ch-stat-lbl">Precisión</div>
        </div>
      </div>
      <div class="ch-best-scores">
        <h4>Mejores puntajes por materia</h4>
        ${Object.entries(state.bestScores).map(([s, score]) => `<div class="ch-best-item"><span>${s}</span><span class="ch-best-score">${score}</span></div>`).join('')}
      </div>
      <div class="ch-history">
        <h4>Historial reciente</h4>
        ${state.history.slice(0, 8).map(h => {
          const d = new Date(h.date);
          return `<div class="ch-history-item">
            <span>${h.subject}</span>
            <span>${h.score}/${h.total}</span>
            <span>${h.time}s</span>
            <span style="opacity:0.5">${d.toLocaleDateString('es-AR',{day:'numeric',month:'short'})}</span>
          </div>`;
        }).join('')}
      </div>
      <button onclick="window.renderStudyChallenge()" class="ch-btn-back">← Volver</button>
    </div>`;
  container.innerHTML = html;
};

window.renderStudyChallenge = function() {
  const container = document.getElementById('challenge-content');
  if (!container) return;

  if (!window.ExerciseBank) {
    container.innerHTML = `<p>Cargando banco de ejercicios...</p>`;
    return;
  }

  const subjects = window.ExerciseBank.getSubjects();
  let html = `
    <div class="ch-home">
      <div class="ch-home-header">
        <div class="ch-home-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <h2 class="ch-home-title">Desafío de Estudio</h2>
        <p class="ch-home-sub">10 preguntas relámpago · Cronómetro · Sin IA</p>
      </div>
      <div class="ch-subjects-grid">
        ${subjects.map(s => {
          const count = window.ExerciseBank.EXERCISE_BANK[s]?.length || 0;
          return `<button class="ch-subject-btn" onclick="window.startChallenge('${s}')">
            <span class="ch-subject-name">${s}</span>
            <span class="ch-subject-count">${count} ejercicios</span>
          </button>`;
        }).join('')}
      </div>
      <button onclick="window.showChallengeStats()" class="ch-view-stats">📊 Ver mis estadísticas</button>
    </div>`;
  container.innerHTML = html;
};

window.startChallenge = startChallenge;
