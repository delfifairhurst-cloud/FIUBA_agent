// professor-ratings-ui.js - UI del ranking de profesores FIUBA (pro)
import { getAllRatings, addRating, deleteRating, voteRating, getSubjects, getAvgRating, getRatingColor, getRatingLabel } from "./professor-ratings.js";
import { getUid, authReady } from "./firebase.js";

let currentSubject = 'all';
let currentSearch = '';
let allRatings = [];

function renderStars(rating, interactive = false) {
  let html = '<div class="pr-stars">';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.round(rating);
    html += `<span class="pr-star ${filled ? 'pr-star-filled' : ''}" ${interactive ? `data-val="${i}" onclick="window.setProfRating(${i})"` : ''}>★</span>`;
  }
  html += '</div>';
  return html;
}

function renderRatingCard(r) {
  const uid = getUid();
  const isOwner = uid && r.uid === uid;
  const color = getRatingColor(r.rating);
  const dateStr = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '';
  return `
    <div class="pr-card">
      <div class="pr-card-left">
        <div class="pr-card-avatar" style="background:${color}20;color:${color}">${r.professorName.charAt(0)}</div>
      </div>
      <div class="pr-card-body">
        <div class="pr-card-top">
          <div>
            <div class="pr-card-name">${r.professorName}</div>
            <div class="pr-card-subject">${r.subject}</div>
          </div>
          <div class="pr-card-score">
            <span class="pr-score-num" style="color:${color}">${r.rating.toFixed(1)}</span>
            ${renderStars(r.rating)}
          </div>
        </div>
        ${r.review ? `<div class="pr-card-review">"${r.review}"</div>` : ''}
        <div class="pr-card-footer">
          <div class="pr-card-meta">
            <span class="pr-badge" style="background:${color}18;color:${color}">${r.category || getRatingLabel(r.rating)}</span>
            <span class="pr-card-date">${dateStr}</span>
            <span class="pr-card-author">${r.isSeed || r.uid === 'seed' ? '📖 datos de ejemplo' : (r.displayName || 'Anónimo')}</span>
          </div>
          <div class="pr-card-votes">
            <button class="pr-vote-btn" onclick="event.stopPropagation();window.voteProfRating('${r.id}','up')" title="Útil">👍 ${r.upvotes || 0}</button>
            <button class="pr-vote-btn" onclick="event.stopPropagation();window.voteProfRating('${r.id}','down')" title="No útil">👎 ${r.downvotes || 0}</button>
            ${isOwner ? `<button class="pr-del-btn" onclick="event.stopPropagation();window.deleteProfRating('${r.id}')" title="Eliminar">✕</button>` : ''}
          </div>
        </div>
      </div>
    </div>`;
}

function renderAddForm() {
  return `
    <div class="pr-add-section" id="pr-add-toggle">
      <button class="pr-add-btn" onclick="document.getElementById('pr-add-form').classList.toggle('pr-form-open');this.classList.toggle('pr-add-btn-active')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Calificar profesor
      </button>
    </div>
    <div class="pr-add-form" id="pr-add-form">
      <div class="pr-form-grid">
        <div class="pr-form-field">
          <label class="pr-form-label">Profesor</label>
          <input id="pr-prof-name" class="pr-input" type="text" placeholder="Nombre y apellido" maxlength="80">
        </div>
        <div class="pr-form-field">
          <label class="pr-form-label">Materia</label>
          <input id="pr-subject" class="pr-input" type="text" placeholder="Ej: Análisis Matemático I" maxlength="60" list="pr-subjects-list">
          <datalist id="pr-subjects-list"></datalist>
        </div>
        <div class="pr-form-field">
          <label class="pr-form-label">Calificación</label>
          <div class="pr-rating-picker">
            <div class="pr-stars pr-stars-interactive" id="pr-star-picker">
              ${[1,2,3,4,5].map(i => `<span class="pr-star pr-star-pick" data-val="${i}" onclick="window.setProfRating(${i})">★</span>`).join('')}
            </div>
            <span id="pr-rating-text" class="pr-rating-text">Seleccioná</span>
          </div>
        </div>
        <div class="pr-form-field pr-form-full">
          <label class="pr-form-label">Reseña (opcional)</label>
          <textarea id="pr-review" class="pr-textarea" placeholder="Contá tu experiencia con este profesor..." maxlength="500" rows="2"></textarea>
          <span class="pr-char-count"><span id="pr-char-ct">0</span>/500</span>
        </div>
      </div>
      <button class="pr-submit-btn" onclick="window.submitProfRating()">Publicar</button>
    </div>`;
}

