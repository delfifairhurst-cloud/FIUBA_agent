// tech-tree.js - Technology Tree: desbloqueá tecnologías con XP
const TT_STORAGE = 'fiuba_tech_tree';
const TT_XP_STORAGE = 'fiuba_tech_xp';

const TT_TREE = [
  // TIER 0 - Start
  { id: 'fuego', name: 'Fuego', icon: '🔥', desc: 'Control del fuego. El inicio de todo.', tier: 0, cost: 0, deps: [], category: 'primitive' },
  { id: 'piedra', name: 'Piedra', icon: '🪨', desc: 'Trabajo de piedra. Herramientas básicas.', tier: 0, cost: 0, deps: [], category: 'primitive' },
  { id: 'madera', name: 'Madera', icon: '🪵', desc: 'Tallado y uso de madera.', tier: 0, cost: 0, deps: [], category: 'primitive' },

  // TIER 1 - Simple Machines
  { id: 'palanca', name: 'Palanca', icon: '⚖️', desc: 'Máquina simple: multiplicá fuerza.', tier: 1, cost: 50, deps: ['piedra'], category: 'mechanical' },
  { id: 'rueda', name: 'Rueda', icon: '☸️', desc: 'El rodamiento. Transporte y máquinas.', tier: 1, cost: 50, deps: ['madera'], category: 'mechanical' },
  { id: 'tornillo', name: 'Tornillo', icon: '🔩', desc: 'Máquina simple: conversión de movimiento.', tier: 1, cost: 50, deps: ['palanca'], category: 'mechanical' },
  { id: 'combustion', name: 'Combustión', icon: '🔥', desc: 'Quemar combustible. Energía térmica.', tier: 1, cost: 30, deps: ['fuego'], category: 'energy' },

  // TIER 2 - Classical
  { id: 'hidraulica', name: 'Hidráulica', icon: '💧', desc: 'Presión y movimiento de fluidos.', tier: 2, cost: 100, deps: ['tornillo'], category: 'mechanical' },
  { id: 'construccion', name: 'Construcción', icon: '🏗️', desc: 'Estructuras y edificios.', tier: 2, cost: 100, deps: ['madera', 'piedra'], category: 'civil' },
  { id: 'navegacion', name: 'Navegación', icon: '⛵', desc: 'Moverse por el agua y el cielo.', tier: 2, cost: 80, deps: ['rueda', 'madera'], category: 'transport' },
  { id: 'termodinamica', name: 'Termodinámica', icon: '🌡️', desc: 'Calor, trabajo y energía.', tier: 2, cost: 120, deps: ['combustion'], category: 'science' },

  // TIER 3 - Industrial
  { id: 'vapor', name: 'Motor de Vapor', icon: '🚂', desc: 'Máquinas de vapor. Revolución industrial.', tier: 3, cost: 200, deps: ['termodinamica', 'hidraulica'], category: 'energy' },
  { id: 'fabrica', name: 'Fábrica', icon: '🏭', desc: 'Producción en masa.', tier: 3, cost: 200, deps: ['vapor', 'construccion'], category: 'industrial' },
  { id: 'quimica', name: 'Química', icon: '⚗️', desc: 'Reacciones químicas y materiales.', tier: 3, cost: 150, deps: ['combustion', 'termodinamica'], category: 'science' },
  { id: 'telegrafo', name: 'Telégrafo', icon: '📡', desc: 'Comunicación a distancia.', tier: 3, cost: 120, deps: ['navegacion'], category: 'communication' },

  // TIER 4 - Electrical
  { id: 'electricidad', name: 'Electricidad', icon: '⚡', desc: 'Corriente, voltaje, resistencia.', tier: 4, cost: 300, deps: ['fabrica'], category: 'energy' },
  { id: 'electromagnetismo', name: 'Electromagnetismo', icon: '🧲', desc: ' Campos magnéticos y corriente.', tier: 4, cost: 250, deps: ['electricidad'], category: 'science' },
  { id: 'iluminacion', name: 'Iluminación', icon: '💡', desc: 'Luz eléctrica. Fin de la oscuridad.', tier: 4, cost: 100, deps: ['electricidad'], category: 'industrial' },
  { id: 'refrigeracion', name: 'Refrigeración', icon: '❄️', desc: 'Ciclo de refrigeración. Alimentos y confort.', tier: 4, cost: 200, deps: ['electricidad', 'termodinamica'], category: 'industrial' },

  // TIER 5 - Modern
  { id: 'automovil', name: 'Automóvil', icon: '🚗', desc: 'Motor de combustión interna.', tier: 5, cost: 250, deps: ['electricidad', 'quimica'], category: 'transport' },
  { id: 'avion', name: 'Aviación', icon: '✈️', desc: 'Vuelo motorizado.', tier: 5, cost: 350, deps: ['automovil', 'electromagnetismo'], category: 'transport' },
  { id: 'computacion', name: 'Computación', icon: '💻', desc: 'Procesamiento de información.', tier: 5, cost: 400, deps: ['electricidad', 'electromagnetismo'], category: 'digital' },
  { id: 'telecomunicaciones', name: 'Telecomunicaciones', icon: '📶', desc: 'Redes y comunicaciones globales.', tier: 5, cost: 300, deps: ['electricidad', 'telegrafo'], category: 'communication' },

  // TIER 6 - Advanced
  { id: 'automatizacion', name: 'Automatización', icon: '🤖', desc: 'Robots y control automático.', tier: 6, cost: 500, deps: ['computacion', 'fabrica'], category: 'digital' },
  { id: 'nuclear', name: 'Energía Nuclear', icon: '☢️', desc: 'Fisión nuclear. Energía masiva.', tier: 6, cost: 600, deps: ['electricidad', 'quimica'], category: 'energy' },
  { id: 'biotecnologia', name: 'Biotecnología', icon: '🧬', desc: 'Ingeniería genética y biología sintética.', tier: 6, cost: 500, deps: ['computacion', 'quimica'], category: 'science' },
  { id: 'materiales', name: 'Materiales Avanzados', icon: '🔬', desc: 'Nanotecnología y materiales sintéticos.', tier: 6, cost: 400, deps: ['quimica', 'computacion'], category: 'science' },

  // TIER 7 - Space
  { id: 'coheteria', name: 'Cohetería', icon: '🚀', desc: 'Propulsión de cohetes. Escapar de la gravedad.', tier: 7, cost: 700, deps: ['materiales', 'nuclear'], category: 'space' },
  { id: 'satelites', name: 'Satélites', icon: '🛰️', desc: 'Órbita terrestre. GPS, telecomunicaciones.', tier: 7, cost: 500, deps: ['coheteria', 'telecomunicaciones'], category: 'space' },
  { id: 'energias_renovable', name: 'Energías Renovables', icon: '🌱', desc: 'Solar, eólica, geotérmica.', tier: 7, cost: 400, deps: ['nuclear', 'materiales'], category: 'energy' },

  // TIER 8 - Future
  { id: 'luna', name: 'Colonias Lunares', icon: '🌙', desc: 'Base permanente en la Luna.', tier: 8, cost: 1000, deps: ['coheteria', 'automatizacion'], category: 'space' },
  { id: 'ia', name: 'Inteligencia Artificial', icon: '🧠', desc: 'Máquinas que piensan.', tier: 8, cost: 800, deps: ['automatizacion', 'biotecnologia'], category: 'digital' },
  { id: 'fision_avanzada', name: 'Fusión Nuclear', icon: '☀️', desc: 'Energía de fusión. Practicamente infinita.', tier: 8, cost: 1200, deps: ['nuclear', 'materiales'], category: 'energy' },

  // TIER 9 - Cosmic
  { id: 'marte', name: 'Marte', icon: '🔴', desc: 'Primera colonia en otro planeta.', tier: 9, cost: 2000, deps: ['luna', 'fision_avanzada'], category: 'space' },
  { id: 'dyson', name: 'Dyson Swarm', icon: '🌐', desc: 'Captura total de energía estelar.', tier: 9, cost: 5000, deps: ['fision_avanzada', 'ia'], category: 'space' },
  { id: 'viaje_interstellar', name: 'Viaje Interestelar', icon: '🌌', desc: 'Más allá del sistema solar.', tier: 9, cost: 10000, deps: ['dyson', 'marte'], category: 'space' },
];

