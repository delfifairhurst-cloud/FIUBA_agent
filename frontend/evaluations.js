// evaluations.js - Evaluaciones desde parciales del Altillo + autoevaluación
import { db, getUid, authReady } from "./firebase.js";
import { collection, addDoc, getDocs, getDoc, doc, query, orderBy, serverTimestamp, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Crear evaluación desde texto digitalizado o manual
export async function createEvaluation({ title, source = "Altillo", questions }) {
  const uid = getUid();
  if (!uid) throw new Error("Iniciá sesión");
  if (!title || !questions || questions.length === 0) throw new Error("Falta título o preguntas");
  const ref = collection(db, `users/${uid}/evaluations`);
  const docRef = await addDoc(ref, {
    title: title.trim(),
    source,
    questions: questions.map((q, i) => ({
      id: q.id || `q${i+1}`,
      statement: (q.statement || "").trim(),
      statementImage: q.statementImage || null, // imagen del enunciado si es foto
      topic: (q.topic || "General").trim(),
      type: q.type || "open", // "open" | "multiple_choice"
      options: q.options || [], // ["A) ...","B) ..."]
      correctAnswer: q.correctAnswer || "",
      points: Number(q.points) || 1
    })),
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getEvaluations() {
  const uid = getUid();
  if (!uid) return [];
  const ref = collection(db, `users/${uid}/evaluations`);
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getEvaluation(evalId) {
  const uid = getUid();
  const ref = doc(db, `users/${uid}/evaluations/${evalId}`);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function deleteEvaluation(evalId) {
  const uid = getUid();
  await deleteDoc(doc(db, `users/${uid}/evaluations/${evalId}`));
}

// Guardar intento de evaluación y calcular nota
export async function submitEvaluationAttempt(evaluation, answers) {
  // answers: [{questionId, answer: "texto o A/B/C"}]
  const uid = getUid();
  if (!uid) throw new Error("Iniciá sesión");
  let correct = 0;
  let totalPoints = 0, earnedPoints = 0;
  const perTopic = {}; // { topic: {correct, total} }

  evaluation.questions.forEach(q => {
    const ans = answers.find(a => a.questionId === q.id);
    const userAns = (ans?.answer || "").trim();
    const isMultiple = q.type === "multiple_choice";
    let isCorrect = false;
    if (isMultiple && q.correctAnswer) {
      // compara letra normalizada: "A" vs "A) ..." 
      const norm = (s) => s.trim().toUpperCase().replace(/^[A-D]\)?\s*/, "").trim() || s.trim().toUpperCase().charAt(0);
      // si correctAnswer es "B" y userAns es "B" o "B) ...", es correcto
      const ca = q.correctAnswer.trim().toUpperCase();
      const ua = userAns.trim().toUpperCase();
      if (ca.length === 1 && ua.length >=1) isCorrect = ua.startsWith(ca);
      else isCorrect = ua === ca;
    } else {
      // para abiertas en v1: no auto-corrige, marca como "a revisar" y no cuenta como correcta salvo que usuario se auto-evalue
      // si el usuario puso algo, lo dejamos como "partial" y no suma puntos auto
      isCorrect = false;
    }
    totalPoints += q.points;
    if (isCorrect) earnedPoints += q.points;
    if (isMultiple) correct += isCorrect ? 1 : 0;

    const t = q.topic || "General";
    if (!perTopic[t]) perTopic[t] = { correct:0, total:0, points:0, earned:0 };
    perTopic[t].total += 1;
    perTopic[t].points += q.points;
    if (isCorrect) { perTopic[t].correct +=1; perTopic[t].earned += q.points; }
  });

  // Nota sobre 10 y porcentaje
  const percentage = totalPoints ? Math.round((earnedPoints/totalPoints)*100) : 0;
  const score10 = Math.round((percentage/100)*10 *10)/10;
  // Para evaluaciones mixtas (abiertas), el % es solo sobre multiple choice auto-corregibles
  const autoQs = evaluation.questions.filter(q=>q.type==="multiple_choice").length;
  const autoMsg = evaluation.questions.some(q=>q.type==="open") ? " (solo multiple choice auto-corregido, abiertas a revisión)" : "";

  const ref = collection(db, `users/${uid}/evaluationAttempts`);
  const docRef = await addDoc(ref, {
    evaluationId: evaluation.id,
    evaluationTitle: evaluation.title,
    answers,
    correct,
    total: evaluation.questions.length,
    earnedPoints,
    totalPoints,
    percentage,
    score10,
    perTopic,
    autoMsg,
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, percentage, score10, correct, total: evaluation.questions.length, perTopic, autoMsg };
}

export async function getEvaluationAttempts() {
  const uid = getUid();
  if (!uid) return [];
  const ref = collection(db, `users/${uid}/evaluationAttempts`);
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Helper: parsear texto de PDF a preguntas editables - v2 más conservador
export function parsePdfTextToQuestions(rawText) {
  if (!rawText || rawText.trim().length < 10) return [];

  let text = rawText.replace(/--- PÁGINA \d+ ---/g, "\n").replace(/\r/g, "\n");

  let chunks = [];
  // Prioridad 1: Separar por "Ejercicio N:" en cualquier posición (tu caso: Ejercicio 1: Ejercicio 2: ...)
  const ejercicioRegex = /Ejercicio\s*\d+\s*[:\.\)\-]*\s*/gi;
  let ejercicioMarkers = [...text.matchAll(ejercicioRegex)];
  if (ejercicioMarkers.length >= 2 && ejercicioMarkers.length <= 15) {
    for (let i = 0; i < ejercicioMarkers.length; i++) {
      const start = ejercicioMarkers[i].index;
      const end = i + 1 < ejercicioMarkers.length ? ejercicioMarkers[i+1].index : text.length;
      const chunk = text.slice(start, end).trim();
      if (chunk.length > 25 && chunk.length < 4000) chunks.push(chunk);
    }
  }

  // Prioridad 2: Si no hay Ejercicio, buscar marcadores al inicio de línea (evita confundir opciones a) b))
  if (chunks.length < 2) {
    const markerRegex = /(?:^|\n)[ \t]*(?:(?:\d{1,2}\s*[\.\)]\s+)|(?:Pregunta\s*\d+[\)\.\:\-]?\s+)|(?:Problema\s*\d+[\)\.\:\-]?\s+)|(?:Item\s*\d+[\)\.\:\-]?\s+))/g;
    let markers = [];
    let m;
    while ((m = markerRegex.exec(text)) !== null) {
      const rawMatch = m[0];
      const trimmed = rawMatch.trimStart();
      const offset = rawMatch.length - trimmed.length;
      markers.push({ index: m.index + offset, text: trimmed });
    }
    if (markers.length >= 2 && markers.length <= 20) {
      chunks = [];
      for (let i = 0; i < markers.length; i++) {
        const start = markers[i].index;
        const end = i + 1 < markers.length ? markers[i+1].index : text.length;
        const chunk = text.slice(start, end).trim();
        if (chunk.length > 25 && chunk.length < 4000) chunks.push(chunk);
      }
    }
  }

  // Si no hay marcadores claros o hay demasiados (falso positivo), usar párrafos
  if (chunks.length < 2) {
    const paras = text.split(/\n\s*\n/).map(p=>p.trim()).filter(p=>p.length>40);
    // Si hay 3-15 párrafos de longitud razonable, usarlos (típico parcial 10 preguntas)
    if (paras.length >= 2 && paras.length <= 15) {
      chunks = paras;
    } else {
      // Fallback conservador: si no hay estructura, devolver texto como 1 sola pregunta para edición manual
      // No agrupar de a 4 líneas porque genera 30 preguntas falsas
      chunks = [text.trim()];
    }
  }

  // Filtrar y limitar: máximo 15 preguntas (no 30), evita 10 -> 30
  chunks = chunks.filter(c => c.length > 30 && c.length < 4000);
  chunks = [...new Set(chunks)];
  if (chunks.length === 1 && chunks[0].length > 1200) {
    // Solo si un chunk es gigante, intentar split secundario por número al inicio de línea
    const inner = chunks[0].split(/\n(?=\s*\d{1,2}\s*[\.\)]\s+[A-ZÁÉÍÓÚ])/g).filter(c=>c.trim().length>40);
    if (inner.length >= 2 && inner.length <= 15) chunks = inner;
  }

  return chunks.slice(0,15).map((statement, i) => {
    // Detectar multiple choice solo si hay 2+ opciones con patrón A) ... en líneas separadas
    const optionLines = statement.split(/\n/).filter(l=>/^\s*[A-D]\)\s+/.test(l));
    const hasOptions = optionLines.length >= 2;
    const opts = hasOptions ? optionLines.map(s=>s.trim()).slice(0,5) : [];
    return {
      id: `q${i+1}`,
      statement: statement.slice(0,900).trim(),
      topic: hasOptions ? "Multiple Choice" : "General",
      type: hasOptions ? "multiple_choice" : "open",
      options: opts,
      correctAnswer: "",
      points: 1
    };
  });
}

window.evaluationsAPI = { createEvaluation, getEvaluations, getEvaluation, deleteEvaluation, submitEvaluationAttempt, getEvaluationAttempts, parsePdfTextToQuestions };
