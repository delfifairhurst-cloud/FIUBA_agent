(function () {
  'use strict';

  // ═══ NivMascot — Presencia visual de IA para Nevla ═══
  // SVG abstracto animado con 7 estados, puro CSS/SVG.

  const NIV_COLORS = {
    body: '#c4b5fd',        // lavanda claro
    bodyLight: '#ddd6fe',   // lavanda más claro
    bodyTranslucent: 'rgba(196,181,253,0.85)',
    eye: '#1e1b2e',         // charcoal oscuro
    white: '#faf5ff',       // blanco cálido lavanda
    accent: '#8b5cf6',      // purple accent
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

  function getEyePath(type, cx, cy) {
    switch (type) {
      case 'closed':
        // Línea horizontal - ojos cerrados
        return `<line x1="${cx - 4}" y1="${cy}" x2="${cx + 4}" y2="${cy}" stroke="${NIV_COLORS.eye}" stroke-width="2.2" stroke-linecap="round"/>`;
      case 'happy':
        // Forma de media luna - ojos felices
        return `<path d="M${cx - 4} ${cy + 1} Q${cx} ${cy - 4} ${cx + 4} ${cy + 1}" stroke="${NIV_COLORS.eye}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
      case 'right':
        // Ojos mirando a la derecha
        return `<ellipse cx="${cx + 2}" cy="${cy}" rx="3.2" ry="3.8" fill="${NIV_COLORS.eye}"/>`;
      default: // open
        return `<ellipse cx="${cx}" cy="${cy}" rx="3.2" ry="3.8" fill="${NIV_COLORS.eye}"/>`;
    }
  }

  function createSVG(state, size) {
    const s = STATES[state] || STATES.idle;
    const w = size || 48;
    const h = size || 48;
    const eyeType = s.eyes;

    return `<svg class="niv-svg" width="${w}" height="${h}" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="niv-body-grad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stop-color="${NIV_COLORS.bodyLight}"/>
          <stop offset="100%" stop-color="${NIV_COLORS.body}"/>
        </radialGradient>
        <filter id="niv-shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${NIV_COLORS.accent}" flood-opacity="0.15"/>
        </filter>
      </defs>
      <!-- Blob body -->
      <path d="M24 6 C32 6, 40 12, 42 20 C44 28, 40 38, 34 42 C28 46, 18 46, 12 42 C6 38, 4 28, 6 20 C8 12, 16 6, 24 6Z"
            fill="url(#niv-body-grad)" filter="url(#niv-shadow)" opacity="0.92"/>
      <!-- Subtle highlight -->
      <ellipse cx="18" cy="16" rx="8" ry="5" fill="${NIV_COLORS.white}" opacity="0.25" transform="rotate(-15 18 16)"/>
      <!-- Eyes -->
      ${getEyePath(eyeType, 19, 24)}
      ${getEyePath(eyeType, 29, 24)}
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
    const size = 48;
    host.innerHTML = `
      <div class="niv-container" style="animation:${s.animation}" data-niv-state="${state}">
        ${createSVG(state, size)}
        ${s.extras}
      </div>`;
  }

  function inline(size, state) {
    const s = state || 'idle';
    const sz = size || 32;
    return `<span class="niv-inline" style="display:inline-flex;vertical-align:middle">${createSVG(s, sz)}</span>`;
  }

  window.NivMascot = { render, setState, inline, STATES, createSVG };
})();
