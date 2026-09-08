// knowledge-hub.js - Obsidian-style: tomá apuntes, vinculalos, veá la red de tu conocimiento
const KH_STORAGE = 'fiuba_knowledge_hub';

let khNotes = [];
let khActiveNote = null;
let khView = 'graph'; // 'graph' | 'editor' | 'list'
let khGraphHover = null;

function khInit() {
  try { khNotes = JSON.parse(localStorage.getItem(KH_STORAGE) || '[]'); } catch { khNotes = []; }
  if (khNotes.length === 0) khCreateStarterNotes();
}

function khSave() { localStorage.setItem(KH_STORAGE, JSON.stringify(khNotes)); }

function khCreateStarterNotes() {
  const starters = [
    { title: 'Leyes de Newton', content: 'Las tres leyes del movimiento de [[Isaac Newton]].\n\n**1ª Ley (Inercia):** Un cuerpo en reposo tiende a permanecer en reposo.\n**2ª Ley (F=ma):** La fuerza es masa por aceleración.\n**3ª Ley (Acción-Reacción:** Toda acción tiene una reacción igual y opuesta.\n\nRelacionado con: [[Energía Cinética]], [[Termodinámica]]', tags: ['física', 'mecánica'] },
    { title: 'Energía Cinética', content: 'La energía que posee un cuerpo por su movimiento.\n\n$$KE = \\frac{1}{2}mv^2$$\n\nDepende de la masa y la velocidad al cuadrado. Si duplicás la velocidad, cuadruplicás la energía.\n\nRelacionado con: [[Leyes de Newton]], [[Trabajo y Energía]]', tags: ['física', 'energía'] },
    { title: 'Ley de Ohm', content: 'Relaciona voltaje, corriente y resistencia.\n\n$$V = I \\cdot R$$\n\n- **V** = Voltaje (Voltios)\n- **I** = Corriente (Amperios)\n- **R** = Resistencia (Ohms)\\n\nFundamento de toda la [[Electrónica]].', tags: ['física', 'electricidad'] },
    { title: 'Termodinámica', content: 'Rama de la física que estudia el calor y la energía.\n\n**Ley 0:** Equilibrio térmico.\n**Ley 1:** Conservación de la energía.\n**Ley 2:** La entropía siempre increase.\n**Ley 3:** Imposible llegar al cero absoluto.\n\nRelacionado con: [[Máquinas Térmicas]], [[Entropía]]', tags: ['física', 'termodinámica'] },
    { title: 'Cálculo I', content: 'Análisis de [[funciones]], derivadas y límites.\n\n**Derivada:** Tasa de cambio instantánea.\n$$f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$\n\n**Reglas:**\n- Regla de la cadena\n- Producto y cociente\n- Derivadas de trigonométricas\n\nRelacionado con: [[Cálculo II]], [[Álgebra Lineal]]', tags: ['matemática', 'cálculo'] },
    { title: 'Álgebra Lineal', content: 'Estudio de vectores, matrices y transformaciones lineales.\n\n**Conceptos clave:**\n- Vectores y espacios vectoriales\n- Matrices y determinantes\n- Autovalores y autovectores\n- Transformaciones lineales\n\nFundamental para: [[Inteligencia Artificial]], [[Señales]]', tags: ['matemática', 'álgebra'] },
    { title: 'Programación', content: 'Arte de escribir instrucciones para computadoras.\n\n**Paradigmas:**\n- Imperativo (C, Python)\n- Orientado a objetos (Java, C++)\n- Funcional (Haskell, Lisp)\n\n**Conceptos:** Variables, bucles, funciones, estructuras de datos.\n\nRelacionado con: [[Estructuras de Datos]], [[Algoritmos]]', tags: ['computación', 'programación'] },
    { title: 'Inteligencia Artificial', content: 'Campo de la computación que busca crear máquinas inteligentes.\n\n**Subcampos:**\n- Machine Learning\n- Deep Learning\n- Procesamiento de Lenguaje Natural\n- Visión por Computadora\n\nRequiere: [[Álgebra Lineal]], [[Probabilidad]], [[Programación]]\n\nRelacionado con: [[Redes Neuronales]]', tags: ['computación', 'ia'] },
    { title: 'Circuitos Eléctricos', content: 'Análisis de circuitos RLC.\n\n**Leyes de Kirchhoff:**\n- KCL: Suma de corrientes = 0 en un nodo\n- KVL: Suma de voltajes = 0 en una malla\n\n**Componentes:** Resistencia, Condensador, Inductor\n\nRelacionado con: [[Ley de Ohm]], [[Electrónica]]', tags: ['ingeniería', 'electricidad'] },
    { title: 'Estructuras', content: 'Resistencia de materiales y análisis estructural.\n\n**Tensiones:**\n- Normal: σ = F/A\n- Cortante: τ = V/A\n- Flexión: σ = My/I\n\n**Deformación:** E = σ/ε (Módulo de Young)\n\nRelacionado con: [[Materiales]], [[Construcción]]', tags: ['ingeniería', 'mecánica'] },
  ];

  starters.forEach(s => {
    khNotes.push({
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      title: s.title,
      content: s.content,
      tags: s.tags || [],
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

  khNotes.forEach(note => {
    nodeMap[note.title.toLowerCase()] = note.id;
    nodes.push({ id: note.id, title: note.title, tags: note.tags, size: (note.content || '').length });
  });

  khNotes.forEach(note => {
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

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;flex-wrap:wrap;gap:0.4rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.6 7.4l6.8 9.2M15.4 7.4l-6.8 9.2"/></svg>
        Knowledge Hub
      </h2>
      <div style="display:flex;gap:0.3rem">
        <button onclick="khSetView('graph')" style="background:${khView==='graph'?'#8b5cf618':'var(--bg-secondary)'};color:${khView==='graph'?'#8b5cf6':'var(--text-muted)'};border:1px solid ${khView==='graph'?'#8b5cf640':'var(--border-color)'};border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;font-weight:600">Grafo</button>
        <button onclick="khSetView('list')" style="background:${khView==='list'?'#8b5cf618':'var(--bg-secondary)'};color:${khView==='list'?'#8b5cf6':'var(--text-muted)'};border:1px solid ${khView==='list'?'#8b5cf640':'var(--border-color)'};border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;font-weight:600">Lista</button>
        <button onclick="khNewNote()" style="background:var(--accent);color:white;border:none;border-radius:6px;padding:0.3rem 0.7rem;cursor:pointer;font-size:0.72rem;font-weight:600">+ Nota</button>
      </div>
    </div>

    <div style="position:relative;background:var(--bg-card);border:1.5px solid var(--border-color);border-radius:12px;overflow:hidden;margin-bottom:0.6rem">
      <canvas id="kh-canvas" style="width:100%;height:420px;display:block;cursor:grab"></canvas>
      <div id="kh-tooltip" style="display:none;position:fixed;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem 0.7rem;font-size:0.72rem;color:var(--text-primary);pointer-events:none;z-index:100;box-shadow:0 4px 12px rgba(0,0,0,0.15);max-width:250px"></div>
      <div style="position:absolute;bottom:8px;left:10px;font-size:0.6rem;color:var(--text-muted);opacity:0.5">Hover = ver nota · Click = abrir · Drag = mover · Scroll = zoom</div>
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:0.3rem;margin-bottom:0.5rem">
      <span style="font-size:0.65rem;color:var(--text-muted);line-height:1.8">Tags:</span>
      ${allTags.map(t => `<span style="font-size:0.6rem;background:var(--bg-secondary);color:var(--text-muted);padding:0.1rem 0.4rem;border-radius:10px;border:1px solid var(--border-color)">#${t}</span>`).join('')}
    </div>

    <div style="font-size:0.7rem;color:var(--text-muted);text-align:center">${khNotes.length} notas · ${khGetGraph().edges.length} conexiones</div>`;

  setTimeout(() => khSetupCanvas(), 50);
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
  if (graph.nodes.length === 0) return;

  // Position nodes with force simulation
  const nodes = graph.nodes.map((n, i) => ({
    ...n,
    x: W / 2 + (Math.random() - 0.5) * 200,
    y: H / 2 + (Math.random() - 0.5) * 200,
    vx: 0, vy: 0,
    fx: null, fy: null,
  }));
  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  const edges = graph.edges.map(e => ({
    source: nodeMap[e.source],
    target: nodeMap[e.target],
  })).filter(e => e.source && e.target);

  // Simple force simulation
  function tick() {
    const k = 0.01; // spring
    const repulsion = 3000;
    const damping = 0.85;
    const center = { x: W / 2, y: H / 2 };

    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = nodes[j].x - nodes[i].x;
        let dy = nodes[j].y - nodes[i].y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let force = repulsion / (dist * dist);
        let fx = (dx / dist) * force;
        let fy = (dy / dist) * force;
        nodes[i].vx -= fx; nodes[i].vy -= fy;
        nodes[j].vx += fx; nodes[j].vy += fy;
      }
    }

    // Spring attraction for edges
    edges.forEach(e => {
      let dx = e.target.x - e.source.x;
      let dy = e.target.y - e.source.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let force = k * (dist - 100);
      let fx = (dx / dist) * force;
      let fy = (dy / dist) * force;
      e.source.vx += fx; e.source.vy += fy;
      e.target.vx -= fx; e.target.vy -= fy;
    });

    // Center gravity
    nodes.forEach(n => {
      n.vx += (center.x - n.x) * 0.001;
      n.vy += (center.y - n.y) * 0.001;
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
      // Bounds
      n.x = Math.max(30, Math.min(W - 30, n.x));
      n.y = Math.max(30, Math.min(H - 30, n.y));
    });
  }

  // Run simulation
  for (let i = 0; i < 200; i++) tick();

  const catColors = {
    'física': '#8b5cf6', 'mecánica': '#8b5cf6', 'electricidad': '#f59e0b', 'energía': '#f59e0b',
    'termodinámica': '#ef4444', 'matemática': '#3b82f6', 'cálculo': '#3b82f6', 'álgebra': '#3b82f6',
    'computación': '#22c55e', 'programación': '#22c55e', 'ia': '#ec4899',
    'ingeniería': '#f59e0b', 'default': '#6b7280',
  };
  function getNoteColor(note) {
    for (const t of (note.tags || [])) {
      if (catColors[t]) return catColors[t];
    }
    return catColors.default;
  }

  let scale = 1, panX = 0, panY = 0;
  let dragging = null, panning = false, lastMouse = null;

  function toScreen(x, y) { return { x: (x + panX) * scale + W / 2, y: (y + panY) * scale + H / 2 }; }
  function toWorld(sx, sy) { return { x: (sx - W / 2) / scale - panX, y: (sy - H / 2) / scale - panY }; }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const cs = getComputedStyle(document.documentElement);
    const bg = cs.getPropertyValue('--bg-card').trim() || '#fff';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Edges
    edges.forEach(e => {
      const s = toScreen(e.source.x, e.source.y);
      const t = toScreen(e.target.x, e.target.y);
      const isHovered = khGraphHover === e.source.id || khGraphHover === e.target.id;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = isHovered ? '#8b5cf6' : '#555';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.globalAlpha = isHovered ? 0.8 : 0.25;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Nodes
    nodes.forEach(n => {
      const s = toScreen(n.x, n.y);
      const color = getNoteColor(n);
      const isHovered = khGraphHover === n.id;
      const r = isHovered ? 16 : 10;

      // Glow
      if (isHovered) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = color + '30';
        ctx.fill();
      }

      // Circle
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = isHovered ? 1 : 0.75;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Border
      ctx.strokeStyle = color;
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.stroke();

      // Label
      ctx.font = `${isHovered ? '600 11px' : '500 9px'} system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = color;
      ctx.fillText(n.title, s.x, s.y + r + 13);
    });

    requestAnimationFrame(draw);
  }
  draw();

  // Interactions
  canvas.addEventListener('mousemove', e => {
    const world = toWorld(e.offsetX, e.offsetY);
    let found = null;
    nodes.forEach(n => {
      const dx = n.x - world.x, dy = n.y - world.y;
      if (Math.sqrt(dx * dx + dy * dy) < 20) found = n.id;
    });
    khGraphHover = found;
    canvas.style.cursor = found ? 'pointer' : (dragging ? 'grabbing' : 'grab');

    const tooltip = document.getElementById('kh-tooltip');
    if (tooltip && found) {
      const note = khNotes.find(n => n.id === found);
      if (note) {
        const links = khExtractLinks(note.content);
        const backlinks = khNotes.filter(n => khExtractLinks(n.content).some(l => l.toLowerCase() === note.title.toLowerCase()));
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY - 10) + 'px';
        tooltip.innerHTML = `
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:0.2rem">${note.title}</div>
          <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:0.2rem">${note.content.slice(0, 120)}${note.content.length > 120 ? '...' : ''}</div>
          <div style="font-size:0.6rem;color:var(--accent)">${links.length > 0 ? '→ ' + links.join(', ') : ''} ${backlinks.length > 0 ? '← ' + backlinks.length + ' backlinks' : ''}</div>
          <div style="font-size:0.58rem;color:#22c55e;margin-top:0.15rem">Click para abrir</div>`;
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
      return Math.sqrt(dx * dx + dy * dy) < 20;
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
      // If barely moved, treat as click → open note
      const world = toWorld(e.offsetX, e.offsetY);
      const dx = dragging.x - world.x, dy = dragging.y - world.y;
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        khOpenNote(dragging.id);
      }
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
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0">📝 Notas</h2>
      <div style="display:flex;gap:0.3rem">
        <button onclick="khSetView('graph')" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;color:var(--text-muted)">Grafo</button>
        <button onclick="khNewNote()" style="background:var(--accent);color:white;border:none;border-radius:6px;padding:0.3rem 0.7rem;cursor:pointer;font-size:0.72rem;font-weight:600">+ Nota</button>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.4rem">
      ${khNotes.sort((a, b) => new Date(b.updated) - new Date(a.updated)).map(n => {
        const links = khExtractLinks(n.content);
        const preview = n.content.replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/[#*_`]/g, '').slice(0, 100);
        return `
          <div onclick="khOpenNote('${n.id}')" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;cursor:pointer;transition:border-color 0.15s" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border-color)'">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.2rem">
              <h3 style="font-size:0.85rem;font-weight:700;color:var(--text-primary);margin:0">${n.title}</h3>
              <span style="font-size:0.58rem;color:var(--text-muted)">${new Date(n.updated).toLocaleDateString('es-AR')}</span>
            </div>
            <p style="font-size:0.72rem;color:var(--text-muted);margin:0 0 0.3rem;line-height:1.4">${preview}...</p>
            <div style="display:flex;gap:0.3rem;flex-wrap:wrap">
              ${(n.tags || []).map(t => `<span style="font-size:0.55rem;background:var(--bg-secondary);color:var(--text-muted);padding:0.1rem 0.3rem;border-radius:8px">#${t}</span>`).join('')}
              ${links.length > 0 ? `<span style="font-size:0.55rem;color:var(--accent)">→ ${links.length} links</span>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

function khRenderEditor(el) {
  const note = khNotes.find(n => n.id === khActiveNote);
  if (!note) { khView = 'graph'; khRender(); return; }
  const links = khExtractLinks(note.content);

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.6rem;flex-wrap:wrap">
      <button onclick="khBackFromEditor()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem;color:var(--text-primary)">← Volver</button>
      <button onclick="khDeleteNote('${note.id}')" style="background:#ef444418;color:#ef4444;border:1px solid #ef444430;border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.72rem">Eliminar</button>
    </div>

    <input id="kh-title" value="${note.title.replace(/"/g, '&quot;')}" placeholder="Título de la nota..."
      style="width:100%;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem 0.7rem;font-size:1.1rem;font-weight:700;color:var(--text-primary);margin-bottom:0.5rem;outline:none;font-family:var(--font-heading)"
      onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border-color)'">

    <div style="display:flex;gap:0.4rem;margin-bottom:0.5rem;align-items:center">
      <span style="font-size:0.7rem;color:var(--text-muted)">Tags:</span>
      <input id="kh-tags" value="${(note.tags || []).join(', ')}" placeholder="física, cálculo, ..."
        style="flex:1;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.5rem;font-size:0.72rem;color:var(--text-primary);outline:none">
    </div>

    <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:0.4rem">Usá <code style="background:var(--bg-secondary);padding:0.1rem 0.3rem;border-radius:3px">[[Nombre de Nota]]</code> para vincular notas</div>

    <textarea id="kh-content" placeholder="Escribí tus apuntes acá...&#10;&#10;Usá [[Nombre]] para vincular a otras notas.&#10;Ej: Relacionado con [[Leyes de Newton]]"
      style="width:100%;min-height:250px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem 0.7rem;font-size:0.82rem;color:var(--text-primary);line-height:1.6;outline:none;resize:vertical;font-family:'JetBrains Mono','Cascadia Code',monospace;tab-size:2"
      onfocus="this.style.borderColor='var(--accent)'" onblur="this.style.borderColor='var(--border-color)'">${note.content}</textarea>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.5rem;flex-wrap:wrap;gap:0.4rem">
      <div style="font-size:0.65rem;color:var(--text-muted)">
        ${links.length > 0 ? `🔗 Vinculado a: ${links.map(l => `<span style="color:var(--accent)">${l}</span>`).join(', ')}` : 'Sin vínculos aún'}
      </div>
      <button onclick="khSaveNote('${note.id}')" style="background:var(--accent);color:white;border:none;border-radius:8px;padding:0.4rem 1rem;cursor:pointer;font-size:0.78rem;font-weight:600">Guardar</button>
    </div>`;
}

// ─── ACTIONS ───
function khSetView(v) { khView = v; khRender(); }

function khNewNote() {
  const id = 'note_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
  const note = { id, title: 'Nueva Nota', content: '', tags: [], created: new Date().toISOString(), updated: new Date().toISOString() };
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

function khBackFromEditor() {
  // Save before leaving
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
  if (titleEl) note.title = titleEl.value || 'Sin título';
  if (contentEl) note.content = contentEl.value;
  if (tagsEl) note.tags = tagsEl.value.split(',').map(t => t.trim()).filter(Boolean);
  note.updated = new Date().toISOString();
  khSave();
}

function khSaveNote(id) {
  khActiveNote = id;
  khSaveCurrentNote();
  // Visual feedback
  const btn = event?.target;
  if (btn) { btn.textContent = '✓ Guardado'; setTimeout(() => { btn.textContent = 'Guardar'; }, 1500); }
}

function khDeleteNote(id) {
  if (!confirm('¿Eliminar esta nota?')) return;
  khNotes = khNotes.filter(n => n.id !== id);
  khSave();
  khView = 'graph';
  khRender();
}

window.khRender = khRender;
window.khSetView = khSetView;
window.khNewNote = khNewNote;
window.khOpenNote = khOpenNote;
window.khBackFromEditor = khBackFromEditor;
window.khSaveNote = khSaveNote;
window.khDeleteNote = khDeleteNote;
