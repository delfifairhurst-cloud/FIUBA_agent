// calendar.js - Calendario de estudio premium (Firestore, sin IA, sin costo)
import { db, getUid, authReady } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const EVENT_TYPES = [
  { value: "parcial", label: "Parcial", svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`, gradient: "linear-gradient(135deg,#3b82f6,#2563eb)", color: "#3b82f6" },
  { value: "recuperatorio", label: "Recuperatorio", svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`, gradient: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#f59e0b" },
  { value: "final", label: "Final", svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 6 3 12 0v-5"/></svg>`, gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)", color: "#8b5cf6" },
  { value: "tp", label: "TP / Entrega", svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`, gradient: "linear-gradient(135deg,#06b6d4,#0891b2)", color: "#06b6d4" },
  { value: "estudio", label: "Sesión de estudio", svg: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`, gradient: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#22c55e" },
];

function daysUntil(dateStr) {
  const target = new Date(dateStr + "T23:59:59");
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  } catch { return dateStr; }
}

function formatDateShort(dateStr) {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  } catch { return dateStr; }
}

function getDayOfWeek(dateStr) {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-AR", { weekday: "short" }).toUpperCase();
  } catch { return "??"; }
}

function renderCalendarUI(events) {
  const container = document.getElementById("calendar-events");
  if (!container) return;

  const now = new Date();
  const upcoming = events.filter(e => new Date(e.date + "T23:59:59") >= now);
  const past = events.filter(e => new Date(e.date + "T23:59:59") < now).reverse().slice(0, 5);

  if (events.length === 0) {
    container.innerHTML = `
      <div class="cal-empty-state">
        <div class="cal-empty-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            <line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/>
          </svg>
        </div>
        <h4 class="cal-empty-title">Sin eventos programados</h4>
        <p class="cal-empty-desc">Agregá parciales, finales o entregas para no olvidarte de nada.</p>
        <button onclick="window.openCalendarModal && window.openCalendarModal()" class="cal-btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar primer evento
        </button>
      </div>`;
    return;
  }

  let html = '';

  if (upcoming.length > 0) {
    html += `<div class="cal-section-header">
      <div class="cal-section-dot"></div>
      <span>Próximos eventos</span>
      <span class="cal-section-count">${upcoming.length}</span>
    </div>`;
    html += `<div class="cal-events-list">`;

    upcoming.slice(0, 8).forEach((ev, idx) => {
      const typeInfo = EVENT_TYPES.find(t => t.value === ev.type) || EVENT_TYPES[0];
      const days = daysUntil(ev.date);
      const isUrgent = days <= 3;
      const isToday = days === 0;
      const isTomorrow = days === 1;

      let badgeClass = 'cal-badge-distant';
      let badgeText = `${days}d`;
      if (isToday) { badgeClass = 'cal-badge-today'; badgeText = 'HOY'; }
      else if (isTomorrow) { badgeClass = 'cal-badge-tomorrow'; badgeText = 'MAÑ'; }
      else if (days <= 3) { badgeClass = 'cal-badge-urgent'; badgeText = `${days}d`; }
      else if (days <= 7) { badgeClass = 'cal-badge-soon'; badgeText = `${days}d`; }

      html += `<div class="cal-event-card ${isToday ? 'cal-event-today' : ''}" style="--event-color:${typeInfo.color};animation-delay:${idx * 0.06}s">
        <div class="cal-event-left">
          <div class="cal-event-day-badge" style="background:${typeInfo.gradient}">
            <span class="cal-event-day-num">${new Date(ev.date + "T12:00:00").getDate()}</span>
            <span class="cal-event-day-month">${new Date(ev.date + "T12:00:00").toLocaleDateString("es-AR", { month: "short" }).toUpperCase()}</span>
          </div>
        </div>
        <div class="cal-event-center">
          <div class="cal-event-title">${ev.title}</div>
          <div class="cal-event-meta">
            <span class="cal-event-type-badge" style="background:${typeInfo.color}20;color:${typeInfo.color}">
              <span style="display:inline-flex;width:14px;height:14px">${typeInfo.svg}</span>
              ${typeInfo.label}
            </span>
            ${ev.subject ? `<span class="cal-event-subject">${ev.subject}</span>` : ''}
          </div>
          ${ev.notes ? `<div class="cal-event-notes">${ev.notes}</div>` : ''}
        </div>
        <div class="cal-event-right">
          <div class="cal-countdown ${badgeClass}">${badgeText}</div>
          <button class="cal-delete-btn" onclick="event.stopPropagation();window.removeCalendarEvent('${ev.id}')" title="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  if (past.length > 0) {
    html += `<div class="cal-section-header cal-section-past">
      <div class="cal-section-dot" style="background:var(--text-muted)"></div>
      <span>Pasados</span>
      <span class="cal-section-count">${past.length}</span>
    </div>`;
    html += `<div class="cal-events-list cal-past-list">`;
    past.forEach((ev, idx) => {
      const typeInfo = EVENT_TYPES.find(t => t.value === ev.type) || EVENT_TYPES[0];
      html += `<div class="cal-event-card cal-event-past" style="animation-delay:${idx * 0.06}s">
        <div class="cal-event-left">
          <div class="cal-event-day-badge cal-day-past">
            <span class="cal-event-day-num">${new Date(ev.date + "T12:00:00").getDate()}</span>
            <span class="cal-event-day-month">${new Date(ev.date + "T12:00:00").toLocaleDateString("es-AR", { month: "short" }).toUpperCase()}</span>
          </div>
        </div>
        <div class="cal-event-center">
          <div class="cal-event-title cal-title-past">${ev.title}</div>
          <div class="cal-event-meta">
            <span class="cal-event-type-badge cal-type-past" style="background:var(--bg-secondary)">
              <span style="display:inline-flex;width:14px;height:14px;opacity:0.5">${typeInfo.svg}</span>
              ${typeInfo.label}
            </span>
          </div>
        </div>
        <div class="cal-event-right">
          <button class="cal-delete-btn" onclick="event.stopPropagation();window.removeCalendarEvent('${ev.id}')" title="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

async function refreshCalendar() {
  const events = await getEvents().catch(() => []);
  renderCalendarUI(events);
}

async function addEvent({ title, subject, date, type = "parcial", notes = "" }) {
  const uid = getUid();
  if (!uid) throw new Error("Iniciá sesión");
  if (!title || !date) throw new Error("Faltan título o fecha");
  const ref = collection(db, `users/${uid}/events`);
  const docRef = await addDoc(ref, {
    title: title.trim(),
    subject: (subject || "").trim(),
    date,
    type,
    notes: (notes || "").trim().slice(0, 300),
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

async function getEvents() {
  const uid = getUid();
  if (!uid) return [];
  const ref = collection(db, `users/${uid}/events`);
  const q = query(ref, orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function removeEvent(eventId) {
  const uid = getUid();
  await deleteDoc(doc(db, `users/${uid}/events/${eventId}`));
}

window.openCalendarModal = function() {
  const modal = document.getElementById("calendar-modal");
  if (modal) {
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("cal-modal-open"), 10);
    const firstInput = document.getElementById("cal-event-title");
    if (firstInput) setTimeout(() => firstInput.focus(), 200);
  }
};

window.closeCalendarModal = function() {
  const modal = document.getElementById("calendar-modal");
  if (modal) {
    modal.classList.remove("cal-modal-open");
    setTimeout(() => { modal.style.display = "none"; }, 200);
  }
};

window.handleSaveEvent = async function() {
  const title = document.getElementById("cal-event-title")?.value.trim();
  const subject = document.getElementById("cal-event-subject")?.value.trim();
  const date = document.getElementById("cal-event-date")?.value;
  const type = document.getElementById("cal-event-type")?.value;
  const notes = document.getElementById("cal-event-notes")?.value.trim();

  if (!title || !date) {
    const btn = document.querySelector(".cal-modal-save");
    if (btn) { btn.classList.add("cal-shake"); setTimeout(() => btn.classList.remove("cal-shake"), 500); }
    return;
  }

  const btn = document.querySelector(".cal-modal-save");
  if (btn) { btn.disabled = true; btn.textContent = "Guardando..."; }

  try {
    await addEvent({ title, subject, date, type, notes });
    document.getElementById("cal-event-title").value = "";
    document.getElementById("cal-event-subject").value = "";
    document.getElementById("cal-event-date").value = "";
    document.getElementById("cal-event-notes").value = "";
    window.closeCalendarModal();
    refreshCalendar();
  } catch (e) {
    alert("Error: " + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Guardar evento"; }
  }
};

window.removeCalendarEvent = async function(id) {
  if (!confirm("¿Eliminar este evento?")) return;
  await removeEvent(id);
  refreshCalendar();
};

authReady.then(() => setTimeout(refreshCalendar, 1000));
window.addEventListener("fiuba-auth-ready", () => setTimeout(refreshCalendar, 800));
window.refreshCalendar = refreshCalendar;
