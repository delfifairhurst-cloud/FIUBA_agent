import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const SYSTEM_PROMPTS = {
  profesor: `Sos FIUBA Agent en modo PROFESOR PRO. Explicá conceptos de FIUBA/UBA con rigor pero sin humo. Estructura: 1) Idea clave en 1 línea, 2) Desarrollo con analogía de ingeniería real, 3) Ejemplo mínimo con cuentas en bloque de código, 4) Check de comprensión con 1 pregunta al final. Usá Markdown prolijo, inline \`x=2\` o bloque \`\`\`math para fórmulas, y cerrá siempre preguntando si quiere profundizar o ver otro enfoque. Si hay imagen, describí qué ves primero y luego resolvé. IMPORTANTE: Si el estudiante te responde algo, recordá el contexto de la conversación anterior. No asumas que es un tema nuevo a menos que lo pida explícitamente. Respondé siempre en relación a lo que se habló previamente.`,

  tutor: `Sos FIUBA Agent en modo TUTOR SOCRÁTICO PRO. No des la solución directa. Guía con preguntas que escalonan: pista 1 conceptual, pista 2 procedimental, pista 3 verificación. Cada turno: 1 pregunta orientadora + 1 micro-pista si se traba. Celebrá avances, corregí con empatía y pedí que el estudiante explique su razonamiento. Si hay imagen con ejercicio, pedí que describa qué ve antes de resolver. IMPORTANTE: Recordá siempre el contexto de la conversación anterior. Si el estudiante responde a una pregunta tuya, continuá desde ahí. No reinicies el tema.`,

  examinador: `Sos FIUBA Agent en modo EXAMINADOR ESTRICTO PRO. Seguí este PROTOCOLO OBLIGATORIO:

1. PREPARACIÓN: Analizá los DOCUMENTOS proporcionados y determiná materia, temas, subtemas, tipo de ejercicios y dificultad. Si falta info, indícalo, NO inventes.

2. UNA SOLA PREGUNTA POR TURNO: Nunca hagas 2 preguntas. No resuelvas antes de que el estudiante responda. No des pistas automáticas. Si hay imagen, generá la pregunta basándote en ella.

3. FUENTE: Basate PRIORITARIAMENTE en los archivos. Si el modo es "solo material" y no hay info suficiente, responde con JSON de error, NO inventes conceptos que no están en los archivos.

4. EVALUACIÓN BREVE: Después de cada respuesta evalúa corrección, precisión, razonamiento. Diferenciá correct / partially_correct / incorrect. Feedback MÁXIMO 2-3 líneas: indica si es correcta, error principal y por qué. No des clase extensa.

5. ESTADO: El frontend controla número de pregunta, total, score. Vos solo generás la siguiente acción en JSON.

6. FORMATO OBLIGATORIO JSON PURO (sin markdown, sin texto extra):
   - Para PREGUNTAR: {"type":"question","question":"Enunciado exacto de 1 pregunta","topic":"Tema","difficulty":"baja|media|alta","source":"fragmento o concepto del archivo"}
   - Para EVALUAR: {"type":"evaluation","result":"correct|partially_correct|incorrect","score":0.0-1.0,"main_error":"Error principal o null","feedback":"Feedback breve 2 líneas","topic":"Tema","mastery_estimate":0.0-1.0,"next_action":"continue|finish"}
   - Si no hay material suficiente: {"type":"error","message":"No hay información suficiente en los archivos para..."}
   Nunca envuelvas el JSON en \`\`\` ni agregues texto fuera del JSON.`,

  resolucion: `Sos FIUBA Agent en modo RESOLUCIÓN PASO A PASO PRO. Resolvé ejercicios como lo haría el mejor ayudante de FIUBA: cada paso numerado, con "por qué" en 1 línea, cuenta en bloque \`\`\`math o \`code\`, y al final verificación / atajo / error común. Si hay imagen, transcribí el enunciado primero y luego resolvé. Cerrá con "¿Querés que lo hagamos con otros datos?"`
};

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

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

    const apiKey = (req.body.userApiKey || '').trim();
    if (!apiKey) {
      return res.json({ answer: 'No tengo tu API Key configurada. Andá a ⚙️ Servidor IA y pegá tu clave de Google AI Studio (gratuita en aistudio.google.com). Mientras tanto, consultá en https://fi.uba.ar' });
    }

    const systemInstruction = context || 'Sos un asistente administrativo de FIUBA. Respondé preguntas sobre trámites, inscripciones, fechas de parciales y links oficiales de UBA.';
    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: question }] }],
      generationConfig: { temperature: 0.3 }
    };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (response.ok) {
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se recibió respuesta.';
      return res.json({ answer: reply });
    }
    console.error('admin-qa Gemini error:', data.error?.message);
    res.json({ answer: 'No pude responder con IA. Consultá en https://fi.uba.ar' });
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

    const apiKey = (userApiKey && userApiKey.trim()) || '';
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

    // Construir contents con historial + mensaje actual
    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        if (msg.role && msg.parts && msg.parts.length > 0) {
          contents.push({ role: msg.role, parts: msg.parts });
        }
      }
    }
    // Si el último mensaje del historial ya es del usuario, lo reemplazamos; si no, lo agregamos
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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (!response.ok) {
      console.error(`Error de Gemini (${MODEL}):`, data.error?.message);
      return res.status(500).json({
        error: 'Hubo un inconveniente al comunicarse con el servicio de IA.',
        details: data.error?.message || JSON.stringify(data)
      });
    }

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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini quiz error', data);
      return res.status(500).json({ error: data.error?.message || 'Error Gemini' });
    }
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();
    let json;
    try { json = JSON.parse(text); } catch { const m=text.match(/\{[\s\S]*\}/); if(m) json=JSON.parse(m[0]); else throw new Error('No JSON'); }
    const questions = (json.questions || []).slice(0, quizCount);
    res.json({ questions });
  } catch(e){
    console.error('generate-quiz error', e);
    res.status(500).json({ error: String(e.message || e) });
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
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) { console.error('Gemini flashcards error', data); return res.status(500).json({ error: data.error?.message || 'Error Gemini' }); }
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/^```json\s*/i,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();
    let json; try { json = JSON.parse(text); } catch { const m=text.match(/\{[\s\S]*\}/); if(m) json=JSON.parse(m[0]); else throw new Error('No JSON'); }
    const flashcards = (json.flashcards || []).slice(0, fcCount);
    res.json({ flashcards });
  } catch(e){ console.error('generate-flashcards error', e); res.status(500).json({ error: String(e.message || e) }); }
});

// --- Importar parciales del Altillo ---
app.get('/api/altillo/import', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || !url.includes('altillo.com')) return res.status(400).json({ error: 'URL debe ser de altillo.com' });
    let target = url;
    if (!target.startsWith('http')) target = 'https://' + target;
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
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor FIUBA Agent corriendo en http://localhost:${PORT}`);
  console.log(`Endpoint de Chat: http://localhost:${PORT}/api/chat`);
});
