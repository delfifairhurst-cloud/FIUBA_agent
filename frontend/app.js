// State Global de la Aplicación
let chats = [];
let activeChatId = null;
let pendingChatImage = null; // { dataUrl, mimeType }

// --- Theme ---
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('fiuba_theme', theme);
  const darkBtn = document.getElementById('theme-dark-btn');
  const lightBtn = document.getElementById('theme-light-btn');
  if (darkBtn && lightBtn) {
    if (theme === 'light') {
      darkBtn.style.background = 'transparent'; darkBtn.style.color = 'var(--text-muted)';
      lightBtn.style.background = 'var(--primary)'; lightBtn.style.color = 'white';
    } else {
      lightBtn.style.background = 'transparent'; lightBtn.style.color = 'var(--text-muted)';
      darkBtn.style.background = 'var(--primary)'; darkBtn.style.color = 'white';
    }
  }
}
window.setTheme = setTheme;

(function initTheme() {
  const saved = localStorage.getItem('fiuba_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  setTimeout(() => {
    const darkBtn = document.getElementById('theme-dark-btn');
    const lightBtn = document.getElementById('theme-light-btn');
    if (darkBtn && lightBtn) {
      if (saved === 'light') {
        darkBtn.style.background = 'transparent'; darkBtn.style.color = 'var(--text-muted)';
        lightBtn.style.background = 'var(--primary)'; lightBtn.style.color = 'white';
      } else {
        lightBtn.style.background = 'transparent'; lightBtn.style.color = 'var(--text-muted)';
        darkBtn.style.background = 'var(--primary)'; darkBtn.style.color = 'white';
      }
    }
  }, 100);
})();

const DEFAULT_API_BASE = 'http://localhost:3000';
const API_BASE_STORAGE_KEY = 'fiuba_agent_api_base';

function getApiBase() {
  const saved = localStorage.getItem(API_BASE_STORAGE_KEY);
  return (saved || DEFAULT_API_BASE).trim().replace(/\/+$/, '');
}

function getBackendUrl() {
  return getApiBase() + '/api/chat';
}

function getHealthUrl() {
  return getApiBase() + '/api/health';
}

function showTypingIndicator(show) {
  const el = document.getElementById('typing-indicator');
  if (!el) return;
  el.classList.toggle('hidden', !show);
}

const GEMINI_KEY_STORAGE = 'fiuba_gemini_key';
function getUserGeminiKey() {
  return (localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim();
}
window.getUserGeminiKey = getUserGeminiKey;

function openServerConfigModal() {
  const modal = document.getElementById('server-modal');
  const input = document.getElementById('server-url-input');
  const keyInput = document.getElementById('gemini-key-input');
  if (input) input.value = getApiBase();
  if (keyInput) keyInput.value = getUserGeminiKey();
  if (modal) modal.classList.add('open');
}

function closeServerConfigModal() {
  const modal = document.getElementById('server-modal');
  if (modal) modal.classList.remove('open');
}

// --- Drawer móvil: abrir/cerrar sidebar ---
function isMobileDrawer() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebar-overlay')?.classList.add('open');
  document.body.style.overflow = isMobileDrawer() ? 'hidden' : '';
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar?.classList.contains('open')) closeSidebar();
  else openSidebar();
}

function saveServerUrl() {
  const input = document.getElementById('server-url-input');
  const value = (input?.value || '').trim().replace(/\/+$/, '');
  if (!value) {
    alert('Ingresá una URL válida para el backend (por ejemplo http://localhost:3000).');
    return;
  }
  localStorage.setItem(API_BASE_STORAGE_KEY, value);
  const keyInput = document.getElementById('gemini-key-input');
  const keyVal = (keyInput?.value || '').trim();
  if (keyVal) localStorage.setItem(GEMINI_KEY_STORAGE, keyVal);
  else localStorage.removeItem(GEMINI_KEY_STORAGE);
  closeServerConfigModal();
  checkBackendStatus();
}

function resetServerUrl() {
  localStorage.removeItem(API_BASE_STORAGE_KEY);
  localStorage.removeItem(GEMINI_KEY_STORAGE);
  const input = document.getElementById('server-url-input');
  if (input) input.value = DEFAULT_API_BASE;
  const keyInput = document.getElementById('gemini-key-input');
  if (keyInput) keyInput.value = '';
  checkBackendStatus();
}

// Descripciones de cada modo para la UI
const MODE_DESCRIPTIONS = {
  profesor: {
    title: 'Modo Profesor',
    desc: 'Explicaciones conceptuales claras, didácticas y rigurosas de temas de ingeniería UBA/FIUBA.'
  },
  tutor: {
    title: 'Modo Tutor Académico',
    desc: 'Te guía paso a paso con pistas y preguntas estratégicas sin darte la solución directamente.'
  },
  examinador: {
    title: 'Modo Examinador',
    desc: 'Simula preguntas de parcial o final para poner a prueba tus conocimientos.'
  },
  resolucion: {
    title: 'Modo Resolución Paso a Paso',
    desc: 'Desglosa minuciosamente la resolución matemática o de código de un ejercicio.'
  }
};

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  loadChatsFromStorage();
  checkBackendStatus();
  // Asegurar que el chat sea visible al cargar
  const chatEl = document.querySelector('.chat-container');
  if (chatEl) chatEl.style.display = 'flex';

  window.addEventListener('resize', () => {
    if (!isMobileDrawer()) closeSidebar();
  });
});

