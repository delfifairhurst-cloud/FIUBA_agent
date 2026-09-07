// professor-ratings.js - Ranking de profesores FIUBA (Firestore)
import { db, getUid } from "./firebase.js";
import { collection, addDoc, getDocs, getDoc, doc, query, where, deleteDoc, updateDoc, increment, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const RATINGS_REF = 'professorRatings';

const SEED_PROFESSORS = [
  // Análisis Matemático I
  { name: 'Alonso, Juan', subject: 'Análisis Matemático I', rating: 4.5, review: 'Muy claro explicando los conceptos del curso. Las clases son dinámicas y resuelve muchas dudas.', category: 'Excepcional' },
  { name: 'Botta, Fernando', subject: 'Análisis Matemático I', rating: 4.7, review: 'Uno de los mejores de AM1. Explica con mucha paciencia y hace muchos ejercicios en el pizarrón.', category: 'Excepcional' },
  { name: 'Morales, Alejandro', subject: 'Análisis Matemático I', rating: 3.2, review: 'Sabe mucho pero va demasiado rápido. Si no venís preparado te perdés fácil.', category: 'Bueno' },
  { name: 'Larocca, Javier', subject: 'Análisis Matemático I', rating: 4.6, review: 'Excelente para primer año. Explica con ejemplos gráficos y las guías son progresivas.', category: 'Excepcional' },
  { name: 'Pérez, Martín', subject: 'Análisis Matemático I', rating: 3.0, review: 'Las clases son aburridas pero el material que da es bueno. Hay que estudiar por tu cuenta.', category: 'Bueno' },
  // Álgebra y Geometría Analítica
  { name: 'Blanco, María', subject: 'Álgebra y Geometría Analítica', rating: 4.0, review: 'Buen contenido, a veces va rápido pero tiene paciencia para las dudas.', category: 'Muy Bueno' },
  { name: 'Fuentes, Carolina', subject: 'Álgebra y Geometría Analítica', rating: 4.3, review: 'Muy organizada. Los resúmenes de clase son excelentes. Repite cosas del parcial.', category: 'Muy Bueno' },
  { name: 'Roldán, Guillermo', subject: 'Álgebra y Geometría Analítica', rating: 2.8, review: 'Explica mal y no resuelve dudas. Las guías son imposibles de entender sin ir a clase.', category: 'A Mejorar' },
  { name: 'Domínguez, Lucas', subject: 'Álgebra y Geometría Analítica', rating: 4.1, review: 'Muy buen profesor para álgebra lineal. Los ejercicios de vectores y matrices son claros.', category: 'Muy Bueno' },
  // Física I
  { name: 'D\'Attilio, Andrés', subject: 'Física I', rating: 4.8, review: 'Uno de los mejores de la FIUBA. Explica con ejemplos de la vida real.', category: 'Excepcional' },
  { name: 'Campos, Martín', subject: 'Física I', rating: 4.2, review: 'Las clases son entretenidas y los ejemplos ayudan mucho. Los parciales son parecidos a las guías.', category: 'Muy Bueno' },
  { name: 'Peralta, Sebastián', subject: 'Física I', rating: 3.5, review: 'Clases correctas. A veces se extiende demasiado en temas que no van para el parcial.', category: 'Bueno' },
  { name: 'Ruiz, Fernando', subject: 'Física I', rating: 4.4, review: 'Muy buen profesor. Explica cinemática y dinámica de forma muy clara con ejemplos cotidianos.', category: 'Muy Bueno' },
  // Química General
  { name: 'Gómez, Carlos', subject: 'Química General', rating: 3.5, review: 'Clases correctas pero un poco monótonas. El cursado es llevadero.', category: 'Bueno' },
  { name: 'Luna, Elena', subject: 'Química General', rating: 4.1, review: 'Muy buena onda, siempre dispuesta a ayudar. Los prácticos son entretenidos.', category: 'Muy Bueno' },
  { name: 'Medina, Ricardo', subject: 'Química General', rating: 3.8, review: 'Buen profesor para química orgánica. Las clases prácticas son excellentes.', category: 'Bueno' },
  // Sistemas de Representación
  { name: 'Pérez, Laura', subject: 'Sistemas de Representación', rating: 4.2, review: 'Muy buena onda, ayuda mucho con los prácticos. Recomendable para primer cuatrimestre.', category: 'Muy Bueno' },
  { name: 'Suárez, Tomás', subject: 'Sistemas de Representación', rating: 3.8, review: 'El contenido está bueno pero los parciales son complicados. Hay que practicar mucho.', category: 'Bueno' },
  { name: 'Castro, Lucas', subject: 'Sistemas de Representación', rating: 4.0, review: 'Muy buen profesor para dibujo técnico. Los ejercicios de proyección son claros.', category: 'Muy Bueno' },
  // Introducción a la Programación
  { name: 'Rodríguez, Martín', subject: 'Introducción a la Programación', rating: 4.7, review: 'Excelente para empezar. Explica desde cero y tiene mucha paciencia.', category: 'Excepcional' },
  { name: 'Vega, Paula', subject: 'Introducción a la Programación', rating: 4.4, review: 'Muy buena para gente que nunca programó. Explica con ejemplos simples.', category: 'Muy Bueno' },
  { name: 'Acuña, Diego', subject: 'Introducción a la Programación', rating: 3.0, review: 'Se nota que sabe pero no sabe explicar. Hay que estudiar por cuenta propia.', category: 'Bueno' },
  { name: 'Torres, Valentina', subject: 'Introducción a la Programación', rating: 4.5, review: 'Una de las mejores para programación. Los TPs son progresivos y se aprende mucho.', category: 'Excepcional' },
  // Análisis Matemático II
  { name: 'Fernández, Diego', subject: 'Análisis Matemático II', rating: 3.8, review: 'Sabe mucho pero a veces se pierde en la abstracción. Hacer los ejercicios es clave.', category: 'Bueno' },
  { name: 'Colombo, Luciana', subject: 'Análisis Matemático II', rating: 4.5, review: 'Explica muy bien los temas difíciles. Las integrales múltiples quedan claras.', category: 'Excepcional' },
  { name: 'Herrera, Paula', subject: 'Análisis Matemático II', rating: 4.2, review: 'Muy clara con los ejercicios. Los parciales son parecidos a las guías.', category: 'Muy Bueno' },
  // Física II
  { name: 'López, Ana', subject: 'Física II', rating: 4.3, review: 'Muy organizada. Da buenos tips para el parcial. Vale la pena ir a clase.', category: 'Muy Bueno' },
  { name: 'Silva, Mateo', subject: 'Física II', rating: 4.0, review: 'Buen profesor. Los temas de electromagnetismo los explica con claridad.', category: 'Muy Bueno' },
  { name: 'García, Sofía', subject: 'Física II', rating: 3.6, review: 'Clases correctas. Los laboratorios son prácticos pero hay que ir preparado.', category: 'Bueno' },
  // Estructura de Datos
  { name: 'Martínez, Roberto', subject: 'Estructura de Datos', rating: 4.6, review: 'Top total. Explica los algoritmos con claridad y los ejercicios son muy útiles.', category: 'Excepcional' },
  { name: 'Nuñez, Agustín', subject: 'Estructura de Datos', rating: 4.3, review: 'Las clases prácticas son excellentes. Si hacés todas las guías aprobás tranquilo.', category: 'Muy Bueno' },
  { name: 'Morales, Camila', subject: 'Estructura de Datos', rating: 4.1, review: 'Muy buena para estructuras como árboles y grafos. Los ejercicios son desafiantes.', category: 'Muy Bueno' },
  // Base de Datos
  { name: 'García, Sofía', subject: 'Base de Datos', rating: 4.1, review: 'Muy práctica. Las guías de TP son excellentes para aprender SQL.', category: 'Muy Bueno' },
  { name: 'Torres, Valentina', subject: 'Base de Datos', rating: 4.4, review: 'Excelente profesora. Explica normalización y SQL de forma muy clara.', category: 'Muy Bueno' },
  { name: 'Ruiz, Fernando', subject: 'Base de Datos', rating: 3.7, review: 'Buen contenido pero va rápido. Hay que practicar SQL por tu cuenta.', category: 'Bueno' },
  // Análisis Numérico
  { name: 'Sánchez, Pedro', subject: 'Análisis Numérico', rating: 3.6, review: 'Clases correctas. El material es bueno pero hay que estudiar por cuenta propia.', category: 'Bueno' },
  { name: 'Herrera, Paula', subject: 'Análisis Numérico', rating: 4.2, review: 'Muy clara con los métodos numéricos. Los ejercicios del parcial son justos.', category: 'Muy Bueno' },
  { name: 'Acosta, Gabriel', subject: 'Análisis Numérico', rating: 3.9, review: 'Buen profesor. Los ejercicios de interpolación y integración numérica son claros.', category: 'Bueno' },
  // Sistemas Operativos
  { name: 'Ruiz, Fernando', subject: 'Sistemas Operativos', rating: 3.9, review: 'Contenido actualizado. A veces las clases son densas pero el contenido vale.', category: 'Bueno' },
  { name: 'Vargas, Nicolás', subject: 'Sistemas Operativos', rating: 4.6, review: 'El mejor de la carrera para SO. Explica con simulaciones y ejemplos prácticos.', category: 'Excepcional' },
  { name: 'Castro, Lucas', subject: 'Sistemas Operativos', rating: 4.0, review: 'Buen profesor. Los laboratorios de Linux son muy instructivos.', category: 'Muy Bueno' },
  // Redes de Computadoras
  { name: 'Silva, Mateo', subject: 'Redes de Computadoras', rating: 4.0, review: 'Los laboratorios de redes son muy prácticos. Aprendés cosas aplicables al trabajo.', category: 'Muy Bueno' },
  { name: 'Paz, Ignacio', subject: 'Redes de Computadoras', rating: 3.8, review: 'Buen contenido de protocolos TCP/IP. Los ejercicios de subnetting son útiles.', category: 'Bueno' },
  { name: 'Acuña, Diego', subject: 'Redes de Computadoras', rating: 4.2, review: 'Muy buen profesor. Explica routing y switching de forma práctica.', category: 'Muy Bueno' },
  // Ingeniería de Software
  { name: 'Morales, Camila', subject: 'Ingeniería de Software', rating: 4.0, review: 'Muy buena para proyectos grupales. Enseña metodologías reales.', category: 'Muy Bueno' },
  { name: 'Paz, Ignacio', subject: 'Ingeniería de Software', rating: 4.3, review: 'Excelente para aprender UML y diseño de software. Los proyectos son aplicables.', category: 'Muy Bueno' },
  { name: 'Vega, Paula', subject: 'Ingeniería de Software', rating: 3.9, review: 'Buen profesor. Los patrones de diseño se entienden con sus ejemplos.', category: 'Bueno' },
  // Matemática Discreta
  { name: 'Romero, Isabel', subject: 'Matemática Discreta', rating: 4.5, review: 'Una de las mejores de la carrera. Hace fácil lo difícil.', category: 'Excepcional' },
  { name: 'Acosta, Gabriel', subject: 'Matemática Discreta', rating: 3.4, review: 'Clases normales. Hay que prestar atención porque va rápido.', category: 'Bueno' },
  { name: 'Luna, Elena', subject: 'Matemática Discreta', rating: 4.1, review: 'Muy buena explicando grafos y combinatoria. Los ejercicios son claros.', category: 'Muy Bueno' },
  // Señales y Sistemas
  { name: 'Domínguez, Renata', subject: 'Señales y Sistemas', rating: 4.4, review: 'Explica transformadas de Fourier y Laplace de forma muy clara.', category: 'Muy Bueno' },
  { name: 'Medina, Julia', subject: 'Señales y Sistemas', rating: 3.8, review: 'Buena profesora. El contenido es denso pero se puede seguir.', category: 'Bueno' },
  { name: 'Herrera, Jorge', subject: 'Señales y Sistemas', rating: 4.0, review: 'Buen profesor. Los ejercicios de filtros y convolución son claros.', category: 'Muy Bueno' },
  // Termodinámica
  { name: 'Herrera, Jorge', subject: 'Termodinámica', rating: 3.3, review: 'El contenido es interesante pero va muy rápido.', category: 'Bueno' },
  { name: 'Campos, Martín', subject: 'Termodinámica', rating: 4.0, review: 'Buen profesor. Los ejercicios de ciclos termodinámicos son prácticos.', category: 'Muy Bueno' },
  // Mecánica de Fluidos
  { name: 'Vargas, Nicolás', subject: 'Mecánica de Fluidos', rating: 4.6, review: 'Explica con simulaciones y ejemplos prácticos que ayudan a entender.', category: 'Excepcional' },
  { name: 'Ruiz, Fernando', subject: 'Mecánica de Fluidos', rating: 3.8, review: 'Buen contenido. Los ejercicios de tuberías y bombas son interesantes.', category: 'Bueno' },
  // Circuitos Eléctricos
  { name: 'Fernández, Diego', subject: 'Circuitos Eléctricos', rating: 3.8, review: 'Sabe mucho de circuitos. Los laboratorios son prácticos.', category: 'Bueno' },
  { name: 'Luna, Elena', subject: 'Circuitos Eléctricos', rating: 4.0, review: 'Muy buena explicando leyes de Kirchhoff y redes.', category: 'Muy Bueno' },
  { name: 'Torres, Valentina', subject: 'Circuitos Eléctricos', rating: 4.3, review: 'Excelente para circuitos de CD y CA. Los laboratorios son instructivos.', category: 'Muy Bueno' },
  // Economía
  { name: 'Blanco, María', subject: 'Economía', rating: 4.0, review: 'Buena para entender conceptos económicos aplicados a ingeniería.', category: 'Muy Bueno' },
  { name: 'Morales, Camila', subject: 'Economía', rating: 3.7, review: 'Clases correctas. El contenido de costos y presupuestos es útil.', category: 'Bueno' },
  // Probabilidad y Estadística
  { name: 'Colombo, Luciana', subject: 'Probabilidad y Estadística', rating: 4.5, review: 'Explica probabilidad con ejemplos reales. Las distribuciones quedan claras.', category: 'Excepcional' },
  { name: 'Acuña, Diego', subject: 'Probabilidad y Estadística', rating: 3.0, review: 'El contenido es bueno pero la explicación es confusa.', category: 'Bueno' },
  { name: 'Gómez, Carlos', subject: 'Probabilidad y Estadística', rating: 4.1, review: 'Buen profesor. Los ejercicios de inferencia estadística son claros.', category: 'Muy Bueno' },
  // Organización del Computador
  { name: 'Silva, Mateo', subject: 'Organización del Computador', rating: 4.0, review: 'Muy buen profesor. Arquitectura de procesadores se entiende con sus clases.', category: 'Muy Bueno' },
  { name: 'Peralta, Sebastián', subject: 'Organización del Computador', rating: 3.5, review: 'Clases correctas. El contenido de memoria y cache es denso.', category: 'Bueno' },
  { name: 'Rodríguez, Martín', subject: 'Organización del Computador', rating: 4.2, review: 'Explica ensamblador y pipeline de forma clara. Los laboratorios son útiles.', category: 'Muy Bueno' },
  // Lingüística Computacional
  { name: 'Romero, Isabel', subject: 'Lingüística Computacional', rating: 4.5, review: 'Gramáticas y autómatas quedan claros. Una de las mejores de la carrera.', category: 'Excepcional' },
  { name: 'Vega, Paula', subject: 'Lingüística Computacional', rating: 4.0, review: 'Buen profesor. Los ejercicios de expresiones regulares son prácticos.', category: 'Muy Bueno' },
  // Inteligencia Artificial
  { name: 'Vega, Paula', subject: 'Inteligencia Artificial', rating: 4.4, review: 'Muy buena para machine learning y redes neuronales.', category: 'Muy Bueno' },
  { name: 'Paz, Ignacio', subject: 'Inteligencia Artificial', rating: 4.1, review: 'Los algoritmos de búsqueda y planificación se entienden con sus ejemplos.', category: 'Muy Bueno' },
  { name: 'Domínguez, Renata', subject: 'Inteligencia Artificial', rating: 4.3, review: 'Excelente para deep learning. Los proyectos prácticos con Python son excellentes.', category: 'Muy Bueno' },
  // Visión por Computadora
  { name: 'Domínguez, Renata', subject: 'Visión por Computadora', rating: 4.4, review: 'Explica procesamiento de imágenes de forma muy clara. Los laboratorios con OpenCV.', category: 'Muy Bueno' },
  { name: 'Nuñez, Agustín', subject: 'Visión por Computadora', rating: 4.0, review: 'Buen profesor. Los ejercicios de detección de bordes y segmentación son claros.', category: 'Muy Bueno' },
  // Robótica
  { name: 'Campos, Martín', subject: 'Robótica', rating: 4.2, review: 'Los proyectos de robótica son entretenidos y aprendés cosas aplicables.', category: 'Muy Bueno' },
  { name: 'Acuña, Diego', subject: 'Robótica', rating: 3.8, review: 'Buen contenido de cinemática y dinámica de robots. Los laboratorios son prácticos.', category: 'Bueno' },
  // Gestión de Proyectos
  { name: 'Morales, Camila', subject: 'Gestión de Proyectos', rating: 4.0, review: 'Enseña metodologías ágiles reales. Los trabajos grupales son organizados.', category: 'Muy Bueno' },
  { name: 'Blanco, María', subject: 'Gestión de Proyectos', rating: 3.8, review: 'Buen profesor. Los ejercicios de planificación y presupuestos son útiles.', category: 'Bueno' },
  // Control Automático
  { name: 'Fuentes, Carolina', subject: 'Control Automático', rating: 4.3, review: 'Los ejercicios de diagramas de Bode y Nyquist son claros.', category: 'Muy Bueno' },
  { name: 'Herrera, Paula', subject: 'Control Automático', rating: 4.0, review: 'Muy buena explicando retroalimentación y estabilidad. Los parciales son justos.', category: 'Muy Bueno' },
  // Electrónica General
  { name: 'Torres, Valentina', subject: 'Electrónica General', rating: 4.4, review: 'Excelente explicando amplificadores y circuitos de potencia.', category: 'Muy Bueno' },
  { name: 'Herrera, Jorge', subject: 'Electrónica General', rating: 3.3, review: 'El contenido es interesante pero va muy rápido.', category: 'Bueno' },
  // Métodos Numéricos
  { name: 'Sánchez, Pedro', subject: 'Métodos Numéricos', rating: 3.6, review: 'El material es bueno pero hay que estudiar mucho por cuenta propia.', category: 'Bueno' },
  { name: 'Colombo, Luciana', subject: 'Métodos Numéricos', rating: 4.2, review: 'Explica interpolación y aproximación de forma clara. Los ejercicios son útiles.', category: 'Muy Bueno' },
  // Química Inorgánica
  { name: 'Gómez, Carlos', subject: 'Química Inorgánica', rating: 3.5, review: 'Clases correctas. Los temas de enlace químico son interesantes.', category: 'Bueno' },
  { name: 'Luna, Elena', subject: 'Química Inorgánica', rating: 4.0, review: 'Muy buena explicando tablas periódicas y propiedades. Las prácticas son entretenidas.', category: 'Muy Bueno' },
  // Física III
  { name: 'López, Ana', subject: 'Física III', rating: 4.3, review: 'Muy organizada. Óptica y ondas se entienden con sus explicaciones.', category: 'Muy Bueno' },
  { name: 'D\'Attilio, Andrés', subject: 'Física III', rating: 4.7, review: 'Explica fenómenos ondulatorios de forma magistral. Los laboratorios son excellentes.', category: 'Excepcional' },
  // Álgebra III
  { name: 'Fuentes, Carolina', subject: 'Álgebra III', rating: 4.1, review: 'Muy buena para álgebra abstracta. Los ejercicios de grupos y anillos son claros.', category: 'Muy Bueno' },
  { name: 'Blanco, María', subject: 'Álgebra III', rating: 3.8, review: 'Buen contenido pero va rápido. Hay que repasar con el libro.', category: 'Bueno' },
  // Cálculo Numérico
  { name: 'Herrera, Paula', subject: 'Cálculo Numérico', rating: 4.0, review: 'Explica métodos de raíces y ecuaciones diferenciales numéricas de forma clara.', category: 'Muy Bueno' },
  { name: 'Acosta, Gabriel', subject: 'Cálculo Numérico', rating: 3.7, review: 'Buen profesor. Los ejercicios de Newton-Raphson y Runge-Kutta son prácticos.', category: 'Bueno' },
  // Electromagnetismo
  { name: 'Silva, Mateo', subject: 'Electromagnetismo', rating: 4.0, review: 'Muy buen profesor. Las ecuaciones de Maxwell quedan claras con sus ejemplos.', category: 'Muy Bueno' },
  { name: 'Medina, Ricardo', subject: 'Electromagnetismo', rating: 4.2, review: 'Excelente explicando campos eléctricos y magnéticos. Los laboratorios son útiles.', category: 'Muy Bueno' },
  // Mecánica de Sólidos
  { name: 'Campos, Martín', subject: 'Mecánica de Sólidos', rating: 3.9, review: 'Buen contenido de esfuerzos y deformaciones. Los ejercicios son desafiantes.', category: 'Bueno' },
  { name: 'Peralta, Sebastián', subject: 'Mecánica de Sólidos', rating: 4.1, review: 'Muy buen profesor. Explica diagramas de Mohr y vigas de forma clara.', category: 'Muy Bueno' },
  // Investigación Operativa
  { name: 'Romero, Isabel', subject: 'Investigación Operativa', rating: 4.4, review: 'Excelente para programación lineal y optimización. Los ejercicios son prácticos.', category: 'Muy Bueno' },
  { name: 'Sánchez, Pedro', subject: 'Investigación Operativa', rating: 3.6, review: 'Buen contenido pero las clases son densas. Hay que practicar mucho.', category: 'Bueno' },
  // Proyecto Final
  { name: 'Morales, Camila', subject: 'Proyecto Final', rating: 4.2, review: 'Excelente para guiar el proyecto final. Los consejos de presentación son útiles.', category: 'Muy Bueno' },
  { name: 'Paz, Ignacio', subject: 'Proyecto Final', rating: 4.0, review: 'Buen profesor para la etapa de diseño. Los ejercicios de viabilidad son claros.', category: 'Muy Bueno' },
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
          source: 'datos de ejemplo',
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
