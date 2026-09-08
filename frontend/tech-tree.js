// knowledge-hub.js - Obsidian-style: tomá apuntes, vinculalos, veá la red de tu conocimiento
const KH_STORAGE = 'fiuba_knowledge_hub';

let khNotes = [];
let khActiveNote = null;
let khView = 'graph';
let khGraphHover = null;
let khSearchQuery = '';
let khFilterTag = null;
let khPinned = [];
let khAnimFrame = null;

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
    { title: 'Leyes de Newton', content: 'Las tres leyes del movimiento de [[Isaac Newton]].\n\n**1ª Ley (Inercia):** Un cuerpo en reposo tiende a permanecer en reposo a menos que una fuerza externa actúe.\n\n**2ª Ley (F=ma):** La fuerza es masa por aceleración.\n\n$$F = m \\cdot a$$\n\n**3ª Ley (Acción-Reacción):** Toda acción tiene una reacción igual y opuesta.\n\n---\n\n**Ejemplo:** Cuando caminás, tus pies empujan el piso hacia atrás y el piso te empuja a vos hacia adelante.\n\nRelacionado con: [[Energía Cinética]], [[Termodinámica]]', tags: ['física', 'mecánica'], icon: '🍎' },
    { title: 'Energía Cinética', content: 'La energía que posee un cuerpo por su movimiento.\n\n$$KE = \\frac{1}{2}mv^2$$\n\n- Si duplicás la velocidad → cuadruplicás la energía\n- Se mide en Julios (J)\n- Siempre positiva\n\nRelacionado con: [[Leyes de Newton]], [[Trabajo y Energía]]', tags: ['física', 'energía'], icon: '⚡' },
    { title: 'Ley de Ohm', content: 'Relaciona voltaje, corriente y resistencia.\n\n$$V = I \\cdot R$$\n\n- **V** = Voltaje (presión)\n- **I** = Corriente (caudal)\n- **R** = Resistencia (oposición)\n\nFundamento de: [[Electrónica]], [[Circuitos Eléctricos]]', tags: ['física', 'electricidad'], icon: '🔌' },
    { title: 'Termodinámica', content: 'Estudio del calor y la energía.\n\n**Ley 0:** Equilibrio térmico\n**Ley 1:** Conservación de la energía\n**Ley 2:** La entropía siempre aumenta\n**Ley 3:** Imposible llegar al cero absoluto\n\nRelacionado con: [[Leyes de Newton]]', tags: ['física', 'termodinámica'], icon: '🔥' },
    { title: 'Cálculo I', content: 'Derivadas, límites y análisis de [[funciones]].\n\n**Derivada:** Tasa de cambio instantánea.\n\n$$f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\n**Reglas:** Cadena, producto, cociente.\n\nRelacionado con: [[Cálculo II]], [[Álgebra Lineal]]', tags: ['matemática', 'cálculo'], icon: '📐' },
    { title: 'Álgebra Lineal', content: 'Vectores, matrices y transformaciones.\n\n**Conceptos:**\n- Vectores y espacios vectoriales\n- Matrices y determinantes\n- Autovalores\n\nFundamental para: [[Inteligencia Artificial]], [[Señales]]', tags: ['matemática', 'álgebra'], icon: '🔢' },
    { title: 'Programación', content: 'Escribir instrucciones para computadoras.\n\n**Paradigmas:**\n- Imperativo (C, Python)\n- OOP (Java, C++)\n- Funcional (Haskell)\n\nRelacionado con: [[Estructuras de Datos]], [[Algoritmos]]', tags: ['computación', 'programación'], icon: '💻' },
    { title: 'Inteligencia Artificial', content: 'Máquinas que piensan.\n\n**Subcampos:**\n- Machine Learning\n- Deep Learning\n- NLP\n- Computer Vision\n\nRequiere: [[Álgebra Lineal]], [[Cálculo I]], [[Programación]]', tags: ['computación', 'ia'], icon: '🧠' },
    { title: 'Circuitos Eléctricos', content: 'Análisis de circuitos RLC.\n\n**Kirchhoff:**\n- KCL: Corrientes en nodo = 0\n- KVL: Voltajes en malla = 0\n\nRelacionado con: [[Ley de Ohm]], [[Electrónica]]', tags: ['ingeniería', 'electricidad'], icon: '⚙️' },
    { title: 'Estructuras', content: 'Resistencia de materiales.\n\n**Esfuerzos:**\n- Normal: $\\sigma = F/A$\n- Cortante: $\\tau = V/A$\n- Flexión: $\\sigma = My/I$\n\nRelacionado con: [[Materiales]]', tags: ['ingeniería', 'mecánica'], icon: '🏗️' },
    { title: 'Probabilidad', content: 'Lenguaje de la incertidumbre.\n\n**Base:** $P(A) \\in [0, 1]$\n**Media:** $\\mu = \\frac{\\sum x_i}{n}$\n**Varianza:** $\\sigma^2 = \\frac{\\sum (x_i - \\mu)^2}{n}$\n\nFundamental para: [[Inteligencia Artificial]]', tags: ['matemática', 'estadística'], icon: '📊' },
    { title: 'Redes Neuronales', content: 'Modelo inspirado en el cerebro.\n\n$$y = f\\left(\\sum w_i x_i + b\\right)$$\n\n**Arquitecturas:**\n- Feedforward\n- CNN (imágenes)\n- RNN (secuencias)\n- Transformer (GPT, BERT)\n\nRelacionado con: [[Inteligencia Artificial]], [[Álgebra Lineal]]', tags: ['computación', 'ia'], icon: '🧬' },
  ];

  starters.forEach(s => {
    khNotes.push({
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      title: s.title, content: s.content, tags: s.tags || [], icon: s.icon || '📝',
      created: new Date().toISOString(), updated: new Date().toISOString(),
    });
  });
  khSave();
}

