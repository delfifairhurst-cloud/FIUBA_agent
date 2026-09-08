// knowledge-hub.js
const KH = { notes: [], active: null, view: 'graph', hover: null, search: '', filterTag: null, pinned: [], anim: null };

function khInit() {
  try { KH.notes = JSON.parse(localStorage.getItem('kh_notes') || '[]'); } catch { KH.notes = []; }
  try { KH.pinned = JSON.parse(localStorage.getItem('kh_pinned') || '[]'); } catch { KH.pinned = []; }
  if (KH.notes.length === 0) khCreateDefaults();
}

function khSave() {
  localStorage.setItem('kh_notes', JSON.stringify(KH.notes));
  localStorage.setItem('kh_pinned', JSON.stringify(KH.pinned));
}

function khCreateDefaults() {
  const d = [
    { t:'Cinemática', i:'🏃', tags:['mecánica'], c:'## Movimiento en 1D\n\n**Posición:** $x(t) = x_0 + v_0 t + \\frac{1}{2}at^2$\n\n**Velocidad:** $v(t) = v_0 + at$\n\n**Ecuación fundamental:** $v^2 = v_0^2 + 2a(x - x_0)$\n\n---\n\n### Casos especiales\n- **Caída libre:** $a = -g = -9.8 \\, m/s^2$\n- **Tiro oblicuo:** Separar en componentes $x$ e $y$\n\n### Ejemplo\nUn auto parte del reposo y acelera a $3 \\, m/s^2$. ¿Qué velocidad tiene a los 10s?\n\n$$v = 0 + 3 \\cdot 10 = 30 \\, m/s$$\n\n---\n\n**Vinculado a:** [[Dinámica]], [[Trabajo y Energía]], [[Leyes de Newton]]' },
    { t:'Dinámica', i:'💪', tags:['mecánica'], c:'## Newton y sus leyes\n\n### 1ª Ley — Inercia\nUn cuerpo permanece en reposo o movimiento rectilíneo uniforme si no hay fuerza neta.\n\n### 2ª Ley — Fuerza\n$$\\vec{F} = m \\vec{a}$$\n\nLa fuerza neta es igual a la masa por la aceleración.\n\n### 3ª Ley — Acción-Reacción\n$$\\vec{F}_{AB} = -\\vec{F}_{BA}$$\n\n---\n\n### Diagrama de Cuerpo Libre (DCL)\n1. Identificar el objeto\n2. Dibujar todas las fuerzas\n3. Elegir sistema de coordenadas\n4. Aplicar $\\sum F = ma$\n\n### Fuerzas comunes\n- Peso: $P = mg$ (hacia abajo)\n- Normal: perpendicular a la superficie\n- Fricción: $f = \\mu N$ (opuesta al movimiento)\n- Tensión: a lo largo de la cuerda\n- Resorte: $F = -kx$ (Ley de Hooke)\n\n---\n\n**Vinculado a:** [[Cinemática]], [[Trabajo y Energía]], [[Leyes de Newton]]' },
    { t:'Trabajo y Energía', i:'⚡', tags:['mecánica'], c:'## Trabajo\n$$W = \\vec{F} \\cdot \\vec{d} = Fd\\cos\\theta$$\n\nUnidades: Julios (J) = N·m\n\n---\n\n## Energía Cinética\n$$KE = \\frac{1}{2}mv^2$$\n\n## Energía Potencial\n- **Gravitatoria:** $U_g = mgh$\n- **Elástica:** $U_e = \\frac{1}{2}kx^2$\n\n## Teorema Trabajo-Energía\n$$W_{net} = \\Delta KE = KE_f - KE_i$$\n\n---\n\n## Conservación de la Energía\n$$KE_i + PE_i = KE_f + PE_f$$\n\n(Sin fuerzas disipativas)\n\n### Ejemplo\nUn bloque de 2 kg baja un plano sin fricción desde $h = 5m$. ¿Velocidad al fondo?\n\n$$mgh = \\frac{1}{2}mv^2 \\Rightarrow v = \\sqrt{2gh} = \\sqrt{2 \\cdot 9.8 \\cdot 5} = 9.9 \\, m/s$$\n\n---\n\n**Vinculado a:** [[Cinemática]], [[Dinámica]], [[Leyes de Newton]]' },
    { t:'Leyes de Newton', i:'🍎', tags:['mecánica'], c:'## Las tres leyes fundamentales\n\n### 1ª Ley — Inercia\n> Un cuerpo en reposo tiende a permanecer en reposo, y uno en movimiento rectilíneo uniforme tiende a seguir así, a menos que una fuerza externa neta actúe.\n\n### 2ª Ley — Fuerza\n$$\\vec{F}_{net} = m\\vec{a}$$\n\nConecta causa (fuerza) con efecto (aceleración).\n\n### 3ª Ley — Acción-Reacción\n> Por cada acción hay una reacción igual en magnitud y opuesta en dirección.\n\n$$\\vec{F}_{AB} = -\\vec{F}_{BA}$$\n\n---\n\n### Marco de referencia\nLas leyes solo funcionan en marcos **inerciales** (no acelerados).\n\n### Aplicaciones\n- Sistemas de poleas\n- Resortes en serie y paralelo\n- Fricción estática vs cinética\n\n---\n\n**Vinculado a:** [[Dinámica]], [[Trabajo y Energía]], [[Cinemática]]' },
    { t:'Termodinámica', i:'🔥', tags:['termodinámica'], c:'## Las 4 leyes\n\n**Ley 0:** Equilibrio térmico es transitivo.\n**Ley 1:** $\\Delta U = Q - W$ (conservación de energía)\n**Ley 2:** $\\Delta S \\geq 0$ en sistema aislado\n**Ley 3:** $S \\to 0$ cuando $T \\to 0K$\n\n---\n\n## Procesos termodinámicos\n\n| Proceso | Condición |\n|---------|----------|\n| Isocórico | $V = \\text{cte}$ |\n| Isobárico | $P = \\text{cte}$ |\n| Isotérmico | $T = \\text{cte}$ |\n| Adiabático | $Q = 0$ |\n\n## Calor y Trabajo\n$$Q = mc\\Delta T$$\n$$W = P\\Delta V$$\n\n---\n\n**Vinculado a:** [[Leyes de Newton]], [[Trabajo y Energía]]' },
    { t:'Cálculo I', i:'📐', tags:['matemática'], c:'## Límites\n$$\\lim_{x \\to a} f(x) = L$$\n\n## Derivada\n$$f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\n### Reglas de derivación\n- **Potencia:** $\\frac{d}{dx}x^n = nx^{n-1}$\n- **Producto:** $(fg)\' = f\'g + fg\'$\n- **Cociente:** $(f/g)\' = (f\'g - fg\')/g^2$\n- **Cadena:** $[f(g(x))]\' = f\'(g(x)) \\cdot g\'(x)$\n\n### Derivadas comunes\n| Función | Derivada |\n|---------|----------|\n| $\\sin x$ | $\\cos x$ |\n| $\\cos x$ | $-\\sin x$ |\n| $e^x$ | $e^x$ |\n| $\\ln x$ | $1/x$ |\n\n---\n\n**Vinculado a:** [[Cálculo II]], [[Álgebra Lineal]], [[Ecuaciones Diferenciales]]' },
    { t:'Cálculo II', i:'📏', tags:['matemática'], c:'## Integrales\n$$\\int_a^b f(x)\\,dx = F(b) - F(a)$$\n\n### Técnicas\n- **Sustitución:** $\\int f(g(x))g\'(x)dx = \\int f(u)du$\n- **Partes:** $\\int u\\,dv = uv - \\int v\\,du$\n- **Fracciones parciales:** para racionales\n\n### Integrales comunes\n$$\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$$\n$$\\int e^x dx = e^x + C$$\n$$\\int \\frac{1}{x} dx = \\ln|x| + C$$\n\n---\n\n## Series\n- **Geométrica:** $\\sum_{n=0}^{\\infty} ar^n = \\frac{a}{1-r}$ si $|r| < 1$\n- **Taylor:** $f(x) = \\sum \\frac{f^{(n)}(a)}{n!}(x-a)^n$\n\n---\n\n**Vinculado a:** [[Cálculo I]], [[Ecuaciones Diferenciales]]' },
    { t:'Álgebra Lineal', i:'🔢', tags:['matemática'], c:'## Vectores\n$$\\vec{v} = \\begin{pmatrix} v_1 \\\\ v_2 \\\\ v_3 \\end{pmatrix}$$\n\n**Producto punto:** $\\vec{a} \\cdot \\vec{b} = |a||b|\\cos\\theta$\n**Producto cruz:** $|\\vec{a} \\times \\vec{b}| = |a||b|\\sin\\theta$\n\n---\n\n## Matrices\n\n**Determinante 2x2:** $\\det(A) = ad - bc$\n\n**Inversa:** $A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)$\n\n**Autovalores:** $\\det(A - \\lambda I) = 0$\n\n---\n\n## Aplicaciones\n- Sistemas de ecuaciones\n- Transformaciones lineales\n- Espacios vectoriales\n- PCA (análisis de componentes principales)\n\n**Vinculado a:** [[Cálculo I]], [[Inteligencia Artificial]], ['Mecánica Cuántica']' },
    { t:'Estructuras de Datos', i:'🏗️', tags:['computación'], c:'## Tipos de datos\n\n### Lineales\n- **Array:** acceso O(1), inserción O(n)\n- **Linked List:** inserción O(1), acceso O(n)\n- **Stack:** LIFO — push/pop O(1)\n- **Queue:** FIFO — enqueue/dequeue O(1)\n\n### No lineales\n- **Árbol BST:** búsqueda O(log n)\n- **Heap:** min/max O(1), insert O(log n)\n- **Grafo:** representación con adjacency list/matrix\n\n---\n\n## complejidad\n$$O(1) < O(\\log n) < O(n) < O(n \\log n) < O(n^2) < O(2^n)$$\n\n### Ejemplo\n- Buscar en array ordenado: $O(\\log n)$ con binary search\n- Merge sort: $O(n \\log n)$\n- Selection sort: $O(n^2)$\n\n---\n\n**Vinculado a:** [[Algoritmos]], ['Programación'], ['Inteligencia Artificial']' },
    { t:'Algoritmos', i:'🧮', tags:['computación'], c:'## Paradigmas\n\n### Divide y Vencerás\nDividir problema en subproblemas más chicos.\n- Merge Sort: $O(n \\log n)$\n- Quick Sort: $O(n \\log n)$ promedio\n- Binary Search: $O(\\log n)$\n\n### Programación Dinámica\nResolver subproblemas overlap y guardar resultados.\n- Fibonacci: $O(n)$ con memoización\n- Knapsack: $O(nW)$\n\n### Voraz (Greedy)\nTomar la mejor opción local en cada paso.\n- Dijkstra: caminos mínimos\n- Kruskal: MST\n\n---\n\n## Grafos\n- **BFS:** por niveles, caminos mínimos no ponderados\n- **DFS:** por profundidad, detección de ciclos\n- **Dijkstra:** caminos mínimos ponderados\n\n---\n\n**Vinculado a:** [[Estructuras de Datos]], ['Programación']' },
    { t:'Circuitos Eléctricos', i:'⚙️', tags:['ingeniería'], c:'## Ley de Ohm\n$$V = IR$$\n\n## Leyes de Kirchhoff\n**KCL (Corrientes):** $\\sum I_{entran} = \\sum I_{salen}$\n**KVL (Voltajes):** $\\sum V_{malla} = 0$\n\n---\n\n## Circuitos\n\n### Serie\n$$R_{eq} = R_1 + R_2 + \\cdots$$\n$I$ = misma en todos, $V$ se divide.\n\n### Paralelo\n$$\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\cdots$$\n$V$ = mismo en todos, $I$ se divide.\n\n---\n\n## RC Circuit\n$$\\tau = RC$$\n$$V(t) = V_0 e^{-t/\\tau}$$\n\n## RL Circuit\n$$\\tau = L/R$$\n$$I(t) = I_0(1 - e^{-t/\\tau})$$\n\n---\n\n**Vinculado a:** [[Ley de Ohm]], ['Electrónica']' },
    { t:'Electrónica', i:'🔌', tags:['ingeniería'], c:'## Semiconductores\n- **Diodo:** Conduce en una dirección\n- **Transistor BJT:** $I_C = \\beta I_B$\n- **Transistor MOSFET:** Controlado por voltaje\n\n---\n\n## Amplificadores\n- **Inversor:** $V_{out} = -\\frac{R_f}{R_{in}} V_{in}$\n- **No inversor:** $V_{out} = (1 + \\frac{R_f}{R_{in}}) V_{in}$\n- **Sumador:** $V_{out} = -(\\frac{R_f}{R_1}V_1 + \\frac{R_f}{R_2}V_2)$\n\n---\n\n## Filtros\n- **Pasa bajos:** $f_c = \\frac{1}{2\\pi RC}$\n- **Pasa altos:** $f_c = \\frac{1}{2\\pi RC}$\n- **Pasa banda:** Combinación de ambos\n\n---\n\n**Vinculado a:** [[Circuitos Eléctricos]], ['Señales y Sistemas']' },
    { t:'Señales y Sistemas', i:'📡', tags:['ingeniería'], c:'## Señales\n- **Continua:** $x(t)$ — tiempo real\n- **Discreta:** $x[n]$ — muestreadas\n\n## Transformadas\n\n### Fourier\n$$X(\\omega) = \\int_{-\\infty}^{\\infty} x(t)e^{-j\\omega t}dt$$\n\n### Laplace\n$$X(s) = \\int_0^{\\infty} x(t)e^{-st}dt$$\n\n### Z (discreta)\n$$X(z) = \\sum_{n=-\\infty}^{\\infty} x[n]z^{-n}$$\n\n---\n\n## Sistemas\n- **Lineal:** Superposición\n- **Invariante en el tiempo:** Shift-invariant\n- **Estable:** Polos en semiplano izquierdo\n\n---\n\n**Vinculado a:** [[Electrónica]], ['Cálculo II']' },
    { t:'Inteligencia Artificial', i:'🧠', tags:['ia'], c:'## Machine Learning\n\n### Supervisado\n- Regresión lineal: $y = wx + b$\n- Regresión logística: clasificación binaria\n- SVM: hiperplano de máxima separación\n- Random Forest: ensemble de árboles\n\n### No supervisado\n- K-Means: clustering\n- PCA: reducción de dimensionalidad\n\n---\n\n## Deep Learning\n\n### Red Neuronal\n$$y = f\\left(\\sum_{i=1}^{n} w_i x_i + b\\right)$$\n\n### Backpropagation\n$$w_{nuevo} = w_{viejo} - \\eta \\frac{\\partial L}{\\partial w}$$\n\n### Arquitecturas\n- **CNN:** para imágenes\n- **RNN/LSTM:** para secuencias\n- **Transformer:** para NLP (GPT, BERT)\n\n---\n\n**Vinculado a:** [[Álgebra Lineal]], ['Programación']' },
    { t:'Programación', i:'💻', tags:['computación'], c:'## Paradigmas\n\n### Imperativo\n```python\nfor i in range(10):\n    print(i)\n```\n\n### Funcional\n```python\nnums = [1,2,3,4,5]\nresult = list(map(lambda x: x**2, nums))\n```\n\n### OOP\n```python\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        pass\n```\n\n---\n\n## Complejidad\n$$O(1) < O(\\log n) < O(n) < O(n^2) < O(2^n)$$\n\n## Buenas prácticas\n- Nombres descriptivos\n- Funciones cortas y puras\n- DRY (Don\'t Repeat Yourself)\n- Tests unitarios\n\n---\n\n**Vinculado a:** [[Algoritmos]], ['Estructuras de Datos']' },
    { t:'Resistencia de Materiales', i:'🔨', tags:['ingeniería'], c:'## Esfuerzos\n\n### Normal\n$$\\sigma = \\frac{F}{A}$$\n\n### Cortante\n$$\\tau = \\frac{V}{A}$$\n\n### Flexión\n$$\\sigma = \\frac{My}{I}$$\n\nDonde $M$ = momento flector, $y$ = distancia al eje neutro, $I$ = momento de inercia.\n\n---\n\n## Deformación\n**Ley de Hooke:** $\\sigma = E\\varepsilon$\n\n**Módulo de Young:** Resistencia a la deformación elástica.\n\n---\n\n## Criterios de falla\n- **Tresca:** $\\tau_{max} = \\frac{\\sigma_y}{2}$\n- **Von Mises:** Más preciso para ductiles\n\n---\n\n**Vinculado a:** ['Dinámica'], ['Estructuras']' },
    { t:'Probabilidad', i:'📊', tags:['matemática'], c:'## Fundamentos\n$$P(A) \\in [0, 1], \\quad P(\\Omega) = 1$$\n\n**Regla de la suma:** $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$\n\n**Bayes:** $P(A|B) = \\frac{P(B|A)P(A)}{P(B)}$\n\n---\n\n## Distribuciones\n\n| Distribución | Uso |\n|-------------|-----|\n| Normal | $N(\\mu, \\sigma^2)$ — natural |\n| Binomial | $B(n,p)$ — éxitos/fracasos |\n| Poisson | $P(\\lambda)$ — eventos/rato |\n| Uniforme | Todos los valores igual probable |\n\n## Estadística\n- **Media:** $\\bar{x} = \\frac{1}{n}\\sum x_i$\n- **Varianza:** $s^2 = \\frac{1}{n-1}\\sum(x_i - \\bar{x})^2$\n- **Desvío estándar:** $s = \\sqrt{s^2}$\n\n---\n\n**Vinculado a:** ['Inteligencia Artificial'], ['Cálculo I']' },
  ];
  d.forEach(n => {
    KH.notes.push({
      id: 'n_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      title: n.t, content: n.c, tags: n.tags, icon: n.i,
      created: new Date().toISOString(), updated: new Date().toISOString()
    });
  });
  khSave();
}