// Cargar chats desde LocalStorage o crear uno por defecto
function loadChatsFromStorage() {
  const saved = localStorage.getItem('fiuba_agent_chats');
  if (saved) {
    try {
      chats = JSON.parse(saved);
    } catch (e) {
      chats = [];
    }
  }

  // Migración: asegurar examState en chats viejos
  if (chats && chats.length > 0) {
    let needSave = false;
    chats.forEach(c => { if (!('examState' in c)) { c.examState = null; needSave = true; } });
    if (needSave) saveChatsToStorage();
  }

  if (!chats || chats.length === 0) {
    createNewChat('profesor', false);
  } else {
    activeChatId = chats[0].id;
    renderChatsList();
    renderActiveChat();
  }
}

// Guardar chats en LocalStorage
function saveChatsToStorage() {
  localStorage.setItem('fiuba_agent_chats', JSON.stringify(chats));
}

// Obtener el objeto del chat activo actualmente
function getActiveChat() {
  return chats.find(c => c.id === activeChatId) || chats[0];
}

// Crear una nueva sesión de chat
function createNewChat(mode = 'profesor', shouldRender = true) {
  const newId = 'chat_' + Date.now();
  const newChat = {
    id: newId,
    title: 'Nueva consulta',
    mode: mode,
    messages: [],
    loadedDocuments: [],
    examState: null
  };

  chats.unshift(newChat);
  activeChatId = newId;
  saveChatsToStorage();

  if (shouldRender) {
    renderChatsList();
    renderActiveChat();
    if (isMobileDrawer()) closeSidebar();
  }
}

// Cambiar al chat seleccionado
function selectChat(chatId) {
  activeChatId = chatId;
  saveChatsToStorage();
  renderChatsList();
  renderActiveChat();
  if (isMobileDrawer()) closeSidebar();
}

// Eliminar un chat del historial
function deleteChat(event, chatId) {
  event.stopPropagation();
  
  if (chats.length <= 1) {
    alert("Tenés que conservar al menos una conversación.");
    return;
  }

  chats = chats.filter(c => c.id !== chatId);
  if (activeChatId === chatId) {
    activeChatId = chats[0].id;
  }

  saveChatsToStorage();
  renderChatsList();
  renderActiveChat();
}

// Renderizar la lista de chats en la barra lateral
function renderChatsList() {
  const container = document.getElementById('chats-list');
  if (!container) return;

  container.innerHTML = '';

  chats.forEach(chat => {
    const item = document.createElement('div');
    item.className = `chat-item ${chat.id === activeChatId ? 'active' : ''}`;
    item.onclick = () => selectChat(chat.id);

    const modeIcons = {
      profesor: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
      tutor: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
      examinador: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      resolucion: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="18" x2="9" y2="9"/><line x1="15" y1="18" x2="15" y2="9"/><line x1="4" y1="18" x2="20" y2="18"/></svg>'
    };
    const modeIcon = modeIcons[chat.mode] || modeIcons.profesor;

    item.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.4rem; overflow:hidden;">
        <span style="flex-shrink:0;color:var(--text-muted)">${modeIcon}</span>
        <span class="chat-item-title">${chat.title}</span>
      </div>
      <button class="btn-delete-chat" onclick="deleteChat(event, '${chat.id}')" title="Eliminar chat">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    container.appendChild(item);
  });
}

// Renderizar la conversación activa completa
function renderActiveChat() {
  const chat = getActiveChat();
  if (!chat) return;

  // Actualizar UI del modo seleccionado
  setModeUI(chat.mode);

  // Renderizar historial de mensajes
  const history = document.getElementById('chat-history');
  history.innerHTML = '';

  if (chat.messages.length === 0) {
    history.innerHTML = `
      <div class="welcome-banner" id="welcome-banner">
        <div class="welcome-icon">🎓</div>
        <h2>¡Bienvenido a FIUBA Agent!</h2>
        <p>Tu asistente académico para materias de Ingeniería. ¿En qué tema necesitás ayuda hoy?</p>
        
        <div class="suggestions-grid">
          <button class="suggestion-card" onclick="useSuggestion('¿Podés explicarme qué es el producto escalar y vectorial y para qué se usa?')">
            <span class="sugg-tag">Álgebra II</span>
            <p>¿Qué es el producto escalar y vectorial?</p>
          </button>
          <button class="suggestion-card" onclick="useSuggestion('¿Cómo se calcula el momento de inercia de una barra respecto a su centro de masa?')">
            <span class="sugg-tag">Física I</span>
            <p>Cálculo de momento de inercia paso a paso.</p>
          </button>
          <button class="suggestion-card" onclick="useSuggestion('Haceme una pregunta de parcial sobre punteros y memoria dinámica en C.')">
            <span class="sugg-tag">Algoritmos</span>
            <p>Pregunta de examen sobre memoria en C.</p>
          </button>
        </div>
      </div>
    `;
  } else {
    chat.messages.forEach(msg => {
      appendMessageDOM(msg.sender, msg.text, msg.image || null);
    });
  }

  // Actualizar UI de materiales académicos del chat activo
  updateMaterialsUI();
  if (window.renderExaminerPanel) window.renderExaminerPanel();
}

