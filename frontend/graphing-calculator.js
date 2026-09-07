// graphing-calculator.js - Calculadora gráfica estilo GeoGebra (canvas)
let gcFunctions = [{ expr: '', color: '#8b5cf6' }];
let gcScale = 40;
let gcOffsetX = 0, gcOffsetY = 0;
let gcDragging = false, gcDragStart = null;
let gcActiveInput = 0;
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
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;flex-wrap:wrap;gap:0.4rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-10"/></svg>
        Calculadora Gráfica
      </h2>
      <div style="display:flex;gap:0.3rem">
        <button onclick="gcZoom(1.3)" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.85rem;color:var(--text-primary)">+</button>
        <button onclick="gcZoom(0.7)" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.85rem;color:var(--text-primary)">−</button>
        <button onclick="gcReset()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.75rem;color:var(--text-primary)">Reset</button>
      </div>
    </div>

    <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem">
      <input type="color" value="${gcFunctions[gcActiveInput].color}" onchange="gcSetColor(${gcActiveInput},this.value)" style="width:30px;height:30px;border:none;cursor:pointer;border-radius:6px">
      <span style="color:var(--text-muted);font-size:0.85rem;font-weight:600">f(x) =</span>
      <input id="gc-expr-input" value="${gcFunctions[gcActiveInput].expr}" oninput="gcSetExprActive(this.value)" placeholder="Ej: x^2, sin(x), 2x+1"
        style="flex:1;background:var(--bg-card);border:2px solid var(--border-color);border-radius:8px;padding:0.5rem 0.7rem;font-size:0.95rem;color:var(--text-primary);font-family:'Cambria Math',monospace;outline:none"
        onfocus="this.style.borderColor='#8b5cf6'" onblur="this.style.borderColor='var(--border-color)'">
    </div>

    <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.6rem">`;

  gcFunctions.forEach((fn, i) => {
    html += `<button onclick="gcSelectFn(${i})" style="background:${i===gcActiveInput?fn.color:'var(--bg-secondary)'};color:${i===gcActiveInput?'white':'var(--text-primary)'};border:1px solid ${i===gcActiveInput?fn.color:'var(--border-color)'};border-radius:6px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.75rem;transition:all 0.15s">
      f${gcFunctions.length>1?i+1:''} ${fn.expr||'vacía'}
    </button>`;
  });
  html += `<button onclick="gcAddFn()" style="background:none;border:1px dashed var(--border-color);border-radius:6px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.75rem;color:var(--text-muted)">+</button>`;
  html += `</div>`;

  // ─── KEYPAD ───
  html += `
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.5rem;margin-bottom:0.6rem">
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:0.25rem">
        ${gcKeyBtn('7','7')}${gcKeyBtn('8','8')}${gcKeyBtn('9','9')}${gcKeyBtn('←','backspace')}${gcKeyBtn('AC','clear')}${gcKeyBtn('÷','/')}
        ${gcKeyBtn('4','4')}${gcKeyBtn('5','5')}${gcKeyBtn('6','6')}${gcKeyBtn('(','(')}${gcKeyBtn(')',')')}${gcKeyBtn('×','*')}
        ${gcKeyBtn('1','1')}${gcKeyBtn('2','2')}${gcKeyBtn('3','3')}${gcKeyBtn('x','x')}${gcKeyBtn('x²','^2')}${gcKeyBtn('-','-')}
        ${gcKeyBtn('0','0')}${gcKeyBtn('.','.')}${gcKeyBtn(', ',', ')}${gcKeyBtn('^','^')}${gcKeyBtn('+','+')}${gcKeyBtn('=','=')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:0.25rem;margin-top:0.25rem">
        ${gcKeyBtn('sin','sin(')}${gcKeyBtn('cos','cos(')}${gcKeyBtn('tan','tan(')}${gcKeyBtn('√','sqrt(')}${gcKeyBtn('|x|','abs(')}${gcKeyBtn('π','pi')}
        ${gcKeyBtn('asin','asin(')}${gcKeyBtn('acos','acos(')}${gcKeyBtn('atan','atan(')}${gcKeyBtn('log','log(')}${gcKeyBtn('ln','ln(')}${gcKeyBtn('e','e')}
      </div>
    </div>`;

  // ─── CANVAS ───
  html += `<div style="position:relative">
    <canvas id="gc-canvas" style="width:100%;height:350px;border:1px solid var(--border-color);border-radius:8px;cursor:crosshair;background:var(--bg-card)"></canvas>
    <div id="gc-tooltip" style="display:none;position:fixed;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.25rem 0.5rem;font-size:0.75rem;color:var(--text-primary);pointer-events:none;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,0.15)"></div>
  </div>`;

  container.innerHTML = html;
  gcDraw();

  // Keypad keyboard support
  setTimeout(() => {
    const inp = document.getElementById('gc-expr-input');
    if (inp) inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); gcDraw(); } });
  }, 50);
}

