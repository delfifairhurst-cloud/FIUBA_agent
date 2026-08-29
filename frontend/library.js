// library.js - Biblioteca organizada por Materias → Categorías
import { db, getUid, authReady } from "./firebase.js";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export async function addLibraryItem({ subject, category, title, filename }) {
  const uid = getUid();
  if (!uid) throw new Error("Iniciá sesión");
  if (!subject || !category || !title) throw new Error("Falta materia, categoría o título");
  const ref = collection(db, `users/${uid}/library`);
  const docRef = await addDoc(ref, {
    subject: subject.trim(),
    category: category.trim(),
    title: title.trim(),
    filename: (filename||"").trim(),
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getLibraryItems() {
  const uid = getUid();
  if (!uid) return [];
  const ref = collection(db, `users/${uid}/library`);
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({id:d.id, ...d.data()}));
}

export async function deleteLibraryItem(id) {
  const uid = getUid();
  await deleteDoc(doc(db, `users/${uid}/library/${id}`));
}

// Comunidad - Drive compartido (links externos, no usa tu storage)
export async function shareCommunityLink({ title, url }) {
  const uid = getUid();
  if (!uid) throw new Error("Iniciá sesión");
  if (!title || !url) throw new Error("Falta título o link");
  if (!url.startsWith("http")) throw new Error("Link debe empezar con http");
  const ref = collection(db, `communityLibrary`);
  const docRef = await addDoc(ref, {
    title: title.trim().slice(0,120),
    url: url.trim(),
    author: uid.slice(0,6),
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function getCommunityLinks() {
  const ref = collection(db, `communityLibrary`);
  const q = query(ref, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({id:d.id, ...d.data()}));
}

export async function deleteCommunityLink(id) {
  // solo el autor o admin podría borrar, por ahora cualquiera autenticado puede intentar
  await deleteDoc(doc(db, `communityLibrary/${id}`));
}

window.libraryAPI = { addLibraryItem, getLibraryItems, deleteLibraryItem, shareCommunityLink, getCommunityLinks, deleteCommunityLink };
