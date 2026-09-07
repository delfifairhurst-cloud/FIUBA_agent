import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  'https://agente-fiuba.web.app',
  'https://fiuba-agent.web.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
}));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas requests. Esperá un momento.' }
});
app.use('/api/', limiter);

// --- Error classification and retry logic ---
const TEMPORARY_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const TEMPORARY_GEMINI_REASONS = new Set([
  'UNAVAILABLE', 'OVERLOADED', 'RESOURCE_EXHAUSTED',
  'INTERNAL', 'ABORTED', 'DEADLINE_EXCEEDED'
]);

const MODEL_FALLBACK_CHAIN = [
  process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash'
];

function isTemporaryError(statusCode, geminiError) {
  if (TEMPORARY_STATUS_CODES.has(statusCode)) return true;
  if (geminiError) {
    const reason = (geminiError.status || '').toUpperCase();
    const message = (geminiError.message || '').toUpperCase();
    if (TEMPORARY_GEMINI_REASONS.has(reason)) return true;
    if (message.includes('UNAVAILABLE') || message.includes('OVERLOADED') ||
        message.includes('RESOURCE_EXHAUSTED') || message.includes('QUOTA') ||
        message.includes('TIMEOUT') || message.includes('DEADLINE')) return true;
  }
  return false;
}

function isPermanentError(statusCode, geminiError) {
  if (statusCode === 400 || statusCode === 401 || statusCode === 403) return true;
  if (geminiError) {
    const reason = (geminiError.status || '').toUpperCase();
    if (reason === 'INVALID_ARGUMENT' || reason === 'UNAUTHENTICATED' ||
        reason === 'PERMISSION_DENIED' || reason === 'FAILED_PRECONDITION') return true;
  }
  return false;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function jitter(baseMs) {
  return baseMs + Math.random() * baseMs * 0.3;
}

async function callGeminiWithRetry(apiKey, payload, { maxRetries = 3, endpoint = 'chat' } = {}) {
  const models = MODEL_FALLBACK_CHAIN;
  let lastError = null;

  for (let modelIdx = 0; modelIdx < models.length; modelIdx++) {
    const model = models[modelIdx];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const isFallback = modelIdx > 0;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const start = Date.now();
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(60000)
        });
        const elapsed = Date.now() - start;
        const data = await response.json();

        if (response.ok) {
          const logMsg = `[GEMINI] ${endpoint} OK con ${model}` +
            (isFallback ? ` (fallback ${modelIdx + 1}/${models.length})` : '') +
            (attempt > 1 ? ` en intento ${attempt}` : '') +
            ` (${elapsed}ms)`;
          console.log(logMsg);
          return { data, attempts: attempt, model, elapsed, fallback: isFallback };
        }

        const geminiErr = data.error || {};
        const status = response.status;

        if (isPermanentError(status, geminiErr)) {
          console.error(`[GEMINI] ${endpoint} PERMANENTE ${model}: ${status} ${geminiErr.message} (${elapsed}ms)`);
          throw { permanent: true, status, message: geminiErr.message, model, attempts: attempt };
        }

        if (attempt < maxRetries && isTemporaryError(status, geminiErr)) {
          const backoffMs = jitter(1000 * Math.pow(2, attempt - 1));
          console.log(`[GEMINI] ${endpoint} temporal ${model}: ${status} ${geminiErr.message} — retry ${attempt}/${maxRetries} en ${Math.round(backoffMs)}ms`);
          lastError = { status, message: geminiErr.message, model };
          await sleep(backoffMs);
          continue;
        }

        lastError = { status, message: geminiErr.message, model };
        console.error(`[GEMINI] ${endpoint} agota ${model}: ${status} ${geminiErr.message} (${elapsed}ms, intentos: ${attempt})`);
        break;

      } catch (err) {
        if (err.permanent) throw err;
        const elapsed = Date.now() - start;
        const isTimeout = err.name === 'TimeoutError' || err.code === 'ABORT_ERR';
        lastError = { status: 0, message: err.message, model };

        if (attempt < maxRetries) {
          const backoffMs = jitter(isTimeout ? 2000 : 1000 * Math.pow(2, attempt - 1));
          console.log(`[GEMINI] ${endpoint} ${isTimeout ? 'timeout' : 'conexion'} ${model} — retry ${attempt}/${maxRetries} en ${Math.round(backoffMs)}ms`);
          await sleep(backoffMs);
          continue;
        }
        console.error(`[GEMINI] ${endpoint} fallo conexion ${model}: ${err.message} (${elapsed}ms)`);
        break;
      }
    }

    if (modelIdx < models.length - 1) {
      console.log(`[GEMINI] ${endpoint} fallback a ${models[modelIdx + 1]}...`);
    }
  }

  throw lastError || { permanent: true, status: 0, message: 'Todos los modelos fallaron', model: models[0], attempts: 0 };
}

