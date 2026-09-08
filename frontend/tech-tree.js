// knowledge-hub.js - Obsidian-style: tomá apuntes, vinculalos, veá la red de tu conocimiento
const KH_STORAGE = 'fiuba_knowledge_hub';

let khNotes = [];
let khActiveNote = null;
let khView = 'graph'; // 'graph' | 'editor' | 'list'
let khGraphHover = null;
let khSearchQuery = '';
let khFilterTag = null;
let khPinned = [];

function khInit() {
  try { khNotes = JSON.parse(localStorage.getItem(KH_STORAGE) || '[]'); } catch { khNotes = []; }
  try { khPinned = JSON.parse(localStorage.getItem(KH_STORAGE + '_pinned') || '[]'); } catch { khPinned = []; }
  if (khNotes.length === 0) khCreateStarterNotes();
}

function khSave() {
  localStorage.setItem(KH_STORAGE, JSON.stringify(khNotes));
  localStorage.setItem(KH_STORAGE + '_pinned', JSON.stringify(khPinned));
}

function khCreateStarterNotes() {
  const starters = [
    { title: 'Leyes de Newton', content: 'Las tres leyes del movimiento de [[Isaac Newton]].\n\n**1ª Ley (Inercia):** Un cuerpo en reposo tiende a permanecer en reposo a menos que una fuerza externa actúe sobre él.\n\n**2ª Ley (F=ma):** La fuerza es igual a la masa por la aceleración. Cuanta más masa, más fuerza necesitás para mover algo.\n\n**3ª Ley (Acción-Reacción):** Toda acción tiene una reacción igual y opuesta.\n\n---\n\n**Ejemplo práctico:** Cuando caminás, tus pies ejercen una fuerza hacia atrás sobre el piso (acción) y el piso ejerce una fuerza hacia adelante sobre vos (reacción).\n\nRelacionado con: [[Energía Cinética]], [[Termodinámica]], [[Cinemática]]', tags: ['física', 'mecánica'], icon: '🍎' },
    { title: 'Energía Cinética', content: 'La energía que posee un cuerpo por su movimiento.\n\n$$KE = \\frac{1}{2}mv^2$$\n\nDepende de la masa y la velocidad al cuadrado. Si duplicás la velocidad, cuadruplicás la energía.\n\n**Datos clave:**\n- Se mide en Julios (J)\n- Siempre es positiva (o cero)\n- Es una energía mecánica\n\n---\n\n**Ejemplo:** Una pelota de 0.5 kg que se mueve a 10 m/s tiene KE = 0.5 × 0.5 × 100 = 25 J.\n\nRelacionado con: [[Leyes de Newton]], [[Trabajo y Energía]]', tags: ['física', 'energía'], icon: '⚡' },
    { title: 'Ley de Ohm', content: 'Relaciona voltaje, corriente y resistencia.\n\n$$V = I \\cdot R$$\n\n- **V** = Voltaje (Voltios) — la "presión" que mueve los electrones\n- **I** = Corriente (Amperios) — el "caudal" de electrones\n- **R** = Resistencia (Ohms) — cuánto se "opone" al paso\n\n---\n\n**Analogía hidráulica:** Imaginá una tubería. El voltaje es la presión del agua, la corriente es el caudal, y la resistencia es el diámetro de la tubería.\n\nFundamento de toda la [[Electrónica]] y los [[Circuitos Eléctricos]].', tags: ['física', 'electricidad'], icon: '🔌' },
    { title: 'Termodinámica', content: 'Rama de la física que estudia el calor, la energía y el trabajo.\n\n**Leyes fundamentales:**\n\n**Ley 0:** Si A está en equilibrio térmico con B, y B con C, entonces A con C.\n\n**Ley 1 (Conservación):** La energía no se crea ni se destruye, solo se transforma.\n\n**Ley 2 (Entropía):** En un sistema aislado, la entropía siempre aumenta.\n\n**Ley 3 (Cero absoluto):** Es imposible llegar al 0 Kelvin (-273.15°C).\n\n---\n\nRelacionado con: [[Máquinas Térmicas]], [[Entropía]], [[Leyes de Newton]]', tags: ['física', 'termodinámica'], icon: '🔥' },
    { title: 'Cálculo I', content: 'Análisis de [[funciones]], derivadas y límites.\n\n**Derivada:** Tasa de cambio instantánea de una función.\n\n$$f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\n**Reglas importantes:**\n- **Cadena:** $(f \\circ g)\' = f\'(g) \\cdot g\'$\n- **Producto:** $(fg)\' = f\'g + fg\'$\n- **Cociente:** $(f/g)\' = (f\'g - fg\') / g^2$\n\n---\n\n**Intuición:** La derivada te dice qué tan rápido sube o baja una función en cada punto.\n\nRelacionado con: [[Cálculo II]], [[Álgebra Lineal]]', tags: ['matemática', 'cálculo'], icon: '📐' },
    { title: 'Álgebra Lineal', content: 'Estudio de vectores, matrices y transformaciones lineales.\n\n**Conceptos clave:**\n\n- **Vectores:** Flechas con magnitud y dirección\n- **Matrices:** Tablas de números que transforman vectores\n- **Determinante:** Un número que indica si una matriz tiene inversa\n- **Autovalores:** Valores que no cambian bajo una transformación\n\n---\n\n**¿Para qué sirve?**\nGráficos por computadora, machine learning, mecánica cuántica, ingeniería estructural.\n\nFundamental para: [[Inteligencia Artificial]], [[Señales]]', tags: ['matemática', 'álgebra'], icon: '🔢' },
    { title: 'Programación', content: 'Arte de escribir instrucciones para computadoras.\n\n**Paradigmas principales:**\n- **Imperativo:** Decile a la PC paso a paso qué hacer (C, Python)\n- **OOP:** Todo son objetos con propiedades y métodos (Java, C++)\n- **Funcional:** Todo son funciones puras sin efectos secundarios (Haskell)\n\n**Conceptos fundamentales:**\n- Variables y tipos de datos\n- Estructuras de control (if, for, while)\n- Funciones y módulos\n- Estructuras de datos (arrays, lists, dicts)\n\n---\n\nRelacionado con: [[Estructuras de Datos]], [[Algoritmos]]', tags: ['computación', 'programación'], icon: '💻' },
    { title: 'Inteligencia Artificial', content: 'Campo de la computación que busca crear máquinas que puedan pensar.\n\n**Subcampos principales:**\n\n- **Machine Learning:** Aprender de datos sin ser programado explícitamente\n- **Deep Learning:** Redes neuronales con muchas capas\n- **NLP:** Entender y generar lenguaje humano\n- **Computer Vision:** "Ver" y entender imágenes\n\n---\n\n**Requisitos matemáticos:**\n- [[Álgebra Lineal]] para representar datos\n- [[Cálculo I]] para optimizar modelos\n- Probabilidad y estadística para inferencia\n\nRelacionado con: [[Redes Neuronales]]', tags: ['computación', 'ia'], icon: '🧠' },
    { title: 'Circuitos Eléctricos', content: 'Análisis de circuitos RLC y sus componentes.\n\n**Leyes de Kirchhoff:**\n- **KCL (Corrientes):** La suma de corrientes que entran a un nodo es igual a las que salen\n- **KVL (Voltajes):** La suma de voltajes en una malla cerrada es cero\n\n**Componentes básicos:**\n- **Resistencia (R):** Disipa energía como calor\n- **Condensador (C):** Almacena energía en campo eléctrico\n- **Inductor (L):** Almacena energía en campo magnético\n\n---\n\nRelacionado con: [[Ley de Ohm]], [[Electrónica]]', tags: ['ingeniería', 'electricidad'], icon: '⚙️' },
    { title: 'Estructuras', content: 'Resistencia de materiales y análisis estructural.\n\n**Tipos de esfuerzo:**\n\n- **Normal (σ = F/A):** Fuerza dividida área — tracción o compresión\n- **Cortante (τ = V/A):** Fuerza paralela a la superficie\n- **Flexión (σ = My/I):** Combinación de tracción y compresión\n\n**Ley de Hooke:** σ = E × ε (dentro del límite elástico)\n\n---\n\n**Criterios de falla:**\n- Tresca: τ_max = σ_y / 2\n- Von Mises: más preciso para ductiles\n\nRelacionado con: [[Materiales]], [[Construcción]]', tags: ['ingeniería', 'mecánica'], icon: '🏗️' },
    { title: 'Probabilidad y Estadística', content: 'El lenguaje de la incertidumbre.\n\n**Probabilidad:** Cuán posible es un evento.\n- P(A) ∈ [0, 1]\n- P(A ∪ B) = P(A) + P(B) - P(A ∩ B)\n\n**Estadística descriptiva:**\n- Media: μ = Σxᵢ / n\n- Mediana: valor central\n- Varianza: σ² = Σ(xᵢ - μ)² / n\n\n**Distribuciones:**\n- Normal (campana de Gauss)\n- Binomial (éxito/fracaso)\n- Poisson (eventos por tiempo)\n\n---\n\nFundamental para: [[Inteligencia Artificial]], [[Investigación]]', tags: ['matemática', 'estadística'], icon: '📊' },
    { title: 'Señales y Sistemas', content: 'Análisis de señales en el tiempo y la frecuencia.\n\n**Señales:**\n- **Continuas:** x(t) — tiempo real\n- **Discretas:** x[n] — muestreadas\n\n**Transformadas:**\n- **Fourier:** Convierte del tiempo a la frecuencia\n- **Laplace:** Generalización de Fourier\n- **Z:** Versión discreta de Laplace\n\n---\n\n**Aplicaciones:**\n- Procesamiento de audio\n- Comunicaciones\n- Control automático\n- [[Electrónica]] digital\n\nRelacionado con: [[Álgebra Lineal]], [[Cálculo I]]', tags: ['ingeniería', 'señales'], icon: '📡' },
    { title: 'Redes Neuronales', content: 'Modelo computacional inspirado en el cerebro humano.\n\n**Neurona artificial:**\n$$y = f(\\sum w_i x_i + b)$$\n\nDonde $w_i$ son los pesos, $x_i$ las entradas, $b$ el sesgo, y $f$ la función de activación.\n\n**Arquitecturas:**\n- **Feedforward:** Información va en una dirección\n- **Convolutional (CNN):** Para imágenes\n- **Recurrente (RNN):** Para secuencias\n- **Transformer:** Lo que usa GPT, BERT, etc.\n\n---\n\n**Entrenamiento:** Backpropagation + Gradient Descent\n\nRelacionado con: [[Inteligencia Artificial]], [[Álgebra Lineal]]', tags: ['computación', 'ia'], icon: '🧬' },
  ];

  starters.forEach(s => {
    khNotes.push({
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      title: s.title,
      content: s.content,
      tags: s.tags || [],
      icon: s.icon || '📝',
      images: [],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    });
  });
  khSave();
}

