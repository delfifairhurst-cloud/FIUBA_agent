import { adminPayload } from './admin-conversation.js';
import { completeChat, responseText } from './ai-response.js';
import { installAuthentication } from './verified-auth.js';
import { sendAiError } from './ai-errors.js';
import { installPerformance, callGeminiWithRetry } from './render-performance.js';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  'https://nevla.com.ar',
  'https://www.nevla.com.ar',
  'https://agente-fiuba.firebaseapp.com',
  'https://agente-fiuba.web.app',
  'https://fiuba-agent.web.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080'
];

app.use(cors({
  exposedHeaders: ['Retry-After'],
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
}));


const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: req => req.nevlaUid,
  skip: req => req.method === 'GET' && (req.path === '/health' || req.path.startsWith('/request-status/')),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Hiciste varias consultas seguidas. Esperá un minuto.', code: 'RATE_LIMIT', retryable: true }
});
installAuthentication(app);
app.use('/api/', limiter);
installPerformance(app);
app.use(express.json({ limit: '5mb', inflate: false }));

const MODEL_FALLBACK_CHAIN = [process.env.GEMINI_MODEL || 'gemini-3.6-flash'];

const SYSTEM_PROMPTS = {
  profesor: `Sos nevla en modo PROFESOR. Explicá conceptos de FIUBA/UBA.

REGLAS DE FORMATO (CRÍTICAS - OBLIGATORIO):
- Respondé SIEMPRE en texto plano del chat con Markdown básico (negritas con **, listas con -)
- Para fórmulas matemáticas escribí en texto corrido: f(x) = x² + 2x, o "la integral de 0 a 1 de x dx = 0.5"
- NUNCA uses dólares ($) para matemática, NUNCA uses \`\`\`math, NUNCA uses LaTeX, NUNCA uses KaTeX
- Usá bloques de código SOLO para código de programación (Python, C, etc.), con la etiqueta del lenguaje
- Si necesitás mostrar una fórmula, escribila en texto normal: "f(x) = x² + 2x evaluado en x=3 da 15"
- Si necesitás mostrar una ecuación, usá una línea: "2x + 5 = 15, entonces x = 5"

ESTRUCTURA:
1) Idea clave en 1 línea
2) Desarrollo con analogía real
3) Ejemplo mínimo con cuentas en texto plano
4) Check de comprensión con 1 pregunta

IMPORTANTE: Recordá el contexto de la conversación anterior. Respondé en relación a lo que se habló previamente.`,

  tutor: `Sos nevla en modo TUTOR SOCRÁTICO.

REGLAS DE FORMATO (CRÍTICAS - OBLIGATORIO):
- Respondé SIEMPRE en texto plano del chat con Markdown básico (negritas con **, listas con -)
- Para fórmulas matemáticas escribí en texto corrido: f(x) = x² + 2x
- NUNCA uses dólares ($) para matemática, NUNCA uses \`\`\`math, NUNCA uses LaTeX, NUNCA uses KaTeX
- Usá bloques de código SOLO para código de programación
- Si necesitás mostrar una fórmula, escribila en texto normal

No des la solución directa. Guía con preguntas que escalonan: pista 1 conceptual, pista 2 procedimental, pista 3 verificación. Cada turno: 1 pregunta orientadora + 1 micro-pista si se traba. Celebrá avances, corregí con empatía. Recordá el contexto de la conversación anterior.`,

  examinador: `Sos nevla en modo EXAMINADOR. Seguí este PROTOCOLO:

1. PREPARACIÓN: Analizá los DOCUMENTOS y determiná materia, temas, dificultad. Si falta info, indícalo, NO inventes.

2. UNA SOLA PREGUNTA POR TURNO. No resuelvas antes de que el estudiante responda.

3. FORMATO: Respondé SOLO con JSON puro (sin markdown, sin texto extra):
   - PREGUNTAR: {"type":"question","question":"Enunciado exacto","topic":"Tema","difficulty":"baja|media|alta","source":"fragmento"}
   - EVALUAR: {"type":"evaluation","result":"correct|partially_correct|incorrect","score":0.0-1.0,"main_error":"Error o null","feedback":"Feedback breve","topic":"Tema","mastery_estimate":0.0-1.0,"next_action":"continue|finish"}
   - Sin material: {"type":"error","message":"No hay info suficiente..."}
   Nunca envuelvas el JSON en \`\`\` ni agregues texto fuera del JSON.`,

  resolucion: `Sos nevla en modo RESOLUCIÓN PASO A PASO.

REGLAS DE FORMATO (CRÍTICAS - OBLIGATORIO):
- Respondé SIEMPRE en texto plano del chat con Markdown básico
- Para fórmulas matemáticas escribí en texto corrido
- NUNCA uses dólares ($) para matemática, NUNCA uses \`\`\`math, NUNCA uses LaTeX, NUNCA uses KaTeX
- Usá bloques de código SOLO para código de programación

Resolvé ejercicios paso a paso: cada paso numerado, con "por qué" en 1 línea, cuenta en texto plano, y al final verificación. Si hay imagen, transcribí el enunciado primero. Cerrá con "¿Querés que lo hagamos con otros datos?"`
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', adminConversation: 'context-v1', message: 'Servidor nevla funcionando correctamente' });
});