const SYSTEM_PROMPTS = {
  profesor: `Sos FIUBA Agent en modo PROFESOR. Explicá conceptos de FIUBA/UBA.

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

  tutor: `Sos FIUBA Agent en modo TUTOR SOCRÁTICO.

REGLAS DE FORMATO (CRÍTICAS - OBLIGATORIO):
- Respondé SIEMPRE en texto plano del chat con Markdown básico (negritas con **, listas con -)
- Para fórmulas matemáticas escribí en texto corrido: f(x) = x² + 2x
- NUNCA uses dólares ($) para matemática, NUNCA uses \`\`\`math, NUNCA uses LaTeX, NUNCA uses KaTeX
- Usá bloques de código SOLO para código de programación
- Si necesitás mostrar una fórmula, escribila en texto normal

No des la solución directa. Guía con preguntas que escalonan: pista 1 conceptual, pista 2 procedimental, pista 3 verificación. Cada turno: 1 pregunta orientadora + 1 micro-pista si se traba. Celebrá avances, corregí con empatía. Recordá el contexto de la conversación anterior.`,

  examinador: `Sos FIUBA Agent en modo EXAMINADOR. Seguí este PROTOCOLO:

1. PREPARACIÓN: Analizá los DOCUMENTOS y determiná materia, temas, dificultad. Si falta info, indícalo, NO inventes.

2. UNA SOLA PREGUNTA POR TURNO. No resuelvas antes de que el estudiante responda.

3. FORMATO: Respondé SOLO con JSON puro (sin markdown, sin texto extra):
   - PREGUNTAR: {"type":"question","question":"Enunciado exacto","topic":"Tema","difficulty":"baja|media|alta","source":"fragmento"}
   - EVALUAR: {"type":"evaluation","result":"correct|partially_correct|incorrect","score":0.0-1.0,"main_error":"Error o null","feedback":"Feedback breve","topic":"Tema","mastery_estimate":0.0-1.0,"next_action":"continue|finish"}
   - Sin material: {"type":"error","message":"No hay info suficiente..."}
   Nunca envuelvas el JSON en \`\`\` ni agregues texto fuera del JSON.`,

  resolucion: `Sos FIUBA Agent en modo RESOLUCIÓN PASO A PASO.

REGLAS DE FORMATO (CRÍTICAS - OBLIGATORIO):
- Respondé SIEMPRE en texto plano del chat con Markdown básico
- Para fórmulas matemáticas escribí en texto corrido
- NUNCA uses dólares ($) para matemática, NUNCA uses \`\`\`math, NUNCA uses LaTeX, NUNCA uses KaTeX
- Usá bloques de código SOLO para código de programación

Resolvé ejercicios paso a paso: cada paso numerado, con "por qué" en 1 línea, cuenta en texto plano, y al final verificación. Si hay imagen, transcribí el enunciado primero. Cerrá con "¿Querés que lo hagamos con otros datos?"`
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor FIUBA Agent funcionando correctamente' });
});

