// knowledge-graph.js — Phase 1: Visual knowledge graph engine
const KG = {
  nodes: [], edges: [],
  active: null, hover: null, view: "graph",
  search: "", filterType: "", filterMateria: "",
  camX: 0, camY: 0, camZoom: 1,
  dragging: null, panning: false, lastMouse: null, dragMoved: false,
  anim: null, time: 0
};

const KG_TYPES = {
  materia: { color: "#8b5cf6", icon: "📚", label: "Materia" },
  concepto: { color: "#3b82f6", icon: "💡", label: "Concepto" },
  apunte: { color: "#22c55e", icon: "📝", label: "Apunte" },
  ejercicio: { color: "#f59e0b", icon: "✏️", label: "Ejercicio" },
  examen: { color: "#ef4444", icon: "📋", label: "Examen" },
  recurso: { color: "#06b6d4", icon: "🔗", label: "Recurso" },
};

function kgInit() {
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
    // Materias
    { id:"m-alg", type:"materia", title:"Álgebra Lineal", materia:"Álgebra Lineal", content:"Rama de las matemáticas que estudia vectores, matrices y transformaciones lineales.\n\n**Conceptos clave:**\n- Vectores y espacios vectoriales\n- Matrices y operaciones\n- Determinantes\n- Autovalores y autovectores\n- Transformaciones lineales\n\n**Aplicaciones en ingeniería:**\n- Gráficos por computadora\n- Machine learning\n- Mecánica cuántica\n- Procesamiento de señales" },
    { id:"m-calc1", type:"materia", title:"Cálculo I", materia:"Cálculo I", content:"Análisis de límites, derivadas e integrales básicas.\n\n**Temas principales:**\n- Límites y continuidad\n- Derivadas y sus aplicaciones\n- Reglas de derivación\n- Integrales definidas e indefinidas\n\n**Fórmulas fundamentales:**\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n$$\\int_a^b f(x)dx = F(b) - F(a)$$" },
    { id:"m-fis1", type:"materia", title:"Física I", materia:"Física I", content:"Mecánica clásica: cinemática, dinámica y energética.\n\n**Temas:**\n- Cinemática (movimiento)\n- Dinámica (fuerzas)\n- Trabajo y energía\n- Momento angular\n- Oscilaciones" },
    { id:"m-prog", type:"materia", title:"Programación", materia:"Programación", content:"Fundamentos de programación y pensamiento computacional.\n\n**Paradigmas:**\n- Imperativo\n- Orientado a objetos\n- Funcional\n\n**Estructuras:**\n- Variables, bucles, condicionales\n- Funciones y módulos\n- Estructuras de datos básicas" },
    { id:"m-elec", type:"materia", title:"Circuitos Eléctricos", materia:"Circuitos Eléctricos", content:"Análisis de circuitos resistivos, RC, RL y RLC.\n\n**Leyes fundamentales:**\n- Ley de Ohm\n- Kirchhoff (KCL y KVL)\n- Thévenin y Norton\n- Superposición" },
    // Conceptos de Álgebra
    { id:"c-matrices", type:"concepto", title:"Matrices", materia:"Álgebra Lineal", content:"**Definición:** Tabla rectangular de números organizados en filas y columnas.\n\n**Operaciones:**\n- Suma: $A + B = [a_{ij} + b_{ij}]$\n- Multiplicación: $(AB)_{ij} = \\sum_k a_{ik}b_{kj}$\n- Transposta: $(A^T)_{ij} = a_{ji}$\n\n**Propiedades importantes:**\n- $AB \\neq BA$ en general\n- $(AB)^T = B^T A^T$\n- $A \\cdot A^{-1} = I$" },
    { id:"c-determ", type:"concepto", title:"Determinantes", materia:"Álgebra Lineal", content:"**Definición:** Un número escalar asociado a una matriz cuadrada.\n\n**Para 2x2:**\n$$\\det(A) = ad - bc$$\n\n**Propiedades:**\n- $\\det(AB) = \\det(A)\\det(B)$\n- $\\det(A^T) = \\det(A)$\n- $\\det(A^{-1}) = 1/\\det(A)$\n- Si $\\det(A) = 0$, la matriz no tiene inversa\n\n**Aplicación:** Resolver sistemas con la regla de Cramer." },
    { id:"c-autoval", type:"concepto", title:"Autovalores", materia:"Álgebra Lineal", content:"**Definición:** Un autovalor $\\lambda$ es un escalar tal que existe un vector $v \\neq 0$ donde:\n\n$$Av = \\lambda v$$\n\n**Cálculo:** Resolver $\\det(A - \\lambda I) = 0$\n\n**Autovalores y autovectores:**\n- Los autovalores indican las direcciones donde la transformación solo escala\n- Los autovectores son las direcciones de esa escalación\n\n**Aplicaciones:**\n- Análisis de estabilidad\n- PCA (análisis de componentes principales)\n- Valores propios de sistemas dinámicos" },
    { id:"c-espvec", type:"concepto", title:"Espacios Vectoriales", materia:"Álgebra Lineal", content:"**Definición:** Conjunto de vectores cerrado bajo suma y multiplicación por escalar.\n\n**Axiomas:**\n- Asociatividad y conmutatividad de la suma\n- Elemento neutro: $0$\n- Inverso aditivo: $-v$\n- Distributividad\n\n**Ejemplos:**\n- $\\mathbb{R}^n$\n- Espacios de polinomios\n- Espacios de funciones\n\n**Base y dimensión:**\n- Base: conjunto linealmente independiente que genera el espacio\n- Dimensión: cantidad de vectores en la base" },
    { id:"c-dialg", type:"concepto", title:"Diagonalización", materia:"Álgebra Lineal", content:"**Proceso:** Encontrar una matriz diagonal $D$ tal que:\n\n$$A = PDP^{-1}$$\n\n**Cuándo se puede diagonalizar:**\n- La matriz tiene $n$ autovalores linealmente independientes\n- Cada autovalor tiene multiplicidad geométrica = algebraica\n\n**Ventajas:**\n- $A^n = PD^nP^{-1}$\n- Cálculo de potencias rápido\n- Análisis de sistemas dinámicos" },
    // Conceptos de Cálculo
    { id:"c-deriv", type:"concepto", title:"Derivadas", materia:"Cálculo I", content:"**Definición:**\n$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\n**Reglas:**\n- Potencia: $(x^n)' = nx^{n-1}$\n- Producto: $(fg)' = f'g + fg'$\n- Cociente: $(f/g)' = (f'g - fg')/g^2$\n- Cadena: $[f(g(x))]' = f'(g(x)) \\cdot g'(x)$\n\n**Aplicaciones:**\n- Velocidad y aceleración\n- Puntos críticos\n- Optimización\n- Recta tangente" },
    { id:"c-integ", type:"concepto", title:"Integrales", materia:"Cálculo I", content:"**Integral definida:**\n$$\\int_a^b f(x)dx = F(b) - F(a)$$\n\n**Técnicas:**\n- Sustitución\n- Partes: $\\int u\\,dv = uv - \\int v\\,du$\n- Fracciones parciales\n\n**Teorema Fundamental del Cálculo:**\nLa integral y la derivada son operaciones inversas." },
    // Conceptos de Física
    { id:"c-newton", type:"concepto", title:"Leyes de Newton", materia:"Física I", content:"**1ª Ley (Inercia):** Un cuerpo en reposo permanece en reposo.\n\n**2ª Ley:**\n$$\\vec{F} = m\\vec{a}$$\n\n**3ª Ley (Acción-Reacción):**\n$$\\vec{F}_{AB} = -\\vec{F}_{BA}$$\n\n**Aplicación:** Todo problema de dinámica se resuelve con un diagrama de cuerpo libre." },
    { id:"c-energia", type:"concepto", title:"Energía y Trabajo", materia:"Física I", content:"**Trabajo:**\n$$W = \\vec{F} \\cdot \\vec{d} = Fd\\cos\\theta$$\n\n**Energía cinética:**\n$$KE = \\frac{1}{2}mv^2$$\n\n**Energía potencial:**\n$$U = mgh$$\n\n**Conservación:**\n$$KE_i + PE_i = KE_f + PE_f$$" },
    // Conceptos de Programación
    { id:"c-oop", type:"concepto", title:"Programación Orientada a Objetos", materia:"Programación", content:"**Pilares:**\n- **Encapsulamiento:** Datos + métodos juntos\n- **Herencia:** Reutilizar código de clases padre\n- **Polimorfismo:** Mismo método, comportamiento diferente\n- **Abstracción:** Ocultar complejidad\n\n**Ejemplo:**\n```python\nclass Animal:\n    def __init__(self, nombre):\n        self.nombre = nombre\n    def hablar(self):\n        pass\n\nclass Perro(Animal):\n    def hablar(self):\n        return \"Guau\"\n```" },
    { id:"c-estruc", type:"concepto", title:"Estructuras de Datos", materia:"Programación", content:"**Lineales:**\n- Array: acceso O(1)\n- Linked List: inserción O(1)\n- Stack: LIFO\n- Queue: FIFO\n\n**No lineales:**\n- Árbol BST: búsqueda O(log n)\n- Heap: min/max O(1)\n- Grafo: representación de relaciones\n\n**Complejidad:**\n$$O(1) < O(\\log n) < O(n) < O(n^2)$$" },
    // Conceptos de Circuitos
    { id:"c-ohm", type:"concepto", title:"Ley de Ohm", materia:"Circuitos Eléctricos", content:"**Relación fundamental:**\n$$V = IR$$\n\n- **V** = Voltaje (Voltios)\n- **I** = Corriente (Amperios)\n- **R** = Resistencia (Ohms)\n\n**Analogía hidráulica:**\nVoltaje = presión, Corriente = caudal, Resistencia = diámetro de tubería." },
    { id:"c-kirch", type:"concepto", title:"Leyes de Kirchhoff", materia:"Circuitos Eléctricos", content:"**KCL (Corrientes):**\nLa suma de corrientes que entran a un nodo es igual a las que salen.\n$$\\sum I_{entran} = \\sum I_{salen}$$\n\n**KVL (Voltajes):**\nLa suma de voltajes en una malla cerrada es cero.\n$$\\sum V_{malla} = 0$$" },
    // Apuntes
    { id:"a-alg-autoval", type:"apunte", title:"Apuntes: Autovalores y Autovectores", materia:"Álgebra Lineal", content:"## Resumen de autovalores\n\nPara encontrar autovalores:\n1. Calcular $\\det(A - \\lambda I) = 0$\n2. Resolver el polinomio característico\n3. Para cada $\\lambda$, resolver $(A - \\lambda I)v = 0$\n\n**Ejemplo:**\n$$A = \\begin{pmatrix} 2 & 1 \\\\ 1 & 2 \\end{pmatrix}$$\n$$\\det(A - \\lambda I) = (2-\\lambda)^2 - 1 = 0$$\n$$\\lambda_1 = 3, \\lambda_2 = 1$$" },
    { id:"a-calc-deriv", type:"apunte", title:"Apuntes: Reglas de Derivación", materia:"Cálculo I", content:"## Tabla de derivadas comunes\n\n| Función | Derivada |\n|---------|----------|\n| $x^n$ | $nx^{n-1}$ |\n| $e^x$ | $e^x$ |\n| $\\ln x$ | $1/x$ |\n| $\\sin x$ | $\\cos x$ |\n| $\\cos x$ | $-\\sin x$ |\n| $\\tan x$ | $\\sec^2 x$ |\n\n## Regla de la cadena\n$$[f(g(x))]' = f'(g(x)) \\cdot g'(x)$$" },
    { id:"a-fis-newton", type:"apunte", title:"Apuntes: Diagrama de Cuerpo Libre", materia:"Física I", content:"## Pasos para DCL\n\n1. **Identificar** el objeto de interés\n2. **Dibujar** el objeto como punto\n3. **Identificar** todas las fuerzas:\n   - Peso ($mg$) hacia abajo\n   - Normal ($N$) perpendicular a superficie\n   - Fricción ($f$) opuesta al movimiento\n   - Tensión ($T$) a lo largo de cuerda\n   - Fuerza aplicada ($F$)\n4. **Elegir** sistema de coordenadas\n5. **Aplicar** $\\sum F = ma$" },
    // Ejercicios
    { id:"e-alg-det", type:"ejercicio", title:"Ej: Calcular Determinante 3x3", materia:"Álgebra Lineal", content:"## Ejercicio\n\nCalcular el determinante de:\n$$A = \\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 4 \\\\ 5 & 6 & 0 \\end{pmatrix}$$\n\n**Método de Sarrus:**\n$$\\det(A) = 1(1\\cdot0 - 4\\cdot6) - 2(0\\cdot0 - 4\\cdot5) + 3(0\\cdot6 - 1\\cdot5)$$\n$$= 1(-24) - 2(-20) + 3(-5)$$\n$$= -24 + 40 - 15 = 1$$" },
    { id:"e-calc-deriv", type:"ejercicio", title:"Ej: Derivada Compuesta", materia:"Cálculo I", content:"## Ejercicio\n\nCalcular la derivada de:\n$$f(x) = \\sin(x^2 + 1)$$\n\n**Resolución:**\nPor la regla de la cadena:\n- Función externa: $\\sin(u)$ → derivada: $\\cos(u)$\n- Función interna: $x^2 + 1$ → derivada: $2x$\n\n$$f'(x) = \\cos(x^2 + 1) \\cdot 2x = 2x\\cos(x^2 + 1)$$" },
    { id:"e-fis-energia", type:"ejercicio", title:"Ej: Conservación de Energía", materia:"Física I", content:"## Ejercicio\n\nUn bloque de 2 kg baja un plano sin fricción desde $h = 5m$. ¿Qué velocidad tiene al fondo?\n\n**Resolución:**\n$$mgh = \\frac{1}{2}mv^2$$\n$$v = \\sqrt{2gh} = \\sqrt{2 \\cdot 9.8 \\cdot 5} = \\sqrt{98} = 9.9 \\, m/s$$" },
    // Recursos
    { id:"r-3blue1brown", type:"recurso", title:"3Blue1Brown: Lineal Algebra", materia:"Álgebra Lineal", content:"Serie de videos sobre álgebra lineal con visualizaciones increíbles.\n\n**Temas cubiertos:**\n- Espacios vectoriales\n- Transformaciones lineales\n- Autovalores y autovectores\n- Producto punto y cruz\n\n**Link:** 3blue1brown.com/series/essence-of-linear-algebra" },
    { id:"r-khan-calc", type:"recurso", title:"Khan Academy: Cálculo", materia:"Cálculo I", content:"Curso completo de cálculo con ejercicios interactivos.\n\n**Temas:**\n- Límites\n- Derivadas\n- Integrales\n- Series\n\n**Link:** khanacademy.org/math/calculus-1" },
    // Exámenes
    { x:"parcial-alg-2024", type:"examen", title:"Parcial Álgebra 2024", materia:"Álgebra Lineal", content:"## Parcial 1 - Álgebra Lineal (2024)\n\n**Ejercicio 1:** Calcular el determinante de una matriz 3x3.\n\n**Ejercicio 2:** Encontrar autovalores y autovectores de:\n$$A = \\begin{pmatrix} 3 & 1 \\\\ 0 & 2 \\end{pmatrix}$$\n\n**Ejercicio 3:** Determinar si la siguiente transformación es lineal:\n$$T(x, y) = (x + y, xy)$$" },
  ];

  n.forEach(item => {
    const id = item.id || item.x; // some use 'x' instead of 'id'
    KG.nodes.push({
      id: id,
      type: item.type,
      title: item.title,
      materia: item.materia || "",
      content: item.content || "",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    });
  });

  // Edges with labels
  const e = [
    // Materia → Conceptos
    { s:"m-alg", t:"c-matrices", label:"contiene" },
    { s:"m-alg", t:"c-determ", label:"contiene" },
    { s:"m-alg", t:"c-autoval", label:"contiene" },
    { s:"m-alg", t:"c-espvec", label:"contiene" },
    { s:"m-alg", t:"c-dialg", label:"contiene" },
    { s:"m-calc1", t:"c-deriv", label:"contiene" },
    { s:"m-calc1", t:"c-integ", label:"contiene" },
    { s:"m-fis1", t:"c-newton", label:"contiene" },
    { s:"m-fis1", t:"c-energia", label:"contiene" },
    { s:"m-prog", t:"c-oop", label:"contiene" },
    { s:"m-prog", t:"c-estruc", label:"contiene" },
    { s:"m-elec", t:"c-ohm", label:"contiene" },
    { s:"m-elec", t:"c-kirch", label:"contiene" },
    // Conceptos relacionados
    { s:"c-matrices", t:"c-determ", label:"relacionado" },
    { s:"c-determ", t:"c-autoval", label:"necesario para" },
    { s:"c-autoval", t:"c-dialg", label:"necesario para" },
    { s:"c-espvec", t:"c-autoval", label:"relacionado" },
    { s:"c-deriv", t:"c-integ", label:"inverso de" },
    { s:"c-newton", t:"c-energia", label:"relacionado" },
    { s:"c-oop", t:"c-estruc", label:"relacionado" },
    { s:"c-ohm", t:"c-kirch", label:"relacionado" },
    // Apuntes → Conceptos
    { s:"a-alg-autoval", t:"c-autoval", label:"describe" },
    { s:"a-calc-deriv", t:"c-deriv", label:"describe" },
    { s:"a-fis-newton", t:"c-newton", label:"describe" },
    // Ejercicios → Conceptos
    { s:"e-alg-det", t:"c-determ", label:"ejercicio de" },
    { s:"e-calc-deriv", t:"c-deriv", label:"ejercicio de" },
    { s:"e-fis-energia", t:"c-energia", label:"ejercicio de" },
    // Recursos → Materias
    { s:"r-3blue1brown", t:"m-alg", label:"recurso para" },
    { s:"r-khan-calc", t:"m-calc1", label:"recurso para" },
    // Exámenes → Materias
    { s:"parcial-alg-2024", t:"m-alg", label:"examen de" },
    // Materias relacionadas
    { s:"m-alg", t:"m-calc1", label:"base para" },
    { s:"m-fis1", t:"m-calc1", label:"requiere" },
  ];

  e.forEach(edge => {
    KG.edges.push({ id: "e_"+Date.now()+"_"+Math.random().toString(36).slice(2,6), source: edge.s, target: edge.t, label: edge.label || "" });
  });

  kgSave();
}