function khExtractLinks(content) {
  const links = []; const regex = /\[\[([^\]]+)\]\]/g; let m;
  while ((m = regex.exec(content)) !== null) links.push(m[1]);
  return links;
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

function khGetGraph() {
  const nodes = [], edges = [], nodeMap = {};
  khGetFilteredNotes().forEach(n => {
    nodeMap[n.title.toLowerCase()] = n.id;
    nodes.push({ id: n.id, title: n.title, tags: n.tags, icon: n.icon,
      connections: khExtractLinks(n.content).length + khNotes.filter(x => khExtractLinks(x.content).some(l => l.toLowerCase() === n.title.toLowerCase())).length });
  });
  khGetFilteredNotes().forEach(n => {
    khExtractLinks(n.content).forEach(l => {
      const tid = nodeMap[l.toLowerCase()];
      if (tid && tid !== n.id) edges.push({ source: n.id, target: tid });
    });
  });
  return { nodes, edges };
}

// ─── KATEX RENDERING ───
function khRenderKatex(html) {
  if (typeof katex === 'undefined') return html;
  // Block math $$...$$
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
    try { return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }); }
    catch { return `<span style="color:#ef4444">[Math error]</span>`; }
  });
  // Inline math $...$  (not escaped)
  html = html.replace(/\$([^\$\n]+?)\$/g, (_, tex) => {
    try { return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false }); }
    catch { return `<span style="color:#ef4444">[Math error]</span>`; }
  });
  return html;
}