function khLinks(c) { const r=/\[\[([^\]]+)\]\]/g,l=[];let m;while((m=r.exec(c))!==null)l.push(m[1]);return l; }

function khFiltered() {
  let n = [...KH.notes];
  if (KH.filterTag) n = n.filter(x => (x.tags||[]).includes(KH.filterTag));
  if (KH.search) { const q = KH.search.toLowerCase(); n = n.filter(x => x.title.toLowerCase().includes(q) || x.content.toLowerCase().includes(q)); }
  return n;
}

function khGraph() {
  const nodes=[], edges=[], map={};
  khFiltered().forEach(n => {
    map[n.title.toLowerCase()] = n.id;
    const bk = KH.notes.filter(x => khLinks(x.content).some(l => l.toLowerCase() === n.title.toLowerCase())).length;
    nodes.push({ id:n.id, title:n.title, tags:n.tags, icon:n.icon, conn: khLinks(n.content).length + bk });
  });
  khFiltered().forEach(n => {
    khLinks(n.content).forEach(l => {
      const tid = map[l.toLowerCase()];
      if (tid && tid !== n.id) edges.push({ s:n.id, t:tid });
    });
  });
  return { nodes, edges };
}

function khKatex(html) {
  if (typeof katex === 'undefined') return html;
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => { try { return katex.renderToString(t.trim(), {displayMode:true,throwOnError:false}); } catch { return '[math]'; } });
  html = html.replace(/\$([^\$\n]+?)\$/g, (_, t) => { try { return katex.renderToString(t.trim(), {displayMode:false,throwOnError:false}); } catch { return '[math]'; } });
  return html;
}

