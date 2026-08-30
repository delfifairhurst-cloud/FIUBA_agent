// progress.js - UI para Memoria Académica v1
import { authReady, getUid, logAttempt, getRecentAttempts } from "./firebase.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

function openAttemptModal() {
  const m = document.getElementById("attempt-modal");
  m?.classList.add("open");
  // Pre-llenar con último tema si existe
  const activeChat = window.getActiveChat ? window.getActiveChat() : null;
  if (activeChat && activeChat.mode) {
    // sugerir materia basada en último mensaje
  }
}
function closeAttemptModal() {
  document.getElementById("attempt-modal")?.classList.remove("open");
}
async function handleSaveAttempt() {
  const subject = document.getElementById("attempt-subject")?.value.trim();
  const topic = document.getElementById("attempt-topic")?.value.trim();
  const result = document.getElementById("attempt-result")?.value;
  const attempts = document.getElementById("attempt-tries")?.value;
  const hintsUsed = document.getElementById("attempt-hints")?.value;
  const timeSpentSec = document.getElementById("attempt-time")?.value;
  const confidence = document.getElementById("attempt-confidence")?.value;
  const errorType = document.getElementById("attempt-errortype")?.value;

  if (!subject || !topic) {
    alert("Completá materia y tema (obligatorios)");
    return;
  }
  try {
    const chat = window.getActiveChat ? window.getActiveChat() : { mode: "profesor", id: "" };
    const lastMsg = chat.messages?.slice(-1)[0]?.text || "";
    await logAttempt({
      subject, topic, result,
      attempts, hintsUsed, timeSpentSec, confidence, errorType,
      exerciseSnippet: lastMsg.slice(0,200),
      mode: chat.mode,
      chatId: chat.id
    });
    closeAttemptModal();
    // limpiar
    document.getElementById("attempt-subject").value = "";
    document.getElementById("attempt-topic").value = "";
    document.getElementById("attempt-time").value = "";
    await refreshRecent();
    // Gamificación: XP por intento registrado
    if (window.Gamification) {
      window.Gamification.trackAttempt();
      const r = window.Gamification.addXp('attempt_logged');
      if (window.processGamificationResult) window.processGamificationResult(r);
    }
    // feedback en chat
    if (window.appendMessageDOM) {
      window.appendMessageDOM("agent", `✅ **Intento guardado**: ${subject} / ${topic} — ${result === "correct" ? "Correcto" : result === "incorrect" ? "Incorrecto" : "Parcial"} (confianza: ${confidence || "—"})`);
    }
  } catch (e) {
    console.error(e);
    alert("No se pudo guardar: " + e.message + "\n¿Habilitaste Firestore y Auth anónima en Firebase Console?");
  }
}

async function refreshRecent() {
  try {
    const list = await getRecentAttempts(5);
    const container = document.getElementById("recent-attempts");
    const badge = document.getElementById("attempts-count");
    if (badge) badge.textContent = `${list.length} intentos`;
    if (!container) return;
    if (list.length === 0) {
      container.innerHTML = `<div style="font-size:0.78rem;color:var(--text-muted);text-align:center;padding:0.5rem">Aún no hay intentos. ¡Registrá el primero!</div>`;
      return;
    }
    container.innerHTML = list.map(a => {
      const icon = a.result === "correct" ? "✅" : a.result === "incorrect" ? "❌" : "🟡";
      const conf = a.confidence ? `· ${a.confidence}/5` : "";
      const date = a.createdAt?.toDate ? a.createdAt.toDate().toLocaleDateString() : "";
      return `<div class="attempt-chip"><span>${icon} <strong>${a.subject}</strong> / ${a.topic}</span><span style="font-size:0.7rem;color:var(--text-muted)">${date} ${conf}</span></div>`;
    }).join("");
  } catch (e) {
    console.error("refreshRecent:", e);
  }
}

// Exponer globales para onclick inline
window.openAttemptModal = openAttemptModal;
window.closeAttemptModal = closeAttemptModal;
window.handleSaveAttempt = handleSaveAttempt;
window.refreshRecent = refreshRecent;

// Al iniciar, esperar auth y cargar
authReady.then(() => {
  refreshRecent();
  // refrescar cada 30s por si hay cambios
  setInterval(refreshRecent, 30000);
});
window.addEventListener("fiuba-auth-ready", refreshRecent);
