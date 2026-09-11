// knowledge-graph.js — Phase 1: Visual knowledge graph engine
const KG = {
  nodes: [], edges: [],
  active: null, hover: null, view: "graph",
  search: "", filterType: "", filterMateria: "",
  camX: 0, camY: 0, camZoom: 1,
  dragging: null, panning: false, lastMouse: null, dragMoved: false,
  anim: null, time: 0,
  focus: null, // focus mode: nodeId or null
  focusLevels: new Map(), // nodeId -> level (0=center, 1=direct, 2=indirect, 99=dimmed)
  listMode: false,
  showOnboarding: !localStorage.getItem("kg_onboarding_done")
};

const MATERIA_COLORS = {
  "Algebra Lineal": "#8b5cf6",
  "Calculo I": "#3b82f6",
  "Calculo II": "#06b6d4",
  "Quimica General": "#22c55e",
  "Fisica I": "#f59e0b",
  "Fisica II": "#ef4444",
  "Programacion": "#ec4899",
  "Circuitos Electricos": "#14b8a6",
  "Senales y Sistemas": "#a855f7",
  "Estructuras de Fluidos": "#eab308",
};
function kgMateriaColor(m) { return MATERIA_COLORS[m] || "#8b5cf6"; }

const KG_TYPES = {
  materia: { color: "#8b5cf6", icon: "M", label: "Materia" },
  concepto: { color: "#3b82f6", icon: "C", label: "Concepto" },
  apunte: { color: "#22c55e", icon: "A", label: "Apunte" },
  ejercicio: { color: "#f59e0b", icon: "E", label: "Ejercicio" },
  examen: { color: "#ef4444", icon: "X", label: "Examen" },
  recurso: { color: "#06b6d4", icon: "R", label: "Recurso" },
};

// Draw custom shape icon for each type (more professional than emoji)
function kgDrawTypeIcon(ctx, x, y, r, type, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha || 1;
  ctx.translate(x, y);
  const s = r * 0.45;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round"; ctx.lineJoin = "round";
  switch(type) {
    case "materia": // Book shape
      ctx.beginPath();
      ctx.moveTo(-s*0.6, -s*0.7);
      ctx.lineTo(-s*0.6, s*0.7);
      ctx.lineTo(s*0.6, s*0.7);
      ctx.lineTo(s*0.6, -s*0.7);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -s*0.7);
      ctx.lineTo(0, s*0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s*0.6, -s*0.3);
      ctx.lineTo(0, -s*0.1);
      ctx.lineTo(s*0.6, -s*0.3);
      ctx.stroke();
      break;
    case "concepto": // Lightbulb
      ctx.beginPath();
      ctx.arc(0, -s*0.15, s*0.45, Math.PI*1.2, Math.PI*1.8);
      ctx.lineTo(s*0.25, s*0.3);
      ctx.lineTo(-s*0.25, s*0.3);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s*0.15, s*0.45);
      ctx.lineTo(s*0.15, s*0.45);
      ctx.stroke();
      // rays
      for (let i = 0; i < 5; i++) {
        const a = (i - 2) * 0.35;
        ctx.beginPath();
        ctx.moveTo(Math.sin(a)*s*0.55, -s*0.15 + Math.cos(a)*-s*0.55);
        ctx.lineTo(Math.sin(a)*s*0.7, -s*0.15 + Math.cos(a)*-s*0.7);
        ctx.stroke();
      }
      break;
    case "apunte": // Pen/notepad
      ctx.beginPath();
      ctx.moveTo(-s*0.4, -s*0.6);
      ctx.lineTo(s*0.3, -s*0.6);
      ctx.lineTo(s*0.5, -s*0.4);
      ctx.lineTo(s*0.5, s*0.6);
      ctx.lineTo(-s*0.4, s*0.6);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s*0.15, -s*0.2);
      ctx.lineTo(s*0.2, -s*0.2);
      ctx.moveTo(-s*0.15, s*0.1);
      ctx.lineTo(s*0.2, s*0.1);
      ctx.moveTo(-s*0.15, s*0.4);
      ctx.lineTo(s*0.1, s*0.4);
      ctx.stroke();
      break;
    case "ejercicio": // Checkmark in circle
      ctx.beginPath();
      ctx.arc(0, 0, s*0.6, 0, Math.PI*2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s*0.25, s*0.05);
      ctx.lineTo(-s*0.05, s*0.25);
      ctx.lineTo(s*0.3, -s*0.2);
      ctx.stroke();
      break;
    case "examen": // Star
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = (i * 72 - 90) * Math.PI / 180;
        const a2 = ((i * 72 + 36) - 90) * Math.PI / 180;
        const r1 = s * 0.6, r2 = s * 0.25;
        if (i === 0) ctx.moveTo(Math.cos(a1)*r1, Math.sin(a1)*r1);
        else ctx.lineTo(Math.cos(a1)*r1, Math.sin(a1)*r1);
        ctx.lineTo(Math.cos(a2)*r2, Math.sin(a2)*r2);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    case "recurso": // Chain link
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-s*0.5, -s*0.25, s*0.55, s*0.5, s*0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(-s*0.05, -s*0.25, s*0.55, s*0.5, s*0.15);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

function kgInit() {
  const KG_VERSION = 4;
  const stored = parseInt(localStorage.getItem("kg_version") || "0");
  if (stored < KG_VERSION) {
    localStorage.removeItem("kg_nodes");
    localStorage.removeItem("kg_edges");
    localStorage.setItem("kg_version", KG_VERSION);
  }
  try { KG.nodes = JSON.parse(localStorage.getItem("kg_nodes") || "[]"); } catch { KG.nodes = []; }
  try { KG.edges = JSON.parse(localStorage.getItem("kg_edges") || "[]"); } catch { KG.edges = []; }
  if (KG.nodes.length === 0) kgCreateMock();
}

function kgSave() {
  localStorage.setItem("kg_nodes", JSON.stringify(KG.nodes));
  localStorage.setItem("kg_edges", JSON.stringify(KG.edges));
}

