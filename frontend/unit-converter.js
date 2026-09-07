// unit-converter.js - Convertidor de unidades (sin IA)
const UC_CATEGORIES = [
  { name: 'Longitud', icon: '📏', units: [
    { name: 'Metros', abbr: 'm', factor: 1 },
    { name: 'Centímetros', abbr: 'cm', factor: 0.01 },
    { name: 'Milímetros', abbr: 'mm', factor: 0.001 },
    { name: 'Kilómetros', abbr: 'km', factor: 1000 },
    { name: 'Milas', abbr: 'mi', factor: 1609.344 },
    { name: 'Yardas', abbr: 'yd', factor: 0.9144 },
    { name: 'Pulgadas', abbr: 'in', factor: 0.0254 },
    { name: 'Pies', abbr: 'ft', factor: 0.3048 },
  ]},
  { name: 'Masa', icon: '⚖️', units: [
    { name: 'Kilogramos', abbr: 'kg', factor: 1 },
    { name: 'Gramos', abbr: 'g', factor: 0.001 },
    { name: 'Miligramos', abbr: 'mg', factor: 0.000001 },
    { name: 'Toneladas', abbr: 't', factor: 1000 },
    { name: 'Libras', abbr: 'lb', factor: 0.453592 },
    { name: 'Onzas', abbr: 'oz', factor: 0.0283495 },
  ]},
  { name: 'Tiempo', icon: '⏱️', units: [
    { name: 'Segundos', abbr: 's', factor: 1 },
    { name: 'Milisegundos', abbr: 'ms', factor: 0.001 },
    { name: 'Minutos', abbr: 'min', factor: 60 },
    { name: 'Horas', abbr: 'h', factor: 3600 },
    { name: 'Días', abbr: 'd', factor: 86400 },
  ]},
  { name: 'Velocidad', icon: '🚀', units: [
    { name: 'm/s', abbr: 'm/s', factor: 1 },
    { name: 'km/h', abbr: 'km/h', factor: 0.277778 },
    { name: 'mph', abbr: 'mph', factor: 0.44704 },
    { name: 'Nudos', abbr: 'kn', factor: 0.514444 },
  ]},
  { name: 'Temperatura', icon: '🌡️', units: [
    { name: 'Celsius', abbr: '°C', factor: null },
    { name: 'Fahrenheit', abbr: '°F', factor: null },
    { name: 'Kelvin', abbr: 'K', factor: null },
  ], special: true },
  { name: 'Energía', icon: '⚡', units: [
    { name: 'Julios', abbr: 'J', factor: 1 },
    { name: 'Calorías', abbr: 'cal', factor: 4.184 },
    { name: 'Kilocalorías', abbr: 'kcal', factor: 4184 },
    { name: 'Kilojulios', abbr: 'kJ', factor: 1000 },
    { name: 'Electronvoltios', abbr: 'eV', factor: 1.602e-19 },
    { name: 'kWh', abbr: 'kWh', factor: 3600000 },
  ]},
  { name: 'Fuerza', icon: '💪', units: [
    { name: 'Newtons', abbr: 'N', factor: 1 },
    { name: 'Kilonewtons', abbr: 'kN', factor: 1000 },
    { name: 'Dinas', abbr: 'dyn', factor: 0.00001 },
    { name: 'Kilogramo-fuerza', abbr: 'kgf', factor: 9.80665 },
    { name: 'Libra-fuerza', abbr: 'lbf', factor: 4.44822 },
  ]},
  { name: 'Presión', icon: '🌀', units: [
    { name: 'Pascales', abbr: 'Pa', factor: 1 },
    { name: 'Kilopascales', abbr: 'kPa', factor: 1000 },
    { name: 'Atmósferas', abbr: 'atm', factor: 101325 },
    { name: 'Bar', abbr: 'bar', factor: 100000 },
    { name: 'mmHg', abbr: 'mmHg', factor: 133.322 },
    { name: 'PSI', abbr: 'psi', factor: 6894.76 },
  ]},
  { name: 'Volumen', icon: '🧪', units: [
    { name: 'Litros', abbr: 'L', factor: 0.001 },
    { name: 'Mililitros', abbr: 'mL', factor: 0.000001 },
    { name: 'Metros cúbicos', abbr: 'm³', factor: 1 },
    { name: 'Centímetros cúbicos', abbr: 'cm³', factor: 0.000001 },
    { name: 'Galones (US)', abbr: 'gal', factor: 0.00378541 },
  ]},
  { name: 'Datos', icon: '💾', units: [
    { name: 'Bytes', abbr: 'B', factor: 1 },
    { name: 'Kilobytes', abbr: 'KB', factor: 1024 },
    { name: 'Megabytes', abbr: 'MB', factor: 1048576 },
    { name: 'Gigabytes', abbr: 'GB', factor: 1073741824 },
    { name: 'Terabytes', abbr: 'TB', factor: 1099511627776 },
    { name: 'Bits', abbr: 'bit', factor: 0.125 },
  ]},
];

