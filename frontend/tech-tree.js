// knowledge-graph.js - Knowledge Graph: red neuronal visual que crece cuando aprendés
const KG_STORAGE = 'fiuba_knowledge_graph';

// Knowledge nodes — cada uno es un concepto que podés desbloquear
const KG_NODES = [
  // PHYSICS
  { id: 'newton_laws', name: 'Leyes de Newton', cat: 'physics', tier: 1, desc: 'F=ma, acción-reacción, inercia', source: 'lab' },
  { id: 'energy', name: 'Energía', cat: 'physics', tier: 1, desc: 'Cinética, potencial, conservación', source: 'lab' },
  { id: 'thermo', name: 'Termodinámica', cat: 'physics', tier: 2, desc: 'Calor, entropía, máquinas térmicas', source: 'lab' },
  { id: 'electro', name: 'Electricidad', cat: 'physics', tier: 2, desc: 'Voltaje, corriente, resistencia', source: 'lab' },
  { id: 'magnetism', name: 'Electromagnetismo', cat: 'physics', tier: 3, desc: 'Campos magnéticos, inducción', source: 'lab' },
  { id: 'waves', name: 'Ondas', cat: 'physics', tier: 2, desc: 'Sonido, luz, interferencia', source: 'chat' },
  { id: 'optics', name: 'Óptica', cat: 'physics', tier: 3, desc: 'Reflexión, refracción, lentes', source: 'chat' },
  { id: 'quantum', name: 'Mecánica Cuántica', cat: 'physics', tier: 4, desc: 'Partículas, dualidad onda-partícula', source: 'chat' },
  { id: 'relativity', name: 'Relatividad', cat: 'physics', tier: 4, desc: 'Espacio-tiempo, E=mc²', source: 'chat' },
  { id: 'fluid_mech', name: 'Mecánica de Fluidos', cat: 'physics', tier: 3, desc: 'Presión, caudal, Bernoulli', source: 'lab' },

  // MATH
  { id: 'algebra', name: 'Álgebra', cat: 'math', tier: 1, desc: 'Ecuaciones, polinomios, sistemas', source: 'quiz' },
  { id: 'calc_1', name: 'Cálculo I', cat: 'math', tier: 1, desc: 'Límites, derivadas', source: 'quiz' },
  { id: 'calc_2', name: 'Cálculo II', cat: 'math', tier: 2, desc: 'Integrales, series', source: 'quiz' },
  { id: 'la', name: 'Álgebra Lineal', cat: 'math', tier: 2, desc: 'Matrices, vectores, autovalores', source: 'quiz' },
  { id: 'ode', name: 'EDOs', cat: 'math', tier: 3, desc: 'Ecuaciones diferenciales ordinarias', source: 'chat' },
  { id: 'probability', name: 'Probabilidad', cat: 'math', tier: 2, desc: 'Distribuciones, estadística', source: 'quiz' },
  { id: 'complex', name: 'Números Complejos', cat: 'math', tier: 3, desc: 'Plano complejo, raíces', source: 'chat' },
  { id: 'num_methods', name: 'Métodos Numéricos', cat: 'math', tier: 3, desc: 'Aproximación, interpolación', source: 'chat' },

  // ENGINEERING
  { id: 'circuits', name: 'Circuitos', cat: 'engineering', tier: 2, desc: 'Análisis de circuitos RLC', source: 'lab' },
  { id: 'structures', name: 'Estructuras', cat: 'engineering', tier: 2, desc: 'Resistencia de materiales', source: 'chat' },
  { id: 'control', name: 'Control Automático', cat: 'engineering', tier: 3, desc: 'Retroalimentación, estabilidad', source: 'chat' },
  { id: 'signals', name: 'Señales', cat: 'engineering', tier: 3, desc: 'Transformada de Fourier, filtrado', source: 'chat' },
  { id: 'materials', name: 'Materiales', cat: 'engineering', tier: 2, desc: 'Propiedades mecánicas, deformación', source: 'chat' },
  { id: 'thermo_eng', name: 'Termodinámica Appl.', cat: 'engineering', tier: 3, desc: 'Ciclos de potencia, refrigeración', source: 'lab' },
  { id: 'manufacture', name: 'Manufactura', cat: 'engineering', tier: 3, desc: 'Procesos de fabricación', source: 'chat' },

  // COMPUTING
  { id: 'prog', name: 'Programación', cat: 'computing', tier: 1, desc: 'Lógica, algoritmos, código', source: 'playground' },
  { id: 'data_struct', name: 'Estructuras de Datos', cat: 'computing', tier: 2, desc: 'Listas, árboles, grafos', source: 'playground' },
  { id: 'algorithms', name: 'Algoritmos', cat: 'computing', tier: 2, desc: 'Complejidad, ordenamiento, búsqueda', source: 'playground' },
  { id: 'os', name: 'Sistemas Operativos', cat: 'computing', tier: 3, desc: 'Procesos, memoria, concurrencia', source: 'chat' },
  { id: 'networks', name: 'Redes', cat: 'computing', tier: 3, desc: 'TCP/IP, HTTP, routing', source: 'chat' },
  { id: 'ai', name: 'Inteligencia Artificial', cat: 'computing', tier: 4, desc: 'ML, redes neuronales, LLMs', source: 'chat' },
  { id: 'db', name: 'Bases de Datos', cat: 'computing', tier: 2, desc: 'SQL, modelado, normalización', source: 'chat' },

  // CROSS-DISCIPLINARY
  { id: 'robotics', name: 'Robótica', cat: 'cross', tier: 4, desc: 'Mecatrónica, sensores, actuadores', source: 'lab', deps: ['control', 'prog', 'circuits'] },
  { id: 'aerospace', name: 'Aeroespacial', cat: 'cross', tier: 4, desc: 'Propulsión, órbitas, aerodinámica', source: 'lab', deps: ['fluid_mech', 'newton_laws', 'materials'] },
  { id: 'biotech', name: 'Biotecnología', cat: 'cross', tier: 4, desc: 'Bioinformática, genómica', source: 'chat', deps: ['prog', 'probability'] },
  { id: 'fintech', name: 'Fintech', cat: 'cross', tier: 3, desc: 'Modelado financiero, riesgo', source: 'chat', deps: ['probability', 'prog'] },
  { id: 'energy_sys', name: 'Sistemas Energéticos', cat: 'cross', tier: 3, desc: 'Redes eléctricas, renovables', source: 'lab', deps: ['electro', 'thermo'] },
  { id: 'telecom', name: 'Telecomunicaciones', cat: 'cross', tier: 3, desc: 'Modulación, antenas, espectro', source: 'chat', deps: ['waves', 'signals'] },
];

