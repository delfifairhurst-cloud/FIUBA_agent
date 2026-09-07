// gpa-calculator.js - Calculadora de promedio por materia y general (localStorage)
const GPA_STORAGE_KEY = 'fiuba_gpa_data';

function loadGPAData() {
  try { return JSON.parse(localStorage.getItem(GPA_STORAGE_KEY)) || { subjects: [] }; }
  catch { return { subjects: [] }; }
}
function saveGPAData(data) { localStorage.setItem(GPA_STORAGE_KEY, JSON.stringify(data)); }

function gpaCalcSubjectAvg(subject) {
  if (!subject.evaluations || subject.evaluations.length === 0) return null;
  const totalWeight = subject.evaluations.reduce((s, e) => s + (e.weight || 1), 0);
  if (totalWeight === 0) return null;
  const weightedSum = subject.evaluations.reduce((s, e) => s + e.note * (e.weight || 1), 0);
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

function gpaCalcOverall(subjects) {
  const withAvg = subjects.filter(s => s.avg !== null);
  if (withAvg.length === 0) return { weighted: 0, simple: 0, count: 0, passed: 0 };
  const totalWeight = withAvg.reduce((s, sub) => s + (sub.credits || 4), 0);
  const weightedSum = withAvg.reduce((s, sub) => s + sub.avg * (sub.credits || 4), 0);
  const simpleSum = withAvg.reduce((s, sub) => s + sub.avg, 0);
  return {
    weighted: totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0,
    simple: Math.round((simpleSum / withAvg.length) * 100) / 100,
    count: withAvg.length,
    passed: withAvg.filter(s => s.avg >= 4).length,
  };
}

function gpaGetNoteColor(n) { return n >= 7 ? '#22c55e' : n >= 4 ? '#f59e0b' : '#ef4444'; }
function gpaGetNoteLabel(n) { return n >= 9 ? 'Excelente' : n >= 7 ? 'Aprobado' : n >= 4 ? 'Aprobado con catchError' : 'Desaprobado'; }

function renderGPACalculator() {
  const container = document.getElementById('gpa-view-content');
  if (!container) return;
  const data = loadGPAData();

  // Calculate per-subject averages
  data.subjects.forEach(s => { s.avg = gpaCalcSubjectAvg(s); });
  const stats = gpaCalcOverall(data.subjects);

  let html = `
    <div style="text-align:center;margin-bottom:1rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin-bottom:0.2rem;display:flex;align-items:center;justify-content:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 6 3 12 0v-5"/></svg>
        Calculadora de Promedio
      </h2>
      <p style="color:var(--text-muted);font-size:0.75rem">Agregá materias y cargá evaluaciones una por una</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:0.5rem;margin-bottom:1rem">
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.8rem;text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:${stats.weighted >= 7 ? '#22c55e' : stats.weighted >= 4 ? '#f59e0b' : '#ef4444'}">${stats.weighted > 0 ? stats.weighted.toFixed(2) : '—'}</div>
        <div style="font-size:0.7rem;color:var(--text-muted)">Promedio general</div>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.8rem;text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:var(--text-primary)">${stats.count}</div>
        <div style="font-size:0.7rem;color:var(--text-muted)">Materias</div>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.8rem;text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:#22c55e">${stats.passed}/${stats.count}</div>
        <div style="font-size:0.7rem;color:var(--text-muted)">Aprobadas</div>
      </div>
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.8rem;text-align:center">
        <div style="font-size:1.6rem;font-weight:800;color:${stats.weighted >= 7 ? '#22c55e' : '#f59e0b'}">${stats.weighted >= 7 ? 'Regular' : stats.weighted >= 4 ? 'En riesgo' : 'Bajo'}</div>
        <div style="font-size:0.7rem;color:var(--text-muted)">Situación</div>
      </div>
    </div>

    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:1rem;margin-bottom:1rem">
      <h4 style="font-size:0.85rem;color:var(--text-primary);margin:0 0 0.6rem 0">Agregar materia</h4>
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
        <input id="gpa-subj-name" class="gpa-input" placeholder="Materia (ej: Análisis I)" style="flex:2;min-width:120px">
        <input id="gpa-subj-credits" class="gpa-input" type="number" min="1" max="20" value="4" placeholder="Créditos" style="flex:0.5;min-width:60px">
        <button onclick="window.gpaAddSubject()" style="background:linear-gradient(135deg,#3b82f6,#6366f1);color:white;border:none;border-radius:8px;padding:0.5rem 1rem;cursor:pointer;font-weight:600;font-size:0.8rem;display:flex;align-items:center;gap:0.3rem">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Materia
        </button>
      </div>
    </div>`;

  if (data.subjects.length === 0) {
    html += `<div style="text-align:center;padding:2rem;color:var(--text-muted)">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:0.5rem;opacity:0.3"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 6 3 12 0v-5"/></svg>
      <p style="font-size:0.85rem">Agregá materias para empezar</p>
    </div>`;
  } else {
    data.subjects.forEach(subj => {
      const color = subj.avg !== null ? gpaGetNoteColor(subj.avg) : 'var(--text-muted)';
      const evals = subj.evaluations || [];
      html += `
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.8rem;margin-bottom:0.6rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <span style="font-weight:700;color:var(--text-primary);font-size:0.9rem">${subj.name}</span>
            <span style="font-size:0.7rem;color:var(--text-muted)">${subj.credits || 4} créditos</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem">
            ${subj.avg !== null ? `<span style="font-size:1.1rem;font-weight:800;color:${color}">${subj.avg.toFixed(2)}</span>` : '<span style="font-size:0.8rem;color:var(--text-muted)">Sin notas</span>'}
            <button onclick="window.gpaRemoveSubject(${subj.id})" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:1rem" title="Eliminar materia">×</button>
          </div>
        </div>`;

      // Add evaluation form
      html += `
        <div style="display:flex;gap:0.3rem;margin-bottom:0.5rem;flex-wrap:wrap">
          <input id="gpa-eval-name-${subj.id}" placeholder="Ej: Parcial 1" style="flex:1;min-width:80px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.5rem;font-size:0.78rem;color:var(--text-primary);outline:none">
          <input id="gpa-eval-note-${subj.id}" type="number" min="0" max="10" step="0.5" placeholder="Nota" style="width:60px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.5rem;font-size:0.78rem;color:var(--text-primary);outline:none">
          <input id="gpa-eval-weight-${subj.id}" type="number" min="0.5" max="10" step="0.5" value="1" placeholder="Peso" style="width:55px;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.5rem;font-size:0.78rem;color:var(--text-primary);outline:none">
          <button onclick="window.gpaAddEval(${subj.id})" style="background:#3b82f6;color:white;border:none;border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.78rem;font-weight:600">+</button>
        </div>`;

      // Evaluation list
      if (evals.length > 0) {
        html += `<div style="display:flex;flex-direction:column;gap:0.2rem">`;
        evals.forEach(e => {
          const ec = gpaGetNoteColor(e.note);
          html += `<div style="display:flex;align-items:center;justify-content:space-between;padding:0.25rem 0.4rem;background:var(--bg-secondary);border-radius:6px;font-size:0.78rem">
            <span style="color:var(--text-primary)">${e.name}</span>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <span style="color:${ec};font-weight:600">${e.note}</span>
              ${e.weight !== 1 ? `<span style="color:var(--text-muted);font-size:0.7rem">×${e.weight}</span>` : ''}
              <button onclick="window.gpaRemoveEval(${subj.id},'${e.id}')" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:0.8rem">×</button>
            </div>
          </div>`;
        });
        html += `</div>`;
      }

      // Progress bar
      if (subj.avg !== null) {
        const pct = Math.min(100, (subj.avg / 10) * 100);
        html += `
        <div style="margin-top:0.5rem;height:6px;background:var(--bg-secondary);border-radius:3px;overflow:hidden;position:relative">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;transition:width 0.3s"></div>
          <div style="position:absolute;left:70%;top:-1px;width:1px;height:8px;background:var(--text-muted);opacity:0.4"></div>
        </div>`;
      }

      html += `</div>`;
    });

    // Overall progress bar
    html += `
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.8rem;margin-top:0.5rem">
      <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:0.3rem">
        <span style="color:var(--text-muted)">Progreso hacia Regular (≥7)</span>
        <span style="color:var(--text-primary);font-weight:600">${Math.min(100, Math.round((stats.weighted / 7) * 100))}%</span>
      </div>
      <div style="height:8px;background:var(--bg-secondary);border-radius:4px;overflow:hidden;position:relative">
        <div style="height:100%;width:${Math.min(100, (stats.weighted / 10) * 100)}%;background:linear-gradient(90deg,#ef4444,#f59e0b 40%,#22c55e);border-radius:4px;transition:width 0.3s"></div>
        <div style="position:absolute;left:70%;top:-1px;width:2px;height:10px;background:var(--text-primary);opacity:0.5;border-radius:1px"></div>
      </div>
      <div style="display:flex;justify-content:flex-end;font-size:0.65rem;color:var(--text-muted);margin-top:0.2rem"><span>← 7</span></div>
    </div>

    <div style="text-align:center;margin-top:0.8rem">
      <button onclick="window.gpaClearAll()" style="background:none;border:1px solid var(--border-color);border-radius:6px;padding:0.4rem 1rem;cursor:pointer;font-size:0.78rem;color:var(--text-muted)">Borrar todo</button>
    </div>`;
  }

  container.innerHTML = html;
}

// ─── HANDLERS ───
window.gpaAddSubject = function() {
  const name = document.getElementById('gpa-subj-name')?.value?.trim();
  const credits = parseInt(document.getElementById('gpa-subj-credits')?.value) || 4;
  if (!name) return;
  const data = loadGPAData();
  data.subjects.push({ id: Date.now(), name, credits, evaluations: [] });
  saveGPAData(data);
  document.getElementById('gpa-subj-name').value = '';
  renderGPACalculator();
};

window.gpaRemoveSubject = function(id) {
  const data = loadGPAData();
  data.subjects = data.subjects.filter(s => s.id !== id);
  saveGPAData(data);
  renderGPACalculator();
};

window.gpaAddEval = function(subjId) {
  const nameEl = document.getElementById('gpa-eval-name-' + subjId);
  const noteEl = document.getElementById('gpa-eval-note-' + subjId);
  const weightEl = document.getElementById('gpa-eval-weight-' + subjId);
  const name = nameEl?.value?.trim() || 'Evaluación';
  const note = parseFloat(noteEl?.value);
  const weight = parseFloat(weightEl?.value) || 1;
  if (isNaN(note) || note < 0 || note > 10) { alert('Nota inválida (0-10)'); return; }
  const data = loadGPAData();
  const subj = data.subjects.find(s => s.id === subjId);
  if (!subj) return;
  if (!subj.evaluations) subj.evaluations = [];
  subj.evaluations.push({ id: 'ev_' + Date.now(), name, note, weight });
  saveGPAData(data);
  renderGPACalculator();
};

window.gpaRemoveEval = function(subjId, evalId) {
  const data = loadGPAData();
  const subj = data.subjects.find(s => s.id === subjId);
  if (!subj) return;
  subj.evaluations = (subj.evaluations || []).filter(e => e.id !== evalId);
  saveGPAData(data);
  renderGPACalculator();
};

window.gpaClearAll = function() {
  if (!confirm('¿Borrar todo?')) return;
  saveGPAData({ subjects: [] });
  renderGPACalculator();
};

window.renderGPACalculator = renderGPACalculator;
