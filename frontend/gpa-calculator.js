// gpa-calculator.js - Calculadora de promedio general (localStorage, sin IA)
// Calcula promedio ponderado por carga horaria

const GPA_STORAGE_KEY = 'fiuba_gpa_data';

function loadGPAData() {
  try { return JSON.parse(localStorage.getItem(GPA_STORAGE_KEY)) || { subjects: [] }; }
  catch { return { subjects: [] }; }
}

function saveGPAData(data) {
  localStorage.setItem(GPA_STORAGE_KEY, JSON.stringify(data));
}

function addGPASubject(name, note, credits) {
  const data = loadGPAData();
  data.subjects.push({ id: Date.now(), name: name.trim(), note: parseFloat(note), credits: parseInt(credits) || 4, date: new Date().toISOString() });
  saveGPAData(data);
}

function removeGPASubject(id) {
  const data = loadGPAData();
  data.subjects = data.subjects.filter(s => s.id !== id);
  saveGPAData(data);
}

function calculateGPA(subjects) {
  if (!subjects.length) return { weighted: 0, simple: 0, totalCredits: 0, count: 0, byCareer: {} };
  const totalCredits = subjects.reduce((s, sub) => s + sub.credits, 0);
  const weightedSum = subjects.reduce((s, sub) => s + sub.note * sub.credits, 0);
  const simpleSum = subjects.reduce((s, sub) => s + sub.note, 0);
  return {
    weighted: totalCredits > 0 ? (weightedSum / totalCredits) : 0,
    simple: simpleSum / subjects.length,
    totalCredits,
    count: subjects.length
  };
}

function renderGPACalculator() {
  const container = document.getElementById('gpa-view-content');
  if (!container) return;
  const data = loadGPAData();
  const stats = calculateGPA(data.subjects);

  let html = `
    <div class="gpa-header">
      <div class="gpa-hero">
        <div class="gpa-hero-number">${stats.weighted > 0 ? stats.weighted.toFixed(2) : '—'}</div>
        <div class="gpa-hero-label">Promedio general</div>
        <div class="gpa-hero-sub">${stats.count} materias · ${stats.totalCredits} créditos totales</div>
      </div>
      <div class="gpa-mini-stats">
        <div class="gpa-mini-stat">
          <span class="gpa-mini-val">${stats.simple > 0 ? stats.simple.toFixed(2) : '—'}</span>
          <span class="gpa-mini-lbl">Promedio simple</span>
        </div>
        <div class="gpa-mini-stat">
          <span class="gpa-mini-val" style="color:${stats.weighted >= 7 ? '#22c55e' : stats.weighted >= 4 ? '#f59e0b' : '#ef4444'}">${stats.weighted >= 7 ? 'Regular' : stats.weighted >= 4 ? 'En riesgo' : 'Bajo'}</span>
          <span class="gpa-mini-lbl">Situación</span>
        </div>
        <div class="gpa-mini-stat">
          <span class="gpa-mini-val">${data.subjects.filter(s => s.note >= 4).length}/${stats.count}</span>
          <span class="gpa-mini-lbl">Aprobadas</span>
        </div>
      </div>
    </div>

    <div class="gpa-add-card">
      <h4 class="gpa-card-title">Agregar materia</h4>
      <div class="gpa-form-row">
        <input id="gpa-name" class="gpa-input" placeholder="Nombre de la materia" style="flex:2">
        <input id="gpa-note" class="gpa-input" type="number" min="0" max="10" step="0.5" placeholder="Nota" style="flex:0.6">
        <input id="gpa-credits" class="gpa-input" type="number" min="1" max="20" value="4" placeholder="Créditos" style="flex:0.6">
        <button onclick="window.handleAddGPA()" class="gpa-btn-add">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>

    <div class="gpa-table-wrapper">`;

  if (data.subjects.length === 0) {
    html += `
      <div class="gpa-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 6 3 12 0v-5"/></svg>
        <p>Agregá materias para calcular tu promedio</p>
      </div>`;
  } else {
    html += `
      <table class="gpa-table">
        <thead><tr><th>Materia</th><th>Nota</th><th>Créditos</th><th>Ponderado</th><th></th></tr></thead>
        <tbody>`;
    data.subjects.forEach(s => {
      const color = s.note >= 7 ? '#22c55e' : s.note >= 4 ? '#f59e0b' : '#ef4444';
      html += `<tr>
        <td class="gpa-td-name">${s.name}</td>
        <td><span class="gpa-note-badge" style="background:${color}18;color:${color}">${s.note}</span></td>
        <td class="gpa-td-credits">${s.credits}</td>
        <td class="gpa-td-weighted">${(s.note * s.credits).toFixed(1)}</td>
        <td><button class="gpa-delete-btn" onclick="window.handleRemoveGPA(${s.id})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button></td>
      </tr>`;
    });
    html += `</tbody></table>

    <div class="gpa-bar-section">
      <div class="gpa-bar-label">
        <span>Progreso hacia Regular (≥7)</span>
        <span>${Math.min(100, Math.round((stats.weighted / 7) * 100))}%</span>
      </div>
      <div class="gpa-bar-track">
        <div class="gpa-bar-fill" style="width:${Math.min(100, (stats.weighted / 10) * 100)}%;background:linear-gradient(90deg,#ef4444,#f59e0b 40%,#22c55e)"></div>
        <div class="gpa-bar-marker" style="left:70%"><span>7</span></div>
      </div>
    </div>

    <div style="text-align:center;margin-top:1rem">
      <button onclick="window.handleClearGPA()" class="gpa-btn-clear">Borrar todo</button>
    </div>`;
  }

  html += `</div>`;
  container.innerHTML = html;
}

window.handleAddGPA = function() {
  const name = document.getElementById('gpa-name')?.value.trim();
  const note = document.getElementById('gpa-note')?.value;
  const credits = document.getElementById('gpa-credits')?.value;
  if (!name || note === '' || note === undefined) {
    const btn = document.querySelector('.gpa-btn-add');
    if (btn) { btn.classList.add('gpa-shake'); setTimeout(() => btn.classList.remove('gpa-shake'), 500); }
    return;
  }
  if (parseFloat(note) < 0 || parseFloat(note) > 10) { alert('La nota debe ser entre 0 y 10'); return; }
  addGPASubject(name, note, credits);
  document.getElementById('gpa-name').value = '';
  document.getElementById('gpa-note').value = '';
  renderGPACalculator();
};

window.handleRemoveGPA = function(id) {
  removeGPASubject(id);
  renderGPACalculator();
};

window.handleClearGPA = function() {
  if (!confirm('¿Borrar todas las materias?')) return;
  saveGPAData({ subjects: [] });
  renderGPACalculator();
};

window.renderGPACalculator = renderGPACalculator;