const KG_EDGES = [
  // Physics internal
  ['newton_laws', 'energy'], ['newton_laws', 'fluid_mech'], ['energy', 'thermo'],
  ['electro', 'magnetism'], ['electro', 'circuits'], ['magnetism', 'waves'],
  ['waves', 'optics'], ['quantum', 'relativity'], ['thermo', 'thermo_eng'],
  // Math internal
  ['algebra', 'calc_1'], ['calc_1', 'calc_2'], ['calc_2', 'ode'],
  ['algebra', 'la'], ['la', 'ode'], ['probability', 'num_methods'],
  ['calc_1', 'complex'], ['complex', 'signals'],
  // Engineering internal
  ['circuits', 'signals'], ['circuits', 'control'], ['structures', 'materials'],
  ['control', 'signals'], ['thermo_eng', 'energy_sys'],
  // Computing internal
  ['prog', 'data_struct'], ['data_struct', 'algorithms'], ['prog', 'db'],
  ['os', 'networks'], ['algorithms', 'ai'], ['db', 'ai'],
  // Cross connections
  ['newton_laws', 'algebra'], ['calc_1', 'energy'], ['la', 'circuits'],
  ['electro', 'prog'], ['control', 'ai'], ['signals', 'networks'],
  ['materials', 'structures'], ['thermo', 'thermo_eng'],
  ['prog', 'algorithms'], ['probability', 'ai'],
  ['waves', 'telecom'], ['magnetism', 'energy_sys'],
];