function khMd(text) {
  if (!text) return '<p style="color:var(--text-muted);font-style:italic">Escribí algo...</p>';
  let h = text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\[\[([^\]]+)\]\]/g,'<a class="kh-link" onclick="khOpenByTitle(\'$1\')">$1</a>')
    .replace(/^---$/gm,'<hr>')
    .replace(/^#### (.+)$/gm,'<h4>$1</h4>')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm,'<li class="kh-ord">$2</li>')
    .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>')
    .replace(/\n\n/g,'</p><p>')
    .replace(/\n/g,'<br>');
  h = h.replace(/(<li[^>]*>.*?<\/li>)(?:<br>)?/g,'$1');
  h = h.replace(/((?:<li[^>]*>.*?<\/li>\s*)+)/g,'<ul>$1</ul>');
  h = '<p>' + h + '</p>';
  h = h.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '<pre><code>$1</code></pre>');
  return khKatex(h);
}

function khStyles() {
  if (document.getElementById('kh-css')) return;
  const s = document.createElement('style');
  s.id = 'kh-css';
  s.textContent = `
    .kh-view { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:var(--text-primary); line-height:1.7; font-size:0.88rem; }
    .kh-view h1 { font-size:1.5rem; font-weight:700; margin:0 0 0.8rem; border-bottom:2px solid var(--accent); padding-bottom:0.4rem; }
    .kh-view h2 { font-size:1.2rem; font-weight:700; margin:1.2rem 0 0.5rem; border-bottom:1px solid var(--border-color); padding-bottom:0.3rem; }
    .kh-view h3 { font-size:1rem; font-weight:600; margin:1rem 0 0.4rem; }
    .kh-view h4 { font-size:0.88rem; font-weight:600; color:var(--text-muted); margin:0.8rem 0 0.3rem; }
    .kh-view p { margin:0 0 0.6rem; }
    .kh-view strong { font-weight:600; }
    .kh-view em { color:var(--text-muted); }
    .kh-view code { background:var(--bg-secondary); padding:0.15rem 0.4rem; border-radius:4px; font-size:0.82em; font-family:'JetBrains Mono',monospace; color:var(--accent); }
    .kh-view pre { background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px; padding:0.8rem; overflow-x:auto; margin:0.6rem 0; }
    .kh-view pre code { background:none; padding:0; color:var(--text-primary); }
    .kh-view hr { border:none; border-top:1px solid var(--border-color); margin:1.2rem 0; }
    .kh-view blockquote { border-left:3px solid var(--accent); padding:0.4rem 0.8rem; margin:0.6rem 0; background:var(--bg-secondary); border-radius:0 6px 6px 0; color:var(--text-muted); font-style:italic; }
    .kh-view ul { padding-left:1.5rem; margin:0.4rem 0; }
    .kh-view li { margin:0.2rem 0; }
    .kh-view li::marker { color:var(--accent); }
    .kh-view table { border-collapse:collapse; margin:0.6rem 0; font-size:0.82rem; width:100%; }
    .kh-view th, .kh-view td { border:1px solid var(--border-color); padding:0.3rem 0.6rem; text-align:left; }
    .kh-view th { background:var(--bg-secondary); font-weight:600; }
    .kh-link { color:#8b5cf6; cursor:pointer; border-bottom:1px dashed #8b5cf660; text-decoration:none; font-weight:500; }
    .kh-link:hover { color:#a78bfa; background:#8b5cf610; border-radius:2px; }
    .kh-view .katex { font-size:1.05em; }
    .kh-view .katex-display { margin:0.8rem 0; padding:0.6rem; background:var(--bg-secondary); border-radius:8px; border:1px solid var(--border-color); overflow-x:auto; }
    .kh-bar { display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap; margin-bottom:0.5rem; }
    .kh-btn { background:var(--bg-secondary); color:var(--text-muted); border:1px solid var(--border-color); border-radius:6px; padding:0.3rem 0.6rem; cursor:pointer; font-size:0.72rem; transition:all 0.15s; }
    .kh-btn:hover { border-color:var(--accent); color:var(--text-primary); }
    .kh-btn.active { background:#8b5cf618; color:#8b5cf6; border-color:#8b5cf640; }
    .kh-btn-primary { background:var(--accent); color:white; border:none; font-weight:600; }
    .kh-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:10px; padding:0.7rem; cursor:pointer; transition:all 0.15s; }
    .kh-card:hover { border-color:var(--accent); transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.08); }
  `;
  document.head.appendChild(s);
}