// Administrative conversation: full question and bounded history, no keyword shortcuts.
app.post('/api/admin-qa', async (req, res) => {
  res.set('X-Nevla-Admin', 'conversation-v1');
  try {
    const { question, history, userApiKey } = req.body || {};
    const payload = adminPayload(question, history);
    const apiKey = typeof userApiKey === 'string' ? userApiKey.trim() : '';
    if (!apiKey) return res.status(400).json({ code: 'KEY_REQUIRED', error: 'Conectá tu clave de IA.', retryable: false });
    const result = await completeChat(apiKey, payload, callGeminiWithRetry);
    return res.json({ answer: result.text, incomplete: result.incomplete });
  } catch (error) {
    if (error.code === 'INVALID_REQUEST') return res.status(400).json({ code: error.code, error: error.message, retryable: false });
    return sendAiError(res, error);
  }
});

// --- Test API Key ---
app.post('/api/test-key', async (req, res) => {
  try {
    const { userApiKey } = req.body;
    const apiKey = (userApiKey && userApiKey.trim()) || '';
    if (!apiKey) return res.json({ ok: false, error: 'No se proporcionó API Key.' });
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_FALLBACK_CHAIN[0]}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Hola' }] }] }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json();
    if (response.ok) {
      return res.json({ ok: true, model: MODEL_FALLBACK_CHAIN[0] });
    }
    const err = data.error || {};
    return res.json({ ok: false, error: err.message || `HTTP ${response.status}`, status: response.status });
  } catch (e) {
    return res.json({ ok: false, error: e.message || 'Error de conexión' });
  }
});

// --- Chat ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message, mode = 'profesor', context = '', examState = null, userApiKey, image, history = [] } = req.body;

    if ((!message || message.trim() === '') && !image) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    const apiKey = (userApiKey && userApiKey.trim()) || '';
    if (!apiKey) {
      return res.status(400).json({ error: 'Falta tu API Key - pegala en ⚙️ Servidor IA (aistudio.google.com/app/apikey)' });
    }

    if (typeof message === 'string' && message.length > 8000) return res.status(400).json({error:'La consulta es demasiado extensa.', code:'INPUT_LIMIT'});
    const systemInstruction = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.profesor;

    let promptContent = message;
    if (context && context.trim().length > 0) {
      const truncatedContext = context.slice(0, 8000);
      promptContent = `[DOCUMENTOS Y MATERIALES ACADÉMICOS PROPORCIONADOS POR EL ESTUDIANTE]\n${truncatedContext}\n\n[CONSULTA DEL ESTUDIANTE]\n${message}`;
    }
    if (mode === 'examinador' && examState) {
      promptContent += `\n\n[ESTADO DEL EXAMEN - NO INVENTAR, RESPETAR]\n${JSON.stringify(examState, null, 2)}`;
    }

    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      let remainingHistory = 16000;
      const boundedHistory = history.slice(-16).reverse().map(msg => {
        const source = String(msg.parts?.[0]?.text || "");
        const take = Math.max(0, Math.min(4000, remainingHistory));
        const text = msg.role === "model" ? (take ? source.slice(-take) : "") : source.slice(0, take);
        remainingHistory -= text.length;
        return {role: msg.role, parts: [{text}]};
      }).filter(msg => msg.parts[0].text).reverse();
      for (const msg of boundedHistory) {
        if (msg.role && msg.parts && msg.parts.length > 0) {
          contents.push({ role: msg.role, parts: msg.parts });
        }
      }
    }
    const lastRole = contents.length > 0 ? contents[contents.length - 1].role : null;
    if (lastRole === 'user') {
      contents[contents.length - 1] = { role: 'user', parts: [{ text: promptContent || "Analizá esta imagen del ejercicio y resolvé paso a paso." }] };
    } else {
      contents.push({ role: 'user', parts: [{ text: promptContent || "Analizá esta imagen del ejercicio y resolvé paso a paso." }] });
    }

    if (image && image.data) {
      contents[contents.length - 1].parts.push({ inlineData: { mimeType: image.mimeType || 'image/jpeg', data: image.data } });
    }

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents
    };
    if (mode === 'examinador') {
      payload.generationConfig = { responseMimeType: "application/json" };
    }

    let result;
    try {
      result = await completeChat(apiKey, payload, callGeminiWithRetry, { structured: mode === 'examinador' });
    } catch (err) {
      return sendAiError(res, err);
    }

    let reply = result.text;

    if (mode === 'examinador') {
      let jsonData = null;
      let clean = reply.trim();
      clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();
      try {
        jsonData = JSON.parse(clean);
      } catch (e) {
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) {
          try { jsonData = JSON.parse(match[0]); clean = match[0]; } catch {}
        }
      }
      if (jsonData) {
        return res.json({ reply: clean, isMock: false, isExaminerJson: true, examinerData: jsonData });
      }
      return res.json({ reply, isMock: false, isExaminerJson: false });
    }

    res.json({ reply, isMock: false, incomplete: result.incomplete });

  } catch (error) {
    console.error('Error interno en /api/chat:', error);
    res.status(500).json({ error: 'Error interno en el servidor.' });
  }
});

