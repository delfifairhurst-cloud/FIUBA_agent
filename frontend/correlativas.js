// correlativas.js - Mapa de correlativas FIUBA (todas las ingenierías, sin IA)
// Datos reales extraídos de FIUBA-Map (fede.dm/FIUBA-Map)

const CORR_STORAGE_KEY = 'fiuba_correlativas_v2';

function loadCorrState() {
  try { return JSON.parse(localStorage.getItem(CORR_STORAGE_KEY)) || { career: 'informatica-2020', approved: [] }; }
  catch { return { career: 'informatica-2020', approved: [] }; }
}

function saveCorrState(state) {
  localStorage.setItem(CORR_STORAGE_KEY, JSON.stringify(state));
}

function canTakeSubject(subject, approved) {
  if (subject.prereqs.length === 0) return true;
  return subject.prereqs.every(p => approved.includes(p));
}

function getCareerSubjects(careerKey) {
  return window.CARRERAS_DATA?.[careerKey]?.subjects || [];
}

function getCareerName(careerKey) {
  return window.CARRERAS_DATA?.[careerKey]?.name || careerKey;
}

function cuatrimestreLabel(level) {
  if (level === -2) return '1° Cuatrimestre (CBC)';
  if (level === -1) return '2° Cuatrimestre (CBC)';
  if (level === 0) return 'CBC Completo';
  if (level >= 1) return `${level}° Cuatrimestre`;
  return `Nivel ${level}`;
}

function yearOf(level) {
  if (level <= 0) return 0;
  return Math.ceil(level / 2);
}

function semOf(level) {
  if (level <= 0) return 0;
  return level % 2 === 1 ? 1 : 2;
}

