// graphing-calculator.js - Calculadora gráfica profesional estilo GeoGebra
let gcFunctions = [{ expr: '', color: '#8b5cf6', visible: true }];
let gcScale = 40;
let gcOffsetX = 0, gcOffsetY = 0;
let gcDragging = false, gcDragStart = null;
let gcActiveInput = 0;
let gcShowGrid = true;
let gcSnap = false;
const GC_COLORS = ['#8b5cf6','#ef4444','#22c55e','#f59e0b','#06b6d4','#ec4899','#f97316','#6366f1'];

function gcEval(expr, x) {
  try {
    const safe = expr
      .replace(/\^/g, '**')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/asin\(/g, 'Math.asin(')
      .replace(/acos\(/g, 'Math.acos(')
      .replace(/atan\(/g, 'Math.atan(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/log\(/g, 'Math.log(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/exp\(/g, 'Math.exp(')
      .replace(/pi/gi, 'Math.PI')
      .replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g, 'Math.E');
    return new Function('x', 'return ' + safe)(x);
  } catch { return NaN; }
}

function gcInsertAtCursor(text) {
  const inp = document.getElementById('gc-expr-input');
  if (!inp) return;
  const start = inp.selectionStart, end = inp.selectionEnd;
  const val = inp.value;
  inp.value = val.substring(0, start) + text + val.substring(end);
  inp.selectionStart = inp.selectionEnd = start + text.length;
  inp.focus();
  gcFunctions[gcActiveInput].expr = inp.value;
  gcDraw();
}

function gcRender() {
  const container = document.getElementById('graphcalc-content');
  if (!container) return;

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;flex-wrap:wrap;gap:0.4rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-10"/></svg>
        Calculadora Gráfica
      </h2>
      <div style="display:flex;gap:0.25rem;align-items:center">
        <span id="gc-zoom-label" style="font-size:0.7rem;color:var(--text-muted);min-width:35px;text-align:right">${Math.round(gcScale/40*100)}%</span>
        <button onclick="gcZoom(1.4)" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.85rem;color:var(--text-primary)">+</button>
        <button onclick="gcZoom(0.7)" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.85rem;color:var(--text-primary)">−</button>
        <button onclick="gcReset()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.7rem;color:var(--text-primary)">Reset</button>
        <button onclick="gcToggleGrid()" style="background:${gcShowGrid?'#8b5cf618':'var(--bg-secondary)'};border:1px solid ${gcShowGrid?'#8b5cf640':'var(--border-color)'};border-radius:6px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.7rem;color:${gcShowGrid?'#8b5cf6':'var(--text-muted)'}">Grilla</button>
      </div>
    </div>

    <div style="display:flex;gap:0.4rem;align-items:center;margin-bottom:0.4rem">
      <input type="color" value="${gcFunctions[gcActiveInput].color}" onchange="gcSetColor(${gcActiveInput},this.value)" style="width:28px;height:28px;border:none;cursor:pointer;border-radius:6px;flex-shrink:0">
      <span style="color:var(--text-muted);font-size:0.8rem;font-weight:600;flex-shrink:0">f(x)=</span>
      <input id="gc-expr-input" value="${gcFunctions[gcActiveInput].expr}" oninput="gcSetExprActive(this.value)" placeholder="x^2, sin(x), 2x+1..."
        style="flex:1;background:var(--bg-card);border:2px solid var(--border-color);border-radius:8px;padding:0.45rem 0.6rem;font-size:0.9rem;color:var(--text-primary);font-family:'Cambria Math',monospace;outline:none;min-width:0"
        onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">
      <button onclick="gcToggleVisible(${gcActiveInput})" style="background:none;border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.4rem;cursor:pointer;font-size:0.75rem;color:${gcFunctions[gcActiveInput].visible?'var(--text-primary)':'var(--text-muted)'};flex-shrink:0" title="Mostrar/ocultar">${gcFunctions[gcActiveInput].visible?'👁':'👁‍🗨'}</button>
    </div>

    <div style="display:flex;gap:0.25rem;flex-wrap:wrap;margin-bottom:0.4rem">`;

  gcFunctions.forEach((fn, i) => {
    html += `<button onclick="gcSelectFn(${i})" style="background:${i===gcActiveInput?fn.color+'20':'var(--bg-secondary)'};color:${i===gcActiveInput?fn.color:'var(--text-primary)'};border:1.5px solid ${i===gcActiveInput?fn.color:'var(--border-color)'};border-radius:6px;padding:0.2rem 0.45rem;cursor:pointer;font-size:0.72rem;transition:all 0.15s;display:flex;align-items:center;gap:0.3rem">
      <span style="width:8px;height:8px;border-radius:50%;background:${fn.color};display:inline-block;flex-shrink:0"></span>
      ${fn.expr || 'vacía'}
    </button>`;
  });
  html += `<button onclick="gcAddFn()" style="background:none;border:1px dashed var(--border-color);border-radius:6px;padding:0.2rem 0.45rem;cursor:pointer;font-size:0.72rem;color:var(--text-muted)">+ Nueva</button>`;
  html += `</div>`;

  // ─── KEYPAD ───
  html += `
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.4rem;margin-bottom:0.5rem">
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:0.2rem">
        ${gcKeyBtn('7','7','num')}${gcKeyBtn('8','8','num')}${gcKeyBtn('9','9','num')}${gcKeyBtn('⌫','backspace','action')}${gcKeyBtn('AC','clear','action')}${gcKeyBtn('÷','/','op')}
        ${gcKeyBtn('4','4','num')}${gcKeyBtn('5','5','num')}${gcKeyBtn('6','6','num')}${gcKeyBtn('(','(','op')}${gcKeyBtn(')',')','op')}${gcKeyBtn('×','*','op')}
        ${gcKeyBtn('1','1','num')}${gcKeyBtn('2','2','num')}${gcKeyBtn('3','3','num')}${gcKeyBtn('x','x','var')}${gcKeyBtn('x²','^2','func')}${gcKeyBtn('−','-','op')}
        ${gcKeyBtn('0','0','num')}${gcKeyBtn('.','.','num')}${gcKeyBtn(', ',', ','num')}${gcKeyBtn('^','^','op')}${gcKeyBtn('+','+','op')}${gcKeyBtn('=','=','op')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:0.2rem;margin-top:0.2rem">
        ${gcKeyBtn('sin','sin(','func')}${gcKeyBtn('cos','cos(','func')}${gcKeyBtn('tan','tan(','func')}${gcKeyBtn('√','sqrt(','func')}${gcKeyBtn('|x|','abs(','func')}${gcKeyBtn('π','pi','const')}
        ${gcKeyBtn('asin','asin(','func')}${gcKeyBtn('acos','acos(','func')}${gcKeyBtn('atan','atan(','func')}${gcKeyBtn('log','log(','func')}${gcKeyBtn('ln','ln(','func')}${gcKeyBtn('e','e','const')}
      </div>
    </div>`;

  // ─── CANVAS ───
  html += `<div style="position:relative;border:1px solid var(--border-color);border-radius:10px;overflow:hidden">
    <canvas id="gc-canvas" style="width:100%;height:340px;cursor:crosshair;background:var(--bg-card);display:block"></canvas>
    <div id="gc-tooltip" style="display:none;position:fixed;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.2rem 0.5rem;font-size:0.72rem;color:var(--text-primary);pointer-events:none;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-family:'Cambria Math',monospace"></div>
    <div style="position:absolute;bottom:6px;left:8px;font-size:0.6rem;color:var(--text-muted);opacity:0.5">Scroll=zoom · Drag=mover</div>
  </div>`;

  container.innerHTML = html;
  gcDraw();
  gcUpdateZoomLabel();

  setTimeout(() => {
    const inp = document.getElementById('gc-expr-input');
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); gcDraw(); } });
  }, 50);
}

function gcKeyBtn(label, action, type) {
  const bg = type === 'func' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
    : type === 'const' ? 'linear-gradient(135deg,#22c55e,#14b8a6)'
    : type === 'var' ? 'linear-gradient(135deg,#f59e0b,#f97316)'
    : type === 'op' ? 'linear-gradient(135deg,#64748b,#475569)'
    : type === 'action' ? 'linear-gradient(135deg,#ef4444,#dc2626)'
    : 'var(--bg-secondary)';
  const fg = type !== 'num' ? 'white' : 'var(--text-primary)';
  const onclick = action === 'backspace' ? 'gcKeyBackspace()' : action === 'clear' ? 'gcKeyClear()' : `gcInsertAtCursor('${action.replace(/'/g,"\\'")}')`;
  return `<button onclick="${onclick}" style="background:${bg};color:${fg};border:none;border-radius:5px;padding:0.35rem;cursor:pointer;font-size:0.75rem;font-weight:600;transition:transform 0.08s;user-select:none;font-family:'Cambria Math',monospace" onmousedown="this.style.transform='scale(0.9)'" onmouseup="this.style.transform='scale(1)'">${label}</button>`;
}

function gcKeyBackspace() {
  const inp = document.getElementById('gc-expr-input');
  if (!inp) return;
  const start = inp.selectionStart;
  if (start > 0) { inp.value = inp.value.substring(0, start-1) + inp.value.substring(inp.selectionEnd); inp.selectionStart = inp.selectionEnd = start-1; }
  inp.focus();
  gcFunctions[gcActiveInput].expr = inp.value;
  gcDraw();
}

function gcKeyClear() {
  gcFunctions[gcActiveInput].expr = '';
  const inp = document.getElementById('gc-expr-input');
  if (inp) inp.value = '';
  gcDraw();
}

function gcUpdateZoomLabel() {
  const el = document.getElementById('gc-zoom-label');
  if (el) el.textContent = Math.round(gcScale / 40 * 100) + '%';
}

function gcDraw() {
  const canvas = document.getElementById('gc-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = rect.width, H = rect.height;
  const cx = W / 2 + gcOffsetX, cy = H / 2 + gcOffsetY;

  ctx.clearRect(0, 0, W, H);

  const cs = getComputedStyle(document.documentElement);
  const bg = cs.getPropertyValue('--bg-card').trim() || '#fff';
  const gridColor = cs.getPropertyValue('--border-color').trim() || '#e5e7eb';
  const textColor = cs.getPropertyValue('--text-muted').trim() || '#9ca3af';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const unitsPerPx = 1 / gcScale;

  if (gcShowGrid) {
    // Minor grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.3;
    ctx.globalAlpha = 0.4;
    const minorStep = gcScale / 2;
    for (let x = cx % minorStep; x < W; x += minorStep) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = cy % minorStep; y < H; y += minorStep) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.globalAlpha = 1;

    // Major grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.6;
    for (let x = cx % gcScale; x < W; x += gcScale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = cy % gcScale; y < H; y += gcScale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }

  // Axes
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

  // Axis arrows
  ctx.fillStyle = textColor;
  ctx.beginPath(); ctx.moveTo(W-2, cy-4); ctx.lineTo(W, cy); ctx.lineTo(W-2, cy+4); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx-4, 2); ctx.lineTo(cx, 0); ctx.lineTo(cx+4, 2); ctx.fill();

  // Labels
  ctx.fillStyle = textColor;
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  const labelStep = gcScale >= 30 ? 1 : gcScale >= 15 ? 2 : gcScale >= 8 ? 5 : 10;
  for (let i = -Math.ceil(W / gcScale); i <= Math.ceil(W / gcScale); i++) {
    const val = i * labelStep;
    if (val === 0) continue;
    const px = cx + val * gcScale / labelStep;
    if (px > 10 && px < W - 10) {
      ctx.fillText(val, px, cy + 14);
      // Tick marks
      ctx.beginPath(); ctx.moveTo(px, cy - 2); ctx.lineTo(px, cy + 2); ctx.stroke();
    }
  }
  ctx.textAlign = 'right';
  for (let i = -Math.ceil(H / gcScale); i <= Math.ceil(H / gcScale); i++) {
    const val = i * labelStep;
    if (val === 0) continue;
    const py = cy - val * gcScale / labelStep;
    if (py > 10 && py < H - 10) {
      ctx.fillText(val, cx - 6, py + 3);
      ctx.beginPath(); ctx.moveTo(cx - 2, py); ctx.lineTo(cx + 2, py); ctx.stroke();
    }
  }
  // Origin
  ctx.textAlign = 'right';
  ctx.fillText('0', cx - 5, cy + 13);

  // Functions
  gcFunctions.forEach((fn, idx) => {
    if (!fn.expr || !fn.visible) return;
    ctx.strokeStyle = fn.color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    let started = false;
    let prevY = null;
    for (let px = 0; px < W; px++) {
      const x = (px - cx) * unitsPerPx;
      const y = gcEval(fn.expr, x);
      if (isNaN(y) || !isFinite(y) || Math.abs(y) > 1e6) { started = false; prevY = null; continue; }
      const py = cy - y * gcScale;
      // Discontinuity detection (e.g., tan)
      if (started && prevY !== null && Math.abs(py - prevY) > H * 0.8) { started = false; }
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
      prevY = py;
    }
    ctx.stroke();
  });
}

function gcZoom(f) { gcScale = Math.max(5, Math.min(300, gcScale * f)); gcUpdateZoomLabel(); gcDraw(); }
function gcReset() { gcScale = 40; gcOffsetX = 0; gcOffsetY = 0; gcUpdateZoomLabel(); gcDraw(); }
function gcAddFn() { gcFunctions.push({ expr: '', color: GC_COLORS[gcFunctions.length % GC_COLORS.length], visible: true }); gcActiveInput = gcFunctions.length - 1; gcRender(); }
function gcSelectFn(i) { gcActiveInput = i; gcRender(); }
function gcSetExprActive(v) { gcFunctions[gcActiveInput].expr = v; gcDraw(); }
function gcSetColor(i, v) { gcFunctions[i].color = v; if (i === gcActiveInput) document.querySelector('#graphcalc-content input[type=color]') && (document.querySelector('#graphcalc-content input[type=color]').value = v); gcDraw(); }
function gcToggleVisible(i) { gcFunctions[i].visible = !gcFunctions[i].visible; gcRender(); }
function gcToggleGrid() { gcShowGrid = !gcShowGrid; gcRender(); }

window.gcRender = gcRender;
window.gcZoom = gcZoom;
window.gcReset = gcReset;
window.gcAddFn = gcAddFn;
window.gcSelectFn = gcSelectFn;
window.gcSetExprActive = gcSetExprActive;
window.gcSetColor = gcSetColor;
window.gcToggleVisible = gcToggleVisible;
window.gcToggleGrid = gcToggleGrid;
window.gcInsertAtCursor = gcInsertAtCursor;
window.gcKeyBackspace = gcKeyBackspace;
window.gcKeyClear = gcKeyClear;

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const canvas = document.getElementById('gc-canvas');
    if (!canvas) return;
    canvas.addEventListener('wheel', e => { e.preventDefault(); gcZoom(e.deltaY < 0 ? 1.12 : 0.89); });
    canvas.addEventListener('mousedown', e => { gcDragging = true; gcDragStart = { x: e.clientX - gcOffsetX, y: e.clientY - gcOffsetY }; canvas.style.cursor = 'grabbing'; });
    window.addEventListener('mousemove', e => {
      if (!gcDragging) return;
      gcOffsetX = e.clientX - gcDragStart.x;
      gcOffsetY = e.clientY - gcDragStart.y;
      gcDraw();
    });
    window.addEventListener('mouseup', () => { gcDragging = false; const c = document.getElementById('gc-canvas'); if (c) c.style.cursor = 'crosshair'; });
    canvas.addEventListener('mousemove', e => {
      if (gcDragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const cxx = rect.width / 2 + gcOffsetX, cyy = rect.height / 2 + gcOffsetY;
      const x = (mx - cxx) / gcScale;
      const tooltip = document.getElementById('gc-tooltip');
      if (!tooltip) return;
      let found = false;
      gcFunctions.forEach(fn => {
        if (!fn.expr || !fn.visible) return;
        const y = gcEval(fn.expr, x);
        if (isNaN(y) || !isFinite(y)) return;
        const py = cyy - y * gcScale;
        if (Math.abs(my - py) < 12) {
          tooltip.style.display = 'block';
          tooltip.style.left = (e.clientX + 14) + 'px';
          tooltip.style.top = (e.clientY - 8) + 'px';
          tooltip.innerHTML = `<span style="color:${fn.color}">●</span> (${x.toFixed(2)}, ${y.toFixed(2)})`;
          found = true;
        }
      });
      if (!found) tooltip.style.display = 'none';
    });
    canvas.addEventListener('mouseleave', () => { const t = document.getElementById('gc-tooltip'); if (t) t.style.display = 'none'; });
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) { gcDragging = true; gcDragStart = { x: e.touches[0].clientX - gcOffsetX, y: e.touches[0].clientY - gcOffsetY }; }
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!gcDragging || e.touches.length !== 1) return;
      gcOffsetX = e.touches[0].clientX - gcDragStart.x;
      gcOffsetY = e.touches[0].clientY - gcDragStart.y;
      gcDraw();
    }, { passive: true });
    canvas.addEventListener('touchend', () => { gcDragging = false; });
  }, 100);
});
