// parciales.js — Repositorio de parciales resueltos por materia
const PARCIALES_DB = [
  // ═══════════════════════════════════════════════════════
  // ANÁLISIS MATEMÁTICO I
  // ═══════════════════════════════════════════════════════
  {
    id: "am1-2024-1", materia: "Análisis Matemático I", año: 2024, cuatrimestre: "1°", cátedra: "Banegas",
    temas: ["Límites", "Derivadas"], dificultad: "media",
    ejercicios: [
      {
        enunciado: "Calcular: $\\lim_{x\\to 0} \\frac{\\sin(3x)}{x}$",
        pasos: [
          { texto: "Identificamos que es una indeterminación $\\frac{0}{0}$", verificado: true },
          { texto: "Usamos el límite notable: $\\lim_{x\\to 0} \\frac{\\sin(kx)}{x} = k$", verificado: true },
          { texto: "Aplicamos con $k=3$: $\\lim_{x\\to 0} \\frac{\\sin(3x)}{x} = 3$", verificado: true }
        ],
        respuesta_final: "$3$"
      },
      {
        enunciado: "Derivar: $f(x) = e^{x^2} \\cdot \\ln(x)$",
        pasos: [
          { texto: "Identificamos que es producto de dos funciones: $u = e^{x^2}$ y $v = \\ln(x)$", verificado: true },
          { texto: "Derivada de $u$: $u' = 2x \\cdot e^{x^2}$ (regla de la cadena)", verificado: true },
          { texto: "Derivada de $v$: $v' = \\frac{1}{x}$", verificado: true },
          { texto: "Aplicamos regla del producto: $f'(x) = u'v + uv'$", verificado: true },
          { texto: "$f'(x) = 2x \\cdot e^{x^2} \\cdot \\ln(x) + e^{x^2} \\cdot \\frac{1}{x}$", verificado: true },
          { texto: "Factorizamos: $f'(x) = e^{x^2}\\left(2x\\ln(x) + \\frac{1}{x}\\right)$", verificado: true }
        ],
        respuesta_final: "$f'(x) = e^{x^2}\\left(2x\\ln(x) + \\frac{1}{x}\\right)$"
      },
      {
        enunciado: "Calcular: $\\int x \\cdot e^x \\, dx$",
        pasos: [
          { texto: "Identificamos que conviene integración por partes", verificado: true },
          { texto: "Elegimos: $u = x$, $dv = e^x dx$", verificado: true },
          { texto: "Entonces: $du = dx$, $v = e^x$", verificado: true },
          { texto: "Fórmula: $\\int u \\, dv = uv - \\int v \\, du$", verificado: true },
          { texto: "$= x \\cdot e^x - \\int e^x \\, dx$", verificado: true },
          { texto: "$= x \\cdot e^x - e^x + C = e^x(x-1) + C$", verificado: true }
        ],
        respuesta_final: "$e^x(x-1) + C$"
      }
    ],
    errores_comunes: [
      "Olvidar la constante $+C$ en integrales",
      "Confundir $\\lim_{x\\to 0} \\frac{\\sin x}{x} = 1$ con $\\lim_{x\\to 0} \\frac{\\sin x}{x^2} = \\infty$",
      "No aplicar regla de la cadena en derivadas compuestas",
      "Signo incorrecto en integración por partes"
    ]
  },
  {
    id: "am1-2023-2", materia: "Análisis Matemático I", año: 2023, cuatrimestre: "2°", cátedra: "Banegas",
    temas: ["Integrales", "Técnicas de integración"], dificultad: "media",
    ejercicios: [
      {
        enunciado: "Calcular: $\\int \\frac{1}{x^2 + 1} \\, dx$",
        pasos: [
          { texto: "Reconocemos la forma estándar: $\\int \\frac{1}{x^2+a^2} dx = \\frac{1}{a}\\arctan(\\frac{x}{a}) + C$", verificado: true },
          { texto: "Con $a=1$: $\\int \\frac{1}{x^2+1} dx = \\arctan(x) + C$", verificado: true }
        ],
        respuesta_final: "$\\arctan(x) + C$"
      },
      {
        enunciado: "Calcular: $\\int_0^1 x^2 \\cdot e^x \\, dx$",
        pasos: [
          { texto: "Integración por partes dos veces", verificado: true },
          { texto: "Primera vez: $u=x^2$, $dv=e^x dx$ → $2xe^x - \\int 2e^x dx$", verificado: true },
          { texto: "Segunda vez: $\\int 2e^x dx = 2e^x$", verificado: true },
          { texto: "Resultado indefinido: $e^x(x^2 - 2x + 2) + C$", verificado: true },
          { texto: "Evaluamos de 0 a 1: $e(1-2+2) - e^0(0-0+2) = e - 2$", verificado: true }
        ],
        respuesta_final: "$e - 2 \\approx 0.718$"
      }
    ],
    errores_comunes: [
      "No recordar las fórmulas de integrales notables",
      "Aplicar partes con $u$ y $dv$ que compliquen más",
      "Olvidar evaluar los límites de integración"
    ]
  },

  // ═══════════════════════════════════════════════════════
  // ÁLGEBRA LINEAL
  // ═══════════════════════════════════════════════════════
  {
    id: "alg-2024-1", materia: "Álgebra Lineal", año: 2024, cuatrimestre: "1°", cátedra: "García",
    temas: ["Determinantes", "Autovalores"], dificultad: "media",
    ejercicios: [
      {
        enunciado: "Calcular el determinante: $\\det\\begin{pmatrix} 3 & 1 & 0 \\\\ 0 & 2 & 1 \\\\ 1 & 0 & 3 \\end{pmatrix}$",
        pasos: [
          { texto: "Usamos expansión por la primera fila", verificado: true },
          { texto: "$= 3 \\cdot \\det\\begin{pmatrix} 2 & 1 \\\\ 0 & 3 \\end{pmatrix} - 1 \\cdot \\det\\begin{pmatrix} 0 & 1 \\\\ 1 & 3 \\end{pmatrix} + 0$", verificado: true },
          { texto: "$= 3(6-0) - 1(0-1) = 18 + 1 = 19$", verificado: true }
        ],
        respuesta_final: "$19$"
      },
      {
        enunciado: "Encontrar autovalores de $A = \\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}$",
        pasos: [
          { texto: "Plantear $\\det(A - \\lambda I) = 0$", verificado: true },
          { texto: "$\\det\\begin{pmatrix} 4-\\lambda & 1 \\\\ 2 & 3-\\lambda \\end{pmatrix} = 0$", verificado: true },
          { texto: "$(4-\\lambda)(3-\\lambda) - 2 = 0$", verificado: true },
          { texto: "$\\lambda^2 - 7\\lambda + 10 = 0$", verificado: true },
          { texto: "$\\lambda = \\frac{7 \\pm \\sqrt{49-40}}{2} = \\frac{7 \\pm 3}{2}$", verificado: true },
          { texto: "$\\lambda_1 = 5$, $\\lambda_2 = 2$", verificado: true }
        ],
        respuesta_final: "$\\lambda_1 = 5$, $\\lambda_2 = 2$"
      }
    ],
    errores_comunes: [
      "Cambiar signos al expandir por cofactores",
      "Olvidar que $\\det(AB) = \\det(A)\\det(B)$",
      "Confundir autovalores con autovectores",
      "No verificar: $Av = \\lambda v$"
    ]
  },
  {
    id: "alg-2023-2", materia: "Álgebra Lineal", año: 2023, cuatrimestre: "2°", cátedra: "García",
    temas: ["Espacios vectoriales", "Transformaciones lineales"], dificultad: "alta",
    ejercicios: [
      {
        enunciado: "¿Es lineal $T: \\mathbb{R}^2 \\to \\mathbb{R}^2$ definida por $T(x,y) = (x+y, xy)$?",
        pasos: [
          { texto: "Verificar: $T(\\alpha u + \\beta v) = \\alpha T(u) + \\beta T(v)$", verificado: true },
          { texto: "Probamos con $\\alpha = 2$, $u=(1,0)$, $v=(0,1)$:", verificado: true },
          { texto: "$T(2(1,0) + 2(0,1)) = T(2,2) = (4, 4)$", verificado: true },
          { texto: "$2T(1,0) + 2T(0,1) = 2(1,0) + 2(1,0) = (4, 0)$", verificado: true },
          { texto: "$(4,4) \\neq (4,0)$ → No es lineal", verificado: true }
        ],
        respuesta_final: "No es lineal (el producto $xy$ rompe la linealidad)"
      }
    ],
    errores_comunes: [
      "Asumir que toda transformación es lineal",
      "No verificar con contrejemplos",
      "Confundir $T(x+y)$ con $T(x) + T(y)$ (solo vale para lineales)"
    ]
  },

  // ═══════════════════════════════════════════════════════
  // FÍSICA I
  // ═══════════════════════════════════════════════════════
  {
    id: "fis1-2024-1", materia: "Física I", año: 2024, cuatrimestre: "1°", cátedra: "Balseiro",
    temas: ["Dinámica", "Plano inclinado"], dificultad: "media",
    ejercicios: [
      {
        enunciado: "Un bloque de 5 kg está en un plano inclinado a 30°. Coeficiente de fricción $\\mu = 0.2$. Calcular la aceleración.",
        pasos: [
          { texto: "Identificar fuerzas: peso ($mg$), normal ($N$), fricción ($f$)", verificado: true },
          { texto: "Descomponer peso: $mg\\sin(30°)$ paralelo, $mg\\cos(30°)$ perpendicular", verificado: true },
          { texto: "$N = mg\\cos(30°) = 5 \\cdot 9.8 \\cdot 0.866 = 42.4$ N", verificado: true },
          { texto: "$f = \\mu N = 0.2 \\cdot 42.4 = 8.48$ N", verificado: true },
          { texto: "Fuerza neta: $F_{\\text{net}} = mg\\sin(30°) - f = 24.5 - 8.48 = 16.02$ N", verificado: true },
          { texto: "$a = \\frac{F_{\\text{net}}}{m} = \\frac{16.02}{5} = 3.2$ m/s²", verificado: true }
        ],
        respuesta_final: "$a = 3.2$ m/s² (hacia abajo del plano)"
      }
    ],
    errores_comunes: [
      "No descomponer el peso en componentes",
      "Confundir $\\sin$ con $\\cos$ al descomponer",
      "Olvidar que la fricción se opone al movimiento",
      "Usar $g = 10$ cuando el enunciado dice $g = 9.8$"
    ]
  },
  {
    id: "fis1-2023-2", materia: "Física I", año: 2023, cuatrimestre: "2°", cátedra: "Balseiro",
    temas: ["Choques", "Conservación del momento"], dificultad: "alta",
    ejercicios: [
      {
        enunciado: "Dos masas: $m_1 = 3$ kg con $v_1 = 5$ m/s y $m_2 = 2$ kg en reposo. Choque elástico 1D. Velocidades finales.",
        pasos: [
          { texto: "Conservación del momento: $m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'$", verificado: true },
          { texto: "$3(5) + 2(0) = 3v_1' + 2v_2'$ → $15 = 3v_1' + 2v_2'$", verificado: true },
          { texto: "Choque elástico: $v_1 - v_2 = -(v_1' - v_2')$", verificado: true },
          { texto: "$5 - 0 = v_2' - v_1'$ → $v_2' = v_1' + 5$", verificado: true },
          { texto: "Sustituir: $15 = 3v_1' + 2(v_1'+5) = 5v_1' + 10$", verificado: true },
          { texto: "$v_1' = 1$ m/s, $v_2' = 6$ m/s", verificado: true }
        ],
        respuesta_final: "$v_1' = 1$ m/s, $v_2' = 6$ m/s"
      }
    ],
    errores_comunes: [
      "No distinguir choque elástico (conserva $KE$) de inelástico",
      "Olvidar que en 1D el choque elástico tiene fórmula directa",
      "Confundir momento con energía cinética"
    ]
  },

  // ═══════════════════════════════════════════════════════
  // QUÍMICA GENERAL
  // ═══════════════════════════════════════════════════════
  {
    id: "qui-2024-1", materia: "Química General", año: 2024, cuatrimestre: "1°", cátedra: "Rodríguez",
    temas: ["Estequiometría", "Moles"], dificultad: "baja",
    ejercicios: [
      {
        enunciado: "¿Cuántos gramos de $NaOH$ se necesitan para preparar 500 mL de solución 0.2 M?",
        pasos: [
          { texto: "Calcular moles: $n = M \\times V = 0.2 \\times 0.5 = 0.1$ mol", verificado: true },
          { texto: "Masa molar de $NaOH$: $23 + 16 + 1 = 40$ g/mol", verificado: true },
          { texto: "$m = n \\times M_m = 0.1 \\times 40 = 4$ g", verificado: true }
        ],
        respuesta_final: "$4$ g de $NaOH$"
      }
    ],
    errores_comunes: [
      "No convertir mL a L",
      "Usar masa molecular incorrecta",
      "Confundir molaridad con molalidad"
    ]
  },

  // ═══════════════════════════════════════════════════════
  // PROGRAMACIÓN
  // ═══════════════════════════════════════════════════════
  {
    id: "prog-2024-1", materia: "Programación", año: 2024, cuatrimestre: "1°", cátedra: "Sorinas",
    temas: ["Algoritmos", "Estructuras de control"], dificultad: "baja",
    ejercicios: [
      {
        enunciado: "Escribir una función en Python que determine si un número es primo.",
        pasos: [
          { texto: "Un número primo solo es divisible por 1 y por sí mismo", verificado: true },
          { texto: "Si $n < 2$, no es primo", verificado: true },
          { texto: "Solo necesitamos verificar hasta $\\sqrt{n}$", verificado: true },
          { texto: "Código:", verificado: true },
          { texto: "```python\ndef es_primo(n):\n    if n < 2: return False\n    for i in range(2, int(n**0.5)+1):\n        if n % i == 0: return False\n    return True\n```", verificado: true }
        ],
        respuesta_final: "Ver código arriba"
      }
    ],
    errores_comunes: [
      "No manejar el caso $n < 2",
      "Iterar hasta $n$ en vez de $\\sqrt{n}$ (ineficiente)",
      "Olvidar que 2 es primo",
      "Usar `=` en vez de `==` en la comparación"
    ]
  }
];