const TT_CATEGORIES = {
  primitive: { name: 'Primitive', color: '#78716c' },
  mechanical: { name: 'Mechanical', color: '#a16207' },
  energy: { name: 'Energy', color: '#f59e0b' },
  science: { name: 'Science', color: '#8b5cf6' },
  civil: { name: 'Civil', color: '#6366f1' },
  transport: { name: 'Transport', color: '#3b82f6' },
  industrial: { name: 'Industrial', color: '#ec4899' },
  communication: { name: 'Comms', color: '#06b6d4' },
  digital: { name: 'Digital', color: '#22c55e' },
  space: { name: 'Space', color: '#f97316' },
};

let ttState = {};
let ttXP = 0;

function ttInit() {
  try { ttState = JSON.parse(localStorage.getItem(TT_STORAGE) || '{}'); } catch { ttState = {}; }
  ttXP = parseInt(localStorage.getItem(TT_XP_STORAGE) || '0');
  // Fuego, piedra, madera start unlocked
  ['fuego', 'piedra', 'madera'].forEach(id => {
    if (!ttState[id]) ttState[id] = { status: 'unlocked', date: new Date().toISOString() };
  });
  ttSave();
}

function ttSave() {
  localStorage.setItem(TT_STORAGE, JSON.stringify(ttState));
  localStorage.setItem(TT_XP_STORAGE, String(ttXP));
}