let ucCatIdx = 0;

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
  const base = val * cat.units[fromIdx].factor;
  return base / cat.units[toIdx].factor;
}

function ucRender() {
  const container = document.getElementById('unitconv-content');
  if (!container) return;
  const cat = UC_CATEGORIES[ucCatIdx];

  let html = `
    <div style="text-align:center;margin-bottom:1rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin-bottom:0.2rem;display:flex;align-items:center;justify-content:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        Convertidor de Unidades
      </h2>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:0.3rem;justify-content:center;margin-bottom:1rem">`;

  UC_CATEGORIES.forEach((c, i) => {
    html += `<button onclick="ucSetCat(${i})" style="background:${i===ucCatIdx?'#06b6d4':'var(--bg-secondary)'};color:${i===ucCatIdx?'white':'var(--text-primary)'};border:1px solid ${i===ucCatIdx?'#06b6d4':'var(--border-color)'};border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.75rem;transition:all 0.15s">${c.icon} ${c.name}</button>`;
  });

  html += `</div>
    <div style="display:flex;flex-direction:column;gap:0.6rem">
      <div style="display:flex;gap:0.5rem;align-items:center">
        <input id="uc-input" type="number" value="1" oninput="ucCalc()" style="flex:1;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;font-size:1.1rem;color:var(--text-primary);font-family:'Cambria Math',monospace;outline:none">
        <select id="uc-from" onchange="ucCalc()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem;font-size:0.85rem;color:var(--text-primary);min-width:100px">`;

  cat.units.forEach((u, i) => {
    html += `<option value="${i}">${u.abbr} — ${u.name}</option>`;
  });

  html += `</select></div>
      <div style="text-align:center;font-size:1.2rem;color:var(--text-muted)">⇅</div>
      <div style="display:flex;gap:0.5rem;align-items:center">
        <div id="uc-output" style="flex:1;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem;font-size:1.1rem;color:#06b6d4;font-family:'Cambria Math',monospace;font-weight:700;min-height:1.5rem">1</div>
        <select id="uc-to" onchange="ucCalc()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem;font-size:0.85rem;color:var(--text-primary);min-width:100px">`;

  cat.units.forEach((u, i) => {
    html += `<option value="${i}" ${i===1?'selected':''}>${u.abbr} — ${u.name}</option>`;
  });

  html += `</select></div></div>`;

  container.innerHTML = html;
  ucCalc();
}

function ucCalc() {
  const input = document.getElementById('uc-input');
  const fromSel = document.getElementById('uc-from');
  const toSel = document.getElementById('uc-to');
  const output = document.getElementById('uc-output');
  if (!input || !fromSel || !toSel || !output) return;
  const val = parseFloat(input.value);
  if (isNaN(val)) { output.textContent = '—'; return; }
  const result = ucConvert(val, parseInt(fromSel.value), parseInt(toSel.value));
  const formatted = Math.abs(result) >= 1e6 || (Math.abs(result) < 0.001 && result !== 0)
    ? result.toExponential(4)
    : parseFloat(result.toPrecision(8));
  output.textContent = formatted;
}

function ucSetCat(i) { ucCatIdx = i; ucRender(); }

window.ucRender = ucRender;
window.ucCalc = ucCalc;
window.ucSetCat = ucSetCat;