function kgCreateMock() {
  const n = [
    // ═══ MATERIAS ═══
    { id:"m-alg", type:"materia", title:"Algebra Lineal", materia:"Algebra Lineal", content:"Rama de las matematicas que estudia vectores, matrices y transformaciones lineales.\n\n**Conceptos clave:**\n- Vectores y espacios vectoriales\n- Matrices y operaciones\n- Determinantes\n- Autovalores y autovectores\n- Transformaciones lineales\n\n**Aplicaciones en ingenieria:**\n- Graficos por computadora\n- Machine learning\n- Mecanica cuantica\n- Procesamiento de senales" },
    { id:"m-calc1", type:"materia", title:"Calculo I", materia:"Calculo I", content:"Analisis de limites, derivadas e integrales basicas.\n\n**Temas principales:**\n- Limites y continuidad\n- Derivadas y sus aplicaciones\n- Reglas de derivacion\n- Integrales definidas e indefinidas\n\n**Formulas fundamentales:**\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n$$\\int_a^b f(x)dx = F(b) - F(a)$$" },
    { id:"m-calc2", type:"materia", title:"Calculo II", materia:"Calculo II", content:"Integrales multiples, series y ecuaciones diferenciales.\n\n**Temas:**\n- Integrales dobles y triples\n- Coordenadas polares\n- Series infinitas\n- Ecuaciones diferenciales de 1er y 2do orden\n\n**Formulas clave:**\n$$\\iint_D f(x,y) \\, dA$$\n$$\\sum_{n=0}^{\\infty} a_n x^n$$" },
    { id:"m-qa", type:"materia", title:"Quimica General", materia:"Quimica General", content:"Fundamentos de quimica para ingenieros.\n\n**Temas:**\n- Estructura atomica\n- Enlaces quimicos\n- Termodinamica quimica\n- Cinetica y equilibrio\n- Electroquimica" },
    { id:"m-fis1", type:"materia", title:"Fisica I", materia:"Fisica I", content:"Mecanica clasica: cinematica, dinamica y energetica.\n\n**Temas:**\n- Cinematica (movimiento)\n- Dinamica (fuerzas)\n- Trabajo y energia\n- Momento angular\n- Oscilaciones" },
    { id:"m-fis2", type:"materia", title:"Fisica II", materia:"Fisica II", content:"Electromagnetismo y optica.\n\n**Temas:**\n- Campos electricos y magneticos\n- Ley de Gauss y Ampere\n- Induccion electromagnetica\n- Ondas electromagneticas\n- Optica geometrica" },
    { id:"m-prog", type:"materia", title:"Programacion", materia:"Programacion", content:"Fundamentos de programacion y pensamiento computacional.\n\n**Paradigmas:**\n- Imperativo\n- Orientado a objetos\n- Funcional\n\n**Estructuras:**\n- Variables, bucles, condicionales\n- Funciones y modulos\n- Estructuras de datos basicas" },
    { id:"m-elec", type:"materia", title:"Circuitos Electricos", materia:"Circuitos Electricos", content:"Analisis de circuitos resistivos, RC, RL y RLC.\n\n**Leyes fundamentales:**\n- Ley de Ohm\n- Kirchhoff (KCL y KVL)\n- Thevenin y Norton\n- Superposicion" },
    { id:"m-senales", type:"materia", title:"Senales y Sistemas", materia:"Senales y Sistemas", content:"Analisis de senales en tiempo continuo y discreto.\n\n**Temas:**\n- Transformada de Fourier\n- Transformada de Laplace\n- Respuesta impulsional\n- Funcion de transferencia\n- Filtrado" },
    { id:"m-ef", type:"materia", title:"Estructuras de Fluidos", materia:"Estructuras de Fluidos", content:"Mecanica de fluidos y resistencia de materiales.\n\n**Temas:**\n- Presion y flujos\n- Ecuacion de Bernoulli\n- Esfuerzos y deformaciones\n- Mohr y falla\n- Torsion y flexion" },

    // ═══ CONCEPTOS ═══
    { id:"c-matrices", type:"concepto", title:"Matrices", materia:"Algebra Lineal", content:"**Definicion:** Tabla rectangular de numeros organizados en filas y columnas.\n\n**Operaciones:**\n- Suma: $A + B = [a_{ij} + b_{ij}]$\n- Multiplicacion: $(AB)_{ij} = \\sum_k a_{ik}b_{kj}$\n- Transpuesta: $(A^T)_{ij} = a_{ji}$\n\n**Propiedades importantes:**\n- $AB \\neq BA$ en general\n- $(AB)^T = B^T A^T$\n- $A \\cdot A^{-1} = I$" },
    { id:"c-determ", type:"concepto", title:"Determinantes", materia:"Algebra Lineal", content:"**Definicion:** Un numero escalar asociado a una matriz cuadrada.\n\n**Para 2x2:**\n$$\\det(A) = ad - bc$$\n\n**Propiedades:**\n- $\\det(AB) = \\det(A)\\det(B)$\n- $\\det(A^T) = \\det(A)$\n- $\\det(A^{-1}) = 1/\\det(A)$\n- Si $\\det(A) = 0$, la matriz no tiene inversa\n\n**Aplicacion:** Resolver sistemas con la regla de Cramer." },
    { id:"c-autoval", type:"concepto", title:"Autovalores", materia:"Algebra Lineal", content:"**Definicion:** Un autovalor $\\lambda$ es un escalar tal que existe un vector $v \\neq 0$ donde:\n\n$$Av = \\lambda v$$\n\n**Calculo:** Resolver $\\det(A - \\lambda I) = 0$\n\n**Aplicaciones:**\n- Analisis de estabilidad\n- PCA (analisis de componentes principales)\n- Valores propios de sistemas dinamicos" },
    { id:"c-espvec", type:"concepto", title:"Espacios Vectoriales", materia:"Algebra Lineal", content:"**Definicion:** Conjunto de vectores cerrado bajo suma y multiplicacion por escalar.\n\n**Ejemplos:**\n- $\\mathbb{R}^n$\n- Espacios de polinomios\n- Espacios de funciones\n\n**Base y dimension:**\n- Base: conjunto linealmente independiente que genera el espacio\n- Dimension: cantidad de vectores en la base" },
    { id:"c-dialg", type:"concepto", title:"Diagonalizacion", materia:"Algebra Lineal", content:"**Proceso:** Encontrar una matriz diagonal $D$ tal que:\n\n$$A = PDP^{-1}$$\n\n**Ventajas:**\n- $A^n = PD^nP^{-1}$\n- Calculo de potencias rapido\n- Analisis de sistemas dinamicos" },
    { id:"c-deriv", type:"concepto", title:"Derivadas", materia:"Calculo I", content:"**Definicion:**\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\n**Reglas:**\n- Potencia: $(x^n)' = nx^{n-1}$\n- Producto: $(fg)' = f'g + fg'$\n- Cociente: $(f/g)' = (f'g - fg')/g^2$\n- Cadena: $[f(g(x))]' = f'(g(x)) \\cdot g'(x)$\n\n**Aplicaciones:**\n- Velocidad y aceleracion\n- Puntos criticos\n- Optimizacion\n- Recta tangente" },
    { id:"c-integ", type:"concepto", title:"Integrales", materia:"Calculo I", content:"**Integral definida:**\n$$\\int_a^b f(x)dx = F(b) - F(a)$$\n\n**Tecnicas:**\n- Sustitucion\n- Partes: $\\int u\\,dv = uv - \\int v\\,du$\n- Fracciones parciales\n\n**Teorema Fundamental del Calculo:**\nLa integral y la derivada son operaciones inversas." },
    { id:"c-series", type:"concepto", title:"Series Infinitas", materia:"Calculo II", content:"**Serie geometrica:**\n$$\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r}, \\quad |r| < 1$$\n\n**Criterios de convergencia:**\n- Criterio del termino general\n- Criterio de la razon\n- Criterio de la raiz\n- Criterio de comparacion\n\n**Serie de Taylor:**\n$$f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n$$" },
    { id:"c-newton", type:"concepto", title:"Leyes de Newton", materia:"Fisica I", content:"**1ra Ley (Inercia):** Un cuerpo en reposo permanece en reposo.\n\n**2da Ley:**\n$$\\vec{F} = m\\vec{a}$$\n\n**3ra Ley (Accion-Reaccion):**\n$$\\vec{F}_{AB} = -\\vec{F}_{BA}$$\n\n**Aplicacion:** Todo problema de dinamica se resuelve con un diagrama de cuerpo libre." },
    { id:"c-energia", type:"concepto", title:"Energia y Trabajo", materia:"Fisica I", content:"**Trabajo:**\n$$W = \\vec{F} \\cdot \\vec{d} = Fd\\cos\\theta$$\n\n**Energia cinetica:**\n$$KE = \\frac{1}{2}mv^2$$\n\n**Energia potencial:**\n$$U = mgh$$\n\n**Conservacion:**\n$$KE_i + PE_i = KE_f + PE_f$$" },
    { id:"c-campo-e", type:"concepto", title:"Campo Electrico", materia:"Fisica II", content:"**Ley de Coulomb:**\n$$\\vec{F} = k\\frac{q_1 q_2}{r^2}\\hat{r}$$\n\n**Campo electrico:**\n$$\\vec{E} = \\frac{\\vec{F}}{q}$$\n\n**Ley de Gauss:**\n$$\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{enc}}{\\epsilon_0}$$" },
    { id:"c-induccion", type:"concepto", title:"Induccion Electromagnetica", materia:"Fisica II", content:"**Ley de Faraday:**\n$$\\mathcal{E} = -\\frac{d\\Phi_B}{dt}$$\n\n**Ley de Lenz:**\nLa fuerza electromotriz inducida se opone al cambio que la produce.\n\n**Autoinduccion:**\n$$\\mathcal{E} = -L\\frac{dI}{dt}$$" },
    { id:"c-oop", type:"concepto", title:"POO", materia:"Programacion", content:"**Pilares:**\n- **Encapsulamiento:** Datos + metodos juntos\n- **Herencia:** Reutilizar codigo de clases padre\n- **Polimorfismo:** Mismo metodo, comportamiento diferente\n- **Abstraccion:** Ocultar complejidad" },
    { id:"c-estruc", type:"concepto", title:"Estructuras de Datos", materia:"Programacion", content:"**Lineales:**\n- Array: acceso O(1)\n- Linked List: insercion O(1)\n- Stack: LIFO\n- Queue: FIFO\n\n**No lineales:**\n- Arbol BST: busqueda O(log n)\n- Heap: min/max O(1)\n- Grafo: representacion de relaciones\n\n**Complejidad:**\n$$O(1) < O(\\log n) < O(n) < O(n^2)$$" },
    { id:"c-ohm", type:"concepto", title:"Ley de Ohm", materia:"Circuitos Electricos", content:"**Relacion fundamental:**\n$$V = IR$$\n\n- **V** = Voltaje (Voltios)\n- **I** = Corriente (Amperios)\n- **R** = Resistencia (Ohms)\n\n**Potencia:** $P = VI = I^2R = V^2/R$" },
    { id:"c-kirch", type:"concepto", title:"Leyes de Kirchhoff", materia:"Circuitos Electricos", content:"**KCL (Corrientes):**\n$$\\sum I_{entran} = \\sum I_{salen}$$\n\n**KVL (Voltajes):**\n$$\\sum V_{malla} = 0$$" },
    { id:"c-fourier", type:"concepto", title:"Transformada de Fourier", materia:"Senales y Sistemas", content:"**Transformada continua:**\n$$X(\\omega) = \\int_{-\\infty}^{\\infty} x(t) e^{-j\\omega t} dt$$\n\n**Transformada inversa:**\n$$x(t) = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} X(\\omega) e^{j\\omega t} d\\omega$$\n\n**Propiedades:**\n- Linealidad\n- Desplazamiento temporal\n- Convolucion" },
    { id:"c-laplace", type:"concepto", title:"Transformada de Laplace", materia:"Senales y Sistemas", content:"**Definicion:**\n$$X(s) = \\int_0^{\\infty} x(t) e^{-st} dt$$\n\n**Usos:**\n- Resolver EDOs\n- Analisis de estabilidad\n- Funcion de transferencia\n- Sistemas LTI" },
    { id:"c-bernoulli", type:"concepto", title:"Ecuacion de Bernoulli", materia:"Estructuras de Fluidos", content:"$$P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho g h_1 = P_2 + \\frac{1}{2}\\rho v_2^2 + \\rho g h_2$$\n\n**Significado:**\nLa energia mecanica por unidad de volumen se conserva a lo largo de una linea de corriente." },
    { id:"c-mohr", type:"concepto", title:"Circulo de Mohr", materia:"Estructuras de Fluidos", content:"**Representacion grafica** del estado de esfuerzo en un punto.\n\n$$\\sigma_{avg} = \\frac{\\sigma_x + \\sigma_y}{2}$$\n$$R = \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}$$\n\n**Esfuerzos principales:**\n$$\\sigma_{1,2} = \\sigma_{avg} \\pm R$$" },

    // ═══ APUNTES ═══
    { id:"a-alg-autoval", type:"apunte", title:"Apuntes: Autovalores", materia:"Algebra Lineal", content:"## Resumen de autovalores\n\nPara encontrar autovalores:\n1. Calcular $\\det(A - \\lambda I) = 0$\n2. Resolver el polinomio caracteristico\n3. Para cada $\\lambda$, resolver $(A - \\lambda I)v = 0$\n\n**Ejemplo:**\n$$A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$$\n$$\\det(A - \\lambda I) = (2-\\lambda)^2 - 1 = 0$$\n$$\\lambda_1 = 3, \\lambda_2 = 1$$" },
    { id:"a-calc-deriv", type:"apunte", title:"Apuntes: Reglas de Derivacion", materia:"Calculo I", content:"## Tabla de derivadas comunes\n\n| Funcion | Derivada |\n|---------|----------|\n| $x^n$ | $nx^{n-1}$ |\n| $e^x$ | $e^x$ |\n| $\\ln x$ | $1/x$ |\n| $\\sin x$ | $\\cos x$ |\n| $\\cos x$ | $-\\sin x$ |\n| $\\tan x$ | $\\sec^2 x$ |\n\n## Regla de la cadena\n$$[f(g(x))]' = f'(g(x)) \\cdot g'(x)$$" },
    { id:"a-fis-newton", type:"apunte", title:"Apuntes: Diagrama de Cuerpo Libre", materia:"Fisica I", content:"## Pasos para DCL\n\n1. **Identificar** el objeto de interes\n2. **Dibujar** el objeto como punto\n3. **Identificar** todas las fuerzas:\n   - Peso ($mg$) hacia abajo\n   - Normal ($N$) perpendicular a superficie\n   - Friccion ($f$) opuesta al movimiento\n   - Tension ($T$) a lo largo de cuerda\n   - Fuerza aplicada ($F$)\n4. **Elegir** sistema de coordenadas\n5. **Aplicar** $\\sum F = ma$" },
    { id:"a-fis2-campo", type:"apunte", title:"Apuntes: Campos y Potencial", materia:"Fisica II", content:"## Resumen de electrostatica\n\n**Campo de una carga puntual:**\n$$\\vec{E} = k\\frac{q}{r^2}\\hat{r}$$\n\n**Potencial electrico:**\n$$V = k\\frac{q}{r}$$\n\n**Relacion:**\n$$\\vec{E} = -\\nabla V$$\n\n**Superconductores:** $E = 0$ dentro del material" },
    { id:"a-prog-alg", type:"apunte", title:"Apuntes: complejidad algoritmica", materia:"Programacion", content:"## Notacion Big-O\n\n| Complejidad | Nombre | Ejemplo |\n|------------|--------|--------|\n| O(1) | Constante | Acceso array |\n| O(log n) | Logaritmica | Busqueda binaria |\n| O(n) | Lineal | For simple |\n| O(n log n) | Linealitica | Merge sort |\n| O(n^2) | Cuadratica | Bubble sort |\n| O(2^n) | Exponencial | Fuerza bruta |\n\n**Regla de oro:** Si podes elegir un algoritmo O(n log n) en vez de O(n^2), elegilo." },

    // ═══ EJERCICIOS ═══
    { id:"e-alg-det", type:"ejercicio", title:"Ej: Determinante 3x3", materia:"Algebra Lineal", content:"## Ejercicio\n\nCalcular el determinante de:\n$$A = \\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 4 \\\\ 5 & 6 & 0 \\end{pmatrix}$$\n\n**Metodo de Sarrus:**\n$$\\det(A) = 1(-24) - 2(-20) + 3(-5) = 1$$" },
    { id:"e-calc-deriv", type:"ejercicio", title:"Ej: Derivada Compuesta", materia:"Calculo I", content:"## Ejercicio\n\nCalcular la derivada de:\n$$f(x) = \\sin(x^2 + 1)$$\n\n**Resolucion:**\n$$f'(x) = \\cos(x^2 + 1) \\cdot 2x = 2x\\cos(x^2 + 1)$$" },
    { id:"e-fis-energia", type:"ejercicio", title:"Ej: Conservacion de Energia", materia:"Fisica I", content:"## Ejercicio\n\nUn bloque de 2 kg baja un plano sin friccion desde $h = 5m$.\n\n$$v = \\sqrt{2gh} = \\sqrt{2 \\cdot 9.8 \\cdot 5} = \\sqrt{98} = 9.9 \\, m/s$$" },
    { id:"e-elec-th", type:"ejercicio", title:"Ej: Thevenin", materia:"Circuitos Electricos", content:"## Ejercicio: Teorema de Thevenin\n\nEncontrar el equivalente de Thevenin visto desde la resistencia $R_L$.\n\n**Pasos:**\n1. Calcular $V_{th} = V_{OC}$ (voltaje circuito abierto)\n2. Calcular $R_{th}$ (apagando fuentes)\n3. Circuito equivalente: $V_{th}$ en serie con $R_{th}$" },
    { id:"e-senales-filtros", type:"ejercicio", title:"Ej: Filtro Pasabajos", materia:"Senales y Sistemas", content:"## Ejercicio: Filtro RC\n\n**Transferencia:**\n$$H(j\\omega) = \\frac{1}{1 + j\\omega RC}$$\n\n**Frecuencia de corte:**\n$$f_c = \\frac{1}{2\\pi RC}$$\n\n**Para $f << f_c$:** la senal pasa sin atenuacion.\n**Para $f >> f_c$:** la senal se atenua a $-20$ dB/decada." },

    // ═══ RECURSOS (videos clickeables, canales, PDFs) ═══
    { id:"r-3blue1brown", type:"recurso", title:"3Blue1Brown: Essence of Linear Algebra", materia:"Algebra Lineal", content:"Serie visual que te hace *ver* el álgebra lineal.\n\n▶️ [Ver serie completa en YouTube](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab)\n\n![Essence of LA](https://www.youtube.com/watch?v=fNk_zzaMoSs)\n\n[Web oficial](https://www.3blue1brown.com/topics/linear-algebra)" },
    { id:"r-3blue-calc", type:"recurso", title:"3Blue1Brown: Essence of Calculus", materia:"Calculo I", content:"Derivadas e integrales explicadas con animaciones.\n\n▶️ [Capítulo 2 - Derivadas](https://www.youtube.com/watch?v=9vKqVkMQHKk)\n\n![Essence of Calc](https://www.youtube.com/watch?v=WUvTyaaNkzM)\n\n[Web](https://www.3blue1brown.com/topics/calculus)" },
    { id:"r-matefacil", type:"recurso", title:"MateFacil - Cálculo y Álgebra", materia:"Calculo I", content:"El canal en español más claro para cálculo.\n\n▶️ [Derivadas - Curso completo](https://www.youtube.com/watch?v=1YkoZx9P4cA)\n\n▶️ [Matrices y determinantes](https://www.youtube.com/watch?v=aAPr0qR8K30)\n\n[Canal MateFacil](https://www.youtube.com/@MateFacil)" },
    { id:"r-julioprofe", type:"recurso", title:"JulioProfe - Física y Matemática", materia:"Fisica I", content:"El profe de Colombia que te salva el parcial.\n\n▶️ [Leyes de Newton explicadas](https://www.youtube.com/watch?v=5c4PpB3Qb3E)\n\n[Canal JulioProfe](https://www.youtube.com/@julioprofe)" },
    { id:"r-traductor", type:"recurso", title:"El Traductor de Ingeniería", materia:"Fisica II", content:"El mejor canal argentino para FIUBA.\n\n▶️ [Campo Eléctrico - Explicación](https://www.youtube.com/watch?v=R1ex1h4-H2E)\n\n▶️ [Circuitos Eléctricos](https://www.youtube.com/watch?v=8lGYv3z6F0c)\n\n[Canal El Traductor](https://www.youtube.com/@ElTraductorDeIngenieria)" },
    { id:"r-khan-calc", type:"recurso", title:"Khan Academy: Cálculo I", materia:"Calculo I", content:"Curso completo con ejercicios interactivos.\n\n▶️ [Ir al curso](https://www.khanacademy.org/math/calculus-1)\n\n![Khan](https://cdn.kastatic.org/images/khan-logo-vertical-transparent.png)" },
    { id:"r-khan-fis", type:"recurso", title:"Khan Academy: Física", materia:"Fisica I", content:"Física mecánica con simulaciones.\n\n▶️ [Ir al curso](https://www.khanacademy.org/science/physics)\n\n![Khan](https://cdn.kastatic.org/images/khan-logo-vertical-transparent.png)" },
    { id:"r-feynman", type:"recurso", title:"The Feynman Lectures Vol. 1", materia:"Fisica I", content:"Las legendarias clases de Feynman.\n\n▶️ [Leer online gratis](https://www.feynmanlectures.caltech.edu/I_01.html)\n\n![Feynman](https://www.feynmanlectures.caltech.edu/img/FLP_book.jpg)" },
    { id:"r-vestigium", type:"recurso", title:"Vestigium - Álgebra FIUBA", materia:"Algebra Lineal", content:"Canal en español con teoría FIUBA exacta.\n\n▶️ [Espacios Vectoriales](https://www.youtube.com/watch?v=0Z0s1g2E7gI)\n\n[Canal Vestigium](https://www.youtube.com/@Vestigium)" },
    { id:"r-pizarra", type:"recurso", title:"La Pizarra Online - FIUBA", materia:"Calculo I", content:"Guías resueltas paso a paso por ayudantes de FIUBA.\n\n▶️ [Guía de Derivadas Resuelta](https://www.youtube.com/@lapizarraonline)\n\n[Playlist Guías](https://www.youtube.com/@lapizarraonline/playlists)" },
    { id:"r-mit-ocw", type:"recurso", title:"MIT OCW - Circuits & Systems", materia:"Circuitos Electricos", content:"Curso abierto del MIT con PDFs y videos.\n\n▶️ [MIT 6.002 Circuits](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/)\n\n![MIT](https://ocw.mit.edu/images/ocw_masthead.png)" },
    { id:"r-circuitos", type:"recurso", title:"All About Circuits - Textbook", materia:"Circuitos Electricos", content:"Libro interactivo gratis.\n\n▶️ [Leer textbook](https://www.allaboutcircuits.com/textbook/direct-current/)\n\n![AAC](https://www.allaboutcircuits.com/images/aac_logo.png)" },
    { id:"r-prog-cs50", type:"recurso", title:"CS50 Harvard - Programación", materia:"Programacion", content:"El mejor curso intro a programación.\n\n▶️ [CS50 Lecture 0 - Scratch](https://www.youtube.com/watch?v=YoXxevp1WRQ)\n\n[CS50.site](https://cs50.harvard.edu/x/2024/)" },
    { id:"r-comunidad", type:"recurso", title:"Comunidad FIUBA - Resúmenes", materia:"Quimica General", content:"Resúmenes colaborativos de todas las materias.\n\n▶️ [Ir a Comunidad FIUBA](https://comunidad-fiuba.github.io/)\n\n[Repositorio GitHub](https://github.com/comunidad-fiuba)" },

    // ═══ EXAMENES CON PDFs e IMÁGENES REALES ═══
    { id:"e-parcial-alg", type:"examen", title:"Parcial Álgebra 2024 - PDF", materia:"Algebra Lineal", content:"## Parcial 1 - Álgebra Lineal (2024) - Cátedra Garcia\n\n![Foto del parcial](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600)\n\n**Ej 1:** Calcular determinante 3x3\n**Ej 2:** Autovalores de $A = \\begin{pmatrix} 3 & 1 \\\\ 0 & 2 \\end{pmatrix}$\n**Ej 3:** ¿Es lineal $T(x,y) = (x+y, xy)$?\n\n📄 [Descargar PDF resuelto - Comunidad FIUBA](https://comunidad-fiuba.github.io/)\n\n![Parcial PDF](https://comunidad-fiuba.github.io/img/parcial.png)" },
    { id:"e-parcial-calc", type:"examen", title:"Parcial Cálculo 2024 - Con resolución", materia:"Calculo I", content:"## Parcial - Cálculo I (2024)\n\n![Guía resuelta](https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600)\n\n**Ej 1:** $\\lim_{x\\to 0} \\frac{\\sin x}{x}$\n**Ej 2:** Derivar $f(x) = e^{x^2}\\ln(x)$\n**Ej 3:** $\\int x e^x dx$\n\n📄 [PDF con resolución paso a paso](https://www.altillo.com/examenes/uba/ingenieria/analisis1/)\n\n[Ver video resolución](https://www.youtube.com/watch?v=9vKqVkMQHKk)" },
    { id:"e-parcial-fis", type:"examen", title:"Parcial Física I 2024 - Foto", materia:"Fisica I", content:"## Parcial - Física I (2024)\n\n![Parcial foto](https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600)\n\n**Ej 1:** Bloque en plano inclinado con fricción\n**Ej 2:** Choque elástico 2D\n**Ej 3:** MAS: período y amplitud\n\n📄 [PDF Parcial + Resuelto](https://comunidad-fiuba.github.io/fisica1/)\n\n[Clase de repaso - El Traductor](https://www.youtube.com/watch?v=5c4PpB3Qb3E)" },
    { id:"e-parcial-quim", type:"examen", title:"Parcial Química - Estequiometría PDF", materia:"Quimica General", content:"## Parcial Química (2023)\n\n![Química](https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600)\n\n**Ej:** Balancear y calcular moles de $H_2SO_4$\n\n📄 [PDF Quimica CBC - UBA](https://www.altillo.com/examenes/uba/cbc/quimica/)" },
    { id:"e-parcial-prog", type:"examen", title:"Parcial Programación - Código", materia:"Programacion", content:"## Parcial Programación - Algoritmos\n\n```python\ndef es_primo(n):\n    if n < 2: return False\n    for i in range(2,int(n**0.5)+1):\n        if n%i==0: return False\n    return True\n```\n\n📄 [Enunciado PDF](https://cs50.harvard.edu/x/psets/)\n\n[Ver solución en video](https://www.youtube.com/watch?v=YoXxevp1WRQ)" },

    // ═══ CONEXIONES CRUZADAS (red neuronal) ═══
  ];

  n.forEach(item => {
    KG.nodes.push({
      id: item.id,
      type: item.type,
      title: item.title,
      materia: item.materia || "",
      content: item.content || "",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    });
  });

  // Edges - neural network connections
  const e = [
    // Materia contains concepts
    { s:"m-alg", t:"c-matrices", label:"contiene" },
    { s:"m-alg", t:"c-determ", label:"contiene" },
    { s:"m-alg", t:"c-autoval", label:"contiene" },
    { s:"m-alg", t:"c-espvec", label:"contiene" },
    { s:"m-alg", t:"c-dialg", label:"contiene" },
    { s:"m-calc1", t:"c-deriv", label:"contiene" },
    { s:"m-calc1", t:"c-integ", label:"contiene" },
    { s:"m-calc2", t:"c-series", label:"contiene" },
    { s:"m-fis1", t:"c-newton", label:"contiene" },
    { s:"m-fis1", t:"c-energia", label:"contiene" },
    { s:"m-fis2", t:"c-campo-e", label:"contiene" },
    { s:"m-fis2", t:"c-induccion", label:"contiene" },
    { s:"m-prog", t:"c-oop", label:"contiene" },
    { s:"m-prog", t:"c-estruc", label:"contiene" },
    { s:"m-elec", t:"c-ohm", label:"contiene" },
    { s:"m-elec", t:"c-kirch", label:"contiene" },
    { s:"m-senales", t:"c-fourier", label:"contiene" },
    { s:"m-senales", t:"c-laplace", label:"contiene" },
    { s:"m-ef", t:"c-bernoulli", label:"contiene" },
    { s:"m-ef", t:"c-mohr", label:"contiene" },
    // Concept relations (neural synapses)
    { s:"c-matrices", t:"c-determ", label:"relacionado" },
    { s:"c-determ", t:"c-autoval", label:"necesario para" },
    { s:"c-autoval", t:"c-dialg", label:"necesario para" },
    { s:"c-espvec", t:"c-autoval", label:"relacionado" },
    { s:"c-deriv", t:"c-integ", label:"inverso de" },
    { s:"c-integ", t:"c-series", label:"relacionado" },
    { s:"c-newton", t:"c-energia", label:"relacionado" },
    { s:"c-oop", t:"c-estruc", label:"relacionado" },
    { s:"c-ohm", t:"c-kirch", label:"relacionado" },
    { s:"c-fourier", t:"c-laplace", label:"relacionado" },
    { s:"c-campo-e", t:"c-induccion", label:"relacionado" },
    { s:"c-bernoulli", t:"c-mohr", label:"relacionado" },
    // Cross-discipline neural connections
    { s:"c-deriv", t:"c-newton", label:"aplicacion de" },
    { s:"c-deriv", t:"c-energia", label:"aplicacion de" },
    { s:"c-matrices", t:"c-estruc", label:"base de" },
    { s:"c-laplace", t:"c-ohm", label:"analisis de" },
    { s:"c-fourier", t:"c-induccion", label:"analisis de" },
    { s:"c-integ", t:"c-energia", label:"calcula" },
    { s:"c-matrices", t:"c-fourier", label:"base de" },
    { s:"c-bernoulli", t:"c-newton", label:"deriva de" },
    // Apuntes -> Concepts
    { s:"a-alg-autoval", t:"c-autoval", label:"describe" },
    { s:"a-calc-deriv", t:"c-deriv", label:"describe" },
    { s:"a-fis-newton", t:"c-newton", label:"describe" },
    { s:"a-fis2-campo", t:"c-campo-e", label:"describe" },
    { s:"a-prog-alg", t:"c-estruc", label:"describe" },
    // Ejercicios -> Concepts
    { s:"e-alg-det", t:"c-determ", label:"ejercicio de" },
    { s:"e-calc-deriv", t:"c-deriv", label:"ejercicio de" },
    { s:"e-fis-energia", t:"c-energia", label:"ejercicio de" },
    { s:"e-elec-th", t:"c-kirch", label:"ejercicio de" },
    { s:"e-senales-filtros", t:"c-fourier", label:"ejercicio de" },
    // Recursos -> Materias (todos clickeables)
    { s:"r-3blue1brown", t:"m-alg", label:"recurso para" },
    { s:"r-3blue-calc", t:"m-calc1", label:"recurso para" },
    { s:"r-matefacil", t:"m-calc1", label:"recurso para" },
    { s:"r-julioprofe", t:"m-fis1", label:"recurso para" },
    { s:"r-traductor", t:"m-fis2", label:"recurso para" },
    { s:"r-khan-calc", t:"m-calc1", label:"recurso para" },
    { s:"r-khan-fis", t:"m-fis1", label:"recurso para" },
    { s:"r-feynman", t:"m-fis1", label:"recurso para" },
    { s:"r-vestigium", t:"m-alg", label:"recurso para" },
    { s:"r-pizarra", t:"m-calc1", label:"recurso para" },
    { s:"r-mit-ocw", t:"m-elec", label:"recurso para" },
    { s:"r-circuitos", t:"m-elec", label:"recurso para" },
    { s:"r-prog-cs50", t:"m-prog", label:"recurso para" },
    { s:"r-comunidad", t:"m-qa", label:"recurso para" },
    // Examenes -> Materias (con PDFs)
    { s:"e-parcial-alg", t:"m-alg", label:"examen de" },
    { s:"e-parcial-calc", t:"m-calc1", label:"examen de" },
    { s:"e-parcial-fis", t:"m-fis1", label:"examen de" },
    { s:"e-parcial-quim", t:"m-qa", label:"examen de" },
    { s:"e-parcial-prog", t:"m-prog", label:"examen de" },
    // Materias relacionadas (prerequisite chain)
    { s:"m-alg", t:"m-calc1", label:"base para" },
    { s:"m-calc1", t:"m-calc2", label:"base para" },
    { s:"m-fis1", t:"m-calc1", label:"requiere" },
    { s:"m-fis1", t:"m-fis2", label:"base para" },
    { s:"m-calc2", t:"m-senales", label:"base para" },
    { s:"m-fis2", t:"m-elec", label:"base para" },
  ];

  e.forEach(edge => {
    KG.edges.push({ id: "e_"+Date.now()+"_"+Math.random().toString(36).slice(2,6), source: edge.s, target: edge.t, label: edge.label || "" });
  });

  kgSave();
}