window.setProfRating = function(val) {
  window._profRatingVal = val;
  const text = document.getElementById('pr-rating-text');
  if (text) text.textContent = `${val}/5 — ${getRatingLabel(val)}`;
  document.querySelectorAll('#pr-star-picker .pr-star').forEach((s, i) => {
    s.classList.toggle('pr-star-filled', i < val);
  });
};

window.submitProfRating = async function() {
  const name = document.getElementById('pr-prof-name')?.value?.trim();
  const subject = document.getElementById('pr-subject')?.value?.trim();
  const rating = window._profRatingVal;
  const review = document.getElementById('pr-review')?.value?.trim();
  if (!name || !subject || !rating) { showToast('Completá nombre, materia y calificación', '#ef4444'); return; }
  try {
    await addRating({ professorName: name, subject, rating, review });
    showToast('¡Calificación publicada! ⭐', '#22c55e');
    window._profRatingVal = 0;
    document.getElementById('pr-prof-name').value = '';
    document.getElementById('pr-subject').value = '';
    document.getElementById('pr-review').value = '';
    document.getElementById('pr-add-form').classList.remove('pr-form-open');
    await refreshRatingsView();
  } catch (e) { showToast(e.message, '#ef4444'); }
};

window.deleteProfRating = async function(id) {
  if (!confirm('¿Eliminar tu calificación?')) return;
  try { await deleteRating(id); showToast('Eliminada', '#22c55e'); await refreshRatingsView(); }
  catch (e) { showToast(e.message, '#ef4444'); }
};

window.voteProfRating = async function(id, type) {
  try { await voteRating(id, type); await refreshRatingsView(); }
  catch (e) { showToast(e.message, '#ef4444'); }
};

window.filterProfSubject = function(subject) {
  currentSubject = subject;
  renderProfList();
};

window.searchProfessors = function(q) {
  currentSearch = q.toLowerCase();
  renderProfList();
};

function showToast(msg, color) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:0.5rem 1.2rem;border-radius:10px;font-size:0.85rem;z-index:9999;font-weight:600`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function renderProfList() {
  const listEl = document.getElementById('pr-list');
  if (!listEl) return;

  let filtered = allRatings;
  if (currentSubject !== 'all') filtered = filtered.filter(r => r.subject === currentSubject);
  if (currentSearch) filtered = filtered.filter(r =>
    r.professorName.toLowerCase().includes(currentSearch) ||
    r.subject.toLowerCase().includes(currentSearch) ||
    (r.review && r.review.toLowerCase().includes(currentSearch))
  );

  // Group by professor
  const profMap = {};
  filtered.forEach(r => {
    if (!profMap[r.professorName]) profMap[r.professorName] = [];
    profMap[r.professorName].push(r);
  });
  const profList = Object.entries(profMap).map(([name, ratings]) => ({
    name,
    avg: getAvgRating(ratings),
    count: ratings.length,
    ratings,
  })).sort((a, b) => b.avg - a.avg);

  if (profList.length === 0) {
    listEl.innerHTML = `<div class="pr-empty">
      <div class="pr-empty-icon">🔍</div>
      <div class="pr-empty-text">${currentSearch || currentSubject !== 'all' ? 'No se encontraron resultados' : 'No hay calificaciones todavía'}</div>
    </div>`;
    return;
  }

  listEl.innerHTML = profList.map(p => {
    const color = getRatingColor(p.avg);
    const stars = Math.round(p.avg);
    const starHtml = Array.from({length:5}, (_, i) => i < stars ? '★' : '☆').join('');
    return `
      <div class="pr-prof-card">
        <div class="pr-prof-top">
          <div class="pr-prof-avatar" style="background:${color}20;color:${color}">${p.name.charAt(0)}</div>
          <div class="pr-prof-info">
            <div class="pr-prof-name">${p.name}</div>
            <div class="pr-prof-subject">${p.ratings[0]?.subject || ''}</div>
          </div>
          <div class="pr-prof-score">
            <span class="pr-prof-avg" style="color:${color}">${p.avg.toFixed(1)}</span>
            <span class="pr-prof-stars" style="color:${color}">${starHtml}</span>
            <span class="pr-prof-count">${p.count} ${p.count === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>
        <div class="pr-prof-reviews">
          ${p.ratings.map(r => `
            <div class="pr-mini-review">
              <div class="pr-mini-review-top">
                <span class="pr-mini-badge" style="background:${getRatingColor(r.rating)}18;color:${getRatingColor(r.rating)}">${r.rating.toFixed(1)}</span>
                <span class="pr-mini-date">${r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('es-AR', {day:'numeric',month:'short'}) : ''}</span>
              </div>
              ${r.review ? `<div class="pr-mini-text">"${r.review}"</div>` : ''}
              <div class="pr-mini-footer">
                <span class="pr-mini-author">${r.isSeed || r.uid === 'seed' ? '📖 datos de ejemplo' : (r.displayName || 'Anónimo')}</span>
                <div class="pr-mini-votes">
                  <button onclick="window.voteProfRating('${r.id}','up')">👍 ${r.upvotes||0}</button>
                  <button onclick="window.voteProfRating('${r.id}','down')">👎 ${r.downvotes||0}</button>
                  ${r.uid === getUid() ? `<button class="pr-mini-del" onclick="window.deleteProfRating('${r.id}')">✕</button>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
  }).join('');
}