// Cambiar Modo de Estudio — crea un chat nuevo si el actual tiene mensajes
function setMode(modeKey) {
  const chat = getActiveChat();
  if (!chat) return;
  if (chat.mode !== modeKey && chat.messages.length > 0) {
    // Tiene mensajes -> crear chat nuevo con el nuevo modo
    createNewChat(modeKey, true);
  } else {
    chat.mode = modeKey;
    saveChatsToStorage();
    setModeUI(modeKey);
    renderChatsList();
  }
  if (isMobileDrawer()) closeSidebar();
}

function setModeUI(modeKey) {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.mode === modeKey) {
      btn.classList.add('active');
    }
  });

  const modeInfo = MODE_DESCRIPTIONS[modeKey];
  if (modeInfo) {
    document.getElementById('current-mode-title').innerText = modeInfo.title;
    document.getElementById('current-mode-desc').innerText = modeInfo.desc;
  }
  // Actualizar panel examinador si existe
  if (window.renderExaminerPanel) window.renderExaminerPanel();
}

// Handler para iniciar examen (llamado desde examiner.js)
async function handleExaminerStart(introMessage) {
  const chat = getActiveChat();
  // Guardar mensaje del sistema como si fuera del usuario para historial
  chat.messages.push({ sender: 'user', text: introMessage });
  saveChatsToStorage();
  appendMessageDOM('user', introMessage);
  // Enviar al backend como mensaje normal pero con examState
  let contextText = '';
  if (chat.loadedDocuments && chat.loadedDocuments.length > 0) {
    contextText = chat.loadedDocuments.map(d => `--- INICIO DOCUMENTO: ${d.filename} ---\n${d.text}\n--- FIN DOCUMENTO: ${d.filename} ---`).join('\n\n');
  }
  showTypingIndicator(true);
  try {
    const userApiKey = (typeof getUserGeminiKey === 'function' ? getUserGeminiKey() : '');
    const response = await fetch(getBackendUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: introMessage, mode: 'examinador', context: contextText, examState: chat.examState, userApiKey })
    });
    const data = await response.json();
    if (response.ok) {
      if (data.isExaminerJson && data.examinerData) {
        const j = data.examinerData;
        if (j.type === 'question') {
          chat.messages.push({ sender: 'agent', text: JSON.stringify(j) });
          saveChatsToStorage();
          if (window.examinerAPI) window.examinerAPI.handleExaminerQuestion(j);
        } else if (j.type === 'error') {
          appendMessageDOM('agent', `⚠️ ${j.message}`);
        } else {
          appendMessageDOM('agent', data.reply);
        }
      } else {
        chat.messages.push({ sender: 'agent', text: data.reply });
        saveChatsToStorage();
        appendMessageDOM('agent', data.reply);
      }
      checkBackendStatus();
    } else {
      appendMessageDOM('agent', `⚠️ ${data.error || 'Error'}`);
    }
  } catch(e){ console.error(e); appendMessageDOM('agent', `❌ No se pudo conectar con backend (${getApiBase()})`); checkBackendStatus(); }
  finally { showTypingIndicator(false); }
}
window.handleExaminerStart = handleExaminerStart;

// Verificar salud del backend
async function checkBackendStatus() {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  try {
    const res = await fetch(getHealthUrl());
    if (res.ok) {
      statusDot.style.backgroundColor = 'var(--success)';
      statusDot.style.boxShadow = '0 0 8px var(--success)';
      statusText.innerText = 'Backend listo';
    } else {
      throw new Error('Sin respuesta');
    }
  } catch (err) {
    statusDot.style.backgroundColor = 'var(--warning)';
    statusDot.style.boxShadow = '0 0 8px var(--warning)';
    statusText.innerText = 'Servidor desconectado';
  }
}

// Auto-ajustar textarea
function handleKeyDown(event) {
  const textarea = event.target;
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';

  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSend(event);
  }
}

function handleChatImage(event) {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  compressImage(file).then(result => {
    pendingChatImage = result;
    const preview = document.getElementById('chat-image-preview');
    const img = document.getElementById('chat-image-preview-img');
    if (img) img.src = result.dataUrl;
    if (preview) { preview.classList.remove('hidden'); preview.style.display = 'flex'; }
  });
  event.target.value = '';
}
window.handleChatImage = handleChatImage;

function compressImage(file, maxDim = 1024, quality = 0.8) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
        else { width = Math.round(width * maxDim / height); height = maxDim; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL(file.type || 'image/jpeg', quality);
      resolve({ dataUrl, mimeType: file.type || 'image/jpeg' });
    };
    img.src = URL.createObjectURL(file);
  });
}

