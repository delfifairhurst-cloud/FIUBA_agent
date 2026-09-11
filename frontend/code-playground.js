// code-playground.js - Code Playground v3 - Terminal style con Python real
const PLAYGROUND_KEY = 'fiuba_playground';

let pgLang = 'javascript';
let pgCells = [{ id: 1, code: '', input: '', output: '', status: 'idle' }];
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
function executeJS(code, inputStr='') {
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
    const inputs = inputStr ? JSON.stringify(inputStr.split('\n')) : '[]';
    iframe.srcdoc = `<!DOCTYPE html><html><body><script>
      let _js_inputs = ${inputs}; let _js_idx=0;
      const _origPrompt = window.prompt;
      window.prompt = function(msg){
        if(_js_idx < _js_inputs.length){ const v=_js_inputs[_js_idx++]; console.log((msg||'')+v); return v; }
        return _origPrompt ? _origPrompt.call(window, msg) : "";
      };
      window.readline = window.prompt;
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
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (pyodideReady && pyodideInstance) return pyodideInstance;
    }
    throw new Error('Timeout esperando Pyodide');
  }
  pyodideLoading = true;
  try {
    pyodideInstance = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/' });
    pyodideInstance.runPython(`
import sys, io, builtins, js

class _PyStdout(io.StringIO):
    def write(self, s):
        super().write(s)
        return len(s)
    def flush(self): pass
class _PyStderr(io.StringIO):
    def write(self, s):
        super().write(s)
        return len(s)
    def flush(self): pass

_py_stdout = _PyStdout()
_py_stderr = _PyStderr()
sys.stdout = _py_stdout
sys.stderr = _py_stderr
_py_input_queue = []
_py_input_idx = 0
def _py_input(prompt=''):
    global _py_input_idx
    if _py_input_idx < len(_py_input_queue):
        val = _py_input_queue[_py_input_idx]
        _py_input_idx += 1
        if prompt: _py_stdout.write(str(prompt))
        _py_stdout.write(str(val) + "\\n")
        return str(val)
    try:
        res = js.prompt(str(prompt) if prompt else "Input:")
        return res if res is not None else ""
    except:
        return ""
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

async function executePython(code, inputStr='') {
  try {
    const py = await ensurePyodide();
    const inputLines = inputStr ? inputStr.split('\\n') : [];
    const queueJs = JSON.stringify(inputLines);
    py.runPython('_py_stdout = _PyStdout(); _py_stderr = _PyStderr(); sys.stdout = _py_stdout; sys.stderr = _py_stderr; _py_input_queue = ' + queueJs + '; _py_input_idx = 0');
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
  const cell = { id: pgCellIdCounter, code: '', input: '', output: '', status: 'idle' };
  if (afterId) {
    const idx = pgCells.findIndex(c => c.id === afterId);
    pgCells.splice(idx + 1, 0, cell);
  } else {
    pgCells.push(cell);
  }
  renderPlayground();
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
  const inputEl = document.querySelector(`[data-cell-id="${cellId}"] .pg-cell-input`);
  if (inputEl) cell.input = inputEl.value;
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
  if (pgLang === 'javascript') result = await executeJS(cell.code, cell.input || '');
  else if (pgLang === 'python') {
    cell.output = '⏳ Cargando Python...';
    renderPlayground();
    result = await executePython(cell.code, cell.input || '');
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
  const isDark = document.documentElement.getAttribute('data-theme')==='dark' || (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;flex-wrap:wrap;gap:0.4rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem">
        <span style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#22c55e,#16a34a);display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg></span>
        Code Playground <span style="font-size:0.6rem;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.1rem 0.3rem;color:var(--text-muted);font-weight:400">v4</span>
      </h2>
      <button onclick="pgRunAll()" style="background:linear-gradient(135deg,#22c55e,#16a34a);color:white;border:none;border-radius:10px;padding:0.45rem 1rem;cursor:pointer;font-size:0.8rem;font-weight:700;display:flex;align-items:center;gap:0.35rem;box-shadow:0 4px 12px rgba(34,197,94,0.25)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Ejecutar todo
      </button>
    </div>

    <div style="display:flex;gap:0.3rem;margin-bottom:0.6rem;flex-wrap:wrap;align-items:center">
      ${['javascript','python','c'].map(l => `
        <button onclick="pgSetLang('${l}')" style="background:${pgLang===l?langColors[l]+'18':'var(--bg-secondary)'};color:${pgLang===l?langColors[l]:'var(--text-primary)'};border:1.5px solid ${pgLang===l?langColors[l]+'60':'var(--border-color)'};border-radius:10px;padding:0.32rem 0.75rem;cursor:pointer;font-size:0.78rem;font-weight:600;display:flex;align-items:center;gap:0.3rem;transition:all 0.15s">
          <span style="width:20px;height:20px;border-radius:5px;background:${langColors[l]};color:${l==='javascript'?'#000':'white'};display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:800">${l==='javascript'?'JS':l==='python'?'PY':'C'}</span>
          ${langNames[l]}
        </button>
      `).join('')}
      <div style="flex:1"></div>
      <button onclick="pgAddCell()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.32rem 0.6rem;cursor:pointer;font-size:0.72rem;color:var(--text-primary)">＋ Celda</button>
      <button onclick="pgLoadTemplate()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.32rem 0.6rem;cursor:pointer;font-size:0.72rem;color:var(--text-primary)">📚 Templates</button>
      <button onclick="pgClear()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.32rem 0.6rem;cursor:pointer;font-size:0.72rem;color:var(--text-primary)">🗑 Limpiar</button>
    </div>`;

  const editorBg = isDark ? '#0f172a' : '#f8fafc';
  const editorColor = isDark ? '#e2e8f0' : '#1e293b';
  pgCells.forEach((cell, idx) => {
    const statusIcon = cell.status === 'running' ? '<span style="color:#f59e0b">⏳</span>'
      : cell.status === 'done' ? '<span style="color:#22c55e">✓</span>'
      : cell.status === 'error' ? '<span style="color:#ef4444">✗</span>' : '<span style="color:var(--text-muted);opacity:0.4">○</span>';
    const borderColor = cell.status === 'done' ? '#22c55e40' : cell.status === 'error' ? '#ef444440' : cell.status === 'running' ? '#f59e0b60' : 'var(--border-color)';
    const showInput = (cell.input && cell.input.length>0) || pgLang==='python';

    html += `
      <div style="border:1.5px solid ${borderColor};border-radius:12px;margin-bottom:0.6rem;overflow:hidden;background:var(--bg-card);transition:border-color 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.04)" data-cell-id="${cell.id}">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0.6rem;background:var(--bg-secondary);border-bottom:1px solid var(--border-color)">
          <div style="display:flex;align-items:center;gap:0.4rem">
            <span style="font-size:0.68rem;color:var(--text-muted);font-weight:700;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.15rem 0.4rem">celda ${idx+1}</span>
            ${statusIcon}
            ${cell.status === 'running' ? '<span style="font-size:0.68rem;color:#f59e0b;font-weight:600">Ejecutando...</span>' : ''}
            ${cell.status === 'done' ? '<span style="font-size:0.62rem;color:#22c55e;background:#22c55e15;border:1px solid #22c55e30;border-radius:4px;padding:0.1rem 0.3rem">ok</span>' : ''}
          </div>
          <div style="display:flex;gap:0.25rem;align-items:center">
            <button onclick="pgToggleInput(${cell.id})" title="Entrada stdin" style="background:${showInput || cell.input?'var(--bg-card)':'transparent'};border:1px solid ${cell.input?'#8b5cf630':'var(--border-color)'};border-radius:6px;padding:0.2rem 0.45rem;cursor:pointer;font-size:0.68rem;color:${cell.input?'#8b5cf6':'var(--text-muted)'}">⌨ Input</button>
            <button onclick="pgRunCell(${cell.id})" style="background:linear-gradient(135deg,#22c55e,#16a34a);color:white;border:none;border-radius:8px;padding:0.28rem 0.65rem;cursor:pointer;font-size:0.7rem;font-weight:700;display:flex;align-items:center;gap:0.25rem;box-shadow:0 2px 6px rgba(34,197,94,0.25)" ${pgRunning?'disabled style="opacity:0.5"':''}>▶ Run</button>
            <button onclick="pgAddCellAfter(${cell.id})" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.2rem 0.45rem;cursor:pointer;font-size:0.72rem;color:var(--text-muted)">＋</button>
            ${pgCells.length>1?`<button onclick="pgRemoveCell(${cell.id})" style="background:none;border:none;cursor:pointer;font-size:0.85rem;color:var(--text-muted);padding:0.2rem 0.3rem" title="Eliminar">×</button>`:''}
          </div>
        </div>
        <div style="position:relative">
          <div style="position:absolute;left:0;top:0;bottom:0;width:38px;background:${isDark?'#020617':'#f1f5f9'};border-right:1px solid var(--border-color);display:flex;flex-direction:column;align-items:center;padding:0.6rem 0;gap:0.25rem;opacity:0.6">
            <span style="font-size:0.55rem;color:var(--text-muted);font-family:monospace">1</span>
          </div>
          <textarea class="pg-cell-editor" spellcheck="false"
            style="width:100%;min-height:80px;max-height:340px;padding:0.6rem 0.6rem 0.6rem 46px;font-family:'JetBrains Mono','Fira Code','Cascadia Code',monospace;font-size:0.82rem;line-height:1.6;background:${editorBg};color:${editorColor};border:none;outline:none;resize:vertical;tab-size:4"
            placeholder="${pgLang==='python'?'# Python — input() funciona. Usa el panel Input abajo para stdin':pgLang==='javascript'?'// JavaScript — prompt() funciona con Input':'// C — usa stdin via Input'}"
            onkeydown="pgHandleKey(event, ${cell.id})"
            oninput="pgUpdateCode(${cell.id}, this.value)"
          >${escHtml(cell.code)}</textarea>
        </div>
        <div id="pg-input-wrap-${cell.id}" style="display:${cell.input || showInput ? 'block' : 'none'};border-top:1px dashed var(--border-color);background:${isDark?'#0b1120':'#fffbeb'}">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.3rem 0.6rem">
            <span style="font-size:0.62rem;color:var(--text-muted);font-weight:600;display:flex;align-items:center;gap:0.25rem"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg> Entrada (stdin) — una línea por cada input()/prompt()</span>
            <button onclick="document.querySelector('[data-cell-id=&quot;'+${cell.id}+'&quot;] .pg-cell-input').value='';pgUpdateInput(${cell.id},'')" style="font-size:0.6rem;color:var(--text-muted);background:none;border:none;cursor:pointer">limpiar</button>
          </div>
          <textarea class="pg-cell-input" spellcheck="false" placeholder="Ej:\n5\n10\nhola"
            style="width:100%;min-height:36px;max-height:80px;padding:0.4rem 0.6rem;font-family:monospace;font-size:0.75rem;background:transparent;color:var(--text-primary);border:none;outline:none;resize:vertical"
            oninput="pgUpdateInput(${cell.id}, this.value)"
          >${escHtml(cell.input||'')}</textarea>
        </div>
        ${cell.output ? `<div style="padding:0.6rem 0.7rem;background:${isDark?'#020617':'#f8fafc'};border-top:1px solid ${cell.status==='error'?'#fecaca':'var(--border-color)'};font-family:'JetBrains Mono',monospace;font-size:0.76rem;white-space:pre-wrap;word-break:break-all;color:${cell.status==='error'?(isDark?'#fca5a5':'#dc2626'):(isDark?'#e2e8f0':'var(--text-primary)')};max-height:280px;overflow-y:auto;position:relative">
          <div style="position:absolute;top:6px;right:8px;display:flex;gap:0.25rem">
            <button onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)" style="font-size:0.6rem;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.3rem;cursor:pointer;color:var(--text-muted)">copiar</button>
          </div>
          <div>${escHtml(cell.output)}</div>
        </div>` : ''}
      </div>`;
  });

  html += `<div style="text-align:center;font-size:0.65rem;color:var(--text-muted);margin-top:0.4rem;opacity:0.6;display:flex;align-items:center;justify-content:center;gap:0.6rem;flex-wrap:wrap">
    <span><kbd style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.1rem 0.3rem;font-size:0.6rem">Shift</kbd> + <kbd style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:4px;padding:0.1rem 0.3rem;font-size:0.6rem">Enter</kbd> ejecutar</span>
    <span>·</span>
    <span>Input soporta <code style="background:var(--bg-secondary);padding:0.1rem 0.25rem;border-radius:3px">input()</code> y <code style="background:var(--bg-secondary);padding:0.1rem 0.25rem;border-radius:3px">prompt()</code></span>
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
  pgCells = [{ id: 1, code: '', input: '', output: '', status: 'idle' }];
  pgCellIdCounter = 1;
  renderPlayground();
};
window.pgUpdateCode = function(id, code) { const c = pgCells.find(x => x.id === id); if (c) c.code = code; };
window.pgUpdateInput = function(id, val) { const c = pgCells.find(x => x.id === id); if (c) c.input = val; };
window.pgToggleInput = function(id) {
  const wrap = document.getElementById('pg-input-wrap-'+id);
  if (wrap) wrap.style.display = wrap.style.display==='none' ? 'block' : 'none';
};
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
  pgCells = [{ id: 1, code: '', input: '', output: '', status: 'idle' }];
  pgCellIdCounter = 1;
  renderPlayground();
};
window.renderPlayground = renderPlayground;
