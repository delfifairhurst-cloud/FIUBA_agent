window.AdminBot = (() => {
  let isOpen = false;
  const btnId = 'admin-bot-fab';
  const panelId = 'admin-bot-panel';
  const messagesId = 'admin-bot-messages';
  const inputId = 'admin-bot-input';
  
  const html = `
    <div id="${panelId}" class="admin-bot-panel hidden">
      <div class="admin-bot-header">
        <div class="admin-bot-avatar">🤖</div>
        <div>
          <div class="admin-bot-title">Asistente Admin FIUBA</div>
          <div class="admin-bot-subtitle">Preguntas sobre UBA/CBC/Links</div>
        </div>
        <button class="admin-bot-close" onclick="AdminBot.toggle()">✕</button>
      </div>
      <div class="admin-bot-messages" id="${messagesId}"></div>
      <div class="admin-bot-input-wrap">
        <input type="text" id="${inputId}" placeholder="Ej: ¿Cuándo es el parcial de Álgebra II?">
        <button onclick="AdminBot.send()">➤</button>
      </div>
    </div>
    <button id="${btnId}" class="admin-bot-fab" onclick="AdminBot.toggle()" title="Asistente Admin">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span class="admin-bot-dot"></span>
    </button>
  `;
  
  const CONTEXT = `Sos el Asistente Administrativo de FIUBA Agent. Respondé SOLO preguntas administrativas sobre:
- Fechas de parciales/finales (UBA/CBC)
- Inscripciones (SIU Guaraní, fechas, requisitos)
- Horarios de cursada, mesas de examen
- Links oficiales: guaraní, campus, uba.ar, cbc.uba.ar, fi.uba.ar
- Trámites: certificado alumno regular, libreta, equivalencias
- Contactos: secretarías, departamentales, centros de estudiantes

NO respondas: dudas académicas, resolución de ejercicios, teoría.
Si no sabés, decí: "No tengo esa info, consultá en [link oficial]".`;
  
  function init() {
    if (document.getElementById('admin-bot-fab')) return;
    document.body.insertAdjacentHTML('beforeend', html);
    attachEvents();
  }
  
  function attachEvents() {
    const input = document.getElementById('admin-bot-input');
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  }
  
  async function send() {
    const input = document.getElementById('admin-bot-input');
    const text = input.value.trim();
    if (!text) return;
    
    addMessage('user', text);
    input.value = '';
    showTyping(true);
    
    try {
      const response = await fetch('/api/admin-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, context: CONTEXT })
      });
      const data = await response.json();
      showTyping(false);
      addMessage('bot', data.answer || 'Error al responder');
    } catch(e) {
      showTyping(false);
      addMessage('bot', 'Error de conexión');
    }
  }
  
  function addMessage(role, text) {
    const container = document.getElementById('admin-bot-messages');
    const div = document.createElement('div');
    div.className = `admin-bot-msg ${role}`;
    div.innerHTML = `<div class="admin-bot-bubble">${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }
  
  function showTyping(show) {
    const container = document.getElementById('admin-bot-messages');
    if (show) {
      const div = document.createElement('div');
      div.id = 'admin-bot-typing';
      div.className = 'admin-bot-msg bot';
      div.innerHTML = '<div class="admin-bot-bubble typing"><span></span><span></span><span></span></div>';
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    } else {
      const t = document.getElementById('admin-bot-typing');
      if (t) t.remove();
    }
  }
  
  function toggle() {
    init();
    // Solo mostrar si estamos en vista Enlaces
    const enlacesView = document.getElementById('enlaces-view');
    const isEnlaces = enlacesView && !enlacesView.classList.contains('hidden');
    if (!isOpen && !isEnlaces) return;
    isOpen = !isOpen;
    document.getElementById('admin-bot-panel').classList.toggle('hidden', !isOpen);
    document.getElementById('admin-bot-fab').classList.toggle('active', isOpen);
    if (isOpen) document.getElementById('admin-bot-input').focus();
  }

  return { init, toggle, send };
})();

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AdminBot.init());
} else {
  AdminBot.init();
}