function kgNode(id) { return KG.nodes.find(n => n.id === id); }

// Color helpers
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}
function rgbToHex(r,g,b) { return "#"+[r,g,b].map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,"0")).join(""); }
function lightenColor(hex, amt) { const [r,g,b]=hexToRgb(hex); return rgbToHex(r+amt,g+amt,b+amt); }
function darkenColor(hex, amt) { const [r,g,b]=hexToRgb(hex); return rgbToHex(r-amt,g-amt,b-amt); }
function blendColor(c1, c2, t) {
  const [r1,g1,b1]=hexToRgb(c1), [r2,g2,b2]=hexToRgb(c2);
  return rgbToHex(r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t);
}

function kgFiltered() {
  let nodes = [...KG.nodes];
  if (KG.filterType) nodes = nodes.filter(n => n.type === KG.filterType);
  if (KG.filterMateria) nodes = nodes.filter(n => n.materia === KG.filterMateria);
  if (KG.search) {
    const q = KG.search.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);
    nodes = nodes.filter(n => {
      const hay = `${n.title} ${n.content} ${n.materia}`.toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    });
  }
  return nodes;
}

function kgConnectedNodes(nodeId) {
  const ids = new Set();
  KG.edges.forEach(e => { if (e.source === nodeId) ids.add(e.target); if (e.target === nodeId) ids.add(e.source); });
  return [...ids].map(id => kgNode(id)).filter(Boolean);
}

function kgInjectStyles() {
  if (document.getElementById("kg-css")) return;
  // roundRect polyfill
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r) {
      if (typeof r === "number") r = [r,r,r,r];
      this.moveTo(x+r[0],y);
      this.lineTo(x+w-r[1],y);
      this.arcTo(x+w,y,x+w,y+r[1],r[1]);
      this.lineTo(x+w,y+h-r[2]);
      this.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]);
      this.lineTo(x+r[3],y+h);
      this.arcTo(x,y+h,x,y+h-r[3],r[3]);
      this.lineTo(x,y+r[0]);
      this.arcTo(x,y,x+r[0],y,r[0]);
      this.closePath();
    };
  }
  const s = document.createElement("style");
  s.id = "kg-css";
  s.textContent = `
    .kg-view { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:var(--text-primary); line-height:1.7; font-size:0.88rem; }
    .kg-view h1 { font-size:1.4rem; font-weight:700; margin:0 0 0.6rem; border-bottom:2px solid var(--accent); padding-bottom:0.3rem; }
    .kg-view h2 { font-size:1.1rem; font-weight:700; margin:1rem 0 0.4rem; border-bottom:1px solid var(--border-color); padding-bottom:0.2rem; }
    .kg-view h3 { font-size:0.95rem; font-weight:600; margin:0.8rem 0 0.3rem; }
    .kg-view p { margin:0 0 0.5rem; }
    .kg-view strong { font-weight:600; }
    .kg-view code { background:var(--bg-secondary); padding:0.12rem 0.35rem; border-radius:4px; font-size:0.82em; font-family:'JetBrains Mono',monospace; color:var(--accent); }
    .kg-view pre { background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px; padding:0.7rem; overflow-x:auto; margin:0.5rem 0; }
    .kg-view pre code { background:none; padding:0; color:var(--text-primary); }
    .kg-view hr { border:none; border-top:1px solid var(--border-color); margin:1rem 0; }
    .kg-view blockquote { border-left:3px solid var(--accent); padding:0.3rem 0.7rem; margin:0.5rem 0; background:var(--bg-secondary); border-radius:0 6px 6px 0; color:var(--text-muted); font-style:italic; }
    .kg-view ul { padding-left:1.4rem; margin:0.3rem 0; }
    .kg-view li { margin:0.15rem 0; }
    .kg-view li::marker { color:var(--accent); }
    .kg-view table { border-collapse:collapse; margin:0.5rem 0; font-size:0.8rem; width:100%; }
    .kg-view th, .kg-view td { border:1px solid var(--border-color); padding:0.25rem 0.5rem; text-align:left; }
    .kg-view th { background:var(--bg-secondary); font-weight:600; }
    .kg-view .katex { font-size:1.05em; }
    .kg-view .katex-display { margin:0.7rem 0; padding:0.5rem; background:var(--bg-secondary); border-radius:8px; border:1px solid var(--border-color); overflow-x:auto; }
    .kg-link { color:#8b5cf6; cursor:pointer; border-bottom:1px dashed #8b5cf660; text-decoration:none; font-weight:500; }
    .kg-link:hover { color:#a78bfa; background:#8b5cf610; border-radius:2px; }
    .kg-bar { display:flex; gap:0.35rem; align-items:center; flex-wrap:wrap; margin-bottom:0.4rem; }
    .kg-btn { background:var(--bg-secondary); color:var(--text-muted); border:1px solid var(--border-color); border-radius:6px; padding:0.25rem 0.5rem; cursor:pointer; font-size:0.7rem; transition:all 0.15s; }
    .kg-btn:hover { border-color:var(--accent); color:var(--text-primary); }
    .kg-btn.active { background:rgba(139,92,246,0.1); color:#8b5cf6; border-color:rgba(139,92,246,0.25); }
    .kg-type-badge { display:inline-flex; align-items:center; gap:0.2rem; font-size:0.6rem; padding:0.1rem 0.4rem; border-radius:10px; font-weight:600; }
    .kg-side { background:var(--bg-card); border-left:1px solid var(--border-color); overflow:hidden; transition:width 0.2s; display:flex; flex-direction:column; height:100%; }
    .kg-side-header { padding:0.8rem; border-bottom:1px solid var(--border-color); flex-shrink:0; }
    .kg-side-body { padding:0.8rem; overflow-y:auto; flex:1; min-height:0; }
    .kg-conn-item { padding:0.4rem 0.6rem; border:1px solid var(--border-color); border-radius:8px; margin-bottom:0.3rem; cursor:pointer; transition:all 0.15s; font-size:0.78rem; }
    .kg-conn-item:hover { border-color:#8b5cf6; background:rgba(139,92,246,0.05); }
    .kg-fullscreen {
      position: fixed !important; top: 0 !important; left: 0 !important;
      width: 100vw !important; height: 100vh !important;
      max-width: none !important; margin: 0 !important; padding: 0 !important;
      z-index: 10000 !important; border-radius: 0 !important;
      background: #0a0a14 !important;
    }
    .kg-fullscreen .kg-toolbar { position: fixed !important; top: 0.6rem !important; left: 50% !important; transform: translateX(-50%) !important; z-index: 10001 !important; }
    .kg-fullscreen .kg-side { position: fixed !important; top: 0 !important; right: 0 !important; height: 100vh !important; z-index: 10001 !important; }
    .kg-fullscreen #tech-tree-content { display: flex; height: 100vh !important; }
    .kg-fullscreen #tech-tree-content > div { height: 100vh !important; }
    .kg-fullscreen #kg-canvas-wrap { flex: 1 !important; min-height: 0 !important; }
    .kg-fullscreen #kg-canvas { width: 100% !important; height: 100% !important; display: block !important; }
  `;
  document.head.appendChild(s);
}

