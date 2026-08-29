const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const SYSTEM_PROMPTS = {
  profesor: `Sos FIUBA Agent en modo PROFESOR. Tu objetivo es explicar conceptos de ingeniería de la UBA/FIUBA (matemática, física, química, programación, etc.) de forma didáctica, clara y rigurosa. Utilizá analogías sencillas, ejemplos de aplicación práctica y formato en Markdown con fórmulas en TeX si es necesario.`,
  tutor: `Sos FIUBA Agent en modo TUTOR ACADÉMICO. Tu objetivo es guiar al estudiante de ingeniería para que descubra la respuesta por sí mismo. NUNCA des la resolución completa inmediatamente. Hacé preguntas orientadoras, da pistas sutiles y ayuda a estructurar el pensamiento del estudiante.`,
  examinador: `Sos FIUBA Agent en modo EXAMINADOR. Tu objetivo es evaluar al estudiante como en un parcial o final de FIUBA. Hacé una pregunta técnica sobre el tema que mencione el estudiante, esperá su respuesta, evalúa su precisión conceptual y dale retroalimentación constructiva.`,
  resolucion: `Sos FIUBA Agent en modo RESOLUCIÓN PASO A PASO. Tu objetivo es resolver ejercicios de ingeniería detallando minuciosamente cada paso matemático, principio físico o lógica de código. Explicá el 'por qué' de cada paso.`
};

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "FIUBA Agent Functions funcionando" });
});

app.post("/chat", async (req, res) => {
  try {
    const { message, mode = "profesor", context = "" } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "El mensaje no puede estar vacío." });
    }

    const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key || "";
    if (!apiKey || apiKey === "tu_api_key_aqui") {
      return res.json({
        reply: `¡Hola! Soy **FIUBA Agent** (modo ${mode.toUpperCase()}).\n\nVeo que el backend en Firebase está **funcionando**, pero falta configurar tu **GEMINI_API_KEY** en la config de Functions.\n\n### 🔑 Pasos:\n1. En Google AI Studio generá tu clave gratis.\n2. Configurala con:\n\`firebase functions:config:set gemini.key=\"TU_CLAVE\"\`\n3. Luego \`firebase deploy --only functions\`\n\n¡Tu interfaz ya está lista!`,
        isMock: true
      });
    }

    const systemInstruction = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.profesor;
    let promptContent = message;
    if (context && context.trim().length > 0) {
      promptContent = `[DOCUMENTOS Y MATERIALES ACADÉMICOS]\n${context}\n\n[CONSULTA]\n${message}`;
    }

    const payload = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: "user", parts: [{ text: promptContent }] }]
    };

    const models = [process.env.GEMINI_MODEL, "gemini-2.5-flash", "gemini-1.5-flash"].filter(Boolean);
    let data = null;
    let lastError = "Error desconocido";
    for (const model of models) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      data = await response.json();
      if (response.ok) break;
      lastError = data.error?.message || JSON.stringify(data);
      console.error(`Error Gemini (${model}):`, lastError);
      data = null;
    }

    if (!data) {
      return res.status(500).json({ error: "Error con servicio IA", details: lastError });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No se recibió respuesta.";
    res.json({ reply, isMock: false });
  } catch (error) {
    console.error("Error /chat:", error);
    res.status(500).json({ error: "Error interno", details: String(error) });
  }
});

// Exponer como Cloud Function v1 (gratis en free tier hasta límite)
exports.api = functions.https.onRequest(app);
