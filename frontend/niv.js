(function () {
  'use strict';

  // ═══ NivMascot — Presencia visual de IA para Nevla ═══
  // SVG orgánico animado con 7 estados, puro CSS/SVG.
  // Forma: blob fluido/glossy inspirado en el prototipo.

  let _uid = 0;
  function uid() { return 'niv-' + (++_uid); }

  const NIV_COLORS = {
    body: '#c4b5fd',
    bodyDark: '#a78bfa',
    bodyLight: '#e0d4fe',
    highlight: '#f5f0ff',
    eye: '#1e1b2e',
    accent: '#8b5cf6',
  };

  const STATES = {
    idle: {
      animation: 'niv-float 3s ease-in-out infinite',
      eyes: 'open',
      extras: '',
    },
    thinking: {
      animation: 'niv-think 1.8s ease-in-out infinite',
      eyes: 'open',
      extras: '<div class="niv-think-dots"><span></span><span></span><span></span></div>',
    },
    searching: {
      animation: 'niv-look-right 2s ease-in-out infinite',
      eyes: 'right',
      extras: '<svg class="niv-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>',
    },
    explaining: {
      animation: 'niv-explain 2.5s ease-in-out infinite',
      eyes: 'open',
      extras: '',
    },
    success: {
      animation: 'niv-bounce 0.6s ease-in-out 2',
      eyes: 'happy',
      extras: '<svg class="niv-sparkle" width="10" height="10" viewBox="0 0 24 24" fill="#8b5cf6"><polygon points="12,2 15,10 24,10 17,15 19,24 12,18 5,24 7,15 0,10 9,10"/></svg>',
    },
    organizing: {
      animation: 'niv-float 3s ease-in-out infinite',
      eyes: 'open',
      extras: '<div class="niv-cards"><div class="niv-card c1"></div><div class="niv-card c2"></div><div class="niv-card c3"></div></div>',
    },
    resting: {
      animation: 'niv-breathe 4s ease-in-out infinite',
      eyes: 'closed',
      extras: '',
    },
  };

  function getEyes(type, id) {
    const base = { cx: 20, cy: 23 };
    const cx2 = 30;
    switch (type) {
      case 'closed':
        return `
          <line x1="${base.cx - 3.5}" y1="${base.cy}" x2="${base.cx + 3.5}" y2="${base.cy}" stroke="${NIV_COLORS.eye}" stroke-width="2" stroke-linecap="round"/>
          <line x1="${cx2 - 3.5}" y1="${base.cy}" x2="${cx2 + 3.5}" y2="${base.cy}" stroke="${NIV_COLORS.eye}" stroke-width="2" stroke-linecap="round"/>`;
      case 'happy':
        return `
          <path d="M${base.cx - 3.5} ${base.cy + 1.5} Q${base.cx} ${base.cy - 3.5} ${base.cx + 3.5} ${base.cy + 1.5}" stroke="${NIV_COLORS.eye}" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M${cx2 - 3.5} ${base.cy + 1.5} Q${cx2} ${base.cy - 3.5} ${cx2 + 3.5} ${base.cy + 1.5}" stroke="${NIV_COLORS.eye}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
      case 'right':
        return `
          <ellipse cx="${base.cx + 2}" cy="${base.cy}" rx="3" ry="3.8" fill="${NIV_COLORS.eye}"/>
          <ellipse cx="${cx2 + 2}" cy="${base.cy}" rx="3" ry="3.8" fill="${NIV_COLORS.eye}"/>`;
      default: // open
        return `
          <ellipse cx="${base.cx}" cy="${base.cy}" rx="3" ry="3.8" fill="${NIV_COLORS.eye}"/>
          <ellipse cx="${cx2}" cy="${base.cy}" rx="3" ry="3.8" fill="${NIV_COLORS.eye}"/>`;
    }
  }

  function createSVG(state, size) {
    const s = STATES[state] || STATES.idle;
    const w = size || 48;
    const h = size || 48;
    const id = uid();
    const eyeType = s.eyes;

    return `<svg class="niv-svg" width="${w}" height="${h}" viewBox="0 0 60 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg-${id}" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stop-color="${NIV_COLORS.bodyLight}"/>
          <stop offset="50%" stop-color="${NIV_COLORS.body}"/>
          <stop offset="100%" stop-color="${NIV_COLORS.bodyDark}"/>
        </radialGradient>
        <radialGradient id="hl-${id}" cx="35%" cy="25%" r="40%">
          <stop offset="0%" stop-color="${NIV_COLORS.highlight}" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="${NIV_COLORS.highlight}" stop-opacity="0"/>
        </radialGradient>
        <filter id="sh-${id}" x="-15%" y="-10%" width="135%" height="135%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${NIV_COLORS.accent}" flood-opacity="0.18"/>
        </filter>
      </defs>

      <!-- Main blob body — organic, asymmetric shape -->
      <path d="
        M28 4
        C36 4, 44 8, 48 16
        C52 22, 50 30, 46 36
        C44 40, 42 44, 36 48
        C32 50, 24 52, 18 48
        C12 44, 6 38, 5 30
        C4 22, 6 14, 12 9
        C16 6, 22 4, 28 4Z
      " fill="url(#bg-${id})" filter="url(#sh-${id})"/>

      <!-- Protrusion / tail blob -->
      <ellipse cx="46" cy="20" rx="9" ry="7" fill="${NIV_COLORS.body}" opacity="0.6" transform="rotate(-12 46 20)"/>
      <ellipse cx="46" cy="20" rx="7" ry="5" fill="${NIV_COLORS.bodyLight}" opacity="0.3" transform="rotate(-12 46 20)"/>

      <!-- Glossy highlight top-left -->
      <ellipse cx="22" cy="14" rx="12" ry="7" fill="url(#hl-${id})" transform="rotate(-18 22 14)"/>

      <!-- Small secondary highlight -->
      <ellipse cx="38" cy="12" rx="4" ry="3" fill="${NIV_COLORS.highlight}" opacity="0.35" transform="rotate(10 38 12)"/>

      <!-- Eyes -->
      ${getEyes(eyeType, id)}
    </svg>`;
  }

  function render(targetId, options) {
    const el = document.getElementById(targetId);
    if (!el) return null;

    const state = (options && options.state) || 'idle';
    const size = (options && options.size) || 48;
    const s = STATES[state] || STATES.idle;

    el.innerHTML = `
      <div class="niv-container" style="animation:${s.animation}" data-niv-state="${state}">
        ${createSVG(state, size)}
        ${s.extras}
      </div>`;
    el.classList.add('niv-host');
    return el.querySelector('.niv-container');
  }

  function setState(targetId, state) {
    const host = document.getElementById(targetId);
    if (!host) return;
    const s = STATES[state] || STATES.idle;
    host.innerHTML = `
      <div class="niv-container" style="animation:${s.animation}" data-niv-state="${state}">
        ${createSVG(state, 48)}
        ${s.extras}
      </div>`;
  }

  function inline(size, state) {
    const s = state || 'idle';
    const sz = size || 32;
    return `<span class="niv-inline" style="display:inline-flex;vertical-align:middle">${createSVG(s, sz)}</span>`;
  }

  // Avatar for chat bubbles — returns HTML string for the agent avatar
  function avatar(size) {
    const sz = size || 22;
    return `<span class="niv-avatar-wrap" style="display:inline-flex">${createSVG('idle', sz)}</span>`;
  }

  // ═══ Contextual tips per tool/feature ═══
  const NIV_TIPS = {
    'evaluaciones': {
      text: 'Cargá las fechas de tus parciales y Niv te arma un plan de estudio.',
      question: '¿Cómo organizo mis parciales para estudiar mejor?',
    },
    'gpa': {
      text: 'Cargá tus materias aprobadas y Niv calcula tu promedio ponderado.',
      question: '¿Cómo calculo mi promedio ponderado en FIUBA?',
    },
    'correlativas': {
      text: 'Niv conoce todas las correlativas de FIUBA. Hacé click en una materia para ver sus requisitos.',
      question: '¿Cuáles son las correlativas de Analisis Matemático 2?',
    },
    'flashcards': {
      text: 'Generá flashcards con Niv o cargá las tuyas. La repetición espaciada es la clave.',
      question: '¿Cómo uso las flashcards para estudiar más eficiente?',
    },
    'schedule': {
      text: 'Organizá tu semana y Niv te sugiere cuándo estudiar cada materia.',
      question: '¿Cómo armo un cronograma de estudio para los parciales?',
    },
    'reference': {
      text: 'Fórmulas de matemática, física y más. Copialas al toque.',
      question: '¿Cuáles son las fórmulas de derivadas e integrales más importantes?',
    },
    'challenge': {
      text: 'Desafío relámpago: respondé preguntas contra el tiempo y subí de nivel.',
      question: '¿Cómo funciona el desafío de estudio y cómo puedo mejorar mi puntaje?',
    },
    'fiuble': {
      text: 'FIUBLE: el Wordle matemático. Adiviná la ecación en 6 intentos.',
      question: '¿Qué es FIUBLE y cómo se juega?',
    },
    'playground': {
      text: 'Escribí código en Python, JavaScript o C directamente en el navegador.',
      question: '¿Cómo uso el playground de código para practicar?',
    },
    'graphcalc': {
      text: 'Graficá cualquier función f(x). Podés poner varias para comparar.',
      question: '¿Cómo grafico una función en el calculador gráfico?',
    },
    'unitconv': {
      text: 'Convertí entre unidades de longitud, masa, tiempo y más.',
      question: '¿Cómo convierto entre sistemas de unidades?',
    },
    'materias-ai': {
      text: 'Preguntale a Niv sobre cualquier materia de FIUBA: programación, profesores, parciales.',
      question: 'Contame sobre la materia Algoritmos y Programación I',
    },
    'periodic': {
      text: 'Tabla periódica interactiva. Hacé click en un elemento para ver sus datos.',
      question: '¿Cuáles son los elementos más importantes para química en FIUBA?',
    },
    'herramientas': {
      text: 'Todas las herramientas de niv en un solo lugar. Elegí la que necesites.',
      question: '¿Qué herramientas tiene niv para ayudarme a estudiar?',
    },
    'biblioteca': {
      text: 'Resúmenes y parciales organizados por materia. Elegí una materia para empezar.',
      question: '¿Qué materiales de estudio tengo disponibles en la biblioteca?',
    },
  };

  function showNivTip(viewId) {
    const tip = NIV_TIPS[viewId];
    if (!tip) return;

    // Find the view panel
    const panel = document.getElementById(viewId + '-view') || document.getElementById(viewId);
    if (!panel) return;

    // Find or create tip container
    let tipEl = panel.querySelector('.niv-tip-card');
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'niv-tip-card';
      // Insert after the first child (usually the wrapper div with max-width)
      const wrapper = panel.querySelector('div[style*="max-width"]') || panel.firstElementChild;
      if (wrapper && wrapper.firstChild) {
        wrapper.insertBefore(tipEl, wrapper.firstChild);
      } else {
        panel.prepend(tipEl);
      }
    }

    const questionAttr = tip.question ? tip.question.replace(/'/g, "\\'").replace(/"/g, '&quot;') : '';

    tipEl.innerHTML = `
      <div class="niv-tip-inner">
        <div class="niv-tip-avatar">${createSVG('idle', 28)}</div>
        <div class="niv-tip-text">
          <span class="niv-tip-msg">${tip.text}</span>
        </div>
        ${tip.question ? `<button class="niv-tip-chat-btn" onclick="NivMascot.askFromTip('${questionAttr}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Preguntale a Niv
        </button>` : ''}
      </div>`;
  }

  function askFromTip(question) {
    // Open chat overlay and pre-fill the question
    if (window.openChatOverlay) openChatOverlay();
    setTimeout(function() {
      const input = document.getElementById('overlay-chat-input');
      if (input) {
        input.value = question;
        input.focus();
      }
    }, 400);
  }

  window.NivMascot = { render, setState, inline, avatar, STATES, createSVG, showNivTip, askFromTip };
})();