function kgKatex(html) {
  if (typeof katex === "undefined") return html;
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => { try { return katex.renderToString(t.trim(), {displayMode:true,throwOnError:false}); } catch { return "[math]"; } });
  html = html.replace(/\$([^\$\n]+?)\$/g, (_, t) => { try { return katex.renderToString(t.trim(), {displayMode:false,throwOnError:false}); } catch { return "[math]"; } });
  return html;
}

function kgMd(text) {
  if (!text) return "<p style='color:var(--text-muted);font-style:italic'>Sin contenido...</p>";
  let h = text
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*\*(.+?)\*\*\*/g,"<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,"<em>$1</em>")
    .replace(/`([^`]+)`/g,"<code>$1</code>")
    .replace(/\[\[([^\]]+)\]\]/g,"<a class='kg-link' onclick=\"kgFocusByTitle('$1')\">$1</a>")
    .replace(/^---$/gm,"<hr>")
    .replace(/^#### (.+)$/gm,"<h4>$1</h4>")
    .replace(/^### (.+)$/gm,"<h3>$1</h3>")
    .replace(/^## (.+)$/gm,"<h2>$1</h2>")
    .replace(/^# (.+)$/gm,"<h1>$1</h1>")
    .replace(/^- (.+)$/gm,"<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm,"<li>$2</li>")
    .replace(/^> (.+)$/gm,"<blockquote>$1</blockquote>")
    .replace(/\n\n/g,"</p><p>")
    .replace(/\n/g,"<br>");
  h = h.replace(/(<li[^>]*>.*?<\/li>)(?:<br>)?/g,"$1");
  h = h.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g,"<ul>$1</ul>");
  // YouTube embeds: ![alt](youtube.com/watch?v=XXX) or ![alt](youtu.be/XXX)
  h = h.replace(/!\[([^\]]*)\]\(https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)[^)]*\)/g,
    '<div style="margin:0.5rem 0;border-radius:8px;overflow:hidden;aspect-ratio:16/9"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/$2" frameborder="0" allowfullscreen style="border-radius:8px"></iframe></div>');
  h = h.replace(/!\[([^\]]*)\]\(https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)[^)]*\)/g,
    '<div style="margin:0.5rem 0;border-radius:8px;overflow:hidden;aspect-ratio:16/9"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/$2" frameborder="0" allowfullscreen style="border-radius:8px"></iframe></div>');
  // PDF embeds: ![title](file.pdf) with viewer + download button
  h = h.replace(/!\[([^\]]*)\]\(([^)]*\.pdf[^)]*)\)/g,
    '<div style="margin:0.5rem 0;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;overflow:hidden"><div style="display:flex;align-items:center;gap:0.4rem;padding:0.5rem 0.6rem;background:linear-gradient(135deg,rgba(239,68,68,0.08),rgba(220,38,38,0.05));border-bottom:1px solid var(--border-color)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg><span style="font-size:0.72rem;font-weight:600;color:var(--text-primary)">$1</span><a href="$2" target="_blank" download style="margin-left:auto;padding:0.2rem 0.5rem;background:#ef444420;color:#ef4444;border:1px solid #ef444440;border-radius:4px;font-size:0.62rem;text-decoration:none;font-weight:600">Abrir PDF</a></div><iframe src="$2" style="width:100%;height:380px;border:none" loading="lazy"></iframe></div>');
  // Regular images (click to zoom)
  h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
    '<div style="margin:0.5rem 0"><img src="$2" alt="$1" style="max-width:100%;border-radius:8px;border:1px solid var(--border-color);cursor:zoom-in" onclick="window.open(this.src,\'_blank\')" onerror="this.parentElement.innerHTML=\'<div style=padding:0.5rem;background:var(--bg-secondary);border:1px dashed var(--border-color);border-radius:8px;text-align:center;font-size:0.65rem;color:var(--text-muted)\">Imagen no disponible</div>\'"><div style="font-size:0.6rem;color:var(--text-muted);text-align:center;margin-top:0.2rem">$1 — click para ampliar</div></div>');
  // Clickable links: [text](https://url) → open in new tab with external icon
  h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" style="color:#8b5cf6;text-decoration:underline;text-underline-offset:3px;font-weight:600;cursor:pointer" onclick="event.stopPropagation()">$1 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;display:inline-block"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg></a>');
  h = "<p>" + h + "</p>";
  return kgKatex(h);
}

function kgRenderList(filtered) {
  const grouped={}; filtered.forEach(function(n){ var m=n.materia||'Sin materia'; if(!grouped[m]) grouped[m]=[]; grouped[m].push(n); });
  return Object.entries(grouped).sort(function(a,b){return a[0].localeCompare(b[0]);}).map(function(entry){
    var mat=entry[0], nodes=entry[1], col=kgMateriaColor(mat);
    var cards = nodes.map(function(n){
      var ti=KG_TYPES[n.type]||KG_TYPES.concepto;
      return '<div onclick="KG.active=\''+n.id+'\';kgRender()" style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.6rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;cursor:pointer" onmouseover="this.style.borderColor=\''+ti.color+'40\'" onmouseout="this.style.borderColor=\'var(--border-color)\'"><span style="width:28px;height:28px;border-radius:50%;background:'+ti.color+'15;border:1px solid '+ti.color+'30;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;color:'+ti.color+';flex-shrink:0">'+ti.icon+'</span><div style="flex:1;min-width:0"><div style="font-size:0.72rem;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+n.title+'</div><div style="font-size:0.6rem;color:var(--text-muted)">'+ti.label+'</div></div><span style="font-size:0.6rem;color:var(--text-muted)">→</span></div>';
    }).join('');
    return '<div style="margin-bottom:0.8rem"><div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.35rem;position:sticky;top:0;background:var(--bg-primary);padding:0.2rem 0;z-index:1"><span style="width:10px;height:10px;border-radius:50%;background:'+col+';display:inline-block"></span><span style="font-size:0.75rem;font-weight:700;color:var(--text-primary)">'+mat+'</span><span style="font-size:0.6rem;color:var(--text-muted)">'+nodes.length+'</span></div><div style="display:grid;gap:0.3rem">'+cards+'</div></div>';
  }).join('');
}

// ─── RENDER ───
function kgRender() {
  const el = document.getElementById("tech-tree-content");
  if (!el) return;
  kgInit(); kgInjectStyles();
  if (KG.anim) { cancelAnimationFrame(KG.anim); KG.anim = null; }

  if (KG.view === "side" && KG.active) { kgRenderSide(el); return; }

  const filtered = kgFiltered();
  const allMaterias = [...new Set(KG.nodes.map(n => n.materia).filter(Boolean))];
  const allTypes = Object.keys(KG_TYPES);

  el.innerHTML = `
    <div style="display:flex;height:100%;gap:0">
      <!-- Main graph area -->
      <div style="flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden">
        <div class="kg-bar" style="justify-content:space-between;padding:0.45rem 0.8rem;border-bottom:1px solid rgba(139,92,246,0.15);flex-shrink:0;background:rgba(10,10,22,0.85);backdrop-filter:blur(12px)">
          <h2 style="font-family:var(--font-heading);font-size:1rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><circle cx="12" cy="12" r="2.5"/><path d="M7.5 11l7-3.5M7.5 13l7 3.5"/></svg>
            Knowledge Graph
            <span style="font-size:0.55rem;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.1rem 0.3rem;color:var(--text-muted);font-weight:400">${filtered.length}</span>
          </h2>
          <div style="display:flex;gap:0.3rem;align-items:center">
            <div style="display:flex;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:2px">
              <button onclick="KG.listMode=false;kgRender()" style="padding:0.25rem 0.6rem;border-radius:6px;border:none;font-size:0.7rem;cursor:pointer;font-weight:600;${!KG.listMode?'background:var(--bg-card);color:var(--text-primary);box-shadow:0 1px 3px rgba(0,0,0,0.1)':'background:transparent;color:var(--text-muted)'}">Grafo</button>
              <button onclick="KG.listMode=true;kgRender()" style="padding:0.25rem 0.6rem;border-radius:6px;border:none;font-size:0.7rem;cursor:pointer;font-weight:600;${KG.listMode?'background:var(--bg-card);color:var(--text-primary);box-shadow:0 1px 3px rgba(0,0,0,0.1)':'background:transparent;color:var(--text-muted)'}">Lista</button>
            </div>
            ${KG.focus ? `<button class="kg-btn" onclick="kgClearFocus()" title="Salir del modo enfoque" style="background:rgba(139,92,246,0.15);color:#8b5cf6;border-color:rgba(139,92,246,0.3)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>` : ""}
            <button class="kg-btn" onclick="kgRandomExplore()" title="Explorar algo random" style="font-size:0.75rem">🧠</button>
            <button class="kg-btn" onclick="kgResetView()" title="Centrar vista"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg></button>
            <button class="kg-btn" onclick="kgFullscreen()" title="Pantalla completa"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg></button>
          </div>
        </div>

        <!-- Search + chips — galaxy immersive -->
        <div style="padding:0.45rem 0.8rem;border-bottom:1px solid rgba(139,92,246,0.15);display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap;flex-shrink:0;background:rgba(15,15,25,0.75);backdrop-filter:blur(12px)">
          <input id="kg-search" type="text" value="${KG.search}" placeholder="Buscar concepto, apunte, video..."
            style="flex:1;min-width:140px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:0.4rem 0.7rem;font-size:0.72rem;color:#e2e8f0;outline:none"
            oninput="KG.search=this.value;kgRender()">
          <select id="kg-materia-filter" onchange="KG.filterMateria=this.value;kgRender()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:0.35rem 0.45rem;font-size:0.68rem;color:#e2e8f0;cursor:pointer">
            <option value="" style="background:#0f0f1a">Todas las materias</option>
            ${allMaterias.map(m => `<option value="${m}" ${KG.filterMateria===m?"selected":""} style="background:#0f0f1a">${m}</option>`).join("")}
          </select>
        </div>

        <!-- Chips de tipo — galaxy -->
        <div style="padding:0.35rem 0.8rem;border-bottom:1px solid rgba(139,92,246,0.12);display:flex;gap:0.3rem;flex-wrap:wrap;align-items:center;background:rgba(15,15,25,0.6);backdrop-filter:blur(10px);flex-shrink:0">
          <span style="font-size:0.62rem;color:#94a3b8;margin-right:0.2rem">Filtrar:</span>
          <button onclick="KG.filterType='';kgRender()" style="padding:0.22rem 0.6rem;border-radius:20px;border:1px solid ${!KG.filterType?'#8b5cf6':'rgba(255,255,255,0.1)'};background:${!KG.filterType?'#8b5cf6':'rgba(255,255,255,0.05)'};color:${!KG.filterType?'white':'#94a3b8'};font-size:0.65rem;cursor:pointer;font-weight:600">Todos</button>
          ${allTypes.map(t => {
            const count = KG.nodes.filter(n => n.type === t).length;
            const active = KG.filterType===t;
            return `<button onclick="KG.filterType='${t}';kgRender()" style="padding:0.22rem 0.6rem;border-radius:20px;border:1px solid ${active?KG_TYPES[t].color:'rgba(255,255,255,0.1)'};background:${active?KG_TYPES[t].color+'25':'rgba(255,255,255,0.05)'};color:${active?KG_TYPES[t].color:'#94a3b8'};font-size:0.65rem;cursor:pointer;font-weight:600;display:flex;align-items:center;gap:0.25rem"><span style="width:8px;height:8px;border-radius:50%;background:${KG_TYPES[t].color};display:inline-block"></span>${KG_TYPES[t].label} ${count}</button>`;
          }).join("")}
        </div>

        <!-- Leyenda materias — galaxy -->
        <div style="padding:0.35rem 0.8rem;border-bottom:1px solid rgba(139,92,246,0.12);display:flex;gap:0.35rem;flex-wrap:wrap;align-items:center;background:rgba(10,10,20,0.6);backdrop-filter:blur(10px);flex-shrink:0">
          <span style="font-size:0.62rem;color:#64748b;margin-right:0.2rem">Materias:</span>
          ${allMaterias.map(m => {
            const active = KG.filterMateria===m;
            const col = kgMateriaColor(m);
            return `<button onclick="KG.filterMateria=KG.filterMateria==='${m.replace(/'/g,"\\'")}'?'':'${m.replace(/'/g,"\\'")}';kgRender()" title="${m}" style="display:flex;align-items:center;gap:0.25rem;padding:0.18rem 0.5rem;border-radius:20px;border:1px solid ${active?col:'rgba(255,255,255,0.08)'};background:${active?col+'20':'rgba(255,255,255,0.04)'};color:${active?col:'#64748b'};font-size:0.62rem;cursor:pointer"><span style="width:8px;height:8px;border-radius:50%;background:${col};display:inline-block;flex-shrink:0"></span>${m}</button>`;
          }).join("")}
          ${KG.filterMateria || KG.filterType || KG.search ? `<button onclick="KG.filterMateria='';KG.filterType='';KG.search='';kgRender()" style="margin-left:auto;padding:0.18rem 0.55rem;border-radius:20px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.06);color:#94a3b8;font-size:0.6rem;cursor:pointer">Limpiar ✕</button>` : ''}
        </div>

        ${KG.showOnboarding ? `
        <div id="kg-onboarding" style="margin:0.5rem 0.8rem;padding:0.6rem 0.8rem;background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(59,130,246,0.06));border:1px solid rgba(139,92,246,0.2);border-radius:10px;display:flex;align-items:center;gap:0.6rem;flex-shrink:0">
          <div style="font-size:1.1rem">💡</div>
          <div style="flex:1;font-size:0.68rem;color:var(--text-secondary);line-height:1.4"><strong>Tip:</strong> Click en un nodo para ver detalle · Arrastrá para mover · Scroll para zoom · Usá los chips para filtrar · <span style="color:#8b5cf6;font-weight:600">⌘K para captura rápida</span></div>
          <button onclick="localStorage.setItem('kg_onboarding_done','1');KG.showOnboarding=false;kgRender()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.2rem 0.5rem;font-size:0.65rem;cursor:pointer;color:var(--text-muted)">Entendido</button>
        </div>` : ''}

        ${KG.listMode ? `
        <!-- LISTA VIEW — galaxy -->
        <div style="flex:1;overflow-y:auto;padding:0.6rem 0.8rem;background:rgba(8,8,18,0.7);backdrop-filter:blur(8px)">
          ${kgRenderList(filtered)}
          ${filtered.length===0?'<div style="text-align:center;padding:2rem;color:var(--text-muted);font-size:0.8rem">Sin resultados para esos filtros</div>':''}
        </div>
        ` : `
        <!-- Canvas container: fills remaining space -->
        <div id="kg-canvas-wrap" style="flex:1;position:relative;overflow:hidden;min-height:0">
          <canvas id="kg-canvas" style="width:100%;height:100%;display:block;cursor:grab"></canvas>
          <div id="kg-tooltip" style="display:none;position:fixed;background:rgba(15,15,25,0.95);backdrop-filter:blur(12px);border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:0.7rem 0.9rem;font-size:0.72rem;color:#e2e8f0;pointer-events:none;z-index:100;box-shadow:0 12px 40px rgba(0,0,0,0.4),0 0 20px rgba(139,92,246,0.1);max-width:300px"></div>
          <div style="position:absolute;bottom:8px;left:10px;font-size:0.6rem;color:var(--text-muted);opacity:0.5">Hover preview · Click panel · Drag mover · Scroll zoom · ⌘K captura</div>
        </div>
        `}
      </div>

      <!-- Side panel -->
      <div id="kg-side" class="kg-side" style="width:${KG.active?'380px':'0px'};${KG.active?'border-left:1px solid var(--border-color)':'border:none'};flex-shrink:0;height:100%;overflow:hidden">
        ${KG.active ? kgRenderSidePanel() : ""}
      </div>
    </div>`;

  if (!KG.listMode) setTimeout(kgSetupCanvas, 30);
}

function kgRenderSidePanel() {
  const n = kgNode(KG.active);
  if (!n) return "";
  const conns = kgConnectedNodes(n.id);
  const typeInfo = KG_TYPES[n.type] || KG_TYPES.concepto;
  const incoming = KG.edges.filter(e => e.target === n.id);
  const outgoing = KG.edges.filter(e => e.source === n.id);
  const allTypes = Object.keys(KG_TYPES);
  const allMaterias = [...new Set(KG.nodes.map(x => x.materia).filter(Boolean))];

  return `
    <div class="kg-side-header">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <div style="width:36px;height:36px;border-radius:50%;background:${typeInfo.color}25;display:flex;align-items:center;justify-content:center;border:2px solid ${typeInfo.color}50">
            <span style="font-size:1rem;font-weight:700;color:${typeInfo.color}">${typeInfo.icon}</span>
          </div>
          <div>
            <h3 style="font-size:0.95rem;font-weight:700;margin:0">${n.title}</h3>
            <span class="kg-type-badge" style="background:${typeInfo.color}18;color:${typeInfo.color};border:1px solid ${typeInfo.color}40;margin-top:0.15rem">${typeInfo.label}</span>
          </div>
        </div>
        <button class="kg-btn" onclick="KG.active=null;KG.view='graph';kgRender()" style="font-size:0.8rem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
      </div>
      ${n.materia ? `<div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:0.2rem"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> ${n.materia}</div>` : ""}

      <!-- Enhanced Stats Card -->
      ${(() => {
        const mat = n.materia;
        const conceptos = mat ? KG.nodes.filter(x => x.type==="concepto" && x.materia===mat).length : 0;
        const apuntes = mat ? KG.nodes.filter(x => x.type==="apunte" && x.materia===mat).length : 0;
        const ejercicios = mat ? KG.nodes.filter(x => x.type==="ejercicio" && x.materia===mat).length : 0;
        const examenes = mat ? KG.nodes.filter(x => x.type==="examen" && x.materia===mat).length : 0;
        const conceptRel = conns.filter(x => x.type==="concepto").map(x => x.title);
        if (conceptos + apuntes + ejercicios + examenes === 0) return "";
        return `<div style="background:linear-gradient(135deg,${typeInfo.color}10,${typeInfo.color}05);border:1px solid ${typeInfo.color}25;border-radius:10px;padding:0.6rem;margin-bottom:0.7rem">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.3rem;margin-bottom:0.4rem">
            ${conceptos > 0 ? `<div style="display:flex;align-items:center;gap:0.3rem"><span style="font-size:0.65rem">📚</span><span style="font-size:0.72rem;font-weight:600;color:var(--text-primary)">${conceptos}</span><span style="font-size:0.6rem;color:var(--text-muted)">conceptos</span></div>` : ""}
            ${apuntes > 0 ? `<div style="display:flex;align-items:center;gap:0.3rem"><span style="font-size:0.65rem">📝</span><span style="font-size:0.72rem;font-weight:600;color:var(--text-primary)">${apuntes}</span><span style="font-size:0.6rem;color:var(--text-muted)">apuntes</span></div>` : ""}
            ${ejercicios > 0 ? `<div style="display:flex;align-items:center;gap:0.3rem"><span style="font-size:0.65rem">🧩</span><span style="font-size:0.72rem;font-weight:600;color:var(--text-primary)">${ejercicios}</span><span style="font-size:0.6rem;color:var(--text-muted)">ejercicios</span></div>` : ""}
            ${examenes > 0 ? `<div style="display:flex;align-items:center;gap:0.3rem"><span style="font-size:0.65rem">📄</span><span style="font-size:0.72rem;font-weight:600;color:var(--text-primary)">${examenes}</span><span style="font-size:0.6rem;color:var(--text-muted)">parciales</span></div>` : ""}
          </div>
          ${conceptRel.length > 0 ? `<div style="font-size:0.62rem;color:var(--text-muted);margin-bottom:0.4rem"><b>Conceptos:</b> ${conceptRel.slice(0,5).join(" · ")}${conceptRel.length > 5 ? ` +${conceptRel.length-5} mas` : ""}</div>` : ""}
          <button onclick="switchView('chat');const ci=document.getElementById('chatInput');ci.value='Explica el tema: ${n.title.replace(/'/g,"\\'")}';ci.focus()" style="width:100%;padding:0.45rem;background:linear-gradient(135deg,${typeInfo.color}30,${typeInfo.color}15);color:${typeInfo.color};border:1px solid ${typeInfo.color}40;border-radius:8px;font-size:0.72rem;font-weight:600;cursor:pointer;transition:all 0.15s" onmouseover="this.style.background='${typeInfo.color}40'" onmouseout="this.style.background='${typeInfo.color}30'">
            🧠 Aprender esto
          </button>
        </div>`;
      })()}

      <!-- Knowledge Path (AI reasoning) -->
      ${(() => {
        if (n.type !== "concepto" && n.type !== "materia") return "";
        const path = kgRecommendPath(n.id);
        if (!path || path.length <= 2) return "";
        const pathNodes = path.map(id => kgNode(id)).filter(Boolean);
        return `<div style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(99,102,241,0.05));border:1px solid rgba(139,92,246,0.25);border-radius:10px;padding:0.6rem;margin-bottom:0.7rem">
          <div style="font-size:0.7rem;font-weight:700;color:#8b5cf6;margin-bottom:0.4rem"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" style="vertical-align:-1px"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Ruta de conocimiento</div>
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.2rem;margin-bottom:0.3rem">
            ${pathNodes.map((pn, i) => {
              const pi = KG_TYPES[pn.type] || KG_TYPES.concepto;
              const isTarget = pn.id === n.id;
              return `${i > 0 ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>` : ""}
              <button onclick="kgFocus('${pn.id}')" style="padding:0.2rem 0.4rem;background:${isTarget ? pi.color+'30' : 'var(--bg-card)'};border:1px solid ${isTarget ? pi.color+'50' : 'var(--border-color)'};border-radius:6px;font-size:0.62rem;color:${isTarget ? pi.color : 'var(--text-primary)'};cursor:pointer;font-weight:${isTarget?'700':'400'};white-space:nowrap">${pn.title}</button>`;
            }).join("")}
          </div>
          <div style="font-size:0.6rem;color:var(--text-muted)">${path.length} pasos desde ${pathNodes[0]?.title || "?"}</div>
        </div>`;
      })()}

      <!-- Knowledge Gap Detection -->
      ${(() => {
        if (n.type !== "concepto") return "";
        const gaps = kgFindGaps().filter(g => g.from.id === n.id || g.to.id === n.id || g.through?.id === n.id);
        if (gaps.length === 0) return "";
        return `<div style="background:linear-gradient(135deg,rgba(245,158,11,0.08),rgba(234,88,12,0.05));border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:0.6rem;margin-bottom:0.7rem">
          <div style="font-size:0.7rem;font-weight:700;color:#f59e0b;margin-bottom:0.4rem"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" style="vertical-align:-1px"><path d="M12 9v2m0 4h.01M10.29 3.86l-8.6 14.86A2 2 0 003.4 21h17.2a2 2 0 001.71-2.98l-8.6-14.86a2 2 0 00-3.42 0z"/></svg> Posible vacio de conocimiento</div>
          ${gaps.map(g => `<div style="font-size:0.65rem;color:var(--text-primary);line-height:1.4;margin-bottom:0.3rem;padding-left:0.5rem;border-left:2px solid #f59e0b40">
            Para conectar "<b>${g.from.title}</b>" con "<b>${g.to.title}</b>", revisá "<b>${g.through?.title || "?"}</b>".
            <button onclick="switchView('chat');const ci=document.getElementById('chatInput');ci.value='Explica: ${(g.through?.title||'').replace(/'/g,"\\'")}';ci.focus()" style="margin-top:0.2rem;padding:0.15rem 0.3rem;background:#f59e0b20;color:#f59e0b;border:1px solid #f59e0b40;border-radius:4px;font-size:0.6rem;cursor:pointer">Crear material</button>
          </div>`).join("")}
        </div>`;
      })()}
    </div>
    <div class="kg-side-body">

      <!-- Quick Actions -->
      <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.7rem">
        <button class="kg-btn" onclick="kgFocus('${n.id}')" title="Centrar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg> Centrar</button>
        <button class="kg-btn" onclick="kgExplore('${n.id}')" title="Explorar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> Explorar</button>
        <button class="kg-btn" onclick="kgShowConnectForm()" id="kg-connect-btn" title="Conectar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Conectar</button>
        <button class="kg-btn" onclick="kgShowNewNodeForm()" title="Nuevo nodo"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Nuevo</button>
        <button class="kg-btn" onclick="kgEditNodeContent('${n.id}')" title="Editar"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editar</button>
      </div>

      <!-- Connect Form -->
      <div id="kg-connect-form" style="display:none;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.6rem">
        <div style="font-size:0.7rem;font-weight:600;color:var(--text-primary);margin-bottom:0.4rem"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" style="vertical-align:-1px"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Conectar "${n.title}" con...</div>
        <input id="kg-connect-search" type="text" placeholder="Buscar nodo destino..." oninput="kgFilterConnectTargets(this.value)"
          style="width:100%;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.35rem 0.5rem;font-size:0.72rem;color:var(--text-primary);outline:none;margin-bottom:0.3rem">
        <div id="kg-connect-targets" style="max-height:120px;overflow-y:auto;margin-bottom:0.3rem">
          ${KG.nodes.filter(x => x.id !== n.id).map(x => {
            const ti = KG_TYPES[x.type] || KG_TYPES.concepto;
            return `<div class="kg-conn-item" onclick="kgSelectConnectTarget('${x.id}','${x.title}')" style="display:flex;align-items:center;gap:0.4rem;padding:0.3rem 0.5rem">
              <div style="width:22px;height:22px;border-radius:50%;background:${ti.color}20;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;color:${ti.color};border:1px solid ${ti.color}30;flex-shrink:0">${ti.icon}</div>
              <span style="font-size:0.72rem">${x.title}</span>
            </div>`;
          }).join("")}
        </div>
        <input id="kg-connect-label" type="text" placeholder="Tipo de relación (ej: requiere, relacionado con...)" style="width:100%;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.4rem;font-size:0.7rem;color:var(--text-primary);margin-bottom:0.3rem;outline:none">
        <div style="display:flex;gap:0.3rem">
          <button class="kg-btn" onclick="kgConfirmConnect('${n.id}')" style="background:var(--accent);color:white;border:none;flex:1;font-weight:600">Crear conexión</button>
          <button class="kg-btn" onclick="document.getElementById('kg-connect-form').style.display='none'" style="flex:0">Cancelar</button>
        </div>
      </div>

      <!-- New Node Form -->
      <div id="kg-newnode-form" style="display:none;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.6rem">
        <div style="font-size:0.7rem;font-weight:600;color:var(--text-primary);margin-bottom:0.4rem"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" style="vertical-align:-1px"><path d="M12 5v14M5 12h14"/></svg> Crear nodo nuevo</div>
        <input id="kg-newnode-title" type="text" placeholder="Título del nodo..." style="width:100%;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.35rem 0.5rem;font-size:0.72rem;color:var(--text-primary);outline:none;margin-bottom:0.3rem">
        <div style="display:flex;gap:0.3rem;margin-bottom:0.3rem">
          <select id="kg-newnode-type" style="flex:1;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.4rem;font-size:0.68rem;color:var(--text-primary);cursor:pointer">
            ${allTypes.map(t => `<option value="${t}">[${KG_TYPES[t].icon}] ${KG_TYPES[t].label}</option>`).join("")}
          </select>
          <select id="kg-newnode-materia" style="flex:1;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.4rem;font-size:0.68rem;color:var(--text-primary);cursor:pointer">
            <option value="">Sin materia</option>
            ${allMaterias.map(m => `<option value="${m}">${m}</option>`).join("")}
          </select>
        </div>
        <textarea id="kg-newnode-content" placeholder="Contenido (soporta Markdown, math, links, imagenes...)" rows="3" style="width:100%;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.35rem 0.5rem;font-size:0.72rem;color:var(--text-primary);outline:none;resize:vertical;font-family:inherit;margin-bottom:0.3rem"></textarea>
        <div style="font-size:0.62rem;color:var(--text-muted);margin-bottom:0.3rem">Tips: [nodo] para link, \$math\$ para fórmulas, ![alt](url) para imágenes</div>
        <div style="display:flex;gap:0.3rem">
          <button class="kg-btn" onclick="kgCreateNode('${n.id}')" style="background:var(--accent);color:white;border:none;flex:1;font-weight:600">Crear y conectar</button>
          <button class="kg-btn" onclick="kgCreateNode(null)" style="flex:1">Crear sin conectar</button>
          <button class="kg-btn" onclick="document.getElementById('kg-newnode-form').style.display='none'" style="flex:0">Cancelar</button>
        </div>
      </div>

      <!-- Edit Content Form -->
      <div id="kg-edit-form" style="display:none;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;margin-bottom:0.6rem">
        <div style="font-size:0.7rem;font-weight:600;color:var(--text-primary);margin-bottom:0.4rem"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" style="vertical-align:-1px"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Editar "${n.title}"</div>
        <input id="kg-edit-title" type="text" value="${n.title.replace(/"/g,"&quot;").replace(/'/g,"&#39;")}" placeholder="Titulo..." style="width:100%;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.35rem 0.5rem;font-size:0.72rem;color:var(--text-primary);outline:none;margin-bottom:0.3rem">
        <select id="kg-edit-type" style="width:100%;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.4rem;font-size:0.68rem;color:var(--text-primary);cursor:pointer;margin-bottom:0.3rem">
          ${allTypes.map(t => `<option value="${t}" ${n.type===t?"selected":""}>${KG_TYPES[t].label}</option>`).join("")}
        </select>
        <textarea id="kg-edit-content" rows="5" style="width:100%;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.4rem 0.5rem;font-size:0.78rem;color:var(--text-primary);outline:none;resize:vertical;font-family:inherit;margin-bottom:0.3rem;line-height:1.6"></textarea>

        <!-- Insert buttons row -->
        <div style="display:flex;gap:0.25rem;flex-wrap:wrap;margin-bottom:0.4rem">
          <button class="kg-btn" onclick="kgInsertContent('kg-edit-content','\\n## Nota\\nTu nota aqui\\n')" style="font-size:0.62rem;padding:0.15rem 0.4rem">Nota</button>
          <button class="kg-btn" onclick="kgInsertLink('kg-edit-content')" style="font-size:0.62rem;padding:0.15rem 0.4rem">Link</button>
          <button class="kg-btn" onclick="kgInsertImage('kg-edit-content')" style="font-size:0.62rem;padding:0.15rem 0.4rem">Imagen</button>
          <button class="kg-btn" onclick="kgInsertContent('kg-edit-content','\\n$$formula$$\\n')" style="font-size:0.62rem;padding:0.15rem 0.4rem">Formula</button>
        </div>

        <!-- SAVE BUTTON - big and obvious -->
        <button onclick="kgSaveEdit('${n.id}')" style="width:100%;padding:0.6rem;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:white;border:none;border-radius:8px;font-size:0.82rem;font-weight:700;cursor:pointer;margin-bottom:0.3rem;transition:all 0.15s" onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 4px 15px rgba(139,92,246,0.4)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
          Guardar cambios
        </button>
        <button onclick="document.getElementById('kg-edit-form').style.display='none'" style="width:100%;padding:0.4rem;background:transparent;color:var(--text-muted);border:1px solid var(--border-color);border-radius:8px;font-size:0.72rem;cursor:pointer">Cancelar</button>
      </div>

      <!-- Content -->
      <div style="margin-bottom:0.8rem">
        <div style="font-size:0.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.3rem">Contenido</div>
        <div class="kg-view" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem 0.8rem;max-height:300px;overflow-y:auto;font-size:0.82rem">
          ${kgMd(n.content)}
        </div>
      </div>

      <!-- Connections -->
      ${conns.length > 0 ? `
      <div style="margin-bottom:0.8rem">
        <div style="font-size:0.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.3rem">Conexiones (${conns.length})</div>
        ${conns.map(c => {
          const ci = KG_TYPES[c.type] || KG_TYPES.concepto;
          const edge = KG.edges.find(e => (e.source===n.id&&e.target===c.id)||(e.source===c.id&&e.target===n.id));
          return `<div class="kg-conn-item" onclick="kgFocus('${c.id}')" style="display:flex;align-items:center;gap:0.4rem">
            <div style="width:24px;height:24px;border-radius:50%;background:${ci.color}20;display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;color:${ci.color};border:1px solid ${ci.color}30;flex-shrink:0">${ci.icon}</div>
            <div style="flex:1;min-width:0">
              <div style="font-weight:600;color:var(--text-primary);font-size:0.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.title}</div>
              ${edge && edge.label ? `<div style="font-size:0.6rem;color:var(--text-muted);font-style:italic">${edge.label}</div>` : ""}
            </div>
            <button class="kg-btn" onclick="event.stopPropagation();kgRemoveEdge('${edge.id}')" title="Eliminar conexion" style="font-size:0.6rem;padding:0.15rem 0.3rem;color:#ef4444;border-color:#ef444440"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
          </div>`;
        }).join("")}
      </div>` : ""}

      <!-- Incoming references -->
      ${incoming.length > 0 ? `
      <div style="margin-bottom:0.8rem">
        <div style="font-size:0.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.3rem">← Referenciado por (${incoming.length})</div>
        ${incoming.map(e => {
          const src = kgNode(e.source);
          if (!src) return "";
          const si = KG_TYPES[src.type] || KG_TYPES.concepto;
          return `<div class="kg-conn-item" onclick="kgFocus('${src.id}')" style="display:flex;align-items:center;gap:0.4rem">
            <div style="width:22px;height:22px;border-radius:50%;background:${si.color}20;display:flex;align-items:center;justify-content:center;font-size:0.55rem;font-weight:700;color:${si.color};border:1px solid ${si.color}30;flex-shrink:0">${si.icon}</div>
            <span style="font-size:0.75rem">${src.title}</span>
            ${e.label ? `<span style="font-size:0.6rem;color:var(--text-muted);font-style:italic"> — ${e.label}</span>` : ""}
          </div>`;
        }).join("")}
      </div>` : ""}

      <!-- Delete node -->
      <div style="border-top:1px solid var(--border-color);padding-top:0.5rem;margin-top:0.5rem">
        <button class="kg-btn" onclick="if(confirm('¿Eliminar este nodo y todas sus conexiones?'))kgDeleteNode('${n.id}')" style="color:#ef4444;border-color:#ef444440;width:100%;font-size:0.68rem"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-2px"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg> Eliminar nodo</button>
      </div>
    </div>`;
}