function removeChatImage() {
  pendingChatImage = null;
  const preview = document.getElementById('chat-image-preview');
  if (preview) { preview.classList.add('hidden'); preview.style.display = 'none'; }
}
window.removeChatImage = removeChatImage;

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('user-input');
  if (input) {
    input.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) return;
          compressImage(file).then(result => {
            pendingChatImage = result;
            const preview = document.getElementById('chat-image-preview');
            const img = document.getElementById('chat-image-preview-img');
            if (img) img.src = result.dataUrl;
            if (preview) { preview.classList.remove('hidden'); preview.style.display = 'flex'; }
          });
          break;
        }
      }
    });
  }
});

let recognition = null;
let isListening = false;
const micSVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10a7 7 0 0 1-14 0"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
const stopSVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>';
function toggleVoice() {
  const btn = document.getElementById('voice-btn');
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { alert('Tu navegador no soporta voz. Probá Chrome.'); return; }
  let finalTranscript = '';
  if (!recognition) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = 'es-AR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => { isListening = true; if (btn) { btn.innerHTML = stopSVG; btn.style.background = 'var(--danger)'; btn.style.color = 'white'; btn.title = 'Detener grabación'; } };
    recognition.onend = () => {
      if (isListening) { try { recognition.start(); } catch {} return; }
      isListening = false; if (btn) { btn.innerHTML = micSVG; btn.style.background = ''; btn.style.color = ''; btn.title = 'Hablar'; }
    };
    recognition.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += t + ' ';
        else interim += t;
      }
      const input = document.getElementById('user-input');
      if (input) {
        const base = input.dataset.voiceBase || '';
        input.value = (base ? base + ' ' : '') + finalTranscript + interim;
        input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 150) + 'px';
        input.focus();
      }
    };
    recognition.onerror = (e) => { console.error(e); if (e.error === 'not-allowed') alert('Permitís el micrófono en el navegador'); };
  }
  if (isListening) {
    isListening = false;
    try { recognition.stop(); } catch {}
    const input = document.getElementById('user-input');
    if (input) { delete input.dataset.voiceBase; finalTranscript = ''; }
    if (btn) { btn.innerHTML = micSVG; btn.style.background = ''; btn.style.color = ''; }
  } else {
    finalTranscript = '';
    const input = document.getElementById('user-input');
    if (input) input.dataset.voiceBase = input.value;
    try { recognition.start(); } catch (e) { console.error(e); }
  }
}
window.toggleVoice = toggleVoice;
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  const clean = text.replace(/[*#`]/g,'').slice(0,400);
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'es-AR'; u.rate = 0.95;
  speechSynthesis.speak(u);
}
window.speakText = speakText;

function useSuggestion(text) {
  const input = document.getElementById('user-input');
  input.value = text;
  handleSend(new Event('submit'));
}

function clearChat() {
  createNewChat(getActiveChat().mode);
}

// Manejo de subida de archivos PDF por chat activo
async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const chat = getActiveChat();
  const textEl = document.getElementById('materials-text');
  const originalText = textEl.innerHTML;
  textEl.innerHTML = `⌛ Procesando <strong>${file.name}</strong>...`;

  try {
    let extractedData = null;

    if (file.name.toLowerCase().endsWith('.pdf')) {
      extractedData = await extractTextFromPDF(file);
    } else {
      const text = await file.text();
      extractedData = { filename: file.name, text, pages: 1 };
    }

    if (!chat.loadedDocuments) chat.loadedDocuments = [];
    chat.loadedDocuments.push(extractedData);
    saveChatsToStorage();
    updateMaterialsUI();
    textEl.innerHTML = originalText;

    // Guardar referencia del archivo para digitalizar como imagen si hace falta
    window.lastUploadedFile = file;
    window.lastExtractedData = extractedData;

    appendMessageDOM('agent', `📄 **Documento cargado**: \`${extractedData.filename}\` (${extractedData.pages} pág.).\n\nPodés preguntarme sobre él en el chat, o ir a **Evaluaciones → Nueva evaluación → 📄 Digitalizar último PDF** para transcribirlo tal cual y rendirlo como parcial digital (multiple choice clickeable).`);

  } catch (error) {
    console.error('Error procesando el archivo:', error);
    textEl.innerHTML = originalText;
    alert(`No se pudo leer el archivo: ${error.message}`);
  }

  event.target.value = '';
}

function updateMaterialsUI() {
  const chat = getActiveChat();
  const badge = document.getElementById('materials-count-badge');
  const container = document.getElementById('loaded-files-list');

  const docs = (chat && chat.loadedDocuments) ? chat.loadedDocuments : [];
  badge.innerText = `${docs.length} PDFs`;
  container.innerHTML = '';

  docs.forEach((doc, idx) => {
    const chip = document.createElement('div');
    chip.className = 'file-item-chip';
    chip.innerHTML = `
      <div class="file-item-info">
        <span>📄</span>
        <span class="file-name-text" title="${doc.filename}">${doc.filename}</span>
      </div>
      <button class="btn-remove-file" onclick="removeDocument(${idx})" title="Eliminar archivo">✕</button>
    `;
    container.appendChild(chip);
  });
}