function kgNode(id) { return KG.nodes.find(n => n.id === id); }

function kgFiltered() {
  let nodes = [...KG.nodes];
  if (KG.filterType) nodes = nodes.filter(n => n.type === KG.filterType);
  if (KG.filterMateria) nodes = nodes.filter(n => n.materia === KG.filterMateria);
  if (KG.search) {
    const q = KG.search.toLowerCase();
    nodes = nodes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.materia.toLowerCase().includes(q));
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
    .kg-side { background:var(--bg-card); border-left:1px solid var(--border-color); overflow-y:auto; transition:width 0.2s; }
    .kg-side-header { padding:0.8rem; border-bottom:1px solid var(--border-color); }
    .kg-side-body { padding:0.8rem; }
    .kg-conn-item { padding:0.4rem 0.6rem; border:1px solid var(--border-color); border-radius:8px; margin-bottom:0.3rem; cursor:pointer; transition:all 0.15s; font-size:0.78rem; }
    .kg-conn-item:hover { border-color:#8b5cf6; background:rgba(139,92,246,0.05); }
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
  h = "<p>" + h + "</p>";
  return kgKatex(h);
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
    <div style="display:flex;height:calc(100vh - 100px);gap:0">
      <!-- Main graph area -->
      <div style="flex:1;display:flex;flex-direction:column;min-width:0">
        <div class="kg-bar" style="justify-content:space-between;padding:0.4rem 0.8rem;border-bottom:1px solid var(--border-color)">
          <h2 style="font-family:var(--font-heading);font-size:1rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><circle cx="12" cy="12" r="2.5"/><path d="M7.5 11l7-3.5M7.5 13l7 3.5"/></svg>
            Knowledge Graph
          </h2>
          <div style="display:flex;gap:0.3rem;align-items:center">
            <span style="font-size:0.6rem;color:var(--text-muted)">${filtered.length} nodos</span>
            <button class="kg-btn" onclick="kgResetView()" title="Centrar vista">⊙</button>
          </div>
        </div>

        <!-- Search -->
        <div style="padding:0.4rem 0.8rem;border-bottom:1px solid var(--border-color);display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap">
          <input id="kg-search" type="text" value="${KG.search}" placeholder="Buscar concepto..."
            style="flex:1;min-width:140px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.5rem;font-size:0.72rem;color:var(--text-primary);outline:none"
            oninput="KG.search=this.value;kgRender()">
          <select id="kg-type-filter" onchange="KG.filterType=this.value;kgRender()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.4rem;font-size:0.68rem;color:var(--text-primary);cursor:pointer">
            <option value="">Todos los tipos</option>
            ${allTypes.map(t => `<option value="${t}" ${KG.filterType===t?"selected":""}>${KG_TYPES[t].icon} ${KG_TYPES[t].label}</option>`).join("")}
          </select>
          <select id="kg-materia-filter" onchange="KG.filterMateria=this.value;kgRender()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.4rem;font-size:0.68rem;color:var(--text-primary);cursor:pointer">
            <option value="">Todas las materias</option>
            ${allMaterias.map(m => `<option value="${m}" ${KG.filterMateria===m?"selected":""}>${m}</option>`).join("")}
          </select>
        </div>

        <!-- Canvas -->
        <div style="flex:1;position:relative;background:var(--bg-card);overflow:hidden">
          <canvas id="kg-canvas" style="width:100%;height:100%;display:block;cursor:grab"></canvas>
          <div id="kg-tooltip" style="display:none;position:fixed;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.6rem 0.8rem;font-size:0.72rem;color:var(--text-primary);pointer-events:none;z-index:100;box-shadow:0 8px 24px rgba(0,0,0,0.2);max-width:280px"></div>
          <div style="position:absolute;bottom:8px;left:10px;font-size:0.6rem;color:var(--text-muted);opacity:0.5">Hover preview · Click panel · Drag mover · Scroll zoom</div>
          <div style="position:absolute;top:8px;right:10px;display:flex;gap:0.4rem">
            ${allTypes.map(t => {
              const count = KG.nodes.filter(n => n.type === t).length;
              return count > 0 ? `<span class="kg-type-badge" style="background:${KG_TYPES[t].color}18;color:${KG_TYPES[t].color};border:1px solid ${KG_TYPES[t].color}40">${KG_TYPES[t].icon} ${count}</span>` : "";
            }).join("")}
          </div>
        </div>
      </div>

      <!-- Side panel -->
      <div id="kg-side" class="kg-side" style="width:${KG.active?'380px':'0px'};${KG.active?'border-left:1px solid var(--border-color)':'border:none'}">
        ${KG.active ? kgRenderSidePanel() : ""}
      </div>
    </div>`;

  setTimeout(kgSetupCanvas, 30);
}

function kgRenderSidePanel() {
  const n = kgNode(KG.active);
  if (!n) return "";
  const conns = kgConnectedNodes(n.id);
  const typeInfo = KG_TYPES[n.type] || KG_TYPES.concepto;
  const incoming = KG.edges.filter(e => e.target === n.id);
  const outgoing = KG.edges.filter(e => e.source === n.id);

  return `
    <div class="kg-side-header">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
        <div style="display:flex;align-items:center;gap:0.4rem">
          <span style="font-size:1.4rem">${typeInfo.icon}</span>
          <div>
            <h3 style="font-size:0.95rem;font-weight:700;margin:0">${n.title}</h3>
            <span class="kg-type-badge" style="background:${typeInfo.color}18;color:${typeInfo.color};border:1px solid ${typeInfo.color}40;margin-top:0.15rem">${typeInfo.label}</span>
          </div>
        </div>
        <button class="kg-btn" onclick="KG.active=null;KG.view='graph';kgRender()" style="font-size:0.8rem">✕</button>
      </div>
      ${n.materia ? `<div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:0.2rem">📚 ${n.materia}</div>` : ""}
    </div>
    <div class="kg-side-body">
      <div style="margin-bottom:0.8rem">
        <div style="font-size:0.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.3rem">Contenido</div>
        <div class="kg-view" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem 0.8rem;max-height:300px;overflow-y:auto;font-size:0.82rem">
          ${kgMd(n.content)}
        </div>
      </div>

      ${conns.length > 0 ? `
      <div style="margin-bottom:0.8rem">
        <div style="font-size:0.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.3rem">Conexiones (${conns.length})</div>
        ${conns.map(c => {
          const ci = KG_TYPES[c.type] || KG_TYPES.concepto;
          const edge = KG.edges.find(e => (e.source===n.id&&e.target===c.id)||(e.source===c.id&&e.target===n.id));
          return `<div class="kg-conn-item" onclick="kgFocus('${c.id}')">
            <div style="display:flex;align-items:center;gap:0.3rem">
              <span style="font-size:0.9rem">${ci.icon}</span>
              <span style="font-weight:600;color:var(--text-primary)">${c.title}</span>
            </div>
            ${edge && edge.label ? `<div style="font-size:0.62rem;color:var(--text-muted);margin-top:0.1rem;font-style:italic">${edge.label}</div>` : ""}
          </div>`;
        }).join("")}
      </div>` : ""}

      ${incoming.length > 0 ? `
      <div style="margin-bottom:0.8rem">
        <div style="font-size:0.68rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.3rem">← Referenciado por (${incoming.length})</div>
        ${incoming.map(e => {
          const src = kgNode(e.source);
          if (!src) return "";
          const si = KG_TYPES[src.type] || KG_TYPES.concepto;
          return `<div class="kg-conn-item" onclick="kgFocus('${src.id}')">
            <span style="font-size:0.8rem">${si.icon}</span> ${src.title}
            ${e.label ? `<span style="font-size:0.6rem;color:var(--text-muted);font-style:italic"> — ${e.label}</span>` : ""}
          </div>`;
        }).join("")}
      </div>` : ""}

      <div style="display:flex;gap:0.3rem;flex-wrap:wrap">
        <button class="kg-btn" onclick="kgFocus('${n.id}')" title="Centrar en este nodo">⊙ Centrar</button>
        <button class="kg-btn" onclick="kgExplore('${n.id}')" title="Explorar conexiones">🔍 Explorar</button>
      </div>
    </div>`;
}

function kgRenderSide(el) {
  // Same as graph view but with side panel open
  KG.view = "graph";
  kgRender();
}

function kgSetupCanvas() {
  const canvas = document.getElementById("kg-canvas");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;

  const nodes = kgFiltered();
  if (!nodes.length) {
    ctx.fillStyle = "#6b7280"; ctx.font = "14px system-ui"; ctx.textAlign = "center";
    ctx.fillText("No hay nodos que mostrar", W/2, H/2);
    return;
  }

  // Position nodes with force simulation
  const positioned = nodes.map((n, i) => {
    const angle = i * 2 * Math.PI / nodes.length;
    const radius = 150 + Math.random() * 50;
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

  function draw() {
    KG.time += 0.015;
    ctx.clearRect(0,0,W,H);
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg-card").trim() || "#0d1117";
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

    // Subtle grid
    ctx.globalAlpha = 0.03;
    const gridSize = 30 * scale;
    const offsetX = (panX * scale + W/2) % gridSize;
    const offsetY = (panY * scale + H/2) % gridSize;
    ctx.fillStyle = "#8b5cf6";
    for (let x = offsetX; x < W; x += gridSize) for (let y = offsetY; y < H; y += gridSize) ctx.fillRect(x,y,1.5,1.5);
    ctx.globalAlpha = 1;

    // Edges
    visibleEdges.forEach(e => {
      const s = posMap[e.source], t = posMap[e.target];
      if (!s || !t) return;
      const ss = ts(s.x,s.y), tt = ts(t.x,t.y);
      const isH = hoverNode === s.id || hoverNode === t.id || KG.active === s.id || KG.active === t.id;

      // Edge line
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      const mx = (ss.x+tt.x)/2, my = (ss.y+tt.y)/2;
      ctx.lineTo(tt.x, tt.y);
      ctx.strokeStyle = isH ? "#8b5cf6" : "#555";
      ctx.lineWidth = isH ? 2 : 1;
      ctx.globalAlpha = isH ? 0.8 : 0.15;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Edge label
      if (e.label && scale > 0.5) {
        const lx = (ss.x+tt.x)/2, ly = (ss.y+tt.y)/2;
        ctx.font = "500 8px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isH ? "#8b5cf6" : "#666";
        ctx.globalAlpha = isH ? 0.9 : 0.4;
        ctx.fillText(e.label, lx, ly - 6);
        ctx.globalAlpha = 1;
      }
    });

    // Nodes
    positioned.forEach(n => {
      const s = ts(n.x, n.y);
      const typeInfo = KG_TYPES[n.type] || KG_TYPES.concepto;
      const isH = hoverNode === n.id;
      const isActive = KG.active === n.id;
      const r = n.r * scale;
      const pulse = Math.sin(KG.time + n.x * 0.01) * 1.5 * scale;

      // Outer glow
      if (isH || isActive) {
        ctx.beginPath(); ctx.arc(s.x, s.y, r + 14, 0, Math.PI*2);
        ctx.fillStyle = typeInfo.color + (isActive ? "20" : "12");
        ctx.fill();
      }

      // Shadow
      ctx.beginPath(); ctx.arc(s.x, s.y + 2, r, 0, Math.PI*2);
      ctx.fillStyle = "rgba(0,0,0,0.1)"; ctx.fill();

      // Main circle
      ctx.beginPath(); ctx.arc(s.x, s.y, r + (isH ? 3 : pulse), 0, Math.PI*2);
      const grad = ctx.createRadialGradient(s.x - r*0.3, s.y - r*0.3, 0, s.x, s.y, r);
      grad.addColorStop(0, typeInfo.color);
      grad.addColorStop(1, typeInfo.color + "bb");
      ctx.fillStyle = grad; ctx.fill();

      // Border
      ctx.beginPath(); ctx.arc(s.x, s.y, r + (isH ? 3 : pulse), 0, Math.PI*2);
      ctx.strokeStyle = isActive ? "#fff" : (isH ? "#fff" : "rgba(255,255,255,0.2)");
      ctx.lineWidth = isActive ? 2.5 : (isH ? 2 : 1.5);
      ctx.stroke();

      // Icon
      ctx.font = `${(isH ? 16 : 12) * Math.min(scale, 1.2)}px system-ui`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(typeInfo.icon, s.x, s.y);

      // Label
      if (scale > 0.4) {
        ctx.font = `${isH ? "600" : "500"} ${Math.max(8, 9 * Math.min(scale, 1.2))}px system-ui,sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = isH ? "#fff" : typeInfo.color;
        ctx.fillText(n.title, s.x, s.y + r + 5);
      }
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
          <div style="display:flex;align-items:center;gap:0.3rem;margin-bottom:0.25rem">
            <span style="font-size:1rem">${typeInfo.icon}</span>
            <span style="font-weight:700;font-size:0.82rem">${n.title}</span>
          </div>
          <span class="kg-type-badge" style="background:${typeInfo.color}18;color:${typeInfo.color};border:1px solid ${typeInfo.color}40;margin-bottom:0.3rem;display:inline-flex">${typeInfo.label}</span>
          ${n.materia ? `<div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:0.2rem">📚 ${n.materia}</div>` : ""}
          <div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:0.3rem;line-height:1.4">${preview}...</div>
          <div style="font-size:0.6rem;color:#8b5cf6">${conns.length > 0 ? "→ " + conns.slice(0,3).map(c=>c.title).join(", ") + (conns.length > 3 ? "..." : "") : ""}</div>
          <div style="font-size:0.58rem;color:#22c55e;margin-top:0.2rem">Click para ver detalle</div>`;
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
  // Focus and zoom to show connected nodes
  KG.active = id;
  KG.view = "graph";
  kgRender();
}

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
