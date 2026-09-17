// biblioteca-tiza.js — CBC UBA: materias reales, parciales, plan de estudio

const BIBLIC_TIZA = {
  currentView: "home",
  currentSubject: null,
  currentUnit: null
};

// ═══════════════════════════════════════════════════════
// DATA: Materias reales del CBC Ingeniería
// ═══════════════════════════════════════════════════════
const BIBLIC_MATERIAS = [
  {
    id: "am1", name: "Análisis Matemático I", color: "#3b82f6", icon: "∫",
    desc: "Funciones, límites, derivadas e integrales",
    altillo: "https://www.altillo.com/examenes/uba/cbc/analisis/",
    units: [
      {
        id: "funciones", name: "Funciones y dominio",
        idea: "Una función asigna a cada elemento del dominio exactamente uno del codominio.",
        teoria: `## Funciones

**Definición:** $f: A \\to B$ asigna a cada $x \\in A$ un único $y \\in B$.

**Dominio:** conjunto de donde salen los $x$ (cuidado con divisiones por cero, raíces pares, logaritmos).

**Gráficas notables:**
- Lineal: $f(x) = mx + b$
- Cuadrática: $f(x) = ax^2 + bx + c$
- Exponencial: $f(x) = a^x$
- Logarítmica: $f(x) = \\log_a(x)$
- Trigonométricas: $\\sin, \\cos, \\tan$`,
        errores: [
          "No calcular el dominio antes de resolver",
          "Confundir $\\log(x)$ (base $e$) con $\\ln(x)$",
          "Olvidar que $\\tan(x)$ no está definida en $x = \\frac{\\pi}{2} + k\\pi$"
        ],
        ejercicios: [
          {
            titulo: "Dominio de función",
            enunciado: "Calcular el dominio de $f(x) = \\sqrt{\\frac{x-1}{x+2}}$",
            solucion: [
              "Raíz cuadrada: el argumento debe ser $\\geq 0$",
              "$\\frac{x-1}{x+2} \\geq 0$",
              "Analizar signos: $x \\geq 1$ o $x < -2$",
              "Dominio: $(-\\infty, -2) \\cup [1, +\\infty)$"
            ]
          }
        ]
      },
      {
        id: "limites", name: "Límites",
        idea: "Un límite es el valor que se aproxima una función SIN llegar a llegar.",
        teoria: `## Límites

**Definición informal:** $\\lim_{x \\to a} f(x) = L$ cuando los valores de $f(x)$ se acercan a $L$.

**Límites notables:**
$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$
$$\\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x = e$$
$$\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$$

**Reglas:**
- $\\lim(f \\pm g) = \\lim f \\pm \\lim g$
- $\\lim(f \\cdot g) = \\lim f \\cdot \\lim g$
- $\\lim\\frac{f}{g} = \\frac{\\lim f}{\\lim g}$ (si $\\lim g \\neq 0$)

**Indeterminaciones:** $\\frac{0}{0}$, $\\frac{\\infty}{\\infty}$, $0 \\cdot \\infty$, $\\infty - \\infty$, $1^\\infty$, $0^0$, $\\infty^0$

**L'Hôpital:** Si hay indeterminación $\\frac{0}{0}$ o $\\frac{\\infty}{\\infty}$:
$$\\lim \\frac{f(x)}{g(x)} = \\lim \\frac{f'(x)}{g'(x)}$$`,
        errores: [
          "No verificar si hay indeterminación antes de reemplazar",
          "Olvidar que L'Hôpital solo aplica para $\\frac{0}{0}$ o $\\frac{\\infty}{\\infty}$",
          "Confundir $\\lim_{x\\to 0} \\frac{\\sin x}{x} = 1$ con $\\lim_{x\\to 0} \\frac{\\sin x}{x^2} = \\infty$"
        ],
        ejercicios: [
          {
            titulo: "Límite con seno",
            enunciado: "$$\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$$",
            solucion: [
              "Reconocemos la forma $\\frac{\\sin(kx)}{x}$",
              "Sabemos que $\\lim_{x \\to 0} \\frac{\\sin(kx)}{x} = k$",
              "Con $k = 3$: resultado = $3$"
            ]
          },
          {
            titulo: "L'Hôpital",
            enunciado: "$$\\lim_{x \\to 0} \\frac{e^x - 1}{x}$$",
            solucion: [
              "Reemplazamos: $\\frac{e^0 - 1}{0} = \\frac{0}{0}$ → indeterminación",
              "Aplicamos L'Hôpital: $\\lim \\frac{e^x}{1} = e^0 = 1$",
              "Resultado: $1$"
            ]
          }
        ]
      },
      {
        id: "derivadas", name: "Derivadas",
        idea: "La derivada es la pendiente de la tangente: qué tan rápido cambia la función.",
        teoria: `## Derivadas

**Definición:**
$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

**Derivadas notables:**
| Función | Derivada |
|---------|----------|
| $c$ | $0$ |
| $x^n$ | $nx^{n-1}$ |
| $e^x$ | $e^x$ |
| $\\ln x$ | $\\frac{1}{x}$ |
| $\\sin x$ | $\\cos x$ |
| $\\cos x$ | $-\\sin x$ |

**Reglas:**
- **Suma:** $(f+g)' = f' + g'$
- **Producto:** $(fg)' = f'g + fg'$
- **Cociente:** $\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$
- **Cadena:** $(f(g(x)))' = f'(g(x)) \\cdot g'(x)$`,
        errores: [
          "Olvidar la regla de la cadena en funciones compuestas",
          "Confundir $(fg)'$ con $f'g'$ (NO es producto de derivadas)",
          "Error de signo en derivada de $\\cos x$"
        ],
        ejercicios: [
          {
            titulo: "Regla del producto",
            enunciado: "$$f(x) = e^{x^2} \\cdot \\ln(x) \\quad \\Rightarrow \\quad f'(x) = \\text{?}$$",
            solucion: [
              "$u = e^{x^2}$, $v = \\ln(x)$",
              "$u' = 2x \\cdot e^{x^2}$ (cadena)",
              "$v' = \\frac{1}{x}$",
              "$f'(x) = 2x \\cdot e^{x^2} \\cdot \\ln(x) + e^{x^2} \\cdot \\frac{1}{x}$",
              "$= e^{x^2}\\left(2x\\ln(x) + \\frac{1}{x}\\right)$"
            ]
          }
        ]
      },
      {
        id: "integrales", name: "Integrales",
        idea: "La integral es la suma infinita: acumular cambios para obtener el total.",
        teoria: `## Integrales

**Integral definida:**
$$\\int_a^b f(x) \\, dx = F(b) - F(a)$$

**Teorema Fundamental del Cálculo:** La integral y la derivada son operaciones inversas.

**Integrales notables:**
$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$$
$$\\int \\frac{1}{x} \\, dx = \\ln|x| + C$$
$$\\int e^x \\, dx = e^x + C$$
$$\\int \\sin x \\, dx = -\\cos x + C$$

**Técnicas:**
- **Sustitución:** $\\int f(g(x))g'(x)dx = \\int f(u)du$
- **Partes:** $\\int u \\, dv = uv - \\int v \\, du$`,
        errores: [
          "Olvidar la constante $+C$ en integrales indefinidas",
          "Confundir $\\int \\frac{1}{x} dx$ con $\\ln(x)$ (falta valor absoluto)",
          "Error de signo en integrales por partes"
        ],
        ejercicios: [
          {
            titulo: "Integración por partes",
            enunciado: "$$\\int x \\cdot e^x \\, dx$$",
            solucion: [
              "$u = x$, $dv = e^x dx$",
              "$du = dx$, $v = e^x$",
              "$= x \\cdot e^x - \\int e^x dx$",
              "$= x \\cdot e^x - e^x + C = e^x(x-1) + C$"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "algebra", name: "Álgebra", color: "#8b5cf6", icon: "⊞",
    desc: "Sistemas lineales, matrices y determinantes",
    altillo: "https://www.altillo.com/examenes/uba/cbc/algebra/",
    units: [
      {
        id: "sistemas", name: "Sistemas de ecuaciones",
        idea: "Un sistema es varias ecuaciones con varias incógnitas que se resuelven juntas.",
        teoria: `## Sistemas lineales

**Método de sustitución:** despejar una variable y reemplazar.

**Método de Gauss:** reducir la matriz aumentada a escalaón.

**Método de Cramer:**
$$x_i = \\frac{\\det(A_i)}{\\det(A)}$$
(solo si $\\det(A) \\neq 0$)

**Clasificación:**
- Determinado: solución única
- Indeterminado: infinitas soluciones
- Incompatible: sin solución`,
        errores: [
          "No verificar si $\\det(A) = 0$ antes de usar Cramer",
          "Cambiar signos al usar Gauss",
          "No reemplazar para comprobar la solución"
        ],
        ejercicios: [
          {
            titulo: "Sistema 2×2",
            enunciado: "$$\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}$$",
            solucion: [
              "Sumamos las ecuaciones: $3x = 6$ → $x = 2$",
              "Reemplazamos: $2(2) + y = 5$ → $y = 1$",
              "Solución: $(2, 1)$"
            ]
          }
        ]
      },
      {
        id: "matrices", name: "Matrices",
        idea: "Una matriz es una tabla de números que representa una transformación lineal.",
        teoria: `## Matrices

**Operaciones:**
- Suma: componente a componente
- Producto: filas por columnas
- $A \\cdot B \\neq B \\cdot A$ (en general)

**Inversa:** $A \\cdot A^{-1} = I$

**Para 2×2:**
$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$$`,
        errores: [
          "Confundir el orden al multiplicar matrices",
          "Olvidar que $AB \\neq BA$",
          "No verificar que el determinante sea distinto de cero para la inversa"
        ],
        ejercicios: [
          {
            titulo: "Inversa 2×2",
            enunciado: "$$A = \\begin{pmatrix} 3 & 1 \\\\ 5 & 2 \\end{pmatrix} \\quad \\Rightarrow \\quad A^{-1} = \\text{?}$$",
            solucion: [
              "$\\det(A) = 3(2) - 1(5) = 1$",
              "$A^{-1} = \\frac{1}{1}\\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}$",
              "$= \\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}$"
            ]
          }
        ]
      },
      {
        id: "determinantes", name: "Determinantes",
        idea: "El determinante mide cuánto una transformación escala el espacio.",
        teoria: `## Determinantes

**Determinante 2×2:**
$$\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$$

**Determinante 3×3 (regla de Sarrus):**
$$\\det\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix} = aei + bfg + cdh - ceg - afh - bdi$$

**Propiedades:**
- $\\det(AB) = \\det(A) \\cdot \\det(B)$
- $\\det(A^T) = \\det(A)$
- $\\det(A) = 0 \\Leftrightarrow A$ es singular`,
        errores: [
          "Cambiar signos al calcular cofactores",
          "No recordar que $\\det(AB) = \\det(A)\\det(B)$",
          "Confundir filas con columnas"
        ],
        ejercicios: [
          {
            titulo: "Determinante 3×3",
            enunciado: "$$\\det\\begin{pmatrix} 3 & 1 & 0 \\\\ 0 & 2 & 1 \\\\ 1 & 0 & 3 \\end{pmatrix}$$",
            solucion: [
              "Regla de Sarrus:",
              "$= 3 \\cdot 2 \\cdot 3 + 1 \\cdot 1 \\cdot 1 + 0 \\cdot 0 \\cdot 0 - 0 \\cdot 2 \\cdot 1 - 1 \\cdot 1 \\cdot 3 - 3 \\cdot 0 \\cdot 0$",
              "$= 18 + 1 + 0 - 0 - 3 - 0 = 16$"
            ]
          }
        ]
      },
      {
        id: "vectores", name: "Vectores y espacios",
        idea: "Los vectores son flechas en el espacio que se pueden sumar y escalar.",
        teoria: `## Vectores

**Operaciones:**
- $\\vec{u} + \\vec{v} = (u_1+v_1, u_2+v_2, u_3+v_3)$
- $k\\vec{u} = (ku_1, ku_2, ku_3)$

**Producto punto:** $\\vec{u} \\cdot \\vec{v} = u_1v_1 + u_2v_2 + u_3v_3 = |\\vec{u}||\\vec{v}|\\cos\\theta$

**Producto cruz:** $\\vec{u} \\times \\vec{v}$ ( perpendicular a ambos)

**Linealidad:** un conjunto de vectores es linealmente dependiente si uno se puede escribir como combinación de los otros.`,
        errores: [
          "Confundir producto punto (escalar) con producto cruz (vector)",
          "No normalizar el vector al calcular el coseno del ángulo",
          "Olvidar que $\\vec{u} \\cdot \\vec{v} = 0$ implica perpendicularidad"
        ],
        ejercicios: [
          {
            titulo: "Ángulo entre vectores",
            enunciado: "$$\\vec{u} = (1,2), \\quad \\vec{v} = (3,1) \\quad \\Rightarrow \\quad \\cos\\theta = \\text{?}$$",
            solucion: [
              "$\\vec{u} \\cdot \\vec{v} = 1(3) + 2(1) = 5$",
              "$|\\vec{u}| = \\sqrt{1+4} = \\sqrt{5}$",
              "$|\\vec{v}| = \\sqrt{9+1} = \\sqrt{10}$",
              "$\\cos\\theta = \\frac{5}{\\sqrt{5}\\sqrt{10}} = \\frac{5}{\\sqrt{50}} = \\frac{\\sqrt{2}}{2}$",
              "$\\theta = 45°$"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "penscomp", name: "Pensamiento Computacional", color: "#f59e0b", icon: "⟨⟩",
    desc: "Lógica, algoritmos y programación básica",
    altillo: "https://www.altillo.com/examenes/uba/cbc/pensamientocomputacional/",
    units: [
      {
        id: "logica", name: "Lógica proposicional",
        idea: "La lógica es el arte de razonar: de premisas verdaderas solo se siguen conclusiones verdaderas.",
        teoria: `## Lógica

**Proposiciones:** oraciones que pueden ser verdaderas (V) o falsas (F).

**Conectivas:**
| Conectiva | Símbolo | Significado |
|-----------|---------|-------------|
| Negación | $\\neg p$ | "no $p$" |
| Conjunción | $p \\land q$ | "$p$ y $q$" |
| Disyunción | $p \\lor q$ | "$p$ o $q$" |
| Condicional | $p \\to q$ | "si $p$ entonces $q$" |
| Bicondicional | $p \\leftrightarrow q$ | "$p$ si y solo si $q$" |

**Condicional:** $p \\to q$ solo es F cuando $p$ es V y $q$ es F.

**Leyes:**
- Asociativa, conmutativa, distributiva
- De Morgan: $\\neg(p \\land q) = \\neg p \\lor \\neg q$`,
        errores: [
          "Confundir $\\lor$ (o) con $\\land$ (y)",
          "No saber que $p \\to q$ equivale a $\\neg p \\lor q$",
          "Error en tabla de verdad del condicional"
        ],
        ejercicios: [
          {
            titulo: "Tabla de verdad",
            enunciado: "Construir tabla de $p \\to \\neg q$",
            solucion: [
              "| $p$ | $q$ | $\\neg q$ | $p \\to \\neg q$ |",
              "| V | V | F | **F** |",
              "| V | F | V | **V** |",
              "| F | V | F | **V** |",
              "| F | F | V | **V** |"
            ]
          }
        ]
      },
      {
        id: "algoritmos", name: "Algoritmos",
        idea: "Un algoritmo es una receta: una serie de pasos para resolver un problema.",
        teoria: `## Algoritmos

**Estructuras de control:**
- **Secuencia:** pasos en orden
- **Selección:** si/entonces/sino
- **Iteración:** mientras, para

**Pseudocódigo:**
\`\`\`
INICIO
  LEER x
  SI x >= 0 ENTONCES
    IMPRIMIR "positivo"
  SINO
    IMPRIMIR "negativo"
  FIN SI
FIN
\`\`\`

**Complejidad:**
- $O(1)$: constante
- $O(n)$: lineal
- $O(n^2)$: cuadrática`,
        errores: [
          "No manejar casos borde (n=0, n=1)",
          "Confundir selección con iteración",
          "No inicializar variables"
        ],
        ejercicios: [
          {
            titulo: "Suma de pares",
            enunciado: "Algoritmo que sume los números pares del 1 al n",
            solucion: [
              "INICIO",
              "  LEER n",
              "  suma ← 0",
              "  PARA i DESDE 1 HASTA n HACER",
              "    SI i MOD 2 = 0 ENTONCES",
              "      suma ← suma + i",
              "    FIN SI",
              "  FIN PARA",
              "  IMPRIMIR suma",
              "FIN"
            ]
          }
        ]
      },
      {
        id: "pythonesco", name: "Introducción a Python",
        idea: "Python es como hablar: escribís lo que querés que pase.",
        teoria: `## Python básico

**Variables:**
\`\`\`python
x = 10
nombre = "FIUBA"
\`\`\`

**Condicionales:**
\`\`\`python
if x >= 0:
    print("positivo")
else:
    print("negativo")
\`\`\`

**Ciclos:**
\`\`\`python
for i in range(1, 11):
    print(i)

while x > 0:
    x = x - 1
\`\`\`

**Funciones:**
\`\`\`python
def sumar(a, b):
    return a + b
\`\`\``,
        errores: [
          "Usar \`=\` en vez de \`==\` en comparaciones",
          "Olvidar los dos puntos \`:\` después del if/for/while",
          "No indentar correctamente el bloque"
        ],
        ejercicios: [
          {
            titulo: "Número primo",
            enunciado: " función que determine si un número es primo",
            solucion: [
              "def es_primo(n):",
              "    if n < 2:",
              "        return False",
              "    for i in range(2, int(n**0.5) + 1):",
              "        if n % i == 0:",
              "            return False",
              "    return True"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "ipc", name: "Introducción al Pensamiento Científico", color: "#22c55e", icon: "◉",
    desc: "Método científico, experimentación y pensamiento crítico",
    altillo: "https://www.altillo.com/examenes/uba/cbc/pensamiento/",
    units: [
      {
        id: "metodo", name: "El método científico",
        idea: "La ciencia no es una lista de datos: es un proceso para llegar a la verdad.",
        teoria: `## Método científico

**Pasos:**
1. **Observación** del fenómeno
2. **Pregunta** sobre qué lo causa
3. **Hipótesis** (explicación tentativa)
4. **Predicción** (qué debería pasar si la hipótesis es cierta)
5. **Experimentación** (probar la predicción)
6. **Análisis** de resultados
7. **Conclusión** (se acepta o rechaza la hipótesis)

**Pseudociencia:** afirmaciones que parecen científicas pero no siguen el método.`,
        errores: [
          "Confundir correlación con causalidad",
          "Aceptar una hipótesis sin evidencia",
          "No considerar variables de control"
        ],
        ejercicios: [
          {
            titulo: "Identificar variables",
            enunciado: "En un experimento: ¿la luz afecta el crecimiento de plantas?",
            solucion: [
              "**Variable independiente:** cantidad de luz",
              "**Variable dependiente:** altura de la planta",
              "**Variables control:** tipo de tierra, cantidad de agua, temperatura",
              "**Hipótesis:** más luz = más crecimiento",
              "**Predicción:** plantas con más luz crecen más en 2 semanas"
            ]
          }
        ]
      },
      {
        id: "experimentacion", name: "Diseño experimental",
        idea: "Un buen experimento aislA la causa que queremos estudiar.",
        teoria: `## Diseño experimental

**Grupo experimental:** recibe el tratamiento
**Grupo control:** no recibe el tratamiento

**Tipos de errores:**
- **Sesgo de selección:** los grupos no son comparables
- **Efecto Hawthorne:** los sujetos cambian su comportamiento
- ** variable confounding:** una variable extra influye en el resultado

**Estadística descriptiva:**
- Media: $\\bar{x} = \\frac{\\sum x_i}{n}$
- Mediana: valor central
- Moda: valor más frecuente`,
        errores: [
          "No tener grupo control",
          "Muestra demasiado chica",
          "No aleatorizar la asignación"
        ],
        ejercicios: [
          {
            titulo: "Diseñar experimento",
            enunciado: "¿Un nuevo fármaco reduce la presión arterial?",
            solucion: [
              "**Grupo experimental:** pacientes que toman el fármaco",
              "**Grupo control:** pacientes que toman placebo",
              "**Aleatorización:** asignar al azar quién toma qué",
              "**Doble ciego:** ni paciente ni médico saben quién toma qué",
              "**Medir:** presión antes y después"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "socyestado", name: "Sociedad y Estado", color: "#ec4899", icon: "⚖",
    desc: "Estado, derechos, política y sociedad argentina",
    altillo: "https://www.altillo.com/examenes/uba/cbc/socyestado/",
    units: [
      {
        id: "estado", name: "El Estado y su organización",
        idea: "El Estado es el conjunto de instituciones que organizan la vida en común.",
        teoria: `## Estado

**Definición:** institución permanente que ejerce poder sobre un territorio y sus habitantes.

**Poderes del Estado:**
- **Ejecutivo:** administra (Presidente, gobernadores)
- **Legislativo:** hace las leyes (Congreso)
- **Judicial:** resuelve conflictos (jueces)

**Constitución:** ley suprema que organiza el Estado y garantiza derechos.

**Artículo 1:** "La Nación Argentina adopta para su gobierno la forma federal representativa republicana."`,
        errores: [
          "Confundir poder Ejecutivo con Legislativo",
          "No conocer la diferencia entre democracia directa y representativa",
          "Olvidar que la Constitución es la ley suprema"
        ],
        ejercicios: [
          {
            titulo: "Separación de poderes",
            enunciado: "¿Qué poderes limita el/art. 1 de la Constitución?",
            solucion: [
              "El gobierno federal se divide en 3 poderes:",
              "**Ejecutivo:** dirige la administración (Art. 87-99)",
              "**Legislativo:** sanciona leyes (Art. 44-86)",
              "**Judicial:** administra justicia (Art. 108-116)",
              "Se limitan mutuamente para evitar abusos"
            ]
          }
        ]
      },
      {
        id: "derechos", name: "Derechos humanos",
        idea: "Los derechos son garantías que todo ser humano tiene por el solo hecho de existir.",
        teoria: `## Derechos humanos

**Declaración Universal (1948):**
- **Civiles:** vida, libertad, igualdad
- **Políticos:** voto, asociación, expresión
- **Económicos:** trabajo, educación, salud

**Generaciones:**
1. **Primera:** libertades negativas (no interferencia del Estado)
2. **Segunda:** derechos sociales (salud, educación)
3. **Tercera:** derechos colectivos (medio ambiente, paz)

**Principio pro homine:** ante la duda, interpretar a favor de la mayor protección del derecho.`,
        errores: [
          "Confundir derechos con obligaciones",
          "Pensar que los derechos son absolutos (tienen límites)",
          "No conocer la jerarquía de tratados internacionales"
        ],
        ejercicios: [
          {
            titulo: "Clasificar derechos",
            enunciado: "Clasificar: derecho a la educación, a la vida, al voto",
            solucion: [
              "**Derecho a la vida:** civil, primera generación",
              "**Derecho al voto:** político, primera generación",
              "**Derecho a la educación:** social, segunda generación",
              "Todos están en la Constitución argentina (arts. 14, 16, 17)"
            ]
          }
        ]
      },
      {
        id: "politica", name: "Sistema político argentino",
        idea: "La política es la forma en que una sociedad toma decisiones colectivas.",
        teoria: `## Sistema político argentino

**Forma de gobierno:** federal, representativa, republicana

**Elecciones:**
- **Paso (agosto):** elecciones internas
- **Generales (octubre):** Presidente, gobernadores, diputados
- **Ballottage:** si ningún candidato saca +45% o +10% del primero

**Partidos políticos:** agrupaciones que presentan candidatos

**Ciudadanía:** argentinos nativos o naturalizados (mayores de 16, mayores de 18 para votar obligatoriamente)`,
        errores: [
          "Confundir República con Monarquía",
          "No saber cuándo hay ballotaje",
          "Olvidar que la función del Congreso es legislar"
        ],
        ejercicios: [
          {
            titulo: "Ballotaje",
            enunciado: "¿Cuándo se va a ballotaje en Argentina?",
            solucion: [
              "**No hay ballotaje si:** un candidato saca más del 45% de los votos",
              "**Tampoco si:** saca más del 40% y tiene 10 puntos más que el segundo",
              "**Sí hay ballotaje:** si ninguno de esos casos se cumple",
              "Ejemplo: A 42%, B 39% → **ballotaje** (A no tiene +10)"
            ]
          }
        ]
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════
// PARCIALES DATA (parciales reales del Altillo)
// ═══════════════════════════════════════════════════════
const PARCIALES_DATA = {
  am1: [
    { año: 2025, cuat: "1°", cátedra: "Gutiérrez", temas: ["Funciones", "Límites"], ejercicios: [
      { enunciado: "$$\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$$", pasos: ["Es $\\frac{0}{0}$ → usar límite notable","$\\lim \\frac{\\sin(kx)}{x} = k$","Con $k=3$: **respuesta = 3**"], errores: ["No verificar indeterminación","Confundir con $\\frac{\\sin x}{x^2}$"] },
      { enunciado: "Dominio de $f(x) = \\sqrt{\\frac{x-1}{x+2}}$", pasos: ["Raíz cuadrada: argumento $\\geq 0$","$\\frac{x-1}{x+2} \\geq 0$","Dominio: $(-\\infty, -2) \\cup [1, +\\infty)$"], errores: ["No contemplar el caso $x < -2$"] }
    ]},
    { año: 2024, cuat: "2°", cátedra: "Gutiérrez", temas: ["Derivadas", "Integrales"], ejercicios: [
      { enunciado: "$$f(x) = e^{x^2} \\ln(x) \\quad \\Rightarrow \\quad f'(x) = ?$$", pasos: ["Producto: $u=e^{x^2}$, $v=\\ln x$","$u' = 2xe^{x^2}$, $v'=1/x$","$f' = e^{x^2}(2x\\ln x + 1/x)$"], errores: ["Olvidar cadena en $e^{x^2}$","Error de signo"] },
      { enunciado: "$$\\int_0^1 x^2 e^x \\, dx$$", pasos: ["Partes dos veces","$= e^x(x^2-2x+2)\\Big|_0^1$","$= e(1) - 2 = e-2 \\approx 0.718$"], errores: ["No evaluar límites","Error en segunda partes"] }
    ]}
  ],
  algebra: [
    { año: 2025, cuat: "1°", cátedra: "Cátedra Única", temas: ["Sistemas", "Matrices"], ejercicios: [
      { enunciado: "$$\\begin{cases} 2x + y = 5 \\\\ x - y = 1 \\end{cases}$$", pasos: ["Sumamos: $3x = 6$ → $x = 2$","Reemplazamos: $y = 1$","Solución: $(2, 1)$"], errores: ["Error algebraico al sumar"] },
      { enunciado: "$$A = \\begin{pmatrix} 3 & 1 \\\\ 5 & 2 \\end{pmatrix} \\quad \\Rightarrow \\quad A^{-1}$$", pasos: ["$\\det(A) = 6-5 = 1$","$A^{-1} = \\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}$"], errores: ["Olvidar dividir por el determinante","Cambiar signos mal"] }
    ]}
  ],
  penscomp: [
    { año: 2025, cuat: "1°", cátedra: "Méndez", temas: ["Lógica", "Algoritmos"], ejercicios: [
      { enunciado: "Tabla de verdad de $p \\to \\neg q$", pasos: ["Solo es F cuando $p$=V y $\\neg q$=F","Es decir, $p$=V y $q$=V","Todas las demás son V"], errores: ["Confundir condicional con conjunción"] },
      { enunciado: "Algoritmo: ¿es primo n=7?", pasos: ["Verificar divisores de 2 a $\\sqrt{7} \\approx 2.6$","Solo verificar 2: 7 mod 2 = 1 ≠ 0","**7 es primo**"], errores: ["Verificar hasta n en vez de $\\sqrt{n}$"] }
    ]}
  ],
  ipc: [
    { año: 2024, cuat: "1°", cátedra: "Dufour", temas: ["Método científico", "Experimentación"], ejercicios: [
      { enunciado: "Identificar variables: ¿la luz afecta el crecimiento?", pasos: ["Independiente: cantidad de luz","Dependiente: altura de la planta","Control: tierra, agua, temperatura"], errores: ["No identificar variable independiente","Confundir con correlación"] },
      { enunciado: "¿Por qué usar grupo control?", pasos: ["Para aislar el efecto del tratamiento","Sin control: no sabemos si es el tratamiento","Permite descartar efecto placebo"], errores: ["Pensar que el control es innecesario"] }
    ]}
  ],
  socyestado: [
    { año: 2025, cuat: "1°", cátedra: "Bertino", temas: ["Estado", "Derechos"], ejercicios: [
      { enunciado: "¿Qué poderes limita el art. 1 de la Constitución?", pasos: ["Ejecutivo: administra","Legislativo: hace leyes","Judicial: resuelve conflictos","Se limitan mutuamente"], errores: ["Confundir poderes","No mencionar separación"] },
      { enunciado: "¿Cuándo hay ballotaje?", pasos: ["Si nadie saca >45%","Si nadie saca >40% con +10 del segundo","Ejemplo: A 42%, B 39% → ballotaje"], errores: ["Confundir 40% con 45%"] }
    ]}
  ]
};

// ═══════════════════════════════════════════════════════
// KaTeX helper
// ═══════════════════════════════════════════════════════
function btKatex(html) {
  if (typeof katex === "undefined") return html;
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => { try { return katex.renderToString(t.trim(), {displayMode:true,throwOnError:false}); } catch { return "[math]"; } });
  html = html.replace(/\$([^\$\n]+?)\$/g, (_, t) => { try { return katex.renderToString(t.trim(), {displayMode:false,throwOnError:false}); } catch { return "[math]"; } });
  return html;
}

function btMd(text) {
  if (!text) return "";
  let h = text
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")
    .replace(/\*(.+?)\*/g,"<em>$1</em>")
    .replace(/`([^`]+)`/g,"<code style='background:rgba(139,92,246,0.1);padding:0.1rem 0.3rem;border-radius:4px;font-size:0.78rem'>$1</code>")
    .replace(/^## (.+)$/gm,"<h3 style='font-size:0.88rem;font-weight:700;margin:0.8rem 0 0.3rem;color:var(--text-primary)'>$1</h3>")
    .replace(/^### (.+)$/gm,"<h4 style='font-size:0.82rem;font-weight:700;margin:0.6rem 0 0.2rem;color:var(--text-primary)'>$1</h4>")
    .replace(/\n\n/g,"</p><p style='margin:0.3rem 0'>")
    .replace(/\n/g,"<br>");
  h = "<p style='margin:0.3rem 0'>" + h + "</p>";
  return btKatex(h);
}

// ═══════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════
function renderBiblioteca() {
  const el = document.getElementById("biblioteca-view");
  if (!el) return;
  if (BIBLIC_TIZA.currentView === "home") renderHome(el);
  else if (BIBLIC_TIZA.currentView === "subject") renderSubject(el);
  else if (BIBLIC_TIZA.currentView === "unit") renderUnit(el);
  else if (BIBLIC_TIZA.currentView === "parciales") renderParcial(el);
  else if (BIBLIC_TIZA.currentView === "plan") renderPlan(el);
}

function renderHome(el) {
  const saved = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}");
  el.innerHTML = `
    <div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
      <div style="text-align:center;margin-bottom:1.5rem">
        <h1 style="font-family:var(--font-heading);font-size:1.35rem;color:var(--text-primary);margin-bottom:0.2rem">📚 CBC</h1>
        <p style="color:var(--text-muted);font-size:0.78rem">Explicaciones paso a paso · Parciales resueltos · Plan de estudio</p>
      </div>

      <!-- Plan rápido -->
      <div style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(59,130,246,0.05));border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:0.8rem 1rem;margin-bottom:1rem">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
          <span style="font-size:0.85rem">🎯</span>
          <span style="font-size:0.78rem;font-weight:700;color:var(--text-primary)">Plan de estudio</span>
        </div>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center">
          <select id="biblic-plan-subj" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.5rem;font-size:0.7rem;color:var(--text-primary);min-width:140px">
            ${BIBLIC_MATERIAS.map(m => `<option value="${m.id}">${m.name}</option>`).join("")}
          </select>
          <input type="date" id="biblic-plan-date" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.5rem;font-size:0.7rem;color:var(--text-primary)">
          <button onclick="createStudyPlan()" style="padding:0.3rem 0.7rem;background:#8b5cf6;color:white;border:none;border-radius:8px;font-size:0.7rem;font-weight:600;cursor:pointer">Armar</button>
        </div>
      </div>

      <!-- Materias grid -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:0.5rem;margin-bottom:1.2rem">
        ${BIBLIC_MATERIAS.map(m => {
          const exams = PARCIALES_DATA[m.id] || [];
          const savedDate = saved[m.id];
          return `
          <div onclick="BIBLIC_TIZA.currentView='subject';BIBLIC_TIZA.currentSubject='${m.id}';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:0.8rem;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='${m.color}50';this.style.transform='translateY(-1px)'" onmouseout="this.style.borderColor='var(--border-color)';this.style.transform='none'">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem">
              <div style="width:36px;height:36px;border-radius:9px;background:${m.color}18;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:${m.color};border:1px solid ${m.color}30">${m.icon}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:0.8rem;font-weight:700;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.name}</div>
                <div style="font-size:0.62rem;color:var(--text-muted)">${m.units.length} unidades · ${exams.length} parciales</div>
              </div>
            </div>
            ${savedDate ? `<div style="font-size:0.58rem;color:#f59e0b;margin-top:0.2rem">📅 ${savedDate}</div>` : ''}
          </div>`;
        }).join("")}
      </div>

      <!-- Parciales recientes -->
      <div style="margin-bottom:1.2rem">
        <h3 style="font-size:0.85rem;font-weight:700;color:var(--text-primary);margin-bottom:0.5rem">📄 Parciales recientes</h3>
        <div style="display:flex;flex-direction:column;gap:0.35rem">
          ${Object.entries(PARCIALES_DATA).flatMap(([mid, exams]) => {
            const mat = BIBLIC_MATERIAS.find(m => m.id === mid);
            if (!mat) return [];
            return exams.map((ex, i) => `
              <div onclick="BIBLIC_TIZA.currentView='parciales';BIBLIC_TIZA.currentSubject='${mid}';window._parcIdx=${i};renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.55rem 0.7rem;cursor:pointer;display:flex;align-items:center;justify-content:space-between;transition:border-color 0.15s" onmouseover="this.style.borderColor='${mat.color}40'" onmouseout="this.style.borderColor='var(--border-color)'">
                <div style="display:flex;align-items:center;gap:0.4rem">
                  <div style="width:6px;height:6px;border-radius:50%;background:${mat.color};flex-shrink:0"></div>
                  <span style="font-size:0.72rem;font-weight:600;color:var(--text-primary)">${mat.name}</span>
                  <span style="font-size:0.6rem;color:var(--text-muted)">${ex.año} · ${ex.cátedra}</span>
                </div>
                <div style="display:flex;gap:0.2rem">${ex.temas.map(t => `<span style="font-size:0.52rem;padding:0.08rem 0.3rem;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:4px;color:#8b5cf6">${t}</span>`).join("")}</div>
              </div>
            `);
          }).join("")}
        </div>
      </div>

      <!-- Repositorio -->
      <div style="padding:0.7rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px">
        <div style="font-size:0.72rem;font-weight:700;color:var(--text-primary);margin-bottom:0.3rem">📂 Repositorios</div>
        <div style="display:flex;flex-direction:column;gap:0.2rem">
          ${BIBLIC_MATERIAS.map(m => `
            <a href="${m.altillo}" target="_blank" style="font-size:0.68rem;color:${m.color};text-decoration:none;display:flex;align-items:center;gap:0.3rem" onclick="event.stopPropagation()">
              → <span style="font-weight:600">${m.name}</span> <span style="color:var(--text-muted);font-weight:400">— Altillo</span>
            </a>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  renderMath(el);
}

function renderSubject(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  if (!mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }
  const saved = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}");

  el.innerHTML = `
    <div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem">
        <button onclick="BIBLIC_TIZA.currentView='home';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← CBC</button>
        <div style="width:30px;height:30px;border-radius:8px;background:${mat.color}18;display:flex;align-items:center;justify-content:center;font-size:0.95rem;color:${mat.color}">${mat.icon}</div>
        <h2 style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin:0">${mat.name}</h2>
      </div>

      <!-- Fecha parcial -->
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.6rem 0.8rem;margin-bottom:0.8rem;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">
        <span style="font-size:0.72rem;font-weight:600;color:var(--text-primary)">📅 Parcial:</span>
        <input type="date" id="subj-date" value="${saved[mat.id]||''}" onchange="saveExamDate('${mat.id}',this.value)" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.25rem 0.4rem;font-size:0.68rem;color:var(--text-primary)">
        ${saved[mat.id] ? `<button onclick="BIBLIC_TIZA.currentView='plan';renderBiblioteca()" style="padding:0.2rem 0.5rem;background:#8b5cf6;color:white;border:none;border-radius:6px;font-size:0.65rem;font-weight:600;cursor:pointer">Ver plan</button>` : ''}
        <a href="${mat.altillo}" target="_blank" style="margin-left:auto;font-size:0.62rem;color:${mat.color};text-decoration:none">→ Altillo</a>
      </div>

      <!-- Unidades -->
      <div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1rem">
        ${mat.units.map((u, i) => `
          <div onclick="BIBLIC_TIZA.currentView='unit';BIBLIC_TIZA.currentUnit='${u.id}';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='${mat.color}40'" onmouseout="this.style.borderColor='var(--border-color)'">
            <div style="display:flex;align-items:center;gap:0.5rem">
              <span style="width:26px;height:26px;border-radius:50%;background:${mat.color}20;display:flex;align-items:center;justify-content:center;font-size:0.68rem;font-weight:700;color:${mat.color};flex-shrink:0">${i+1}</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:0.8rem;font-weight:700;color:var(--text-primary)">${u.name}</div>
                <div style="font-size:0.65rem;color:var(--text-muted);font-style:italic">"${u.idea}"</div>
              </div>
              <span style="font-size:0.55rem;color:var(--text-muted)">${u.ejercicios.length} ej</span>
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Parciales de esta materia -->
      ${PARCIALES_DATA[mat.id] ? `
      <h3 style="font-size:0.82rem;font-weight:700;color:var(--text-primary);margin-bottom:0.4rem">📄 Parciales</h3>
      <div style="display:flex;flex-direction:column;gap:0.35rem">
        ${PARCIALES_DATA[mat.id].map((ex, i) => `
          <div onclick="BIBLIC_TIZA.currentView='parciales';window._parcIdx=${i};renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem 0.6rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onmouseover="this.style.borderColor='${mat.color}40'" onmouseout="this.style.borderColor='var(--border-color)'">
            <span style="font-size:0.7rem;font-weight:600;color:var(--text-primary)">${ex.año} · ${ex.cuat}° · ${ex.cátedra}</span>
            <span style="font-size:0.55rem;color:var(--text-muted)">${ex.ejercicios.length} ejercicios</span>
          </div>
        `).join("")}
      </div>` : ''}
    </div>
  `;
}

function renderUnit(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  if (!mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }
  const unit = mat.units.find(u => u.id === BIBLIC_TIZA.currentUnit);
  if (!unit) { BIBLIC_TIZA.currentView = "subject"; renderBiblioteca(); return; }
  const ui = mat.units.indexOf(unit);

  el.innerHTML = `
    <div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.6rem">
        <button onclick="BIBLIC_TIZA.currentView='subject';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← ${mat.name}</button>
      </div>

      <!-- Header -->
      <div style="text-align:center;margin-bottom:1rem;padding:0.8rem;background:linear-gradient(135deg,${mat.color}10,${mat.color}05);border:1px solid ${mat.color}25;border-radius:12px">
        <div style="font-size:0.58rem;color:${mat.color};font-weight:600;margin-bottom:0.1rem">UNIDAD ${ui+1}</div>
        <h2 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin:0 0 0.2rem">${unit.name}</h2>
        <p style="font-size:0.75rem;color:var(--text-muted);font-style:italic">"${unit.idea}"</p>
      </div>

      <!-- Teoría -->
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:0.8rem 1rem;margin-bottom:0.8rem">
        <div style="font-size:0.78rem;color:var(--text-primary);line-height:1.65">${btMd(unit.teoria)}</div>
      </div>

      <!-- Errores -->
      <div style="background:linear-gradient(135deg,rgba(239,68,68,0.06),rgba(220,38,38,0.03));border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:0.7rem;margin-bottom:0.8rem">
        <div style="font-size:0.75rem;font-weight:700;color:#ef4444;margin-bottom:0.3rem">⚠ Errores comunes</div>
        ${unit.errores.map(er => `
          <div style="display:flex;gap:0.35rem;align-items:flex-start;margin-bottom:0.25rem;padding:0.25rem 0.35rem;background:rgba(239,68,68,0.04);border-radius:5px">
            <span style="color:#ef4444;font-size:0.62rem;flex-shrink:0">✗</span>
            <span style="font-size:0.68rem;color:var(--text-primary);line-height:1.4">${btKatex(er)}</span>
          </div>
        `).join("")}
      </div>

      <!-- Ejercicios -->
      <div style="font-size:0.82rem;font-weight:700;color:var(--text-primary);margin-bottom:0.4rem">📝 Ejercicios</div>
      ${unit.ejercicios.map((ej, ei) => `
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;margin-bottom:0.4rem">
          <div style="font-size:0.75rem;font-weight:700;color:var(--text-primary);margin-bottom:0.25rem">${ej.titulo}</div>
          <div style="font-size:0.78rem;color:var(--text-primary);padding:0.4rem;background:var(--bg-secondary);border-radius:7px;margin-bottom:0.4rem">${btKatex(ej.enunciado)}</div>
          <div id="unit-sol-${ei}" style="display:none;margin-bottom:0.3rem">
            <div style="font-size:0.65rem;font-weight:600;color:#22c55e;margin-bottom:0.2rem">✅ Solución:</div>
            ${ej.solucion.map(s => `
              <div style="display:flex;gap:0.3rem;align-items:flex-start;margin-bottom:0.15rem;padding:0.2rem 0.35rem;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.15);border-radius:5px">
                <span style="color:#22c55e;font-size:0.6rem;flex-shrink:0">✓</span>
                <span style="font-size:0.68rem;color:var(--text-primary);line-height:1.4">${btKatex(s)}</span>
              </div>
            `).join("")}
          </div>
          <div style="display:flex;gap:0.25rem">
            <button onclick="toggleBiblic('unit-sol-${ei}')" style="padding:0.2rem 0.5rem;background:rgba(139,92,246,0.1);color:#8b5cf6;border:1px solid rgba(139,92,246,0.25);border-radius:6px;font-size:0.6rem;cursor:pointer;font-weight:600">Solución</button>
            <button onclick="switchView('chat');const ci=document.getElementById('chatInput');ci.value='Explicá: ${ej.titulo} de ${mat.name}';ci.focus()" style="padding:0.2rem 0.5rem;background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid rgba(59,130,246,0.25);border-radius:6px;font-size:0.6rem;cursor:pointer;font-weight:600">Chat</button>
          </div>
        </div>
      `).join("")}

      <!-- Nav -->
      <div style="display:flex;justify-content:space-between;margin-top:0.8rem">
        ${ui > 0 ? `<button onclick="BIBLIC_TIZA.currentUnit='${mat.units[ui-1].id}';renderBiblioteca()" style="padding:0.35rem 0.7rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;font-size:0.68rem;cursor:pointer;color:var(--text-primary)">← ${mat.units[ui-1].name}</button>` : '<div></div>'}
        ${ui < mat.units.length-1 ? `<button onclick="BIBLIC_TIZA.currentUnit='${mat.units[ui+1].id}';renderBiblioteca()" style="padding:0.35rem 0.7rem;background:${mat.color};color:white;border:none;border-radius:8px;font-size:0.68rem;cursor:pointer;font-weight:600">${mat.units[ui+1].name} →</button>` : '<div></div>'}
      </div>
    </div>
  `;
  renderMath(el);
}

function renderParcial(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  const exams = PARCIALES_DATA[BIBLIC_TIZA.currentSubject] || [];
  const ex = exams[window._parcIdx || 0];
  if (!ex || !mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }

  el.innerHTML = `
    <div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.6rem">
        <button onclick="BIBLIC_TIZA.currentView='subject';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← ${mat.name}</button>
        <h2 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin:0">📄 ${ex.año} · ${ex.cuat}°C · ${ex.cátedra}</h2>
      </div>
      <div style="display:flex;gap:0.25rem;flex-wrap:wrap;margin-bottom:0.8rem">
        ${ex.temas.map(t => `<span style="font-size:0.55rem;padding:0.1rem 0.4rem;background:${mat.color}15;border:1px solid ${mat.color}30;border-radius:5px;color:${mat.color};font-weight:600">${t}</span>`).join("")}
      </div>

      ${ex.ejercicios.map((ej, ei) => `
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;margin-bottom:0.4rem">
          <div style="font-size:0.7rem;font-weight:700;color:var(--text-primary);margin-bottom:0.3rem">Ejercicio ${ei+1}</div>
          <div style="font-size:0.78rem;color:var(--text-primary);padding:0.4rem;background:var(--bg-secondary);border-radius:7px;margin-bottom:0.4rem">${btKatex(ej.enunciado)}</div>

          <div id="p-sol-${ei}" style="display:none;margin-bottom:0.3rem">
            <div style="font-size:0.65rem;font-weight:600;color:#22c55e;margin-bottom:0.2rem">Resolución:</div>
            ${ej.pasos.map(p => `
              <div style="display:flex;gap:0.3rem;align-items:flex-start;margin-bottom:0.15rem;padding:0.2rem 0.35rem;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.15);border-radius:5px">
                <span style="color:#22c55e;font-size:0.6rem;flex-shrink:0">✓</span>
                <span style="font-size:0.68rem;color:var(--text-primary);line-height:1.4">${btKatex(p)}</span>
              </div>
            `).join("")}
          </div>

          <div id="p-err-${ei}" style="display:none;margin-bottom:0.3rem">
            <div style="font-size:0.65rem;font-weight:600;color:#ef4444;margin-bottom:0.2rem">⚠ Errores:</div>
            ${ej.errores.map(er => `
              <div style="display:flex;gap:0.3rem;align-items:flex-start;margin-bottom:0.15rem;padding:0.2rem 0.35rem;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:5px">
                <span style="color:#ef4444;font-size:0.6rem;flex-shrink:0">✗</span>
                <span style="font-size:0.65rem;color:var(--text-primary)">${btKatex(er)}</span>
              </div>
            `).join("")}
          </div>

          <div style="display:flex;gap:0.25rem">
            <button onclick="toggleBiblic('p-sol-${ei}')" style="padding:0.2rem 0.5rem;background:rgba(139,92,246,0.1);color:#8b5cf6;border:1px solid rgba(139,92,246,0.25);border-radius:6px;font-size:0.6rem;cursor:pointer;font-weight:600">Pasos</button>
            <button onclick="toggleBiblic('p-err-${ei}')" style="padding:0.2rem 0.5rem;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.25);border-radius:6px;font-size:0.6rem;cursor:pointer;font-weight:600">Errores</button>
            <button onclick="switchView('chat');const ci=document.getElementById('chatInput');ci.value='Explicá este ejercicio: ${ej.enunciado.replace(/'/g,"\\'").replace(/\$/g,"\\$")}';ci.focus()" style="padding:0.2rem 0.5rem;background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid rgba(59,130,246,0.25);border-radius:6px;font-size:0.6rem;cursor:pointer;font-weight:600">Chat</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
  renderMath(el);
}

function renderPlan(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  if (!mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }
  const saved = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}");
  const examDate = saved[mat.id];
  if (!examDate) { BIBLIC_TIZA.currentView = "subject"; renderBiblioteca(); return; }

  const today = new Date();
  const exam = new Date(examDate);
  const daysLeft = Math.max(1, Math.ceil((exam - today) / (1000*60*60*24)));
  const units = mat.units;
  const daysPerUnit = Math.max(1, Math.floor(daysLeft / units.length));

  el.innerHTML = `
    <div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem">
        <button onclick="BIBLIC_TIZA.currentView='subject';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← ${mat.name}</button>
        <h2 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin:0">🎯 Plan de estudio</h2>
      </div>

      <div style="background:linear-gradient(135deg,${mat.color}10,${mat.color}05);border:1px solid ${mat.color}25;border-radius:12px;padding:0.8rem;margin-bottom:0.8rem;text-align:center">
        <div style="font-size:1.8rem;font-weight:800;color:${mat.color}">${daysLeft}</div>
        <div style="font-size:0.72rem;color:var(--text-muted)">días para el parcial</div>
        <div style="font-size:0.62rem;color:var(--text-muted);margin-top:0.15rem">📅 ${examDate}</div>
      </div>

      <div style="display:flex;flex-direction:column;gap:0.35rem">
        ${units.map((u, i) => {
          const startDay = i * daysPerUnit + 1;
          const endDay = Math.min((i+1) * daysPerUnit, daysLeft);
          return `
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.6rem;display:flex;align-items:center;justify-content:space-between">
            <div style="display:flex;align-items:center;gap:0.5rem">
              <span style="width:26px;height:26px;border-radius:50%;background:${mat.color}18;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:${mat.color};flex-shrink:0">${i+1}</span>
              <div>
                <div style="font-size:0.75rem;font-weight:700;color:var(--text-primary)">${u.name}</div>
                <div style="font-size:0.58rem;color:var(--text-muted)">Días ${startDay}–${endDay} · ${u.ejercicios.length} ej</div>
              </div>
            </div>
            <button onclick="BIBLIC_TIZA.currentUnit='${u.id}';BIBLIC_TIZA.currentView='unit';renderBiblioteca()" style="padding:0.2rem 0.5rem;background:${mat.color}15;color:${mat.color};border:1px solid ${mat.color}30;border-radius:6px;font-size:0.58rem;cursor:pointer;font-weight:600">Estudiar</button>
          </div>`;
        }).join("")}
      </div>

      <div style="margin-top:0.8rem;padding:0.7rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px">
        <div style="font-size:0.72rem;font-weight:700;color:var(--text-primary);margin-bottom:0.3rem">💡 Tips</div>
        <div style="font-size:0.68rem;color:var(--text-muted);line-height:1.5">
          • Hacé los ejercicios SIN mirar la solución<br>
          • Resolvé al menos 1 parcial completo cronometrado<br>
          • Si un tema no cierra, pedile explicación al chat
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function toggleBiblic(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = el.style.display === "none" ? "block" : "none";
}

function saveExamDate(subjectId, date) {
  const saved = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}");
  if (date) saved[subjectId] = date; else delete saved[subjectId];
  localStorage.setItem("biblic_exam_dates", JSON.stringify(saved));
}

function createStudyPlan() {
  const subj = document.getElementById("biblic-plan-subj")?.value;
  const date = document.getElementById("biblic-plan-date")?.value;
  if (!subj || !date) return;
  saveExamDate(subj, date);
  BIBLIC_TIZA.currentSubject = subj;
  BIBLIC_TIZA.currentView = "plan";
  renderBiblioteca();
}

function renderMath(el) {
  setTimeout(() => {
    if (window.renderMathInElement) {
      try { window.renderMathInElement(el, { delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}], throwOnError:false }); } catch {}
    }
  }, 50);
}

window.renderBiblioteca = renderBiblioteca;
window.toggleBiblic = toggleBiblic;
window.saveExamDate = saveExamDate;
window.createStudyPlan = createStudyPlan;
window._parcIdx = 0;
