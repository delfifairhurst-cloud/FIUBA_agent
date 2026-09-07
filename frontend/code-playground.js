// code-playground.js - Code Playground v2 (Colab-style, pro UI)
const PLAYGROUND_KEY = 'fiuba_playground';

let pgLang = 'javascript';
let pgCode = '';
let pgRunning = false;
let pyodideInstance = null;
let pyodideLoading = false;
let pgCells = [{ id: 1, code: '', output: '', status: 'idle' }];
let pgCellIdCounter = 1;

const TEMPLATES = {
  javascript: [
    { name: 'Hola Mundo', code: 'console.log("¡Hola, FIUBA!");' },
    { name: 'Funciones', code: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\n// Imprimir los primeros 10 números de Fibonacci\nfor (let i = 0; i < 10; i++) {\n  console.log(`fib(${i}) = ${fibonacci(i)}`);\n}' },
    { name: 'Clases', code: 'class Rectangulo {\n  constructor(base, altura) {\n    this.base = base;\n    this.altura = altura;\n  }\n\n  area() {\n    return this.base * this.altura;\n  }\n\n  perimetro() {\n    return 2 * (this.base + this.altura);\n  }\n\n  toString() {\n    return `Rectángulo(${this.base}x${this.altura})`;\n  }\n}\n\nconst r = new Rectangulo(5, 3);\nconsole.log(r.toString());\nconsole.log(`Área: ${r.area()}`);\nconsole.log(`Perímetro: ${r.perimetro()}`);' },
    { name: 'Async/Await', code: 'async function fetchData() {\n  console.log("Iniciando request...");\n  \n  // Simular delay con Promise\n  const data = await new Promise(resolve => {\n    setTimeout(() => resolve({ nombre: "FIUBA", anio: 1871 }), 500);\n  });\n  \n  console.log("Datos recibidos:", JSON.stringify(data));\n  return data;\n}\n\nfetchData().then(d => console.log("Promise resuelta:", d.nombre));' },
    { name: 'Input del usuario', code: '// En JS usamos prompt() para input\nconst nombre = prompt("¿Cómo te llamás?");\nconsole.log(`¡Hola, ${nombre}! Bienvenido a FIUBA.`);\n\nconst nota = Number(prompt("¿Qué nota sacaste en el parcial?"));\nif (nota >= 7) {\n  console.log("¡Aprobaste! 🎉");\n} else if (nota >= 4) {\n  console.log("Estás en el cuarto.");\n} else {\n  console.log("A estudiar más 📚");\n}' },
    { name: 'Arrays y Métodos', code: 'const notas = [8, 6, 9, 4, 7, 10, 5, 8, 3, 7];\n\nconsole.log("Notas:", notas);\nconsole.log("Promedio:", (notas.reduce((a,b) => a+b, 0) / notas.length).toFixed(2));\nconsole.log("Mayor:", Math.max(...notas));\nconsole.log("Menor:", Math.min(...notas));\nconsole.log("Aprobados:", notas.filter(n => n >= 6).length);\nconsole.log("Desaprobados:", notas.filter(n => n < 6).length);\n\n// Ordenar de menor a mayor\nconsole.log("Ordenadas:", [...notas].sort((a,b) => a-b));' },
  ],
  python: [
    { name: 'Hola Mundo', code: 'print("¡Hola, FIUBA!")' },
    { name: 'Funciones', code: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\n# Imprimir los primeros 10 números\ncolores = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "⚫", "⚪", "🟤", "🩷"]\nfor i in range(10):\n    print(f"{colores[i]} fib({i}) = {fibonacci(i)}")' },
    { name: 'Clases', code: 'class Rectangulo:\n    def __init__(self, base, altura):\n        self.base = base\n        self.altura = altura\n    \n    def area(self):\n        return self.base * self.altura\n    \n    def perimetro(self):\n        return 2 * (self.base + self.altura)\n    \n    def __str__(self):\n        return f"Rectángulo({self.base}x{self.altura})"\n\nr = Rectangulo(5, 3)\nprint(r)\nprint(f"Área: {r.area()}")\nprint(f"Perímetro: {r.perimetro()}")' },
    { name: 'Input del usuario', code: '# En Python usamos input() para leer\ncarrera = input("¿Qué carrera estudiás en FIUBA? ")\nprint(f"¡{carrera} es genial!")\n\nnota = float(input("¿Qué nota sacaste? "))\nif nota >= 7:\n    print("¡Aprobaste! 🎉")\nelif nota >= 4:\n    print("Estás en el cuarto.")\nelse:\n    print("A estudiar más 📚")' },
    { name: 'List Comprehensions', code: 'import math\n\n# Generar cuadrados\ncuadrados = [x**2 for x in range(1, 11)]\nprint("Cuadrados:", cuadrados)\n\n# Filtrar pares\npares = [x for x in range(1, 21) if x % 2 == 0]\nprint("Pares del 1-20:", pares)\n\n# Tabla de multiplicar\ntabla_7 = [(7, i, 7*i) for i in range(1, 11)]\nfor base, exp, res in tabla_7:\n    print(f"{base} x {exp:2d} = {res}")' },
    { name: 'Diccionarios', code: 'notas_fiuba = {\n    "Analisis I": 8,\n    "Algebra I": 7,\n    "Fisica I": 9,\n    "Quimica": 6,\n    "Sistemas de Representacion": 10\n}\n\nprint("=== Notas FIUBA ===")\nfor materia, nota in notas_fiuba.items():\n    emoji = "🟢" if nota >= 6 else "🔴"\n    print(f"  {emoji} {materia}: {nota}")\n\npromedio = sum(notas_fiuba.values()) / len(notas_fiuba)\nprint(f"\\nPromedio general: {promedio:.2f}")' },
  ],
  c: [
    { name: 'Hola Mundo', code: '#include <stdio.h>\n\nint main() {\n    printf("¡Hola, FIUBA!\\n");\n    return 0;\n}' },
    { name: 'Funciones', code: '#include <stdio.h>\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n-1) + fibonacci(n-2);\n}\n\nint main() {\n    printf("=== Fibonacci ===\\n");\n    for (int i = 0; i < 10; i++) {\n        printf("fib(%d) = %d\\n", i, fibonacci(i));\n    }\n    return 0;\n}' },
    { name: 'Structs', code: '#include <stdio.h>\n#include <string.h>\n\ntypedef struct {\n    char nombre[50];\n    int nota;\n    char condicion[20]; // "Aprobado" o "Desaprobado"\n} Alumno;\n\nAlumno crear_alumno(char nombre[], int nota) {\n    Alumno a;\n    strcpy(a.nombre, nombre);\n    a.nota = nota;\n    strcpy(a.condicion, nota >= 6 ? "Aprobado" : "Desaprobado");\n    return a;\n}\n\nvoid mostrar(Alumno a) {\n    printf("  %s: %d - %s\\n", a.nombre, a.nota, a.condicion);\n}\n\nint main() {\n    Alumno alumnos[] = {\n        crear_alumno("Ana", 9),\n        crear_alumno("Bob", 4),\n        crear_alumno("Carla", 10),\n        crear_alumno("Diego", 5)\n    };\n    int n = 4;\n    \n    printf("=== Alumnos FIUBA ===\\n");\n    for (int i = 0; i < n; i++) {\n        mostrar(alumnos[i]);\n    }\n    return 0;\n}' },
    { name: 'Punteros', code: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int temp = *a;\n    *a = *b;\n    *b = temp;\n}\n\nint main() {\n    int x = 10, y = 25;\n    printf("Antes: x=%d, y=%d\\n", x, y);\n    swap(&x, &y);\n    printf("Después: x=%d, y=%d\\n", x, y);\n    \n    // Arreglo con punteros\n    int nums[] = {5, 2, 8, 1, 9};\n    int *ptr = nums;\n    printf("\\nArreglo con punteros:\\n");\n    for (int i = 0; i < 5; i++) {\n        printf("  nums[%d] = %d (ptr+%d = %d)\\n", i, *(ptr+i), i, *(ptr+i));\n    }\n    return 0;\n}' },
    { name: 'Memoria Dinámica', code: '#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int n;\n    printf("¿Cuántos números querés cargar? ");\n    scanf("%d", &n);\n    \n    int *arr = (int*)malloc(n * sizeof(int));\n    if (arr == NULL) {\n        printf("Error de memoria\\n");\n        return 1;\n    }\n    \n    printf("Ingresá %d números:\\n", n);\n    for (int i = 0; i < n; i++) {\n        printf("  [%d]: ", i);\n        scanf("%d", &arr[i]);\n    }\n    \n    // Ordenar con bubble sort\n    for (int i = 0; i < n-1; i++) {\n        for (int j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n    \n    printf("Ordenados: ");\n    for (int i = 0; i < n; i++) printf("%d ", arr[i]);\n    printf("\\n");\n    \n    free(arr);\n    return 0;\n}' },
  ],
};

// ─── JS EXECUTION (sandboxed iframe) ───
function executeJSInSandbox(code) {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.sandbox = 'allow-scripts allow-modals';
    document.body.appendChild(iframe);

    const timeout = setTimeout(() => {
      iframe.remove();
      resolve({ output: '⏱️ Timeout: el código tardó más de 10 segundos.', error: true });
    }, 10000);

    const logs = [];
    let resolved = false;

    function handler(e) {
      if (e.source !== iframe.contentWindow) return;
      const d = e.data;
      if (!d || !d.type) return;
      if (d.type === 'console') {
        logs.push(d.level === 'error' ? '❌ ' + d.args.join(' ') : d.args.join(' '));
      } else if (d.type === 'prompt') {
        logs.push(`[input] ${d.message} → (no disponible en sandbox)`);
        iframe.contentWindow.postMessage({ type: 'prompt-response', value: '' }, '*');
      } else if (d.type === 'done') {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        window.removeEventListener('message', handler);
        iframe.remove();
        resolve({ output: logs.join('\n') || '(sin salida)', error: false });
      }
    }

    window.addEventListener('message', handler);

    const wrappedCode = `
      <script>
      (function() {
        const _logs = [];
        
        console.log = function() { 
          parent.postMessage({type:'console', level:'log', args:Array.from(arguments).map(String)}, '*');
        };
        console.error = function() { 
          parent.postMessage({type:'console', level:'error', args:Array.from(arguments).map(String)}, '*');
        };
        console.warn = function() { 
          parent.postMessage({type:'console', level:'warn', args:Array.from(arguments).map(String)}, '*');
        };
        
        const _prompt = function(msg) {
          parent.postMessage({type:'prompt', message:msg||''}, '*');
          return '';
        };
        if (typeof prompt === 'undefined') window.prompt = _prompt;
        
        try {
          ${code}
        } catch(e) {
          console.error(e.name + ': ' + e.message);
        }
        parent.postMessage({type:'done'}, '*');
      })();
      <\/script>`;

    iframe.srcdoc = `<!DOCTYPE html><html><body>${wrappedCode}</body></html>`;
  });
}

// ─── PYTHON EXECUTION ───
async function executePython(code) {
  if (typeof loadPyodide === 'undefined') {
    return { output: '⏳ Cargando Python (primera vez tarda ~5s)...', error: false, loading: true };
  }
  if (!pyodideInstance && !pyodideLoading) {
    pyodideLoading = true;
    try {
      pyodideInstance = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/' });
    } catch (e) {
      pyodideLoading = false;
      return { output: '❌ Error cargando Python: ' + e.message, error: true };
    }
    pyodideLoading = false;
  }
  if (!pyodideInstance) {
    return { output: '⏳ Cargando Python, esperá...', error: false, loading: true };
  }

  try {
    // Reset stdout/stderr buffers
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
    import js
    val = js.prompt(str(prompt)) if hasattr(js, 'prompt') else ''
    return val if val is not None else ''

builtins.input = _py_input
`);

    // Run user code
    pyodideInstance.runPython(code);

    // Read output from StringIO
    const output = pyodideInstance.runPython('_py_stdout.getvalue()');
    const errors = pyodideInstance.runPython('_py_stderr.getvalue()');

    return { output: output || errors || '(sin salida)', error: !!errors };
  } catch (e) {
    let partial = '';
    try { partial = pyodideInstance.runPython('_py_stdout.getvalue()'); } catch {}
    const errMsg = e.message || String(e);
    return { output: (partial ? partial + '\n' : '') + '❌ ' + errMsg, error: true };
  }
}

// ─── C EXECUTION ───
async function executeC(code) {
  try {
    const apiBase = window.getApiBase ? window.getApiBase() : 'https://fiuba-agent-backend-1.onrender.com';
    const resp = await fetch(apiBase + '/api/execute-c', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await resp.json();
    if (data.error) return { output: data.output || data.error, error: true };
    return { output: data.output || '(sin salida)', error: false };
  } catch (e) {
    return { output: '❌ Error de conexión: ' + e.message, error: true };
  }
}

// ─── CELLS ───
function addCell(afterId) {
  pgCellIdCounter++;
  const newCell = { id: pgCellIdCounter, code: '', output: '', status: 'idle' };
  if (afterId) {
    const idx = pgCells.findIndex(c => c.id === afterId);
    pgCells.splice(idx + 1, 0, newCell);
  } else {
    pgCells.push(newCell);
  }
  renderPlayground();
}

function removeCell(id) {
  if (pgCells.length <= 1) return;
  pgCells = pgCells.filter(c => c.id !== id);
  renderPlayground();
}

async function runCell(cellId) {
  const cell = pgCells.find(c => c.id === cellId);
  if (!cell || pgRunning) return;

  // Sync code from textarea if available (prevents stale code)
  const textarea = document.querySelector(`[data-cell-id="${cellId}"] .pg-cell-editor`);
  if (textarea) cell.code = textarea.value;

  if (!cell.code.trim()) {
    cell.output = '⚠️ No hay código para ejecutar. Escribí algo en la celda.';
    cell.status = 'error';
    renderPlayground();
    return;
  }

  pgRunning = true;
  cell.status = 'running';
  cell.output = '';
  renderPlayground();

  let result;
  if (pgLang === 'javascript') result = await executeJSInSandbox(cell.code);
  else if (pgLang === 'python') {
    result = await executePython(cell.code);
    if (result.loading) {
      const waitForPyodide = async (retries = 30) => {
        for (let i = 0; i < retries; i++) {
          await new Promise(r => setTimeout(r, 1000));
          if (pyodideInstance && !pyodideLoading) {
            result = await executePython(cell.code);
            return;
          }
        }
        result = { output: '❌ No se pudo cargar Python.', error: true };
      };
      await waitForPyodide();
    }
  }
  else if (pgLang === 'c') result = await executeC(cell.code);

  cell.output = result.output;
  cell.status = result.error ? 'error' : 'done';
  pgRunning = false;
  renderPlayground();
}

// ─── RENDER ───
function renderPlayground() {
  const container = document.getElementById('playground-content');
  if (!container) return;

  const langNames = { javascript: 'JavaScript', python: 'Python', c: 'C (GCC)' };
  const langIcons = { javascript: 'JS', python: 'PY', c: 'C' };
  const langColors = { javascript: '#f7df1e', python: '#3776ab', c: '#03599c' };

  let html = `
    <div class="pg-header">
      <div class="pg-header-left">
        <h2 class="pg-title">Code Playground</h2>
        <span class="pg-subtitle">Ejecutá código en tu navegador</span>
      </div>
      <div class="pg-header-right">
        <button class="pg-action-btn pg-run-all" onclick="window.runAllCells()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Ejecutar todo
        </button>
      </div>
    </div>

    <div class="pg-toolbar">
      <div class="pg-lang-tabs">
        ${['javascript','python','c'].map(l => `
          <button class="pg-lang-tab ${pgLang === l ? 'pg-lang-active' : ''}" onclick="window.setPlaygroundLang('${l}')" style="--lang-color:${langColors[l]}">
            <span class="pg-lang-badge" style="background:${langColors[l]}">${langIcons[l]}</span> ${langNames[l]}
          </button>
        `).join('')}
      </div>
      <div class="pg-toolbar-right">
        <button class="pg-action-btn" onclick="window.addPlaygroundCell()" title="Nueva celda">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Celda
        </button>
        <button class="pg-action-btn" onclick="window.loadPlaygroundTemplate()" title="Templates">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Templates
        </button>
        <button class="pg-action-btn" onclick="window.clearPlayground()" title="Limpiar todo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>

    <div class="pg-cells">`;

  pgCells.forEach((cell, idx) => {
    const statusIcon = cell.status === 'running' ? '⏳' : cell.status === 'done' ? '✓' : cell.status === 'error' ? '✗' : '';
    const statusClass = cell.status === 'running' ? 'pg-cell-running' : cell.status === 'error' ? 'pg-cell-error' : cell.status === 'done' ? 'pg-cell-done' : '';
    html += `
      <div class="pg-cell ${statusClass}" data-cell-id="${cell.id}">
        <div class="pg-cell-header">
          <div class="pg-cell-left">
            <span class="pg-cell-num">[${idx + 1}]</span>
            <span class="pg-cell-status">${statusIcon}</span>
          </div>
          <div class="pg-cell-right">
            <button class="pg-cell-btn pg-cell-run" onclick="window.runPlaygroundCell(${cell.id})" title="Ejecutar (Shift+Enter)" ${pgRunning?'disabled':''}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <button class="pg-cell-btn pg-cell-add" onclick="window.addPlaygroundCellAfter(${cell.id})" title="Nueva celda debajo">+</button>
            ${pgCells.length > 1 ? `<button class="pg-cell-btn pg-cell-del" onclick="window.removePlaygroundCell(${cell.id})" title="Eliminar celda">×</button>` : ''}
          </div>
        </div>
        <textarea class="pg-cell-editor" spellcheck="false" placeholder="Escribí tu código acá..."
          oninput="window.updateCellCode(${cell.id}, this.value)"
          onkeydown="if(event.key==='Enter'&&event.shiftKey){event.preventDefault();window.runPlaygroundCell(${cell.id})}"
        >${cell.code}</textarea>
        ${cell.output ? `<div class="pg-cell-output ${cell.status==='error'?'pg-cell-output-error':''}"><pre>${cell.output}</pre></div>` : ''}
      </div>`;
  });

  html += `</div>
    <div class="pg-footer">
      <span>Shift+Enter para ejecutar · Shift+Enter en la última celda crea una nueva</span>
    </div>`;

  container.innerHTML = html;
}

// ─── WINDOW EXPORTS ───
window.setPlaygroundLang = function(lang) {
  pgLang = lang;
  pgCode = localStorage.getItem(PLAYGROUND_KEY + '_' + lang) || '';
  renderPlayground();
};

window.updateCellCode = function(cellId, code) {
  const cell = pgCells.find(c => c.id === cellId);
  if (cell) cell.code = code;
};

window.runPlaygroundCell = runCell;

window.runAllCells = async function() {
  for (const cell of pgCells) {
    if (cell.code.trim()) await runCell(cell.id);
  }
};

window.addPlaygroundCell = function() { addCell(null); };
window.addPlaygroundCellAfter = function(id) { addCell(id); };
window.removePlaygroundCell = function(id) { removeCell(id); };

window.loadPlaygroundTemplate = function() {
  const templates = TEMPLATES[pgLang];
  const names = templates.map(t => t.name);
  const choice = prompt('Templates:\n' + names.map((n,i) => `${i+1}. ${n}`).join('\n') + '\n\nElegí un número:');
  const idx = parseInt(choice) - 1;
  if (idx >= 0 && idx < templates.length) {
    pgCells[0].code = templates[idx].code;
    renderPlayground();
  }
};

window.clearPlayground = function() {
  if (!confirm('¿Limpiar todas las celdas?')) return;
  pgCells = [{ id: 1, code: '', output: '', status: 'idle' }];
  pgCellIdCounter = 1;
  renderPlayground();
};

window.renderPlayground = renderPlayground;
