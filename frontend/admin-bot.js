window.AdminBot = (() => {
  let isOpen = false;
  const btnId = 'admin-bot-fab';
  const panelId = 'admin-bot-panel';
  const messagesId = 'admin-bot-messages';
  const inputId = 'admin-bot-input';
  
  const html = `
    <div class="admin-bot-overlay hidden" id="admin-bot-overlay"></div>
    <div id="${panelId}" class="admin-bot-panel hidden">
      <div class="admin-bot-header">
        <div class="admin-bot-avatar" id="admin-niv-avatar"></div>
        <div style="flex:1;min-width:0">
          <div class="admin-bot-title">niv</div>
          <div class="admin-bot-subtitle">Trámites, parciales, inscripciones</div>
        </div>
        <button class="admin-bot-close" id="admin-bot-close-btn" title="Cerrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="admin-bot-messages" id="${messagesId}">
        <div class="admin-bot-msg bot">
          <div class="admin-bot-bubble">Hola, soy <strong>niv</strong>. Preguntame sobre fechas de parciales, inscripciones, trámites UBA o links oficiales.</div>
        </div>
      </div>
      <div class="admin-bot-input-wrap">
        <input type="text" id="${inputId}" placeholder="Ej: Cuándo es el parcial de Álgebra?">
        <button id="admin-bot-send-btn" title="Enviar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
    <button id="${btnId}" class="admin-bot-fab" title="niv — Trámites y parciales">
      <span id="admin-fab-niv"></span>
      <span class="admin-bot-dot"></span>
    </button>
  `;
  
  const CONTEXT = `Sos el Asistente Administrativo de niv. Respondé SOLO preguntas administrativas sobre:
- Fechas de parciales/finales (UBA/CBC)
- Inscripciones (SIU Guarani, fechas, requisitos)
- Horarios de cursada, mesas de examen
- Links oficiales: guarani, campus, uba.ar, cbc.uba.ar, fi.uba.ar
- Tramites: certificado alumno regular, libreta, equivalencias
- Contactos: secretarias, departamentales, centros de estudiantes

NO respondas: dudas academicas, resolución de ejercicios, teoria.
Si no sabes, dice: "No tengo esa info, consultá en [link oficial]".`;
  
  function init() {
    if (document.getElementById(btnId)) return;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById(btnId).addEventListener('click', toggle);
    document.getElementById('admin-bot-close-btn').addEventListener('click', toggle);
    document.getElementById('admin-bot-overlay').addEventListener('click', toggle);
    document.getElementById('admin-bot-send-btn').addEventListener('click', send);
    document.getElementById(inputId).addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    
    if (window.NivMascot) {
      var avatarEl = document.getElementById('admin-niv-avatar');
      var fabEl = document.getElementById('admin-fab-niv');
      if (avatarEl) avatarEl.innerHTML = NivMascot.avatar(24);
      if (fabEl) fabEl.innerHTML = NivMascot.avatar(20);
    }
  }
  
  async function send() {
    const input = document.getElementById(inputId);
    const text = input.value.trim();
    if (!text) return;
    
    addMessage('user', text);
    input.value = '';
    showTyping(true);
    
    const apiBase = window.getApiBase ? window.getApiBase() : 'https://fiuba-agent-backend-1.onrender.com';
    const userApiKey = (window.getUserGeminiKey ? window.getUserGeminiKey() : (localStorage.getItem('fiuba_gemini_key')||'')).trim();
    
    try {
      const response = await fetch(apiBase + '/api/admin-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, context: CONTEXT, userApiKey })
      });
      const data = await response.json();
      showTyping(false);
      addMessage('bot', data.answer || data.reply || 'No pude procesar tu pregunta.');
    } catch(e) {
      showTyping(false);
      addMessage('bot', 'El backend se está despertando... reintentá en unos segundos.');
    }
  }
  
  function addMessage(role, text) {
    const container = document.getElementById(messagesId);
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'admin-bot-msg ' + role;
    const bubble = document.createElement('div');
    bubble.className = 'admin-bot-bubble';
    bubble.textContent = text;
    div.appendChild(bubble);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }
  
  function showTyping(show) {
    const container = document.getElementById(messagesId);
    if (!container) return;
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
    isOpen = !isOpen;
    document.getElementById(panelId).classList.toggle('hidden', !isOpen);
    document.getElementById('admin-bot-overlay').classList.toggle('hidden', !isOpen);
    document.getElementById(btnId).classList.toggle('active', isOpen);
    if (isOpen) document.getElementById(inputId).focus();
  }

  return { init, toggle, send };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AdminBot.init());
} else {
  AdminBot.init();
}
