// exercise-bank.js - Banco de ejercicios local por materia/tema (sin IA, sin costo)
const EXERCISE_BANK = {
  "Algebra": [
    { topic: "Sistemas lineales", difficulty: "basico", statement: "Resolvé el sistema: 2x + y = 5; x - y = 1", type: "open", answer: "x=2, y=1" },
    { topic: "Sistemas lineales", difficulty: "basico", statement: "¿Cuántas soluciones tiene el sistema: x + 2y = 3; 2x + 4y = 6?", type: "multiple_choice", options: ["A) Una solución única", "B) Infinitas soluciones", "C) Sin solución", "D) Dos soluciones"], answer: "B" },
    { topic: "Matrices", difficulty: "basico", statement: "Calculá el producto AB donde A = [[1,2],[3,4]] y B = [[5,6],[7,8]]", type: "open", answer: "[[19,22],[43,50]]" },
    { topic: "Matrices", difficulty: "intermedio", statement: "¿Es invertible la matriz A = [[1,2],[2,4]]? Justificá.", type: "open", answer: "No, porque det(A) = 1*4 - 2*2 = 0" },
    { topic: "Matrices", difficulty: "intermedio", statement: "El determinante de una matriz 3x3 con todas las filas iguales es:", type: "multiple_choice", options: ["A) 1", "B) 0", "C) Depende de los valores", "D) -1"], answer: "B" },
    { topic: "Espacios vectoriales", difficulty: "intermedio", statement: "¿Los vectores (1,0,1), (0,1,1), (1,1,0) son linealmente independientes?", type: "multiple_choice", options: ["A) Sí", "B) No", "C) Solo dos de ellos", "D) Depende del campo"], answer: "A" },
    { topic: "Espacios vectoriales", difficulty: "avanzado", statement: "Encontrá una base del subespacio generado por {(1,1,0), (0,1,1), (1,0,1)} en R³", type: "open", answer: "Cualquier dos de los tres vectores forman base" },
    { topic: "Transformaciones lineales", difficulty: "basico", statement: "Sea T: R²→R² definida por T(x,y) = (2x, x+y). ¿Es T lineal?", type: "multiple_choice", options: ["A) Sí", "B) No", "C) Solo si x=0", "D) Solo para enteros"], answer: "A" },
    { topic: "Autovalores y autovectores", difficulty: "intermedio", statement: "Encontrá los autovalores de A = [[3,1],[0,2]]", type: "open", answer: "λ₁=3, λ₂=2" },
    { topic: "Autovalores y autovectores", difficulty: "avanzado", statement: "¿Una matriz simétrica puede tener autovalores complejos?", type: "multiple_choice", options: ["A) Sí, siempre", "B) No, nunca", "C) Solo si no es positiva definida", "D) Solo si tiene dimensión par"], answer: "B" },
    { topic: "Diagonalización", difficulty: "intermedio", statement: "Diagonalizá la matriz A = [[4,1],[0,3]]", type: "open", answer: "A = PDP⁻¹ con D=diag(4,3)" },
    { topic: "Diagonalización", difficulty: "avanzado", statement: "Una matriz 2x2 con autovalores λ₁=λ₂=2 y solo un autovector lineal:", type: "multiple_choice", options: ["A) Es diagonalizable", "B) No es diagonalizable", "C) Es la matriz identidad", "D) No existe tal matriz"], answer: "B" },
  ],
  "Analisis Matematico": [
    { topic: "Límites", difficulty: "basico", statement: "Calculá: lim(x→0) sin(x)/x", type: "open", answer: "1" },
    { topic: "Límites", difficulty: "basico", statement: "¿Cuál es el valor de lim(n→∞) (1 + 1/n)ⁿ?", type: "multiple_choice", options: ["A) 1", "B) e", "C) ∞", "D) 0"], answer: "B" },
    { topic: "Derivadas", difficulty: "basico", statement: "Derivá f(x) = x³·sin(x)", type: "open", answer: "f'(x) = 3x²sin(x) + x³cos(x)" },
    { topic: "Derivadas", difficulty: "intermedio", statement: "Si f(x) = e^(x²), ¿cuánto vale f''(0)?", type: "open", answer: "f''(0) = 2" },
    { topic: "Regla de L'Hôpital", difficulty: "intermedio", statement: "Calculá: lim(x→0) (eˣ - 1)/x", type: "open", answer: "1 (por L'Hôpital)" },
    { topic: "Integrales", difficulty: "basico", statement: "Calculá: ∫₂x·eˣ dx", type: "open", answer: "2(xeˣ - eˣ) + C" },
    { topic: "Integrales", difficulty: "intermedio", statement: "Calculá: ∫₀¹ x²dx", type: "open", answer: "1/3" },
    { topic: "Integrales", difficulty: "intermedio", statement: "¿Cuál es la integral de 1/(1+x²)?", type: "multiple_choice", options: ["A) ln(1+x²)", "B) arctan(x)", "C) 1/(2x)", "D) -1/(1+x²)"], answer: "B" },
    { topic: "Series", difficulty: "intermedio", statement: "¿Converge la serie Σ(1/n²)?", type: "multiple_choice", options: ["A) Sí, por comparación", "B) No", "C) Condicionalmente", "D) No se puede determinar"], answer: "A" },
    { topic: "Series", difficulty: "avanzado", statement: "Calculá la suma: Σ(n=0 a ∞) 1/n!", type: "open", answer: "e" },
    { topic: "Sucesiones", difficulty: "basico", statement: "¿Converge la sucesión aₙ = (2n+1)/(n+3)?", type: "multiple_choice", options: ["A) Sí, a 0", "B) Sí, a 2", "C) Sí, a 1", "D) No converge"], answer: "B" },
    { topic: "Ecuaciones diferenciales", difficulty: "intermedio", statement: "Resolvé: y' = 2y, y(0) = 1", type: "open", answer: "y = e^(2x)" },
  ],
  "Fisica I": [
    { topic: "Cinemática", difficulty: "basico", statement: "Un cuerpo cae libre desde 20m. ¿Cuánto tarda en llegar al suelo? (g=10 m/s²)", type: "open", answer: "t = √(2h/g) = √(40/10) = 2 s" },
    { topic: "Cinemática", difficulty: "basico", statement: "Un proyectil se lanza horizontalmente a 20 m/s desde 45m. ¿Cuál es el alcance horizontal?", type: "multiple_choice", options: ["A) 20 m", "B) 30 m", "C) 40 m", "D) 60 m"], answer: "C" },
    { topic: "Dinámica", difficulty: "basico", statement: "Un bloque de 5 kg se empuja con F=20N en superficie sin fricción. ¿Cuál es la aceleración?", type: "open", answer: "a = F/m = 4 m/s²" },
    { topic: "Dinámica", difficulty: "intermedio", statement: "Un bloque de 10 kg está en un plano inclinado 30° con fricción μ=0.3. ¿Cuál es la fuerza de fricción? (g=10)", type: "open", answer: "f = μN = μmg·cos(30°) = 0.3·100·(√3/2) ≈ 26 N" },
    { topic: "Dinámica", difficulty: "intermedio", statement: "Según la segunda ley de Newton, si la fuerza neta es cero:", type: "multiple_choice", options: ["A) El cuerpo está en reposo", "B) El cuerpo se mueve a velocidad constante", "C) Ambas son correctas", "D) Ninguna es correcta"], answer: "C" },
    { topic: "Trabajo y energía", difficulty: "basico", statement: "Calculá el trabajo de una fuerza F=50N que mueve un cuerpo 10m en la dirección de la fuerza.", type: "open", answer: "W = F·d = 500 J" },
    { topic: "Trabajo y energía", difficulty: "intermedio", statement: "Un cuerpo de 2 kg cae desde 10m. ¿Cuál es su velocidad al llegar al suelo? (g=10)", type: "open", answer: "v = √(2gh) = √200 ≈ 14.1 m/s" },
    { topic: "Trabajo y energía", difficulty: "intermedio", statement: "La energía cinética de un cuerpo de masa m moviéndose a velocidad v es:", type: "multiple_choice", options: ["A) mv", "B) mv²", "C) ½mv²", "D) 2mv"], answer: "C" },
    { topic: "Momento angular", difficulty: "avanzado", statement: "Un disco gira a 10 rad/s. Si se le duplica la masa sin cambiar radio ni velocidad, ¿cómo cambia el momento angular?", type: "multiple_choice", options: ["A) Se duplica", "B) Cuadruplica", "C) No cambia", "D) Se reduce a la mitad"], answer: "A" },
  ],
  "Quimica General": [
    { topic: "Estructura atómica", difficulty: "basico", statement: "¿Cuántos electrones tiene un átomo de Carbono-12?", type: "multiple_choice", options: ["A) 6", "B) 12", "C) 8", "D) 18"], answer: "A" },
    { topic: "Enlaces químicos", difficulty: "basico", statement: "¿Qué tipo de enlace forma el NaCl?", type: "multiple_choice", options: ["A) Covalente", "B) Iónico", "C) Metálico", "D) Puente de hidrógeno"], answer: "B" },
    { topic: "Estequiometría", difficulty: "intermedio", statement: "En la reacción 2H₂ + O₂ → 2H₂O, ¿cuántos moles de O₂ se necesitan para reaccionar con 6 moles de H₂?", type: "open", answer: "3 moles de O₂" },
    { topic: "Termoquímica", difficulty: "intermedio", statement: "Si ΔH de una reacción es -200 kJ, la reacción es:", type: "multiple_choice", options: ["A) Endotérmica", "B) Exotérmica", "C) Neutra", "D) Imposible de determinar"], answer: "B" },
    { topic: "Equilibrio químico", difficulty: "intermedio", statement: "En el equilibrio N₂ + 3H₂ ⇌ 2NH₃, si se aumenta la presión, ¿hacia dónde se desplaza?", type: "multiple_choice", options: ["A) Hacia los reactivos", "B) Hacia los productos", "C) No se desplaza", "D) Se descompone"], answer: "B" },
    { topic: "Cinética química", difficulty: "intermedio", statement: "Si la velocidad de una reacción se duplica al duplicar la concentración de un reactivo, el orden respecto a ese reactivo es:", type: "multiple_choice", options: ["A) 0", "B) 1", "C) 2", "D) 0.5"], answer: "B" },
  ],
};

function getSubjects() {
  return Object.keys(EXERCISE_BANK);
}

function getTopics(subject) {
  return EXERCISE_BANK[subject] ? [...new Set(EXERCISE_BANK[subject].map(e => e.topic))] : [];
}

function getExercises(subject, { topic = null, difficulty = null, count = 5 } = {}) {
  if (!EXERCISE_BANK[subject]) return [];
  let pool = [...EXERCISE_BANK[subject]];
  if (topic) pool = pool.filter(e => e.topic === topic);
  if (difficulty) pool = pool.filter(e => e.difficulty === difficulty);
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generatePracticeQuiz(subject, options = {}) {
  const exercises = getExercises(subject, options);
  if (exercises.length === 0) return null;
  return {
    title: `Práctica: ${subject}`,
    source: "Banco local",
    questions: exercises.map((e, i) => ({
      id: `q${i + 1}`,
      statement: e.statement,
      topic: e.topic,
      type: e.type,
      options: e.options || [],
      correctAnswer: e.answer,
      points: 1
    }))
  };
}

window.ExerciseBank = { getSubjects, getTopics, getExercises, generatePracticeQuiz, EXERCISE_BANK };
