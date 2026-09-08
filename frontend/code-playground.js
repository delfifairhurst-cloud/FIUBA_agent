// code-playground.js - Code Playground v3 - Terminal style con Python real
const PLAYGROUND_KEY = 'fiuba_playground';

let pgLang = 'javascript';
let pgCells = [{ id: 1, code: '', output: '', status: 'idle' }];
let pgCellIdCounter = 1;
let pgRunning = false;
let pyodideInstance = null;
let pyodideLoading = false;
let pyodideReady = false;

const TEMPLATES = {
  javascript: [
    { name: 'Hola Mundo', code: 'console.log("¡Hola, FIUBA!");' },
    { name: 'Funciones', code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nfor (let i = 0; i < 10; i++) {\n  console.log(`fib(${i}) = ${fibonacci(i)}`);\n}' },
    { name: 'Arrays', code: 'const notas = [8, 6, 9, 4, 7, 10, 5, 8, 3, 7];\nconsole.log("Notas:", notas);\nconsole.log("Promedio:", (notas.reduce((a,b)=>a+b,0)/notas.length).toFixed(2));\nconsole.log("Aprobados:", notas.filter(n=>n>=6).length);' },
  ],
  python: [
    { name: 'Hola Mundo', code: 'print("¡Hola, FIUBA!")' },
    { name: 'Funciones', code: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nfor i in range(10):\n    print(f"fib({i}) = {fibonacci(i)}")' },
    { name: 'Clases', code: 'class Rectangulo:\n    def __init__(self, base, altura):\n        self.base = base\n        self.altura = altura\n    def area(self):\n        return self.base * self.altura\n\nr = Rectangulo(5, 3)\nprint(f"Área: {r.area()}")' },
    { name: 'Listas', code: 'cuadrados = [x**2 for x in range(1, 11)]\nprint("Cuadrados:", cuadrados)\n\npares = [x for x in range(1, 21) if x % 2 == 0]\nprint("Pares:", pares)' },
    { name: 'Diccionarios', code: 'notas = {"Analisis I": 8, "Algebra I": 7, "Fisica I": 9}\nfor materia, nota in notas.items():\n    estado = "✓" if nota >= 6 else "✗"\n    print(f"  {estado} {materia}: {nota}")\n\nprint(f"Promedio: {sum(notas.values())/len(notas):.2f}")' },
  ],
  c: [
    { name: 'Hola Mundo', code: '#include <stdio.h>\n\nint main() {\n    printf("¡Hola, FIUBA!\\n");\n    return 0;\n}' },
    { name: 'Funciones', code: '#include <stdio.h>\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n-1) + fibonacci(n-2);\n}\n\nint main() {\n    for (int i = 0; i < 10; i++) {\n        printf("fib(%d) = %d\\n", i, fibonacci(i));\n    }\n    return 0;\n}' },
  ],
};

// ─── AUTO-CLOSE BRACKETS ───
const AUTO_CLOSE = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const CLOSERS = new Set([')', ']', '}', '"', "'", '`']);

function pgAutoClose(textarea, e) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  const char = e.key;

  // Auto-close bracket/quote
  if (AUTO_CLOSE[char]) {
    const selected = val.substring(start, end);
    if (selected) {
      e.preventDefault();
      textarea.value = val.substring(0, start) + char + selected + AUTO_CLOSE[char] + val.substring(end);
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = end + 1;
      return;
    }
    e.preventDefault();
    textarea.value = val.substring(0, start) + char + AUTO_CLOSE[char] + val.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + 1;
    return;
  }

  // Skip over closer if it matches
  if (CLOSERS.has(char) && val[start] === char) {
    e.preventDefault();
    textarea.selectionStart = textarea.selectionEnd = start + 1;
    return;
  }

  // Backspace: remove matching pair
  if (e.key === 'Backspace' && start > 0) {
    const before = val[start - 1];
    const after = val[start];
    if (AUTO_CLOSE[before] === after) {
      e.preventDefault();
      textarea.value = val.substring(0, start - 1) + val.substring(start + 1);
      textarea.selectionStart = textarea.selectionEnd = start - 1;
      return;
    }
  }

  // Tab: indent
  if (e.key === 'Tab') {
    e.preventDefault();
    textarea.value = val.substring(0, start) + '    ' + val.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + 4;
    return;
  }

  // Enter: auto-indent
  if (e.key === 'Enter') {
    e.preventDefault();
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const line = val.substring(lineStart, start);
    const indent = line.match(/^\s*/)[0];
    const lastChar = line.trimEnd().slice(-1);
    const nextChar = val[start];
    let extra = '';
    if (lastChar === ':' || lastChar === '{' || lastChar === '(' || lastChar === '[') {
      extra = '    ';
    }
    // Auto-close block
    if ((lastChar === ':' && nextChar === '\n' && indent.length >= 4) ||
        (lastChar === '{' && nextChar === '}')) {
      textarea.value = val.substring(0, start) + '\n' + indent + extra + '\n' + indent + val.substring(start);
      textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length + extra.length;
    } else {
      textarea.value = val.substring(0, start) + '\n' + indent + extra + val.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length + extra.length;
    }
    return;
  }
}

// ─── JS EXECUTION ───
function executeJS(code) {
  return new Promise(resolve => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.sandbox = 'allow-scripts';
    document.body.appendChild(iframe);
    const timeout = setTimeout(() => { iframe.remove(); resolve({ output: '⏱️ Timeout (>10s)', error: true }); }, 10000);
    const logs = [];
    let done = false;
    function handler(e) {
      if (e.source !== iframe.contentWindow || !e.data || !e.data.type) return;
      if (e.data.type === 'console') logs.push(e.data.level === 'error' ? '❌ ' + e.data.args.join(' ') : e.data.args.join(' '));
      else if (e.data.type === 'done' && !done) {
        done = true; clearTimeout(timeout);
        window.removeEventListener('message', handler);
        iframe.remove();
        resolve({ output: logs.join('\n') || '(sin salida)', error: false });
      }
    }
    window.addEventListener('message', handler);
    iframe.srcdoc = `<!DOCTYPE html><html><body><script>
      console.log = function(){parent.postMessage({type:'console',level:'log',args:Array.from(arguments).map(String)},'*')};
      console.error = function(){parent.postMessage({type:'console',level:'error',args:Array.from(arguments).map(String)},'*')};
      console.warn = function(){parent.postMessage({type:'console',level:'warn',args:Array.from(arguments).map(String)},'*')};
      try{${code}}catch(e){console.error(e.name+': '+e.message)}
      parent.postMessage({type:'done'},'*');
    <\/script></body></html>`;
  });
}

