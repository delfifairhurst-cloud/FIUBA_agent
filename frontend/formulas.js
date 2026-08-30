// formulas.js — Hoja de fórmulas rápida por materia
(function () {
  'use strict';

  const FORMULAS = {
    'Álgebra': [
      { name: 'Bhaskara', formula: 'x = (-b ± √(b²-4ac)) / 2a', desc: 'Ecuación cuadrática de segundo grado' },
      { name: 'Suma geométrica', formula: 'Sn = a₁(1-rⁿ)/(1-r)', desc: 'Suma de los primeros n términos' },
      { name: 'Logaritmos', formula: 'logₐ(b) = ln(b)/ln(a)', desc: 'Cambio de base' },
      { name: 'Combinatoria', formula: 'C(n,k) = n! / (k!(n-k)!)', desc: 'Combinaciones sin repetición' },
      { name: 'Permutaciones', formula: 'P(n,k) = n! / (n-k)!', desc: 'Permutaciones sin repetición' },
    ],
    'Análisis Matemático': [
      { name: 'Derivada', formula: 'f\'(x) = lim[h→0] (f(x+h)-f(x))/h', desc: 'Definición de derivada' },
      { name: 'Regla de la cadena', formula: '(f∘g)\'(x) = f\'(g(x))·g\'(x)', desc: 'Derivada de composición' },
      { name: 'Integral indefinida', formula: '∫xⁿdx = xⁿ⁺¹/(n+1) + C', desc: 'Potencias (n ≠ -1)' },
      { name: 'Taylor', formula: 'f(x) = Σ f⁽ⁿ⁾(a)/n! · (x-a)ⁿ', desc: 'Serie de Taylor en a' },
      { name: 'L\'Hopital', formula: 'lim f/g = lim f\'/g\'', desc: 'Si el límite da 0/0 o ∞/∞' },
    ],
    'Física': [
      { name: 'Movimiento uniformly', formula: 'x = x₀ + v₀t + ½at²', desc: 'Posición en MRUA' },
      { name: 'Energía cinética', formula: 'Ec = ½mv²', desc: 'Energía de movimiento' },
      { name: 'Trabajo', formula: 'W = F·d·cos(θ)', desc: 'Trabajo de una fuerza' },
      { name: 'Ohm', formula: 'V = IR', desc: 'Ley de Ohm: voltaje, corriente, resistencia' },
      { name: 'Coulomb', formula: 'F = kq₁q₂/r²', desc: 'Fuerza eléctrica entre cargas' },
    ],
    'Química': [
      { name: 'Ideal gas', formula: 'PV = nRT', desc: 'Estado del gas ideal' },
      { name: 'pH', formula: 'pH = -log[H⁺]', desc: 'Medida de acidez' },
      { name: 'Molaridad', formula: 'M = mol soluto / L solución', desc: 'Concentración molar' },
      { name: 'Gibbs', formula: 'ΔG = ΔH - TΔS', desc: 'Energía libre de Gibbs' },
      { name: 'Nernst', formula: 'E = E° - (RT/nF)ln(Q)', desc: 'Potencial de electrodo' },
    ],
    'Probabilidad': [
      { name: 'Bayes', formula: 'P(A|B) = P(B|A)·P(A) / P(B)', desc: 'Teorema de Bayes' },
      { name: 'Varianza', formula: 'Var(X) = E[X²] - (E[X])²', desc: 'Varianza de una variable' },
      { name: 'Binomial', formula: 'P(X=k) = C(n,k)pᵏ(1-p)ⁿ⁻ᵏ', desc: 'Distribución binomial' },
      { name: 'Normal', formula: 'f(x) = (1/σ√2π)e^(-(x-μ)²/2σ²)', desc: 'Distribución normal' },
      { name: 'Poisson', formula: 'P(X=k) = e⁻λλᵏ/k!', desc: 'Distribución de Poisson' },
    ],
    'Sistemas de Representación': [
      { name: 'Punto isométrico', formula: '30° izq + 30° der + 90° vert', desc: 'Ejes isométricos' },
      { name: 'Perspectiva cónica', formula: '1/d + 1/d\' = 1/f', desc: 'Lente delgada' },
      { name: 'Escala', formula: 'Escala = dibujo / realidad', desc: 'Relación de escala' },
    ],
    'Programación': [
      { name: 'Notación O', formula: 'O(1) < O(log n) < O(n) < O(n²)', desc: 'Complejidad temporal' },
      { name: 'Recursión Fibonacci', formula: 'fib(n) = fib(n-1) + fib(n-2)', desc: 'Definición recursiva' },
      { name: 'Búsqueda binaria', formula: 'mid = (low + high) / 2', desc: 'Divide y vencerás' },
    ],
  };

  function openFormulas() {
    const modal = document.getElementById('formulas-modal');
    if (modal) modal.classList.add('open');
    renderFormulas();
  }

  function closeFormulas() {
    document.getElementById('formulas-modal')?.classList.remove('open');
  }

  function renderFormulas(filter = '') {
    const grid = document.getElementById('formulas-grid');
    if (!grid) return;

    const search = filter.toLowerCase();
    let html = '';

    for (const [subject, items] of Object.entries(FORMULAS)) {
      const filtered = items.filter(f =>
        !search || f.name.toLowerCase().includes(search) || f.desc.toLowerCase().includes(search) || f.formula.toLowerCase().includes(search)
      );
      if (filtered.length === 0) continue;

      html += `<div class="formula-subject">
        <div class="formula-subject-title">${subject}</div>
        ${filtered.map(f => `
          <div class="formula-card" onclick="navigator.clipboard.writeText('${f.formula.replace(/'/g, "\\'")}');this.classList.add('copied');setTimeout(()=>this.classList.remove('copied'),1200)">
            <div class="formula-name">${f.name}</div>
            <div class="formula-expr">${f.formula}</div>
            <div class="formula-desc">${f.desc}</div>
            <div class="formula-copy-hint">Click para copiar</div>
          </div>
        `).join('')}
      </div>`;
    }

    if (!html) html = '<div style="text-align:center;color:var(--text-muted);padding:2rem">No se encontraron fórmulas</div>';
    grid.innerHTML = html;
  }

  function initFormulas() {
    const modal = document.getElementById('formulas-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="formulas-panel">
        <div class="formulas-header">
          <h3>Hoja de Fórmulas</h3>
          <button class="formulas-close" onclick="closeFormulas()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="formulas-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="formulas-search-input" placeholder="Buscar fórmula..." oninput="this.dataset.filterTimeout&&clearTimeout(+this.dataset.filterTimeout);this.dataset.filterTimeout=setTimeout(()=>renderFormulas(this.value),200)">
        </div>
        <div class="formulas-grid" id="formulas-grid"></div>
      </div>
    `;

    document.querySelector('.formulas-close')?.addEventListener('click', closeFormulas);
    renderFormulas();
  }

  window.openFormulas = openFormulas;
  window.closeFormulas = closeFormulas;
  window.renderFormulas = renderFormulas;
  window.initFormulas = initFormulas;
})();