const KG_CATEGORIES = {
  physics: { name: 'Física', color: '#8b5cf6', glow: '#8b5cf640' },
  math: { name: 'Matemática', color: '#3b82f6', glow: '#3b82f640' },
  engineering: { name: 'Ingeniería', color: '#f59e0b', glow: '#f59e0b40' },
  computing: { name: 'Computación', color: '#22c55e', glow: '#22c55e40' },
  cross: { name: 'Interdisciplinario', color: '#ec4899', glow: '#ec489940' },
};

let kgNodes = []; // Runtime nodes with positions
let kgUnlocked = {};
let kgDragging = null;
let kgOffset = { x: 0, y: 0 };
let kgHovered = null;
let kgAnimFrame = null;

function kgInit() {
  try { kgUnlocked = JSON.parse(localStorage.getItem(KG_STORAGE) || '{}'); } catch { kgUnlocked = {}; }
  // Always unlock basics
  ['newton_laws', 'algebra', 'prog'].forEach(id => {
    if (!kgUnlocked[id]) kgUnlocked[id] = { date: new Date().toISOString(), source: 'start' };
  });
  kgSave();
}

function kgSave() {
  localStorage.setItem(KG_STORAGE, JSON.stringify(kgUnlocked));
}

function kgUnlockNode(id, source) {
  if (kgUnlocked[id]) return false;
  const node = KG_NODES.find(n => n.id === id);
  if (!node) return false;
  // Check deps if any
  if (node.deps && node.deps.length > 0) {
    if (!node.deps.every(d => kgUnlocked[d])) return false;
  }
  kgUnlocked[id] = { date: new Date().toISOString(), source: source || 'unknown' };
  kgSave();
  return true;
}

function kgGetUnlockedCount() { return Object.keys(kgUnlocked).length; }

// Build graph layout
function kgBuildGraph() {
  const W = 800, H = 500;
  const cx = W / 2, cy = H / 2;
  kgNodes = [];

  // Group by category
  const cats = {};
  KG_NODES.forEach(n => {
    if (!cats[n.cat]) cats[n.cat] = [];
    cats[n.cat].push(n);
  });

  const catKeys = Object.keys(cats);
  const catAngleStep = (Math.PI * 2) / catKeys.length;

  catKeys.forEach((cat, ci) => {
    const baseAngle = catAngleStep * ci - Math.PI / 2;
    const nodes = cats[cat];
    const radius = 140 + ci * 20;
    nodes.forEach((node, ni) => {
      const spread = 0.6;
      const angle = baseAngle + (ni - (nodes.length - 1) / 2) * spread * 0.4;
      const r = radius + (ni % 2) * 30;
      kgNodes.push({
        ...node,
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 20,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 20,
        vx: 0, vy: 0,
        targetX: cx + Math.cos(angle) * r,
        targetY: cy + Math.sin(angle) * r,
      });
    });
  });
}