// --- Admin Bot: base de conocimiento local + fallback a IA ---
const LOCAL_ADMIN_KB = [
  { patterns: ['inscri', 'regular', 'cursada', 'inscribir'], answer: 'Inscripciones a cursada: Consultá SIU Guaraní (https://guarani.fi.uba.ar). Las inscripciones suelen abrir en diciembre para el 1er cuatrimestre y en mayo para el 2do. Requisito: estar habilitado en Guaraní.' },
  { patterns: ['final', 'mesa', 'examen', 'rendir', 'aprobar'], answer: 'Mesas de final: Se publican en la página de cada departamento. Generalmente hay mesas en junio/julio y noviembre/diciembre. Consultá: https://fi.uba.ar/sitio/materias-702' },
  { patterns: ['alumno regular', 'certificado'], answer: 'Certificado de alumno regular: Se genera desde SIU Guaraní. Entrá a tu cuenta > Trámites > Certificado de alumno regular.' },
  { patterns: ['guarani', 'siu'], answer: 'SIU Guaraní: https://guarani.fi.uba.ar — Es donde te inscribís a materias, consultás notas y generás certificados.' },
  { patterns: ['campus', 'virtual'], answer: 'Campus Virtual UBA: https://campus.fi.uba.ar — Plataforma de materiales, foros y entrega de trabajos prácticos.' },
  { patterns: ['biblioteca', 'biblio'], answer: 'Biblioteca FIUBA: https://cyt.fi.uba.ar/biblioteca — Préstamo de libros, salas de estudio y material de referencia.' },
  { patterns: ['equivalencia', 'convalida'], answer: 'Equivalencias: Se tramitan en la Secretaría Académica de FIUBA. Necesitá el programa de la materia que querés equivaler y el original que ya aprobaste.' },
  { patterns: ['libreta', 'libreto'], answer: 'Libreta de estudiante: Se retira en la Secretaría de FIUBA con DNI. Algunas facultades la digitalizaron en Guaraní.' },
  { patterns: ['cbc'], answer: 'CBC (Ciclo Básico Común): https://cbc.uba.ar — Información sobre ingreso, mesas de examen y equivalencias del CBC.' },
  { patterns: ['departamento', 'secretaria'], answer: 'Secretarías de FIUBA: https://fi.uba.ar — Secretaría Académica, Departamental y de Estudiantes. Horario: lunes a viernes 9-17hs.' },
  { patterns: ['centro estudiante', 'centro de estudiante'], answer: 'Centros de estudiantes de FIUBA: Consultá en https://fi.uba.ar/sitio/centros-de-estudiantes para contactarte con tu centro.' },
  { patterns: ['universidad', 'uba'], answer: 'Sitio oficial UBA: https://www.uba.ar — Información general de la universidad, noticias y trámites.' },
  { patterns: ['horario', 'cursada'], answer: 'Horarios de cursada: Se publican en el Campus Virtual de cada materia y en Guaraní al momento de inscribirte.' },
  { patterns: ['nota', 'promedio', 'grade'], answer: 'Consulta de notas: Entrá a SIU Guaraní > Mis Materias > Notas. El promedio se calcula automáticamente.' },
  { patterns: ['beca', 'ayuda'], answer: 'Becas y ayudas económicas: https://www.uba.ar/sitio/becas — UBA ofrece becas de estudio, alimentación y alojamiento.' },
  { patterns: ['pago', 'arancel', 'cuota'], answer: 'FIUBA es gratuita. No hay aranceles ni cuotas para cursar ni rendir. Solo necesitás estar habilitado en Guaraní.' },
  { patterns: ['altillo', 'parcial'], answer: 'Parciales del Altillo: https://www.altillo.com — Repositorio de parciales y resúmenes de materias de FIUBA/UBA.' }
];