// ─── RENDER ───
function khRender() {
  const el = document.getElementById('tech-tree-content');
  if (!el) return;
  khInit(); khStyles();
  if (KH.anim) { cancelAnimationFrame(KH.anim); KH.anim = null; }
  if (KH.view === 'editor' && KH.active) { khEditor(el); return; }
  if (KH.view === 'list') { khList(el); return; }
  khGraphView(el);
}

function khGraphView(el) {
  const g = khGraph();
  const tags = [...new Set(KH.notes.flatMap(n => n.tags||[]))];
  el.innerHTML = `
    <div class="kh-bar" style="justify-content:space-between">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0">🧠 Knowledge Hub</h2>
      <div style="display:flex;gap:0.3rem">
        <button class="kh-btn active" onclick="KH.view='graph';khRender()">Red</button>
        <button class="kh-btn" onclick="KH.view='list';khRender()">Notas</button>
        <button class="kh-btn kh-btn-primary" onclick="khNew()">+ Nota</button>
      </div>
    </div>
    <div class="kh-bar">
      <input id="kh-s" type="text" value="${KH.search}" placeholder="Buscar..."
        style="flex:1;min-width:120px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.35rem 0.6rem;font-size:0.72rem;color:var(--text-primary);outline:none"
        oninput="KH.search=this.value;khRender()">
      ${tags.map(t=>`<button class="kh-btn ${KH.filterTag===t?'active':''}" onclick="KH.filterTag='${KH.filterTag===t?'':t}';khRender()">#${t}</button>`).join('')}
    </div>
    <div style="position:relative;background:var(--bg-card);border:1.5px solid var(--border-color);border-radius:12px;overflow:hidden">
      <canvas id="kh-c" style="width:100%;height:520px;display:block;cursor:grab"></canvas>
      <div id="kh-tt" style="display:none;position:fixed;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.6rem 0.8rem;font-size:0.72rem;color:var(--text-primary);pointer-events:none;z-index:100;box-shadow:0 8px 24px rgba(0,0,0,0.2);max-width:280px"></div>
      <div style="position:absolute;bottom:8px;left:10px;font-size:0.6rem;color:var(--text-muted);opacity:0.5">Hover · Click abrir · Drag · Scroll zoom</div>
      <div style="position:absolute;top:8px;right:10px;font-size:0.6rem;color:var(--text-muted)">${KH.notes.length} skills · ${g.edges.length} conexiones</div>
    </div>`;
  setTimeout(khCanvas, 30);
}

function khCanvas() {
  const c = document.getElementById('kh-c');
  if (!c) return;
  const rect = c.getBoundingClientRect(), dpr = window.devicePixelRatio||1;
  c.width = rect.width*dpr; c.height = rect.height*dpr;
  const ctx = c.getContext('2d'); ctx.scale(dpr,dpr);
  const W = rect.width, H = rect.height;
  const g = khGraph();
  if (!g.nodes.length) { ctx.fillStyle='#6b7280';ctx.font='14px system-ui';ctx.textAlign='center';ctx.fillText('Sin notas',W/2,H/2);return; }

  const nodes = g.nodes.map((n,i) => ({
    ...n, x: W/2+Math.cos(i*2*Math.PI/g.nodes.length)*150, y: H/2+Math.sin(i*2*Math.PI/g.nodes.length)*150, vx:0, vy:0
  }));
  const nm = {}; nodes.forEach(n=>{nm[n.id]=n;});
  const edges = g.edges.map(e=>({s:nm[e.s],t:nm[e.t]})).filter(e=>e.s&&e.t);

  for(let i=0;i<400;i++){
    for(let a=0;a<nodes.length;a++) for(let b=a+1;b<nodes.length;b++){
      let dx=nodes[b].x-nodes[a].x,dy=nodes[b].y-nodes[a].y,d=Math.sqrt(dx*dx+dy*dy)||1,f=5000/(d*d);
      nodes[a].vx-=(dx/d)*f;nodes[a].vy-=(dy/d)*f;nodes[b].vx+=(dx/d)*f;nodes[b].vy+=(dy/d)*f;
    }
    edges.forEach(e=>{let dx=e.t.x-e.s.x,dy=e.t.y-e.s.y,d=Math.sqrt(dx*dx+dy*dy)||1,f=0.006*(d-130);e.s.vx+=(dx/d)*f;e.s.vy+=(dy/d)*f;e.t.vx-=(dx/d)*f;e.t.vy-=(dy/d)*f;});
    nodes.forEach(n=>{n.vx+=(W/2-n.x)*0.001;n.vy+=(H/2-n.y)*0.001;n.vx*=0.88;n.vy*=0.88;n.x+=n.vx;n.y+=n.vy;n.x=Math.max(40,Math.min(W-40,n.x));n.y=Math.max(40,Math.min(H-40,n.y));});
  }

  const cc={'mecánica':'#8b5cf6','termodinámica':'#ef4444','matemática':'#3b82f6','computación':'#22c55e','ingeniería':'#f59e0b','ia':'#ec4899','electricidad':'#f59e0b','default':'#6b7280'};
  function gc(n){for(const t of(n.tags||[]))if(cc[t])return cc[t];return cc.default;}

  let scale=1,px=0,py=0,drag=null,pan=false,lm=null,t=0;
  function ts(x,y){return{x:(x+px)*scale+W/2,y:(y+py)*scale+H/2};}
  function tw(sx,sy){return{x:(sx-W/2)/scale-px,y:(sy-H/2)/scale-py};}

  function draw(){
    t+=0.02; ctx.clearRect(0,0,W,H);
    const bg=getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim()||'#0d1117';
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=0.04;
    for(let x=0;x<W;x+=24)for(let y=0;y<H;y+=24){ctx.fillStyle=`rgba(139,92,246,${0.3+Math.sin(t+x*0.01+y*0.01)*0.3})`;ctx.fillRect(x,y,1.5,1.5);}
    ctx.globalAlpha=1;

    edges.forEach(e=>{
      const s=ts(e.s.x,e.s.y),tt=ts(e.t.x,e.t.y),isH=KH.hover===e.s.id||KH.hover===e.t.id,c=gc(e.s);
      ctx.beginPath();ctx.moveTo(s.x,s.y);const mx=(s.x+tt.x)/2,my=(s.y+tt.y)/2-15;ctx.quadraticCurveTo(mx,my,tt.x,tt.y);
      ctx.strokeStyle=isH?c:'#555';ctx.lineWidth=isH?2.5:1;ctx.globalAlpha=isH?0.9:0.15;ctx.stroke();ctx.globalAlpha=1;
      if(isH){const pt=(t*2)%1,px=s.x+(tt.x-s.x)*pt,py=s.y+(tt.y-s.y)*pt-Math.sin(pt*Math.PI)*20;ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();}
    });

    nodes.forEach(n=>{
      const s=ts(n.x,n.y),c=gc(n),isH=KH.hover===n.id,isP=KH.pinned.includes(n.id);
      const br=12+Math.min(n.conn,4)*3,pu=Math.sin(t+n.x*0.01)*1.5,r=isH?br+6:br+pu;
      ctx.beginPath();ctx.arc(s.x,s.y,r+12,0,Math.PI*2);ctx.fillStyle=c+(isH?'18':'08');ctx.fill();
      const gw=ctx.createRadialGradient(s.x,s.y,r*0.5,s.x,s.y,r+8);gw.addColorStop(0,c+'30');gw.addColorStop(1,c+'00');
      ctx.beginPath();ctx.arc(s.x,s.y,r+8,0,Math.PI*2);ctx.fillStyle=gw;ctx.fill();
      ctx.beginPath();ctx.arc(s.x,s.y+3,r,0,Math.PI*2);ctx.fillStyle='rgba(0,0,0,0.12)';ctx.fill();
      ctx.beginPath();ctx.arc(s.x,s.y,r,0,Math.PI*2);
      const gr=ctx.createRadialGradient(s.x-r*0.3,s.y-r*0.3,0,s.x,s.y,r);gr.addColorStop(0,c);gr.addColorStop(1,c+'cc');
      ctx.fillStyle=gr;ctx.fill();
      ctx.beginPath();ctx.arc(s.x,s.y,r,0,Math.PI*2);ctx.strokeStyle=isH?'#fff':'rgba(255,255,255,0.2)';ctx.lineWidth=isH?2.5:1.5;ctx.stroke();
      ctx.font=`${isH?18:14}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n.icon||'📝',s.x,s.y);
      ctx.font=`${isH?'600 11px':'500 9px'} system-ui,sans-serif`;ctx.textBaseline='top';ctx.fillStyle=isH?'#fff':c;ctx.fillText(n.title,s.x,s.y+r+6);
      if(isP){ctx.font='9px system-ui';ctx.fillText('📌',s.x+r-2,s.y-r+2);}
    });

    KH.anim=requestAnimationFrame(draw);
  }
  draw();

  c.onmousemove=e=>{
    const w=tw(e.offsetX,e.offsetY);let f=null;
    nodes.forEach(n=>{if(Math.sqrt((n.x-w.x)**2+(n.y-w.y)**2)<25)f=n.id;});
    KH.hover=f;c.style.cursor=f?'pointer':(drag?'grabbing':'grab');
    const tt=document.getElementById('kh-tt');
    if(tt&&f){const n=KH.notes.find(x=>x.id===f);if(n){
      const lk=khLinks(n.content),bl=KH.notes.filter(x=>khLinks(x.content).some(l=>l.toLowerCase()===n.title.toLowerCase()));
      const pv=n.content.replace(/\[\[([^\]]+)\]\]/g,'$1').replace(/[#*_`$]/g,'').replace(/\n/g,' ').slice(0,150);
      tt.style.display='block';tt.style.left=(e.clientX+16)+'px';tt.style.top=(e.clientY-12)+'px';
      tt.innerHTML=`<div style="font-weight:700;font-size:0.82rem;margin-bottom:0.25rem">${n.icon} ${n.title}</div><div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:0.3rem;line-height:1.4">${pv}...</div><div style="font-size:0.6rem;color:#8b5cf6">${lk.length>0?'→ '+lk.slice(0,3).join(', '):''} ${bl.length>0?'← '+bl.length+' backlinks':''}</div><div style="font-size:0.58rem;color:#22c55e;margin-top:0.2rem">Click para abrir</div>`;
    }}else if(tt)tt.style.display='none';
    if(drag){drag.x=w.x;drag.y=w.y;}else if(pan&&lm){px+=(e.offsetX-lm.x)/scale;py+=(e.offsetY-lm.y)/scale;lm={x:e.offsetX,y:e.offsetY};}
  };
  c.onmousedown=e=>{const w=tw(e.offsetX,e.offsetY);const n=nodes.find(x=>Math.sqrt((x.x-w.x)**2+(x.y-w.y)**2)<25);if(n){drag=n;c.style.cursor='grabbing';}else{pan=true;lm={x:e.offsetX,y:e.offsetY};c.style.cursor='grabbing';}};
  c.onmouseup=e=>{if(drag)khOpen(drag.id);drag=null;pan=false;lm=null;c.style.cursor=KH.hover?'pointer':'grab';};
  c.onmouseleave=()=>{KH.hover=null;drag=null;pan=false;const t=document.getElementById('kh-tt');if(t)t.style.display='none';};
  c.onwheel=e=>{e.preventDefault();scale=Math.max(0.3,Math.min(3,scale*(e.deltaY<0?1.08:0.92)));};
}