function removeDocument(index) {
  const chat = getActiveChat();
  if (chat && chat.loadedDocuments) {
    const removed = chat.loadedDocuments.splice(index, 1)[0];
    saveChatsToStorage();
    updateMaterialsUI();
    if (removed) {
      appendMessageDOM('agent', `🗑️ **Se quitó el documento**: \`${removed.filename}\` del contexto de este chat.`);
    }
  }
}

// Envío de mensaje
async function handleSend(event) {
  event.preventDefault();

  const inputEl = document.getElementById('user-input');
  const message = inputEl.value.trim();
  const hasImage = !!pendingChatImage;

  if (!message && !hasImage) return;

  const chat = getActiveChat();

  // Si es el primer mensaje, asignamos un título automático según la pregunta
  const titleText = message || (hasImage ? "Foto de ejercicio" : "");
  if (chat.messages.length === 0) {
    chat.title = titleText.length > 22 ? titleText.substring(0, 22) + '...' : titleText;
    renderChatsList();
  }

  const welcomeBanner = document.getElementById('welcome-banner');
  if (welcomeBanner) {
    welcomeBanner.remove();
  }

  inputEl.value = '';
  inputEl.style.height = 'auto';

  // Guardar mensaje del usuario (con imagen si hay)
  const imageToSend = pendingChatImage ? { ...pendingChatImage } : null;
  if (hasImage) {
    chat.messages.push({ sender: 'user', text: message || "[Foto]", image: imageToSend.dataUrl });
  } else {
    chat.messages.push({ sender: 'user', text: message });
  }
  saveChatsToStorage();
  appendMessageDOM('user', message, imageToSend ? imageToSend.dataUrl : null);
  // Limpiar preview
  if (hasImage) removeChatImage();

  // Preparar contexto de materiales
  let contextText = '';
  if (chat.loadedDocuments && chat.loadedDocuments.length > 0) {
    contextText = chat.loadedDocuments.map(d => `--- INICIO DOCUMENTO: ${d.filename} ---\n${d.text}\n--- FIN DOCUMENTO: ${d.filename} ---`).join('\n\n');
  }

  showTypingIndicator(true);
  try {
    const body = { message: message || (imageToSend ? "Resolvé este ejercicio de la foto. Explicá paso a paso." : ""), mode: chat.mode, context: contextText, userApiKey: (typeof getUserGeminiKey === 'function' ? getUserGeminiKey() : '') };

    // Enviar historial reciente como memoria del chat (últimos 10 mensajes, truncados)
    const recentMsgs = chat.messages.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: (m.text || '').slice(0, 1200) }]
    })).filter(m => m.parts[0].text);
    if (recentMsgs.length > 0) body.history = recentMsgs;

    if (imageToSend) {
      const base64 = imageToSend.dataUrl.split(',')[1];
      body.image = { data: base64, mimeType: imageToSend.mimeType };
    }
    // Adjuntar examState si está en modo examinador activo
    if (chat.mode === 'examinador' && chat.examState && chat.examState.active) {
      body.examState = chat.examState;
    }
    const response = await fetch(getBackendUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      // Modo examinador estricto: respuesta en JSON
      if (chat.mode === 'examinador' && data.isExaminerJson && data.examinerData) {
        const j = data.examinerData;
        chat.messages.push({ sender: 'agent', text: JSON.stringify(j) });
        saveChatsToStorage();
        if (j.type === 'question') {
          if (window.examinerAPI) window.examinerAPI.handleExaminerQuestion(j);
        } else if (j.type === 'evaluation') {
          if (window.examinerAPI) await window.examinerAPI.handleExaminerEvaluation(j, message);
          // Si no es la última, pedir siguiente pregunta automáticamente en el próximo turno
          // El frontend no auto-genera la siguiente; el usuario debe enviar "siguiente" o la próxima respuesta generará la siguiente
        } else if (j.type === 'error') {
          appendMessageDOM('agent', `⚠️ ${j.message}`);
        } else {
          appendMessageDOM('agent', data.reply);
        }
        checkBackendStatus();
      } else {
        // Modos normales o fallback
        if (chat.mode === 'examinador' && data.isExaminerJson === false) {
          // El modelo no devolvió JSON, mostrar texto pero avisar
          appendMessageDOM('agent', `⚠️ El examinador no devolvió JSON estricto, mostrando texto:\n\n${data.reply}`);
        } else {
          chat.messages.push({ sender: 'agent', text: data.reply });
          saveChatsToStorage();
          appendMessageDOM('agent', data.reply);
          // Gamificación: XP por mensaje
          if (window.Gamification) {
            window.Gamification.trackMessage();
            const r = window.Gamification.addXp('chat_message');
            if (window.processGamificationResult) window.processGamificationResult(r);
          }
        }
        checkBackendStatus();
      }
    } else {
      const extra = data.details ? `\n\n${data.details}` : '';
      const isQuota = (data.error || '').toLowerCase().includes('quota') || (data.details || '').toLowerCase().includes('quota');
      const errorMsg = isQuota
        ? `⚠️ **Sin cuota disponible** — Tu API Key de Gemini tiene un límite de 20 requests/día en el tier gratuito.\n\n**Opciones:**\n1. Esperá a mañana (se resetea)\n2. Activá billing en [Google AI Studio](https://aistudio.google.com/app/apikey) para más requests\n3. Usá el botón "⚙️ Servidor IA" para configurar tu key`
        : `⚠️ **Error en la solicitud**: ${data.error || 'Ocurrió un problema en el servidor.'}${extra}`;
      appendMessageDOM('agent', errorMsg);
    }

  } catch (error) {
    console.error('Error enviando mensaje:', error);
    appendMessageDOM('agent', `❌ **No se pudo conectar con el servidor backend** (${getApiBase()}).\n\nEn esta PC tenés que tener corriendo \`python server.py\` en la carpeta backend.\nSi usás la web publicada en Firebase desde el celu u otra red, configurá un backend público en **⚙️ Servidor IA**.`);
    checkBackendStatus();
  } finally {
    showTypingIndicator(false);
  }
}

