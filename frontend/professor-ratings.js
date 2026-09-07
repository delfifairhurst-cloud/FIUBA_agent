// professor-ratings.js - Ranking de profesores FIUBA (Firestore)
import { db, getUid } from "./firebase.js";
import { collection, addDoc, getDocs, getDoc, doc, query, where, deleteDoc, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const RATINGS_REF = 'professorRatings';

const SEED_PROFESSORS = [
  // Análisis Matemático I
  { name: 'Alonso, Juan', subject: 'Análisis Matemático I', rating: 4.5, review: 'Muy claro explicando los conceptos del curso. Las clases son dinámicas y resuelve muchas dudas. Las guías están muy bien armadas.', category: 'Excepcional' },
  { name: 'Botta, Fernando', subject: 'Análisis Matemático I', rating: 4.7, review: 'Uno de los mejores de AM1. Explica con mucha paciencia y hace muchos ejercicios en el pizarrón. Altamente recomendado para primer año.', category: 'Excepcional' },
  { name: 'Morales, Alejandro', subject: 'Análisis Matemático I', rating: 3.2, review: 'Sabe mucho pero va demasiado rápido. Si no venís preparado te perdés fácil. El material que da es bueno igual.', category: 'Bueno' },
  // Álgebra y Geometría Analítica
  { name: 'Blanco, María', subject: 'Álgebra y Geometría Analítica', rating: 4.0, review: 'Buen contenido, a veces va rápido pero tiene paciencia para las dudas. El material de estudio es muy completo.', category: 'Muy Bueno' },
  { name: 'Fuentes, Carolina', subject: 'Álgebra y Geometría Analítica', rating: 4.3, review: 'Muy organizada. Los resúmenes de clase son excelentes. Recomiendo ir a todas las clases porque repite cosas del parcial.', category: 'Muy Bueno' },
  { name: 'Roldán, Guillermo', subject: 'Álgebra y Geometría Analítica', rating: 2.8, review: 'Explica mal y no resuelve dudas. Las guías son imposibles de entender sin ir a clase. No lo recomiendo.', category: 'A Mejorar' },
  // Física I
  { name: 'D\'Attilio, Andrés', subject: 'Física I', rating: 4.8, review: 'Uno de los mejores profesores de la FIUBA. Explica con ejemplos de la vida real y hace entender la física de verdad.', category: 'Excepcional' },
  { name: 'Campos, Martín', subject: 'Física I', rating: 4.2, review: 'Muy buen profesor. Las clases son entretenidas y los ejemplos ayudan mucho. Los parciales son parecidos a las guías.', category: 'Muy Bueno' },
  { name: 'Peralta, Sebastián', subject: 'Física I', rating: 3.5, review: 'Clases correctas. A veces se extiende demasiado en temas que no van para el parcial. Pero explica bien.', category: 'Bueno' },
  // Química General
  { name: 'Gómez, Carlos', subject: 'Química General', rating: 3.5, review: 'Clases correctas pero un poco monótonas. El cursado es llevadero si prestás atención.', category: 'Bueno' },
  { name: 'Luna, Elena', subject: 'Química General', rating: 4.1, review: 'Muy buena onda, siempre dispuesta a ayudar. Los prácticos son entretenidos y aprendés bastante.', category: 'Muy Bueno' },
  // Sistemas de Representación
  { name: 'Pérez, Laura', subject: 'Sistemas de Representación', rating: 4.2, review: 'Muy buena onda, ayuda mucho con los prácticos. Recomendable para el primer cuatrimestre.', category: 'Muy Bueno' },
  { name: 'Suárez, Tomás', subject: 'Sistemas de Representación', rating: 3.8, review: 'El contenido está bueno pero los parciales son complicados. Hay que practicar mucho con los ejercicios del libro.', category: 'Bueno' },
  // Introducción a la Programación
  { name: 'Rodríguez, Martín', subject: 'Introducción a la Programación', rating: 4.7, review: 'Excelente para empezar. Explica desde cero y tiene mucha paciencia. Las guías son progresivas y se aprende mucho.', category: 'Excepcional' },
  { name: 'Vega, Paula', subject: 'Introducción a la Programación', rating: 4.4, review: 'Muy buena para gente que nunca programó. Explica con ejemplos simples y los TPs son muy prácticos.', category: 'Muy Bueno' },
  { name: 'Acuña, Diego', subject: 'Introducción a la Programación', rating: 3.0, review: 'Se nota que sabe pero no sabe explicar. Hay que estudiar por cuenta propia. Las guías salvan.', category: 'Bueno' },
  // Análisis Matemático II
  { name: 'Fernández, Diego', subject: 'Análisis Matemático II', rating: 3.8, review: 'Sabe mucho pero a veces se pierde en la abstracción. Hacer los ejercicios es clave para el parcial.', category: 'Bueno' },
  { name: 'Colombo, Luciana', subject: 'Análisis Matemático II', rating: 4.5, review: 'Explica muy bien los temas difíciles. Las integrales múltiples quedan claras después de sus clases.', category: 'Excepcional' },
  // Física II
  { name: 'López, Ana', subject: 'Física II', rating: 4.3, review: 'Muy organizada. Da buenos tips para el parcial. Vale la pena ir a clase y hacer las guías.', category: 'Muy Bueno' },
  { name: 'Medina, Ricardo', subject: 'Física II', rating: 4.0, review: 'Buen profesor. Los temas de electromagnetismo los explica con mucha claridad. Las clases son entretenidas.', category: 'Muy Bueno' },
  // Estructura de Datos
  { name: 'Martínez, Roberto', subject: 'Estructura de Datos', rating: 4.6, review: 'Top total. Explica los algoritmos con claridad y los ejercicios son muy útiles para entender la lógica.', category: 'Excepcional' },
  { name: 'Nuñez, Agustín', subject: 'Estructura de Datos', rating: 4.3, review: 'Muy buen profesor. Las clases prácticas son excellentes. Si hacés todas las guías aprobás tranquilo.', category: 'Muy Bueno' },
  // Base de Datos
  { name: 'García, Sofía', subject: 'Base de Datos', rating: 4.1, review: 'Muy práctica. Las guías de TP son excellentes para aprender SQL y modelado. Recomendable.', category: 'Muy Bueno' },
  { name: 'Torres, Valentina', subject: 'Base de Datos', rating: 4.4, review: 'Excelente profesora. Explica normalización y consultas SQL de forma muy clara. Los parciales son justos.', category: 'Muy Bueno' },
  // Análisis Numérico
  { name: 'Sánchez, Pedro', subject: 'Análisis Numérico', rating: 3.6, review: 'Clases correctas. El material de estudio es bueno pero hay que estudiar mucho por cuenta propia.', category: 'Bueno' },
  { name: 'Herrera, Paula', subject: 'Análisis Numérico', rating: 4.2, review: 'Muy clara con los métodos numéricos. Los ejercicios del parcial son parecidos a los de la guía.', category: 'Muy Bueno' },
  // Sistemas Operativos
  { name: 'Ruiz, Fernando', subject: 'Sistemas Operativos', rating: 3.9, review: 'Contenido actualizado. A veces las clases son densas pero el contenido de procesos y hilos vale mucho.', category: 'Bueno' },
  { name: 'Vargas, Nicolás', subject: 'Sistemas Operativos', rating: 4.6, review: 'El mejor de la carrera para SO. Explica con simulaciones y ejemplos prácticos de Linux.', category: 'Excepcional' },
  // Redes de Computadoras
  { name: 'Castro, Lucas', subject: 'Redes de Computadoras', rating: 3.7, review: 'Explica bien la teoría de redes. Los ejercicios del parcial son parecidos a los de clase.', category: 'Bueno' },
  { name: 'Silva, Mateo', subject: 'Redes de Computadoras', rating: 4.0, review: 'Muy buen profesor. Los laboratorios de redes son muy prácticos. Aprendés cosas aplicables al trabajo.', category: 'Muy Bueno' },
  // Ingeniería de Software
  { name: 'Morales, Camila', subject: 'Ingeniería de Software', rating: 4.0, review: 'Muy buena para proyectos grupales. Enseña metodologías reales de trabajo en equipo.', category: 'Muy Bueno' },
  { name: 'Paz, Ignacio', subject: 'Ingeniería de Software', rating: 4.3, review: 'Excelente para aprender UML y diseño de software. Los proyectos son interesantes y aplicables.', category: 'Muy Bueno' },
  // Matemática Discreta
  { name: 'Romero, Isabel', subject: 'Matemática Discreta', rating: 4.5, review: 'Una de las mejores de la carrera. Hace fácil lo difícil. Grafos, combinatoria y lógica quedan claros.', category: 'Excepcional' },
  { name: 'Acosta, Gabriel', subject: 'Matemática Discreta', rating: 3.4, review: 'Clases normales. Hay que prestar atención porque va rápido. El material que da es bueno.', category: 'Bueno' },
  // Señales y Sistemas
  { name: 'Medina, Julia', subject: 'Señales y Sistemas', rating: 3.8, review: 'Buena profesora. El contenido es denso pero se puede seguir si vas al día con las guías.', category: 'Bueno' },
  { name: 'Domínguez, Renata', subject: 'Señales y Sistemas', rating: 4.4, review: 'Explica transformadas de Fourier y Laplace de forma muy clara. Los ejercicios del parcial son justos.', category: 'Muy Bueno' },
  // Termodinámica
  { name: 'Herrera, Jorge', subject: 'Termodinámica', rating: 3.3, review: 'El contenido es interesante pero va muy rápido. Hay que estudiar con videos complementarios.', category: 'Bueno' },
  // Mecánica de Fluidos
  { name: 'Vargas, Nicolás', subject: 'Mecánica de Fluidos', rating: 4.6, review: 'El mejor de automatización. Explica con simulaciones y ejemplos prácticos que ayudan a entender.', category: 'Excepcional' },
  // Circuitos Eléctricos
  { name: 'Fernández, Diego', subject: 'Circuitos Eléctricos', rating: 3.8, review: 'Sabe mucho de circuitos. Los laboratorios son prácticos. Hay que hacer many ejercicios para entender.', category: 'Bueno' },
  { name: 'Luna, Elena', subject: 'Circuitos Eléctricos', rating: 4.0, review: 'Muy buena explicando leyes de Kirchhoff y redes. Los parciales son parecidos a las guías.', category: 'Muy Bueno' },
  // Economía
  { name: 'Blanco, María', subject: 'Economía', rating: 4.0, review: 'Buena para entender conceptos económicos aplicados a ingeniería. Las clases son entretenidas.', category: 'Muy Bueno' },
  // Probabilidad y Estadística
  { name: 'Colombo, Luciana', subject: 'Probabilidad y Estadística', rating: 4.5, review: 'Explica probabilidad con ejemplos reales. Los temas de distribuciones quedan claros después de sus clases.', category: 'Excepcional' },
  { name: 'Acuña, Diego', subject: 'Probabilidad y Estadística', rating: 3.0, review: 'El contenido es bueno pero la explicación es confusa. Hay que estudiar con el libro complementario.', category: 'Bueno' },
  // Algoritmos y Estructuras de Datos
  { name: 'Nuñez, Agustín', subject: 'Algoritmos y Estructuras de Datos', rating: 4.3, review: 'Excelente para aprender a programar bien. Los ejercicios de complejidad temporal son muy útiles.', category: 'Muy Bueno' },
  // Organización del Computador
  { name: 'Silva, Mateo', subject: 'Organización del Computador', rating: 4.0, review: 'Muy buen profesor. Los ensamblador y arquitectura de procesadores se entienden con sus clases.', category: 'Muy Bueno' },
  { name: 'Peralta, Sebastián', subject: 'Organización del Computador', rating: 3.5, review: 'Clases correctas. El contenido de memoria y cache es interesante pero denso.', category: 'Bueno' },
  // Lingüística Computacional
  { name: 'Romero, Isabel', subject: 'Lingüística Computacional', rating: 4.5, review: 'Una de las mejores de la carrera. Hace fácil lo difícil. Gramáticas y autómatas quedan claros.', category: 'Excepcional' },
  // Inteligencia Artificial
  { name: 'Vega, Paula', subject: 'Inteligencia Artificial', rating: 4.4, review: 'Muy buena para machine learning y redes neuronales. Los proyectos prácticos son excellentes.', category: 'Muy Bueno' },
  { name: 'Paz, Ignacio', subject: 'Inteligencia Artificial', rating: 4.1, review: 'Buen profesor. Los algoritmos de búsqueda y planificación se entienden con sus ejemplos.', category: 'Muy Bueno' },
  // Visión por Computadora
  { name: 'Domínguez, Renata', subject: 'Visión por Computadora', rating: 4.4, review: 'Explica procesamiento de imágenes de forma muy clara. Los laboratorios con OpenCV son excellentes.', category: 'Muy Bueno' },
  // Robótica
  { name: 'Campos, Martín', subject: 'Robótica', rating: 4.2, review: 'Muy buen profesor. Los proyectos de robótica son entretenidos y aprendés cosas aplicables.', category: 'Muy Bueno' },
  // Gestión de Proyectos
  { name: 'Morales, Camila', subject: 'Gestión de Proyectos', rating: 4.0, review: 'Enseña metodologías ágiles reales. Los trabajos grupales son organizados y se aprende a liderar.', category: 'Muy Bueno' },
  // Control Automático
  { name: 'Fuentes, Carolina', subject: 'Control Automático', rating: 4.3, review: 'Muy organizada. Los ejercicios de diagramas de Bode y Nyquist son claros. Los parciales son justos.', category: 'Muy Bueno' },
  // Electronica General
  { name: 'Herrera, Jorge', subject: 'Electrónica General', rating: 3.3, review: 'El contenido es interesante pero va muy rápido. Hay que practicar con simulaciones por cuenta propia.', category: 'Bueno' },
  { name: 'Torres, Valentina', subject: 'Electrónica General', rating: 4.4, review: 'Excelente explicando amplificadores y circuitos de potencia. Los laboratorios son muy instructivos.', category: 'Muy Bueno' },
];

const RATING_COLORS = { 5: '#22c55e', 4: '#84cc16', 3: '#f59e0b', 2: '#f97316', 1: '#ef4444' };
function getRatingColor(r) { return RATING_COLORS[Math.round(r)] || '#64748b'; }
function getRatingLabel(r) { if (r >= 4.5) return 'Excepcional'; if (r >= 4) return 'Muy Bueno'; if (r >= 3) return 'Bueno'; if (r >= 2) return 'A Mejorar'; return 'Malo'; }

let seedLoaded = false;

async function loadSeedData() {
  if (seedLoaded) return;
  try {
    // Simple query, no orderBy (avoids composite index)
    const q = query(collection(db, RATINGS_REF), where('isSeed', '==', true));
    const snap = await getDocs(q);
    if (snap.size === 0) {
      for (const p of SEED_PROFESSORS) {
        await addDoc(collection(db, RATINGS_REF), {
          professorName: p.name,
          subject: p.subject,
          rating: p.rating,
          review: p.review,
          category: p.category,
          uid: 'seed',
          displayName: 'Ejemplo',
          isSeed: true,
          upvotes: Math.floor(Math.random() * 30) + 5,
          downvotes: Math.floor(Math.random() * 3),
          createdAt: serverTimestamp(),
        });
      }
    }
    seedLoaded = true;
  } catch (e) { console.warn('Seed load error:', e); }
}

export async function getAllRatings() {
  await loadSeedData();
  // No orderBy - sort client-side to avoid composite index
  const snap = await getDocs(collection(db, RATINGS_REF));
  const ratings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  ratings.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() || 0;
    const tb = b.createdAt?.toMillis?.() || 0;
    return tb - ta;
  });
  return ratings;
}

