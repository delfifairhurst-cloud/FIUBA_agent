// flashcards.js - CRUD + spaced repetition SM-2 simplificado
import { db, getUid } from "./firebase.js";
import { collection, addDoc, getDocs, doc, query, orderBy, serverTimestamp, deleteDoc, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export async function createFlashcardsBatch(cards) {
  const uid = getUid();
  if (!uid) throw new Error("Iniciá sesión");
  const ref = collection(db, `users/${uid}/flashcards`);
  const ids = [];
  for (const c of cards) {
    const docRef = await addDoc(ref, {
      front: (c.front||"").trim().slice(0,300),
      back: (c.back||"").trim().slice(0,300),
      topic: (c.topic||"General").trim(),
      interval: 0,
      ease: 2.5,
      reps: 0,
      nextReview: serverTimestamp(),
      createdAt: serverTimestamp()
    });
    ids.push(docRef.id);
  }
  return ids;
}

export async function getFlashcards() {
  const uid = getUid();
  if (!uid) return [];
  const ref = collection(db, `users/${uid}/flashcards`);
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDueFlashcards() {
  const all = await getFlashcards();
  const now = Date.now();
  return all.filter(c => {
    if (!c.nextReview) return true;
    const t = c.nextReview?.toMillis ? c.nextReview.toMillis() : (c.nextReview.seconds ? c.nextReview.seconds*1000 : now);
    return t <= now;
  });
}

export async function reviewFlashcard(id, quality) {
  // quality: 0 again, 1 hard, 2 good, 3 easy
  const uid = getUid();
  const ref = doc(db, `users/${uid}/flashcards/${id}`);
  // SM-2 simplificado
  const all = await getFlashcards();
  const card = all.find(c=>c.id===id);
  if (!card) throw new Error("No encontrada");
  let { interval, ease, reps } = card;
  if (quality === 0) { reps = 0; interval = 0; }
  else {
    if (quality === 1) ease = Math.max(1.3, ease - 0.15);
    if (quality === 3) ease = ease + 0.15;
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * ease);
  }
  const nextReview = new Date(Date.now() + interval*24*60*60*1000);
  await updateDoc(ref, { interval, ease, reps, nextReview, lastQuality: quality });
}

export async function deleteFlashcard(id) {
  const uid = getUid();
  await deleteDoc(doc(db, `users/${uid}/flashcards/${id}`));
}

window.flashcardsAPI = { createFlashcardsBatch, getFlashcards, getDueFlashcards, reviewFlashcard, deleteFlashcard };
