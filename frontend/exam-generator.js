// exam-generator.js — Generador de parciales desde PDF o por tema
(function () {
  'use strict';

  let initialized = false;

  function openExamGen() {
    if (!initialized) { initExamGen(); initialized = true; }
    const modal = document.getElementById('examgen-modal');
    if (modal) { modal.classList.add('open'); modal.style.display = 'flex'; }
    // Populate document selector
    const select = document.getElementById('examgen-doc-select');
    if (select) {
      const chat = window.getActiveChat ? window.getActiveChat() : null;
      const docs = chat?.loadedDocuments || [];
      if (docs.length === 0) {
        select.innerHTML = '<option value="">— Opcional: elegí un PDF como base —</option>';
      } else {
        select.innerHTML = '<option value="">— Solo por tema (sin PDF) —</option>' +
          docs.map((d, i) => `<option value="${i}">📄 ${d.filename}</option>`).join("");
      }
    }
  }

  function closeExamGen() {
    document.getElementById('examgen-modal')?.classList.remove('open');
  }

  async function generateExam() {
    const topicInput = document.getElementById('examgen-topic');
    const countSelect = document.getElementById('examgen-count');
    const diffSelect = document.getElementById('examgen-diff');
    const docSelect = document.getElementById('examgen-doc-select');
    const topic = topicInput?.value.trim();
    const count = countSelect?.value || '5';
    const diff = diffSelect?.value || 'media';

    if (!topic) {
      alert('Escribí la materia o tema');
      return;
    }

    // Get document context if selected
    let docContext = '';
    if (docSelect && docSelect.value !== '') {
      const chat = window.getActiveChat ? window.getActiveChat() : null;
      const docs = chat?.loadedDocuments || [];
      const doc = docs[parseInt(docSelect.value)];
      if (doc && doc.text) {
        docContext = `\n\nMATERIAL DEL USUARIO (usá esto como base para las preguntas):\n---\n${doc.text.substring(0, 6000)}\n---`;
      }
    }

    const resultEl = document.getElementById('examgen-result');
    if (!resultEl) return;

    resultEl.innerHTML = `
      <div class="examgen-loading">
        <div class="typing-dots"><span></span><span></span><span></span></div>
        Generando parcial...
      </div>
    `;

    const diffLabel = { baja: 'básico/fácil', media: 'intermedio', alta: 'difícil/avanzado' };
    const prompt = `Sos un profesor de la UBA/FIUBA. Generá un parcial de ${count} preguntas.

Materia/Tema: ${topic}
Dificultad: ${diffLabel[diff] || 'intermedio'}

FORMATO OBLIGATORIO (JSON):
\`\`\`json
{
  "title": "Parcial: ${topic}",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "text": "Enunciado de la pregunta",
      "options": {"a": "Opción A", "b": "Opción B", "c": "Opción C", "d": "Opción D"},
      "correct": "a",
      "explanation": "Explicación de la respuesta correcta"
    },
    {
      "id": 2,
      "type": "open",
      "text": "Enunciado de pregunta abierta",
      "correct": "Respuesta esperada breve",
      "explanation": "Explicación"
    }
  ]
}
\`\`\`

REGLAS:
- Mezclá multiple_choice y preguntas abiertas
- Usá terminología real de la materia UBA
- Las preguntas deben ser variadas (no repetir el mismo tema)
- La dificultad debe ser ${diffLabel[diff]}

Devolvé SOLO el JSON, sin texto extra antes ni después.${docContext}`;

    try {
      const userApiKey = (typeof window.getUserGeminiKey === 'function' ? window.getUserGeminiKey() : '');
      const backendUrl = (typeof window.getBackendUrl === 'function' ? window.getBackendUrl() : 'https://fiuba-agent-backend-1.onrender.com/api/chat');
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, mode: 'profesor', context: '', userApiKey })
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        // Intentar parsear JSON de la respuesta
        let examData;
        try {
          const jsonMatch = data.reply.match(/\{[\s\S]*\}/);
          if (jsonMatch) examData = JSON.parse(jsonMatch[0]);
        } catch {}

        if (examData && examData.questions) {
          renderExamResult(examData, resultEl);
        } else {
          // Mostrar como texto si no se pudo parsear
          let html = data.reply.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
          resultEl.innerHTML = `<div class="examgen-content">${html}</div>`;
        }
      } else {
        resultEl.innerHTML = `<div class="examgen-error">⚠️ ${data.error || 'No se pudo generar'}</div>`;
      }
    } catch (e) {
      resultEl.innerHTML = `<div class="examgen-error">❌ Error de conexión</div>`;
    }
  }

  function renderExamResult(exam, container) {
    let html = `<div class="examgen-exam">
      <h4 style="margin-bottom:0.8rem;color:var(--text-primary)">${exam.title || 'Parcial'}</h4>
      <div class="examgen-questions">`;

    exam.questions.forEach((q, i) => {
      const isMc = q.type === 'multiple_choice';
      html += `<div class="examgen-q">
        <div class="examgen-q-num">${i + 1}</div>
        <div class="examgen-q-text">${q.text}</div>
        ${isMc ? `<div class="examgen-options">
          ${Object.entries(q.options || {}).map(([k, v]) =>
            `<div class="examgen-opt" onclick="this.classList.toggle('selected')"><span class="examgen-opt-letter">${k.toUpperCase()}</span> ${v}</div>`
          ).join('')}
        </div>` : `<div class="examgen-open"><textarea placeholder="Tu respuesta..." rows="3"></textarea></div>}
        <button class="examgen-show-btn" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">Ver respuesta</button>
        <div class="examgen-answer" style="display:none">
          <strong>Correcta:</strong> ${q.correct}<br>
          <em>${q.explanation || ''}</em>
        </div>
      </div>`;
    });

    html += `</div></div>`;
    container.innerHTML = html;
  }

  function initExamGen() {
    const modal = document.getElementById('examgen-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="examgen-panel">
        <div class="examgen-header">
          <div>
            <h3>Generador de Parciales</h3>
            <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem">Generá un parcial parecido a los de la facu</p>
          </div>
          <button class="examgen-close" onclick="closeExamGen()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="examgen-body">
          <div class="examgen-emoji">📝</div>
          <input type="text" id="examgen-topic" placeholder="Ej: Álgebra Lineal, Circuitos, Química Orgánica..." class="examgen-input"
            onkeydown="if(event.key==='Enter') generateExam()">
          <div class="examgen-row">
            <select id="examgen-count" class="examgen-select">
              <option value="3">3 preguntas</option>
              <option value="5" selected>5 preguntas</option>
              <option value="8">8 preguntas</option>
              <option value="10">10 preguntas</option>
            </select>
            <select id="examgen-diff" class="examgen-select">
              <option value="baja">Básico</option>
              <option value="media" selected>Intermedio</option>
              <option value="alta">Difícil</option>
            </select>
          </div>
          <select id="examgen-doc-select" class="examgen-select" style="width:100%;margin-bottom:0.5rem">
            <option value="">— Opcional: elegí un PDF como base —</option>
          </select>
          <button class="examgen-btn" onclick="generateExam()">Generar Parcial</button>
          <div id="examgen-result" class="examgen-result"></div>
        </div>
      </div>
    `;

    document.querySelector('.examgen-close')?.addEventListener('click', closeExamGen);

    // Agregar FAB flotante fuera del sidebar
    if (!document.getElementById('examgen-fab')) {
      const fab = document.createElement('button');
      fab.id = 'examgen-fab';
      fab.className = 'examgen-fab';
      fab.title = 'Generador de Parciales';
      fab.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
      fab.onclick = openExamGen;
      document.body.appendChild(fab);
    }
  }

  window.openExamGen = openExamGen;
  window.closeExamGen = closeExamGen;
  window.generateExam = generateExam;
  window.initExamGen = initExamGen;
})();