function kgRenderSide(el) {
  // Just re-render normally, side panel is built into the graph view
  kgRender();
}

function kgSetupCanvas() {
  const canvas = document.getElementById("kg-canvas");
  if (!canvas) return;
  // Wait for layout to settle
  const wrap = document.getElementById("kg-canvas-wrap");
  let W, H;
  if (wrap) {
    const r = wrap.getBoundingClientRect();
    W = r.width; H = r.height;
  } else {
    const r = canvas.parentElement.getBoundingClientRect();
    W = r.width; H = r.height;
  }
  if (W < 10 || H < 10) {
    // Layout not ready, retry
    setTimeout(kgSetupCanvas, 100);
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const nodes = kgFiltered();
  if (!nodes.length) {
    ctx.fillStyle = "#6b7280"; ctx.font = "14px system-ui"; ctx.textAlign = "center";
    ctx.fillText("No hay nodos que mostrar", W/2, H/2);
    return;
  }

  // Position nodes with force simulation
  const spread = Math.min(W, H) * 0.35;
  const positioned = nodes.map((n, i) => {
    const angle = i * 2 * Math.PI / nodes.length;
    const radius = spread * (0.5 + Math.random() * 0.5);
    return { ...n, x: W/2 + Math.cos(angle) * radius, y: H/2 + Math.sin(angle) * radius, vx: 0, vy: 0, r: n.type === "materia" ? 22 : 14 };
  });
  const posMap = {}; positioned.forEach(p => { posMap[p.id] = p; });

  // Only include edges where both nodes are visible
  const visibleEdges = KG.edges.filter(e => posMap[e.source] && posMap[e.target]);

  // Force simulation
  for (let iter = 0; iter < 300; iter++) {
    const rep = 6000, sk = 0.005, sl = 120, damp = 0.85, grav = 0.0008;
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i+1; j < positioned.length; j++) {
        let dx = positioned[j].x - positioned[i].x, dy = positioned[j].y - positioned[i].y;
        let d = Math.sqrt(dx*dx+dy*dy) || 1, f = rep/(d*d);
        positioned[i].vx -= (dx/d)*f; positioned[i].vy -= (dy/d)*f;
        positioned[j].vx += (dx/d)*f; positioned[j].vy += (dy/d)*f;
      }
    }
    visibleEdges.forEach(e => {
      const s = posMap[e.source], t = posMap[e.target];
      if (!s || !t) return;
      let dx = t.x-s.x, dy = t.y-s.y, d = Math.sqrt(dx*dx+dy*dy) || 1, f = sk*(d-sl);
      s.vx += (dx/d)*f; s.vy += (dy/d)*f; t.vx -= (dx/d)*f; t.vy -= (dy/d)*f;
    });
    positioned.forEach(n => {
      n.vx += (W/2 - n.x) * grav; n.vy += (H/2 - n.y) * grav;
      n.vx *= damp; n.vy *= damp;
      n.x += n.vx; n.y += n.vy;
      n.x = Math.max(50, Math.min(W-50, n.x));
      n.y = Math.max(50, Math.min(H-50, n.y));
    });
  }

  let scale = KG.camZoom, panX = KG.camX, panY = KG.camY;
  let drag = null, panning = false, lastMouse = null, dragMoved = false;
  let hoverNode = null;

  function ts(x,y) { return { x:(x+panX)*scale+W/2, y:(y+panY)*scale+H/2 }; }
  function tw(sx,sy) { return { x:(sx-W/2)/scale-panX, y:(sy-H/2)/scale-panY }; }

  // Pre-generate stars for background
  const stars = [];
  for (let i = 0; i < 120; i++) {
    stars.push({ x: Math.random() * 2000, y: Math.random() * 1200, s: Math.random() * 1.5 + 0.5, p: Math.random() * Math.PI * 2, sp: Math.random() * 0.02 + 0.005 });
  }

  // Pre-generate ambient particles
  const particles = [];
  for (let i = 0; i < 30; i++) {
    particles.push({ x: Math.random() * 2000, y: Math.random() * 1200, vx: (Math.random()-0.5)*0.3, vy: (Math.random()-0.5)*0.3, r: Math.random()*2+1, a: Math.random(), color: ["#8b5cf6","#3b82f6","#ec4899","#22c55e"][Math.floor(Math.random()*4)] });
  }

  function draw() {
    KG.time += 0.012;
    ctx.clearRect(0,0,W,H);

    // === BACKGROUND: deep space ===
    const bgGrad = ctx.createRadialGradient(W*0.3, H*0.3, 0, W/2, H/2, W*0.8);
    bgGrad.addColorStop(0, "#0f0a1a");
    bgGrad.addColorStop(0.5, "#0a0a14");
    bgGrad.addColorStop(1, "#050510");
    ctx.fillStyle = bgGrad; ctx.fillRect(0,0,W,H);

    // === NEBULA clouds ===
    const nebulaTime = KG.time * 0.1;
    for (let i = 0; i < 3; i++) {
      const nx = W * (0.3 + 0.4 * Math.sin(nebulaTime + i * 2.1));
      const ny = H * (0.3 + 0.4 * Math.cos(nebulaTime * 0.7 + i * 1.5));
      const nr = 150 + Math.sin(nebulaTime + i) * 30;
      const nebGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
      const colors = ["rgba(139,92,246,0.04)", "rgba(59,130,246,0.03)", "rgba(236,72,153,0.025)"];
      nebGrad.addColorStop(0, colors[i]);
      nebGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nebGrad; ctx.fillRect(0,0,W,H);
    }

    // === STARS ===
    stars.forEach(st => {
      const sx = (st.x + panX * scale * 0.1) % W;
      const sy = (st.y + panY * scale * 0.1) % H;
      const twinkle = Math.sin(KG.time * st.sp * 10 + st.p) * 0.5 + 0.5;
      ctx.globalAlpha = 0.3 + twinkle * 0.5;
      ctx.fillStyle = "#c8d0e0";
      ctx.beginPath(); ctx.arc(sx < 0 ? sx + W : sx, sy < 0 ? sy + H : sy, st.s, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // === FLOATING PARTICLES ===
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      const pAlpha = 0.15 + Math.sin(KG.time * 2 + p.a * 10) * 0.1;
      ctx.globalAlpha = pAlpha;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // === GRID (subtle hexagonal feel) ===
    const gridSize = 40 * scale;
    const oX = (panX * scale + W/2) % gridSize;
    const oY = (panY * scale + H/2) % gridSize;
    ctx.fillStyle = "#8b5cf6";
    for (let x = oX; x < W; x += gridSize) for (let y = oY; y < H; y += gridSize) {
      const d = Math.sqrt((x-W/2)**2 + (y-H/2)**2);
      const pulse = Math.sin(KG.time * 0.3 + d * 0.003) * 0.5 + 0.5;
      ctx.globalAlpha = 0.015 + pulse * 0.015;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;

    // === VIGNETTE ===
    const vig = ctx.createRadialGradient(W/2, H/2, W*0.15, W/2, H/2, W*0.75);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = vig; ctx.fillRect(0,0,W,H);

    // === EDGES ===
    visibleEdges.forEach(e => {
      const s = posMap[e.source], t = posMap[e.target];
      if (!s || !t) return;
      // Focus mode: dim edges not connected to focus node
      if (KG.focus) {
        const sl = KG.focusLevels.get(e.source) ?? 99;
        const tl = KG.focusLevels.get(e.target) ?? 99;
        if (sl > 2 && tl > 2) return; // skip completely
      }
      const ss = ts(s.x,s.y), tt = ts(t.x,t.y);
      const isH = hoverNode === s.id || hoverNode === t.id || KG.active === s.id || KG.active === t.id;
      const srcType = KG_TYPES[s.type] || KG_TYPES.concepto;
      const tgtType = KG_TYPES[t.type] || KG_TYPES.concepto;

      const dx = tt.x - ss.x, dy = tt.y - ss.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const curvature = Math.min(dist * 0.12, 35);
      const nx = -dy / dist, ny = dx / dist;
      const cx = (ss.x + tt.x) / 2 + nx * curvature;
      const cy = (ss.y + tt.y) / 2 + ny * curvature;

      // Energy glow on hover
      if (isH) {
        for (let g = 0; g < 3; g++) {
          ctx.beginPath();
          ctx.moveTo(ss.x, ss.y);
          ctx.quadraticCurveTo(cx, cy, tt.x, tt.y);
          ctx.strokeStyle = srcType.color + "30";
          ctx.lineWidth = 8 - g * 2;
          ctx.globalAlpha = 0.15 - g * 0.04;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Main edge with gradient
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.quadraticCurveTo(cx, cy, tt.x, tt.y);
      const edgeGrad = ctx.createLinearGradient(ss.x, ss.y, tt.x, tt.y);
      edgeGrad.addColorStop(0, isH ? srcType.color : "#667");
      edgeGrad.addColorStop(0.5, isH ? blendColor(srcType.color, tgtType.color, 0.5) : "#556");
      edgeGrad.addColorStop(1, isH ? tgtType.color : "#667");
      ctx.strokeStyle = edgeGrad;
      ctx.lineWidth = isH ? 2 : 1.2;
      ctx.globalAlpha = isH ? 0.8 : 0.2;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Animated energy particles along edge
      if (isH) {
        for (let pi = 0; pi < 3; pi++) {
          const pt = ((KG.time * 1.2 + pi * 0.33) % 1);
          const ppx = (1-pt)*(1-pt)*ss.x + 2*(1-pt)*pt*cx + pt*pt*tt.x;
          const ppy = (1-pt)*(1-pt)*ss.y + 2*(1-pt)*pt*cy + pt*pt*tt.y;
          const pSize = 2.5 - pi * 0.5;
          const pAlpha2 = 0.8 - pi * 0.2;
          ctx.beginPath(); ctx.arc(ppx, ppy, pSize, 0, Math.PI*2);
          const pGrad = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, pSize);
          pGrad.addColorStop(0, "rgba(255,255,255," + pAlpha2 + ")");
          pGrad.addColorStop(1, srcType.color + "00");
          ctx.fillStyle = pGrad; ctx.fill();
        }
      }

      // Edge label
      if (e.label && scale > 0.4) {
        const lt = 0.5;
        const lx = (1-lt)*(1-lt)*ss.x + 2*(1-lt)*lt*cx + lt*lt*tt.x;
        const ly = (1-lt)*(1-lt)*ss.y + 2*(1-lt)*lt*cy + lt*lt*tt.y;
        ctx.font = "600 9px system-ui";
        const tw2 = ctx.measureText(e.label).width;
        ctx.fillStyle = isH ? "rgba(139,92,246,0.3)" : "rgba(10,10,25,0.8)";
        ctx.beginPath(); ctx.roundRect(lx-tw2/2-6, ly-8, tw2+12, 16, 8); ctx.fill();
        if (isH) { ctx.strokeStyle = "rgba(139,92,246,0.5)"; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = isH ? "#e0d4fc" : "#999";
        ctx.fillText(e.label, lx, ly);
      }
    });

    // === NODES ===
    positioned.forEach(n => {
      const s = ts(n.x, n.y);
      const typeInfo = KG_TYPES[n.type] || KG_TYPES.concepto;
      const isH = hoverNode === n.id;
      const isActive = KG.active === n.id;
      // Focus mode: dim nodes that aren't connected
      const focusLevel = KG.focus ? (KG.focusLevels.get(n.id) ?? 99) : 0;
      const isDimmed = KG.focus && focusLevel > 2;
      const isFocused = KG.focus && focusLevel <= 2;
      const focusAlpha = KG.focus ? (focusLevel === 0 ? 1 : focusLevel === 1 ? 0.85 : focusLevel === 2 ? 0.55 : 0.08) : 1;
      const baseR = n.r * scale;
      const pulse = Math.sin(KG.time * 1.5 + n.x * 0.02) * 2 * scale;
      const r = isH ? baseR + 6 : baseR + pulse;

      // Deep multi-layer glow
      ctx.globalAlpha = focusAlpha;
      for (let gl = 0; gl < 3; gl++) {
        const gr2 = r + 15 + gl * 10;
        ctx.beginPath(); ctx.arc(s.x, s.y, gr2, 0, Math.PI*2);
        const glGrad = ctx.createRadialGradient(s.x, s.y, r, s.x, s.y, gr2);
        const a = (isActive ? 0.18 : isH ? 0.12 : 0.04) * (1 - gl * 0.3);
        glGrad.addColorStop(0, typeInfo.color + Math.round(a * 255).toString(16).padStart(2,"0"));
        glGrad.addColorStop(1, typeInfo.color + "00");
        ctx.fillStyle = glGrad; ctx.fill();
      }

      // Rotating rings for active
      if (isActive) {
        ctx.save(); ctx.translate(s.x, s.y);
        for (let ring = 0; ring < 2; ring++) {
          ctx.rotate(KG.time * (0.4 + ring * 0.3) * (ring === 0 ? 1 : -1));
          ctx.beginPath(); ctx.arc(0, 0, r + 10 + ring * 5, 0, Math.PI * 0.7);
          ctx.strokeStyle = typeInfo.color + "50";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      // Shadow
      ctx.beginPath(); ctx.arc(s.x + 1, s.y + 4, r, 0, Math.PI*2);
      ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.fill();

      // Main circle
      ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI*2);
      const grad = ctx.createRadialGradient(s.x - r*0.3, s.y - r*0.3, 0, s.x, s.y, r);
      grad.addColorStop(0, lightenColor(typeInfo.color, 30));
      grad.addColorStop(0.5, typeInfo.color);
      grad.addColorStop(1, darkenColor(typeInfo.color, 30));
      ctx.fillStyle = grad; ctx.fill();

      // Glass highlight
      ctx.beginPath();
      ctx.ellipse(s.x, s.y - r * 0.2, r * 0.6, r * 0.35, 0, 0, Math.PI * 2);
      const glass = ctx.createRadialGradient(s.x, s.y - r*0.2, 0, s.x, s.y - r*0.2, r*0.6);
      glass.addColorStop(0, "rgba(255,255,255,0.2)");
      glass.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glass; ctx.fill();

      // Border with glow
      ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI*2);
      ctx.strokeStyle = isActive ? "#fff" : (isH ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.12)");
      ctx.lineWidth = isActive ? 2.5 : (isH ? 2 : 1);
      ctx.stroke();

      // Icon (custom shape)
      kgDrawTypeIcon(ctx, s.x, s.y, r, n.type, 0.9);

      // Label with pill
      if (scale > 0.3) {
        const fontSize = Math.max(10, (isH ? 12 : 10) * Math.min(scale, 1.2));
        ctx.font = `${isH ? "700" : "600"} ${fontSize}px system-ui,sans-serif`;
        const lw = ctx.measureText(n.title).width;
        const ly = s.y + r + 8;

        ctx.fillStyle = isActive ? typeInfo.color + "50" : "rgba(8,8,20,0.8)";
        ctx.beginPath(); ctx.roundRect(s.x - lw/2 - 7, ly - 3, lw + 14, fontSize + 8, (fontSize+8)/2); ctx.fill();
        if (isH || isActive) {
          ctx.strokeStyle = typeInfo.color + "60"; ctx.lineWidth = 1; ctx.stroke();
        }

        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = isActive ? "#fff" : (isH ? "#fff" : "#d0d8e8");
        ctx.fillText(n.title, s.x, ly);
      }
      ctx.globalAlpha = 1; // reset after focus mode
    });

    KG.anim = requestAnimationFrame(draw);
  }
  draw();

  // Interactions
  canvas.onmousemove = e => {
    const w = tw(e.offsetX, e.offsetY);
    let found = null;
    positioned.forEach(n => {
      if (Math.sqrt((n.x-w.x)**2 + (n.y-w.y)**2) < n.r + 5) found = n.id;
    });
    hoverNode = found;
    canvas.style.cursor = found ? "pointer" : (drag ? "grabbing" : "grab");

    // Tooltip
    const tt = document.getElementById("kg-tooltip");
    if (tt && found) {
      const n = kgNode(found);
      if (n) {
        const typeInfo = KG_TYPES[n.type] || KG_TYPES.concepto;
        const conns = kgConnectedNodes(n.id);
        const preview = n.content.replace(/[#*_`$]/g,"").replace(/\n/g," ").slice(0,120);
        tt.style.display = "block";
        tt.style.left = (e.clientX + 16) + "px";
        tt.style.top = (e.clientY - 12) + "px";
        tt.innerHTML = `
          <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.3rem">
            <div style="width:28px;height:28px;border-radius:50%;background:${typeInfo.color}30;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:${typeInfo.color};border:1px solid ${typeInfo.color}50">${typeInfo.icon}</div>
            <div>
              <div style="font-weight:700;font-size:0.85rem;color:#f1f5f9">${n.title}</div>
              <span class="kg-type-badge" style="background:${typeInfo.color}20;color:${typeInfo.color};border:1px solid ${typeInfo.color}40;font-size:0.58rem;padding:0.05rem 0.35rem">${typeInfo.label}</span>
            </div>
          </div>
          ${n.materia ? `<div style="font-size:0.65rem;color:#94a3b8;margin-bottom:0.25rem"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> ${n.materia}</div>` : ""}
          <div style="font-size:0.68rem;color:#94a3b8;margin-bottom:0.3rem;line-height:1.4;border-top:1px solid rgba(255,255,255,0.06);padding-top:0.3rem">${preview}...</div>
          ${conns.length > 0 ? `<div style="font-size:0.6rem;color:#8b5cf6;border-top:1px solid rgba(255,255,255,0.06);padding-top:0.25rem">→ ${conns.slice(0,3).map(c=>c.title).join(", ")}${conns.length>3?"...":""}</div>` : ""}
          <div style="font-size:0.58rem;color:#22c55e;margin-top:0.2rem;opacity:0.8">Click para ver detalle</div>`;
      }
    } else if (tt) tt.style.display = "none";

    // Drag / Pan
    if (drag) { drag.x = w.x; drag.y = w.y; dragMoved = true; }
    else if (panning && lastMouse) {
      panX += (e.offsetX - lastMouse.x) / scale;
      panY += (e.offsetY - lastMouse.y) / scale;
      KG.camX = panX; KG.camY = panY;
      lastMouse = { x: e.offsetX, y: e.offsetY };
    }
  };

  canvas.onmousedown = e => {
    const w = tw(e.offsetX, e.offsetY);
    const node = positioned.find(n => Math.sqrt((n.x-w.x)**2 + (n.y-w.y)**2) < n.r + 5);
    if (node) { drag = node; dragMoved = false; canvas.style.cursor = "grabbing"; }
    else { panning = true; lastMouse = { x: e.offsetX, y: e.offsetY }; canvas.style.cursor = "grabbing"; }
  };

  canvas.onmouseup = () => {
    if (drag && !dragMoved) {
      KG.active = drag.id;
      kgRender();
    }
    drag = null; panning = false; lastMouse = null; dragMoved = false;
    canvas.style.cursor = hoverNode ? "pointer" : "grab";
  };

  canvas.onmouseleave = () => {
    hoverNode = null; drag = null; panning = false;
    const tt = document.getElementById("kg-tooltip");
    if (tt) tt.style.display = "none";
  };

  canvas.onwheel = e => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.08 : 0.92;
    scale = Math.max(0.2, Math.min(4, scale * delta));
    KG.camZoom = scale;
  };

  // === TOUCH EVENTS ===
  let touchStart = null, touchDist = null, touchMoved = false;
  canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const tx = t.clientX - rect.left, ty = t.clientY - rect.top;
      const w = tw(tx, ty);
      const node = positioned.find(n => Math.sqrt((n.x-w.x)**2 + (n.y-w.y)**2) < n.r + 10);
      if (node) { drag = node; dragMoved = false; }
      else { panning = true; }
      touchStart = { x: tx, y: ty };
      touchMoved = false;
    } else if (e.touches.length === 2) {
      // Pinch zoom start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDist = Math.sqrt(dx*dx + dy*dy);
    }
  }, { passive: false });

  canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    if (e.touches.length === 1 && touchStart) {
      const t = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const tx = t.clientX - rect.left, ty = t.clientY - rect.top;
      const dx = tx - touchStart.x, dy = ty - touchStart.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) touchMoved = true;
      if (drag) {
        const w = tw(tx, ty);
        drag.x = w.x; drag.y = w.y;
        dragMoved = true;
      } else if (panning) {
        panX += dx / scale;
        panY += dy / scale;
        KG.camX = panX; KG.camY = panY;
      }
      touchStart = { x: tx, y: ty };
    } else if (e.touches.length === 2 && touchDist) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx*dx + dy*dy);
      const ratio = newDist / touchDist;
      scale = Math.max(0.2, Math.min(4, scale * ratio));
      KG.camZoom = scale;
      touchDist = newDist;
    }
  }, { passive: false });

  canvas.addEventListener("touchend", e => {
    if (drag && !touchMoved) {
      KG.active = drag.id;
      kgRender();
    }
    drag = null; panning = false; touchStart = null; touchDist = null; touchMoved = false;
  });
}

