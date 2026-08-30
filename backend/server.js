import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend web
app.use(express.json({ limit: '10mb' })); // Permite procesar datos JSON en las peticiones + fotos

// Instrucciones del sistema según el modo de estudio seleccionado - pulidas para ser mejor que cualquier IA genérica
const SYSTEM_PROMPTS = {
  profesor: `Sos FIUBA Agent en modo PROFESOR PRO. Explicá conceptos de FIUBA/UBA con rigor pero sin humo. Estructura: 1) Idea clave en 1 línea, 2) Desarrollo con analogía de ingeniería real, 3) Ejemplo mínimo con cuentas en bloque de código, 4) Check de comprensión con 1 pregunta al final. Usá Markdown prolijo, inline \`x=2\` o bloque \`\`\`math para fórmulas, y cerrá siempre preguntando si quiere profundizar o ver otro enfoque. Si hay imagen, describí qué ves primero y luego resolvé.`,

  tutor: `Sos FIUBA Agent en modo TUTOR SOCRÁTICO PRO. No des la solución directa. Guía con preguntas que escalonan: pista 1 conceptual, pista 2 procedimental, pista 3 verificación. Cada turno: 1 pregunta orientadora + 1 micro-pista si se traba. Celebrá avances, corregí con empatía y pedí que el estudiante explique su razonamiento. Si hay imagen con ejercicio, pedí que describa qué ve antes de resolver.`,

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

// Endpoint de verificación (Healthcheck)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor FIUBA Agent funcionando correctamente' });
});

// Generar quiz estructurado desde texto del PDF usando Gemini
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

    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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

// Generar flashcards desde texto del PDF
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
    const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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

// Importar parciales del Altillo - organiza en tu Biblioteca (solo metadata, con atribución)
app.get('/api/altillo/import', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || !url.includes('altillo.com')) return res.status(400).json({ error: 'URL debe ser de altillo.com' });
    // Validar que sea http
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
    // Parsear secciones: Primer Parcial, Segundo Parcial, etc
    const sections = [];
    // Buscar bloques <a name="...">Titulo</a> y luego <a href="...">Parcial X</a>
    const sectionRegex = /<a name="[^"]*">\s*([^<]+)\s*<\/a>/gi;
    let secMatch;
    const secPositions = [];
    while ((secMatch = sectionRegex.exec(html)) !== null) {
      secPositions.push({ title: secMatch[1].replace(/<[^>]*>/g,'').trim(), index: secMatch.index });
    }
    // Si no hay anchors, usar fallback por texto
    if (secPositions.length === 0) {
      const fallback = html.match(/(Primer Parcial|Segundo Parcial|Examen Integrador|Final)/gi) || [];
      fallback.forEach(t=> secPositions.push({ title: t, index: html.indexOf(t) }));
    }
    // Extraer todos los links a parciales
    const linkRegex = /<a\s+href="([^"]+\.(?:pdf|asp))"[^>]*>([^<]+)<\/a>/gi;
    let m;
    const allLinks = [];
    while ((m = linkRegex.exec(html)) !== null) {
      const href = m[1].trim();
      const label = m[2].trim().replace(/\s+/g,' ');
      // Resolver URL relativa
      let abs = href;
      if (!abs.startsWith('http')) {
        const base = target.substring(0, target.lastIndexOf('/')+1);
        abs = base + href;
      }
      // Determinar sección por posición
      let section = "General";
      for (let i=secPositions.length-1; i>=0; i--) {
        if (m.index > secPositions[i].index) { section = secPositions[i].title; break; }
      }
      // Año cercano: buscar "2026:" "2025:" antes del link
      const before = html.slice(Math.max(0, m.index-300), m.index);
      const yearMatch = before.match(/(20\d{2})\s*:/);
      const year = yearMatch ? yearMatch[1] : "";
      allLinks.push({ label, href: abs, section: section.replace(/\s+/g,' ').trim(), year });
    }
    // Agrupar por sección
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