async function refreshRatingsView() {
  allRatings = await getAllRatings();
  const subjects = getSubjects(allRatings);

  // Update datalist
  const dl = document.getElementById('pr-subjects-list');
  if (dl) dl.innerHTML = subjects.map(s => `<option value="${s}">`).join('');

  // Subject pills
  const filterEl = document.getElementById('pr-subject-filter');
  if (filterEl) {
    filterEl.innerHTML = `<button class="pr-pill ${currentSubject === 'all' ? 'pr-pill-active' : ''}" onclick="window.filterProfSubject('all')">Todas</button>` +
      subjects.map(s => `<button class="pr-pill ${currentSubject === s ? 'pr-pill-active' : ''}" onclick="window.filterProfSubject('${s}')">${s}</button>`).join('');
  }

  // Stats
  const statsEl = document.getElementById('pr-stats');
  if (statsEl) {
    const avg = getAvgRating(allRatings);
    const profs = new Set(allRatings.map(r => r.professorName));
    statsEl.innerHTML = `
      <div class="pr-stat-card"><div class="pr-stat-val" style="color:${getRatingColor(avg)}">${avg.toFixed(1)}</div><div class="pr-stat-lbl">Promedio</div></div>
      <div class="pr-stat-card"><div class="pr-stat-val">${allRatings.length}</div><div class="pr-stat-lbl">Reviews</div></div>
      <div class="pr-stat-card"><div class="pr-stat-val">${profs.size}</div><div class="pr-stat-lbl">Profesores</div></div>
      <div class="pr-stat-card"><div class="pr-stat-val">${subjects.length}</div><div class="pr-stat-lbl">Materias</div></div>`;
  }

  // Char count
  const reviewEl = document.getElementById('pr-review');
  const charCt = document.getElementById('pr-char-ct');
  if (reviewEl && charCt) {
    reviewEl.oninput = () => { charCt.textContent = reviewEl.value.length; };
  }

  renderProfList();
}

export async function renderProfessorRatings() {
  const container = document.getElementById('ratings-content');
  if (!container) return;
  await authReady;
  container.innerHTML = `
    <div class="pr-header">
      <h2 class="pr-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Profesores FIUBA
      </h2>
      <span class="pr-subtitle">Conocé a los profes antes de anotarte</span>
    </div>
    <div class="pr-stats" id="pr-stats"></div>
    ${renderAddForm()}
    <div class="pr-search-bar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input id="pr-search" class="pr-search-input" type="text" placeholder="Buscar profesor, materia o reseña..." oninput="window.searchProfessors(this.value)">
    </div>
    <div class="pr-filter-bar" id="pr-subject-filter"></div>
    <div id="pr-list" class="pr-list"></div>`;
  await refreshRatingsView();
}

window.renderProfessorRatings = renderProfessorRatings;
window.refreshRatingsView = refreshRatingsView;
