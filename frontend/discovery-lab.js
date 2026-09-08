// discovery-lab.js - Lab de Descubrimiento: experimentá → deducí → revelá la ley
const DL_STORAGE = 'fiuba_discovery_lab';

const DL_EXPERIMENTS = [
  {
    id: 'newton2',
    title: 'La Máquina Misteriosa',
    icon: '⚙️',
    scenario: 'Tenés una máquina que aplica fuerza a bloques de distintas masas. Medí la aceleración resultante y descubrí la ley que conecta fuerza, masa y aceleración.',
    difficulty: 'Fácil',
    inputs: [
      { id: 'F', label: 'Fuerza', unit: 'N', min: 1, max: 100, step: 1, default: 10 },
      { id: 'm', label: 'Masa', unit: 'kg', min: 1, max: 50, step: 0.5, default: 5 },
    ],
    outputs: [
      { id: 'a', label: 'Aceleración', unit: 'm/s²', fn: (v) => v.F / v.m },
    ],
    variables: 'F = fuerza (N), m = masa (kg)',
    answer: 'F/m',
    law: 'Segunda Ley de Newton',
    description: 'F = m·a → a = F/m. La aceleración es directamente proporcional a la fuerza e inversamente proporcional a la masa. Esta ley es la base de toda la mecánica clásica.',
    year: '1687',
    scientist: 'Isaac Newton',
  },
  {
    id: 'ohm',
    title: 'El Circuito Oculto',
    icon: '⚡',
    scenario: 'Tenés un circuito con una resistencia desconocida. Podés cambiar el voltaje y medir la corriente. Descubrí la relación entre voltaje, corriente y resistencia.',
    difficulty: 'Fácil',
    inputs: [
      { id: 'V', label: 'Voltaje', unit: 'V', min: 1, max: 50, step: 0.5, default: 12 },
      { id: 'R', label: 'Resistencia', unit: 'Ω', min: 1, max: 100, step: 1, default: 10 },
    ],
    outputs: [
      { id: 'I', label: 'Corriente', unit: 'A', fn: (v) => v.V / v.R },
    ],
    variables: 'V = voltaje (V), R = resistencia (Ω)',
    answer: 'V/R',
    law: 'Ley de Ohm',
    description: 'V = I·R → I = V/R. La corriente es directamente proporcional al voltaje e inversamente proporcional a la resistencia. Fundamento de toda la electrónica.',
    year: '1827',
    scientist: 'Georg Ohm',
  },
  {
    id: 'kinetic',
    title: 'El Cañón de Proyectiles',
    icon: '💥',
    scenario: 'Un cañón dispara proyectiles de distintas masas a distintas velocidades. Medí la energía cinética resultante y descubrí la fórmula.',
    difficulty: 'Media',
    inputs: [
      { id: 'm', label: 'Masa', unit: 'kg', min: 0.5, max: 20, step: 0.5, default: 5 },
      { id: 'v', label: 'Velocidad', unit: 'm/s', min: 1, max: 50, step: 1, default: 10 },
    ],
    outputs: [
      { id: 'KE', label: 'Energía Cinética', unit: 'J', fn: (v) => 0.5 * v.m * v.v * v.v },
    ],
    variables: 'm = masa (kg), v = velocidad (m/s)',
    answer: '0.5*m*v^2',
    law: 'Energía Cinética',
    description: 'KE = ½mv². La energía cinética es proporcional a la masa y al CUADRADO de la velocidad. Por eso duplicar la velocidad cuadruplica la energía.',
    year: '1743',
    scientist: 'Jean le Rond d\'Alembert',
  },
  {
    id: 'hooke',
    title: 'El Resorte Elástico',
    icon: '🔗',
    scenario: 'Tenés un resorte. Estirás distintas distancias y medís la fuerza necesaria. Descubrí la ley que conecta deformación y fuerza.',
    difficulty: 'Fácil',
    inputs: [
      { id: 'k', label: 'Constante del resorte', unit: 'N/m', min: 5, max: 200, step: 5, default: 50 },
      { id: 'x', label: 'Deformación', unit: 'm', min: 0.01, max: 1, step: 0.01, default: 0.2 },
    ],
    outputs: [
      { id: 'F', label: 'Fuerza', unit: 'N', fn: (v) => v.k * v.x },
    ],
    variables: 'k = constante del resorte (N/m), x = deformación (m)',
    answer: 'k*x',
    law: 'Ley de Hooke',
    description: 'F = kx. La fuerza elástica es directamente proporcional a la deformación. Válida solo dentro del límite elástico del material.',
    year: '1660',
    scientist: 'Robert Hooke',
  },
  {
    id: 'gravity',
    title: 'La Balanza Gravitacional',
    icon: '🌍',
    scenario: 'Tenés dos masas que se atraen. Cambiás las masas y la distancia entre ellas, y medís la fuerza gravitatoria. Descubrí la ley universal de la gravitación.',
    difficulty: 'Difícil',
    inputs: [
      { id: 'm1', label: 'Masa 1', unit: 'kg', min: 10, max: 1000, step: 10, default: 100 },
      { id: 'm2', label: 'Masa 2', unit: 'kg', min: 10, max: 1000, step: 10, default: 200 },
      { id: 'r', label: 'Distancia', unit: 'm', min: 1, max: 20, step: 0.5, default: 5 },
    ],
    outputs: [
      { id: 'F', label: 'Fuerza Gravitatoria', unit: 'N', fn: (v) => 6.674e-11 * v.m1 * v.m2 / (v.r * v.r) },
    ],
    variables: 'm1 = masa 1 (kg), m2 = masa 2 (kg), r = distancia (m), G ≈ 6.674×10⁻¹¹',
    answer: 'G*m1*m2/r^2',
    law: 'Ley de Gravitación Universal',
    description: 'F = G·m₁·m₂/r². La fuerza gravitatoria es proporcional al producto de las masas e inversamente proporcional al cuadrado de la distancia. Newton unificó la caída de manzanas con el movimiento de planetas.',
    year: '1687',
    scientist: 'Isaac Newton',
  },
  {
    id: 'coulomb',
    title: 'La Carga Eléctrica',
    icon: '🧲',
    scenario: 'Tenés dos cargas eléctricas. Cambiás las cargas y la distancia, y medís la fuerza electrostática. Descubrí la ley de Coulomb.',
    difficulty: 'Difícil',
    inputs: [
      { id: 'q1', label: 'Carga 1', unit: 'μC', min: 1, max: 100, step: 1, default: 10 },
      { id: 'q2', label: 'Carga 2', unit: 'μC', min: 1, max: 100, step: 1, default: 20 },
      { id: 'r', label: 'Distancia', unit: 'cm', min: 1, max: 50, step: 1, default: 10 },
    ],
    outputs: [
      { id: 'F', label: 'Fuerza Electrostática', unit: 'N', fn: (v) => 8.99e9 * (v.q1 * 1e-6) * (v.q2 * 1e-6) / ((v.r * 0.01) * (v.r * 0.01)) },
    ],
    variables: 'q1 = carga 1 (μC), q2 = carga 2 (μC), r = distancia (cm), k ≈ 8.99×10⁹',
    answer: 'k*q1*q2/r^2',
    law: 'Ley de Coulomb',
    description: 'F = k·q₁·q₂/r². La fuerza electrostática es proporcional al producto de las cargas e inversamente proporcional al cuadrado de la distancia. Análoga a la gravitación pero mucho más fuerte.',
    year: '1785',
    scientist: 'Charles-Augustin de Coulomb',
  },
];

