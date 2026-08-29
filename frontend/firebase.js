// Firebase Auth con Email/Contraseña + Firestore - FIUBA Agent
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXvQ1QfLv8lkWuF3-Q-24Musj66fiiIFE",
  authDomain: "agente-fiuba.firebaseapp.com",
  projectId: "agente-fiuba",
  storageBucket: "agente-fiuba.firebasestorage.app",
  messagingSenderId: "586234198670",
  appId: "1:586234198670:web:69b355051ef13210b567df",
  measurementId: "G-DBWLZ90JMV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let currentUid = null;
let authReadyResolve;
export const authReady = new Promise(r => authReadyResolve = r);

// Manejar estado de login - muestra overlay si no hay usuario
// Si quedó un usuario anónimo viejo, lo deslogueamos para forzar login con email
onAuthStateChanged(auth, async (user) => {
  if (user) {
    if (user.isAnonymous) {
      // Migración: el usuario venía de la v1 anónima, lo sacamos y pedimos email
      try { await signOut(auth); } catch {}
      currentUid = null;
      showAuthOverlay();
      updateAuthUI(null);
      authReadyResolve(null);
      localStorage.removeItem("fiuba_uid");
      return;
    }
    currentUid = user.uid;
    localStorage.setItem("fiuba_uid", currentUid);
    hideAuthOverlay();
    updateAuthUI(user);
    authReadyResolve(user);
    window.dispatchEvent(new CustomEvent("fiuba-auth-ready"));
  } else {
    currentUid = null;
    showAuthOverlay();
    updateAuthUI(null);
    authReadyResolve(null);
  }
});

function showAuthOverlay() {
  document.getElementById("auth-overlay")?.classList.add("open");
}
function hideAuthOverlay() {
  document.getElementById("auth-overlay")?.classList.remove("open");
}

function updateAuthUI(user) {
  const el = document.getElementById("auth-status");
  const emailEl = document.getElementById("user-email");
  if (user) {
    if (el) { el.textContent = `ID: ${user.uid.slice(0,6)}...`; el.title = user.uid; }
    if (emailEl) emailEl.textContent = user.email;
  } else {
    if (el) el.textContent = "Sin sesión";
    if (emailEl) emailEl.textContent = "";
  }
}

export function getUid() { return currentUid; }

export async function loginEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}
export async function registerEmail(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}
export async function logout() {
  await signOut(auth);
}
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

const googleProvider = new GoogleAuthProvider();
export async function loginWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

// Firestore - Memoria Académica v1
export async function logAttempt({ subject, topic, result, attempts = 1, hintsUsed = 0, timeSpentSec = null, confidence = null, errorType = null, exerciseSnippet = "", mode = "", chatId = "" }) {
  const uid = getUid();
  if (!uid) throw new Error("Tenés que iniciar sesión para guardar intentos.");
  if (!subject || !topic || !result) throw new Error("Faltan materia, tema o resultado");
  const ref = collection(db, `users/${uid}/attempts`);
  const doc = await addDoc(ref, {
    subject: subject.trim(),
    topic: topic.trim(),
    result,
    attempts: Number(attempts) || 1,
    hintsUsed: Number(hintsUsed) || 0,
    timeSpentSec: timeSpentSec ? Number(timeSpentSec) : null,
    confidence: confidence ? Number(confidence) : null,
    errorType: errorType || null,
    exerciseSnippet: (exerciseSnippet || "").slice(0,300),
    mode: mode || null,
    chatId: chatId || null,
    createdAt: serverTimestamp()
  });
  return doc.id;
}

export async function getRecentAttempts(n = 5) {
  const uid = getUid();
  if (!uid) return [];
  const ref = collection(db, `users/${uid}/attempts`);
  const q = query(ref, orderBy("createdAt", "desc"), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