// ─── ACTIONS ───
function kgFocus(id) {
  KG.active = id;
  KG.view = "graph";
  kgRender();
}

function kgFocusByTitle(title) {
  const n = KG.nodes.find(x => x.title.toLowerCase() === title.toLowerCase());
  if (n) kgFocus(n.id);
}

function kgExplore(id) {
  // Focus mode: center node, dim everything else, show connections
  KG.focus = id;
  KG.active = id;
  KG.focusLevels.clear();
  // BFS to compute levels (0=center, 1=direct, 2=indirect)
  KG.focusLevels.set(id, 0);
  const q = [id];
  for (let depth = 0; depth < 2 && q.length > 0; depth++) {
    const next = [];
    for (const nid of q) {
      KG.edges.forEach(e => {
        const other = e.source === nid ? e.target : (e.target === nid ? e.source : null);
        if (other && !KG.focusLevels.has(other)) {
          KG.focusLevels.set(other, depth + 1);
          next.push(other);
        }
      });
    }
    q.length = 0;
    q.push(...next);
  }
  // Center camera on the focus node
  const fn = kgNode(id);
  if (fn) { KG.camX = -fn.x; KG.camY = -fn.y; KG.camZoom = 1.2; }
  kgRender();
}

function kgClearFocus() {
  KG.focus = null;
  KG.focusLevels.clear();
  KG.camX = 0; KG.camY = 0; KG.camZoom = 1;
  kgRender();
}