function gcKeyBtn(label, action) {
  const bg = ['sin','cos','tan','asin','acos','atan','√','|x|','log','ln','π','e'].includes(action.replace('(',''))
    ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--bg-secondary)';
  const fg = ['sin','cos','tan','asin','acos','atan','√','|x|','log','ln','π','e'].includes(action.replace('(',''))
    ? 'white' : 'var(--text-primary)';
  const onclick = action === 'backspace' ? 'gcKeyBackspace()' : action === 'clear' ? 'gcKeyClear()' : `gcInsertAtCursor('${action.replace(/'/g,"\\'")}')`;
  return `<button onclick="${onclick}" style="background:${bg};color:${fg};border:1px solid var(--border-color);border-radius:6px;padding:0.4rem;cursor:pointer;font-size:0.78rem;font-weight:600;transition:transform 0.08s;user-select:none" onmousedown="this.style.transform='scale(0.92)'" onmouseup="this.style.transform='scale(1)'">${label}</button>`;
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

function gcDraw() {
  const canvas = document.getElementById('gc-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * (window.devicePixelRatio || 1);
  canvas.height = rect.height * (window.devicePixelRatio || 1);
  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  const W = rect.width, H = rect.height;
  const cx = W / 2 + gcOffsetX, cy = H / 2 + gcOffsetY;

  ctx.clearRect(0, 0, W, H);
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#fff';
  const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e5e7eb';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#9ca3af';
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;
  const step = gcScale;
  for (let x = cx % step; x < W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = cy % step; y < H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Axes
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

  // Labels
  ctx.fillStyle = textColor;
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  const labelStep = gcScale >= 20 ? 1 : gcScale >= 10 ? 2 : 5;
  for (let i = -Math.ceil(W / gcScale); i <= Math.ceil(W / gcScale); i++) {
    const val = i * labelStep;
    if (val === 0) continue;
    const px = cx + val * gcScale / labelStep;
    if (px > 5 && px < W - 5) ctx.fillText(val, px, cy + 14);
  }
  ctx.textAlign = 'right';
  for (let i = -Math.ceil(H / gcScale); i <= Math.ceil(H / gcScale); i++) {
    const val = i * labelStep;
    if (val === 0) continue;
    const py = cy - val * gcScale / labelStep;
    if (py > 5 && py < H - 5) ctx.fillText(val, cx - 5, py + 3);
  }

  // Functions
  const unitsPerPx = 1 / gcScale;
  gcFunctions.forEach(fn => {
    if (!fn.expr) return;
    ctx.strokeStyle = fn.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    for (let px = 0; px < W; px++) {
      const x = (px - cx) * unitsPerPx;
      const y = gcEval(fn.expr, x);
      if (isNaN(y) || !isFinite(y) || Math.abs(y) > 1e6) { started = false; continue; }
      const py = cy - y * gcScale;
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  });
}

function gcZoom(f) { gcScale = Math.max(5, Math.min(200, gcScale * f)); gcDraw(); }
function gcReset() { gcScale = 40; gcOffsetX = 0; gcOffsetY = 0; gcDraw(); }
function gcAddFn() { gcFunctions.push({ expr: '', color: GC_COLORS[gcFunctions.length % GC_COLORS.length] }); gcActiveInput = gcFunctions.length - 1; gcRender(); }
function gcSelectFn(i) { gcActiveInput = i; gcRender(); }
function gcSetExprActive(v) { gcFunctions[gcActiveInput].expr = v; gcDraw(); }
function gcSetColor(i, v) { gcFunctions[i].color = v; if (i === gcActiveInput) gcRender(); else gcDraw(); }

window.gcRender = gcRender;
window.gcZoom = gcZoom;
window.gcReset = gcReset;
window.gcAddFn = gcAddFn;
window.gcSelectFn = gcSelectFn;
window.gcSetExprActive = gcSetExprActive;
window.gcSetColor = gcSetColor;
window.gcInsertAtCursor = gcInsertAtCursor;
window.gcKeyBackspace = gcKeyBackspace;
window.gcKeyClear = gcKeyClear;

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const canvas = document.getElementById('gc-canvas');
    if (!canvas) return;
    canvas.addEventListener('wheel', e => { e.preventDefault(); gcZoom(e.deltaY < 0 ? 1.1 : 0.9); });
    canvas.addEventListener('mousedown', e => { gcDragging = true; gcDragStart = { x: e.clientX - gcOffsetX, y: e.clientY - gcOffsetY }; });
    window.addEventListener('mousemove', e => {
      if (!gcDragging) return;
      gcOffsetX = e.clientX - gcDragStart.x;
      gcOffsetY = e.clientY - gcDragStart.y;
      gcDraw();
    });
    window.addEventListener('mouseup', () => { gcDragging = false; });
    canvas.addEventListener('mousemove', e => {
      if (gcDragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const cxx = rect.width / 2 + gcOffsetX, cyy = rect.height / 2 + gcOffsetY;
      const unitsPerPx = 1 / gcScale;
      const x = (mx - cxx) * unitsPerPx;
      const tooltip = document.getElementById('gc-tooltip');
      if (!tooltip) return;
      let found = false;
      gcFunctions.forEach(fn => {
        if (!fn.expr) return;
        const y = gcEval(fn.expr, x);
        if (isNaN(y) || !isFinite(y)) return;
        const py = cyy - y * gcScale;
        if (Math.abs(my - py) < 15) {
          tooltip.style.display = 'block';
          tooltip.style.left = (e.clientX + 12) + 'px';
          tooltip.style.top = (e.clientY - 10) + 'px';
          tooltip.textContent = `(${x.toFixed(2)}, ${y.toFixed(2)})`;
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