// ─── PYTHON EXECUTION ───
async function ensurePyodide() {
  if (pyodideReady && pyodideInstance) return pyodideInstance;
  if (pyodideLoading) {
    // Wait for existing load
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (pyodideReady && pyodideInstance) return pyodideInstance;
    }
    throw new Error('Timeout esperando Pyodide');
  }
  pyodideLoading = true;
  try {
    pyodideInstance = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
    });
    // Bootstrap: set up output capture
    pyodideInstance.runPython(`
import sys, io, builtins

class _PyStdout(io.StringIO):
    def write(self, s):
        super().write(s)
        return len(s)
    def flush(self):
        pass

class _PyStderr(io.StringIO):
    def write(self, s):
        super().write(s)
        return len(s)
    def flush(self):
        pass

_py_stdout = _PyStdout()
_py_stderr = _PyStderr()
sys.stdout = _py_stdout
sys.stderr = _py_stderr

def _py_input(prompt=''):
    return ''

builtins.input = _py_input
`);
    pyodideReady = true;
    pyodideLoading = false;
    return pyodideInstance;
  } catch (e) {
    pyodideLoading = false;
    throw e;
  }
}

async function executePython(code) {
  try {
    const py = await ensurePyodide();
    // Reset buffers
    py.runPython('_py_stdout = _PyStdout(); _py_stderr = _PyStderr(); sys.stdout = _py_stdout; sys.stderr = _py_stderr');
    // Run code
    py.runPython(code);
    const output = py.runPython('_py_stdout.getvalue()') || '';
    const errors = py.runPython('_py_stderr.getvalue()') || '';
    return { output: output || errors || '(sin salida)', error: !!errors && !output };
  } catch (e) {
    return { output: '❌ ' + (e.message || String(e)), error: true };
  }
}

