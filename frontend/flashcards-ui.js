// flashcards-ui.js - UI para flashcards con repaso espaciado
import { createFlashcardsBatch, getFlashcards, getDueFlashcards, reviewFlashcard, deleteFlashcard } from "./flashcards.js";
import { authReady, getUid } from "./firebase.js";

let currentQueue = [];
let currentIdx = 0;
let showingBack = false;

async function refreshFlashcardsView() {
  const all = await getFlashcards();
  const due = await getDueFlashcards();
  const badge = document.getElementById("flashcards-count");
  const dueBadge = document.getElementById("flashcards-due-count");
  if (badge) badge.textContent = `${all.length}`;
  if (dueBadge) dueBadge.textContent = `${due.length} por repasar`;
  const grid = document.getElementById("flashcards-grid");
  const empty = document.getElementById("flashcards-empty");
  if (!grid) return;
  if (all.length === 0) {
    grid.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  grid.innerHTML = all.map(c => `
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:0.9rem;display:flex;flex-direction:column;gap:0.5rem">
      <div style="font-size:0.68rem;color:var(--accent-cyan);font-weight:600;letter-spacing:0.04em">${c.topic}</div>
      <div style="font-size:0.85rem;font-weight:600;color:var(--text-primary)">${c.front}</div>
      <div style="font-size:0.8rem;color:var(--text-secondary);border-top:1px dashed var(--border-color);padding-top:0.4rem">${c.back}</div>
      <div style="font-size:0.68rem;color:var(--text-muted)">Repeticiones: ${c.reps||0} · Intervalo: ${c.interval||0}d</div>
      <button onclick="handleDeleteFlashcard('${c.id}')" style="align-self:flex-start;background:none;border:none;color:var(--text-muted);font-size:0.7rem;cursor:pointer">🗑️ Eliminar</button>
    </div>
  `).join("");
}

window.handleDeleteFlashcard = async (id) => {
  if (!confirm("¿Eliminar flashcard?")) return;
  await deleteFlashcard(id);
  refreshFlashcardsView();
};

window.openFlashcardsGenerateModal = () => {
  if (!getUid()) { alert("Iniciá sesión"); return; }
  // Populate document selector
  const chat = window.getActiveChat ? window.getActiveChat() : null;
  const docs = chat?.loadedDocuments || [];
  const select = document.getElementById("flashcards-doc-select");
  if (select) {
    if (docs.length === 0) {
      select.innerHTML = '<option value="">— Subí un PDF en Materiales primero —</option>';
    } else {
      select.innerHTML = docs.map((d, i) => `<option value="${i}">📄 ${d.filename}</option>`).join("");
    }
  }
  document.getElementById("flashcards-generate-modal")?.classList.add("open");
};
window.closeFlashcardsGenerateModal = () => document.getElementById("flashcards-generate-modal")?.classList.remove("open");

window.handleGenerateFlashcards = async () => {
  const chat = window.getActiveChat ? window.getActiveChat() : null;
  const docs = chat?.loadedDocuments || [];
  const selectIdx = parseInt(document.getElementById("flashcards-doc-select")?.value);
  if (isNaN(selectIdx) || !docs[selectIdx] || !docs[selectIdx].text || docs[selectIdx].text.trim().length < 40) {
    alert("Elegí un documento válido con texto de Materiales");
    return;
  }
  const doc = docs[selectIdx];
  const count = document.getElementById("flashcards-count-select")?.value || "8";
  const btn = document.getElementById("btn-generate-flashcards");
  const old = btn ? btn.textContent : "";
  if (btn) { btn.textContent = "⏳ Generando..."; btn.disabled = true; }
  try {
    const apiBase = (window.getApiBase ? window.getApiBase() : (localStorage.getItem('fiuba_agent_api_base') || 'https://fiuba-agent-backend-1.onrender.com')).replace(/\/+$/,'');
    const userApiKey = (window.getUserGeminiKey ? window.getUserGeminiKey() : (localStorage.getItem('fiuba_gemini_key')||''));
    const resp = await fetch(apiBase + '/api/generate-flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: doc.text, count: parseInt(count), userApiKey })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Error');
    const cards = data.flashcards || [];
    if (cards.length === 0) throw new Error("No se generaron");
    await createFlashcardsBatch(cards);
    closeFlashcardsGenerateModal();
    alert(`Se crearon ${cards.length} flashcards`);
    refreshFlashcardsView();
  } catch(e){ alert("Error: "+e.message); console.error(e); }
  finally { if (btn) { btn.textContent = old || "Generar"; btn.disabled = false; } }
};

window.startFlashcardsQuiz = async () => {
  const due = await getDueFlashcards();
  const all = await getFlashcards();
  const pool = due.length ? due : all;
  if (pool.length === 0) { alert("No tenés flashcards. Generá algunas primero."); return; }
  currentQueue = pool.slice(0, Math.min(20, pool.length));
  currentIdx = 0;
  showingBack = false;
  document.getElementById("flashcards-quiz-modal")?.classList.add("open");
  renderFlashcardQuiz();
};

function renderFlashcardQuiz() {
  if (currentIdx >= currentQueue.length) {
    document.getElementById("flashcards-quiz-card").innerHTML = `<div style="text-align:center;padding:1.5rem"><div style="font-size:2rem;margin-bottom:0.5rem">🎉</div><h3 style="font-family:var(--font-heading)">¡Completado!</h3><p style="color:var(--text-muted);font-size:0.82rem;margin-top:0.3rem">Repasaste ${currentQueue.length} fichas</p><button class="btn-secondary" onclick="closeFlashcardsQuiz()" style="margin-top:1rem">Cerrar</button></div>`;
    document.getElementById("flashcards-quiz-actions").innerHTML = "";
    return;
  }
  const c = currentQueue[currentIdx];
  const cardEl = document.getElementById("flashcards-quiz-card");
  cardEl.innerHTML = `
    <div style="font-size:0.7rem;color:var(--accent-cyan);font-weight:600;margin-bottom:0.4rem">${c.topic} · ${currentIdx+1}/${currentQueue.length}</div>
    <div style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin-bottom:0.8rem">${c.front}</div>
    ${showingBack ? `<div style="background:rgba(255,255,255,0.06);border:1px solid var(--border-color);border-radius:10px;padding:0.8rem;font-size:0.9rem;color:var(--text-secondary)">${c.back}</div>` : `<button class="btn-secondary" onclick="revealFlashcard()" style="width:100%;justify-content:center">Mostrar respuesta</button>`}
  `;
  const actions = document.getElementById("flashcards-quiz-actions");
  if (showingBack) {
    actions.innerHTML = `
      <button onclick="rateFlashcard(0)" style="flex:1;background:rgba(239,68,68,0.15);color:var(--danger);border:1px solid var(--danger);border-radius:8px;padding:0.5rem;font-size:0.8rem;cursor:pointer">Otra vez</button>
      <button onclick="rateFlashcard(1)" style="flex:1;background:rgba(245,158,11,0.15);color:var(--warning);border:1px solid var(--warning);border-radius:8px;padding:0.5rem;font-size:0.8rem;cursor:pointer">Difícil</button>
      <button onclick="rateFlashcard(2)" style="flex:1;background:rgba(16,185,129,0.15);color:var(--success);border:1px solid var(--success);border-radius:8px;padding:0.5rem;font-size:0.8rem;cursor:pointer">Bien</button>
      <button onclick="rateFlashcard(3)" style="flex:1;background:rgba(59,130,246,0.15);color:var(--primary);border:1px solid var(--primary);border-radius:8px;padding:0.5rem;font-size:0.8rem;cursor:pointer">Fácil</button>
    `;
  } else {
    actions.innerHTML = "";
  }
}

window.revealFlashcard = () => { showingBack = true; renderFlashcardQuiz(); };
window.rateFlashcard = async (q) => {
  const c = currentQueue[currentIdx];
  try { await reviewFlashcard(c.id, q); } catch(e){ console.error(e); }
  // Gamificación: XP por flashcard
  if (window.Gamification) {
    window.Gamification.trackFlashcard(q >= 3);
    const r = window.Gamification.addXp(q >= 3 ? 'flashcard_mastered' : 'flashcard_reviewed');
    if (window.processGamificationResult) window.processGamificationResult(r);
  }
  currentIdx++; showingBack = false; renderFlashcardQuiz(); refreshFlashcardsView();
};
window.closeFlashcardsQuiz = () => document.getElementById("flashcards-quiz-modal")?.classList.remove("open");

authReady.then(()=> refreshFlashcardsView());
window.addEventListener("fiuba-auth-ready", refreshFlashcardsView);
window.refreshFlashcardsView = refreshFlashcardsView;
