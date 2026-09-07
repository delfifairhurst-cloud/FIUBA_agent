// study-rooms.js - Salas de estudio en tiempo real (Firestore)
import { db, getUid } from "./firebase.js";
import { collection, addDoc, getDocs, getDoc, doc, query, where, orderBy, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp, onSnapshot, limit } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const ROOMS_REF = 'studyRooms';

export async function createRoom({ name, subject, isPrivate = false, code = '' }) {
  const uid = getUid();
  if (!uid) throw new Error('Tenés que iniciar sesión.');
  if (!name || !subject) throw new Error('Faltan nombre y materia.');
  const docRef = await addDoc(collection(db, ROOMS_REF), {
    name: name.trim(),
    subject: subject.trim(),
    createdBy: uid,
    members: [uid],
    isPrivate: !!isPrivate,
    code: isPrivate ? code.trim() : '',
    active: true,
    memberCount: 1,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function joinRoom(roomId, code = '') {
  const uid = getUid();
  if (!uid) throw new Error('Tenés que iniciar sesión.');
  const roomSnap = await getDoc(doc(db, ROOMS_REF, roomId));
  if (!roomSnap.exists()) throw new Error('Sala no encontrada.');
  const room = roomSnap.data();
  if (room.isPrivate && room.code !== code) throw new Error('Código incorrecto.');
  if (room.members && room.members.includes(uid)) return;
  if (room.members && room.members.length >= 20) throw new Error('Sala llena (max 20).');
  await updateDoc(doc(db, ROOMS_REF, roomId), {
    members: arrayUnion(uid),
    memberCount: (room.memberCount || 1) + 1
  });
}

export async function leaveRoom(roomId) {
  const uid = getUid();
  if (!uid) return;
  const roomSnap = await getDoc(doc(db, ROOMS_REF, roomId));
  const room = roomSnap.data();
  await updateDoc(doc(db, ROOMS_REF, roomId), {
    members: arrayRemove(uid),
    memberCount: Math.max(0, (room.memberCount || 1) - 1)
  });
}

export async function deleteRoom(roomId) {
  const uid = getUid();
  if (!uid) return;
  await deleteDoc(doc(db, ROOMS_REF, roomId));
}

export async function getRoom(roomId) {
  const snap = await getDoc(doc(db, ROOMS_REF, roomId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getPublicRooms() {
  // Avoid composite index: fetch all active rooms, sort client-side
  const q = query(collection(db, ROOMS_REF), where('active', '==', true), limit(50));
  const snap = await getDocs(q);
  const rooms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  rooms.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() || 0;
    const tb = b.createdAt?.toMillis?.() || 0;
    return tb - ta;
  });
  return rooms;
}

export async function getMyRooms() {
  const uid = getUid();
  if (!uid) return [];
  const q = query(collection(db, ROOMS_REF), where('members', 'array-contains', uid), where('active', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function sendMessage(roomId, text) {
  const uid = getUid();
  if (!uid) throw new Error('Tenés que iniciar sesión.');
  if (!text || text.length > 1000) throw new Error('Mensaje inválido.');
  return addDoc(collection(db, ROOMS_REF, roomId, 'messages'), {
    uid,
    displayName: uid.slice(0, 6),
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
}

export function listenToMessages(roomId, callback) {
  const q = query(collection(db, ROOMS_REF, roomId, 'messages'));
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    msgs.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || 0;
      const tb = b.createdAt?.toMillis?.() || 0;
      return ta - tb;
    });
    callback(msgs);
  });
}

export function listenToRooms(callback) {
  const q = query(collection(db, ROOMS_REF), where('active', '==', true));
  return onSnapshot(q, (snap) => {
    const rooms = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(rooms);
  });
}