function khRenderMarkdown(text) {
  if (!text) return '<p class="kh-empty">Escribí algo...</p>';
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Wiki links
    .replace(/\[\[([^\]]+)\]\]/g, '<a class="kh-wikilink" onclick="khOpenByTitle(\'$1\')">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Unordered list
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Ordered list
    .replace(/^(\d+)\. (.+)$/gm, '<li class="kh-ordered">$2</li>')
    // Blockquote
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    // Line breaks → paragraphs
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br>');

  // Wrap list items
  html = html.replace(/(<li(?:[^>]*)>.*?<\/li>)(?:<br>)?/g, '$1');
  html = html.replace(/((?:<li(?:[^>]*)>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');

  html = '<p>' + html + '</p>';

  // KaTeX
  html = khRenderKatex(html);

  return html;
}

// ─── CSS (injected once) ───
function khInjectStyles() {
  if (document.getElementById('kh-styles')) return;
  const style = document.createElement('style');
  style.id = 'kh-styles';
  style.textContent = `
    .kh-note-view { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: var(--text-primary); line-height: 1.7; font-size: 0.88rem; }
    .kh-note-view h1 { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.8rem; color: var(--text-primary); font-family: var(--font-heading); }
    .kh-note-view h2 { font-size: 1.2rem; font-weight: 700; margin: 1.2rem 0 0.5rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 0.3rem; }
    .kh-note-view h3 { font-size: 1rem; font-weight: 600; margin: 1rem 0 0.4rem; color: var(--text-primary); }
    .kh-note-view h4 { font-size: 0.9rem; font-weight: 600; margin: 0.8rem 0 0.3rem; color: var(--text-muted); }
    .kh-note-view p { margin: 0 0 0.6rem; }
    .kh-note-view strong { font-weight: 600; color: var(--text-primary); }
    .kh-note-view em { font-style: italic; color: var(--text-muted); }
    .kh-note-view code { background: var(--bg-secondary); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.82em; font-family: 'JetBrains Mono', 'Cascadia Code', monospace; color: var(--accent); }
    .kh-note-view pre { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.8rem; overflow-x: auto; margin: 0.6rem 0; }
    .kh-note-view pre code { background: none; padding: 0; color: var(--text-primary); }
    .kh-note-view hr { border: none; border-top: 1px solid var(--border-color); margin: 1.2rem 0; }
    .kh-note-view blockquote { border-left: 3px solid var(--accent); padding: 0.4rem 0.8rem; margin: 0.6rem 0; background: var(--bg-secondary); border-radius: 0 6px 6px 0; color: var(--text-muted); font-style: italic; }
    .kh-note-view ul { padding-left: 1.5rem; margin: 0.4rem 0; }
    .kh-note-view li { margin: 0.2rem 0; }
    .kh-note-view li::marker { color: var(--accent); }
    .kh-wikilink { color: #8b5cf6; cursor: pointer; border-bottom: 1px dashed #8b5cf660; text-decoration: none; font-weight: 500; transition: all 0.15s; }
    .kh-wikilink:hover { color: #a78bfa; border-bottom-color: #a78bfa; background: #8b5cf610; border-radius: 2px; }
    .kh-empty { color: var(--text-muted); font-style: italic; }
    .kh-note-view .katex { font-size: 1.05em; }
    .kh-note-view .katex-display { margin: 0.8rem 0; padding: 0.6rem; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border-color); overflow-x: auto; }
  `;
  document.head.appendChild(style);
}

// ─── RENDER ───
function khRender() {
  const el = document.getElementById('tech-tree-content');
  if (!el) return;
  khInit();
  khInjectStyles();
  if (khAnimFrame) { cancelAnimationFrame(khAnimFrame); khAnimFrame = null; }
  if (khView === 'editor' && khActiveNote) { khRenderEditor(el); return; }
  if (khView === 'list') { khRenderList(el); return; }
  khRenderGraph(el);
}

function khRenderGraph(el) {
  const graph = khGetGraph();
  const allTags = [...new Set(khNotes.flatMap(n => n.tags || []))];

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;flex-wrap:wrap;gap:0.4rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><circle cx="12" cy="12" r="2.5"/><path d="M7.5 11l7-3.5M7.5 13l7 3.5"/></svg>
        Knowledge Hub
      </h2>
      <div style="display:flex;gap:0.3rem">
        <button onclick="khSetView('graph')" style="background:#8b5cf618;color:#8b5cf6;border:1px solid #8b5cf640;border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;font-weight:600">Red</button>
        <button onclick="khSetView('list')" style="background:var(--bg-secondary);color:var(--text-muted);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem">Notas</button>
        <button onclick="khNewNote()" style="background:var(--accent);color:white;border:none;border-radius:6px;padding:0.3rem 0.7rem;cursor:pointer;font-size:0.72rem;font-weight:600">+ Nota</button>
      </div>
    </div>
    <div style="display:flex;gap:0.5rem;margin-bottom:0.5rem;align-items:center;flex-wrap:wrap">
      <input id="kh-search" type="text" value="${khSearchQuery}" placeholder="Buscar..."
        style="flex:1;min-width:120px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.35rem 0.6rem;font-size:0.72rem;color:var(--text-primary);outline:none"
        onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'"
        oninput="khSearchQuery=this.value;khRender()">
      ${allTags.slice(0, 8).map(t => `<button onclick="khFilterTag='${khFilterTag===t?null:t}';khRender()" style="font-size:0.6rem;background:${khFilterTag===t?'#8b5cf618':'var(--bg-secondary)'};color:${khFilterTag===t?'#8b5cf6':'var(--text-muted)'};padding:0.15rem 0.4rem;border-radius:10px;border:1px solid ${khFilterTag===t?'#8b5cf640':'var(--border-color)'};cursor:pointer">#${t}</button>`).join('')}
    </div>
    <div style="position:relative;background:var(--bg-card);border:1.5px solid var(--border-color);border-radius:12px;overflow:hidden;margin-bottom:0.5rem">
      <canvas id="kh-canvas" style="width:100%;height:520px;display:block;cursor:grab"></canvas>
      <div id="kh-tooltip" style="display:none;position:fixed;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.6rem 0.8rem;font-size:0.72rem;color:var(--text-primary);pointer-events:none;z-index:100;box-shadow:0 8px 24px rgba(0,0,0,0.2);max-width:280px"></div>
      <div style="position:absolute;bottom:8px;left:10px;font-size:0.6rem;color:var(--text-muted);opacity:0.5">Hover preview · Click abrir · Drag nodo · Scroll zoom</div>
      <div style="position:absolute;top:8px;right:10px;font-size:0.6rem;color:var(--text-muted)">${khNotes.length} notas · ${graph.edges.length} conexiones</div>
    </div>`;

  setTimeout(() => khSetupCanvas(), 30);
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
    ctx.fillStyle = '#6b7280'; ctx.font = '14px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('No hay notas. Creá una con + Nota', W / 2, H / 2);
    return;
  }

  const nodes = graph.nodes.map((n, i) => ({
    ...n, x: W / 2 + Math.cos(i * 2 * Math.PI / graph.nodes.length) * 150,
    y: H / 2 + Math.sin(i * 2 * Math.PI / graph.nodes.length) * 150,
    vx: 0, vy: 0,
  }));
  const nodeMap = {}; nodes.forEach(n => { nodeMap[n.id] = n; });
  const edges = graph.edges.map(e => ({ source: nodeMap[e.source], target: nodeMap[e.target] })).filter(e => e.source && e.target);

  for (let iter = 0; iter < 400; iter++) {
    const rep = 5000, sk = 0.006, sl = 130, damp = 0.88, grav = 0.001;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      let dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y, d = Math.sqrt(dx*dx+dy*dy)||1, f = rep/(d*d);
      nodes[i].vx -= (dx/d)*f; nodes[i].vy -= (dy/d)*f; nodes[j].vx += (dx/d)*f; nodes[j].vy += (dy/d)*f;
    }
    edges.forEach(e => {
      let dx = e.target.x-e.source.x, dy = e.target.y-e.source.y, d = Math.sqrt(dx*dx+dy*dy)||1, f = sk*(d-sl);
      e.source.vx += (dx/d)*f; e.source.vy += (dy/d)*f; e.target.vx -= (dx/d)*f; e.target.vy -= (dy/d)*f;
    });
    nodes.forEach(n => {
      n.vx += (W/2-n.x)*grav; n.vy += (H/2-n.y)*grav; n.vx *= damp; n.vy *= damp;
      n.x += n.vx; n.y += n.vy; n.x = Math.max(40,Math.min(W-40,n.x)); n.y = Math.max(40,Math.min(H-40,n.y));
    });
  }

  const catColors = { 'física':'#8b5cf6','mecánica':'#a78bfa','electricidad':'#f59e0b','energía':'#fbbf24','termodinámica':'#ef4444','matemática':'#3b82f6','cálculo':'#60a5fa','álgebra':'#818cf8','computación':'#22c55e','programación':'#4ade80','ia':'#ec4899','ingeniería':'#f59e0b','señales':'#06b6d4','estadística':'#14b8a6','default':'#6b7280' };
  function getColor(n) { for (const t of (n.tags||[])) if (catColors[t]) return catColors[t]; return catColors.default; }

  let scale=1, panX=0, panY=0, dragging=null, panning=false, lastMouse=null, time=0;
  function toScreen(x,y) { return { x:(x+panX)*scale+W/2, y:(y+panY)*scale+H/2 }; }
  function toWorld(sx,sy) { return { x:(sx-W/2)/scale-panX, y:(sy-H/2)/scale-panY }; }

  function draw() {
    time += 0.02;
    ctx.clearRect(0,0,W,H);
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim()||'#0d1117';
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);

    // Animated dots
    ctx.globalAlpha = 0.04;
    for (let x=0;x<W;x+=24) for (let y=0;y<H;y+=24) {
      ctx.fillStyle = `rgba(139,92,246,${0.3+Math.sin(time+x*0.01+y*0.01)*0.3})`;
      ctx.fillRect(x,y,1.5,1.5);
    }
    ctx.globalAlpha = 1;

    // Edges
    edges.forEach(e => {
      const s=toScreen(e.source.x,e.source.y), t=toScreen(e.target.x,e.target.y);
      const isH = khGraphHover===e.source.id||khGraphHover===e.target.id;
      const c = getColor(e.source);
      if (isH) { ctx.beginPath(); ctx.moveTo(s.x,s.y); const mx=(s.x+t.x)/2,my=(s.y+t.y)/2-20; ctx.quadraticCurveTo(mx,my,t.x,t.y); ctx.strokeStyle=c+'40'; ctx.lineWidth=8; ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(s.x,s.y); const mx=(s.x+t.x)/2,my=(s.y+t.y)/2-15; ctx.quadraticCurveTo(mx,my,t.x,t.y);
      ctx.strokeStyle=isH?c:'#555'; ctx.lineWidth=isH?2.5:1; ctx.globalAlpha=isH?0.9:0.2; ctx.stroke(); ctx.globalAlpha=1;
      if (isH) { const pt=(time*2)%1; const px=s.x+(t.x-s.x)*pt, py=s.y+(t.y-s.y)*pt-Math.sin(pt*Math.PI)*20; ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2); ctx.fillStyle=c; ctx.fill(); }
    });

    // Nodes
    nodes.forEach(n => {
      const s=toScreen(n.x,n.y), c=getColor(n), isH=khGraphHover===n.id, isP=khPinned.includes(n.id);
      const baseR=12+Math.min(n.connections,4)*3, pulse=Math.sin(time+n.x*0.01)*1.5, r=isH?baseR+6:baseR+pulse;

      ctx.beginPath(); ctx.arc(s.x,s.y,r+12,0,Math.PI*2); ctx.fillStyle=c+(isH?'18':'08'); ctx.fill();
      const glow=ctx.createRadialGradient(s.x,s.y,r*0.5,s.x,s.y,r+8); glow.addColorStop(0,c+'30'); glow.addColorStop(1,c+'00');
      ctx.beginPath(); ctx.arc(s.x,s.y,r+8,0,Math.PI*2); ctx.fillStyle=glow; ctx.fill();
      ctx.beginPath(); ctx.arc(s.x,s.y+3,r,0,Math.PI*2); ctx.fillStyle='rgba(0,0,0,0.12)'; ctx.fill();
      ctx.beginPath(); ctx.arc(s.x,s.y,r,0,Math.PI*2);
      const grad=ctx.createRadialGradient(s.x-r*0.3,s.y-r*0.3,0,s.x,s.y,r); grad.addColorStop(0,c); grad.addColorStop(1,c+'cc');
      ctx.fillStyle=grad; ctx.fill();
      ctx.beginPath(); ctx.arc(s.x,s.y,r-2,0,Math.PI*2); ctx.strokeStyle='rgba(255,255,255,0.15)'; ctx.lineWidth=1; ctx.stroke();
      ctx.beginPath(); ctx.arc(s.x,s.y,r,0,Math.PI*2); ctx.strokeStyle=isH?'#fff':'rgba(255,255,255,0.2)'; ctx.lineWidth=isH?2.5:1.5; ctx.stroke();
      ctx.font=`${isH?18:14}px system-ui`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(n.icon||'📝',s.x,s.y);
      ctx.font=`${isH?'600 11px':'500 9px'} system-ui,sans-serif`; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillStyle=isH?'#fff':c; ctx.fillText(n.title,s.x,s.y+r+6);
      if (isP) { ctx.font='9px system-ui'; ctx.fillText('📌',s.x+r-2,s.y-r+2); }
    });

    khAnimFrame = requestAnimationFrame(draw);
  }
  draw();

  canvas.onmousemove = e => {
    const world=toWorld(e.offsetX,e.offsetY); let found=null;
    nodes.forEach(n => { if(Math.sqrt((n.x-world.x)**2+(n.y-world.y)**2)<25) found=n.id; });
    khGraphHover=found; canvas.style.cursor=found?'pointer':(dragging?'grabbing':'grab');
    const tt=document.getElementById('kh-tooltip');
    if(tt&&found){const note=khNotes.find(n=>n.id===found);if(note){
      const links=khExtractLinks(note.content), bl=khNotes.filter(x=>khExtractLinks(x.content).some(l=>l.toLowerCase()===note.title.toLowerCase()));
      const prev=note.content.replace(/\[\[([^\]]+)\]\]/g,'$1').replace(/[#*_`$]/g,'').replace(/\n/g,' ').slice(0,150);
      tt.style.display='block'; tt.style.left=(e.clientX+16)+'px'; tt.style.top=(e.clientY-12)+'px';
      tt.innerHTML=`<div style="font-weight:700;font-size:0.82rem;margin-bottom:0.25rem">${note.icon||'📝'} ${note.title}</div><div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:0.3rem;line-height:1.4">${prev}...</div><div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.2rem">${(note.tags||[]).map(t=>`<span style="font-size:0.55rem;background:var(--bg-secondary);color:var(--text-muted);padding:0.08rem 0.3rem;border-radius:8px">#${t}</span>`).join('')}</div><div style="font-size:0.6rem;color:#8b5cf6">${links.length>0?'→ '+links.slice(0,3).join(', ')+(links.length>3?'...':''):''} ${bl.length>0?'· ← '+bl.length+' backlinks':''}</div><div style="font-size:0.58rem;color:#22c55e;margin-top:0.2rem">Click para abrir</div>`;
    }} else if(tt) tt.style.display='none';
    if(dragging){dragging.x=world.x;dragging.y=world.y;} else if(panning&&lastMouse){panX+=(e.offsetX-lastMouse.x)/scale;panY+=(e.offsetY-lastMouse.y)/scale;lastMouse={x:e.offsetX,y:e.offsetY};}
  };
  canvas.onmousedown = e => {
    const world=toWorld(e.offsetX,e.offsetY);
    const node=nodes.find(n=>Math.sqrt((n.x-world.x)**2+(n.y-world.y)**2)<25);
    if(node){dragging=node;canvas.style.cursor='grabbing';} else {panning=true;lastMouse={x:e.offsetX,y:e.offsetY};canvas.style.cursor='grabbing';}
  };
  canvas.onmouseup = e => { if(dragging) khOpenNote(dragging.id); dragging=null;panning=false;lastMouse=null; canvas.style.cursor=khGraphHover?'pointer':'grab'; };
  canvas.onmouseleave = () => { khGraphHover=null;dragging=null;panning=false; const t=document.getElementById('kh-tooltip');if(t)t.style.display='none'; };
  canvas.onwheel = e => { e.preventDefault(); scale=Math.max(0.3,Math.min(3,scale*(e.deltaY<0?1.08:0.92))); };
}

