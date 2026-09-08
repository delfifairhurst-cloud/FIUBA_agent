// unit-converter.js - Convertidor de unidades profesional
const UC_CATEGORIES = [
  { name: 'Longitud', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/></svg>', color: '#3b82f6', units: [
    { name: 'Metros', abbr: 'm', factor: 1 },
    { name: 'Centímetros', abbr: 'cm', factor: 0.01 },
    { name: 'Milímetros', abbr: 'mm', factor: 0.001 },
    { name: 'Kilómetros', abbr: 'km', factor: 1000 },
    { name: 'Millas', abbr: 'mi', factor: 1609.344 },
    { name: 'Pulgadas', abbr: 'in', factor: 0.0254 },
    { name: 'Pies', abbr: 'ft', factor: 0.3048 },
  ]},
  { name: 'Masa', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3a4 4 0 0 0-4 4c0 2 2 4 4 4s4-2 4-4a4 4 0 0 0-4-4z"/><path d="M4 21h16"/><path d="M5 21l3-9h8l3 9"/></svg>', color: '#ef4444', units: [
    { name: 'Kilogramos', abbr: 'kg', factor: 1 },
    { name: 'Gramos', abbr: 'g', factor: 0.001 },
    { name: 'Miligramos', abbr: 'mg', factor: 0.000001 },
    { name: 'Toneladas', abbr: 't', factor: 1000 },
    { name: 'Libras', abbr: 'lb', factor: 0.453592 },
    { name: 'Onzas', abbr: 'oz', factor: 0.0283495 },
  ]},
  { name: 'Tiempo', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', color: '#22c55e', units: [
    { name: 'Segundos', abbr: 's', factor: 1 },
    { name: 'Milisegundos', abbr: 'ms', factor: 0.001 },
    { name: 'Minutos', abbr: 'min', factor: 60 },
    { name: 'Horas', abbr: 'h', factor: 3600 },
    { name: 'Días', abbr: 'd', factor: 86400 },
  ]},
  { name: 'Velocidad', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 6v6l4 2"/></svg>', color: '#f59e0b', units: [
    { name: 'm/s', abbr: 'm/s', factor: 1 },
    { name: 'km/h', abbr: 'km/h', factor: 0.277778 },
    { name: 'mph', abbr: 'mph', factor: 0.44704 },
    { name: 'Nudos', abbr: 'kn', factor: 0.514444 },
  ]},
  { name: 'Temperatura', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>', color: '#ec4899', units: [
    { name: 'Celsius', abbr: '°C', factor: null },
    { name: 'Fahrenheit', abbr: '°F', factor: null },
    { name: 'Kelvin', abbr: 'K', factor: null },
  ], special: true },
  { name: 'Energía', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', color: '#8b5cf6', units: [
    { name: 'Julios', abbr: 'J', factor: 1 },
    { name: 'Calorías', abbr: 'cal', factor: 4.184 },
    { name: 'Kilocalorías', abbr: 'kcal', factor: 4184 },
    { name: 'Kilojulios', abbr: 'kJ', factor: 1000 },
    { name: 'kWh', abbr: 'kWh', factor: 3600000 },
  ]},
  { name: 'Fuerza', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>', color: '#f97316', units: [
    { name: 'Newtons', abbr: 'N', factor: 1 },
    { name: 'Kilonewtons', abbr: 'kN', factor: 1000 },
    { name: 'Dinas', abbr: 'dyn', factor: 0.00001 },
    { name: 'Kg-fuerza', abbr: 'kgf', factor: 9.80665 },
    { name: 'Libra-fuerza', abbr: 'lbf', factor: 4.44822 },
  ]},
  { name: 'Presión', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>', color: '#06b6d4', units: [
    { name: 'Pascales', abbr: 'Pa', factor: 1 },
    { name: 'Kilopascales', abbr: 'kPa', factor: 1000 },
    { name: 'Atmósferas', abbr: 'atm', factor: 101325 },
    { name: 'Bar', abbr: 'bar', factor: 100000 },
    { name: 'mmHg', abbr: 'mmHg', factor: 133.322 },
    { name: 'PSI', abbr: 'psi', factor: 6894.76 },
  ]},
  { name: 'Volumen', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4.5 3h15"/><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/><path d="M6 14h12"/></svg>', color: '#14b8a6', units: [
    { name: 'Litros', abbr: 'L', factor: 0.001 },
    { name: 'Mililitros', abbr: 'mL', factor: 0.000001 },
    { name: 'Metros cúbicos', abbr: 'm³', factor: 1 },
    { name: 'cm³', abbr: 'cm³', factor: 0.000001 },
    { name: 'Galones', abbr: 'gal', factor: 0.00378541 },
  ]},
  { name: 'Datos', icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="22" x2="2" y1="12" y2="12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><line x1="6" x2="6.01" y1="16" y2="16"/><line x1="10" x2="10.01" y1="16" y2="16"/></svg>', color: '#64748b', units: [
    { name: 'Bytes', abbr: 'B', factor: 1 },
    { name: 'Kilobytes', abbr: 'KB', factor: 1024 },
    { name: 'Megabytes', abbr: 'MB', factor: 1048576 },
    { name: 'Gigabytes', abbr: 'GB', factor: 1073741824 },
    { name: 'Terabytes', abbr: 'TB', factor: 1099511627776 },
    { name: 'Bits', abbr: 'bit', factor: 0.125 },
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
    html += `<option value="${i}" ${i===ucFromIdx?'selected':''}>${u.abbr} — ${u.name}</option>`;
  });

  html += `
        </select>
        <button onclick="ucSwap()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:50%;width:34px;height:34px;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform 0.15s" onmousedown="this.style.transform='rotate(180deg)'" onmouseup="this.style.transform='rotate(0)'">⇅</button>
        <select id="uc-to" onchange="ucToIdx=parseInt(this.value);ucCalc()" style="flex:1;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.55rem 0.6rem;font-size:0.85rem;color:var(--text-primary);outline:none;appearance:auto">`;

  cat.units.forEach((u, i) => {
    html += `<option value="${i}" ${i===ucToIdx?'selected':''}>${u.abbr} — ${u.name}</option>`;
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