function khExtractLinks(content) {
  const links = [];
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1]);
  }
  return links;
}

function khGetGraph() {
  const nodes = [];
  const edges = [];
  const nodeMap = {};

  const filtered = khGetFilteredNotes();

  filtered.forEach(note => {
    nodeMap[note.title.toLowerCase()] = note.id;
    const linkCount = khExtractLinks(note.content).length;
    const backlinkCount = khNotes.filter(n => khExtractLinks(n.content).some(l => l.toLowerCase() === note.title.toLowerCase())).length;
    nodes.push({ id: note.id, title: note.title, tags: note.tags, icon: note.icon, size: (note.content || '').length, connections: linkCount + backlinkCount });
  });

  filtered.forEach(note => {
    const links = khExtractLinks(note.content);
    links.forEach(linkTitle => {
      const targetId = nodeMap[linkTitle.toLowerCase()];
      if (targetId && targetId !== note.id) {
        edges.push({ source: note.id, target: targetId });
      }
    });
  });

  return { nodes, edges };
}

function khGetFilteredNotes() {
  let notes = [...khNotes];
  if (khFilterTag) notes = notes.filter(n => (n.tags || []).includes(khFilterTag));
  if (khSearchQuery) {
    const q = khSearchQuery.toLowerCase();
    notes = notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  }
  return notes;
}