function ttAddXP(amount, source) {
  ttXP += amount;
  ttSave();
  // Dispatch event for other modules
  window.dispatchEvent(new CustomEvent('tech-xp-gained', { detail: { amount, source, total: ttXP } }));
}

function ttCanUnlock(tech) {
  if (ttState[tech.id]?.status === 'unlocked') return false;
  return tech.deps.every(depId => ttState[depId]?.status === 'unlocked');
}

function ttUnlock(techId) {
  const tech = TT_TREE.find(t => t.id === techId);
  if (!tech || !ttCanUnlock(tech)) return false;
  if (ttXP < tech.cost) return false;
  ttXP -= tech.cost;
  ttState[techId] = { status: 'unlocked', date: new Date().toISOString() };
  ttSave();
  return true;
}

function ttGetStatus(tech) {
  if (ttState[tech.id]?.status === 'unlocked') return 'unlocked';
  if (ttCanUnlock(tech)) return 'available';
  return 'locked';
}

function ttRender() {
  const el = document.getElementById('tech-tree-content');
  if (!el) return;
  ttInit();

  const tiers = {};
  TT_TREE.forEach(tech => {
    if (!tiers[tech.tier]) tiers[tech.tier] = [];
    tiers[tech.tier].push(tech);
  });

  const tierNames = ['Primitive', 'Simple Machines', 'Classical', 'Industrial', 'Electrical', 'Modern', 'Advanced', 'Space', 'Future', 'Cosmic'];
  const unlocked = TT_TREE.filter(t => ttState[t.id]?.status === 'unlocked').length;
  const available = TT_TREE.filter(t => ttCanUnlock(t)).length;

  let html = `
    <div style="text-align:center;margin-bottom:1rem">
      <div style="font-size:2.5rem;margin-bottom:0.3rem">🌳</div>
      <h2 style="font-family:var(--font-heading);font-size:1.3rem;color:var(--text-primary);margin:0">Technology Tree</h2>
      <p style="font-size:0.82rem;color:var(--text-muted);margin:0.3rem 0 0">Desbloqueá tecnologías con XP ganada en el Lab y otras herramientas</p>
      <div style="margin-top:0.5rem;display:flex;justify-content:center;gap:1.5rem;flex-wrap:wrap">
        <span style="font-size:0.75rem;color:var(--accent);font-weight:700">⚡ ${ttXP} XP disponible</span>
        <span style="font-size:0.75rem;color:var(--text-muted)">🔓 ${unlocked}/${TT_TREE.length} descubiertas</span>
        <span style="font-size:0.75rem;color:#22c55e">✨ ${available} disponibles</span>
      </div>
    </div>`;

  // XP sources info
  html += `
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;margin-bottom:1rem;display:flex;gap:1rem;flex-wrap:wrap;justify-content:center">
      <span style="font-size:0.7rem;color:var(--text-muted)">Ganá XP:</span>
      <span style="font-size:0.7rem;color:var(--text-muted)">🔬 Lab Descubrimiento: <strong style="color:var(--accent)">+100 XP</strong> por ley</span>
      <span style="font-size:0.7rem;color:var(--text-muted)">💬 Chat: <strong style="color:var(--accent)">+10 XP</strong> por mensaje</span>
      <span style="font-size:0.7rem;color:var(--text-muted)">📝 Quiz: <strong style="color:var(--accent)">+50 XP</strong> por quiz</span>
    </div>`;

  // Render tree by tiers
  for (let tier = 0; tier <= 9; tier++) {
    const techs = tiers[tier];
    if (!techs || techs.length === 0) continue;

    html += `
      <div style="margin-bottom:0.8rem">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
          <div style="font-size:0.65rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap">Tier ${tier}</div>
          <div style="flex:1;height:1px;background:var(--border-color)"></div>
          <div style="font-size:0.6rem;color:var(--text-muted)">${tierNames[tier] || ''}</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:0.5rem">`;

    techs.forEach(tech => {
      const status = ttGetStatus(tech);
      const cat = TT_CATEGORIES[tech.category] || { color: '#6b7280' };

      let borderColor = 'var(--border-color)';
      let bgColor = 'var(--bg-card)';
      let opacity = '1';
      let cursor = 'default';
      let badge = '';

      if (status === 'unlocked') {
        borderColor = '#22c55e60';
        bgColor = '#22c55e08';
        badge = '<div style="position:absolute;top:4px;right:4px;width:14px;height:14px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.5rem;color:white">✓</div>';
      } else if (status === 'available') {
        borderColor = cat.color + '80';
        cursor = 'pointer';
      } else {
        opacity = '0.4';
      }

      const depNames = tech.deps.map(d => TT_TREE.find(t => t.id === d)?.icon || '').join(' ');

      html += `
        <div onclick="${status === 'available' ? `ttTryUnlock('${tech.id}')` : status === 'locked' ? '' : `ttShowInfo('${tech.id}')`}"
          style="position:relative;background:${bgColor};border:1.5px solid ${borderColor};border-radius:10px;padding:0.6rem;min-width:120px;max-width:160px;flex:1;cursor:${cursor};opacity:${opacity};transition:all 0.2s"
          onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          ${badge}
          <div style="font-size:1.3rem;margin-bottom:0.2rem">${tech.icon}</div>
          <div style="font-size:0.72rem;font-weight:700;color:var(--text-primary);margin-bottom:0.15rem;line-height:1.2">${tech.name}</div>
          <div style="font-size:0.6rem;color:var(--text-muted);line-height:1.3;margin-bottom:0.3rem">${tech.desc.slice(0, 60)}${tech.desc.length > 60 ? '...' : ''}</div>
          ${status === 'available' ? `<div style="font-size:0.6rem;color:${cat.color};font-weight:700">⚡ ${tech.cost} XP para desbloquear</div>` : ''}
          ${status === 'locked' && tech.deps.length > 0 ? `<div style="font-size:0.6rem;color:var(--text-muted)">Requiere: ${depNames}</div>` : ''}
          ${status === 'unlocked' ? `<div style="font-size:0.6rem;color:#22c55e;font-weight:600">✓ Desbloqueada</div>` : ''}
        </div>`;
    });

    html += '</div></div>';
  }

  el.innerHTML = html;
}