let dlCurrentExperiment = null;
let dlDataPoints = [];
let dlSolved = {};
let dlCurrentInputValues = {};
let dlCurrentDataPoints = [];

function dlInit() {
  try { dlSolved = JSON.parse(localStorage.getItem(DL_STORAGE + '_solved') || '{}'); } catch { dlSolved = {}; }
}

function dlSaveSolved() {
  localStorage.setItem(DL_STORAGE + '_solved', JSON.stringify(dlSolved));
}

function dlRender() {
  const el = document.getElementById('discovery-lab-content');
  if (!el) return;
  dlInit();

  if (dlCurrentExperiment) {
    dlRenderExperiment(el, dlCurrentExperiment);
    return;
  }

  const solved = Object.keys(dlSolved).length;
  const total = DL_EXPERIMENTS.length;

  let html = `
    <div style="text-align:center;margin-bottom:1rem">
      <div style="font-size:2.5rem;margin-bottom:0.3rem">🔬</div>
      <h2 style="font-family:var(--font-heading);font-size:1.3rem;color:var(--text-primary);margin:0">Lab de Descubrimiento</h2>
      <p style="font-size:0.82rem;color:var(--text-muted);margin:0.3rem 0 0">Experimentá, deducí la fórmula y descubrí leyes fundamentales de la física</p>
      <div style="margin-top:0.5rem;display:flex;justify-content:center;gap:1rem">
        <span style="font-size:0.75rem;color:var(--text-muted)">🔓 Descubiertas: <strong style="color:var(--accent)">${solved}/${total}</strong></span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:0.6rem">`;

  DL_EXPERIMENTS.forEach(exp => {
    const isSolved = dlSolved[exp.id];
    const diffColor = exp.difficulty === 'Fácil' ? '#22c55e' : exp.difficulty === 'Media' ? '#f59e0b' : '#ef4444';
    html += `
      <div onclick="dlStartExperiment('${exp.id}')" style="background:var(--bg-card);border:1.5px solid ${isSolved ? '#22c55e40' : 'var(--border-color)'};border-radius:12px;padding:1rem;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden">
        ${isSolved ? '<div style="position:absolute;top:8px;right:8px;font-size:0.65rem;background:#22c55e18;color:#22c55e;padding:0.15rem 0.4rem;border-radius:20px;font-weight:600">✓ Descubierta</div>' : ''}
        <div style="font-size:1.8rem;margin-bottom:0.4rem">${exp.icon}</div>
        <h3 style="font-family:var(--font-heading);font-size:0.95rem;color:var(--text-primary);margin:0 0 0.3rem">${exp.title}</h3>
        <p style="font-size:0.75rem;color:var(--text-muted);margin:0 0 0.5rem;line-height:1.4">${exp.scenario.slice(0, 100)}...</p>
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span style="font-size:0.65rem;background:${diffColor}18;color:${diffColor};padding:0.15rem 0.4rem;border-radius:12px;font-weight:600">${exp.difficulty}</span>
          <span style="font-size:0.65rem;color:var(--text-muted)">${exp.scientist}, ${exp.year}</span>
        </div>
      </div>`;
  });

  html += '</div>';
  el.innerHTML = html;
}