function khRenderMarkdown(text) {
  if (!text) return '<span style="color:var(--text-muted);font-style:italic">Vacío...</span>';
  let html = text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-secondary);padding:0.1rem 0.3rem;border-radius:3px;font-size:0.82em">$1</code>')
    // Links [[ ]]
    .replace(/\[\[([^\]]+)\]\]/g, '<span class="kh-link" onclick="khOpenByTitle(\'$1\')" style="color:#8b5cf6;cursor:pointer;border-bottom:1px dashed #8b5cf680">[[$1]]</span>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border-color);margin:0.8rem 0">')
    // Headers
    .replace(/^### (.+)$/gm, '<h4 style="font-size:0.85rem;font-weight:700;color:var(--text-primary);margin:0.6rem 0 0.3rem">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin:0.7rem 0 0.3rem">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin:0.8rem 0 0.4rem">$1</h2>')
    // List items
    .replace(/^- (.+)$/gm, '<div style="padding-left:1rem;position:relative;margin:0.15rem 0"><span style="position:absolute;left:0;color:var(--accent)">•</span>$1</div>')
    // Numbered list items
    .replace(/^(\d+)\. (.+)$/gm, '<div style="padding-left:1.2rem;position:relative;margin:0.15rem 0"><span style="position:absolute;left:0;color:var(--accent);font-weight:700">$1.</span>$2</div>')
    // Line breaks
    .replace(/\n/g, '<br>');

  // LaTeX blocks $$...$$
  html = html.replace(/\$\$(.+?)\$\$/g, '<div style="background:var(--bg-secondary);padding:0.5rem 0.8rem;border-radius:6px;margin:0.4rem 0;font-family:serif;font-size:1.05rem;text-align:center;color:var(--text-primary);border:1px solid var(--border-color)">$1</div>');
  // Inline math $...$
  html = html.replace(/\$(.+?)\$/g, '<span style="font-family:serif;font-style:italic;color:var(--accent)">$1</span>');

  return html;
}

// ─── RENDER ───
function khRender() {
  const el = document.getElementById('tech-tree-content');
  if (!el) return;
  khInit();

  if (khView === 'editor' && khActiveNote) {
    khRenderEditor(el);
    return;
  }
  if (khView === 'list') {
    khRenderList(el);
    return;
  }
  khRenderGraph(el);
}