function kgRender() {
  const el = document.getElementById('tech-tree-content');
  if (!el) return;
  kgInit();
  kgBuildGraph();

  const unlocked = kgGetUnlockedCount();
  const total = KG_NODES.length;
  const recentUnlocks = Object.entries(kgUnlocked)
    .sort((a, b) => new Date(b[1].date) - new Date(a[1].date))
    .slice(0, 5);

  el.innerHTML = `
    <div style="text-align:center;margin-bottom:0.8rem">
      <h2 style="font-family:var(--font-heading);font-size:1.3rem;color:var(--text-primary);margin:0">🧠 Knowledge Graph</h2>
      <p style="font-size:0.78rem;color:var(--text-muted);margin:0.2rem 0 0">Tu red de conocimiento crece cuando aprendés</p>
      <div style="margin-top:0.4rem;display:flex;justify-content:center;gap:1.2rem;flex-wrap:wrap">
        <span style="font-size:0.72rem;color:var(--accent);font-weight:700">🧠 ${unlocked}/${total} conceptos</span>
        <span style="font-size:0.72rem;color:var(--text-muted)">🔬 Lab → Física · 📝 Quiz → Matemática · 💻 Playground → Computación · 💬 Chat → Ingeniería</span>
      </div>
    </div>

    <div style="position:relative;background:var(--bg-card);border:1.5px solid var(--border-color);border-radius:12px;overflow:hidden;margin-bottom:0.8rem">
      <canvas id="kg-canvas" style="width:100%;height:450px;display:block;cursor:grab"></canvas>
      <div id="kg-tooltip" style="display:none;position:fixed;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem 0.7rem;font-size:0.72rem;color:var(--text-primary);pointer-events:none;z-index:100;box-shadow:0 4px 12px rgba(0,0,0,0.15);max-width:220px"></div>
      <div style="position:absolute;bottom:8px;left:10px;font-size:0.6rem;color:var(--text-muted);opacity:0.5">Arrastrá para mover · Scroll para zoom · Hover para info</div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:0.5rem;margin-bottom:0.8rem">
      ${Object.entries(KG_CATEGORIES).map(([k, v]) => {
        const count = KG_NODES.filter(n => n.cat === k && kgUnlocked[n.id]).length;
        const total = KG_NODES.filter(n => n.cat === k).length;
        return `<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem;text-align:center">
          <div style="width:10px;height:10px;border-radius:50%;background:${v.color};margin:0 auto 0.3rem"></div>
          <div style="font-size:0.7rem;font-weight:700;color:var(--text-primary)">${v.name}</div>
          <div style="font-size:0.62rem;color:var(--text-muted)">${count}/${total}</div>
        </div>`;
      }).join('')}
    </div>

    ${recentUnlocks.length > 0 ? `
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem">
      <h3 style="font-size:0.78rem;font-weight:700;color:var(--text-primary);margin:0 0 0.4rem">📅 Últimos descubrimientos</h3>
      ${recentUnlocks.map(([id, data]) => {
        const node = KG_NODES.find(n => n.id === id);
        if (!node) return '';
        const cat = KG_CATEGORIES[node.cat];
        const ago = kgTimeAgo(new Date(data.date));
        return `<div style="display:flex;align-items:center;gap:0.4rem;padding:0.2rem 0;font-size:0.7rem">
          <span style="width:8px;height:8px;border-radius:50%;background:${cat.color};flex-shrink:0"></span>
          <span style="color:var(--text-primary);font-weight:600">${node.name}</span>
          <span style="color:var(--text-muted);font-size:0.62rem">· ${cat.name} · ${ago}</span>
        </div>`;
      }).join('')}
    </div>` : ''}`;

  setTimeout(() => kgSetupCanvas(), 50);
}

function kgTimeAgo(date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return mins + 'min';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h';
  return Math.floor(hrs / 24) + 'd';
}