function dlRenderExperiment(el, exp) {
  const isSolved = dlSolved[exp.id];
  let inputValues = {};
  exp.inputs.forEach(inp => { inputValues[inp.id] = inp.default; });

  let html = `
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem;flex-wrap:wrap">
      <button onclick="dlBackToList()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.75rem;color:var(--text-primary)">← Volver</button>
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0">${exp.icon} ${exp.title}</h2>
      ${isSolved ? '<span style="font-size:0.65rem;background:#22c55e18;color:#22c55e;padding:0.15rem 0.4rem;border-radius:12px;font-weight:600">✓ Descubierta</span>' : ''}
    </div>

    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:1rem;margin-bottom:0.8rem">
      <p style="font-size:0.82rem;color:var(--text-primary);margin:0;line-height:1.5">${exp.scenario}</p>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;margin-bottom:0.8rem">
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:1rem">
        <h3 style="font-family:var(--font-heading);font-size:0.85rem;color:var(--text-primary);margin:0 0 0.6rem;display:flex;align-items:center;gap:0.3rem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17"/></svg>
          Variables de Entrada
        </h3>
        <div style="display:flex;flex-direction:column;gap:0.7rem">`;

  exp.inputs.forEach(inp => {
    html += `
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:0.2rem">
              <label style="font-size:0.75rem;color:var(--text-muted)">${inp.label}</label>
              <span id="dl-val-${inp.id}" style="font-size:0.75rem;font-weight:700;color:var(--text-primary);font-family:'Cambria Math',monospace">${inp.default} ${inp.unit}</span>
            </div>
            <input type="range" id="dl-slider-${inp.id}" min="${inp.min}" max="${inp.max}" step="${inp.step}" value="${inp.default}"
              oninput="dlUpdateInput('${inp.id}', this.value, '${inp.unit}')"
              style="width:100%;accent-color:var(--accent);height:6px">
          </div>`;
  });

  html += `
        </div>
      </div>

      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:1rem">
        <h3 style="font-family:var(--font-heading);font-size:0.85rem;color:var(--text-primary);margin:0 0 0.6rem;display:flex;align-items:center;gap:0.3rem">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Resultado Medido
        </h3>
        <div style="display:flex;flex-direction:column;gap:0.5rem">`;

  exp.outputs.forEach(out => {
    const val = out.fn(inputValues);
    html += `
          <div style="background:var(--bg-secondary);border-radius:8px;padding:0.6rem;text-align:center">
            <div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:0.2rem">${out.label}</div>
            <div id="dl-output-${out.id}" style="font-size:1.5rem;font-weight:800;color:var(--accent);font-family:'Cambria Math',monospace">${dlFormatNum(val)}</div>
            <div style="font-size:0.65rem;color:var(--text-muted)">${out.unit}</div>
          </div>`;
  });

  html += `
        </div>
      </div>
    </div>

    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:1rem;margin-bottom:0.8rem">
      <h3 style="font-family:var(--font-heading);font-size:0.85rem;color:var(--text-primary);margin:0 0 0.5rem">📊 Registro de Experimentos</h3>
      <div style="max-height:120px;overflow-y:auto;font-family:'Cambria Math',monospace;font-size:0.72rem" id="dl-data-log">
        <div style="color:var(--text-muted);text-align:center;padding:0.5rem">Mové los sliders para generar datos...</div>
      </div>
      <button onclick="dlAddDataPoint()" style="margin-top:0.5rem;background:var(--accent);color:white;border:none;border-radius:8px;padding:0.35rem 0.8rem;cursor:pointer;font-size:0.75rem;font-weight:600">+ Registrar este punto</button>
    </div>

    <div style="background:var(--bg-card);border:2px solid ${isSolved ? '#22c55e' : 'var(--border-color)'};border-radius:12px;padding:1rem;margin-bottom:0.8rem">
      <h3 style="font-family:var(--font-heading);font-size:0.85rem;color:var(--text-primary);margin:0 0 0.5rem">🧠 ¿Descubriste la fórmula?</h3>
      <p style="font-size:0.72rem;color:var(--text-muted);margin:0 0 0.5rem">Variables: ${exp.variables}</p>
      <div style="display:flex;gap:0.4rem;align-items:center">
        <span style="font-size:0.85rem;color:var(--text-muted);font-family:'Cambria Math',monospace">${exp.outputs[0].id} =</span>
        <input id="dl-formula-input" type="text" placeholder="Escribí la fórmula acá..."
          style="flex:1;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.45rem 0.6rem;font-size:0.85rem;color:var(--text-primary);font-family:'Cambria Math',monospace;outline:none"
          onkeydown="if(event.key==='Enter')dlCheckFormula()">
        <button onclick="dlCheckFormula()" style="background:${isSolved ? '#22c55e' : 'var(--accent)'};color:white;border:none;border-radius:8px;padding:0.45rem 0.9rem;cursor:pointer;font-size:0.8rem;font-weight:600">
          ${isSolved ? '✓' : 'Verificar'}
        </button>
      </div>
      <div id="dl-formula-result" style="margin-top:0.5rem;font-size:0.75rem;min-height:1.2rem"></div>
    </div>

    ${isSolved ? `
    <div style="background:linear-gradient(135deg,#22c55e08,#22c55e03);border:1.5px solid #22c55e30;border-radius:12px;padding:1rem">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
        <span style="font-size:1.3rem">🧠</span>
        <h3 style="font-family:var(--font-heading);font-size:0.95rem;color:#22c55e;margin:0">¡${exp.law} Descubierta!</h3>
      </div>
      <p style="font-size:0.8rem;color:var(--text-primary);margin:0 0 0.3rem;line-height:1.5"><strong>${exp.scientist} (${exp.year})</strong></p>
      <p style="font-size:0.78rem;color:var(--text-muted);margin:0;line-height:1.5">${exp.description}</p>
    </div>` : ''}`;

  el.innerHTML = html;

  // Store in module-level variables (survives re-render)
  dlCurrentInputValues = { ...inputValues };
  dlCurrentDataPoints = [];

  // Initial output calculation
  dlRecalculate();
}

