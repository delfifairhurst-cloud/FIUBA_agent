// changelog.js — Novedades y changelog
(function () {
  'use strict';

  const ENTRIES = [
    {
      version: '1.4.0',
      date: '29 Agosto 2026',
      tag: 'Última actualización',
      changes: [
        { type: 'new', text: 'Timer Pomodoro con sonidos ambientales (lluvia, fuego, olas)' },
        { type: 'new', text: 'Hoja de fórmulas rápida por materia' },
        { type: 'new', text: 'Exportar conversación a PDF' },
        { type: 'new', text: 'Sistema de gamificación: niveles, XP, rachas, logros' },
        { type: 'new', text: 'Modo claro/oscuro con toggle' },
        { type: 'fix', text: 'Chat con memoria — la IA recuerda la conversación' },
        { type: 'fix', text: 'Íconos SVG profesionales en sidebar y chat' },
      ]
    },
    {
      version: '1.3.0',
      date: '25 Agosto 2026',
      changes: [
        { type: 'new', text: 'Modo Examinador — simulacro de parcial con la IA' },
        { type: 'new', text: 'Flashcards con repaso espaciado' },
        { type: 'new', text: 'Evaluaciones con scoring automático' },
        { type: 'new', text: 'Biblioteca de materiales organizada por materia' },
      ]
    },
    {
      version: '1.2.0',
      date: '20 Agosto 2026',
      changes: [
        { type: 'new', text: 'Modo Tutor para resolver ejercicios paso a paso' },
        { type: 'new', text: 'Subida de fotos de ejercicios' },
        { type: 'fix', text: 'Mejor manejo de errores de la API' },
      ]
    },
    {
      version: '1.1.0',
      date: '15 Agosto 2026',
      changes: [
        { type: 'new', text: 'Múltiples conversaciones con historial' },
        { type: 'new', text: 'Modos de chat: Profesor, Tutor, Resolución' },
        { type: 'fix', text: 'Cálculo de tokens optimizado' },
      ]
    },
    {
      version: '1.0.0',
      date: '10 Agosto 2026',
      tag: 'Primer release',
      changes: [
        { type: 'new', text: 'FIUBA Agent — Asistente IA para estudiantes de FIUBA' },
        { type: 'new', text: 'Chat con IA basado en Gemini' },
        { type: 'new', text: 'Subida de documentos y PDFs' },
      ]
    },
  ];

  function openChangelog() {
    const modal = document.getElementById('changelog-modal');
    if (modal) modal.classList.add('open');
    renderChangelog();
  }

  function closeChangelog() {
    document.getElementById('changelog-modal')?.classList.remove('open');
  }

  function renderChangelog() {
    const container = document.getElementById('changelog-entries');
    if (!container) return;

    container.innerHTML = ENTRIES.map(entry => `
      <div class="cl-entry">
        <div class="cl-header">
          <span class="cl-version">v${entry.version}</span>
          ${entry.tag ? `<span class="cl-tag">${entry.tag}</span>` : ''}
          <span class="cl-date">${entry.date}</span>
        </div>
        <div class="cl-changes">
          ${entry.changes.map(c => `
            <div class="cl-change">
              <span class="cl-type cl-type-${c.type}">${c.type === 'new' ? '✨' : c.type === 'fix' ? '🔧' : '📝'}</span>
              <span>${c.text}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function initChangelog() {
    const modal = document.getElementById('changelog-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="cl-panel">
        <div class="cl-header-bar">
          <h3>Novedades</h3>
          <button class="cl-close" onclick="closeChangelog()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="cl-entries" id="changelog-entries"></div>
      </div>
    `;

    document.querySelector('.cl-close')?.addEventListener('click', closeChangelog);
  }

  window.openChangelog = openChangelog;
  window.closeChangelog = closeChangelog;
  window.initChangelog = initChangelog;
})();
