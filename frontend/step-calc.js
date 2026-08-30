// step-calc.js — Calculadora con pasos: resolución paso a paso de ecuaciones
(function () {
  'use strict';

  function openStepCalc() {
    const modal = document.getElementById('stepcalc-modal');
    if (modal) modal.classList.add('open');
  }

  function closeStepCalc() {
    document.getElementById('stepcalc-modal')?.classList.remove('open');
  }

  // Resolvedor local de ecuaciones lineales y cuadráticas
  function solveLocal(expr) {
    const steps = [];
    let result = null;

    // Limpiar expresión
    let e = expr.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

    // Detectar ecuación lineal: ax + b = c  →  resolver para x
    const linMatch = e.match(/^([-+]?\d*\.?\d*)\s*\*?\s*x\s*([-+]\s*\d+\.?\d*)?\s*=\s*(.+)$/i);
    if (linMatch) {
      let a = parseFloat(linMatch[1]) || (e.startsWith('-x') ? -1 : 1);
      if (linMatch[0].match(/^\s*x/)) a = 1;
      if (linMatch[0].match(/^-x/)) a = -1;
      const b = linMatch[2] ? parseFloat(linMatch[2].replace(/\s/g, '')) : 0;
      const c = parseFloat(linMatch[3]);

      steps.push({ text: `Ecuación original: ${expr}`, type: 'start' });
      if (b !== 0) steps.push({ text: `Restamos ${-b} de ambos lados: ${a}x = ${c - b}`, type: 'step' });
      steps.push({ text: `Dividimos ambos lados entre ${a}: x = ${(c - b) / a}`, type: 'step' });
      result = (c - b) / a;
      steps.push({ text: `✅ Resultado: x = ${result}`, type: 'result' });
      return { steps, result, variable: 'x' };
    }

    // Detectar ecuación cuadrática: ax² + bx + c = 0
    const quadMatch = e.match(/^([-+]?\d*\.?\d*)\s*\*?\s*x[²2]\s*([-+]\s*\d*\.?\d*)\s*\*?\s*x\s*([-+]\s*\d+\.?\d*)?\s*=\s*0$/i);
    if (quadMatch) {
      let a = parseFloat(quadMatch[1]) || 1;
      let b = parseFloat((quadMatch[2] || '0').replace(/\s/g, ''));
      let c = parseFloat((quadMatch[3] || '0').replace(/\s/g, ''));

      steps.push({ text: `Ecuación cuadrática: ${a}x² + ${b}x + ${c} = 0`, type: 'start' });
      const disc = b * b - 4 * a * c;
      steps.push({ text: `Discriminante: Δ = b² - 4ac = ${b}² - 4·${a}·${c} = ${disc}`, type: 'step' });

      if (disc < 0) {
        steps.push({ text: `Δ < 0 → No tiene soluciones reales`, type: 'result' });
        return { steps, result: null, variable: 'x' };
      }

      const x1 = (-b + Math.sqrt(disc)) / (2 * a);
      const x2 = (-b - Math.sqrt(disc)) / (2 * a);
      steps.push({ text: `Fórmula: x = (-b ± √Δ) / 2a`, type: 'step' });
      steps.push({ text: `x₁ = (${-b} + ${Math.sqrt(disc).toFixed(4)}) / ${2 * a} = ${x1.toFixed(4)}`, type: 'step' });
      if (disc > 0) steps.push({ text: `x₂ = (${-b} - ${Math.sqrt(disc).toFixed(4)}) / ${2 * a} = ${x2.toFixed(4)}`, type: 'step' });

      result = disc === 0 ? x1 : [x1, x2];
      steps.push({ text: `✅ Resultado: ${disc === 0 ? `x = ${x1.toFixed(4)}` : `x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`}`, type: 'result' });
      return { steps, result, variable: 'x' };
    }

    // Operación simple evaluada paso a paso
    const simpleOps = e.match(/^(\d+\.?\d*)\s*([+\-*/^])\s*(\d+\.?\d*)$/);
    if (simpleOps) {
      const [, a, op, b] = simpleOps;
      const numA = parseFloat(a), numB = parseFloat(b);
      const opNames = { '+': 'suma', '-': 'resta', '*': 'multiplicación', '/': 'división', '^': 'potencia' };
      steps.push({ text: `${a} ${op} ${b}`, type: 'start' });
      steps.push({ text: `${opNames[op] || 'Operación'}: ${numA} ${op} ${numB}`, type: 'step' });

      let r;
      switch (op) {
        case '+': r = numA + numB; break;
        case '-': r = numA - numB; break;
        case '*': r = numA * numB; break;
        case '/': r = numB !== 0 ? numA / numB : 'Error: división por cero'; break;
        case '^': r = Math.pow(numA, numB); break;
      }
      steps.push({ text: `✅ Resultado: ${typeof r === 'number' ? r : r}`, type: 'result' });
      return { steps, result: r, variable: null };
    }

    return null;
  }

  async function solveExpression() {
    const input = document.getElementById('stepcalc-input');
    const expr = input?.value.trim();
    if (!expr) {
      alert('Escribí una ecuación o expresión');
      return;
    }

    const resultEl = document.getElementById('stepcalc-result');
    if (!resultEl) return;

    // Intentar resolver localmente primero
    const local = solveLocal(expr);

    if (local) {
      let html = '<div class="stepcalc-steps">';
      local.steps.forEach(s => {
        const cls = s.type === 'result' ? 'stepcalc-result-step' : s.type === 'start' ? 'stepcalc-start' : 'stepcalc-step';
        html += `<div class="${cls}">${s.text}</div>`;
      });
      html += '</div>';
      resultEl.innerHTML = html;
      return;
    }

    // Si no se pudo localmente, usar la IA
    resultEl.innerHTML = `
      <div class="stepcalc-loading">
        <div class="typing-dots"><span></span><span></span><span></span></div>
        Resolviendo...
      </div>
    `;

    const prompt = `Resolvé esta ecuación/expresión paso a paso de forma clara y didáctica:

${expr}

Mostrá cada paso del procedimiento. Si es una ecuación, explicá qué operás en cada paso. Si es una operación, explicá el orden de operaciones.`;

    try {
      const userApiKey = (typeof window.getUserGeminiKey === 'function' ? window.getUserGeminiKey() : '');
      const backendUrl = (typeof window.getBackendUrl === 'function' ? window.getBackendUrl() : 'http://localhost:3000/api/chat');
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, mode: 'profesor', context: '', userApiKey })
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        let html = data.reply
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`(.+?)`/g, '<code>$1</code>')
          .replace(/\n/g, '<br>');
        resultEl.innerHTML = `<div class="stepcalc-ai-result">${html}</div>`;
      } else {
        resultEl.innerHTML = `<div class="stepcalc-error">⚠️ ${data.error || 'No se pudo resolver'}</div>`;
      }
    } catch (e) {
      resultEl.innerHTML = `<div class="stepcalc-error">❌ Error de conexión</div>`;
    }
  }

  function initStepCalc() {
    const modal = document.getElementById('stepcalc-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="stepcalc-panel">
        <div class="stepcalc-header">
          <div>
            <h3>Calculadora con Pasos</h3>
            <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem">Ecuaciones lineales, cuadráticas y operaciones resueltas paso a paso</p>
          </div>
          <button class="stepcalc-close" onclick="closeStepCalc()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="stepcalc-body">
          <div class="stepcalc-examples">
            <span class="stepcalc-ex" onclick="document.getElementById('stepcalc-input').value='2x + 5 = 15'">2x + 5 = 15</span>
            <span class="stepcalc-ex" onclick="document.getElementById('stepcalc-input').value='x² - 5x + 6 = 0'">x² - 5x + 6 = 0</span>
            <span class="stepcalc-ex" onclick="document.getElementById('stepcalc-input').value='3*(4+2) - 7'">3*(4+2) - 7</span>
          </div>
          <input type="text" id="stepcalc-input" placeholder="Ej: 2x + 5 = 15, x² - 4 = 0, 3*(4+2)..." class="stepcalc-input"
            onkeydown="if(event.key==='Enter') solveExpression()">
          <button class="stepcalc-btn" onclick="solveExpression()">Resolver con Pasos</button>
          <div id="stepcalc-result" class="stepcalc-result"></div>
        </div>
      </div>
    `;

    document.querySelector('.stepcalc-close')?.addEventListener('click', closeStepCalc);
  }

  window.openStepCalc = openStepCalc;
  window.closeStepCalc = closeStepCalc;
  window.solveExpression = solveExpression;
  window.initStepCalc = initStepCalc;
})();
