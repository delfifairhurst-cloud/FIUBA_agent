// pomodoro.js — Timer Pomodoro con sonidos ambientales y UI pro
(function () {
  'use strict';

  const POMODORO_KEY = 'fiuba_pomodoro';

  // Configuración
  const PRESETS = {
    classic: { study: 25, short: 5, long: 15, sessions: 4 },
    short: { study: 15, short: 3, long: 10, sessions: 4 },
    long: { study: 50, short: 10, long: 20, sessions: 4 },
    custom: { study: 25, short: 5, long: 15, sessions: 4 },
  };

  // Sonidos generados con Web Audio API (sin archivos externos)
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  // Sin melodías — solo notificaciones del navegador
  function playStartSound() {}
  function playBreakSound() {}
  function playCompleteSound() {}

  // Ambient sounds con Web Audio — sonidos distintos y reconocibles
  let ambientNodes = [];
  let ambientGain = null;
  let ambientInterval = null;

  function startAmbient(type) {
    stopAmbient();
    try {
      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') ctx.resume();
      ambientGain = ctx.createGain();
      ambientGain.gain.value = 0.12;
      ambientGain.connect(ctx.destination);

      if (type === 'rain') {
        // Lluvia: ruido blanco filtrado + gotas de ruido (sin tonos)
        const bufLen = 2 * ctx.sampleRate;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 3000;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass'; hp.frequency.value = 400;
        src.connect(lp); lp.connect(hp); hp.connect(ambientGain);
        src.start();
        ambientNodes.push(src);
        // Capa extra: ruido suave para densidad
        const buf2 = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const d2 = buf2.getChannelData(0);
        for (let i = 0; i < bufLen; i++) d2[i] = Math.random() * 2 - 1;
        const src2 = ctx.createBufferSource();
        src2.buffer = buf2; src2.loop = true;
        const lp2 = ctx.createBiquadFilter();
        lp2.type = 'lowpass'; lp2.frequency.value = 1500;
        const g2 = ctx.createGain();
        g2.gain.value = 0.4;
        src2.connect(lp2); lp2.connect(g2); g2.connect(ambientGain);
        src2.start();
        ambientNodes.push(src2);
        // Gotas: mini-ráfagas de ruido (no tonales)
        function drip() {
          if (!ambientGain) return;
          const dripBuf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
          const dd = dripBuf.getChannelData(0);
          for (let i = 0; i < dd.length; i++) dd[i] = (Math.random() * 2 - 1) * (1 - i / dd.length);
          const ds = ctx.createBufferSource();
          ds.buffer = dripBuf;
          const dg = ctx.createGain();
          dg.gain.setValueAtTime(0.04, ctx.currentTime);
          dg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
          const df = ctx.createBiquadFilter();
          df.type = 'bandpass'; df.frequency.value = 3000 + Math.random() * 2000; df.Q.value = 1;
          ds.connect(df); df.connect(dg); dg.connect(ctx.destination);
          ds.start();
          setTimeout(drip, 80 + Math.random() * 350);
        }
        drip();

      } else if (type === 'fire') {
        // Fuego: ruido marrón + crepitidos de ruido (no tonales)
        const bufLen = 2 * ctx.sampleRate;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < bufLen; i++) {
          const white = Math.random() * 2 - 1;
          d[i] = (last + 0.02 * white) / 1.02;
          last = d[i];
          d[i] *= 3.5;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 600;
        src.connect(lp); lp.connect(ambientGain);
        src.start();
        ambientNodes.push(src);
        // Crepitidos: mini-ráfagas de ruido
        function crackle() {
          if (!ambientGain) return;
          const cBuf = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
          const cd = cBuf.getChannelData(0);
          for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * (1 - i / cd.length);
          const cs = ctx.createBufferSource();
          cs.buffer = cBuf;
          const cg = ctx.createGain();
          cg.gain.setValueAtTime(0.05, ctx.currentTime);
          cg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
          cs.connect(cg); cg.connect(ctx.destination);
          cs.start();
          setTimeout(crackle, 40 + Math.random() * 200);
        }
        crackle();

      } else if (type === 'waves') {
        // Olas: ruido filtrado con volumen que sube y baja
        const bufLen = 4 * ctx.sampleRate;
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.3;
        src.connect(bp);
        // LFO para volumen = oleaje
        const volLfo = ctx.createOscillator();
        volLfo.type = 'sine'; volLfo.frequency.value = 0.08;
        const volG = ctx.createGain();
        volG.gain.value = 0.08;
        volLfo.connect(volG); volG.connect(ambientGain.gain);
        // LFO para frecuencia = cambio tonal
        const freqLfo = ctx.createOscillator();
        freqLfo.type = 'sine'; freqLfo.frequency.value = 0.12;
        const freqG = ctx.createGain();
        freqG.gain.value = 200;
        freqLfo.connect(freqG); freqG.connect(bp.frequency);
        bp.connect(ambientGain);
        src.start(); volLfo.start(); freqLfo.start();
        ambientNodes.push(src, volLfo, freqLfo);
      }
    } catch (e) { console.warn('Ambient sound error:', e); }
  }

  function stopAmbient() {
    ambientNodes.forEach(n => { try { n.stop(); } catch {} });
    ambientNodes = [];
    if (ambientGain) { ambientGain.disconnect(); ambientGain = null; }
    if (ambientInterval) { clearInterval(ambientInterval); ambientInterval = null; }
  }

  // Estado
  let state = loadState();
  let interval = null;
  let running = false;

  function defaultState() {
    return {
      preset: 'classic',
      studyMin: 25,
      shortMin: 5,
      longMin: 15,
      sessionsBeforeLong: 4,
      currentSession: 0,
      isStudy: true,
      isBreak: false,
      timeLeft: 25 * 60,
      totalTime: 25 * 60,
      completedPomodoros: 0,
      totalStudyMinutes: 0,
      ambient: 'none',
      autoStart: true,
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(POMODORO_KEY);
      if (!raw) return defaultState();
      return { ...defaultState(), ...JSON.parse(raw) };
    } catch { return defaultState(); }
  }

  function saveState() {
    try { localStorage.setItem(POMODORO_KEY, JSON.stringify(state)); } catch {}
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  // Render
  function render() {
    const container = document.getElementById('pomodoro-panel');
    if (!container || !container.classList.contains('open')) return;

    const pct = state.totalTime > 0 ? ((state.totalTime - state.timeLeft) / state.totalTime) * 100 : 0;
    const progress = document.getElementById('pomodoro-progress-circle');
    if (progress) {
      const circumference = 2 * Math.PI * 54;
      progress.style.strokeDasharray = circumference;
      progress.style.strokeDashoffset = circumference - (pct / 100) * circumference;
    }

    const timeEl = document.getElementById('pomodoro-time');
    if (timeEl) timeEl.textContent = formatTime(state.timeLeft);

    const labelEl = document.getElementById('pomodoro-label');
    if (labelEl) {
      if (state.isStudy) labelEl.textContent = 'Tiempo de estudio';
      else if (state.isBreak) labelEl.textContent = 'Descansá';
      else labelEl.textContent = 'Listo para empezar';
    }

    const sessionEl = document.getElementById('pomodoro-sessions');
    if (sessionEl) {
      const dots = [];
      for (let i = 0; i < state.sessionsBeforeLong; i++) {
        dots.push(`<div class="pom-session-dot ${i < state.completedPomodoros ? 'completed' : ''}"></div>`);
      }
      sessionEl.innerHTML = dots.join('');
    }

    // Botones
    const startBtn = document.getElementById('pomodoro-start');
    const resetBtn = document.getElementById('pomodoro-reset');
    if (startBtn) startBtn.textContent = running ? 'Pausar' : 'Iniciar';
    if (resetBtn) resetBtn.style.display = running || state.timeLeft < state.totalTime ? '' : 'none';

    // Color del círculo
    const circle = document.getElementById('pomodoro-progress-circle');
    if (circle) {
      if (state.isStudy) circle.style.stroke = '#3b82f6';
      else circle.style.stroke = '#22c55e';
    }

    // Stats
    const statsEl = document.getElementById('pomodoro-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="pom-stat"><span class="pom-stat-num">${state.completedPomodoros}</span><span class="pom-stat-label">Pomodoros</span></div>
        <div class="pom-stat"><span class="pom-stat-num">${state.totalStudyMinutes}m</span><span class="pom-stat-label">Estudiados</span></div>
      `;
    }
  }

  // Timer logic
  function tick() {
    if (state.timeLeft <= 0) {
      clearInterval(interval);
      interval = null;
      running = false;

      if (state.isStudy) {
        state.completedPomodoros++;
        state.totalStudyMinutes += state.studyMin;
        playBreakSound();

        // Notificación
        if (Notification.permission === 'granted') {
          new Notification('FIUBA Agent - Pomodoro', { body: '¡Tiempo de descansar! Tomate 5 minutitos.', icon: 'icon-192.png' });
        }

        // ¿Toca descanso largo?
        if (state.completedPomodoros % state.sessionsBeforeLong === 0) {
          state.timeLeft = state.longMin * 60;
          state.totalTime = state.longMin * 60;
        } else {
          state.timeLeft = state.shortMin * 60;
          state.totalTime = state.shortMin * 60;
        }
        state.isStudy = false;
        state.isBreak = true;
      } else {
        playStartSound();
        if (Notification.permission === 'granted') {
          new Notification('FIUBA Agent - Pomodoro', { body: '¡Descanso terminado! A estudiar.', icon: 'icon-192.png' });
        }
        state.timeLeft = state.studyMin * 60;
        state.totalTime = state.studyMin * 60;
        state.isStudy = true;
        state.isBreak = false;
      }

      saveState();
      render();

      // Auto-start
      if (state.autoStart) {
        setTimeout(() => startTimer(), 1500);
      }
      return;
    }

    state.timeLeft--;
    saveState();
    render();
  }

  function startTimer() {
    if (running) {
      clearInterval(interval);
      interval = null;
      running = false;
      stopAmbient();
      render();
      return;
    }

    if (state.timeLeft <= 0) {
      state.timeLeft = state.studyMin * 60;
      state.totalTime = state.studyMin * 60;
      state.isStudy = true;
      state.isBreak = false;
    }

    running = true;
    playStartSound();

    // Pedir permiso notificaciones
    if (Notification.permission === 'default') Notification.requestPermission();

    // Ambient sound
    if (state.ambient !== 'none') startAmbient(state.ambient);

    interval = setInterval(tick, 1000);
    render();
  }

  function resetTimer() {
    clearInterval(interval);
    interval = null;
    running = false;
    stopAmbient();
    state.timeLeft = state.studyMin * 60;
    state.totalTime = state.studyMin * 60;
    state.isStudy = true;
    state.isBreak = false;
    saveState();
    render();
  }

  function setPreset(preset) {
    if (PRESETS[preset]) {
      state.preset = preset;
      state.studyMin = PRESETS[preset].study;
      state.shortMin = PRESETS[preset].short;
      state.longMin = PRESETS[preset].long;
      state.sessionsBeforeLong = PRESETS[preset].sessions;
      resetTimer();
    }
  }

  function setAmbient(type) {
    state.ambient = type;
    saveState();
    if (running) {
      if (type === 'none') stopAmbient();
      else startAmbient(type);
    }
  }

  // Panel toggle
  function togglePomodoro() {
    const panel = document.getElementById('pomodoro-panel');
    const overlay = document.getElementById('pomodoro-overlay');
    if (!panel) return;
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      panel.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    } else {
      panel.classList.add('open');
      if (overlay) overlay.classList.add('open');
      render();
    }
  }

  function initPomodoro() {
    const panel = document.getElementById('pomodoro-panel');
    if (!panel) return;

    panel.innerHTML = `
      <div class="pom-header">
        <h3>Pomodoro</h3>
        <button class="pom-close" id="pomodoro-close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="pom-timer-area">
        <svg class="pom-circle-svg" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" class="pom-circle-bg"/>
          <circle cx="60" cy="60" r="54" id="pomodoro-progress-circle" class="pom-circle-progress"/>
        </svg>
        <div class="pom-time" id="pomodoro-time">25:00</div>
        <div class="pom-label" id="pomodoro-label">Listo para empezar</div>
        <div class="pom-sessions" id="pomodoro-sessions"></div>
      </div>

      <div class="pom-controls">
        <button class="pom-btn pom-btn-primary" id="pomodoro-start">Iniciar</button>
        <button class="pom-btn pom-btn-secondary" id="pomodoro-reset" style="display:none">Reiniciar</button>
      </div>

      <div class="pom-section">
        <div class="pom-section-title">Ritmo</div>
        <div class="pom-presets">
          <button class="pom-preset active" data-preset="classic">25/5</button>
          <button class="pom-preset" data-preset="short">15/3</button>
          <button class="pom-preset" data-preset="long">50/10</button>
        </div>
      </div>

      <div class="pom-section">
        <div class="pom-section-title">Sonido ambiental</div>
        <div class="pom-ambient-btns">
          <button class="pom-ambient active" data-ambient="none">Sin sonido</button>
          <button class="pom-ambient" data-ambient="rain">Lluvia</button>
          <button class="pom-ambient" data-ambient="fire">Fuego</button>
          <button class="pom-ambient" data-ambient="waves">Olas</button>
        </div>
      </div>

      <div class="pom-stats" id="pomodoro-stats"></div>
    `;

    // Event listeners
    document.getElementById('pomodoro-close')?.addEventListener('click', togglePomodoro);
    document.getElementById('pomodoro-start')?.addEventListener('click', startTimer);
    document.getElementById('pomodoro-reset')?.addEventListener('click', resetTimer);

    document.querySelectorAll('.pom-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pom-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setPreset(btn.dataset.preset);
      });
    });

    document.querySelectorAll('.pom-ambient').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pom-ambient').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setAmbient(btn.dataset.ambient);
      });
    });

    // Restore active states
    document.querySelector(`.pom-preset[data-preset="${state.preset}"]`)?.classList.add('active');
    document.querySelector(`.pom-ambient[data-ambient="${state.ambient}"]`)?.classList.add('active');

    render();
  }

  window.togglePomodoro = togglePomodoro;
  window.initPomodoro = initPomodoro;
})();