function kgRandomExplore() {
  if (KG.nodes.length === 0) return;
  const node = KG.nodes[Math.floor(Math.random() * KG.nodes.length)];
  const conns = kgConnectedNodes(node.id);
  const ti = KG_TYPES[node.type] || KG_TYPES.concepto;
  // Find a random connected node for the "did you know" fact
  let fact = "";
  if (conns.length > 0) {
    const rc = conns[Math.floor(Math.random() * conns.length)];
    const ri = KG_TYPES[rc.type] || KG_TYPES.concepto;
    fact = `<div style="margin-top:0.6rem;padding:0.7rem;background:linear-gradient(135deg,${ti.color}15,${ri.color}15);border:1px solid ${ti.color}30;border-radius:10px">
      <div style="font-size:0.75rem;font-weight:700;color:${ti.color};margin-bottom:0.4rem">🧠 ¿Sabias que...?</div>
      <div style="font-size:0.75rem;color:var(--text-primary);line-height:1.5">
        <b>${node.title}</b> esta conectado con <b>${rc.title}</b>.
        ${edge = KG.edges.find(e => (e.source===node.id&&e.target===rc.id)||(e.source===rc.id&&e.target===node.id)),
        edge ? `<br><i style="color:var(--text-muted)">Relacion: ${edge.label}</i>` : ""}
      </div>
      <button onclick="kgExplore('${node.id}')" class="kg-btn" style="margin-top:0.4rem;font-size:0.68rem;background:${ti.color}20;color:${ti.color};border-color:${ti.color}40">
        Explorar conexión
      </button>
    </div>`;
  }
  // Show in a toast-like overlay
  const toast = document.createElement("div");
  toast.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:10001;max-width:400px;width:90%;background:rgba(15,15,25,0.97);backdrop-filter:blur(16px);border:1px solid rgba(139,92,246,0.3);border-radius:14px;padding:1rem;box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 30px rgba(139,92,246,0.15);animation:kgFadeIn 0.3s ease";
  toast.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
      <div style="width:32px;height:32px;border-radius:50%;background:${ti.color}25;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;color:${ti.color};border:1px solid ${ti.color}40">${ti.icon}</div>
      <div>
        <div style="font-size:0.8rem;font-weight:700;color:#f1f5f9">${node.title}</div>
        <div style="font-size:0.62rem;color:var(--text-muted)">${ti.label} · ${node.materia || ""}</div>
      </div>
      <button onclick="this.closest('div[style*=fixed]').remove()" style="margin-left:auto;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem">✕</button>
    </div>
    ${fact}
    <div style="display:flex;gap:0.3rem;margin-top:0.5rem">
      <button onclick="kgExplore('${node.id}');this.closest('div[style*=fixed]').remove()" class="kg-btn" style="flex:1;background:var(--accent);color:white;border:none;font-weight:600">Explorar</button>
      <button onclick="KG.active='${node.id}';KG.view='graph';kgRender();this.closest('div[style*=fixed]').remove()" class="kg-btn" style="flex:1">Ver detalle</button>
      <button onclick="kgRandomExplore();this.closest('div[style*=fixed]').remove()" class="kg-btn" style="flex:0;font-size:0.8rem">↻</button>
    </div>
  `;
  document.body.appendChild(toast);
  // Auto-remove after 12 seconds
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 12000);
}

// Knowledge path: BFS shortest path between two nodes
function kgFindPath(fromId, toId) {
  const visited = new Set([fromId]);
  const queue = [[fromId]];
  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];
    if (current === toId) return path;
    KG.edges.forEach(e => {
      const next = e.source === current ? e.target : (e.target === current ? e.source : null);
      if (next && !visited.has(next)) {
        visited.add(next);
        queue.push([...path, next]);
      }
    });
  }
  return null; // no path found
}

// Knowledge gap detection: find concepts that are "missing links"
function kgFindGaps() {
  const gaps = [];
  // For each concept chain: if A→B and B→C exist but A→C doesn't, it's a potential gap
  for (const e1 of KG.edges) {
    for (const e2 of KG.edges) {
      if (e1.target === e2.source && e1.source !== e2.target) {
        const directExists = KG.edges.some(e =>
          (e.source === e1.source && e.target === e2.target) ||
          (e.source === e2.target && e.target === e1.source));
        if (!directExists) {
          const a = kgNode(e1.source), b = kgNode(e2.target);
          if (a && b && a.type === "concepto" && b.type === "concepto") {
            const mid = kgNode(e1.target);
            gaps.push({ from: a, through: mid, to: b, label: `Para conectar "${a.title}" con "${b.title}", revisá "${mid?.title || e1.target}"` });
          }
        }
      }
    }
  }
  // Deduplicate
  const seen = new Set();
  return gaps.filter(g => {
    const key = g.from.id + g.to.id;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, 5);
}

// AI-style: recommend learning path for a topic
function kgRecommendPath(nodeId) {
  const target = kgNode(nodeId);
  if (!target) return null;
  // BFS from all "materia" nodes to this concept
  const materias = KG.nodes.filter(n => n.type === "materia");
  let bestPath = null;
  for (const m of materias) {
    const path = kgFindPath(m.id, nodeId);
    if (path && (!bestPath || path.length < bestPath.length)) bestPath = path;
  }
  return bestPath;
}

function kgToggleAddEdge() {
  const form = document.getElementById("kg-add-edge-form");
  if (form) form.style.display = form.style.display === "none" ? "block" : "none";
}

// === NEW CONNECTION FORM ===
let kgConnectTarget = null;
function kgShowConnectForm() {
  kgConnectTarget = null;
  const f = document.getElementById("kg-connect-form");
  const nf = document.getElementById("kg-newnode-form");
  const ef = document.getElementById("kg-edit-form");
  if (nf) nf.style.display = "none";
  if (ef) ef.style.display = "none";
  if (f) f.style.display = f.style.display === "none" ? "block" : "none";
}

function kgFilterConnectTargets(query) {
  const items = document.querySelectorAll("#kg-connect-targets .kg-conn-item");
  const q = query.toLowerCase();
  items.forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(q) ? "flex" : "none";
  });
}

function kgSelectConnectTarget(id, title) {
  kgConnectTarget = id;
  const items = document.querySelectorAll("#kg-connect-targets .kg-conn-item");
  items.forEach(item => {
    item.style.background = item.textContent.includes(title) ? "rgba(139,92,246,0.15)" : "";
    item.style.borderColor = item.textContent.includes(title) ? "#8b5cf6" : "";
  });
}

function kgConfirmConnect(sourceId) {
  if (!kgConnectTarget) { alert("Seleccioná un nodo destino"); return; }
  if (kgConnectTarget === sourceId) { alert("No podés conectar un nodo consigo mismo"); return; }
  const exists = KG.edges.some(e => (e.source===sourceId&&e.target===kgConnectTarget)||(e.source===kgConnectTarget&&e.target===sourceId));
  if (exists) { alert("Ya existe una conexión entre estos nodos"); return; }
  const label = document.getElementById("kg-connect-label")?.value?.trim() || "";
  KG.edges.push({ id: "e_"+Date.now()+"_"+Math.random().toString(36).slice(2,6), source: sourceId, target: kgConnectTarget, label });
  kgSave(); kgRender();
}

function kgRemoveEdge(edgeId) {
  if (!confirm("¿Eliminar esta conexión?")) return;
  KG.edges = KG.edges.filter(e => e.id !== edgeId);
  kgSave(); kgRender();
}

// === NEW NODE ===
function kgShowNewNodeForm() {
  const f = document.getElementById("kg-newnode-form");
  const cf = document.getElementById("kg-connect-form");
  const ef = document.getElementById("kg-edit-form");
  if (cf) cf.style.display = "none";
  if (ef) ef.style.display = "none";
  if (f) f.style.display = f.style.display === "none" ? "block" : "none";
}

function kgCreateNode(connectToId) {
  const title = document.getElementById("kg-newnode-title")?.value?.trim();
  const type = document.getElementById("kg-newnode-type")?.value || "concepto";
  const materia = document.getElementById("kg-newnode-materia")?.value || "";
  const content = document.getElementById("kg-newnode-content")?.value || "";
  if (!title) { alert("Escribí un título"); return; }
  const id = "n_"+Date.now()+"_"+Math.random().toString(36).slice(2,6);
  KG.nodes.push({ id, title, type, materia, content });
  if (connectToId) {
    KG.edges.push({ id: "e_"+Date.now()+"_"+Math.random().toString(36).slice(2,6), source: connectToId, target: id, label: "" });
  }
  kgSave();
  KG.active = id;
  kgRender();
}

// === EDIT NODE ===
function kgEditNodeContent() {
  const f = document.getElementById("kg-edit-form");
  const cf = document.getElementById("kg-connect-form");
  const nf = document.getElementById("kg-newnode-form");
  if (cf) cf.style.display = "none";
  if (nf) nf.style.display = "none";
  if (f) {
    f.style.display = f.style.display === "none" ? "block" : "none";
    // Populate textarea safely after DOM is ready
    if (f.style.display === "block" && KG.active) {
      const n = kgNode(KG.active);
      const ta = document.getElementById("kg-edit-content");
      if (ta && n) ta.value = n.content || "";
    }
  }
}

function kgSaveEdit(nodeId) {
  const n = kgNode(nodeId);
  if (!n) return;
  const newTitle = document.getElementById("kg-edit-title")?.value?.trim();
  const newType = document.getElementById("kg-edit-type")?.value;
  const newContent = document.getElementById("kg-edit-content")?.value;
  if (newTitle !== undefined && newTitle !== "") n.title = newTitle;
  if (newType) n.type = newType;
  if (newContent !== undefined) n.content = newContent;
  n.updated = new Date().toISOString();
  kgSave();
  // Update just the side panel, don't rebuild entire DOM
  const side = document.getElementById("kg-side");
  if (side) { side.innerHTML = kgRenderSidePanel(); }
  // Also re-render the graph nodes to reflect changes
  kgSetupCanvas();
}

function kgDeleteNode(nodeId) {
  KG.nodes = KG.nodes.filter(n => n.id !== nodeId);
  KG.edges = KG.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
  KG.active = null;
  kgSave(); kgRender();
}

// === CONTENT INSERT HELPERS ===
function kgInsertContent(textareaId, text) {
  const ta = document.getElementById(textareaId);
  if (!ta) return;
  const start = ta.selectionStart;
  ta.value = ta.value.slice(0, start) + text + ta.value.slice(ta.selectionEnd);
  ta.selectionStart = ta.selectionEnd = start + text.length;
  ta.focus();
}

function kgInsertLink(textareaId) {
  const url = prompt("URL del link:");
  if (!url) return;
  const text = prompt("Texto del link:", url);
  kgInsertContent(textareaId, `[${text||url}](${url})`);
}

function kgInsertImage(textareaId) {
  const url = prompt("URL de la imagen:");
  if (!url) return;
  const alt = prompt("Descripción de la imagen:", "imagen");
  kgInsertContent(textareaId, `![${alt||"imagen"}](${url})`);
}

function kgFullscreen() {
  const el = document.getElementById("tech-tree-view");
  const header = document.querySelector("header");
  const app = document.getElementById("app");
  if (!el) return;
  if (el.classList.contains("kg-fullscreen")) {
    // Exit
    el.classList.remove("kg-fullscreen");
    el.style.cssText = "padding:0!important";
    if (header) header.style.display = "";
    if (app) app.style.display = "";
    document.body.style.overflow = "";
  } else {
    // Enter
    el.classList.add("kg-fullscreen");
    if (header) header.style.display = "none";
    document.body.style.overflow = "hidden";
  }
  setTimeout(() => kgRender(), 50);
}

// Re-render on fullscreen change
document.addEventListener("fullscreenchange", () => {
  setTimeout(() => kgRender(), 300);
});

function kgResetView() {
  KG.camX = 0; KG.camY = 0; KG.camZoom = 1;
  KG.active = null;
  kgRender();
}

window.kgRender = kgRender;
window.kgFocus = kgFocus;
window.kgFocusByTitle = kgFocusByTitle;
window.kgExplore = kgExplore;
window.kgResetView = kgResetView;
window.kgToggleAddEdge = kgToggleAddEdge;
window.kgAddEdge = kgAddEdge;
window.kgFullscreen = kgFullscreen;
window.kgShowConnectForm = kgShowConnectForm;
window.kgFilterConnectTargets = kgFilterConnectTargets;
window.kgSelectConnectTarget = kgSelectConnectTarget;
window.kgConfirmConnect = kgConfirmConnect;
window.kgRemoveEdge = kgRemoveEdge;
window.kgShowNewNodeForm = kgShowNewNodeForm;
window.kgCreateNode = kgCreateNode;
window.kgEditNodeContent = kgEditNodeContent;
window.kgSaveEdit = kgSaveEdit;
window.kgDeleteNode = kgDeleteNode;
window.kgInsertContent = kgInsertContent;
window.kgInsertLink = kgInsertLink;
window.kgInsertImage = kgInsertImage;