export async function addRating({ professorName, subject, rating, review }) {
  const uid = getUid();
  if (!uid) throw new Error('Tenés que iniciar sesión para calificar.');
  if (!professorName || !subject || !rating) throw new Error('Faltan datos.');
  if (rating < 1 || rating > 5) throw new Error('La calificación debe ser entre 1 y 5.');
  if (review && review.length > 500) throw new Error('La reseña es demasiado larga (max 500 chars).');
  const docRef = await addDoc(collection(db, RATINGS_REF), {
    professorName: professorName.trim(),
    subject: subject.trim(),
    rating: Number(rating),
    review: (review || '').trim(),
    category: getRatingLabel(rating),
    uid,
    displayName: uid.slice(0, 6),
    isSeed: false,
    upvotes: 0,
    downvotes: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteRating(ratingId) {
  await deleteDoc(doc(db, RATINGS_REF, ratingId));
}

export async function voteRating(ratingId, type) {
  const uid = getUid();
  if (!uid) throw new Error('Tenés que iniciar sesión.');
  const field = type === 'up' ? 'upvotes' : 'downvotes';
  await updateDoc(doc(db, RATINGS_REF, ratingId), { [field]: increment(1) });
}

export function getSubjects(ratings) {
  const s = new Set();
  ratings.forEach(r => { if (r.subject) s.add(r.subject); });
  return [...s].sort();
}

export function getAvgRating(ratings) {
  if (ratings.length === 0) return 0;
  return Math.round((ratings.reduce((s, r) => s + r.rating, 0) / ratings.length) * 10) / 10;
}

export { getRatingColor, getRatingLabel };