function khRenderGraph(el) {
  const graph = khGetGraph();
  const allTags = [...new Set(khNotes.flatMap(n => n.tags || []))];
  const totalConnections = khGetGraph().edges.length;

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;flex-wrap:wrap;gap:0.4rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><circle cx="12" cy="12" r="2.5"/><path d="M7.5 11l7-3.5M7.5 13l7 3.5"/></svg>
        Knowledge Hub
      </h2>
      <div style="display:flex;gap:0.3rem">
        <button onclick="khSetView('graph')" style="background:${khView==='graph'?'#8b5cf618':'var(--bg-secondary)'};color:${khView==='graph'?'#8b5cf6':'var(--text-muted)'};border:1px solid ${khView==='graph'?'#8b5cf640':'var(--border-color)'};border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;font-weight:600">Grafo</button>
        <button onclick="khSetView('list')" style="background:${khView==='list'?'#8b5cf618':'var(--bg-secondary)'};color:${khView==='list'?'#8b5cf6':'var(--text-muted)'};border:1px solid ${khView==='list'?'#8b5cf640':'var(--border-color)'};border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;font-weight:600">Lista</button>
        <button onclick="khNewNote()" style="background:var(--accent);color:white;border:none;border-radius:6px;padding:0.3rem 0.7rem;cursor:pointer;font-size:0.72rem;font-weight:600">+ Nota</button>
      </div>
    </div>

    <div style="display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:center;flex-wrap:wrap">
      <input id="kh-search" type="text" value="${khSearchQuery}" placeholder="Buscar notas..."
        style="flex:1;min-width:150px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.35rem 0.6rem;font-size:0.72rem;color:var(--text-primary);outline:none"
        onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'"
        oninput="khSearchQuery=this.value;khRender()">
      ${allTags.slice(0, 8).map(t => `<button onclick="khFilterTag='${khFilterTag===t?null:t}';khRender()" style="font-size:0.6rem;background:${khFilterTag===t?'#8b5cf618':'var(--bg-secondary)'};color:${khFilterTag===t?'#8b5cf6':'var(--text-muted)'};padding:0.15rem 0.4rem;border-radius:10px;border:1px solid ${khFilterTag===t?'#8b5cf640':'var(--border-color)'};cursor:pointer">#${t}</button>`).join('')}
    </div>

    <div style="position:relative;background:var(--bg-card);border:1.5px solid var(--border-color);border-radius:12px;overflow:hidden;margin-bottom:0.6rem">
      <canvas id="kh-canvas" style="width:100%;height:500px;display:block;cursor:grab"></canvas>
      <div id="kh-tooltip" style="display:none;position:fixed;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem 0.8rem;font-size:0.72rem;color:var(--text-primary);pointer-events:none;z-index:100;box-shadow:0 4px 16px rgba(0,0,0,0.2);max-width:280px"></div>
      <div style="position:absolute;bottom:8px;left:10px;font-size:0.6rem;color:var(--text-muted);opacity:0.5">Hover = preview · Click = abrir · Drag = mover · Scroll = zoom</div>
      <div style="position:absolute;top:8px;right:10px;display:flex;gap:0.3rem;align-items:center">
        <span style="font-size:0.6rem;color:var(--text-muted)">${khNotes.length} notas · ${totalConnections} conexiones</span>
      </div>
    </div>`;
}

function khSetupCanvas() {
  const canvas = document.getElementById('kh-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;

  const graph = khGetGraph();
  if (graph.nodes.length === 0) {
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('No hay notas. Creá una con el botón + Nota', W / 2, H / 2);
    return;
  }

  const nodes = graph.nodes.map((n, i) => ({
    ...n,
    x: W / 2 + (Math.cos(i * 2.39996) * 120) + (Math.random() - 0.5) * 60,
    y: H / 2 + (Math.sin(i * 2.39996) * 120) + (Math.random() - 0.5) * 60,
    vx: 0, vy: 0,
  }));
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const edges = graph.edges.map(e => ({
    source: nodeMap[e.source],
    target: nodeMap[e.target],
  })).filter(e => e.source && e.target);

  // Force simulation
  for (let iter = 0; iter < 300; iter++) {
    const k = 0.008;
    const repulsion = 4000;
    const damping = 0.88;
    const center = { x: W / 2, y: H / 2 };

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = nodes[j].x - nodes[i].x;
        let dy = nodes[j].y - nodes[i].y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let force = repulsion / (dist * dist);
        nodes[i].vx -= (dx / dist) * force;
        nodes[i].vy -= (dy / dist) * force;
        nodes[j].vx += (dx / dist) * force;
        nodes[j].vy += (dy / dist) * force;
      }
    }

    edges.forEach(e => {
      let dx = e.target.x - e.source.x;
      let dy = e.target.y - e.source.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let force = k * (dist - 110);
      e.source.vx += (dx / dist) * force;
      e.source.vy += (dy / dist) * force;
      e.target.vx -= (dx / dist) * force;
      e.target.vy -= (dy / dist) * force;
    });

    nodes.forEach(n => {
      n.vx += (center.x - n.x) * 0.0008;
      n.vy += (center.y - n.y) * 0.0008;
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(40, Math.min(W - 40, n.x));
      n.y = Math.max(40, Math.min(H - 40, n.y));
    });
  }

  const catColors = {
    'física': '#8b5cf6', 'mecánica': '#8b5cf6', 'electricidad': '#f59e0b', 'energía': '#f59e0b',
    'termodinámica': '#ef4444', 'matemática': '#3b82f6', 'cálculo': '#3b82f6', 'álgebra': '#3b82f6',
    'computación': '#22c55e', 'programación': '#22c55e', 'ia': '#ec4899',
    'ingeniería': '#f59e0b', 'señales': '#06b6d4', 'estadística': '#14b8a6', 'default': '#6b7280',
  };
  function getNoteColor(note) {
    for (const t of (note.tags || [])) {
      if (catColors[t]) return catColors[t];
    }
    return catColors.default;
  }

  let scale = 1, panX = 0, panY = 0;
  let dragging = null, panning = false, lastMouse = null;
  let animFrame;

  function toScreen(x, y) { return { x: (x + panX) * scale + W / 2, y: (y + panY) * scale + H / 2 }; }
  function toWorld(sx, sy) { return { x: (sx - W / 2) / scale - panX, y: (sy - H / 2) / scale - panY }; }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const cs = getComputedStyle(document.documentElement);
    const bg = cs.getPropertyValue('--bg-card').trim() || '#fff';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid dots
    ctx.fillStyle = '#555';
    ctx.globalAlpha = 0.06;
    for (let x = 0; x < W; x += 30) for (let y = 0; y < H; y += 30) ctx.fillRect(x, y, 1, 1);
    ctx.globalAlpha = 1;

    // Edges
    edges.forEach(e => {
      const s = toScreen(e.source.x, e.source.y);
      const t = toScreen(e.target.x, e.target.y);
      const isHovered = khGraphHover === e.source.id || khGraphHover === e.target.id;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = isHovered ? '#8b5cf6' : '#888';
      ctx.lineWidth = isHovered ? 2.5 : 1;
      ctx.globalAlpha = isHovered ? 0.9 : 0.2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Nodes
    nodes.forEach(n => {
      const s = toScreen(n.x, n.y);
      const color = getNoteColor(n);
      const isHovered = khGraphHover === n.id;
      const isPinned = khPinned.includes(n.id);
      const baseR = 10 + Math.min(n.connections, 5) * 2;
      const r = isHovered ? baseR + 5 : baseR;

      // Outer glow
      if (isHovered || isPinned) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 10, 0, Math.PI * 2);
        ctx.fillStyle = color + (isHovered ? '25' : '15');
        ctx.fill();
      }

      // Shadow
      ctx.beginPath();
      ctx.arc(s.x, s.y + 2, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fill();

      // Circle
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(s.x - r * 0.3, s.y - r * 0.3, 0, s.x, s.y, r);
      grad.addColorStop(0, color + 'ee');
      grad.addColorStop(1, color + 'aa');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = isHovered ? '#fff' : color;
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.stroke();

      // Icon
      if (n.icon) {
        ctx.font = `${isHovered ? 16 : 12}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.icon, s.x, s.y);
      }

      // Label
      ctx.font = `${isHovered ? '600 11px' : '500 9px'} system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = color;
      ctx.fillText(n.title, s.x, s.y + r + 5);

      // Pin indicator
      if (isPinned) {
        ctx.fillStyle = '#f59e0b';
        ctx.font = '8px system-ui';
        ctx.fillText('📌', s.x + r - 4, s.y - r + 2);
      }
    });

    animFrame = requestAnimationFrame(draw);
  }
  draw();

  // Interactions
  canvas.addEventListener('mousemove', e => {
    const world = toWorld(e.offsetX, e.offsetY);
    let found = null;
    nodes.forEach(n => {
      const dx = n.x - world.x, dy = n.y - world.y;
      if (Math.sqrt(dx * dx + dy * dy) < 25) found = n.id;
    });
    khGraphHover = found;
    canvas.style.cursor = found ? 'pointer' : (dragging ? 'grabbing' : 'grab');

    const tooltip = document.getElementById('kh-tooltip');
    if (tooltip && found) {
      const note = khNotes.find(n => n.id === found);
      if (note) {
        const links = khExtractLinks(note.content);
        const backlinks = khNotes.filter(n => khExtractLinks(n.content).some(l => l.toLowerCase() === note.title.toLowerCase()));
        const preview = note.content.replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/[#*_`$]/g, '').replace(/\n/g, ' ').slice(0, 150);
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY - 10) + 'px';
        tooltip.innerHTML = `
          <div style="font-weight:700;font-size:0.82rem;color:var(--text-primary);margin-bottom:0.25rem;display:flex;align-items:center;gap:0.3rem">${note.icon || '📝'} ${note.title}</div>
          <div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:0.3rem;line-height:1.4">${preview}...</div>
          <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.2rem">
            ${(note.tags || []).map(t => `<span style="font-size:0.55rem;background:var(--bg-secondary);color:var(--text-muted);padding:0.08rem 0.3rem;border-radius:8px">#${t}</span>`).join('')}
          </div>
          <div style="font-size:0.6rem;color:#8b5cf6">${links.length > 0 ? '→ ' + links.slice(0, 3).join(', ') + (links.length > 3 ? '...' : '') : ''} ${backlinks.length > 0 ? '· ← ' + backlinks.length + ' backlinks' : ''}</div>
          <div style="font-size:0.58rem;color:#22c55e;margin-top:0.2rem">Click para abrir</div>`;
      }
    } else if (tooltip) {
      tooltip.style.display = 'none';
    }

    if (dragging) {
      dragging.x = world.x;
      dragging.y = world.y;
    } else if (panning && lastMouse) {
      panX += (e.offsetX - lastMouse.x) / scale;
      panY += (e.offsetY - lastMouse.y) / scale;
      lastMouse = { x: e.offsetX, y: e.offsetY };
    }
  });

  canvas.addEventListener('mousedown', e => {
    const world = toWorld(e.offsetX, e.offsetY);
    const node = nodes.find(n => {
      const dx = n.x - world.x, dy = n.y - world.y;
      return Math.sqrt(dx * dx + dy * dy) < 25;
    });
    if (node) {
      dragging = node;
      canvas.style.cursor = 'grabbing';
    } else {
      panning = true;
      lastMouse = { x: e.offsetX, y: e.offsetY };
      canvas.style.cursor = 'grabbing';
    }
  });

  canvas.addEventListener('mouseup', e => {
    if (dragging) {
      khOpenNote(dragging.id);
    }
    dragging = null;
    panning = false;
    lastMouse = null;
    canvas.style.cursor = khGraphHover ? 'pointer' : 'grab';
  });

  canvas.addEventListener('mouseleave', () => {
    khGraphHover = null;
    dragging = null;
    panning = false;
    const t = document.getElementById('kh-tooltip');
    if (t) t.style.display = 'none';
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    scale = Math.max(0.3, Math.min(3, scale * (e.deltaY < 0 ? 1.08 : 0.92)));
  }, { passive: false });
}

function khRenderList(el) {
  const notes = khGetFilteredNotes().sort((a, b) => new Date(b.updated) - new Date(a.updated));
  const allTags = [...new Set(khNotes.flatMap(n => n.tags || []))];

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;flex-wrap:wrap;gap:0.4rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><circle cx="12" cy="12" r="2.5"/><path d="M7.5 11l7-3.5M7.5 13l7 3.5"/></svg>
        Knowledge Hub
      </h2>
      <div style="display:flex;gap:0.3rem">
        <button onclick="khSetView('graph')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;color:var(--text-muted)">Grafo</button>
        <button onclick="khSetView('list')" style="background:#8b5cf618;border:1px solid #8b5cf640;border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;color:#8b5cf6;font-weight:600">Lista</button>
        <button onclick="khNewNote()" style="background:var(--accent);color:white;border:none;border-radius:6px;padding:0.3rem 0.7rem;cursor:pointer;font-size:0.72rem;font-weight:600">+ Nota</button>
      </div>
    </div>

    <div style="display:flex;gap:0.5rem;margin-bottom:0.6rem;align-items:center;flex-wrap:wrap">
      <input id="kh-search" type="text" value="${khSearchQuery}" placeholder="Buscar notas..."
        style="flex:1;min-width:150px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.35rem 0.6rem;font-size:0.72rem;color:var(--text-primary);outline:none"
        onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'"
        oninput="khSearchQuery=this.value;khRender()">
      ${allTags.slice(0, 10).map(t => `<button onclick="khFilterTag='${khFilterTag===t?null:t}';khRender()" style="font-size:0.6rem;background:${khFilterTag===t?'#8b5cf618':'var(--bg-secondary)'};color:${khFilterTag===t?'#8b5cf6':'var(--text-muted)'};padding:0.15rem 0.4rem;border-radius:10px;border:1px solid ${khFilterTag===t?'#8b5cf640':'var(--border-color)'};cursor:pointer">#${t}</button>`).join('')}
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:0.5rem">
      ${notes.map(n => {
        const links = khExtractLinks(n.content);
        const preview = n.content.replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/[#*_`$]/g, '').replace(/\n/g, ' ').slice(0, 120);
        const isPinned = khPinned.includes(n.id);
        return `
          <div onclick="khOpenNote('${n.id}')" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;cursor:pointer;transition:all 0.15s;position:relative" onmouseover="this.style.borderColor='#8b5cf6';this.style.transform='translateY(-1px)'" onmouseout="this.style.borderColor='var(--border-color)';this.style.transform='none'">
            ${isPinned ? '<div style="position:absolute;top:6px;right:8px;font-size:0.6rem">📌</div>' : ''}
            <div style="font-size:1.2rem;margin-bottom:0.3rem">${n.icon || '📝'}</div>
            <h3 style="font-size:0.82rem;font-weight:700;color:var(--text-primary);margin:0 0 0.2rem">${n.title}</h3>
            <p style="font-size:0.68rem;color:var(--text-muted);margin:0 0 0.3rem;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${preview}</p>
            <div style="display:flex;gap:0.3rem;flex-wrap:wrap;align-items:center">
              ${(n.tags || []).slice(0, 3).map(t => `<span style="font-size:0.55rem;background:var(--bg-secondary);color:var(--text-muted);padding:0.08rem 0.3rem;border-radius:8px">#${t}</span>`).join('')}
              ${links.length > 0 ? `<span style="font-size:0.55rem;color:#8b5cf6">→ ${links.length}</span>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>

    <div style="font-size:0.65rem;color:var(--text-muted);text-align:center;margin-top:0.5rem">${notes.length} notas · ${khGetGraph().edges.length} conexiones</div>`;
}

function khRenderEditor(el) {
  const note = khNotes.find(n => n.id === khActiveNote);
  if (!note) { khView = 'graph'; khRender(); return; }
  const links = khExtractLinks(note.content);
  const backlinks = khNotes.filter(n => n.id !== note.id && khExtractLinks(n.content).some(l => l.toLowerCase() === note.title.toLowerCase()));
  const isPinned = khPinned.includes(note.id);

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.3rem;margin-bottom:0.5rem;flex-wrap:wrap">
      <button onclick="khBackFromEditor()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;color:var(--text-primary)">← Volver</button>
      <button onclick="khTogglePin('${note.id}')" style="background:${isPinned?'#f59e0b18':'var(--bg-secondary)'};color:${isPinned?'#f59e0b':'var(--text-muted)'};border:1px solid ${isPinned?'#f59e0b40':'var(--border-color)'};border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem">${isPinned?'📌 Fijada':'📌 Fijar'}</button>
      <div style="flex:1"></div>
      <button onclick="khDeleteNote('${note.id}')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444430;border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem">Eliminar</button>
    </div>

    <div style="display:flex;gap:0.8rem;flex-wrap:wrap">
      <!-- Editor panel -->
      <div style="flex:2;min-width:300px">
        <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem">
          <select id="kh-icon" onchange="khUpdateIcon('${note.id}',this.value)" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem;font-size:1.1rem;cursor:pointer;color:var(--text-primary)">
            ${['📝','📐','📊','🔬','💻','⚙️','📚','🧪','💡','🎯','🍎','⚡','🔌','🔥','🏗️','🧠','🧬','📡','🔢','💻','📈','🎲','🎵','🌍','⭐'].map(i => `<option value="${i}" ${note.icon===i?'selected':''}>${i}</option>`).join('')}
          </select>
          <input id="kh-title" value="${note.title.replace(/"/g, '&quot;')}" placeholder="Título..."
            style="flex:1;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.45rem 0.7rem;font-size:1.05rem;font-weight:700;color:var(--text-primary);outline:none;font-family:var(--font-heading)"
            onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">
        </div>

        <div style="display:flex;gap:0.4rem;margin-bottom:0.5rem;align-items:center;flex-wrap:wrap">
          <span style="font-size:0.68rem;color:var(--text-muted)">Tags:</span>
          <input id="kh-tags" value="${(note.tags || []).join(', ')}" placeholder="física, cálculo, ..."
            style="flex:1;min-width:120px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.5rem;font-size:0.72rem;color:var(--text-primary);outline:none"
            onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">
        </div>

        <div style="display:flex;gap:0.3rem;margin-bottom:0.4rem;flex-wrap:wrap">
          <span style="font-size:0.6rem;color:var(--text-muted);line-height:1.8">Formato:</span>
          <button onclick="khInsertFormat('**','**')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary);font-weight:700">B</button>
          <button onclick="khInsertFormat('*','*')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary);font-style:italic">I</button>
          <button onclick="khInsertFormat('[[',']]')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:#8b5cf6">[[]]</button>
          <button onclick="khInsertFormat('$','$')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary)">$...$</button>
          <button onclick="khInsertFormat('$$','$$')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary)">$$...$$</button>
          <button onclick="khInsertFormat('\\n- ','')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary)">• Lista</button>
          <button onclick="khInsertFormat('\\n---\\n','')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary)">— Linea</button>
        </div>

        <div style="position:relative">
          <textarea id="kh-content" placeholder="Escribí tus apuntes acá...&#10;&#10;Usá [[Nombre]] para vincular a otras notas.&#10;Ej: Relacionado con [[Leyes de Newton]]&#10;&#10;Soporta **negrita**, *cursiva*, $math$, - listas"
            style="width:100%;min-height:300px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem 0.7rem;font-size:0.82rem;color:var(--text-primary);line-height:1.65;outline:none;resize:vertical;font-family:'JetBrains Mono','Cascadia Code','Fira Code',monospace;tab-size:2"
            onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">${note.content}</textarea>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;flex-wrap:wrap;gap:0.3rem">
          <div style="font-size:0.62rem;color:var(--text-muted)">
            ${links.length > 0 ? `🔗 → ${links.map(l => `<span class="kh-link" onclick="khOpenByTitle('${l}')" style="color:#8b5cf6;cursor:pointer">${l}</span>`).join(', ')}` : ''}
          </div>
          <button onclick="khSaveNote('${note.id}')" style="background:var(--accent);color:white;border:none;border-radius:8px;padding:0.4rem 1.2rem;cursor:pointer;font-size:0.78rem;font-weight:600">Guardar</button>
        </div>
      </div>

      <!-- Preview panel -->
      <div style="flex:1.5;min-width:250px">
        <div style="font-size:0.68rem;font-weight:600;color:var(--text-muted);margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.5px">Vista previa</div>
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.7rem;font-size:0.8rem;color:var(--text-primary);line-height:1.65;min-height:300px;max-height:500px;overflow-y:auto" id="kh-preview">
          ${khRenderMarkdown(note.content)}
        </div>

        ${backlinks.length > 0 ? `
        <div style="margin-top:0.6rem">
          <div style="font-size:0.65rem;font-weight:600;color:var(--text-muted);margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:0.5px">← Backlinks (${backlinks.length})</div>
          ${backlinks.map(bl => `
            <div onclick="khOpenNote('${bl.id}')" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.4rem 0.6rem;margin-bottom:0.3rem;cursor:pointer;font-size:0.72rem" onmouseover="this.style.borderColor='#8b5cf6'" onmouseout="this.style.borderColor='var(--border-color)'">
              <span style="color:#8b5cf6;font-weight:600">${bl.icon || '📝'} ${bl.title}</span>
            </div>`).join('')}
        </div>` : ''}
      </div>
    </div>`;
}

// ─── ACTIONS ───
function khSetView(v) { khView = v; khRender(); }

function khNewNote() {
  const id = 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const note = { id, title: 'Nueva Nota', content: '', tags: [], icon: '📝', images: [], created: new Date().toISOString(), updated: new Date().toISOString() };
  khNotes.push(note);
  khSave();
  khActiveNote = id;
  khView = 'editor';
  khRender();
}

function khOpenNote(id) {
  khActiveNote = id;
  khView = 'editor';
  khRender();
}

function khOpenByTitle(title) {
  const note = khNotes.find(n => n.title.toLowerCase() === title.toLowerCase());
  if (note) khOpenNote(note.id);
}

function khBackFromEditor() {
  if (khActiveNote) khSaveCurrentNote();
  khView = 'graph';
  khRender();
}

function khSaveCurrentNote() {
  const note = khNotes.find(n => n.id === khActiveNote);
  if (!note) return;
  const titleEl = document.getElementById('kh-title');
  const contentEl = document.getElementById('kh-content');
  const tagsEl = document.getElementById('kh-tags');
  const iconEl = document.getElementById('kh-icon');
  if (titleEl) note.title = titleEl.value || 'Sin título';
  if (contentEl) note.content = contentEl.value;
  if (tagsEl) note.tags = tagsEl.value.split(',').map(t => t.trim()).filter(Boolean);
  if (iconEl) note.icon = iconEl.value;
  note.updated = new Date().toISOString();
  khSave();
}

function khSaveNote(id) {
  khActiveNote = id;
  khSaveCurrentNote();
  const btn = event?.target;
  if (btn) { btn.textContent = '✓ Guardado'; btn.style.background = '#22c55e'; setTimeout(() => { btn.textContent = 'Guardar'; btn.style.background = ''; }, 1500); }
}

function khDeleteNote(id) {
  if (!confirm('¿Eliminar esta nota?')) return;
  khNotes = khNotes.filter(n => n.id !== id);
  khPinned = khPinned.filter(p => p !== id);
  khSave();
  khView = 'graph';
  khRender();
}

function khTogglePin(id) {
  if (khPinned.includes(id)) {
    khPinned = khPinned.filter(p => p !== id);
  } else {
    khPinned.push(id);
  }
  khSave();
  khRender();
}

function khUpdateIcon(id, icon) {
  const note = khNotes.find(n => n.id === id);
  if (note) { note.icon = icon; khSave(); }
}

function khInsertFormat(before, after) {
  const ta = document.getElementById('kh-content');
  if (!ta) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const sel = ta.value.substring(start, end);
  const replacement = before + (sel || '...') + after;
  ta.setRangeText(replacement, start, end, 'select');
  ta.focus();
  ta.dispatchEvent(new Event('input'));
}

window.khRender = khRender;
window.khSetView = khSetView;
window.khNewNote = khNewNote;
window.khOpenNote = khOpenNote;
window.khOpenByTitle = khOpenByTitle;
window.khBackFromEditor = khBackFromEditor;
window.khSaveNote = khSaveNote;
window.khDeleteNote = khDeleteNote;
window.khTogglePin = khTogglePin;
window.khUpdateIcon = khUpdateIcon;
window.khInsertFormat = khInsertFormat;
