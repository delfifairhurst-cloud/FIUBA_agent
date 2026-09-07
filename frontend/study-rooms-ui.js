// study-rooms-ui.js - UI de salas de estudio
import { createRoom, joinRoom, leaveRoom, deleteRoom, getPublicRooms, getMyRooms, getRoom, sendMessage, listenToMessages } from "./study-rooms.js";
import { getUid, authReady } from "./firebase.js";

let activeRoomId = null;
let unsubMessages = null;
let allRooms = [];

function showToast(msg, color) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:${color};color:white;padding:0.5rem 1.2rem;border-radius:10px;font-size:0.85rem;z-index:9999;font-weight:600`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function renderRoomCard(room) {
  const uid = getUid();
  const isMember = uid && room.members.includes(uid);
  const isOwner = uid && room.createdBy === uid;
  const dateStr = room.createdAt && room.createdAt.toDate ? room.createdAt.toDate().toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '';
  return `
    <div class="sr-card ${isMember ? 'sr-card-member' : ''}">
      <div class="sr-card-header">
        <div class="sr-card-info">
          <div class="sr-card-name">${room.name}</div>
          <div class="sr-card-subject">${room.subject}</div>
        </div>
        <div class="sr-card-meta">
          ${room.isPrivate ? '<span class="sr-badge sr-badge-private">🔒 Privada</span>' : '<span class="sr-badge sr-badge-public">🌐 Pública</span>'}
          <span class="sr-members-count">${room.memberCount || room.members.length}/20</span>
        </div>
      </div>
      <div class="sr-card-footer">
        <span class="sr-card-date">${dateStr}</span>
        <div class="sr-card-actions">
          ${isMember
            ? `<button class="sr-btn sr-btn-chat" onclick="window.openStudyRoom('${room.id}')">💬 Chat</button>
               <button class="sr-btn sr-btn-leave" onclick="window.leaveStudyRoom('${room.id}')">Salir</button>`
            : `<button class="sr-btn sr-btn-join" onclick="window.joinStudyRoom('${room.id}', ${room.isPrivate})">Unirse</button>`
          }
          ${isOwner ? `<button class="sr-btn sr-btn-delete" onclick="window.deleteStudyRoom('${room.id}')">🗑</button>` : ''}
        </div>
      </div>
    </div>`;
}

function renderRoomChat(roomId, room) {
  const uid = getUid();
  if (unsubMessages) unsubMessages();
  const chatEl = document.getElementById('sr-chat');
  const headerEl = document.getElementById('sr-chat-header');
  if (headerEl) {
    headerEl.innerHTML = `
      <button class="sr-back-btn" onclick="window.closeStudyRoom()">← Volver</button>
      <div class="sr-room-title">${room.name}</div>
      <div class="sr-room-subject">${room.subject} · ${room.members.length} miembros</div>`;
  }
  activeRoomId = roomId;
  unsubMessages = listenToMessages(roomId, (msgs) => {
    if (!chatEl) return;
    chatEl.innerHTML = msgs.map(m => `
      <div class="sr-msg ${m.uid === uid ? 'sr-msg-mine' : ''}">
        <div class="sr-msg-author">${m.displayName}</div>
        <div class="sr-msg-text">${m.text}</div>
      </div>
    `).join('');
    chatEl.scrollTop = chatEl.scrollHeight;
  });
}

window.openStudyRoom = async function(roomId) {
  const uid = getUid();
  if (!uid) { showToast('Iniciá sesión primero', '#ef4444'); return; }
  const room = await getRoomById(roomId);
  if (!room) { showToast('Sala no encontrada', '#ef4444'); return; }
  const listEl = document.getElementById('sr-list');
  const chatEl = document.getElementById('sr-chat-area');
  if (listEl) listEl.style.display = 'none';
  if (chatEl) chatEl.style.display = 'flex';
  renderRoomChat(roomId, room);
};

window.closeStudyRoom = function() {
  if (unsubMessages) { unsubMessages(); unsubMessages = null; }
  activeRoomId = null;
  const listEl = document.getElementById('sr-list');
  const chatEl = document.getElementById('sr-chat-area');
  if (listEl) listEl.style.display = 'block';
  if (chatEl) chatEl.style.display = 'none';
};

window.sendStudyMessage = function() {
  if (!activeRoomId) return;
  const input = document.getElementById('sr-msg-input');
  if (!input || !input.value.trim()) return;
  try {
    sendMessage(activeRoomId, input.value.trim());
    input.value = '';
  } catch (e) { showToast(e.message, '#ef4444'); }
};

window.joinStudyRoom = async function(roomId, isPrivate) {
  const uid = getUid();
  if (!uid) { showToast('Iniciá sesión primero', '#ef4444'); return; }
  if (isPrivate) {
    const code = prompt('Código de acceso:');
    if (!code) return;
    try { await joinRoom(roomId, code); showToast('¡Te uniste a la sala! 🎉', '#22c55e'); await refreshRoomsView(); }
    catch (e) { showToast(e.message, '#ef4444'); }
  } else {
    try { await joinRoom(roomId); showToast('¡Te uniste a la sala! 🎉', '#22c55e'); await refreshRoomsView(); }
    catch (e) { showToast(e.message, '#ef4444'); }
  }
};

window.leaveStudyRoom = async function(roomId) {
  if (!confirm('¿Salir de la sala?')) return;
  try { await leaveRoom(roomId); if (activeRoomId === roomId) window.closeStudyRoom(); showToast('Saliste de la sala', '#22c55e'); await refreshRoomsView(); }
  catch (e) { showToast(e.message, '#ef4444'); }
};

window.deleteStudyRoom = async function(roomId) {
  if (!confirm('¿Eliminar esta sala? Se borrarán todos los mensajes.')) return;
  try { await deleteRoom(roomId); showToast('Sala eliminada', '#22c55e'); await refreshRoomsView(); }
  catch (e) { showToast(e.message, '#ef4444'); }
};

window.showCreateRoomForm = function() {
  const form = document.getElementById('sr-create-form');
  if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
};

window.submitCreateRoom = async function() {
  const uid = getUid();
  if (!uid) { showToast('Iniciá sesión primero', '#ef4444'); return; }
  const name = document.getElementById('sr-room-name')?.value?.trim();
  const subject = document.getElementById('sr-room-subject')?.value?.trim();
  const isPrivate = document.getElementById('sr-room-private')?.checked;
  const code = document.getElementById('sr-room-code')?.value?.trim();
  if (!name || !subject) { showToast('Faltan nombre y materia', '#ef4444'); return; }
  if (isPrivate && !code) { showToast('Poné un código para la sala privada', '#ef4444'); return; }
  try {
    await createRoom({ name, subject, isPrivate, code });
    showToast('¡Sala creada! 🎉', '#22c55e');
    document.getElementById('sr-room-name').value = '';
    document.getElementById('sr-room-subject').value = '';
    document.getElementById('sr-room-code').value = '';
    document.getElementById('sr-room-private').checked = false;
    document.getElementById('sr-code-field').style.display = 'none';
    window.showCreateRoomForm();
    await refreshRoomsView();
  } catch (e) { showToast(e.message, '#ef4444'); }
};

async function refreshRoomsView() {
  allRooms = await getPublicRooms();
  const myRooms = await getMyRooms();
  const myIds = new Set(myRooms.map(r => r.id));
  const listEl = document.getElementById('sr-list-grid');
  if (!listEl) return;

  const myRoomsHtml = myRooms.length > 0 ? `
    <div class="sr-section">
      <h4 class="sr-section-title">Mis salas</h4>
      ${myRooms.map(renderRoomCard).join('')}
    </div>` : '';

  const publicRooms = allRooms.filter(r => !myIds.has(r.id));
  const publicHtml = publicRooms.length > 0 ? `
    <div class="sr-section">
      <h4 class="sr-section-title">Salas públicas</h4>
      ${publicRooms.map(renderRoomCard).join('')}
    </div>` : '<div class="sr-empty">No hay salas disponibles. Creá una nueva.</div>';

  listEl.innerHTML = myRoomsHtml + publicHtml;
}

export async function renderStudyRooms() {
  const container = document.getElementById('rooms-content');
  if (!container) return;
  await authReady;
  container.innerHTML = `
    <div class="sr-header">
      <h2 class="sr-title">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Salas de Estudio
      </h2>
      <span class="sr-subtitle">Creá o unite a una sala para estudiar con otros alumnos</span>
    </div>

    <div id="sr-list">
      <button class="sr-create-btn" onclick="window.showCreateRoomForm()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Crear sala
      </button>

      <div id="sr-create-form" class="sr-create-form" style="display:none">
        <input id="sr-room-name" class="sr-input" type="text" placeholder="Nombre de la sala (ej: Grupo Álgebra - Parcial 1)" maxlength="60">
        <input id="sr-room-subject" class="sr-input" type="text" placeholder="Materia" maxlength="60">
        <label class="sr-checkbox-label">
          <input type="checkbox" id="sr-room-private" onchange="document.getElementById('sr-code-field').style.display=this.checked?'block':'none'">
          Sala privada (con código de acceso)
        </label>
        <div id="sr-code-field" style="display:none">
          <input id="sr-room-code" class="sr-input" type="text" placeholder="Código de acceso" maxlength="20">
        </div>
        <button class="sr-submit-btn" onclick="window.submitCreateRoom()">Crear sala</button>
      </div>

      <div id="sr-list-grid" class="sr-list-grid"></div>
    </div>

    <div id="sr-chat-area" class="sr-chat-area" style="display:none">
      <div id="sr-chat-header" class="sr-chat-header"></div>
      <div id="sr-chat" class="sr-chat-messages"></div>
      <div class="sr-chat-input">
        <input id="sr-msg-input" class="sr-msg-input" type="text" placeholder="Escribí un mensaje..." maxlength="1000"
          onkeydown="if(event.key==='Enter')window.sendStudyMessage()">
        <button class="sr-send-btn" onclick="window.sendStudyMessage()">→</button>
      </div>
    </div>`;

  await refreshRoomsView();
}

async function getRoomById(roomId) {
  return await getRoom(roomId);
}

window.renderStudyRooms = renderStudyRooms;