function dlUpdateInput(id, value, unit) {
  const val = parseFloat(value);
  const valEl = document.getElementById('dl-val-' + id);
  if (valEl) valEl.textContent = val + ' ' + unit;
  dlCurrentInputValues[id] = val;
  dlRecalculate();
}

function dlRecalculate() {
  if (!dlCurrentExperiment) return;
  const exp = dlCurrentExperiment;
  const vals = dlCurrentInputValues;

  exp.outputs.forEach(out => {
    const result = out.fn(vals);
    const outEl = document.getElementById('dl-output-' + out.id);
    if (outEl) outEl.textContent = dlFormatNum(result);
  });
}

function dlFormatNum(n) {
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 0.001 && n !== 0)) return n.toExponential(2);
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(4)).toString();
}

function dlAddDataPoint() {
  if (!dlCurrentExperiment) return;
  const exp = dlCurrentExperiment;
  const vals = dlCurrentInputValues;
  const outputs = {};
  exp.outputs.forEach(out => { outputs[out.id] = out.fn(vals); });

  dlCurrentDataPoints.push({ inputs: { ...vals }, outputs });

  const logEl = document.getElementById('dl-data-log');
  if (logEl) {
    if (dlCurrentDataPoints.length === 1) logEl.innerHTML = '';
    const inputStr = Object.entries(vals).map(([k, v]) => `${k}=${dlFormatNum(v)}`).join(', ');
    const outputStr = Object.entries(outputs).map(([k, v]) => `${k}=${dlFormatNum(v)}`).join(', ');
    const row = document.createElement('div');
    row.style.cssText = 'padding:0.25rem 0;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;gap:0.5rem';
    row.innerHTML = `<span style="color:var(--text-muted);min-width:20px">#${dlCurrentDataPoints.length}</span><span style="flex:1;color:var(--text-primary)">${inputStr}</span><span style="color:var(--accent);font-weight:600;flex:1;text-align:right">${outputStr}</span>`;
    logEl.appendChild(row);
    logEl.scrollTop = logEl.scrollHeight;
  }
}