// --- Generar quiz ---
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { rawText, quizType = 'mixto', count = 10, userApiKey } = req.body;
    if (!rawText || rawText.trim().length < 20) return res.status(400).json({ error: 'Falta texto del PDF' });
    const apiKey = (userApiKey && userApiKey.trim()) || '';
    if (!apiKey) return res.status(400).json({ error: 'Falta tu API Key - pegala en ⚙️ Servidor IA (aistudio.google.com/app/apikey)' });

    const quizCount = Math.min(Math.max(parseInt(count) || 10, 3), 15);
    let typeInstr = '';
    if (quizType === 'multiple_choice') typeInstr = 'TODAS las preguntas deben ser type="multiple_choice" con options A) B) C) D) y correctAnswer con la letra correcta.';
    else if (quizType === 'open') typeInstr = 'TODAS las preguntas deben ser type="open" sin options, para desarrollar a mano.';
    else typeInstr = 'Mezclá multiple_choice (60%) y open (40%).';

    const system = `Sos generador de quizzes para FIUBA. Basándote EXCLUSIVAMENTE en el texto proporcionado, generá un quiz de ${quizCount} preguntas. ${typeInstr} Cada pregunta: id q1..qn, statement enunciado fiel al PDF (no inventes datos), topic tema corto, points 1. Devolvé JSON PURO sin markdown con forma {"questions":[{"id":"q1","statement":"...","topic":"...","type":"multiple_choice|open","options":["A) ...","B) ..."],"correctAnswer":"A","points":1}] } Para multiple_choice options debe tener 3-4 opciones y correctAnswer una letra A-D. No agregues texto fuera del JSON.`;

    const truncated = rawText.slice(0, 9000);
    const payload = {
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: `[TEXTO DEL PDF]\n${truncated}` }] }],
      generationConfig: { responseMimeType: "application/json", temperature: 0.4 }
    };

    let result;
    try {
      result = await callGeminiWithRetry(apiKey, payload, { endpoint: 'quiz' });
    } catch (err) {
      return sendAiError(res, err);
    }

    if (result.data.candidates?.[0]?.finishReason !== 'STOP') return sendAiError(res, { code: 'AI_INCOMPLETE' });
    let text = responseText(result.data);
    text = text.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();
    let json;
    try { json = JSON.parse(text); } catch { const m=text.match(/\{[\s\S]*\}/); if(m) json=JSON.parse(m[0]); else throw new Error('No JSON'); }
    const questions = (json.questions || []).slice(0, quizCount);
    res.json({ questions });
  } catch(e){
    console.error('generate-quiz error', e);
    res.status(500).json({ error: 'Error al procesar el quiz.' });
  }
});

// --- Generar flashcards ---
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { rawText, count = 8, userApiKey } = req.body;
    if (!rawText || rawText.trim().length < 20) return res.status(400).json({ error: 'Falta texto del PDF' });
    const apiKey = (userApiKey && userApiKey.trim()) || '';
    if (!apiKey) return res.status(400).json({ error: 'Falta tu API Key - pegala en ⚙️ Servidor IA' });
    const fcCount = Math.min(Math.max(parseInt(count) || 8, 3), 12);
    const system = `Sos generador de flashcards para FIUBA. Basándote EXCLUSIVAMENTE en el texto proporcionado, generá ${fcCount} flashcards de repaso espaciado. Cada flashcard: front pregunta corta y concreta, back respuesta breve y memorizable (máx 15 palabras), topic tema. Devolvé JSON PURO {"flashcards":[{"front":"...","back":"...","topic":"..."}] }. No inventes datos no presentes.`;
    const truncated = rawText.slice(0, 9000);
    const payload = { system_instruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: `[TEXTO DEL PDF]\n${truncated}` }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.5 } };

    let result;
    try {
      result = await callGeminiWithRetry(apiKey, payload, { endpoint: 'flashcards' });
    } catch (err) {
      return sendAiError(res, err);
    }

    if (result.data.candidates?.[0]?.finishReason !== 'STOP') return sendAiError(res, { code: 'AI_INCOMPLETE' });
    let text = responseText(result.data);
    text = text.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();
    let json; try { json = JSON.parse(text); } catch { const m=text.match(/\{[\s\S]*\}/); if(m) json=JSON.parse(m[0]); else throw new Error('No JSON'); }
    const flashcards = (json.flashcards || []).slice(0, fcCount);
    res.json({ flashcards });
  } catch(e){ console.error('generate-flashcards error', e); res.status(500).json({ error: 'Error al procesar las flashcards.' }); }
});