function khList(el) {
  const notes = khFiltered().sort((a,b)=>new Date(b.updated)-new Date(a.updated));
  const tags = [...new Set(KH.notes.flatMap(n=>n.tags||[]))];
  el.innerHTML = `
    <div class="kh-bar" style="justify-content:space-between">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0">📝 Notas</h2>
      <div style="display:flex;gap:0.3rem">
        <button class="kh-btn" onclick="KH.view='graph';khRender()">Red</button>
        <button class="kh-btn active" onclick="KH.view='list';khRender()">Notas</button>
        <button class="kh-btn kh-btn-primary" onclick="khNew()">+ Nota</button>
      </div>
    </div>
    <div class="kh-bar">
      <input id="kh-s" type="text" value="${KH.search}" placeholder="Buscar..."
        style="flex:1;min-width:120px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.35rem 0.6rem;font-size:0.72rem;color:var(--text-primary);outline:none"
        oninput="KH.search=this.value;khRender()">
      ${tags.map(t=>`<button class="kh-btn ${KH.filterTag===t?'active':''}" onclick="KH.filterTag='${KH.filterTag===t?'':t}';khRender()">#${t}</button>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.5rem">
      ${notes.map(n=>{
        const lk=khLinks(n.content);
        const pv=n.content.replace(/\[\[([^\]]+)\]\]/g,'$1').replace(/[#*_`$]/g,'').replace(/\n/g,' ').slice(0,100);
        return `<div class="kh-card" onclick="khOpen('${n.id}')">
          <div style="font-size:1.3rem;margin-bottom:0.3rem">${n.icon}</div>
          <h3 style="font-size:0.82rem;font-weight:700;margin:0 0 0.2rem">${n.title}</h3>
          <p style="font-size:0.68rem;color:var(--text-muted);margin:0 0 0.3rem;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${pv}</p>
          <div style="display:flex;gap:0.3rem;flex-wrap:wrap;align-items:center">
            ${(n.tags||[]).slice(0,3).map(t=>`<span style="font-size:0.55rem;background:var(--bg-secondary);color:var(--text-muted);padding:0.08rem 0.3rem;border-radius:8px">#${t}</span>`).join('')}
            ${lk.length>0?`<span style="font-size:0.55rem;color:#8b5cf6">→ ${lk.length}</span>`:''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function khEditor(el) {
  const n = KH.notes.find(x=>x.id===KH.active);
  if(!n){KH.view='graph';khRender();return;}
  const lk=khLinks(n.content);
  const bl=KH.notes.filter(x=>x.id!==n.id&&khLinks(x.content).some(l=>l.toLowerCase()===n.title.toLowerCase()));

  el.innerHTML = `
    <div class="kh-bar" style="justify-content:space-between">
      <div style="display:flex;gap:0.3rem">
        <button class="kh-btn" onclick="khBack()">← Volver</button>
        <button class="kh-btn" onclick="khPin('${n.id}')" style="${KH.pinned.includes(n.id)?'color:#f59e0b;border-color:#f59e0b40':''}">${KH.pinned.includes(n.id)?'📌 Fijada':'📌 Fijar'}</button>
      </div>
      <button class="kh-btn" onclick="khDel('${n.id}')" style="color:#ef4444;border-color:#ef444430">Eliminar</button>
    </div>
    <div style="display:flex;gap:0.8rem;flex-wrap:wrap">
      <div style="flex:2;min-width:300px">
        <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem">
          <select id="kh-i" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem;font-size:1.1rem;cursor:pointer;color:var(--text-primary)">
            ${['📝','📐','📊','🔬','💻','⚙️','📚','🧪','💡','🎯','🍎','⚡','🔌','🔥','🏗️','🧠','🧬','📡','🔢','📈','🔨'].map(i=>`<option value="${i}" ${n.icon===i?'selected':''}>${i}</option>`).join('')}
          </select>
          <input id="kh-t" value="${n.title.replace(/"/g,'&quot;')}" placeholder="Título..."
            style="flex:1;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.45rem 0.7rem;font-size:1.05rem;font-weight:700;color:var(--text-primary);outline:none;font-family:var(--font-heading)"
            onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">
        </div>
        <div style="display:flex;gap:0.4rem;margin-bottom:0.5rem;align-items:center;flex-wrap:wrap">
          <span style="font-size:0.68rem;color:var(--text-muted)">Tags:</span>
          <input id="kh-tg" value="${(n.tags||[]).join(', ')}" placeholder="mecánica, cálculo, ..."
            style="flex:1;min-width:120px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.5rem;font-size:0.72rem;color:var(--text-primary);outline:none"
            onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">
        </div>
        <div class="kh-bar" style="margin-bottom:0.4rem">
          <button class="kh-btn" onclick="khFmt('**','**')" style="font-weight:700">B</button>
          <button class="kh-btn" onclick="khFmt('*','*')" style="font-style:italic">I</button>
          <button class="kh-btn" onclick="khFmt('[[',']]')" style="color:#8b5cf6">[[]]</button>
          <button class="kh-btn" onclick="khFmt('$','$')">$...$</button>
          <button class="kh-btn" onclick="khFmt('$$','$$')">$$...$$</button>
          <button class="kh-btn" onclick="khFmt('\\n- ','')">• Lista</button>
          <button class="kh-btn" onclick="khFmt('\\n---\\n','')">—</button>
          <button class="kh-btn" onclick="khFmt('\\n> ','')">❝</button>
        </div>
        <textarea id="kh-c" style="width:100%;min-height:350px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem 0.7rem;font-size:0.82rem;color:var(--text-primary);line-height:1.65;outline:none;resize:vertical;font-family:'JetBrains Mono',monospace;tab-size:2"
          onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">${n.content}</textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;flex-wrap:wrap;gap:0.3rem">
          <div style="font-size:0.62rem;color:var(--text-muted)">
            ${lk.length>0?`🔗 → ${lk.map(l=>`<span class="kh-link" onclick="khOpenByTitle('${l}')">${l}</span>`).join(', ')}`:''}
          </div>
          <button class="kh-btn kh-btn-primary" onclick="khSave('${n.id}')" style="padding:0.4rem 1.2rem">Guardar</button>
        </div>
      </div>
      <div style="flex:1.5;min-width:250px">
        <div style="font-size:0.68rem;font-weight:600;color:var(--text-muted);margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.5px">Preview</div>
        <div class="kh-view" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.8rem 1rem;min-height:300px;max-height:500px;overflow-y:auto">
          ${khMd(n.content)}
        </div>
        ${bl.length>0?`<div style="margin-top:0.6rem"><div style="font-size:0.65rem;font-weight:600;color:var(--text-muted);margin-bottom:0.3rem">← Backlinks (${bl.length})</div>${bl.map(b=>`<div class="kh-card" onclick="khOpen('${b.id}')" style="padding:0.4rem 0.6rem;margin-bottom:0.3rem;font-size:0.72rem"><span style="color:#8b5cf6;font-weight:600">${b.icon} ${b.title}</span></div>`).join('')}</div>`:''}
      </div>
    </div>`;
}

// ─── ACTIONS ───
window.khRender = khRender;
window.khNew = function() {
  const id='n_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);
  KH.notes.push({id,title:'Nueva Nota',content:'',tags:[],icon:'📝',created:new Date().toISOString(),updated:new Date().toISOString()});
  khSave(); KH.active=id; KH.view='editor'; khRender();
  setTimeout(()=>{const t=document.getElementById('kh-t');if(t){t.focus();t.select();}},100);
};
window.khOpen = function(id) { KH.active=id; KH.view='editor'; khRender(); };
window.khOpenByTitle = function(title) { const n=KH.notes.find(x=>x.title.toLowerCase()===title.toLowerCase()); if(n) khOpen(n.id); };
window.khBack = function() { if(KH.active) khSaveCurrent(); KH.view='graph'; khRender(); };
window.khSave = function(id) {
  KH.active=id; khSaveCurrent();
  const b=event?.target;if(b){b.textContent='✓ Guardado';b.style.background='#22c55e';setTimeout(()=>{b.textContent='Guardar';b.style.background='';},1500);}
};
window.khDel = function(id) { if(!confirm('¿Eliminar?'))return; KH.notes=KH.notes.filter(n=>n.id!==id); KH.pinned=KH.pinned.filter(p=>p!==id); khSave(); KH.view='graph'; khRender(); };
window.khPin = function(id) { if(KH.pinned.includes(id))KH.pinned=KH.pinned.filter(p=>p!==id);else KH.pinned.push(id); khSave(); khRender(); };
window.khFmt = function(b,a) { const ta=document.getElementById('kh-c');if(!ta)return;const s=ta.selectionStart,e=ta.selectionEnd;ta.setRangeText(b+(ta.value.substring(s,e)||'...')+a,s,e,'select');ta.focus(); };

function khSaveCurrent() {
  const n=KH.notes.find(x=>x.id===KH.active);if(!n)return;
  const t=document.getElementById('kh-t'),c=document.getElementById('kh-c'),tg=document.getElementById('kh-tg'),i=document.getElementById('kh-i');
  if(t)n.title=t.value||'Sin título';if(c)n.content=c.value;if(tg)n.tags=tg.value.split(',').map(x=>x.trim()).filter(Boolean);if(i)n.icon=i.value;
  n.updated=new Date().toISOString();khSave();
}
