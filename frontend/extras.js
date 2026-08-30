// extras.js — Compartir, Onboarding, Tips, Atajos de teclado
(function () {
  'use strict';

  // === COMPARTIR CHAT ===
  function shareChat() {
    const chat = window.getActiveChat ? window.getActiveChat() : null;
    if (!chat || !chat.messages || chat.messages.length === 0) {
      alert('No hay nada para compartir.');
      return;
    }
    const text = `Mira lo que hice con FIUBA Agent — ${chat.title}\n\n${chat.messages[chat.messages.length - 1]?.text?.slice(0, 200) || ''}...\n\nProbalo gratis: https://agente-fiuba.web.app`;
    if (navigator.share) {
      navigator.share({ title: 'FIUBA Agent', text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast('Link copiado al portapapeles');
    }
  }

  // === TOAST HELPER ===
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-primary);padding:0.6rem 1.2rem;border-radius:10px;font-size:0.85rem;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.15);opacity:0;transition:opacity 0.3s';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, 2500);
  }

  // === ONBOARDING ===
  function showOnboarding() {
    if (localStorage.getItem('fiuba_onboarded')) return;
    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.innerHTML = `
      <div class="onboarding-card">
        <div class="onboarding-icon">🎓</div>
        <h2>Bienvenido a FIUBA Agent</h2>
        <p>Tu asistente IA para estudiar en Ingeniería UBA. Acá te explicamos rápido:</p>
        <div class="onboarding-steps">
          <div class="onb-step">
            <div class="onb-step-num">1</div>
            <div><strong>Elegí un modo</strong><br><span>Profesor explica, Tutor resuelve, Examinador simula parciales</span></div>
          </div>
          <div class="onb-step">
            <div class="onb-step-num">2</div>
            <div><strong>Subí material</strong><br><span>Fotos de ejercicios, PDFs, apuntes — la IA los usa para responder mejor</span></div>
          </div>
          <div class="onb-step">
            <div class="onb-step-num">3</div>
            <div><strong>Ganá XP</strong><br><span>Cada interacción te da puntos. Subí de nivel y desbloqueá logros</span></div>
          </div>
        </div>
        <button class="onb-btn" onclick="this.closest('.onboarding-overlay').remove();localStorage.setItem('fiuba_onboarded','1')">¡Empezar!</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // === TIPS FLOTANTES ===
  const TIPS = [
    '💡 Subí una foto de un ejercicio y la IA lo resuelve paso a paso',
    '💡 En modo Examinador podés practicar como si fuera un parcial',
    '💡 Cargá tus PDFs en Biblioteca y preguntá sobre el contenido',
    '💡 Usá el Timer Pomodoro para estudiar con técnica espaciada',
    '💡 Repasá flashcards todos los días para subir de nivel',
    '💡 Exportá tus conversaciones como PDF para repasar después',
    '💡 La hoja de fórmulas está en el menú — click para copiar',
    '💡 Modo Tutor te da hints sin la respuesta directa',
  ];

  let tipIdx = 0;
  function showTip() {
    if (localStorage.getItem('fiuba_onboarded')) return;
    const chat = document.getElementById('chat-history');
    if (!chat || chat.children.length > 2) return;
    const tip = TIPS[tipIdx % TIPS.length];
    tipIdx++;
    const el = document.createElement('div');
    el.style.cssText = 'text-align:center;padding:0.6rem;font-size:0.8rem;color:var(--text-muted);opacity:0.7;font-style:italic;animation:fadeIn 0.5s ease';
    el.textContent = tip;
    chat.appendChild(el);
  }

  // === ATAJOS DE TECLADO ===
  function initShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Ctrl+N: Nuevo chat
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        if (window.newChat) window.newChat();
      }
      // Ctrl+1/2/3/4: Cambiar modo
      if (e.ctrlKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const modes = ['profesor', 'tutor', 'examinador', 'resolucion'];
        const mode = modes[parseInt(e.key) - 1];
        if (mode && window.setChatMode) window.setChatMode(mode);
      }
      // Ctrl+P: Pomodoro
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        if (window.togglePomodoro) window.togglePomodoro();
      }
      // Ctrl+F: Fórmulas
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        if (window.openFormulas) window.openFormulas();
      }
      // Escape: cerrar paneles
      if (e.key === 'Escape') {
        document.querySelectorAll('.pom-panel.open, .formulas-modal.open, .cl-modal.open').forEach(el => el.classList.remove('open'));
        document.querySelectorAll('.pom-overlay.open, .onboarding-overlay').forEach(el => el.classList.remove('open'));
      }
    });
  }

  // Expose
  window.shareChat = shareChat;
  window.showOnboarding = showOnboarding;
  window.showTip = showTip;
  window.initShortcuts = initShortcuts;
  window.showToast = showToast;
})();
