// biblioteca-tiza.js — CBC UBA: contenido real de Tiza (soytiza.com)

const BIBLIC_TIZA = { currentView: "home", currentSubject: null, currentUnit: null };

// ═══════════════════════════════════════════════════════
// MATERIAS CBC INGENIERÍA (contenido real de Tiza)
// ═══════════════════════════════════════════════════════
const BIBLIC_MATERIAS = [
  {
    id: "am1", name: "Análisis Matemático I", color: "#3b82f6", icon: "∫",
    desc: "Funciones, límites, derivadas, integrales, series — la materia que más gente tropieza en el CBC",
    altillo: "https://www.altillo.com/examenes/uba/cbc/analisis/",
    units: [
      { id: "recta-real-funciones", name: "La recta real y funciones elementales", idea: "Un intervalo es un pedazo de la recta real. Todo el trabajo del cuatrimestre se termina escribiendo como intervalos.", topics: ["1.1 Números reales e intervalos","1.2 Funciones: dominio, imagen y composición","1.3 Función lineal","1.4 Función módulo (valor absoluto)","1.5 Función cuadrática","1.6 Funciones polinómicas y raíz cuadrada","1.7 Funciones racionales","1.8 Funciones homográficas"] },
      { id: "limites-continuidad", name: "Límites y continuidad", idea: "Un límite no pregunta cuánto vale f en x₀, sino a qué valor se acerca f cuando x se acerca a x₀.", topics: ["2.1 Límites en el infinito y asíntotas horizontales","2.2 Límites en un punto","2.3 Continuidad","2.4 Teorema de Bolzano"] },
      { id: "trig-exp-log", name: "Trigonométricas, exponenciales y logaritmos", idea: "Seno y coseno son las coordenadas de un punto que gira en la circunferencia de radio 1.", topics: ["3.1 Funciones trigonométricas","3.2 Identidades, gráficos y periodicidad","3.3 Límites trigonométricos notables","3.4 Exponenciales y logaritmos","3.5 El número e y sus límites","3.6 Resolución de triángulos: teoremas del seno y del coseno"] },
      { id: "derivadas-tangente", name: "Derivadas y recta tangente", idea: "La derivada es la pendiente de la recta tangente. Nadie deriva por definición en el parcial: se usan reglas.", topics: ["4.1 Cociente incremental y derivada en un punto","4.2 Reglas de derivación","4.3 Regla de la cadena","4.4 Recta tangente y recta normal","4.5 Derivabilidad y continuidad","4.6 Tasas de cambio relacionadas","4.7 Derivada de la función inversa"] },
      { id: "tvm-calculo-dif", name: "Teoremas del cálculo diferencial", idea: "Si una función suave sale y vuelve a la misma altura, en algún momento tuvo que aplanarse.", topics: ["5.1 Teorema de Rolle","5.2 Teorema del valor medio (Lagrange)","5.3 Regla de L'Hôpital","5.4 Crecimiento, decrecimiento y extremos","5.5 Concavidad y puntos de inflexión","5.6 Problemas de optimización"] },
      { id: "taylor-aprox", name: "Aproximación polinomial", idea: "Si con una recta la aproximación es buena, con una parábola es mejor, y con un polinomio de grado n mejor todavía.", topics: ["6.1 Aproximación lineal y diferenciales","6.2 Polinomio de Taylor","6.3 Resto de Taylor y cotas de error"] },
      { id: "integrales", name: "Cálculo integral", idea: "Integrar es derivar al revés: buscar la función que, al derivarla, te da la que tenés.", topics: ["7.1 Primitivas e integral indefinida","7.2 Método de sustitución","7.3 Integración por partes","7.4 Ecuaciones diferenciales de variables separables","7.5 Integral definida y Regla de Barrow","7.6 Teorema Fundamental del Cálculo","7.7 Áreas, volúmenes e integrales impropias"] },
      { id: "series", name: "Sucesiones y series", idea: "Una serie es sumar infinitos términos. Suena imposible, pero a veces da un número finito perfectamente concreto.", topics: ["8.1 Sucesiones y su límite","8.2 Teorema del sándwich","8.3 Series numéricas y series geométricas","8.4 Criterios de convergencia","8.5 Series de potencias"] }
    ]
  },
  {
    id: "algebra", name: "Álgebra", color: "#8b5cf6", icon: "⊞",
    desc: "Las cuentas son sistemáticas, pero los parciales preguntan qué pasa cuando aparece un parámetro",
    altillo: "https://www.altillo.com/examenes/uba/cbc/algebra/",
    units: [
      { id: "conjuntos", name: "Conjuntos", idea: "Un conjunto es una colección de元素. Pertenecer e incluir son dos relaciones distintas que se confunden todo el tiempo.", topics: ["1.1 Conjuntos, pertenencia e inclusión","1.2 Unión, intersección y complemento","1.3 Producto cartesiano y partes"] },
      { id: "complejos", name: "Números complejos", idea: "Se agrega un número i que cumple i² = −1, y con eso todo polinomio pasa a tener raíces.", topics: ["2.1 Forma binómica: suma y producto","2.2 Conjugado, módulo e inverso","2.3 Forma polar y exponencial","2.4 De Moivre: potencias y raíces","2.5 Regiones del plano complejo"] },
      { id: "polinomios", name: "Polinomios", idea: "Un polinomio se maneja como un número entero: se suma, se multiplica y se divide con resto.", topics: ["3.1 Grado, operaciones y división","3.2 Teorema del resto y raíces","3.3 Teorema de Gauss y factorización","3.4 Multiplicidad y raíces complejas"] },
      { id: "vectores-rectas-planos", name: "Vectores, rectas y planos", idea: "Un vector es una flecha con dirección, sentido y longitud, y también una lista de números.", topics: ["4.1 Vectores en ℝⁿ","4.2 Producto escalar y producto vectorial","4.3 Rectas: paramétrica e implícita","4.4 Planos en ℝ³","4.5 Posiciones relativas"] },
      { id: "norma-proyecciones", name: "Norma, distancia y proyecciones", idea: "La norma es la longitud de un vector, y sale de Pitágoras. La distancia entre dos puntos es la norma de su diferencia.", topics: ["5.1 Norma y distancia","5.2 Ángulo entre vectores","5.3 Áreas, volúmenes y producto mixto","5.4 Proyección ortogonal y distancias","5.5 Proyección sobre un plano","5.6 Punto simétrico"] },
      { id: "matrices-sistemas", name: "Matrices, sistemas y subespacios", idea: "Un sistema se escribe como matriz ampliada y se triangula con operaciones de fila. Triangulado, se resuelve de abajo hacia arriba.", topics: ["6.1 Matrices y producto","6.2 Sistemas lineales y eliminación de Gauss","6.3 Rango y compatibilidad","6.4 Sistemas con parámetro","6.5 Matriz inversa","6.6 Subespacios de ℝⁿ","6.7 Combinaciones lineales y generadores","6.8 Independencia lineal","6.9 Base y dimensión"] },
      { id: "determinantes", name: "Determinantes", idea: "El determinante es un número que se le asigna a una matriz cuadrada. Si da distinto de cero, la matriz es inversible.", topics: ["7.1 Cómo se calcula un determinante","7.2 Propiedades del determinante","7.3 Determinante, inversa e independencia"] },
      { id: "transformaciones-lineales", name: "Transformaciones lineales", idea: "Es una función entre espacios que respeta la suma y el producto por escalares.", topics: ["8.1 Qué es una transformación lineal","8.2 La matriz de una transformación","8.3 Transformaciones del plano","8.4 Núcleo, imagen y clasificación","8.5 Proyectores"] },
      { id: "conicas", name: "Cónicas", idea: "Todos los puntos que están a igual distancia de un punto fijo y de una recta fija. De esa condición sale la ecuación.", topics: ["9.1 La parábola","9.2 Circunferencia y elipse","9.3 La hipérbola y clasificación"] }
    ]
  },
  {
    id: "fisica", name: "Física I", color: "#f59e0b", icon: "◉",
    desc: "En Física casi nadie se traba con la cuenta. Se traba antes: en pasar del enunciado al dibujo.",
    altillo: "https://www.altillo.com/examenes/uba/cbc/fis/",
    units: [
      { id: "magnitudes-vectores", name: "Magnitudes físicas y vectores", idea: "En física un número sin unidad no significa nada. Y convertir unidades no es magia: es multiplicar por 1 escrito de forma conveniente.", topics: ["1.1 Unidades, notación científica y conversiones","1.2 Análisis dimensional","1.3 Vectores: componentes, módulo y dirección","1.4 Operaciones con vectores"] },
      { id: "cinematica-1d", name: "Cinemática en una dimensión", idea: "Todo problema de cinemática empieza igual: elegir un sistema de referencia y escribir la ecuación horaria de cada móvil.", topics: ["2.1 Posición, velocidad y MRU","2.2 Aceleración y MRUV","2.3 Gráficos del movimiento","2.4 Caída libre y tiro vertical"] },
      { id: "cinematica-2d", name: "Cinemática en dos dimensiones", idea: "El tiro oblicuo no es un movimiento nuevo: son dos movimientos que ya sabés, ocurriendo al mismo tiempo y sin molestarse.", topics: ["3.1 Tiro oblicuo","3.2 Movimiento circular","3.3 Movimiento relativo"] },
      { id: "dinamica", name: "Dinámica", idea: "El diagrama de cuerpo libre no es un dibujito decorativo: es la parte del problema donde se decide todo.", topics: ["4.1 Leyes de Newton y diagrama de cuerpo libre","4.2 Cuerpos vinculados: sogas y poleas","4.3 Rozamiento","4.4 Dinámica del movimiento circular","4.5 Fuerza elástica: ley de Hooke","4.6 Gravitación universal"] },
      { id: "estatica", name: "Estática", idea: "Equilibrio no quiere decir quieto: quiere decir sin aceleración. Un ascensor que sube a velocidad constante está en equilibrio.", topics: ["5.1 Equilibrio de un cuerpo puntual","5.2 Momento de una fuerza y cuerpo rígido"] },
      { id: "trabajo-energia", name: "Trabajo y energía", idea: "En física, sostener una bolsa sin moverse no es trabajo. Trabajo hay solo si la fuerza tiene una componente en la dirección del desplazamiento.", topics: ["6.1 Trabajo y potencia","6.2 Teorema del trabajo y la energía cinética","6.3 Energía potencial y conservación","6.4 Energía con rozamiento"] },
      { id: "hidrostatica", name: "Hidrostática", idea: "La presión no es lo mismo que la fuerza: es fuerza repartida por unidad de área. Por eso un clavo perfora y un ladrillo apoyado no.", topics: ["7.1 Densidad y presión","7.2 Teorema fundamental de la hidrostática","7.3 Principio de Pascal","7.4 Principio de Arquímedes"] }
    ]
  },
  {
    id: "penscomp", name: "Pensamiento Computacional", color: "#22c55e", icon: "⟨⟩",
    desc: "Lo que más cuesta no es la sintaxis de Python sino que la computadora hace exactamente lo que escribiste",
    altillo: "https://www.altillo.com/examenes/uba/cbc/pensamientocomputacional/",
    units: [
      { id: "algoritmos-programacion", name: "Algoritmos y programación", idea: "Un algoritmo es una receta: pasos finitos, sin ambigüedad, que a partir de ciertos datos llegan a un resultado.", topics: ["1.1 Qué es un algoritmo","1.2 Cómo ejecuta la computadora","1.3 Tu primer programa"] },
      { id: "datos-expresiones-funciones", name: "Datos, expresiones y funciones", idea: "Una variable es un nombre pegado a un valor. El signo = no compara: guarda.", topics: ["2.1 Variables y asignación","2.2 Tipos de datos","2.3 Operadores numéricos","2.4 Cadenas de texto","2.5 Funciones"] },
      { id: "control", name: "Estructuras de control", idea: "Las condiciones se evalúan en orden y la primera que da True corta. Por eso el orden cambia el resultado.", topics: ["3.1 Booleanos y comparaciones","3.2 Decisiones: if, elif, else","3.3 Ciclo for y range","3.4 Ciclo while"] },
      { id: "estructuras-datos", name: "Estructuras de datos", idea: "Una lista guarda varios valores en orden, bajo un solo nombre. A diferencia de un string, se puede modificar.", topics: ["4.1 Listas","4.2 Mutabilidad y referencias","4.3 Recorrer y ordenar listas","4.4 Tuplas","4.5 Diccionarios"] },
      { id: "entrada-salida-errores", name: "Entrada, salida y errores", idea: "Un archivo es la forma de que los datos sobrevivan al programa. Se abre, se usa y se cierra.", topics: ["5.1 Archivos","5.2 Manejo de errores"] },
      { id: "bibliotecas", name: "Bibliotecas de Python", idea: "Una biblioteca es código que ya está hecho. NumPy trae arrays que operan sobre todos los elementos a la vez.", topics: ["6.1 Bibliotecas y NumPy","6.2 Pandas y DataFrames","6.3 Gráficos con Matplotlib"] }
    ]
  },
  {
    id: "ipc", name: "Introducción al Pensamiento Científico", color: "#06b6d4", icon: "🔬",
    desc: "Lo que el parcial pide es usar las herramientas: mirar un argumento y decidir si es válido",
    altillo: "https://www.altillo.com/examenes/uba/cbc/pensamiento/",
    units: [
      { id: "ciencia-moderna", name: "La ciencia moderna: surgimiento y características", idea: "La ciencia no es el único conocimiento válido: es uno entre varios, y lo que la distingue no es que sea más verdadera sino cómo justifica lo que afirma.", topics: ["1.1 Las formas del conocimiento","1.2 De Ptolomeo a Copérnico: la ciencia como producto histórico","1.3 Características de la ciencia moderna","1.4 Ciencias formales y ciencias fácticas"] },
      { id: "razonamientos-verdad", name: "Razonamientos, verdad y validez", idea: "La lógica sólo trabaja con oraciones que pueden ser verdaderas o falsas.", topics: ["2.1 Los usos del lenguaje y las proposiciones","2.2 Razonamientos deductivos e inductivos","2.3 Verdad y validez","2.4 Formas válidas y falacias formales","2.5 El método hipotético-deductivo"] },
      { id: "progreso-ciencia", name: "El progreso de la ciencia", idea: "Una teoría no vale por cuánto la confirman sus casos favorables, sino por cuánto se expone a ser refutada.", topics: ["3.1 Inductivismo y el problema de la inducción","3.2 El falsacionismo de Popper","3.3 Kuhn: paradigmas, ciencia normal y revoluciones","3.4 Epistemología feminista: contra las dicotomías"] },
      { id: "investigacion-social", name: "El proceso de investigación social", idea: "Un tema es un área; un problema es una pregunta que se puede responder con evidencia.", topics: ["4.1 Del tema al problema de investigación","4.2 Marco teórico, hipótesis y variables","4.3 Población, muestra y técnicas de recolección","4.4 Elaboración y lectura de cuadros"] }
    ]
  },
  {
    id: "socyestado", name: "Sociedad y Estado", color: "#ec4899", icon: "⚖",
    desc: "Lo que el parcial pide no es contar de qué trata cada texto: es usar las distinciones",
    altillo: "https://www.altillo.com/examenes/uba/cbc/socyestado/",
    units: [
      { id: "estado-que-es", name: "El Estado: qué es", idea: "El Estado es la organización que domina un territorio. Cuatro palabras que en la calle funcionan como sinónimos y en esta materia nombran cuatro cosas distintas.", topics: ["1.1 Estado, nación, gobierno y país","1.2 Los elementos del Estado: población, territorio y poder","1.3 Poder, dominación y disciplina","1.4 Los tres tipos de dominación legítima","1.5 Burocracia y monopolio de la violencia legítima"] },
      { id: "formacion-estado", name: "Cómo se forma un Estado", idea: "Nadie se sentó a diseñar el Estado moderno: salió como subproducto de gobernantes que necesitaban plata para pelear.", topics: ["2.1 Guerra y construcción estatal","2.2 El Estado como crimen organizado","2.3 Estatidad: las cuatro capacidades","2.4 La formación del Estado argentino","2.5 Las formas de penetración estatal"] },
      { id: "bienestar-crisis", name: "El Estado de bienestar y su crisis", idea: "No es el Estado que ayuda a los pobres: es el que convierte en derecho exigible el acceso a bienes que antes dependían del mercado.", topics: ["3.1 Qué es el Estado de bienestar","3.2 Bismarck y Keynes: dos matrices","3.3 La crisis de los setenta","3.4 Del Estado de bienestar al Estado neoliberal"] },
      { id: "regimen-democracia", name: "Régimen político: democracia y autoritarismo", idea: "El Estado es lo que permanece, el régimen son las reglas para acceder al poder, el gobierno son las personas que lo ejercen.", topics: ["4.1 Estado, régimen y gobierno","4.2 Poliarquía: las condiciones de Dahl","4.3 Las dos transformaciones de la democracia","4.4 Estado y democratización en América Latina","4.5 El origen del federalismo argentino"] },
      { id: "presidencialismo-congreso", name: "Presidencialismo, Congreso y elecciones", idea: "El sistema electoral es la máquina que convierte votos en bancas, y no es neutral.", topics: ["5.1 Qué define a un presidencialismo","5.2 Los poderes del presidente argentino","5.3 Sistemas electorales: cómo los votos se vuelven bancas","5.4 El sistema electoral argentino","5.5 La Constitución y la sala de máquinas"] },
      { id: "federalismo-subnacional", name: "Federalismo y política subnacional", idea: "En la Argentina el nivel que junta la plata no es el que la gasta: la Nación recauda alrededor del 80% de los impuestos.", topics: ["6.1 Federalismo fiscal: quién recauda y quién gasta","6.2 Rentismo fiscal y regímenes subnacionales","6.3 Carreras políticas y territorio","6.4 El federalismo como negociación permanente"] },
      { id: "derechos-genero", name: "Derechos, género y movimientos sociales", idea: "Un derecho humano se reconoce por la sola condición de persona, pero lo que se amplió fue la lista de derechos y no la maquinaria que tendría que hacerlos valer.", topics: ["7.1 Derechos humanos en democracia","7.2 Del reclamo a los tribunales","7.3 Los derechos políticos de las mujeres","7.4 Cuotas y paridad","7.5 Movimientos sociales, partidos y coaliciones"] },
      { id: "actores-medios", name: "Actores, medios y políticas públicas", idea: "Una política pública es la toma de posición del Estado frente a una cuestión.", topics: ["8.1 Qué es una política pública","8.2 La administración pública","8.3 Grupos de interés, sindicatos y negociación","8.4 Redes sociales, medios y opinión pública","8.5 Integración regional y política exterior"] }
    ]
  }
];