// Endpoint del Chat
app.post('/api/admin-qa', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Falta la pregunta' });
    }

    const apiKey = (req.body.userApiKey || '').trim();
    if (!apiKey) {
      return res.json({ answer: 'Necesito una API Key configurada en ⚙️ Servidor IA para responder. Por ahora no tengo esa info, consultá en https://uba.ar' });
      return;
    }

    const systemInstruction = context || 'Sos un asistente administrativo de FIUBA. Respondé preguntas sobre tramites, inscripciones, fechas de parciales y links oficiales de UBA.';
    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: question }] }],
      generationConfig: { temperature: 0.3 }
    };

    const models = [process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-1.5-flash'].filter(Boolean);
    let reply = null;

    for (const model of models) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se recibio respuesta.';
        break;
      }
      console.error(`admin-qa error (${model}):`, data.error?.message);
    }

    res.json({ answer: reply || 'No se pudo obtener respuesta. Intenta de nuevo.' });
  } catch (error) {
    console.error('admin-qa error:', error);
    res.status(500).json({ error: 'Error interno' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, mode = 'profesor', context = '', examState = null, userApiKey, image } = req.body;

    if ((!message || message.trim() === '') && !image) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    const apiKey = (userApiKey && userApiKey.trim()) || '';
    if (!apiKey) {
      return res.status(400).json({ error: 'Falta tu API Key - pegala en ⚙️ Servidor IA (aistudio.google.com/app/apikey)' });
    }

    // Seleccionar el System Prompt según el modo
    const systemInstruction = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.profesor;

    // Si el usuario cargó apuntes o parciales en PDF, los adjuntamos como contexto pedagógico
    let promptContent = message;
    if (context && context.trim().length > 0) {
      promptContent = `[DOCUMENTOS Y MATERIALES ACADÉMICOS PROPORCIONADOS POR EL ESTUDIANTE]\n${context}\n\n[CONSULTA DEL ESTUDIANTE]\n${message}`;
    }
    // Estado del examen para modo examinador (controlado por frontend)
    if (mode === 'examinador' && examState) {
      promptContent += `\n\n[ESTADO DEL EXAMEN - NO INVENTAR, RESPETAR]\n${JSON.stringify(examState, null, 2)}`;
    }

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: promptContent || "Analizá esta imagen del ejercicio y resolvé paso a paso." }]
        }
      ]
    };
    if (image && image.data) {
      payload.contents[0].parts.push({ inlineData: { mimeType: image.mimeType || 'image/jpeg', data: image.data } });
    }
    // Forzar JSON en modo examinador si el modelo lo soporta
    if (mode === 'examinador') {
      payload.generationConfig = { responseMimeType: "application/json" };
    }

    const models = [process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'].filter(Boolean);
    let data = null;
    let lastError = 'Error desconocido';

    for (const model of models) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      data = await response.json();
      if (response.ok) break;
      lastError = data.error?.message || JSON.stringify(data);
      console.error(`Error de Gemini (${model}):`, lastError);
      data = null;
    }

    if (!data) {
      return res.status(500).json({
        error: 'Hubo un inconveniente al comunicarse con el servicio de IA.',
        details: lastError
      });
    }

    // Extraer la respuesta del modelo
    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se recibió respuesta del modelo.';

    // Modo examinador: intentar devolver JSON estructurado
    if (mode === 'examinador') {
      let jsonData = null;
      let clean = reply.trim();
      // Quitar fences markdown si el modelo los agregó
      clean = clean.replace(/^```json\s*/i, '').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();
      try {
        jsonData = JSON.parse(clean);
      } catch (e) {
        // Intentar extraer primer objeto JSON del texto
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) {
          try { jsonData = JSON.parse(match[0]); clean = match[0]; } catch {}
        }
      }
      if (jsonData) {
        return res.json({ reply: clean, isMock: false, isExaminerJson: true, examinerData: jsonData });
      }
      // Si no es JSON válido, devolver como texto pero marcar para que frontend lo maneje
      return res.json({ reply, isMock: false, isExaminerJson: false });
    }

    res.json({ reply, isMock: false });

  } catch (error) {
    console.error('Error interno en /api/chat:', error);
    res.status(500).json({ error: 'Error interno en el servidor.' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor FIUBA Agent corriendo en http://localhost:${PORT}`);
  console.log(`📌 Endpoint de Chat: http://localhost:${PORT}/api/chat`);
});