async function executeC(code) {
  try {
    const apiBase = window.getApiBase ? window.getApiBase() : 'https://fiuba-agent-backend-1.onrender.com';
    const r = await fetch(apiBase + '/api/execute-c', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const d = await r.json();
    return { output: d.output || d.error || '(sin salida)', error: !!d.error };
  } catch (e) {
    return { output: '❌ Error de conexión: ' + e.message, error: true };
  }
}

// ─── CELLS ───
function addCell(afterId) {
  pgCellIdCounter++;
  const cell = { id: pgCellIdCounter, code: '', output: '', status: 'idle' };
  if (afterId) {
    const idx = pgCells.findIndex(c => c.id === afterId);
    pgCells.splice(idx + 1, 0, cell);
  } else {
    pgCells.push(cell);
  }
  renderPlayground();
  // Focus new cell
  setTimeout(() => {
    const ta = document.querySelector(`[data-cell-id="${cell.id}"] .pg-cell-editor`);
    if (ta) ta.focus();
  }, 50);
}

function removeCell(id) {
  if (pgCells.length <= 1) return;
  pgCells = pgCells.filter(c => c.id !== id);
  renderPlayground();
}

async function runCell(cellId) {
  const cell = pgCells.find(c => c.id === cellId);
  if (!cell || pgRunning) return;
  const ta = document.querySelector(`[data-cell-id="${cellId}"] .pg-cell-editor`);
  if (ta) cell.code = ta.value;
  if (!cell.code.trim()) {
    cell.output = '⚠️ No hay código para ejecutar';
    cell.status = 'error';
    renderPlayground();
    return;
  }
  pgRunning = true;
  cell.status = 'running';
  cell.output = '';
  renderPlayground();
  let result;
  if (pgLang === 'javascript') result = await executeJS(cell.code);
  else if (pgLang === 'python') {
    cell.output = '⏳ Cargando Python...';
    renderPlayground();
    result = await executePython(cell.code);
  }
  else if (pgLang === 'c') result = await executeC(cell.code);
  cell.output = result.output;
  cell.status = result.error ? 'error' : 'done';
  pgRunning = false;
  if (!result.error && window.kgOnCodeRun) window.kgOnCodeRun();
  renderPlayground();
}

// ─── RENDER ───
function renderPlayground() {
  const el = document.getElementById('playground-content');
  if (!el) return;
  const langNames = { javascript: 'JavaScript', python: 'Python', c: 'C (GCC)' };
  const langColors = { javascript: '#f7df1e', python: '#3776ab', c: '#03599c' };

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;flex-wrap:wrap;gap:0.4rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        Code Playground
      </h2>
      <button onclick="pgRunAll()" style="background:var(--accent);color:white;border:none;border-radius:8px;padding:0.4rem 0.9rem;cursor:pointer;font-size:0.8rem;font-weight:600;display:flex;align-items:center;gap:0.3rem">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Ejecutar todo
      </button>
    </div>

    <div style="display:flex;gap:0.3rem;margin-bottom:0.6rem;flex-wrap:wrap">
      ${['javascript','python','c'].map(l => `
        <button onclick="pgSetLang('${l}')" style="background:${pgLang===l?langColors[l]+'18':'var(--bg-secondary)'};color:${pgLang===l?langColors[l]:'var(--text-primary)'};border:1.5px solid ${pgLang===l?langColors[l]+'60':'var(--border-color)'};border-radius:8px;padding:0.3rem 0.7rem;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.3rem">
          <span style="width:20px;height:20px;border-radius:5px;background:${langColors[l]};color:${l==='javascript'?'#000':'white'};display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:800">${l==='javascript'?'JS':l==='python'?'PY':'C'}</span>
          ${langNames[l]}
        </button>
      `).join('')}
      <div style="flex:1"></div>
      <button onclick="pgAddCell()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.75rem;color:var(--text-primary)">+ Celda</button>
      <button onclick="pgLoadTemplate()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.75rem;color:var(--text-primary)">Templates</button>
      <button onclick="pgClear()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.75rem;color:var(--text-primary)">Limpiar</button>
    </div>`;

  pgCells.forEach((cell, idx) => {
    const statusIcon = cell.status === 'running' ? '<span style="color:#f59e0b">⏳</span>'
      : cell.status === 'done' ? '<span style="color:#22c55e">✓</span>'
      : cell.status === 'error' ? '<span style="color:#ef4444">✗</span>' : '';
    const borderColor = cell.status === 'done' ? '#22c55e40' : cell.status === 'error' ? '#ef444440' : cell.status === 'running' ? '#f59e0b40' : 'var(--border-color)';
    const outputBg = cell.status === 'error' ? '#fef2f2' : '#f8fafc';
    const outputBorder = cell.status === 'error' ? '#fecaca' : '#e2e8f0';

    html += `
      <div style="border:1.5px solid ${borderColor};border-radius:10px;margin-bottom:0.5rem;overflow:hidden;background:var(--bg-card);transition:border-color 0.2s" data-cell-id="${cell.id}">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.35rem 0.6rem;background:var(--bg-secondary);border-bottom:1px solid var(--border-color)">
          <div style="display:flex;align-items:center;gap:0.4rem">
            <span style="font-size:0.72rem;color:var(--text-muted);font-weight:600">[${idx+1}]</span>
            ${statusIcon}
            ${cell.status === 'running' ? '<span style="font-size:0.7rem;color:#f59e0b">Ejecutando...</span>' : ''}
          </div>
          <div style="display:flex;gap:0.2rem">
            <button onclick="pgRunCell(${cell.id})" style="background:#22c55e;color:white;border:none;border-radius:6px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.7rem;font-weight:600" ${pgRunning?'disabled':''}>▶ Run</button>
            <button onclick="pgAddCellAfter(${cell.id})" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.2rem 0.4rem;cursor:pointer;font-size:0.7rem;color:var(--text-muted)">+</button>
            ${pgCells.length>1?`<button onclick="pgRemoveCell(${cell.id})" style="background:none;border:none;cursor:pointer;font-size:0.8rem;color:var(--text-muted);padding:0.2rem 0.3rem">×</button>`:''}
          </div>
        </div>
        <textarea class="pg-cell-editor" spellcheck="false"
          style="width:100%;min-height:60px;max-height:300px;padding:0.6rem;font-family:'JetBrains Mono','Fira Code','Cascadia Code',monospace;font-size:0.82rem;line-height:1.5;background:var(--bg-card);color:var(--text-primary);border:none;outline:none;resize:vertical;tab-size:4"
          placeholder="Escribí tu código acá..."
          onkeydown="pgHandleKey(event, ${cell.id})"
          oninput="pgUpdateCode(${cell.id}, this.value)"
        >${escHtml(cell.code)}</textarea>
        ${cell.output ? `<div style="padding:0.5rem 0.7rem;background:${outputBg};border-top:1px solid ${outputBorder};font-family:'JetBrains Mono',monospace;font-size:0.78rem;white-space:pre-wrap;word-break:break-all;color:${cell.status==='error'?'#dc2626':'var(--text-primary)'};max-height:250px;overflow-y:auto">${escHtml(cell.output)}</div>` : ''}
      </div>`;
  });

  html += `<div style="text-align:center;font-size:0.68rem;color:var(--text-muted);margin-top:0.3rem;opacity:0.6">
    Shift+Enter = ejecutar · Shift+Enter última celda = nueva celda · Tab = indentar · Auto-close: ( [ " '
  </div>`;

  el.innerHTML = html;
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ─── KEY HANDLER ───
function pgHandleKey(e, cellId) {
  const ta = e.target;
  // Shift+Enter = run
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    pgRunCell(cellId);
    // If last cell, add new one
    const idx = pgCells.findIndex(c => c.id === cellId);
    if (idx === pgCells.length - 1 && ta.value.trim()) {
      pgAddCellAfter(cellId);
    }
    return;
  }
  pgAutoClose(ta, e);
}

// ─── EXPORTS ───
window.pgSetLang = function(lang) {
  pgLang = lang;
  pgCells = [{ id: 1, code: '', output: '', status: 'idle' }];
  pgCellIdCounter = 1;
  renderPlayground();
};
window.pgUpdateCode = function(id, code) { const c = pgCells.find(x => x.id === id); if (c) c.code = code; };
window.pgRunCell = runCell;
window.pgRunAll = async function() { for (const c of pgCells) { if (c.code.trim()) await runCell(c.id); } };
window.pgAddCell = function() { addCell(null); };
window.pgAddCellAfter = function(id) { addCell(id); };
window.pgRemoveCell = function(id) { removeCell(id); };
window.pgLoadTemplate = function() {
  const t = TEMPLATES[pgLang];
  const choice = prompt('Templates:\n' + t.map((x,i) => `${i+1}. ${x.name}`).join('\n') + '\n\nElegí un número:');
  const idx = parseInt(choice) - 1;
  if (idx >= 0 && idx < t.length) { pgCells[0].code = t[idx].code; renderPlayground(); }
};
window.pgClear = function() {
  if (!confirm('¿Limpiar todo?')) return;
  pgCells = [{ id: 1, code: '', output: '', status: 'idle' }];
  pgCellIdCounter = 1;
  renderPlayground();
};
window.renderPlayground = renderPlayground;