function dlCheckFormula() {
  const resultEl = document.getElementById('dl-formula-result');
  if (!dlCurrentExperiment || !resultEl) return;
  const exp = dlCurrentExperiment;
  const input = document.getElementById('dl-formula-input');
  if (!input) return;
  const formula = input.value.trim();
  if (!formula) { resultEl.innerHTML = '<span style="color:#ef4444">Escribí una fórmula</span>'; return; }

  // Test formula against known values
  let allCorrect = true;
  for (let i = 0; i < 5; i++) {
    const testVals = {};
    exp.inputs.forEach(inp => {
      testVals[inp.id] = inp.min + Math.random() * (inp.max - inp.min);
    });
    const expected = exp.outputs[0].fn(testVals);
    const computed = dlEvalFormula(formula, testVals, exp);
    if (computed === null || Math.abs(expected - computed) / Math.max(Math.abs(expected), 1e-10) > 0.02) {
      allCorrect = false;
      break;
    }
  }

  if (allCorrect) {
    dlSolved[exp.id] = { formula, date: new Date().toISOString() };
    dlSaveSolved();
    resultEl.innerHTML = '<span style="color:#22c55e;font-weight:600">🧠 ¡Correcto! ¡Descubriste la ley! 🎉</span>';
    // Award XP
    if (window.ttAddXP) window.ttAddXP(100, 'discovery-lab');
    setTimeout(() => {
      const el = document.getElementById('discovery-lab-content');
      dlRenderExperiment(el, exp);
    }, 1500);
  } else {
    resultEl.innerHTML = '<span style="color:#ef4444">✗ No coincide. Revisá las variables y la fórmula.</span>';
  }
}

