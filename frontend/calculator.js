window.ScientificCalculator = (() => {
  let isOpen = false;
  const btnId = 'calc-fab';
  const panelId = 'calc-panel';
  
  const html = `
    <div class="calc-overlay hidden" id="calc-overlay"></div>
    <div id="${panelId}" class="calc-panel hidden">
      <div class="calc-header">
        <span>Calculadora</span>
        <button class="calc-close" id="calc-close-btn">✕</button>
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
          <button class="calc-clear" data-clear="all">AC</button>
          <button class="calc-clear" data-clear="back">⌫</button>
          <button class="calc-op" data-op="%">%</button>
          <button class="calc-op" data-op="(">(</button>
          <button class="calc-op" data-op=")">)</button>
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
          <button class="calc-equals" data-equal="=">=</button>
          <button class="calc-fn" data-fn="neg">±</button>
          <button class="calc-fn" data-fn="deg" id="calc-deg-btn">DEG</button>
        </div>
      </div>
    </div>
    <button id="${btnId}" class="calc-fab" title="Calculadora">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="10" y2="18"/><line x1="14" y1="18" x2="16" y2="18"/></svg>
    </button>
  `;
  
  let expr = '';
  let lastResult = '';
  let angleMode = 'deg';
  let justEvaluated = false;
  
  function init() {
    if (document.getElementById('calc-fab')) return;
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById(btnId).addEventListener('click', toggle);
    document.getElementById('calc-close-btn').addEventListener('click', toggle);
    document.getElementById('calc-overlay').addEventListener('click', toggle);
    attachEvents();
  }
  
  function attachEvents() {
    const panel = document.getElementById('calc-panel');
    
    panel.querySelectorAll('button[data-num], button[data-op], button[data-fn], button[data-clear], button[data-equal]').forEach(btn => {
      btn.onclick = () => {
        if (btn.dataset.num) appendNum(btn.dataset.num);
        else if (btn.dataset.op) appendOp(btn.dataset.op);
        else if (btn.dataset.fn) applyFn(btn.dataset.fn);
        else if (btn.dataset.clear) clear(btn.dataset.clear);
        else if (btn.dataset.equal) evaluate();
      };
    });
    
    function appendNum(n) {
      if (justEvaluated) { expr = ''; justEvaluated = false; }
      if (n === '.' && expr.includes('.') && !/[\+\-\*\/\%\(\)]/.test(expr.slice(expr.lastIndexOf('.') + 1))) return;
      expr += n;
      updateDisplay();
    }
    
    function appendOp(op) {
      if (justEvaluated) { expr = lastResult; justEvaluated = false; }
      if (!expr && op !== '(' && op !== '-') return;
      const last = expr.slice(-1);
      if (last && '+-*/%'.includes(last) && '+-*/%'.includes(op)) {
        expr = expr.slice(0, -1) + op;
      } else {
        expr += op;
      }
      updateDisplay();
    }
    
    function applyFn(fn) {
      if (justEvaluated) { justEvaluated = false; }
      switch(fn) {
        case 'sin': expr += 'sin('; updateDisplay(); return;
        case 'cos': expr += 'cos('; updateDisplay(); return;
        case 'tan': expr += 'tan('; updateDisplay(); return;
        case 'asin': expr += 'asin('; updateDisplay(); return;
        case 'acos': expr += 'acos('; updateDisplay(); return;
        case 'atan': expr += 'atan('; updateDisplay(); return;
        case 'log': expr += 'log('; updateDisplay(); return;
        case 'ln': expr += 'ln('; updateDisplay(); return;
        case 'sqrt': expr += 'sqrt('; updateDisplay(); return;
        case 'pow': expr += '^('; updateDisplay(); return;
        case 'pi': expr += String(Math.PI); updateDisplay(); return;
        case 'e': expr += String(Math.E); updateDisplay(); return;
        case 'pow2': expr += '^2'; updateDisplay(); return;
        case 'pow3': expr += '^3'; updateDisplay(); return;
        case '10x': expr += '10^('; updateDisplay(); return;
        case '2x': expr += '2^('; updateDisplay(); return;
        case 'fact': {
          try {
            const val = evalExpr(expr);
            expr = String(factorial(val));
            updateDisplay();
          } catch(e) {}
          return;
        }
        case 'neg': {
          if (expr) {
            if (expr.startsWith('-')) expr = expr.slice(1);
            else expr = '-' + expr;
            updateDisplay();
          }
          return;
        }
        case 'deg': {
          angleMode = angleMode === 'deg' ? 'rad' : 'deg';
          const degBtn = document.getElementById('calc-deg-btn');
          if (degBtn) degBtn.textContent = angleMode === 'deg' ? 'DEG' : 'RAD';
          return;
        }
      }
    }
    
    function factorial(n) { if (n < 0 || n !== Math.floor(n)) return NaN; let r = 1; for(let i=2;i<=n;i++) r*=i; return r; }
    
    function clear(type) {
      if (type === 'all') { expr = ''; lastResult = ''; justEvaluated = false; }
      else { expr = expr.slice(0, -1); }
      updateDisplay();
    }
    
    function evaluate() {
      try {
        let e = expr;
        let open = (e.match(/\(/g) || []).length;
        let close = (e.match(/\)/g) || []).length;
        while (close < open) { e += ')'; close++; }
        const val = evalExpr(e);
        lastResult = String(val);
        expr = lastResult;
        justEvaluated = true;
        updateDisplay();
      } catch(e) {
        expr = 'Error';
        updateDisplay();
      }
    }
    
    function evalExpr(e) {
      let normalized = e
        .replace(/\^/g, '**')
        .replace(/(\d+\.?\d*)\s*\(/g, '$1*(')
        .replace(/\)\s*\(/g, ')*(')
        .replace(/\)(\d)/g, ')*$1');
      const mathFuncs = {
        sin: angleMode === 'deg' ? '(x)=>Math.sin(x*Math.PI/180)' : 'Math.sin',
        cos: angleMode === 'deg' ? '(x)=>Math.cos(x*Math.PI/180)' : 'Math.cos',
        tan: angleMode === 'deg' ? '(x)=>Math.tan(x*Math.PI/180)' : 'Math.tan',
        asin: angleMode === 'deg' ? '(x)=>Math.asin(x)*180/Math.PI' : 'Math.asin',
        acos: angleMode === 'deg' ? '(x)=>Math.acos(x)*180/Math.PI' : 'Math.acos',
        atan: angleMode === 'deg' ? '(x)=>Math.atan(x)*180/Math.PI' : 'Math.atan',
        log: 'Math.log10',
        ln: 'Math.log',
        sqrt: 'Math.sqrt'
      };
      for (const [name, fn] of Object.entries(mathFuncs)) {
        normalized = normalized.replace(new RegExp(name + '\\(', 'g'), fn + '(');
      }
      return Function('"use strict"; return (' + normalized + ')')();
    }
    
    function updateDisplay() {
      const exprEl = document.getElementById('calc-expr');
      const resultEl = document.getElementById('calc-result');
      if (exprEl) exprEl.textContent = expr;
      if (!resultEl) return;
      if (!expr) { resultEl.textContent = '0'; return; }
      try {
        resultEl.textContent = evalExpr(expr);
      } catch(e) {
        resultEl.textContent = '';
      }
    }
  }
  
  function toggle() {
    if (!document.getElementById('calc-fab')) init();
    isOpen = !isOpen;
    document.getElementById('calc-panel').classList.toggle('hidden', !isOpen);
    document.getElementById('calc-overlay').classList.toggle('hidden', !isOpen);
    document.getElementById('calc-fab').classList.toggle('active', isOpen);
  }
  
  return { init, toggle };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ScientificCalculator.init());
} else {
  ScientificCalculator.init();
}
