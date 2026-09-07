// unit-converter.js - Convertidor de unidades profesional
const UC_CATEGORIES = [
  { name: 'Longitud', icon: '📏', color: '#3b82f6', units: [
    { name: 'Metros', abbr: 'm', factor: 1, icon: '📐' },
    { name: 'Centímetros', abbr: 'cm', factor: 0.01, icon: '📏' },
    { name: 'Milímetros', abbr: 'mm', factor: 0.001, icon: '🔍' },
    { name: 'Kilómetros', abbr: 'km', factor: 1000, icon: '🏔️' },
    { name: 'Millas', abbr: 'mi', factor: 1609.344, icon: '🛣️' },
    { name: 'Pulgadas', abbr: 'in', factor: 0.0254, icon: '📱' },
    { name: 'Pies', abbr: 'ft', factor: 0.3048, icon: '👣' },
  ]},
  { name: 'Masa', icon: '⚖️', color: '#ef4444', units: [
    { name: 'Kilogramos', abbr: 'kg', factor: 1, icon: '🏋️' },
    { name: 'Gramos', abbr: 'g', factor: 0.001, icon: '💊' },
    { name: 'Miligramos', abbr: 'mg', factor: 0.000001, icon: '🔬' },
    { name: 'Toneladas', abbr: 't', factor: 1000, icon: '🚛' },
    { name: 'Libras', abbr: 'lb', factor: 0.453592, icon: '⚖️' },
    { name: 'Onzas', abbr: 'oz', factor: 0.0283495, icon: '🥫' },
  ]},
  { name: 'Tiempo', icon: '⏱️', color: '#22c55e', units: [
    { name: 'Segundos', abbr: 's', factor: 1, icon: '⏰' },
    { name: 'Milisegundos', abbr: 'ms', factor: 0.001, icon: '⚡' },
    { name: 'Minutos', abbr: 'min', factor: 60, icon: '🕰️' },
    { name: 'Horas', abbr: 'h', factor: 3600, icon: '🕐' },
    { name: 'Días', abbr: 'd', factor: 86400, icon: '📅' },
  ]},
  { name: 'Velocidad', icon: '🚀', color: '#f59e0b', units: [
    { name: 'm/s', abbr: 'm/s', factor: 1, icon: '🏃' },
    { name: 'km/h', abbr: 'km/h', factor: 0.277778, icon: '🚗' },
    { name: 'mph', abbr: 'mph', factor: 0.44704, icon: '🏎️' },
    { name: 'Nudos', abbr: 'kn', factor: 0.514444, icon: '⛵' },
  ]},
  { name: 'Temperatura', icon: '🌡️', color: '#ec4899', units: [
    { name: 'Celsius', abbr: '°C', factor: null, icon: '🌡️' },
    { name: 'Fahrenheit', abbr: '°F', factor: null, icon: '🌡️' },
    { name: 'Kelvin', abbr: 'K', factor: null, icon: '❄️' },
  ], special: true },
  { name: 'Energía', icon: '⚡', color: '#8b5cf6', units: [
    { name: 'Julios', abbr: 'J', factor: 1, icon: '⚡' },
    { name: 'Calorías', abbr: 'cal', factor: 4.184, icon: '🔥' },
    { name: 'Kilocalorías', abbr: 'kcal', factor: 4184, icon: '🍔' },
    { name: 'Kilojulios', abbr: 'kJ', factor: 1000, icon: '🔋' },
    { name: 'kWh', abbr: 'kWh', factor: 3600000, icon: '💡' },
  ]},
  { name: 'Fuerza', icon: '💪', color: '#f97316', units: [
    { name: 'Newtons', abbr: 'N', factor: 1, icon: '💪' },
    { name: 'Kilonewtons', abbr: 'kN', factor: 1000, icon: '🏋️' },
    { name: 'Dinas', abbr: 'dyn', factor: 0.00001, icon: '🪶' },
    { name: 'Kg-fuerza', abbr: 'kgf', factor: 9.80665, icon: '⚖️' },
    { name: 'Libra-fuerza', abbr: 'lbf', factor: 4.44822, icon: '🏋️' },
  ]},
  { name: 'Presión', icon: '🌀', color: '#06b6d4', units: [
    { name: 'Pascales', abbr: 'Pa', factor: 1, icon: '🌀' },
    { name: 'Kilopascales', abbr: 'kPa', factor: 1000, icon: '💨' },
    { name: 'Atmósferas', abbr: 'atm', factor: 101325, icon: '🌍' },
    { name: 'Bar', abbr: 'bar', factor: 100000, icon: '📊' },
    { name: 'mmHg', abbr: 'mmHg', factor: 133.322, icon: '🩺' },
    { name: 'PSI', abbr: 'psi', factor: 6894.76, icon: '🛞' },
  ]},
  { name: 'Volumen', icon: '🧪', color: '#14b8a6', units: [
    { name: 'Litros', abbr: 'L', factor: 0.001, icon: '🧪' },
    { name: 'Mililitros', abbr: 'mL', factor: 0.000001, icon: '💧' },
    { name: 'Metros cúbicos', abbr: 'm³', factor: 1, icon: '🏊' },
    { name: 'cm³', abbr: 'cm³', factor: 0.000001, icon: '🧊' },
    { name: 'Galones', abbr: 'gal', factor: 0.00378541, icon: '⛽' },
  ]},
  { name: 'Datos', icon: '💾', color: '#64748b', units: [
    { name: 'Bytes', abbr: 'B', factor: 1, icon: '💾' },
    { name: 'Kilobytes', abbr: 'KB', factor: 1024, icon: '📄' },
    { name: 'Megabytes', abbr: 'MB', factor: 1048576, icon: '📸' },
    { name: 'Gigabytes', abbr: 'GB', factor: 1073741824, icon: '🎬' },
    { name: 'Terabytes', abbr: 'TB', factor: 1099511627776, icon: '🗄️' },
    { name: 'Bits', abbr: 'bit', factor: 0.125, icon: '🔢' },
  ]},
];