// ═══════════════════════════════════════════════════════
// PARCIALES (información real de Tiza)
// ═══════════════════════════════════════════════════════
const PARCIALES_DATA = {
  am1: [
    { nombre: "Primer parcial", ejercicios: 4, preguntas: 24, duracion: 120, aprueba: 60, temas: ["Recta real y funciones elementales","Límites y continuidad","Trigonométricas, exponenciales y logaritmos"] },
    { nombre: "Segundo parcial", ejercicios: 4, preguntas: 21, duracion: 120, aprueba: 60, temas: ["Derivadas y recta tangente","Teoremas del cálculo diferencial","Aproximación polinomial","Cálculo integral","Sucesiones y series"] }
  ],
  algebra: [
    { nombre: "Primer parcial", ejercicios: 4, preguntas: 20, duracion: 120, aprueba: 60, temas: ["Conjuntos","Números complejos","Polinomios","Vectores, rectas y planos","Norma, distancia y proyecciones"] },
    { nombre: "Segundo parcial", ejercicios: 4, preguntas: 26, duracion: 120, aprueba: 60, temas: ["Matrices, sistemas y subespacios","Determinantes","Transformaciones lineales","Cónicas"] }
  ],
  fisica: [
    { nombre: "Primer parcial", ejercicios: 4, preguntas: 20, duracion: 120, aprueba: 60, temas: ["Magnitudes físicas y vectores","Cinemática en una dimensión","Cinemática en dos dimensiones","Dinámica"] },
    { nombre: "Segundo parcial", ejercicios: 4, preguntas: 22, duracion: 120, aprueba: 60, temas: ["Estática","Trabajo y energía","Hidrostática"] }
  ],
  ipc: [
    { nombre: "Primer parcial", ejercicios: 10, preguntas: 10, duracion: 75, aprueba: 60, temas: ["La ciencia moderna","Razonamientos, verdad y validez"] },
    { nombre: "Segundo parcial", ejercicios: 10, preguntas: 10, duracion: 75, aprueba: 60, temas: ["El progreso de la ciencia","El proceso de investigación social"] }
  ],
  penscomp: [
    { nombre: "Primer parcial", ejercicios: 6, preguntas: 30, duracion: 120, aprueba: 60, temas: ["Algoritmos y programación","Datos, expresiones y funciones","Estructuras de control"] },
    { nombre: "Segundo parcial", ejercicios: 6, preguntas: 33, duracion: 120, aprueba: 60, temas: ["Estructuras de datos","Entrada, salida y errores","Bibliotecas de Python"] }
  ],
  socyestado: [
    { nombre: "Primer parcial", ejercicios: 7, preguntas: 30, duracion: 110, aprueba: 60, temas: ["El Estado: qué es","Cómo se forma un Estado","El Estado de bienestar y su crisis","Régimen político: democracia y autoritarismo"] },
    { nombre: "Segundo parcial", ejercicios: 9, preguntas: 27, duracion: 90, aprueba: 60, temas: ["Presidencialismo, Congreso y elecciones","Federalismo y política subnacional","Derechos, género y movimientos sociales","Actores, medios y políticas públicas"] }
  ]
};

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function btKatex(html) {
  if (typeof katex === "undefined") return html;
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => { try { return katex.renderToString(t.trim(), {displayMode:true,throwOnError:false}); } catch { return "[math]"; } });
  html = html.replace(/\$([^\$\n]+?)\$/g, (_, t) => { try { return katex.renderToString(t.trim(), {displayMode:false,throwOnError:false}); } catch { return "[math]"; } });
  return html;
}