// --- Importar parciales del Altillo ---
const ALTILLO_ALLOWED_HOSTS = ['www.altillo.com', 'altillo.com'];

app.get('/api/altillo/import', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'URL es requerida' });
    let target = url;
    if (!target.startsWith('http')) target = 'https://' + target;
    let parsed;
    try { parsed = new URL(target); } catch { return res.status(400).json({ error: 'URL inválida' }); }
    if (!ALTILLO_ALLOWED_HOSTS.includes(parsed.hostname)) {
      return res.status(403).json({ error: 'Solo se permiten URLs de altillo.com' });
    }
    const browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-AR,es;q=0.9',
      'Referer': 'https://www.altillo.com/',
      'Cache-Control': 'no-cache'
    };
    let r = await fetch(target, { headers: browserHeaders });
    if (!r.ok && (r.status === 403 || r.status === 401)) {
      console.log(`Altillo ${r.status}, reintentando con proxy...`);
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`;
      r = await fetch(proxyUrl, { headers: { 'User-Agent': browserHeaders['User-Agent'] } });
    }
    if (!r.ok) return res.status(500).json({ error: `Altillo respondió ${r.status}` });
    const html = await r.text();
    const sectionRegex = /<a name="[^"]*">\s*([^<]+)\s*<\/a>/gi;
    let secMatch;
    const secPositions = [];
    while ((secMatch = sectionRegex.exec(html)) !== null) {
      secPositions.push({ title: secMatch[1].replace(/<[^>]*>/g,'').trim(), index: secMatch.index });
    }
    if (secPositions.length === 0) {
      const fallback = html.match(/(Primer Parcial|Segundo Parcial|Examen Integrador|Final)/gi) || [];
      fallback.forEach(t=> secPositions.push({ title: t, index: html.indexOf(t) }));
    }
    const linkRegex = /<a\s+href="([^"]+\.(?:pdf|asp))"[^>]*>([^<]+)<\/a>/gi;
    let m;
    const allLinks = [];
    while ((m = linkRegex.exec(html)) !== null) {
      const href = m[1].trim();
      const label = m[2].trim().replace(/\s+/g,' ');
      let abs = href;
      if (!abs.startsWith('http')) {
        const base = target.substring(0, target.lastIndexOf('/')+1);
        abs = base + href;
      }
      let section = "General";
      for (let i=secPositions.length-1; i>=0; i--) {
        if (m.index > secPositions[i].index) { section = secPositions[i].title; break; }
      }
      const before = html.slice(Math.max(0, m.index-300), m.index);
      const yearMatch = before.match(/(20\d{2})\s*:/);
      const year = yearMatch ? yearMatch[1] : "";
      allLinks.push({ label, href: abs, section: section.replace(/\s+/g,' ').trim(), year });
    }
    const grouped = {};
    allLinks.forEach(l=>{
      if (!grouped[l.section]) grouped[l.section]=[];
      grouped[l.section].push(l);
    });
    res.json({ source: target, sections: grouped, total: allLinks.length, attribution: "Fuente: altillo.com - uso personal, respetar términos" });
  } catch(e){
    console.error("Altillo import error", e);
    res.status(500).json({ error: 'Error al importar desde Altillo.' });
  }
});

app.post('/api/execute-c', async (req, res) => {
  const { code, stdin } = req.body;
  if (!code) return res.status(400).json({ error: 'Código requerido.' });
  if (code.length > 10000) return res.status(400).json({ error: 'Código demasiado largo (max 10000 chars).' });
  try {
    const payload = {
      compiler: 'gcc-head',
      code: code,
      stdin: stdin || '',
      'compiler-options': '-O2 -Wall',
      options: { warnings: true, timeout: 10000 },
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await response.json();
    const output = (data.stdout || '') + (data.stderr || '');
    const hasError = data.status !== '0' && data.status !== 0 && data.stderr;
    res.json({ output: output || '(sin salida)', error: hasError, status: data.status });
  } catch (e) {
    console.error('Wandbox error:', e.message);
    res.status(500).json({ error: 'Error al ejecutar código C. Intentá de nuevo.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor nevla corriendo en http://localhost:${PORT}`);
  console.log(`Endpoint de Chat: http://localhost:${PORT}/api/chat`);

  // Allow Render Free to sleep when idle; never self-ping this service.
});