// ═══════════════════════════════════════════════════════
// UI: Repositorio de Parciales
// ═══════════════════════════════════════════════════════
function renderParciales() {
  const container = document.getElementById("parciales-content");
  if (!container) return;

  const materias = [...new Set(PARCIALES_DB.map(p => p.materia))];
  const DiffBadge = d => {
    const colors = { baja: "#22c55e", media: "#f59e0b", alta: "#ef4444" };
    return `<span style="display:inline-block;padding:0.1rem 0.4rem;border-radius:10px;font-size:0.58rem;font-weight:700;background:${colors[d]}20;color:${colors[d]};border:1px solid ${colors[d]}40">${d}</span>`;
  };

  container.innerHTML = `
    <div style="max-width:800px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:1rem">
        <button onclick="switchView('herramientas')" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.6rem;cursor:pointer;font-size:0.7rem;color:var(--text-muted)">← Herramientas</button>
        <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin:0">📄 Parciales Resueltos</h2>
      </div>
      <p style="color:var(--text-muted);font-size:0.75rem;margin-bottom:1rem">Parciales de UBA/CBC con resolución paso a paso. Elegí una materia.</p>

      <!-- Tabs de materia -->
      <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:1rem">
        <button onclick="window._parcMateria=''" class="parc-tab ${!window._parcMateria?'active':''}" style="padding:0.3rem 0.7rem;border-radius:20px;border:1px solid ${!window._parcMateria?'#8b5cf6':'var(--border-color)'};background:${!window._parcMateria?'#8b5cf6':'var(--bg-card)'};color:${!window._parcMateria?'white':'var(--text-muted)'};font-size:0.68rem;cursor:pointer;font-weight:600">Todas</button>
        ${materias.map(m => `
          <button onclick="window._parcMateria='${m.replace(/'/g,"\\'")}';renderParciales()" class="parc-tab" style="padding:0.3rem 0.7rem;border-radius:20px;border:1px solid ${window._parcMateria===m?'#8b5cf6':'var(--border-color)'};background:${window._parcMateria===m?'#8b5cf6':'var(--bg-card)'};color:${window._parcMateria===m?'white':'var(--text-muted)'};font-size:0.68rem;cursor:pointer;font-weight:600">${m}</button>
        `).join("")}
      </div>

      <!-- Lista de parciales -->
      <div style="display:flex;flex-direction:column;gap:0.5rem" id="parc-list">
        ${PARCIALES_DB.filter(p => !window._parcMateria || p.materia === window._parcMateria).map(p => `
          <div onclick="window._parcOpen='${p.id}';renderParciales()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem 0.9rem;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='#8b5cf640'" onmouseout="this.style.borderColor='var(--border-color)'">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.3rem">
              <div style="display:flex;align-items:center;gap:0.4rem">
                <span style="font-size:0.78rem;font-weight:700;color:var(--text-primary)">${p.materia}</span>
                ${DiffBadge(p.dificultad)}
              </div>
              <span style="font-size:0.62rem;color:var(--text-muted)">${p.año} · ${p.cuatrimestre}°C · ${p.cátedra}</span>
            </div>
            <div style="display:flex;gap:0.3rem;flex-wrap:wrap">
              ${p.temas.map(t => `<span style="font-size:0.58rem;padding:0.1rem 0.4rem;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:6px;color:#8b5cf6">${t}</span>`).join("")}
              <span style="font-size:0.58rem;color:var(--text-muted)">${p.ejercicios.length} ej</span>
            </div>

            ${window._parcOpen === p.id ? `
            <div style="margin-top:0.7rem;border-top:1px solid var(--border-color);padding-top:0.7rem">
              ${p.ejercicios.map((ej, ei) => `
                <div style="margin-bottom:0.8rem;padding:0.6rem;background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px">
                  <div style="font-size:0.75rem;font-weight:700;color:var(--text-primary);margin-bottom:0.4rem">Ejercicio ${ei+1}</div>
                  <div style="font-size:0.72rem;color:var(--text-primary);margin-bottom:0.5rem;line-height:1.6">${ej.enunciado}</div>

                  <!-- Pasos colapsables -->
                  <div onclick="event.stopPropagation()" id="ej-pasos-${p.id}-${ei}" style="display:none">
                    <div style="font-size:0.68rem;font-weight:600;color:#8b5cf6;margin-bottom:0.3rem">Resolución paso a paso:</div>
                    ${ej.pasos.map((pa, pi) => `
                      <div style="display:flex;gap:0.4rem;align-items:flex-start;margin-bottom:0.25rem;padding:0.3rem 0.4rem;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.15);border-radius:6px">
                        <span style="color:#22c55e;font-size:0.7rem;flex-shrink:0">✓</span>
                        <span style="font-size:0.68rem;color:var(--text-primary);line-height:1.5">${pa.texto}</span>
                      </div>
                    `).join("")}
                    <div style="margin-top:0.4rem;padding:0.4rem 0.6rem;background:linear-gradient(135deg,rgba(139,92,246,0.1),rgba(59,130,246,0.08));border:1px solid rgba(139,92,246,0.25);border-radius:8px;font-size:0.72rem;font-weight:700;color:#8b5cf6">
                      Respuesta: ${ej.respuesta_final}
                    </div>
                  </div>

                  <!-- Errores comunes -->
                  ${p.errores_comunes.length > 0 ? `
                  <div onclick="event.stopPropagation()" id="ej-errores-${p.id}-${ei}" style="display:none;margin-top:0.4rem">
                    <div style="font-size:0.68rem;font-weight:600;color:#ef4444;margin-bottom:0.3rem">⚠ Errores comunes:</div>
                    ${p.errores_comunes.map(er => `
                      <div style="display:flex;gap:0.3rem;align-items:flex-start;margin-bottom:0.2rem;padding:0.25rem 0.4rem;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:6px">
                        <span style="color:#ef4444;font-size:0.65rem;flex-shrink:0">✗</span>
                        <span style="font-size:0.65rem;color:var(--text-primary)">${er}</span>
                      </div>
                    `).join("")}
                  </div>
                  ` : ''}

                  <div style="display:flex;gap:0.3rem;margin-top:0.4rem" onclick="event.stopPropagation()">
                    <button onclick="toggleEl('ej-pasos-${p.id}-${ei}')" style="padding:0.2rem 0.5rem;background:rgba(139,92,246,0.1);color:#8b5cf6;border:1px solid rgba(139,92,246,0.25);border-radius:6px;font-size:0.62rem;cursor:pointer;font-weight:600">Ver pasos</button>
                    ${p.errores_comunes.length > 0 ? `<button onclick="toggleEl('ej-errores-${p.id}-${ei}')" style="padding:0.2rem 0.5rem;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.25);border-radius:6px;font-size:0.62rem;cursor:pointer;font-weight:600">Errores</button>` : ''}
                    <button onclick="switchView('chat');const ci=document.getElementById('chatInput');ci.value='Explica este ejercicio: ${ej.enunciado.replace(/'/g,"\\'").replace(/\$/g,"\\$")}';ci.focus()" style="padding:0.2rem 0.5rem;background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid rgba(59,130,246,0.25);border-radius:6px;font-size:0.62rem;cursor:pointer;font-weight:600">Pedir explicación</button>
                  </div>
                </div>
              `).join("")}
            </div>
            ` : ''}
          </div>
        `).join("")}
      </div>

      <!-- Links útiles -->
      <div style="margin-top:1.5rem;padding:0.8rem;background:linear-gradient(135deg,rgba(139,92,246,0.06),rgba(59,130,246,0.04));border:1px solid rgba(139,92,246,0.15);border-radius:10px">
        <div style="font-size:0.72rem;font-weight:700;color:var(--text-primary);margin-bottom:0.4rem">📚 Repositorios externos</div>
        <div style="display:flex;flex-direction:column;gap:0.25rem">
          <a href="https://www.altillo.com/examenes/uba/cbc/" target="_blank" style="font-size:0.68rem;color:#8b5cf6;text-decoration:none;display:flex;align-items:center;gap:0.3rem">→ Altillo - Parciales CBC</a>
          <a href="https://www.altillo.com/examenes/uba/ingenieria/" target="_blank" style="font-size:0.68rem;color:#8b5cf6;text-decoration:none;display:flex;align-items:center;gap:0.3rem">→ Altillo - Parciales Ingeniería</a>
          <a href="https://comunidad-fiuba.github.io/" target="_blank" style="font-size:0.68rem;color:#8b5cf6;text-decoration:none;display:flex;align-items:center;gap:0.3rem">→ Comunidad FIUBA - Resueltos</a>
        </div>
      </div>
    </div>
  `;
}

function toggleEl(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === "none" ? "block" : "none";
}

window.renderParciales = renderParciales;
window.toggleEl = toggleEl;
window._parcMateria = "";
window._parcOpen = null;