// Agregar burbuja solo a la UI
function appendMessageDOM(sender, text, imageUrl = null) {
  const history = document.getElementById('chat-history');

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;

  const avatar = document.createElement('div');
  avatar.className = 'bubble-avatar';
  if (sender === 'user') {
    avatar.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  } else {
    avatar.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>';
  }

  const content = document.createElement('div');
  content.className = 'bubble-content';

  let html = "";
  if (imageUrl) html += `<div class="chat-image-wrapper"><img src="${imageUrl}" class="chat-image" alt="Imagen del usuario"></div>`;
  html += parseSimpleMarkdown(text || "");
  if (sender === 'agent' && text && text.length < 800) {
    const safe = text.replace(/`/g,'').replace(/'/g,"\\'").replace(/"/g,'&quot;').slice(0,300);
    html += `<div style="margin-top:0.5rem"><button onclick="speakText('${safe}')" style="background:rgba(255,255,255,0.06);border:1px solid var(--border-color);border-radius:6px;padding:0.25rem 0.5rem;font-size:0.7rem;cursor:pointer;color:var(--text-muted)">🔊 Escuchar</button></div>`;
  }
  content.innerHTML = html;

  bubble.appendChild(avatar);
  bubble.appendChild(content);

  history.appendChild(bubble);
  history.scrollTop = history.scrollHeight;

  // Renderizar matemáticas KaTeX
  if (window.renderMathInElement) {
    window.renderMathInElement(content, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      throwOnError: false
    });
  }
}

// Formatear Markdown
function parseSimpleMarkdown(text) {
  if (!text) return '';

  // Proteger delimitadores LaTeX antes de escapar HTML
  const mathBlocks = [];
  let html = text.replace(/(\$\$[\s\S]*?\$\$)/g, (m) => {
    mathBlocks.push(m);
    return `\x00MATH_BLOCK_${mathBlocks.length - 1}\x00`;
  }).replace(/(\$[\s\S]*?\$)/g, (m) => {
    mathBlocks.push(m);
    return `\x00MATH_INLINE_${mathBlocks.length - 1}\x00`;
}).replace(/(\\\([\s\S]*?\\\))/g, (m) => {
  mathBlocks.push(m);
  return `\x00MATH_INLINE_${mathBlocks.length - 1}\x00`;
}).replace(/(\\[[\\s\\S]*?\\])/g, (m) => {
    mathBlocks.push(m);
    return `\x00MATH_BLOCK_${mathBlocks.length - 1}\x00`;
  });

  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.1rem; margin: 0.8rem 0 0.4rem 0; color: var(--accent-cyan);">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.25rem; margin: 1rem 0 0.5rem 0; color: var(--text-primary);">$1</h2>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^\s*[\-\*]\s+(.*$)/gim, '<li style="margin-left: 1.2rem;">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color: var(--accent-cyan);">$1</a>');

  // Restaurar bloques matemáticos
  mathBlocks.forEach((m, i) => {
    const blockPlaceholder = `\x00MATH_BLOCK_${i}\x00`;
    const inlinePlaceholder = `\x00MATH_INLINE_${i}\x00`;
    html = html.replace(blockPlaceholder, m).replace(inlinePlaceholder, m);
  });

  const paragraphs = html.split(/\n\n+/);
  return paragraphs.map(p => {
    if (p.startsWith('<pre>') || p.startsWith('<h2') || p.startsWith('<h3') || p.startsWith('<li')) {
      return p;
}
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

/* ==========================================================================
   Top Menu - Navegación entre vistas
   ========================================================================== */

const FIUBA_PLAN = {
  cbc: {
    name: 'CBC',
    materias: [
      { name: 'Análisis Matemático A', url: 'https://www.altillo.com/examenes/uba/cbc/analisis/index.asp' },
      { name: 'Álgebra A', url: 'https://www.altillo.com/examenes/uba/cbc/algebra/index.asp' },
      { name: 'Física', url: 'https://www.altillo.com/examenes/uba/cbc/fis/index.asp' },
      { name: 'Pensamiento Computacional', url: 'https://www.altillo.com/examenes/uba/cbc/pensamientocomputacional/index.asp' },
      { name: 'Introd. al Pensamiento Científico', url: 'https://www.altillo.com/examenes/uba/cbc/pensamiento/index.asp' },
      { name: 'ICSE', url: 'https://www.altillo.com/examenes/uba/cbc/socyestado/index.asp' },
    ]
  },
  industrial: {
    name: 'Ingeniería Industrial (Plan 2023)',
    anios: [
      {
        year: '3er Cuatrimestre',
        materias: [
          { name: 'Análisis Matemático II', url: 'https://www.altillo.com/examenes/uba/ingenieria/#analisis2' },
          { name: 'Física de los Sistemas de Partículas', url: 'https://www.altillo.com/examenes/uba/ingenieria/#fisica' },
          { name: 'Principios de Ing. Industrial', url: 'https://www.altillo.com/examenes/uba/ingenieria/' },
        ]
      },
      {
        year: '4to Cuatrimestre',
        materias: [
          { name: 'Álgebra Lineal', url: 'https://www.altillo.com/examenes/uba/ingenieria/#algebra2' },
          { name: 'Química Básica', url: 'https://www.altillo.com/examenes/uba/ingenieria/#quimica' },
          { name: 'Estática y Resistencia de Materiales', url: 'https://www.altillo.com/examenes/uba/ingenieria/' },
        ]
      },
      {
        year: '5to Cuatrimestre',
        materias: [
          { name: 'Probabilidad', url: 'https://www.altillo.com/examenes/uba/ingenieria/#probyesta' },
          { name: 'Economía', url: 'https://www.altillo.com/examenes/uba/ingenieria/#econempresa' },
          { name: 'Materiales y Aplicaciones I', url: 'https://www.altillo.com/examenes/uba/ingenieria/#Comportamiento_de_Materiales' },
          { name: 'Transformación de la Energía', url: 'https://www.altillo.com/examenes/uba/ingenieria/' },
        ]
      },
      {
        year: '6to Cuatrimestre',
        materias: [
          { name: 'Electricidad y Magnetismo', url: 'https://www.altillo.com/examenes/uba/ingenieria/#fisica2' },
          { name: 'Desarrollo Económico', url: 'https://www.altillo.com/examenes/uba/ingenieria/#estructuraeconarg' },
          { name: 'Estadística Aplicada', url: 'https://www.altillo.com/examenes/uba/ingenieria/#probyesta' },
          { name: 'Gestión Integral de la Cadena de Valor', url: 'https://www.altillo.com/examenes/uba/ingenieria/' },
        ]
      },
      {
        year: '7mo Cuatrimestre',
        materias: [
          { name: 'Electrotecnia, Máquinas e Inst. Eléctricas', url: 'https://www.altillo.com/examenes/uba/ingenieria/#electrotecniagralb' },
          { name: 'Investigación Operativa', url: 'https://www.altillo.com/examenes/uba/ingenieria/' },
          { name: 'Sistemas Contables y Gestión de Costos', url: 'https://www.altillo.com/examenes/uba/ingenieria/#contaydinamicaecon' },
          { name: 'Industrias Digitales', url: 'https://www.altillo.com/examenes/uba/ingenieria/#tecndigital' },
          { name: 'Ing. Ambiental, Sustentabilidad', url: 'https://www.altillo.com/examenes/uba/ingenieria/' },
        ]
      },
      {
        year: '8vo Cuatrimestre',
        materias: [
          { name: 'Ingeniería Económica', url: 'https://www.altillo.com/examenes/uba/ingenieria/#econempresa' },
          { name: 'Equipos y Sist. para Automatización', url: 'https://www.altillo.com/examenes/uba/ingenieria/#tecndigital' },
          { name: 'Industrias Químicas', url: 'https://www.altillo.com/examenes/uba/ingenieria/#quimica' },
          { name: 'Transformación de Materiales', url: 'https://www.altillo.com/examenes/uba/ingenieria/#Comportamiento_de_Materiales' },
          { name: 'Higiene y Seguridad', url: 'https://www.altillo.com/examenes/uba/ingenieria/' },
        ]
      },
      {
        year: '9no Cuatrimestre',
        materias: [
          { name: 'Industrias Extractivas', url: 'https://www.altillo.com/examenes/uba/ingenieria/' },
          { name: 'Proyecto Industrial', url: 'https://www.altillo.com/examenes/uba/ingenieria/' },
          { name: 'Electivas / Optativas', url: 'https://www.altillo.com/examenes/uba/ingenieria/' },
        ]
      },
      {
        year: '10mo Cuatrimestre',
        materias: [
          { name: 'Legislación y Ejercicio Profesional', url: 'https://www.altillo.com/examenes/uba/ingenieria/#inglegal' },
          { name: 'Trabajo Profesional / Tesis', url: 'https://www.altillo.com/examenes/uba/ingenieria/' },
        ]
      }
    ]
  }
};

function switchView(view) {
  // Update top menu buttons
  document.querySelectorAll('.top-menu-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // IDs of all view panels
  const views = ['materias-view', 'enlaces-view', 'biblioteca-view', 'comunidad-view', 'examiner-panel', 'contacto-view', 'evaluaciones-view', 'flashcards-view', 'progreso-view'];
  const chatEl = document.querySelector('.chat-container');

  // Hide all panels via hidden class (has !important)
  views.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  if (chatEl) chatEl.style.display = 'none';

  // Show the selected view
  if (view === 'inicio') {
    if (chatEl) chatEl.style.display = 'flex';
  } else if (view === 'evaluaciones') {
    const ev = document.getElementById('evaluaciones-view');
    if (ev) { ev.classList.remove('hidden'); if (window.refreshEvaluations) window.refreshEvaluations(); }
  } else if (view === 'materias') {
    const mv = document.getElementById('materias-view');
    if (mv) { mv.classList.remove('hidden'); populateMaterias(); }
  } else if (view === 'enlaces') {
    const ev = document.getElementById('enlaces-view');
    if (ev) ev.classList.remove('hidden');
  } else if (view === 'biblioteca') {
    const bv = document.getElementById('biblioteca-view');
    if (bv) { bv.classList.remove('hidden'); if (window.loadBibliotecaView) window.loadBibliotecaView(); }
  } else if (view === 'comunidad') {
    const cv2 = document.getElementById('comunidad-view');
    if (cv2) { cv2.classList.remove('hidden'); if (window.refreshCommunity) window.refreshCommunity(); }
  } else if (view === 'contacto') {
    const cv = document.getElementById('contacto-view');
    if (cv) cv.classList.remove('hidden');
  } else if (view === 'flashcards') {
    const fv = document.getElementById('flashcards-view');
    if (fv) { fv.classList.remove('hidden'); if (window.refreshFlashcardsView) window.refreshFlashcardsView(); }
  } else if (view === 'progreso') {
    const pv = document.getElementById('progreso-view');
    if (pv) { pv.classList.remove('hidden'); if (window.refreshAnalytics) window.refreshAnalytics(); }
  }
}
window.switchView = switchView;

function populateMaterias() {
  const grid = document.getElementById('materias-grid');
  if (!grid || grid.children.length > 0) return;

  // CBC
  const cbcCard = document.createElement('div');
  cbcCard.className = 'materia-card';
  cbcCard.innerHTML = '<h4>CBC</h4><p>7 materias del ciclo básico</p>';
  cbcCard.onclick = () => showCarreraMaterias('cbc');
  grid.appendChild(cbcCard);

  // Industrial
  const indCard = document.createElement('div');
  indCard.className = 'materia-card';
  indCard.innerHTML = '<h4>Ingeniería Industrial</h4><p>Plan de estudios por año</p>';
  indCard.onclick = () => showCarreraMaterias('industrial');
  grid.appendChild(indCard);
}

function showCarreraMaterias(carreraKey) {
  const grid = document.getElementById('materias-grid');
  const detail = document.getElementById('materia-detail');
  const title = document.getElementById('materia-detail-title');
  const content = document.getElementById('materia-detail-content');
  if (!grid || !detail || !title || !content) return;

  grid.style.display = 'none';
  detail.classList.remove('hidden');
  const carrera = FIUBA_PLAN[carreraKey];
  title.textContent = carrera.name;

  let html = '<button class="btn-secondary" onclick="backToCarreras()" style="margin-bottom:0.8rem;font-size:0.78rem;padding:0.3rem 0.7rem">← Volver</button>';

  if (carrera.materias) {
    // CBC - flat list
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.6rem">';
    carrera.materias.forEach(m => {
      html += '<div class="materia-card" onclick="window.open(\'' + m.url + '\',\'_blank\')" style="padding:0.7rem 0.9rem"><h4 style="font-size:0.88rem">' + m.name + '</h4><p style="font-size:0.72rem;color:var(--accent-cyan)">Ver parciales en Altillo →</p></div>';
    });
    html += '</div>';
  } else if (carrera.anios) {
    // Industrial - by year
    carrera.anios.forEach(anio => {
      html += '<div style="margin-bottom:1rem"><h4 style="font-family:var(--font-heading);font-size:0.92rem;color:var(--accent-cyan);margin-bottom:0.4rem;border-bottom:1px solid var(--border-color);padding-bottom:0.3rem">' + anio.year + '</h4>';
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.5rem">';
      anio.materias.forEach(m => {
        html += '<div class="materia-card" onclick="window.open(\'' + m.url + '\',\'_blank\')" style="padding:0.6rem 0.8rem"><h4 style="font-size:0.85rem">' + m.name + '</h4><p style="font-size:0.7rem;color:var(--accent-cyan)">Ver parciales →</p></div>';
      });
      html += '</div></div>';
    });
  }
  content.innerHTML = html;
}

function backToCarreras() {
  const grid = document.getElementById('materias-grid');
  const detail = document.getElementById('materia-detail');
  if (grid) grid.style.display = 'grid';
  if (detail) detail.classList.add('hidden');
}

function closeMateriaDetail() {
  backToCarreras();
}

function loadBibliotecaView() {
  const list = document.getElementById('biblioteca-view-list');
  if (!list) return;
  list.innerHTML = '<p style="color:var(--text-muted);font-size:0.82rem">Tu biblioteca está vacía. Usá el chat o las evaluaciones para guardar material.</p>';
}
