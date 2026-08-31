// exam-generator.js — Generador de parciales desde PDF o por tema
(function () {
  'use strict';

  var initialized = false;

  function openExamGen() {
    if (!initialized) { initExamGen(); initialized = true; }
    var modal = document.getElementById('examgen-modal');
    if (modal) { modal.classList.add('open'); modal.style.display = 'flex'; }
    var select = document.getElementById('examgen-doc-select');
    if (select) {
      var chat = window.getActiveChat ? window.getActiveChat() : null;
      var docs = (chat && chat.loadedDocuments) ? chat.loadedDocuments : [];
      if (docs.length === 0) {
        select.innerHTML = '<option value="">— Subí un PDF desde acá o usá solo tema —</option>';
      } else {
        var opts = '<option value="">— Solo por tema (sin PDF) —</option>';
        for (var i = 0; i < docs.length; i++) {
          opts += '<option value="' + i + '">📄 ' + docs[i].filename + '</option>';
        }
        select.innerHTML = opts;
      }
    }
  }

  function closeExamGen() {
    var m = document.getElementById('examgen-modal');
    if (m) m.classList.remove('open');
  }

  function parseExamJson(text) {
    var match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (e) { return null; }
    }
    return null;
  }

  async function generateExam() {
    var topicInput = document.getElementById('examgen-topic');
    var countSelect = document.getElementById('examgen-count');
    var diffSelect = document.getElementById('examgen-diff');
    var docSelect = document.getElementById('examgen-doc-select');
    var fileInput = document.getElementById('examgen-file-input');
    var topic = topicInput ? topicInput.value.trim() : '';
    var count = countSelect ? countSelect.value : '5';
    var diff = diffSelect ? diffSelect.value : 'media';

    if (!topic && !(fileInput && fileInput.files && fileInput.files.length > 0)) {
      alert('Escribí la materia o tema, o subí un PDF');
      return;
    }

    var diffLabel = { baja: 'básico/fácil', media: 'intermedio', alta: 'difícil/avanzado' };

    var docContext = '';

    // Si subió un archivo directamente
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      var btn = document.getElementById('examgen-generate-btn');
      var oldText = btn ? btn.textContent : '';
      if (btn) { btn.textContent = '⏳ Parseando PDF...'; btn.disabled = true; }
      try {
        var result = await extractTextFromPDF(fileInput.files[0]);
        docContext = '\n\nMATERIAL DEL USUARIO (usá esto como base para las preguntas):\n---\n' + result.text.substring(0, 6000) + '\n---';
        if (!topic) topic = result.filename.replace('.pdf', '').replace(/_/g, ' ');
        if (topicInput) topicInput.value = topic;
      } catch (e) {
        alert('Error al leer PDF: ' + e.message);
        if (btn) { btn.textContent = oldText; btn.disabled = false; }
        return;
      }
      if (btn) { btn.textContent = oldText; btn.disabled = false; }
    } else if (docSelect && docSelect.value !== '') {
      var chat = window.getActiveChat ? window.getActiveChat() : null;
      var docs = (chat && chat.loadedDocuments) ? chat.loadedDocuments : [];
      var doc = docs[parseInt(docSelect.value)];
      if (doc && doc.text) {
        docContext = '\n\nMATERIAL DEL USUARIO (usá esto como base para las preguntas):\n---\n' + doc.text.substring(0, 6000) + '\n---';
      }
    }

    var resultEl = document.getElementById('examgen-result');
    if (!resultEl) return;

    resultEl.innerHTML = '<div class="examgen-loading"><div class="typing-dots"><span></span><span></span><span></span></div>Generando parcial...</div>';

    var prompt = 'Sos un profesor de la UBA/FIUBA. Generá un parcial de ' + count + ' preguntas.\n\n';
    prompt += 'Materia/Tema: ' + topic + '\n';
    prompt += 'Dificultad: ' + (diffLabel[diff] || 'intermedio') + '\n\n';
    prompt += 'FORMATO OBLIGATORIO (JSON):\n';
    prompt += '```json\n';
    prompt += '{"title":"Parcial: ' + topic + '","questions":[{"id":1,"type":"multiple_choice","text":"Enunciado","options":{"a":"Opción A","b":"Opción B","c":"Opción C","d":"Opción D"},"correct":"a","explanation":"Explicación"},{"id":2,"type":"open","text":"Enunciado pregunta abierta","correct":"Respuesta esperada","explanation":"Explicación"}]}\n';
    prompt += '```\n\n';
    prompt += 'REGLAS:\n';
    prompt += '- Mezclá multiple_choice y preguntas abiertas\n';
    prompt += '- Usá terminología real de la materia UBA\n';
    prompt += '- Las preguntas deben ser variadas\n';
    prompt += '- La dificultad debe ser ' + (diffLabel[diff] || 'intermedio') + '\n';
    prompt += 'Devolvé SOLO el JSON, sin texto extra.' + docContext;

    try {
      var userApiKey = (typeof window.getUserGeminiKey === 'function' ? window.getUserGeminiKey() : '');
      var backendUrl = (typeof window.getBackendUrl === 'function' ? window.getBackendUrl() : 'https://fiuba-agent-backend-1.onrender.com/api/chat');
      var response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, mode: 'profesor', context: '', userApiKey: userApiKey })
      });

      var data = await response.json();

      if (response.ok && data.reply) {
        var examData = parseExamJson(data.reply);
        if (examData && examData.questions) {
          renderExamResult(examData, resultEl);
        } else {
          var html = data.reply.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
          resultEl.innerHTML = '<div class="examgen-content">' + html + '</div>';
        }
      } else {
        resultEl.innerHTML = '<div class="examgen-error">⚠️ ' + (data.error || 'No se pudo generar') + '</div>';
      }
    } catch (e) {
      resultEl.innerHTML = '<div class="examgen-error">❌ Error de conexión</div>';
    }
  }

  function renderExamResult(exam, container) {
    var html = '<div class="examgen-exam"><h4 style="margin-bottom:0.8rem;color:var(--text-primary)">' + (exam.title || 'Parcial') + '</h4><div class="examgen-questions">';

    for (var i = 0; i < exam.questions.length; i++) {
      var q = exam.questions[i];
      var isMc = q.type === 'multiple_choice';
      html += '<div class="examgen-q"><div class="examgen-q-num">' + (i + 1) + '</div>';
      html += '<div class="examgen-q-text">' + q.text + '</div>';
      if (isMc && q.options) {
        html += '<div class="examgen-options">';
        var keys = Object.keys(q.options);
        for (var j = 0; j < keys.length; j++) {
          var k = keys[j];
          html += '<div class="examgen-opt" onclick="this.classList.toggle(\'selected\')"><span class="examgen-opt-letter">' + k.toUpperCase() + '</span> ' + q.options[k] + '</div>';
        }
        html += '</div>';
      } else {
        html += '<div class="examgen-open"><textarea placeholder="Tu respuesta..." rows="3"></textarea></div>';
      }
      html += '<button class="examgen-show-btn" onclick="var s=this.nextElementSibling;s.style.display=s.style.display===\'none\'?\'block\':\'none\'">Ver respuesta</button>';
      html += '<div class="examgen-answer" style="display:none"><strong>Correcta:</strong> ' + q.correct + '<br><em>' + (q.explanation || '') + '</em></div>';
      html += '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;
  }

  function handleExamFileUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    var label = document.getElementById('examgen-file-label');
    if (label) label.textContent = '📄 ' + file.name;
  }

  function initExamGen() {
    var modal = document.getElementById('examgen-modal');
    if (!modal) return;

    var html = '<div class="examgen-panel">';
    html += '<div class="examgen-header"><div>';
    html += '<h3>Generador de Parciales</h3>';
    html += '<p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem">Generá un parcial parecido a los de la facu</p>';
    html += '</div>';
    html += '<button class="examgen-close" id="examgen-close-btn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    html += '</div>';
    html += '<div class="examgen-body">';
    html += '<div class="examgen-emoji">📝</div>';

    // File upload area
    html += '<label for="examgen-file-input" style="display:flex;align-items:center;gap:0.5rem;padding:0.7rem 1rem;background:var(--bg-surface);border:2px dashed var(--border-color);border-radius:10px;cursor:pointer;margin-bottom:0.6rem;text-align:center;justify-content:center;transition:border-color 0.2s">';
    html += '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
    html += '<span id="examgen-file-label" style="font-size:0.82rem;color:var(--text-secondary)">Subí un PDF de parcial (opcional)</span>';
    html += '</label>';
    html += '<input type="file" id="examgen-file-input" accept=".pdf" style="display:none" onchange="handleExamFileUpload(event)">';

    html += '<input type="text" id="examgen-topic" placeholder="Ej: Álgebra Lineal, Circuitos, Química..." class="examgen-input">';

    html += '<div class="examgen-row">';
    html += '<select id="examgen-count" class="examgen-select">';
    html += '<option value="3">3 preguntas</option>';
    html += '<option value="5" selected>5 preguntas</option>';
    html += '<option value="8">8 preguntas</option>';
    html += '<option value="10">10 preguntas</option>';
    html += '</select>';
    html += '<select id="examgen-diff" class="examgen-select">';
    html += '<option value="baja">Básico</option>';
    html += '<option value="media" selected>Intermedio</option>';
    html += '<option value="alta">Difícil</option>';
    html += '</select>';
    html += '</div>';

    html += '<select id="examgen-doc-select" class="examgen-select" style="width:100%;margin-bottom:0.5rem">';
    html += '<option value="">— Subí un PDF desde acá o usá solo tema —</option>';
    html += '</select>';

    html += '<button id="examgen-generate-btn" class="examgen-btn">Generar Parcial</button>';
    html += '<div id="examgen-result" class="examgen-result"></div>';
    html += '</div></div>';

    modal.innerHTML = html;

    document.getElementById('examgen-close-btn').addEventListener('click', closeExamGen);
    document.getElementById('examgen-generate-btn').addEventListener('click', generateExam);

    if (!document.getElementById('examgen-fab')) {
      var fab = document.createElement('button');
      fab.id = 'examgen-fab';
      fab.className = 'examgen-fab';
      fab.title = 'Generador de Parciales';
      fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>';
      fab.onclick = openExamGen;
      document.body.appendChild(fab);
    }
  }

  window.openExamGen = openExamGen;
  window.closeExamGen = closeExamGen;
  window.generateExam = generateExam;
  window.handleExamFileUpload = handleExamFileUpload;
})();