function kgSetupCanvas() {
  const canvas = document.getElementById('kg-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;

  let scale = 1, panX = 0, panY = 0;
  let dragging = false, dragNode = null, lastMouse = null;

  function toScreen(x, y) { return { x: (x + panX) * scale + W / 2, y: (y + panY) * scale + H / 2 }; }
  function toWorld(sx, sy) { return { x: (sx - W / 2) / scale - panX, y: (sy - H / 2) / scale - panY }; }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const cs = getComputedStyle(document.documentElement);
    const bg = cs.getPropertyValue('--bg-card').trim() || '#fff';
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Draw edges
    KG_EDGES.forEach(([a, b]) => {
      const na = kgNodes.find(n => n.id === a);
      const nb = kgNodes.find(n => n.id === b);
      if (!na || !nb) return;
      const sa = toScreen(na.x, na.y);
      const sb = toScreen(nb.x, nb.y);
      const bothUnlocked = kgUnlocked[a] && kgUnlocked[b];
      const oneUnlocked = kgUnlocked[a] || kgUnlocked[b];

      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      if (bothUnlocked) {
        ctx.strokeStyle = KG_CATEGORIES[na.cat]?.color || '#666';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
      } else if (oneUnlocked) {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.15;
        ctx.setLineDash([4, 4]);
      } else {
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.08;
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    });

    // Draw nodes
    kgNodes.forEach(node => {
      const s = toScreen(node.x, node.y);
      const isUnlocked = !!kgUnlocked[node.id];
      const cat = KG_CATEGORIES[node.cat];
      const isHovered = kgHovered === node.id;
      const r = isUnlocked ? (isHovered ? 18 : 14) : (isHovered ? 10 : 7);

      if (isUnlocked) {
        // Glow
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = cat.glow;
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      if (isUnlocked) {
        ctx.fillStyle = cat.color;
        ctx.globalAlpha = isHovered ? 1 : 0.85;
      } else {
        ctx.fillStyle = '#374151';
        ctx.globalAlpha = isHovered ? 0.5 : 0.25;
      }
      ctx.fill();
      ctx.globalAlpha = 1;

      // Border
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = isUnlocked ? cat.color : '#555';
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.stroke();

      // Label
      if (isUnlocked || isHovered) {
        ctx.font = `${isUnlocked ? '600' : '500'} ${isHovered ? '11' : '9'}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = isUnlocked ? cat.color : '#888';
        ctx.globalAlpha = isUnlocked ? 1 : 0.6;
        ctx.fillText(node.name, s.x, s.y + r + 13);
        ctx.globalAlpha = 1;
      }
    });

    kgAnimFrame = requestAnimationFrame(draw);
  }

  draw();

  // Mouse interactions
  canvas.addEventListener('mousedown', e => {
    const world = toWorld(e.offsetX, e.offsetY);
    const node = kgNodes.find(n => {
      const dx = n.x - world.x, dy = n.y - world.y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });
    if (node) {
      dragNode = node;
      canvas.style.cursor = 'grabbing';
    } else {
      dragging = true;
      canvas.style.cursor = 'grabbing';
    }
    lastMouse = { x: e.offsetX, y: e.offsetY };
  });

  canvas.addEventListener('mousemove', e => {
    if (dragNode) {
      const world = toWorld(e.offsetX, e.offsetY);
      dragNode.x = world.x;
      dragNode.y = world.y;
    } else if (dragging && lastMouse) {
      panX += (e.offsetX - lastMouse.x) / scale;
      panY += (e.offsetY - lastMouse.y) / scale;
      lastMouse = { x: e.offsetX, y: e.offsetY };
    } else {
      // Hover detection
      const world = toWorld(e.offsetX, e.offsetY);
      let found = null;
      kgNodes.forEach(n => {
        const dx = n.x - world.x, dy = n.y - world.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) found = n.id;
      });
      kgHovered = found;
      canvas.style.cursor = found ? 'pointer' : 'grab';

      // Tooltip
      const tooltip = document.getElementById('kg-tooltip');
      if (tooltip && found) {
        const node = KG_NODES.find(n => n.id === found);
        const cat = KG_CATEGORIES[node.cat];
        const isUnlocked = !!kgUnlocked[found];
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY - 10) + 'px';
        tooltip.innerHTML = `
          <div style="display:flex;align-items:center;gap:0.3rem;margin-bottom:0.2rem">
            <span style="width:8px;height:8px;border-radius:50%;background:${cat.color}"></span>
            <strong style="color:${cat.color}">${node.name}</strong>
          </div>
          <div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:0.2rem">${node.desc}</div>
          <div style="font-size:0.62rem;color:${isUnlocked ? '#22c55e' : 'var(--text-muted)'}">${isUnlocked ? '✓ Desbloqueado' : '🔒 Para desbloquear: ' + kgGetUnlockHint(node)}</div>`;
      } else if (tooltip) {
        tooltip.style.display = 'none';
      }
    }
  });

  canvas.addEventListener('mouseup', () => { dragNode = null; dragging = false; lastMouse = null; canvas.style.cursor = 'grab'; });
  canvas.addEventListener('mouseleave', () => { dragNode = null; dragging = false; lastMouse = null; kgHovered = null; const t = document.getElementById('kg-tooltip'); if (t) t.style.display = 'none'; });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    scale = Math.max(0.3, Math.min(3, scale * factor));
  }, { passive: false });

  // Touch support
  let lastTouch = null;
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && lastTouch) {
      panX += (e.touches[0].clientX - lastTouch.x) / scale;
      panY += (e.touches[0].clientY - lastTouch.y) / scale;
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });
  canvas.addEventListener('touchend', () => { lastTouch = null; });
}

function kgGetUnlockHint(node) {
  const hints = {
    lab: 'Completá experimentos en el Lab de Descubrimiento',
    quiz: 'Respondé quizzes en Evaluciones',
    chat: 'Hacé preguntas en el Chat IA',
    playground: 'Escribí código en el Code Playground',
    start: 'Se desbloquea automáticamente',
  };
  if (node.deps && node.deps.length > 0) {
    const missing = node.deps.filter(d => !kgUnlocked[d]);
    if (missing.length > 0) {
      const names = missing.map(d => KG_NODES.find(n => n.id === d)?.name || d).join(', ');
      return `Primero desbloqueá: ${names}`;
    }
  }
  return hints[node.source] || 'Aprendé sobre este tema';
}

// Auto-unlock based on activity
window.kgOnLabDiscovery = function(lawId) {
  const mapping = {
    newton2: 'newton_laws', ohm: 'electro', kinetic: 'energy',
    hooke: 'structures', gravity: 'newton_laws', coulomb: 'magnetism',
  };
  const nodeId = mapping[lawId];
  if (nodeId && kgUnlockNode(nodeId, 'lab')) {
    window.dispatchEvent(new CustomEvent('kg-node-unlocked', { detail: { id: nodeId } }));
  }
};

window.kgOnQuizComplete = function() {
  const mathNodes = ['algebra', 'calc_1', 'calc_2', 'la', 'probability'];
  const locked = mathNodes.filter(id => !kgUnlocked[id]);
  if (locked.length > 0) {
    const id = locked[0];
    if (kgUnlockNode(id, 'quiz')) {
      window.dispatchEvent(new CustomEvent('kg-node-unlocked', { detail: { id } }));
    }
  }
};

window.kgOnChatMessage = function() {
  const engNodes = ['circuits', 'structures', 'materials', 'waves', 'optics', 'control'];
  const locked = engNodes.filter(id => !kgUnlocked[id]);
  if (locked.length > 0 && Math.random() < 0.3) {
    const id = locked[Math.floor(Math.random() * locked.length)];
    if (kgUnlockNode(id, 'chat')) {
      window.dispatchEvent(new CustomEvent('kg-node-unlocked', { detail: { id } }));
    }
  }
};

window.kgOnCodeRun = function() {
  const csNodes = ['data_struct', 'algorithms', 'os', 'networks', 'db'];
  const locked = csNodes.filter(id => !kgUnlocked[id]);
  if (locked.length > 0 && Math.random() < 0.4) {
    const id = locked[0];
    if (kgUnlockNode(id, 'playground')) {
      window.dispatchEvent(new CustomEvent('kg-node-unlocked', { detail: { id } }));
    }
  }
};

// Listen for unlocks to re-render if visible
window.addEventListener('kg-node-unlocked', () => {
  const view = document.getElementById('tech-tree-view');
  if (view && !view.classList.contains('hidden')) {
    kgRender();
  }
});

window.kgRender = kgRender;
window.kgUnlockNode = kgUnlockNode;
