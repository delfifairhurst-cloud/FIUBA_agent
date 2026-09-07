// study-schedule.js - Cronograma de estudio semanal (localStorage, sin IA)
const SCHEDULE_KEY = 'fiuba_study_schedule';
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const HOURS = [];
for (let h = 7; h <= 23; h++) HOURS.push(`${String(h).padStart(2,'0')}:00`);

function loadSchedule() {
  try { return JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || { subjects: [], blocks: {} }; }
  catch { return { subjects: [], blocks: {} }; }
}

function saveSchedule(data) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(data));
}

function addScheduleSubject(name, color) {
  const data = loadSchedule();
  const colors = ['#3b82f6','#ef4444','#22c55e','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#f97316'];
  data.subjects.push({ id: Date.now(), name: name.trim(), color: color || colors[data.subjects.length % colors.length] });
  saveSchedule(data);
}

function removeScheduleSubject(id) {
  const data = loadSchedule();
  data.subjects = data.subjects.filter(s => s.id !== id);
  Object.keys(data.blocks).forEach(k => { if (data.blocks[k] === id) delete data.blocks[k]; });
  saveSchedule(data);
}

function toggleBlock(dayIdx, hour) {
  const data = loadSchedule();
  const key = `${dayIdx}-${hour}`;
  const selector = document.getElementById('schedule-subject-select');
  const subjectId = selector ? parseInt(selector.value) : (data.subjects[0]?.id || null);
  if (!subjectId) { alert('Agregá una materia primero'); return; }
  if (data.blocks[key] === subjectId) {
    delete data.blocks[key];
  } else {
    data.blocks[key] = subjectId;
  }
  saveSchedule(data);
  renderSchedule();
}

function renderSchedule() {
  const container = document.getElementById('schedule-view-content');
  if (!container) return;

  const data = loadSchedule();
  const totalBlocks = Object.keys(data.blocks).length;

  let html = `
    <div class="sch-header">
      <h2 class="sch-title">Cronograma de Estudio</h2>
      <div class="sch-total">${totalBlocks}h / semana</div>
    </div>

    <div class="sch-add-row">
      <input id="sch-subject-input" class="sch-input" placeholder="Materia (ej: Álgebra)">
      <button onclick="window.handleAddScheduleSubject()" class="sch-btn-add">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar
      </button>
    </div>

    <div class="sch-subjects-bar">`;

  if (data.subjects.length === 0) {
    html += `<span class="sch-empty-text">Agregá materias para armar tu horario</span>`;
  } else {
    data.subjects.forEach(s => {
      const hours = Object.values(data.blocks).filter(v => v === s.id).length;
      html += `<div class="sch-subject-chip" style="background:${s.color}18;border-color:${s.color}40">
        <span class="sch-chip-dot" style="background:${s.color}"></span>
        <span>${s.name}</span>
        <span class="sch-chip-hours">${hours}h</span>
        <button class="sch-chip-remove" onclick="window.removeScheduleSubject(${s.id})">✕</button>
      </div>`;
    });
  }

  html += `</div>`;

  if (data.subjects.length > 0) {
    html += `
    <div class="sch-grid-wrapper">
      <div class="sch-grid">
        <div class="sch-corner"></div>`;

    DAYS.forEach((d, di) => {
      html += `<div class="sch-day-header">${d.slice(0,3).toUpperCase()}</div>`;
    });

    HOURS.forEach(h => {
      html += `<div class="sch-hour-label">${h}</div>`;
      DAYS.forEach((_, di) => {
        const key = `${di}-${h}`;
        const subjectId = data.blocks[key];
        const subject = data.subjects.find(s => s.id === subjectId);
        const bg = subject ? `${subject.color}25` : 'var(--bg-secondary)';
        const border = subject ? `${subject.color}50` : 'var(--border-color)';
        html += `<div class="sch-block" style="background:${bg};border:1px solid ${border}" onclick="window.toggleBlock(${di},'${h}')" title="${subject ? subject.name : 'Click para asignar'}">
          ${subject ? `<span class="sch-block-text" style="color:${subject.color}">${subject.name.slice(0,3)}</span>` : ''}
        </div>`;
      });
    });

    html += `</div></div>`;
  }

  html += `<div style="text-align:center;margin-top:1rem"><button onclick="window.clearSchedule()" class="sch-btn-clear">Limpiar horario</button></div>`;

  container.innerHTML = html;
}

window.handleAddScheduleSubject = function() {
  const input = document.getElementById('sch-subject-input');
  const name = input?.value.trim();
  if (!name) return;
  addScheduleSubject(name);
  input.value = '';
  renderSchedule();
};

window.removeScheduleSubject = function(id) {
  removeScheduleSubject(id);
  renderSchedule();
};

window.toggleBlock = toggleBlock;

window.clearSchedule = function() {
  if (!confirm('¿Limpiar todo el horario?')) return;
  saveSchedule({ subjects: [], blocks: {} });
  renderSchedule();
};

window.renderSchedule = renderSchedule;
