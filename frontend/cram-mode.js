// cram-mode.js — Modo "Examen Mañana": resumen express + mini quiz
(function () {
  'use strict';

  const CRAM_PROMPT = `Sos un tutor experto de la UBA/FIUBA. El estudiante tiene un EXAMEN MAÑANA y necesita un resumen express.

Temática: {TOPIC}

Respondé EXACTAMENTE en este formato (markdown):

## Resumen Express — {TOPIC}

### Conceptos Clave (los más importantes)
- [Enumerá 5-7 puntos críticos que SÍ o SÍ tiene que saber]

### Fórmulas / Definiciones Críticas
- [Las fórmulas o definiciones que más salen en parciales, con ejemplo rápido si aplica]

### Errores Comunes en Parciales
- [3-4 errores típicos que cometen los estudiantes]

### Tips para el Examen
- [Consejos prácticos: qué priorizar, cómo resolver, trucos]

### Mini Quiz (5 preguntas)
Hacé 5 preguntas de opción múltiple sobre lo más importante. Usá este formato JSON exacto:
\`\`\`json
[
  {"q":"pregunta","a":"opción A","b":"opción B","c":"opción C","d":"opción D","correct":"a","exp":"explicación breve"}
]
\`\`\`

Sé conciso. El estudiante tiene poco tiempo.`;

  function openCramMode() {
    const modal = document.getElementById('cram-modal');
    if (modal) modal.classList.add('open');
  }

  function closeCramMode() {
    document.getElementById('cram-modal')?.classList.remove('open');
  }

  async function startCramSession() {
    const input = document.getElementById('cram-topic-input');
    const topic = input?.value.trim();
    if (!topic) {
      alert('Escribí la materia o tema del examen');
      return;
    }

    const chat = window.getActiveChat ? window.getActiveChat() : null;
    if (!chat) return;

    closeCramMode();

    // Enviar como mensaje especial
    const prompt = CRAM_PROMPT.replace(/\{TOPIC\}/g, topic);

    // Guardar mensaje del usuario
    chat.messages.push({ sender: 'user', text: `Modo Examen Mañana: ${topic}` });
    if (chat.messages.length === 1) {
      chat.title = `Examen: ${topic}`;
      if (window.renderChatsList) window.renderChatsList();
    }
    if (window.saveChatsToStorage) window.saveChatsToStorage();
    if (window.appendMessageDOM) {
      window.appendMessageDOM('user', `Modo Examen Mañana: ${topic}`);
    }

    // Mostrar typing
    const history = document.getElementById('chat-history');
    const typingBubble = document.createElement('div');
    typingBubble.className = 'chat-bubble agent';
    typingBubble.id = 'cram-typing';
    typingBubble.innerHTML = `
      <div class="bubble-avatar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg></div>
      <div class="bubble-content" style="display:flex;align-items:center;gap:0.5rem;color:var(--text-muted)">
        <div class="typing-dots"><span></span><span></span><span></span></div>
        Armando tu resumen express...
      </div>
    `;
    history.appendChild(typingBubble);
    history.scrollTop = history.scrollHeight;

    try {
      const userApiKey = (typeof window.getUserGeminiKey === 'function' ? window.getUserGeminiKey() : '');
      const response = await fetch(window.getApiBase ? window.getApiBase() : 'http://localhost:3000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          mode: 'profesor',
          context: '',
          userApiKey
        })
      });

      const data = await response.json();
      typingBubble.remove();

      if (response.ok && data.reply) {
        chat.messages.push({ sender: 'agent', text: data.reply });
        if (window.saveChatsToStorage) window.saveChatsToStorage();
        if (window.appendMessageDOM) {
          window.appendMessageDOM('agent', data.reply, null, { typing: true });
        }
        // Gamificación
        if (window.Gamification) {
          window.Gamification.trackMessage();
          const r = window.Gamification.addXp('chat_message');
          if (window.processGamificationResult) window.processGamificationResult(r);
        }
      } else {
        if (window.appendMessageDOM) {
          window.appendMessageDOM('agent', `⚠️ Error: ${data.error || 'No se pudo generar el resumen'}`);
        }
      }
    } catch (e) {
      typingBubble.remove();
      if (window.appendMessageDOM) {
        window.appendMessageDOM('agent', `❌ No se pudo conectar con el servidor`);
      }
    }
  }

  function initCramMode() {
    const modal = document.getElementById('cram-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="cram-panel">
        <div class="cram-header">
          <div>
            <h3>Modo Examen Mañana</h3>
            <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem">Resumen express + mini quiz para el día anterior al parcial</p>
          </div>
          <button class="cram-close" onclick="closeCramMode()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="cram-body">
          <div class="cram-emoji">📚</div>
          <p style="color:var(--text-secondary);font-size:0.88rem;margin-bottom:1rem">¿Qué materia o tema tenés examen?</p>
          <input type="text" id="cram-topic-input" placeholder="Ej: Álgebra Lineal, Circuitos Eléctricos, Química Inorgánica..." class="cram-input"
            onkeydown="if(event.key==='Enter') startCramSession()">
          <button class="cram-btn" onclick="startCramSession()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Generar Resumen Express
          </button>
          <div class="cram-tips">
            <div class="cram-tip">💡 Tip: cuanto más específico, mejor resultado. "Álgebra Lineal - autovalores" es mejor que solo "Álgebra"</div>
          </div>
        </div>
      </div>
    `;

    document.querySelector('.cram-close')?.addEventListener('click', closeCramMode);
  }

  window.openCramMode = openCramMode;
  window.closeCramMode = closeCramMode;
  window.startCramSession = startCramSession;
  window.initCramMode = initCramMode;
})();