function dlEvalFormula(formula, vars, exp) {
  try {
    let expr = formula.trim();

    // Step 1: Replace known variables with placeholder tokens to avoid partial matches
    const placeholders = {};
    exp.inputs.forEach((inp, i) => {
      placeholders['__VAR' + i + '__'] = vars[inp.id];
      // Use word-boundary replacement to avoid matching inside other words
      expr = expr.replace(new RegExp('\\b' + inp.id + '\\b', 'g'), '__VAR' + i + '__');
    });

    // Step 2: Replace Math functions BEFORE constants
    expr = expr.replace(/\bsqrt\b/g, 'Math.sqrt');
    expr = expr.replace(/\bsin\b/g, 'Math.sin');
    expr = expr.replace(/\bcos\b/g, 'Math.cos');
    expr = expr.replace(/\btan\b/g, 'Math.tan');
    expr = expr.replace(/\blog\b/g, 'Math.log');
    expr = expr.replace(/\babs\b/g, 'Math.abs');
    expr = expr.replace(/\bpi\b/gi, 'Math.PI');

    // Step 3: Replace ^ with **
    expr = expr.replace(/\^/g, '**');

    // Step 4: Replace placeholders with actual values
    Object.entries(placeholders).forEach(([ph, val]) => {
      expr = expr.replace(new RegExp(ph, 'g'), '(' + val + ')');
    });

    // Step 5: Implicit multiplication: 2( → 2*(, )( → )*(, )( → )*(
    expr = expr.replace(/(\d)\(/g, '$1*(');
    expr = expr.replace(/\)\(/g, ')*(');
    expr = expr.replace(/\)(\w)/g, ')*$1');
    expr = expr.replace(/(\w)\(/g, (match, p1) => {
      if (p1.endsWith('Math') || p1.endsWith('sqrt') || p1.endsWith('sin') || p1.endsWith('cos') || p1.endsWith('tan') || p1.endsWith('log') || p1.endsWith('abs')) return match;
      return p1 + '*(';
    });

    const result = new Function('return ' + expr)();
    return (typeof result === 'number' && isFinite(result)) ? result : null;
  } catch {
    return null;
  }
}

function dlBackToList() {
  dlCurrentExperiment = null;
  dlRender();
}

function dlStartExperiment(id) {
  dlCurrentExperiment = DL_EXPERIMENTS.find(e => e.id === id);
  dlRender();
}

// Exports
window.dlRender = dlRender;
window.dlStartExperiment = dlStartExperiment;
window.dlBackToList = dlBackToList;
window.dlUpdateInput = dlUpdateInput;
window.dlAddDataPoint = dlAddDataPoint;
window.dlCheckFormula = dlCheckFormula;
