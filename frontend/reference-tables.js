// reference-tables.js - Tablas de referencia matemática (sin IA)
const DERIVATIVES = [
  { rule: "c (constante)", formula: "d/dx [c] = 0" },
  { rule: "xⁿ", formula: "d/dx [xⁿ] = n·xⁿ⁻¹" },
  { rule: "eˣ", formula: "d/dx [eˣ] = eˣ" },
  { rule: "aˣ", formula: "d/dx [aˣ] = aˣ·ln(a)" },
  { rule: "ln(x)", formula: "d/dx [ln(x)] = 1/x" },
  { rule: "log_a(x)", formula: "d/dx [log_a(x)] = 1/(x·ln(a))" },
  { rule: "sin(x)", formula: "d/dx [sin(x)] = cos(x)" },
  { rule: "cos(x)", formula: "d/dx [cos(x)] = -sin(x)" },
  { rule: "tan(x)", formula: "d/dx [tan(x)] = sec²(x)" },
  { rule: "cot(x)", formula: "d/dx [cot(x)] = -csc²(x)" },
  { rule: "sec(x)", formula: "d/dx [sec(x)] = sec(x)·tan(x)" },
  { rule: "csc(x)", formula: "d/dx [csc(x)] = -csc(x)·cot(x)" },
  { rule: "arcsin(x)", formula: "d/dx [arcsin(x)] = 1/√(1-x²)" },
  { rule: "arccos(x)", formula: "d/dx [arccos(x)] = -1/√(1-x²)" },
  { rule: "arctan(x)", formula: "d/dx [arctan(x)] = 1/(1+x²)" },
  { rule: "f + g", formula: "(f+g)' = f' + g'" },
  { rule: "f · g (producto)", formula: "(fg)' = f'g + fg'" },
  { rule: "f/g (cociente)", formula: "(f/g)' = (f'g - fg')/g²" },
  { rule: "f∘g (cadena)", formula: "d/dx [f(g(x))] = f'(g(x))·g'(x)" },
  { rule: "√x", formula: "d/dx [√x] = 1/(2√x)" },
  { rule: "1/x", formula: "d/dx [1/x] = -1/x²" },
];

const INTEGRALS = [
  { rule: "∫ xⁿ dx (n≠-1)", formula: "xⁿ⁺¹/(n+1) + C" },
  { rule: "∫ 1/x dx", formula: "ln|x| + C" },
  { rule: "∫ eˣ dx", formula: "eˣ + C" },
  { rule: "∫ aˣ dx", formula: "aˣ/ln(a) + C" },
  { rule: "∫ sin(x) dx", formula: "-cos(x) + C" },
  { rule: "∫ cos(x) dx", formula: "sin(x) + C" },
  { rule: "∫ tan(x) dx", formula: "-ln|cos(x)| + C" },
  { rule: "∫ sec²(x) dx", formula: "tan(x) + C" },
  { rule: "∫ csc²(x) dx", formula: "-cot(x) + C" },
  { rule: "∫ sec(x)tan(x) dx", formula: "sec(x) + C" },
  { rule: "∫ csc(x)cot(x) dx", formula: "-csc(x) + C" },
  { rule: "∫ 1/√(1-x²) dx", formula: "arcsin(x) + C" },
  { rule: "∫ 1/(1+x²) dx", formula: "arctan(x) + C" },
  { rule: "∫ 1/(x√(x²-1)) dx", formula: "arcsec|x| + C" },
  { rule: "∫ 1/(a²+x²) dx", formula: "(1/a)·arctan(x/a) + C" },
  { rule: "∫ 1/√(a²-x²) dx", formula: "arcsin(x/a) + C" },
  { rule: "∫ √(a²-x²) dx", formula: "(x/2)√(a²-x²) + (a²/2)arcsin(x/a) + C" },
  { rule: "∫ ln(x) dx", formula: "x·ln(x) - x + C" },
  { rule: "∫ u dv (partes)", formula: "uv - ∫ v du" },
];

let refTab = 'derivatives';
let refSearch = '';

function renderReferenceTables() {
  const container = document.getElementById('reference-view-content');
  if (!container) return;

  const data = refTab === 'derivatives' ? DERIVATIVES : INTEGRALS;
  const filtered = refSearch ? data.filter(r =>
    r.rule.toLowerCase().includes(refSearch.toLowerCase()) ||
    r.formula.toLowerCase().includes(refSearch.toLowerCase())
  ) : data;

  let html = `
    <div class="ref-header">
      <h2 class="ref-title">Referencia Matemática</h2>
    </div>
    <div class="ref-tabs">
      <button class="ref-tab ${refTab === 'derivatives' ? 'active' : ''}" onclick="window.setRefTab('derivatives')">Derivadas</button>
      <button class="ref-tab ${refTab === 'integrals' ? 'active' : ''}" onclick="window.setRefTab('integrals')">Integrales</button>
    </div>
    <div class="ref-search-wrap">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input id="ref-search" class="ref-search" placeholder="Buscar regla..." value="${refSearch}" oninput="window.setRefSearch(this.value)">
    </div>
    <div class="ref-grid">`;

  if (filtered.length === 0) {
    html += `<div class="ref-empty">No se encontraron resultados</div>`;
  } else {
    filtered.forEach(r => {
      html += `<div class="ref-card" onclick="window.copyRef('${r.formula.replace(/'/g, "\\'")}')">
        <div class="ref-card-rule">${r.rule}</div>
        <div class="ref-card-formula">${r.formula}</div>
        <div class="ref-card-copy">Click para copiar</div>
      </div>`;
    });
  }

  html += `</div>`;
  container.innerHTML = html;
}

window.setRefTab = function(t) { refTab = t; refSearch = ''; renderReferenceTables(); };
window.setRefSearch = function(s) { refSearch = s; renderReferenceTables(); };
window.copyRef = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    const toast = document.createElement('div');
    toast.textContent = 'Copiado';
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#22c55e;color:white;padding:0.4rem 1rem;border-radius:8px;font-size:0.8rem;z-index:9999;animation:fadeOut 1.5s forwards';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1500);
  });
};
window.renderReferenceTables = renderReferenceTables;