function renderCorrelativas() {
  const container = document.getElementById('correlativas-view-content');
  if (!container) return;

  const state = loadCorrState();
  const careerData = window.CARRERAS_DATA?.[state.career];
  if (!careerData) {
    container.innerHTML = '<p>Cargando datos de carreras...</p>';
    return;
  }

  const allSubjects = careerData.subjects;
  const obligatory = allSubjects.filter(s => s.category === 'obligatoria' || s.category === 'cbc');
  const electives = allSubjects.filter(s => s.category === 'electiva');

  const totalObligatory = obligatory.filter(s => s.id !== 'CBC').length;
  const approvedCount = state.approved.length;

  // Group obligatory by level (cuatrimestre)
  const groups = {};
  obligatory.forEach(s => {
    const lvl = s.level;
    if (!groups[lvl]) groups[lvl] = [];
    groups[lvl].push(s);
  });
  const sortedLevels = Object.keys(groups).map(Number).sort((a, b) => a - b);

  // Group by year for visual separation
  let currentYear = 0;

  let html = `
    <div class="corr-header">
      <h2 class="corr-title">Correlativas</h2>
      <select class="corr-select" onchange="window.setCareer(this.value)">
        ${Object.entries(window.CARRERAS_DATA).map(([k, v]) => `<option value="${k}" ${k === state.career ? 'selected' : ''}>${v.name}</option>`).join('')}
      </select>
    </div>
    <div class="corr-progress-bar">
      <div class="corr-progress-text">
        <span>Aprobadas: ${approvedCount} / ${totalObligatory + electives.length}</span>
        <span>${totalObligatory > 0 ? Math.round((approvedCount / (totalObligatory + electives.length)) * 100) : 0}%</span>
      </div>
      <div class="corr-progress-track">
        <div class="corr-progress-fill" style="width:${totalObligatory > 0 ? (approvedCount / (totalObligatory + electives.length)) * 100 : 0}%"></div>
      </div>
    </div>`;

  sortedLevels.forEach(level => {
    const levelSubjects = groups[level];
    const yr = yearOf(level);
    const sm = semOf(level);

    // Year header
    if (yr > currentYear && yr > 0) {
      currentYear = yr;
      html += `<div class="corr-year-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 6 3 12 0v-5"/></svg>
        ${yr}° Año
      </div>`;
    }

    html += `<div class="corr-year">
      <div class="corr-year-label">${cuatrimestreLabel(level)}</div>
      <div class="corr-subjects-grid">`;

    levelSubjects.forEach(sub => {
      const approved = state.approved.includes(sub.id);
      const available = canTakeSubject(sub, state.approved);
      const status = approved ? 'approved' : available ? 'available' : 'locked';

      const prereqNames = sub.prereqs.map(p => {
        const prereqSub = allSubjects.find(s => s.id === p);
        return prereqSub ? prereqSub.name : p;
      });

      html += `<div class="corr-subject corr-${status}" onclick="window.toggleSubjectCorr('${sub.id}')" title="${approved ? 'Desmarcar' : available ? 'Marcar como aprobada' : 'Correlativas pendientes'}">
        <div class="corr-subject-header">
          <div class="corr-subject-status">
            ${approved ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' :
              available ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>' :
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'}
          </div>
          <div class="corr-subject-info">
            <div class="corr-subject-name">${sub.name}</div>
            ${sub.credits ? `<div class="corr-subject-credits">${sub.credits} créditos</div>` : ''}
          </div>
        </div>
        ${prereqNames.length > 0 ? `<div class="corr-prereqs">Requiere: ${prereqNames.join(', ')}</div>` : ''}
      </div>`;
    });

    html += `</div></div>`;
  });

  // Electives section
  if (electives.length > 0) {
    const approvedElectives = electives.filter(s => state.approved.includes(s.id)).length;
    html += `<div class="corr-year-header" style="color:var(--text-muted)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      Electivas ${approvedElectives > 0 ? `(${approvedElectives} elegidas)` : ''}
    </div>`;
    html += `<div class="corr-year">
      <div class="corr-year-label">Materias electivas</div>
      <div class="corr-subjects-grid">`;

    electives.forEach(sub => {
      const approved = state.approved.includes(sub.id);
      const available = canTakeSubject(sub, state.approved);
      const status = approved ? 'approved' : available ? 'available' : 'locked';

      const prereqNames = sub.prereqs.map(p => {
        const prereqSub = allSubjects.find(s => s.id === p);
        return prereqSub ? prereqSub.name : p;
      });

      html += `<div class="corr-subject corr-${status} corr-elective" onclick="window.toggleSubjectCorr('${sub.id}')" title="${approved ? 'Desmarcar' : available ? 'Elegir materia' : 'Correlativas pendientes'}">
        <div class="corr-subject-header">
          <div class="corr-subject-status">
            ${approved ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' :
              available ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>' :
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'}
          </div>
          <div class="corr-subject-info">
            <div class="corr-subject-name">${sub.name}</div>
            ${sub.credits ? `<div class="corr-subject-credits">${sub.credits} créditos</div>` : ''}
          </div>
        </div>
        ${prereqNames.length > 0 ? `<div class="corr-prereqs">Requiere: ${prereqNames.join(', ')}</div>` : ''}
      </div>`;
    });

    html += `</div></div>`;
  }

  html += `<div style="text-align:center;margin-top:1.5rem"><button onclick="window.clearCorrelativas()" class="corr-btn-clear">Reiniciar progreso</button></div>`;

  container.innerHTML = html;
}

window.setCareer = function(careerKey) {
  const state = loadCorrState();
  state.career = careerKey;
  state.approved = [];
  saveCorrState(state);
  renderCorrelativas();
};

window.toggleSubjectCorr = function(subjectId) {
  const state = loadCorrState();
  const idx = state.approved.indexOf(subjectId);
  if (idx >= 0) {
    state.approved.splice(idx, 1);
  } else {
    const subjects = getCareerSubjects(state.career);
    const sub = subjects.find(s => s.id === subjectId);
    if (sub && canTakeSubject(sub, state.approved)) {
      state.approved.push(subjectId);
    }
  }
  saveCorrState(state);
  renderCorrelativas();
};

window.clearCorrelativas = function() {
  if (!confirm('¿Reiniciar progreso de correlativas?')) return;
  const state = loadCorrState();
  state.approved = [];
  saveCorrState(state);
  renderCorrelativas();
};

window.renderCorrelativas = renderCorrelativas;