let ucCatIdx = 0;
let ucFromIdx = 0;
let ucToIdx = 1;

function ucConvertTemp(val, from, to) {
  let celsius;
  if (from === '°C') celsius = val;
  else if (from === '°F') celsius = (val - 32) * 5/9;
  else celsius = val - 273.15;
  if (to === '°C') return celsius;
  if (to === '°F') return celsius * 9/5 + 32;
  return celsius + 273.15;
}

function ucConvert(val, fromIdx, toIdx) {
  const cat = UC_CATEGORIES[ucCatIdx];
  if (cat.special) return ucConvertTemp(val, cat.units[fromIdx].abbr, cat.units[toIdx].abbr);
  return val * cat.units[fromIdx].factor / cat.units[toIdx].factor;
}

function ucRender() {
  const container = document.getElementById('unitconv-content');
  if (!container) return;
  const cat = UC_CATEGORIES[ucCatIdx];

  let html = `
    <div style="text-align:center;margin-bottom:0.8rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin-bottom:0.15rem;display:flex;align-items:center;justify-content:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        Convertidor de Unidades
      </h2>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:0.35rem;margin-bottom:1rem">`;

  UC_CATEGORIES.forEach((c, i) => {
    const active = i === ucCatIdx;
    html += `<button onclick="ucSetCat(${i})" style="background:${active ? c.color+'18' : 'var(--bg-card)'};color:${active ? c.color : 'var(--text-primary)'};border:2px solid ${active ? c.color : 'var(--border-color)'};border-radius:10px;padding:0.5rem 0.3rem;cursor:pointer;font-size:0.7rem;transition:all 0.15s;display:flex;flex-direction:column;align-items:center;gap:0.2rem">
      <span style="font-size:1.2rem">${c.icon}</span>
      <span style="font-weight:${active?'700':'500'}">${c.name}</span>
    </button>`;
  });

  html += `</div>
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:1rem;margin-bottom:0.5rem">

      <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.8rem">
        <select id="uc-from" onchange="ucFromIdx=parseInt(this.value);ucCalc()" style="flex:1;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.55rem 0.6rem;font-size:0.85rem;color:var(--text-primary);outline:none;appearance:auto">`;

  cat.units.forEach((u, i) => {
    html += `<option value="${i}" ${i===ucFromIdx?'selected':''}>${u.icon} ${u.abbr} — ${u.name}</option>`;
  });

  html += `
        </select>
        <button onclick="ucSwap()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:50%;width:34px;height:34px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform 0.15s" onmousedown="this.style.transform='rotate(180deg)'" onmouseup="this.style.transform='rotate(0)'">⇅</button>
        <select id="uc-to" onchange="ucToIdx=parseInt(this.value);ucCalc()" style="flex:1;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.55rem 0.6rem;font-size:0.85rem;color:var(--text-primary);outline:none;appearance:auto">`;

  cat.units.forEach((u, i) => {
    html += `<option value="${i}" ${i===ucToIdx?'selected':''}>${u.icon} ${u.abbr} — ${u.name}</option>`;
  });

  html += `</select></div>

      <div style="display:flex;gap:0.5rem;align-items:stretch">
        <div style="flex:1">
          <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:0.2rem;text-transform:uppercase;letter-spacing:0.05rem">Valor</div>
          <input id="uc-input" type="number" value="1" oninput="ucCalc()" style="width:100%;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.65rem 0.7rem;font-size:1.2rem;color:var(--text-primary);font-family:'Cambria Math',monospace;outline:none;box-sizing:border-box">
        </div>
        <div style="flex:1">
          <div style="font-size:0.65rem;color:var(--text-muted);margin-bottom:0.2rem;text-transform:uppercase;letter-spacing:0.05rem">Resultado</div>
          <div id="uc-output" style="width:100%;background:${cat.color}08;border:2px solid ${cat.color}30;border-radius:8px;padding:0.65rem 0.7rem;font-size:1.2rem;color:${cat.color};font-family:'Cambria Math',monospace;font-weight:700;min-height:1.1rem;box-sizing:border-box">1</div>
        </div>
      </div>

    </div>`;

  container.innerHTML = html;
  ucCalc();
}

function ucCalc() {
  const input = document.getElementById('uc-input');
  const output = document.getElementById('uc-output');
  if (!input || !output) return;
  const val = parseFloat(input.value);
  if (isNaN(val)) { output.textContent = '—'; return; }
  const result = ucConvert(val, ucFromIdx, ucToIdx);
  const formatted = Math.abs(result) >= 1e9 || (Math.abs(result) < 0.0001 && result !== 0)
    ? result.toExponential(4)
    : parseFloat(result.toPrecision(8));
  output.textContent = formatted;
}

function ucSwap() {
  const temp = ucFromIdx;
  ucFromIdx = ucToIdx;
  ucToIdx = temp;
  ucRender();
}

function ucSetCat(i) { ucCatIdx = i; ucFromIdx = 0; ucToIdx = Math.min(1, UC_CATEGORIES[i].units.length - 1); ucRender(); }

window.ucRender = ucRender;
window.ucCalc = ucCalc;
window.ucSetCat = ucSetCat;
window.ucSwap = ucSwap;