function ttTryUnlock(techId) {
  const tech = TT_TREE.find(t => t.id === techId);
  if (!tech) return;
  if (ttXP < tech.cost) {
    alert(`Necesitás ${tech.cost} XP. Tenés ${ttXP}. ¡Hacé más experimentos en el Lab de Descubrimiento!`);
    return;
  }
  if (confirm(`¿Desbloquear "${tech.name}" por ${tech.cost} XP?`)) {
    if (ttUnlock(techId)) {
      ttRender();
    }
  }
}

function ttShowInfo(techId) {
  const tech = TT_TREE.find(t => t.id === techId);
  if (!tech) return;
  const cat = TT_CATEGORIES[tech.category] || { name: 'Unknown', color: '#6b7280' };
  alert(`${tech.icon} ${tech.name}\n\n${tech.desc}\n\nCategoría: ${cat.name}\nTier: ${tech.tier}\nCosto: ${tech.cost} XP\n\nEstado: ✓ Desbloqueada`);
}

// Connect to Discovery Lab XP events
window.addEventListener('tech-xp-gained', () => {
  if (document.getElementById('tech-tree-view') && !document.getElementById('tech-tree-view').classList.contains('hidden')) {
    ttRender();
  }
});

// Auto-add XP from Discovery Lab
window.ttLabDiscovered = function() {
  ttAddXP(100, 'discovery-lab');
};

// Exports
window.ttRender = ttRender;
window.ttTryUnlock = ttTryUnlock;
window.ttShowInfo = ttShowInfo;
window.ttAddXP = ttAddXP;