function btMd(text) {
  if (!text) return "";
  let h = text
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
    .replace(/`([^`]+)`/g,"<code style='background:rgba(139,92,246,0.1);padding:0.1rem 0.3rem;border-radius:4px;font-size:0.78rem'>$1</code>")
    .replace(/^## (.+)$/gm,"<h3 style='font-size:0.88rem;font-weight:700;margin:0.8rem 0 0.3rem;color:var(--text-primary)'>$1</h3>")
    .replace(/^### (.+)$/gm,"<h4 style='font-size:0.82rem;font-weight:700;margin:0.6rem 0 0.2rem;color:var(--text-primary)'>$1</h4>")
    .replace(/\n\n/g,"</p><p style='margin:0.3rem 0'>")
    .replace(/\n/g,"<br>");
  h = "<p style='margin:0.3rem 0'>" + h + "</p>";
  return btKatex(h);
}

function renderMath(el) {
  setTimeout(() => {
    if (window.renderMathInElement) {
      try { window.renderMathInElement(el, { delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}], throwOnError:false }); } catch {}
    }
  }, 50);
}

function toggleBiblic(id) { const el = document.getElementById(id); if (el) el.style.display = el.style.display === "none" ? "block" : "none"; }
function saveExamDate(s, d) { const sv = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}"); if (d) sv[s] = d; else delete sv[s]; localStorage.setItem("biblic_exam_dates", JSON.stringify(sv)); }
function createStudyPlan() { const s = document.getElementById("biblic-plan-subj")?.value, d = document.getElementById("biblic-plan-date")?.value; if (!s || !d) return; saveExamDate(s, d); BIBLIC_TIZA.currentSubject = s; BIBLIC_TIZA.currentView = "plan"; renderBiblioteca(); }

// ═══════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════
function renderBiblioteca() {
  const el = document.getElementById("biblioteca-view");
  if (!el) return;
  const v = BIBLIC_TIZA.currentView;
  if (v === "home") renderHome(el);
  else if (v === "subject") renderSubject(el);
  else if (v === "unit") renderUnit(el);
  else if (v === "parciales") renderParcial(el);
  else if (v === "plan") renderPlan(el);
}

function renderHome(el) {
  const saved = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}");
  el.innerHTML = `<div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
    <div style="text-align:center;margin-bottom:1.5rem">
      <h1 style="font-family:var(--font-heading);font-size:1.35rem;color:var(--text-primary);margin-bottom:0.2rem">📚 CBC</h1>
      <p style="color:var(--text-muted);font-size:0.78rem">Explicaciones paso a paso · Parciales resueltos · Plan de estudio</p>
      <p style="color:var(--text-muted);font-size:0.65rem;margin-top:0.2rem">Contenido de <a href="https://soytiza.com" target="_blank" style="color:#8b5cf6;text-decoration:none">soytiza.com</a></p>
    </div>
    <div style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(59,130,246,0.05));border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:0.8rem 1rem;margin-bottom:1rem">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem"><span style="font-size:0.85rem">🎯</span><span style="font-size:0.78rem;font-weight:700;color:var(--text-primary)">Plan de estudio</span></div>
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center">
        <select id="biblic-plan-subj" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.5rem;font-size:0.7rem;color:var(--text-primary);min-width:140px">${BIBLIC_MATERIAS.map(m=>`<option value="${m.id}">${m.name}</option>`).join("")}</select>
        <input type="date" id="biblic-plan-date" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.5rem;font-size:0.7rem;color:var(--text-primary)">
        <button onclick="createStudyPlan()" style="padding:0.3rem 0.7rem;background:#8b5cf6;color:white;border:none;border-radius:8px;font-size:0.7rem;font-weight:600;cursor:pointer">Armar</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:0.5rem;margin-bottom:1.2rem">
      ${BIBLIC_MATERIAS.map(m=>{const ex=PARCIALES_DATA[m.id]||[];return`<div onclick="BIBLIC_TIZA.currentView='subject';BIBLIC_TIZA.currentSubject='${m.id}';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:0.8rem;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='${m.color}50'" onmouseout="this.style.borderColor='var(--border-color)'"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem"><div style="width:36px;height:36px;border-radius:9px;background:${m.color}18;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:${m.color};border:1px solid ${m.color}30">${m.icon}</div><div style="flex:1;min-width:0"><div style="font-size:0.8rem;font-weight:700;color:var(--text-primary)">${m.name}</div><div style="font-size:0.62rem;color:var(--text-muted)">${m.units.length} unidades · ${ex.length} parciales</div></div></div>${saved[m.id]?`<div style="font-size:0.58rem;color:#f59e0b;margin-top:0.2rem">📅 ${saved[m.id]}</div>`:''}</div>`}).join("")}
    </div>
    <div style="margin-bottom:1.2rem"><h3 style="font-size:0.85rem;font-weight:700;color:var(--text-primary);margin-bottom:0.5rem">📄 Parciales</h3><div style="display:flex;flex-direction:column;gap:0.35rem">${Object.entries(PARCIALES_DATA).flatMap(([mid,exams])=>{const mat=BIBLIC_MATERIAS.find(m=>m.id===mid);if(!mat)return[];return exams.map((ex,i)=>`<div onclick="BIBLIC_TIZA.currentView='parciales';BIBLIC_TIZA.currentSubject='${mid}';window._parcIdx=${i};renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.55rem 0.7rem;cursor:pointer;display:flex;align-items:center;justify-content:space-between" onmouseover="this.style.borderColor='${mat.color}40'" onmouseout="this.style.borderColor='var(--border-color)'"><div style="display:flex;align-items:center;gap:0.4rem"><div style="width:6px;height:6px;border-radius:50%;background:${mat.color};flex-shrink:0"></div><span style="font-size:0.72rem;font-weight:600;color:var(--text-primary)">${mat.name}</span><span style="font-size:0.6rem;color:var(--text-muted)">${ex.nombre} · ${ex.ejercicios} ej · ${ex.preguntas} preg · ${ex.duracion}min</span></div><div style="display:flex;gap:0.2rem">${ex.temas.slice(0,3).map(t=>`<span style="font-size:0.52rem;padding:0.08rem 0.3rem;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:4px;color:#8b5cf6">${t}</span>`).join("")}</div></div>`)}).join("")}</div></div>
    <div style="padding:0.7rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px"><div style="font-size:0.72rem;font-weight:700;color:var(--text-primary);margin-bottom:0.3rem">📂 Repositorios</div><div style="display:flex;flex-direction:column;gap:0.2rem">${BIBLIC_MATERIAS.map(m=>`<a href="${m.altillo}" target="_blank" style="font-size:0.68rem;color:${m.color};text-decoration:none;display:flex;align-items:center;gap:0.3rem" onclick="event.stopPropagation()">→ <span style="font-weight:600">${m.name}</span> <span style="color:var(--text-muted);font-weight:400">— Altillo</span></a>`).join("")}</div></div>
  </div>`;
  renderMath(el);
}

function renderSubject(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  if (!mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }
  const saved = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}");
  const exams = PARCIALES_DATA[mat.id] || [];
  el.innerHTML = `<div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem">
      <button onclick="BIBLIC_TIZA.currentView='home';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← CBC</button>
      <div style="width:30px;height:30px;border-radius:8px;background:${mat.color}18;display:flex;align-items:center;justify-content:center;font-size:0.95rem;color:${mat.color}">${mat.icon}</div>
      <h2 style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin:0">${mat.name}</h2>
    </div>
    <p style="font-size:0.72rem;color:var(--text-muted);font-style:italic;margin-bottom:0.6rem">"${mat.desc}"</p>
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.6rem 0.8rem;margin-bottom:0.8rem;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">
      <span style="font-size:0.72rem;font-weight:600;color:var(--text-primary)">📅 Parcial:</span>
      <input type="date" id="subj-date" value="${saved[mat.id]||''}" onchange="saveExamDate('${mat.id}',this.value)" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.25rem 0.4rem;font-size:0.68rem;color:var(--text-primary)">
      ${saved[mat.id]?`<button onclick="BIBLIC_TIZA.currentView='plan';renderBiblioteca()" style="padding:0.2rem 0.5rem;background:#8b5cf6;color:white;border:none;border-radius:6px;font-size:0.65rem;font-weight:600;cursor:pointer">Ver plan</button>`:''}
      <a href="${mat.altillo}" target="_blank" style="margin-left:auto;font-size:0.62rem;color:${mat.color};text-decoration:none">→ Altillo</a>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1rem">${mat.units.map((u,i)=>`<div onclick="BIBLIC_TIZA.currentView='unit';BIBLIC_TIZA.currentUnit='${u.id}';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='${mat.color}40'" onmouseout="this.style.borderColor='var(--border-color)'"><div style="display:flex;align-items:center;gap:0.5rem"><span style="width:26px;height:26px;border-radius:50%;background:${mat.color}20;display:flex;align-items:center;justify-content:center;font-size:0.68rem;font-weight:700;color:${mat.color};flex-shrink:0">${i+1}</span><div style="flex:1;min-width:0"><div style="font-size:0.8rem;font-weight:700;color:var(--text-primary)">${u.name}</div><div style="font-size:0.65rem;color:var(--text-muted);font-style:italic">"${u.idea}"</div><div style="font-size:0.58rem;color:var(--text-muted);margin-top:0.15rem">${u.topics.length} temas</div></div></div></div>`).join("")}</div>
    ${exams.length?`<h3 style="font-size:0.82rem;font-weight:700;color:var(--text-primary);margin-bottom:0.4rem">📄 Parciales</h3><div style="display:flex;flex-direction:column;gap:0.35rem">${exams.map((ex,i)=>`<div onclick="BIBLIC_TIZA.currentView='parciales';window._parcIdx=${i};renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem 0.6rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onmouseover="this.style.borderColor='${mat.color}40'" onmouseout="this.style.borderColor='var(--border-color)'"><div style="display:flex;align-items:center;gap:0.4rem"><span style="font-size:0.7rem;font-weight:600;color:var(--text-primary)">${ex.nombre}</span><span style="font-size:0.55rem;color:var(--text-muted)">${ex.ejercicios} ej · ${ex.preguntas} preg · ${ex.duracion}min · se aprueba con ${ex.aprueba}</span></div></div>`).join("")}</div>`:''}
  </div>`;
}

function renderUnit(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  if (!mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }
  const unit = mat.units.find(u => u.id === BIBLIC_TIZA.currentUnit);
  if (!unit) { BIBLIC_TIZA.currentView = "subject"; renderBiblioteca(); return; }
  const ui = mat.units.indexOf(unit);
  el.innerHTML = `<div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.6rem">
      <button onclick="BIBLIC_TIZA.currentView='subject';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← ${mat.name}</button>
    </div>
    <div style="text-align:center;margin-bottom:1rem;padding:0.8rem;background:linear-gradient(135deg,${mat.color}10,${mat.color}05);border:1px solid ${mat.color}25;border-radius:12px">
      <div style="font-size:0.58rem;color:${mat.color};font-weight:600;margin-bottom:0.1rem">UNIDAD ${ui+1}/${mat.units.length}</div>
      <h2 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin:0 0 0.2rem">${unit.name}</h2>
      <p style="font-size:0.75rem;color:var(--text-muted);font-style:italic">"${unit.idea}"</p>
    </div>
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:0.8rem 1rem;margin-bottom:0.8rem">
      <div style="font-size:0.78rem;font-weight:700;color:var(--text-primary);margin-bottom:0.4rem">📖 Temas de esta unidad</div>
      ${unit.topics.map((t,i)=>`<div style="display:flex;gap:0.35rem;align-items:flex-start;margin-bottom:0.3rem;padding:0.3rem 0.4rem;background:rgba(139,92,246,0.04);border-radius:6px"><span style="color:${mat.color};font-size:0.6rem;flex-shrink:0;font-weight:700">${i+1}</span><span style="font-size:0.72rem;color:var(--text-primary);line-height:1.4">${t}</span></div>`).join("")}
    </div>
    <div style="background:linear-gradient(135deg,rgba(239,68,68,0.06),rgba(220,38,38,0.03));border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:0.7rem;margin-bottom:0.8rem">
      <div style="font-size:0.75rem;font-weight:700;color:#ef4444;margin-bottom:0.3rem">⚠ Donde se cae la mayoría</div>
      <div style="font-size:0.68rem;color:var(--text-muted);line-height:1.5">Cada tema del parcial tiene errores típicos que comete la mayoría. Mirá la explicación completa en <a href="https://soytiza.com" target="_blank" style="color:#8b5cf6;text-decoration:none">soytiza.com</a> para ver los errores y ejercicios resueltos paso a paso.</div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:0.8rem">
      ${ui>0?`<button onclick="BIBLIC_TIZA.currentUnit='${mat.units[ui-1].id}';renderBiblioteca()" style="padding:0.35rem 0.7rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;font-size:0.68rem;cursor:pointer;color:var(--text-primary)">← ${mat.units[ui-1].name}</button>`:'<div></div>'}
      ${ui<mat.units.length-1?`<button onclick="BIBLIC_TIZA.currentUnit='${mat.units[ui+1].id}';renderBiblioteca()" style="padding:0.35rem 0.7rem;background:${mat.color};color:white;border:none;border-radius:8px;font-size:0.68rem;cursor:pointer;font-weight:600">${mat.units[ui+1].name} →</button>`:'<div></div>'}
    </div>
    <div style="margin-top:1rem;padding:0.7rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;text-align:center">
      <a href="https://soytiza.com" target="_blank" style="font-size:0.75rem;color:${mat.color};text-decoration:none;font-weight:600">→ Ver explicación completa en Tiza</a>
      <div style="font-size:0.6rem;color:var(--text-muted);margin-top:0.2rem">Teoría, ejercicios resueltos paso a paso y animaciones</div>
    </div>
  </div>`;
  renderMath(el);
}

function renderParcial(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  const exams = PARCIALES_DATA[BIBLIC_TIZA.currentSubject] || [];
  const ex = exams[window._parcIdx || 0];
  if (!ex || !mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }
  el.innerHTML = `<div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.6rem">
      <button onclick="BIBLIC_TIZA.currentView='subject';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← ${mat.name}</button>
      <h2 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin:0">📄 ${ex.nombre}</h2>
    </div>
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;margin-bottom:0.8rem">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;text-align:center">
        <div><div style="font-size:1.2rem;font-weight:800;color:${mat.color}">${ex.ejercicios}</div><div style="font-size:0.6rem;color:var(--text-muted)">ejercicios</div></div>
        <div><div style="font-size:1.2rem;font-weight:800;color:${mat.color}">${ex.preguntas}</div><div style="font-size:0.6rem;color:var(--text-muted)">preguntas</div></div>
        <div><div style="font-size:1.2rem;font-weight:800;color:${mat.color}">${ex.duracion}min</div><div style="font-size:0.6rem;color:var(--text-muted)">duración</div></div>
      </div>
      <div style="text-align:center;margin-top:0.4rem;font-size:0.65rem;color:var(--text-muted)">Se aprueba con ${ex.aprueba}%</div>
    </div>
    <div style="margin-bottom:0.8rem"><div style="font-size:0.75rem;font-weight:700;color:var(--text-primary);margin-bottom:0.3rem">📚 Temas del parcial</div><div style="display:flex;flex-wrap:wrap;gap:0.25rem">${ex.temas.map(t=>`<span style="font-size:0.58rem;padding:0.12rem 0.4rem;background:${mat.color}15;border:1px solid ${mat.color}30;border-radius:5px;color:${mat.color};font-weight:600">${t}</span>`).join("")}</div></div>
    <div style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(59,130,246,0.05));border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:0.8rem;text-align:center;margin-bottom:0.8rem">
      <div style="font-size:0.78rem;font-weight:700;color:var(--text-primary);margin-bottom:0.3rem">📝 Parcial resuelto paso a paso</div>
      <div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:0.5rem">Los parciales modelo de Tiza están escritos con el temario y formato reales.</div>
      <a href="https://soytiza.com/${mat.id === 'am1' ? 'analisis' : mat.id === 'algebra' ? 'algebra' : mat.id === 'fisica' ? 'fisica' : mat.id === 'penscomp' ? 'computacional' : mat.id === 'ipc' ? 'ipc' : 'sociedad'}/primer-parcial-resuelto" target="_blank" style="display:inline-block;padding:0.4rem 1rem;background:${mat.color};color:white;border-radius:8px;font-size:0.7rem;font-weight:600;text-decoration:none">Ver primer parcial →</a>
      <a href="https://soytiza.com/${mat.id === 'am1' ? 'analisis' : mat.id === 'algebra' ? 'algebra' : mat.id === 'fisica' ? 'fisica' : mat.id === 'penscomp' ? 'computacional' : mat.id === 'ipc' ? 'ipc' : 'sociedad'}/segundo-parcial-resuelto" target="_blank" style="display:inline-block;padding:0.4rem 1rem;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-primary);border-radius:8px;font-size:0.7rem;font-weight:600;text-decoration:none;margin-left:0.3rem">Ver segundo parcial →</a>
    </div>
    <div style="padding:0.6rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px">
      <div style="font-size:0.7rem;font-weight:700;color:var(--text-primary);margin-bottom:0.2rem">💡 Antes de rendir</div>
      <div style="font-size:0.65rem;color:var(--text-muted);line-height:1.5">• Hacé los ejercicios SIN mirar la solución<br>• Resolvé al menos 1 parcial completo cronometrado<br>• Si un tema no cierra, pedile explicación al chat</div>
    </div>
  </div>`;
  renderMath(el);
}

function renderPlan(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  if (!mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }
  const saved = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}");
  const examDate = saved[mat.id];
  if (!examDate) { BIBLIC_TIZA.currentView = "subject"; renderBiblioteca(); return; }
  const today = new Date(), exam = new Date(examDate);
  const daysLeft = Math.max(1, Math.ceil((exam - today) / (1000*60*60*24)));
  const dpu = Math.max(1, Math.floor(daysLeft / mat.units.length));
  el.innerHTML = `<div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem">
      <button onclick="BIBLIC_TIZA.currentView='subject';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← ${mat.name}</button>
      <h2 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin:0">🎯 Plan de estudio</h2>
    </div>
    <div style="background:linear-gradient(135deg,${mat.color}10,${mat.color}05);border:1px solid ${mat.color}25;border-radius:12px;padding:0.8rem;margin-bottom:0.8rem;text-align:center">
      <div style="font-size:1.8rem;font-weight:800;color:${mat.color}">${daysLeft}</div>
      <div style="font-size:0.72rem;color:var(--text-muted)">días para el parcial</div>
      <div style="font-size:0.62rem;color:var(--text-muted);margin-top:0.15rem">📅 ${examDate}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.35rem">${mat.units.map((u,i)=>{const s=i*dpu+1, e=Math.min((i+1)*dpu,daysLeft);return`<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.6rem;display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:0.5rem"><span style="width:26px;height:26px;border-radius:50%;background:${mat.color}18;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:${mat.color};flex-shrink:0">${i+1}</span><div><div style="font-size:0.75rem;font-weight:700;color:var(--text-primary)">${u.name}</div><div style="font-size:0.58rem;color:var(--text-muted)">Días ${s}–${e} · ${u.topics.length} temas</div></div></div><button onclick="BIBLIC_TIZA.currentUnit='${u.id}';BIBLIC_TIZA.currentView='unit';renderBiblioteca()" style="padding:0.2rem 0.5rem;background:${mat.color}15;color:${mat.color};border:1px solid ${mat.color}30;border-radius:6px;font-size:0.58rem;cursor:pointer;font-weight:600">Estudiar</button></div>`}).join("")}</div>
    <div style="margin-top:0.8rem;padding:0.7rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px">
      <div style="font-size:0.72rem;font-weight:700;color:var(--text-primary);margin-bottom:0.3rem">💡 Tips</div>
      <div style="font-size:0.68rem;color:var(--text-muted);line-height:1.5">• Hacé los ejercicios SIN mirar la solución<br>• Resolvé al menos 1 parcial completo cronometrado<br>• Si un tema no cierra, pedile explicación al chat</div>
    </div>
  </div>`;
}

window.renderBiblioteca = renderBiblioteca;
window.toggleBiblic = toggleBiblic;
window.saveExamDate = saveExamDate;
window.createStudyPlan = createStudyPlan;
window._parcIdx = 0;
