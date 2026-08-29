window.ScientificCalculator = (() => {
  let isOpen = false;
  const btnId = 'calc-fab';
  const panelId = 'calc-panel';
  
  const html = `
    <div id="${panelId}" class="calc-panel hidden">
      <div class="calc-header">
        <span>🧮 Calculadora Científica</span>
        <button class="calc-close" onclick="ScientificCalculator.toggle()">✕</button>
      </div>
      <div class="calc-display">
        <div class="calc-expression" id="calc-expr"></div>
        <div class="calc-result" id="calc-result">0</div>
      </div>
      <div class="calc-keys">
        <div class="calc-row">
          <button class="calc-fn" data-fn="sin">sin</button>
          <button class="calc-fn" data-fn="cos">cos</button>
          <button class="calc-fn" data-fn="tan">tan</button>
          <button class="calc-fn" data-fn="asin">asin</button>
          <button class="calc-fn" data-fn="acos">acos</button>
          <button class="calc-fn" data-fn="atan">atan</button>
        </div>
        <div class="calc-row">
          <button class="calc-fn" data-fn="log">log</button>
          <button class="calc-fn" data-fn="ln">ln</button>
          <button class="calc-fn" data-fn="sqrt">√</button>
          <button class="calc-fn" data-fn="pow">xʸ</button>
          <button class="calc-fn" data-fn="pi">π</button>
          <button class="calc-fn" data-fn="e">e</button>
        </div>
        <div class="calc-row">
          <button class="calc-op" data-op="(">(</button>
          <button class="calc-op" data-op=")">)</button>
          <button class="calc-op" data-op="%">%</button>
          <button class="calc-clear" data-clear="all">C</button>
          <button class="calc-clear" data-clear="back">⌫</button>
          <button class="calc-op" data-op="/">÷</button>
        </div>
        <div class="calc-row">
          <button class="calc-num" data-num="7">7</button>
          <button class="calc-num" data-num="8">8</button>
          <button class="calc-num" data-num="9">9</button>
          <button class="calc-op" data-op="*">×</button>
          <button class="calc-fn" data-fn="fact">x!</button>
          <button class="calc-fn" data-fn="exp">EXP</button>
        </div>
        <div class="calc-row">
          <button class="calc-num" data-num="4">4</button>
          <button class="calc-num" data-num="5">5</button>
          <button class="calc-num" data-num="6">6</button>
          <button class="calc-op" data-op="-">−</button>
          <button class="calc-fn" data-fn="pow2">x²</button>
          <button class="calc-fn" data-fn="pow3">x³</button>
        </div>
        <div class="calc-row">
          <button class="calc-num" data-num="1">1</button>
          <button class="calc-num" data-num="2">2</button>
          <button class="calc-num" data-num="3">3</button>
          <button class="calc-op" data-op="+">+</button>
          <button class="calc-fn" data-fn="10x">10ˣ</button>
          <button class="calc-fn" data-fn="2x">2ˣ</button>
        </div>
        <div class="calc-row">
          <button class="calc-num" data-num="0" style="grid-column:span 2">0</button>
          <button class="calc-num" data-num=".">.</button>
          <button class="calc-equals" data-equal>=</button>
          <button class="calc-fn" data-fn="deg">DEG/RAD</button>
        </div>
      </div>
    </div>
    <button id="${btnId}" class="calc-fab" onclick="ScientificCalculator.toggle()" title="Calculadora">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>
    </button>
  `;
  
  let expr = '';
  let angleMode = 'deg';
  
  function init() {
    if (document.getElementById('calc-fab')) return;
    document.body.insertAdjacentHTML('beforeend', html);
    attachEvents();
  }
  
  function attachEvents() {
    const panel = document.getElementById('calc-panel');
    const exprEl = document.getElementById('calc-expr');
    const resultEl = document.getElementById('calc-result');
    
    panel.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.num) appendNum(btn.dataset.num);
        else if (btn.dataset.op) appendOp(btn.dataset.op);
        else if (btn.dataset.fn) applyFn(btn.dataset.fn);
        else if (btn.dataset.clear) clear(btn.dataset.clear);
        else if (btn.dataset.equal) evaluate();
      };
    });
    
    function appendNum(n) {
      if (n === '.' && expr.slice(-1) === '.') return;
      expr += n;
      updateDisplay();
    }
    function appendOp(op) {
      if (!expr || /[\+\-\*\/\%\(]$/.test(expr)) return;
      expr += op;
      updateDisplay();
    }
    function applyFn(fn) {
      try {
        let val = expr ? evalExpr(expr) : 0;
        switch(fn) {
          case 'sin': val = trig(Math.sin, val); break;
          case 'cos': val = trig(Math.cos, val); break;
          case 'tan': val = trig(Math.tan, val); break;
          case 'asin': val = aTrig(Math.asin, val); break;
          case 'acos': val = aTrig(Math.acos, val); break;
          case 'atan': val = aTrig(Math.atan, val); break;
          case 'log': val = Math.log10(val); break;
          case 'ln': val = Math.log(val); break;
          case 'sqrt': val = Math.sqrt(val); break;
          case 'pow': expr += '**'; updateDisplay(); return;
          case 'pi': expr += Math.PI; updateDisplay(); return;
          case 'e': expr += Math.E; updateDisplay(); return;
          case 'pow2': val = val * val; break;
          case 'pow3': val = val * val * val; break;
          case '10x': val = Math.pow(10, val); break;
          case '2x': val = Math.pow(2, val); break;
          case 'fact': val = factorial(val); break;
          case 'exp': expr += 'e'; updateDisplay(); return;
          case 'deg': angleMode = angleMode === 'deg' ? 'rad' : 'deg'; updateDisplay(); return;
        }
        expr = String(val);
        updateDisplay();
      } catch(e) { expr = 'Error'; updateDisplay(); }
    }
    function trig(fn, val) { return angleMode === 'deg' ? fn(val * Math.PI / 180) : fn(val); }
    function aTrig(fn, val) { const res = fn(val); return angleMode === 'deg' ? res * 180 / Math.PI : res; }
    function factorial(n) { if (n < 0 || n !== Math.floor(n)) return NaN; let r = 1; for(let i=2;i<=n;i++) r*=i; return r; }
    function clear(type) { if (type === 'all') expr = ''; else expr = expr.slice(0,-1); updateDisplay(); }
    function evaluate() { try { const val = evalExpr(expr); expr = String(val); updateDisplay(); } catch(e) { expr = 'Error'; updateDisplay(); } }
    function evalExpr(e) { return Function('"use strict"; return (' + e.replace(/\^/g, '**') + ')')(); }
    function updateDisplay() { 
      document.getElementById('calc-expr').textContent = expr; 
      try { document.getElementById('calc-result').textContent = expr ? evalExpr(expr) : ''; } 
      catch(e) { document.getElementById('calc-result').textContent = ''; } 
    }
  }
  
  function toggle() {
    if (!document.getElementById('calc-fab')) init();
    isOpen = !isOpen;
    document.getElementById('calc-panel').classList.toggle('hidden', !isOpen);
    document.getElementById('calc-fab').classList.toggle('active', isOpen);
  }
  
  return { init, toggle };
})();

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ScientificCalculator.init());
} else {
  ScientificCalculator.init();
}
