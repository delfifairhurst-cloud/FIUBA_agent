window.ScientificCalculator = (() => {
  let isOpen = false;
  let shiftMode = false;
  const btnId = 'calc-fab';
  const panelId = 'calc-panel';
  
  const html = `
    <div class="calc-overlay hidden" id="calc-overlay"></div>
    <div id="${panelId}" class="calc-panel hidden">
      <div class="calc-header">
        <span>Calculadora Científica</span>
        <button class="calc-close" id="calc-close-btn">✕</button>
      </div>
      <div class="calc-display">
        <div class="calc-expression" id="calc-expr"></div>
        <div class="calc-result" id="calc-result">0</div>
      </div>
      <div class="calc-keys">
        <!-- Row 1: Shift + Trig -->
        <div class="calc-row">
          <button class="calc-shift" id="calc-shift-btn" data-fn="shift">2nd</button>
          <button class="calc-fn" data-fn="sin">sin</button>
          <button class="calc-fn" data-fn="cos">cos</button>
          <button class="calc-fn" data-fn="tan">tan</button>
          <button class="calc-fn" data-fn="hyp">hyp</button>
          <button class="calc-fn" data-fn="deg" id="calc-deg-btn">DEG</button>
        </div>
        <!-- Row 2: Log, Roots, Powers -->
        <div class="calc-row">
          <button class="calc-fn" data-fn="log">log</button>
          <button class="calc-fn" data-fn="ln">ln</button>
          <button class="calc-fn" data-fn="sqrt">√</button>
          <button class="calc-fn" data-fn="cbrt">∛</button>
          <button class="calc-fn" data-fn="pow">xʸ</button>
          <button class="calc-fn" data-fn="abs">|x|</button>
        </div>
        <!-- Row 3: Constants, parens, clear -->
        <div class="calc-row">
          <button class="calc-clear" data-clear="all">AC</button>
          <button class="calc-clear" data-clear="back">⌫</button>
          <button class="calc-op" data-op="%">%</button>
          <button class="calc-op" data-op="(">(</button>
          <button class="calc-op" data-op=")">)</button>
          <button class="calc-op" data-op="/">÷</button>
        </div>
        <!-- Row 4: Numbers + multiply + factorial -->
        <div class="calc-row">
          <button class="calc-num" data-num="7">7</button>
          <button class="calc-num" data-num="8">8</button>
          <button class="calc-num" data-num="9">9</button>
          <button class="calc-op" data-op="*">×</button>
          <button class="calc-fn" data-fn="fact">x!</button>
          <button class="calc-fn" data-fn="inv">1/x</button>
        </div>
        <!-- Row 5 -->
        <div class="calc-row">
          <button class="calc-num" data-num="4">4</button>
          <button class="calc-num" data-num="5">5</button>
          <button class="calc-num" data-num="6">6</button>
          <button class="calc-op" data-op="-">−</button>
          <button class="calc-fn" data-fn="pow2">x²</button>
          <button class="calc-fn" data-fn="pow3">x³</button>
        </div>
        <!-- Row 6 -->
        <div class="calc-row">
          <button class="calc-num" data-num="1">1</button>
          <button class="calc-num" data-num="2">2</button>
          <button class="calc-num" data-num="3">3</button>
          <button class="calc-op" data-op="+">+</button>
          <button class="calc-fn" data-fn="10x">10ˣ</button>
          <button class="calc-fn" data-fn="2x">eˣ</button>
        </div>
        <!-- Row 7 -->
        <div class="calc-row">
          <button class="calc-fn" data-fn="pi">π</button>
          <button class="calc-num" data-num="0" style="grid-column:span 2">0</button>
          <button class="calc-num" data-num=".">.</button>
          <button class="calc-equals" data-equal="=">=</button>
          <button class="calc-fn" data-fn="neg">±</button>
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
      if (n === '.' && expr.includes('.') && !/[\+\-\*\/\%\(\)\^]/.test(expr.slice(expr.lastIndexOf('.') + 1))) return;
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
      if (fn === 'shift') {
        shiftMode = !shiftMode;
        const shiftBtn = document.getElementById('calc-shift-btn');
        if (shiftBtn) shiftBtn.classList.toggle('active', shiftMode);
        updateShiftLabels();
        return;
      }

      if (fn === 'deg') {
        angleMode = angleMode === 'deg' ? 'rad' : 'deg';
        const degBtn = document.getElementById('calc-deg-btn');
        if (degBtn) degBtn.textContent = angleMode === 'deg' ? 'DEG' : 'RAD';
        return;
      }

      if (justEvaluated) { justEvaluated = false; }

      if (shiftMode) {
        const invMap = {
          sin: 'asin', cos: 'acos', tan: 'atan',
          log: '10^(', ln: 'e^(', sqrt: 'sqr(', cbrt: 'cbrt(',
          pow2: '√(', pow3: '∛(',
          '10x': 'log(', '2x': 'ln(', abs: 'abs(',
          fact: '(', inv: '1/(',
          hyp: 'hyp('
        };
        if (invMap[fn]) {
          expr += invMap[fn];
          updateDisplay();
          return;
        }
      }

      switch(fn) {
        case 'sin': expr += 'sin('; break;
        case 'cos': expr += 'cos('; break;
        case 'tan': expr += 'tan('; break;
        case 'hyp': expr += 'sinh('; break;
        case 'log': expr += 'log('; break;
        case 'ln': expr += 'ln('; break;
        case 'sqrt': expr += 'sqrt('; break;
        case 'cbrt': expr += 'cbrt('; break;
        case 'abs': expr += 'abs('; break;
        case 'pow': expr += '^('; break;
        case 'pi': expr += String(Math.PI); break;
        case 'e': expr += String(Math.E); break;
        case 'pow2': expr += '^2'; break;
        case 'pow3': expr += '^3'; break;
        case '10x': expr += '10^('; break;
        case '2x': expr += 'e^('; break;
        case 'inv': expr += '1/('; break;
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
            if (expr.startsWith('-(') && expr.endsWith(')')) expr = expr.slice(2, -1);
            else if (expr.startsWith('-')) expr = expr.slice(1);
            else expr = '-(' + expr + ')';
            updateDisplay();
          }
          return;
        }
        default: return;
      }
      updateDisplay();
    }

    function updateShiftLabels() {
      const labels = {
        sin: shiftMode ? 'sin⁻¹' : 'sin',
        cos: shiftMode ? 'cos⁻¹' : 'cos',
        tan: shiftMode ? 'tan⁻¹' : 'tan',
        log: shiftMode ? '10ˣ' : 'log',
        ln: shiftMode ? 'eˣ' : 'ln',
        sqrt: shiftMode ? 'x²' : '√',
        cbrt: shiftMode ? 'x³' : '∛',
        pow2: shiftMode ? '√' : 'x²',
        pow3: shiftMode ? '∛' : 'x³',
        '10x': shiftMode ? 'log⁻¹' : '10ˣ',
        '2x': shiftMode ? 'ln⁻¹' : 'eˣ',
        abs: shiftMode ? 'mod' : '|x|',
        fact: shiftMode ? 'nPr' : 'x!',
        inv: shiftMode ? 'nCr' : '1/x'
      };
      panel.querySelectorAll('.calc-fn[data-fn]').forEach(btn => {
        const fn = btn.dataset.fn;
        if (labels[fn]) btn.textContent = labels[fn];
      });
    }
    
    function factorial(n) {
      if (n < 0 || n !== Math.floor(n)) return NaN;
      if (n > 170) return Infinity;
      let r = 1;
      for (let i = 2; i <= n; i++) r *= i;
      return r;
    }
    
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
        lastResult = isFinite(val) ? String(parseFloat(val.toFixed(10))) : String(val);
        expr = lastResult;
        justEvaluated = true;
        updateDisplay();
      } catch(err) {
        expr = 'Error';
        lastResult = '';
        justEvaluated = true;
        updateDisplay();
      }
    }
    
    function evalExpr(e) {
      let normalized = e
        .replace(/\^/g, '**')
        .replace(/(\d+\.?\d*)\s*\(/g, '$1*(')
        .replace(/\)\s*\(/g, ')*(')
        .replace(/\)(\d)/g, ')*$1')
        .replace(/(\d)\s*(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|log|ln|sqrt|cbrt|abs)/g, '$1*$2');

      const toRad = angleMode === 'deg' ? '*Math.PI/180' : '';
      const fromRad = angleMode === 'deg' ? '*180/Math.PI' : '';

      const mathFuncs = {};
      if (angleMode === 'deg') {
        mathFuncs['asin\\('] = '(x=>Math.asin(x)' + fromRad + ')';
        mathFuncs['acos\\('] = '(x=>Math.acos(x)' + fromRad + ')';
        mathFuncs['atan\\('] = '(x=>Math.atan(x)' + fromRad + ')';
        mathFuncs['sin\\('] = '(x=>Math.sin(x' + toRad + '))';
        mathFuncs['cos\\('] = '(x=>Math.cos(x' + toRad + '))';
        mathFuncs['tan\\('] = '(x=>Math.tan(x' + toRad + '))';
      } else {
        mathFuncs['asin\\('] = 'Math.asin';
        mathFuncs['acos\\('] = 'Math.acos';
        mathFuncs['atan\\('] = 'Math.atan';
        mathFuncs['sin\\('] = 'Math.sin';
        mathFuncs['cos\\('] = 'Math.cos';
        mathFuncs['tan\\('] = 'Math.tan';
      }
      mathFuncs['sinh\\('] = 'Math.sinh';
      mathFuncs['cosh\\('] = 'Math.cosh';
      mathFuncs['tanh\\('] = 'Math.tanh';
      mathFuncs['log\\('] = 'Math.log10';
      mathFuncs['ln\\('] = 'Math.log';
      mathFuncs['sqrt\\('] = 'Math.sqrt';
      mathFuncs['cbrt\\('] = 'Math.cbrt';
      mathFuncs['abs\\('] = 'Math.abs';

      for (const [pattern, replacement] of Object.entries(mathFuncs)) {
        normalized = normalized.replace(new RegExp(pattern, 'g'), replacement + '(');
      }

      return Function('"use strict"; return (' + normalized + ')')();
    }
    
    function updateDisplay() {
      const exprEl = document.getElementById('calc-expr');
      const resultEl = document.getElementById('calc-result');
      if (exprEl) exprEl.textContent = expr;
      if (!resultEl) return;
      if (!expr || expr === 'Error') { resultEl.textContent = expr || '0'; return; }
      try {
        const val = evalExpr(expr);
        if (typeof val === 'number') {
          resultEl.textContent = isFinite(val) ? parseFloat(val.toFixed(10)) : String(val);
        } else {
          resultEl.textContent = String(val);
        }
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