function khRenderList(el) {
  const notes = khGetFilteredNotes().sort((a,b) => new Date(b.updated)-new Date(a.updated));
  const allTags = [...new Set(khNotes.flatMap(n => n.tags||[]))];

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;flex-wrap:wrap;gap:0.4rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><circle cx="12" cy="12" r="2.5"/><path d="M7.5 11l7-3.5M7.5 13l7 3.5"/></svg>
        Knowledge Hub
      </h2>
      <div style="display:flex;gap:0.3rem">
        <button onclick="khSetView('graph')" style="background:var(--bg-secondary);color:var(--text-muted);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem">Red</button>
        <button onclick="khSetView('list')" style="background:#8b5cf618;color:#8b5cf6;border:1px solid #8b5cf640;border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;font-weight:600">Notas</button>
        <button onclick="khNewNote()" style="background:var(--accent);color:white;border:none;border-radius:6px;padding:0.3rem 0.7rem;cursor:pointer;font-size:0.72rem;font-weight:600">+ Nota</button>
      </div>
    </div>
    <div style="display:flex;gap:0.5rem;margin-bottom:0.6rem;align-items:center;flex-wrap:wrap">
      <input id="kh-search" type="text" value="${khSearchQuery}" placeholder="Buscar..."
        style="flex:1;min-width:120px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.35rem 0.6rem;font-size:0.72rem;color:var(--text-primary);outline:none"
        onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'"
        oninput="khSearchQuery=this.value;khRender()">
      ${allTags.slice(0,10).map(t=>`<button onclick="khFilterTag='${khFilterTag===t?null:t}';khRender()" style="font-size:0.6rem;background:${khFilterTag===t?'#8b5cf618':'var(--bg-secondary)'};color:${khFilterTag===t?'#8b5cf6':'var(--text-muted)'};padding:0.15rem 0.4rem;border-radius:10px;border:1px solid ${khFilterTag===t?'#8b5cf640':'var(--border-color)'};cursor:pointer">#${t}</button>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.5rem">
      ${notes.map(n => {
        const links=khExtractLinks(n.content);
        const prev=n.content.replace(/\[\[([^\]]+)\]\]/g,'$1').replace(/[#*_`$]/g,'').replace(/\n/g,' ').slice(0,100);
        return `<div onclick="khOpenNote('${n.id}')" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='#8b5cf6';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='var(--border-color)';this.style.transform='none'">
          <div style="font-size:1.3rem;margin-bottom:0.3rem">${n.icon||'📝'}</div>
          <h3 style="font-size:0.82rem;font-weight:700;color:var(--text-primary);margin:0 0 0.2rem">${n.title}</h3>
          <p style="font-size:0.68rem;color:var(--text-muted);margin:0 0 0.3rem;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${prev}...</p>
          <div style="display:flex;gap:0.3rem;flex-wrap:wrap;align-items:center">
            ${(n.tags||[]).slice(0,3).map(t=>`<span style="font-size:0.55rem;background:var(--bg-secondary);color:var(--text-muted);padding:0.08rem 0.3rem;border-radius:8px">#${t}</span>`).join('')}
            ${links.length>0?`<span style="font-size:0.55rem;color:#8b5cf6">→ ${links.length}</span>`:''}
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function khRenderEditor(el) {
  const note = khNotes.find(n => n.id === khActiveNote);
  if (!note) { khView='graph'; khRender(); return; }
  const links=khExtractLinks(note.content);
  const backlinks=khNotes.filter(x=>x.id!==note.id&&khExtractLinks(x.content).some(l=>l.toLowerCase()===note.title.toLowerCase()));

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.3rem;margin-bottom:0.5rem;flex-wrap:wrap">
      <button onclick="khBackFromEditor()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;color:var(--text-primary)">← Volver</button>
      <button onclick="khTogglePin('${note.id}')" style="background:${khPinned.includes(note.id)?'#f59e0b18':'var(--bg-secondary)'};color:${khPinned.includes(note.id)?'#f59e0b':'var(--text-muted)'};border:1px solid ${khPinned.includes(note.id)?'#f59e0b40':'var(--border-color)'};border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem">${khPinned.includes(note.id)?'📌 Fijada':'📌 Fijar'}</button>
      <div style="flex:1"></div>
      <button onclick="khDeleteNote('${note.id}')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444430;border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem">Eliminar</button>
    </div>

    <div style="display:flex;gap:0.8rem;flex-wrap:wrap">
      <div style="flex:2;min-width:300px">
        <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem">
          <select id="kh-icon" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem;font-size:1.1rem;cursor:pointer;color:var(--text-primary)">
            ${['📝','📐','📊','🔬','💻','⚙️','📚','🧪','💡','🎯','🍎','⚡','🔌','🔥','🏗️','🧠','🧬','📡','🔢','📈','🎲','🎵','🌍','⭐'].map(i=>`<option value="${i}" ${note.icon===i?'selected':''}>${i}</option>`).join('')}
          </select>
          <input id="kh-title" value="${note.title.replace(/"/g,'&quot;')}" placeholder="Título..."
            style="flex:1;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.45rem 0.7rem;font-size:1.05rem;font-weight:700;color:var(--text-primary);outline:none;font-family:var(--font-heading)"
            onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">
        </div>
        <div style="display:flex;gap:0.4rem;margin-bottom:0.5rem;align-items:center;flex-wrap:wrap">
          <span style="font-size:0.68rem;color:var(--text-muted)">Tags:</span>
          <input id="kh-tags" value="${(note.tags||[]).join(', ')}" placeholder="física, cálculo, ..."
            style="flex:1;min-width:120px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.5rem;font-size:0.72rem;color:var(--text-primary);outline:none"
            onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">
        </div>
        <div style="display:flex;gap:0.3rem;margin-bottom:0.4rem;flex-wrap:wrap">
          <button onclick="khInsertFormat('**','**')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary);font-weight:700">B</button>
          <button onclick="khInsertFormat('*','*')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary);font-style:italic">I</button>
          <button onclick="khInsertFormat('[[',']]')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:#8b5cf6">[[]]</button>
          <button onclick="khInsertFormat('$','$')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary)">$...$</button>
          <button onclick="khInsertFormat('$$','$$')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary)">$$...$$</button>
          <button onclick="khInsertFormat('\\n- ','')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary)">• Lista</button>
          <button onclick="khInsertFormat('\\n---\\n','')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary)">—</button>
          <button onclick="khInsertFormat('\\n> ','')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;cursor:pointer;font-size:0.65rem;color:var(--text-primary)">❝ Quote</button>
        </div>
        <textarea id="kh-content" placeholder="Escribí tus apuntes acá...&#10;&#10;Usá [[Nombre]] para vincular&#10;$...$ para math inline&#10;$$...$$ para math block&#10;**negrita** *cursiva* - listas"
          style="width:100%;min-height:320px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem 0.7rem;font-size:0.82rem;color:var(--text-primary);line-height:1.65;outline:none;resize:vertical;font-family:'JetBrains Mono','Cascadia Code','Fira Code',monospace;tab-size:2"
          onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">${note.content}</textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;flex-wrap:wrap;gap:0.3rem">
          <div style="font-size:0.62rem;color:var(--text-muted)">
            ${links.length>0?`🔗 → ${links.map(l=>`<span class="kh-link" onclick="khOpenByTitle('${l}')" style="color:#8b5cf6;cursor:pointer">${l}</span>`).join(', ')}`:''}
          </div>
          <button onclick="khSaveNote('${note.id}')" style="background:var(--accent);color:white;border:none;border-radius:8px;padding:0.4rem 1.2rem;cursor:pointer;font-size:0.78rem;font-weight:600">Guardar</button>
        </div>
      </div>

      <div style="flex:1.5;min-width:250px">
        <div style="font-size:0.68rem;font-weight:600;color:var(--text-muted);margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.5px">Vista previa</div>
        <div class="kh-note-view" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.8rem 1rem;min-height:300px;max-height:500px;overflow-y:auto" id="kh-preview">
          ${khRenderMarkdown(note.content)}
        </div>
        ${backlinks.length>0?`<div style="margin-top:0.6rem"><div style="font-size:0.65rem;font-weight:600;color:var(--text-muted);margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:0.5px">← Backlinks (${backlinks.length})</div>${backlinks.map(bl=>`<div onclick="khOpenNote('${bl.id}')" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.4rem 0.6rem;margin-bottom:0.3rem;cursor:pointer;font-size:0.72rem" onmouseover="this.style.borderColor='#8b5cf6'" onmouseout="this.style.borderColor='var(--border-color)'"><span style="color:#8b5cf6;font-weight:600">${bl.icon||'📝'} ${bl.title}</span></div>`).join('')}</div>`:''}
      </div>
    </div>`;
}

// ─── ACTIONS ───
function khSetView(v) { khView=v; khRender(); }
function khNewNote() {
  const id='note_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);
  khNotes.push({ id, title:'Nueva Nota', content:'', tags:[], icon:'📝', created:new Date().toISOString(), updated:new Date().toISOString() });
  khSave(); khActiveNote=id; khView='editor'; khRender();
  setTimeout(()=>{const t=document.getElementById('kh-title');if(t){t.focus();t.select();}},100);
}
function khOpenNote(id) { khActiveNote=id; khView='editor'; khRender(); }
function khOpenByTitle(title) { const n=khNotes.find(x=>x.title.toLowerCase()===title.toLowerCase()); if(n) khOpenNote(n.id); }
function khBackFromEditor() { if(khActiveNote) khSaveCurrentNote(); khView='graph'; khRender(); }
function khSaveCurrentNote() {
  const note=khNotes.find(n=>n.id===khActiveNote); if(!note) return;
  const t=document.getElementById('kh-title'),c=document.getElementById('kh-content'),tg=document.getElementById('kh-tags'),i=document.getElementById('kh-icon');
  if(t) note.title=t.value||'Sin título'; if(c) note.content=c.value;
  if(tg) note.tags=tg.value.split(',').map(x=>x.trim()).filter(Boolean);
  if(i) note.icon=i.value; note.updated=new Date().toISOString(); khSave();
}
function khSaveNote(id) { khActiveNote=id; khSaveCurrentNote(); const b=event?.target;if(b){b.textContent='✓ Guardado';b.style.background='#22c55e';setTimeout(()=>{b.textContent='Guardar';b.style.background='';},1500);} }
function khDeleteNote(id) { if(!confirm('¿Eliminar esta nota?'))return; khNotes=khNotes.filter(n=>n.id!==id); khPinned=khPinned.filter(p=>p!==id); khSave(); khView='graph'; khRender(); }
function khTogglePin(id) { if(khPinned.includes(id))khPinned=khPinned.filter(p=>p!==id);else khPinned.push(id); khSave(); khRender(); }
function khInsertFormat(before,after) { const ta=document.getElementById('kh-content');if(!ta)return;const s=ta.selectionStart,e=ta.selectionEnd;ta.setRangeText(before+(ta.value.substring(s,e)||'...')+after,s,e,'select');ta.focus(); }

window.khRender=khRender; window.khSetView=khSetView; window.khNewNote=khNewNote;
window.khOpenNote=khOpenNote; window.khOpenByTitle=khOpenByTitle; window.khBackFromEditor=khBackFromEditor;
window.khSaveNote=khSaveNote; window.khDeleteNote=khDeleteNote; window.khTogglePin=khTogglePin; window.khInsertFormat=khInsertFormat;