app.post('/api/admin-qa', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Falta la pregunta' });
    }

    const q = question.toLowerCase();

    for (const entry of LOCAL_ADMIN_KB) {
      if (entry.patterns.some(p => q.includes(p))) {
        return res.json({ answer: entry.answer });
      }
    }

    const apiKey = (req.body.userApiKey || '').trim() || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return res.json({ answer: 'No tengo tu API Key configurada. Andá a ⚙️ Servidor IA y pegá tu clave de Google AI Studio (gratuita en aistudio.google.com). Mientras tanto, consultá en https://fi.uba.ar' });
    }

    const systemInstruction = context || 'Sos un asistente administrativo de FIUBA. Respondé preguntas sobre trámites, inscripciones, fechas de parciales y links oficiales de UBA.';
    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: question }] }],
      generationConfig: { temperature: 0.3 }
    };

    let result;
    try {
      result = await callGeminiWithRetry(apiKey, payload, { endpoint: 'admin-qa' });
    } catch (err) {
      return res.json({ answer: 'No pude responder con IA en este momento. Consultá en https://fi.uba.ar' });
    }

    const reply = result.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se recibió respuesta.';
    return res.json({ answer: reply });
  } catch (error) {
    console.error('admin-qa error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

// --- Chat ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message, mode = 'profesor', context = '', examState = null, userApiKey, image, history = [] } = req.body;

    if ((!message || message.trim() === '') && !image) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    const apiKey = (userApiKey && userApiKey.trim()) || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return res.status(400).json({ error: 'Falta tu API Key - pegala en ⚙️ Servidor IA (aistudio.google.com/app/apikey)' });
    }

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
      for (const msg of history) {
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
      result = await callGeminiWithRetry(apiKey, payload, { endpoint: 'chat' });
    } catch (err) {
      const isQuota = (err.message || '').toLowerCase().includes('quota');
      return res.status(err.permanent ? 503 : 500).json({
        error: isQuota
          ? 'Sin cuota disponible. Esperá a mañana o activá billing en Google AI Studio.'
          : 'El servicio de IA está temporalmente sobrecargado. Intentá nuevamente en unos segundos.',
        retryable: !err.permanent && !isQuota
      });
    }

    const data = result.data;
    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se recibió respuesta del modelo.';

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

    res.json({ reply, isMock: false });

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
    const apiKey = (userApiKey && userApiKey.trim()) || process.env.GEMINI_API_KEY || '';
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
      return res.status(503).json({ error: 'El servicio de IA está temporalmente ocupado. Intentá generar el quiz en unos segundos.', retryable: true });
    }

    let text = result.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
    const apiKey = (userApiKey && userApiKey.trim()) || process.env.GEMINI_API_KEY || '';
    if (!apiKey) return res.status(400).json({ error: 'Falta tu API Key - pegala en ⚙️ Servidor IA' });
    const fcCount = Math.min(Math.max(parseInt(count) || 8, 3), 12);
    const system = `Sos generador de flashcards para FIUBA. Basándote EXCLUSIVAMENTE en el texto proporcionado, generá ${fcCount} flashcards de repaso espaciado. Cada flashcard: front pregunta corta y concreta, back respuesta breve y memorizable (máx 15 palabras), topic tema. Devolvé JSON PURO {"flashcards":[{"front":"...","back":"...","topic":"..."}] }. No inventes datos no presentes.`;
    const truncated = rawText.slice(0, 9000);
    const payload = { system_instruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: `[TEXTO DEL PDF]\n${truncated}` }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.5 } };

    let result;
    try {
      result = await callGeminiWithRetry(apiKey, payload, { endpoint: 'flashcards' });
    } catch (err) {
      return res.status(503).json({ error: 'El servicio de IA está temporalmente ocupado. Intentá generar las flashcards en unos segundos.', retryable: true });
    }

    let text = result.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
  console.log(`Servidor FIUBA Agent corriendo en http://localhost:${PORT}`);
  console.log(`Endpoint de Chat: http://localhost:${PORT}/api/chat`);
});
