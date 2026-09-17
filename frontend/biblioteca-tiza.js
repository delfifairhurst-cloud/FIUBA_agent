// biblioteca-tiza.js — CBC UBA: todas las unidades reales, parciales, plan de estudio

const BIBLIC_TIZA = { currentView: "home", currentSubject: null, currentUnit: null };

// ═══════════════════════════════════════════════════════
// MATERIAS CBC INGENIERÍA (programas oficiales)
// ═══════════════════════════════════════════════════════
const BIBLIC_MATERIAS = [
  {
    id: "am1", name: "Análisis Matemático I", color: "#3b82f6", icon: "∫",
    desc: "Funciones, límites, derivadas, integrales, series",
    altillo: "https://www.altillo.com/examenes/uba/cbc/analisis/",
    units: [
      { id: "funciones", name: "Funciones", idea: "Una función asigna a cada $x$ un único $y$.", teoria: `## Funciones\n\n**Definición:** $f: A \\to B$ asigna a cada $x \\in A$ un único $y \\in B$.\n\n**Dominio:** de dónde salen los $x$ (cuidado con divisiones por cero, raíces pares, logaritmos).\n\n**Inyectiva:** cada $y$ viene de un solo $x$.\n**Sobreyectiva:** todo $y$ del codominio es imagen de algún $x$.\n**Biyectiva:** inyectiva Y sobreyectiva.\n\n**Composición:** $(f \\circ g)(x) = f(g(x))$.\n**Inversa:** $f^{-1}(f(x)) = x$.`, errores: ["No calcular el dominio primero","Confundir inyectiva con sobreyectiva"], ejercicios: [{ titulo: "Dominio", enunciado: "Dominio de $f(x) = \\sqrt{\\frac{x-1}{x+2}}$", solucion: ["Raíz: argumento $\\geq 0$","$\\frac{x-1}{x+2} \\geq 0$ → $x \\geq 1$ o $x < -2$","$(-\\infty, -2) \\cup [1, +\\infty)$"] }] },
      { id: "numeros-reales", name: "Números reales", idea: "La recta real está llena de 'agujeros' irracionales.", teoria: `## Números reales\n\n**Conjuntos:** $\\mathbb{N} \\subset \\mathbb{Z} \\subset \\mathbb{Q} \\subset \\mathbb{R}$\n\n**Intervalos:** $(a,b)$, $[a,b]$, $(a,b]$, $[a,b)$, $(-\\infty, a)$, $(a, +\\infty)$\n\n**Módulo:** $|x| = \\begin{cases} x & \\text{si } x \\geq 0 \\\\ -x & \\text{si } x < 0 \\end{cases}$\n\n**Desigualdad triangular:** $|a + b| \\leq |a| + |b|$\n\n**Propiedades del módulo:** $|ab| = |a||b|$, $\\left|\\frac{a}{b}\\right| = \\frac{|a|}{|b|}$`, errores: ["Olvidar que $|x| \\geq 0$ siempre","Confundir $|a+b|$ con $|a|+|b|$"], ejercicios: [{ titulo: "Desigualdad", enunciado: "Resolver $|2x - 3| < 5$", solucion: ["$-5 < 2x - 3 < 5$","$-2 < 2x < 8$","$-1 < x < 4$","$x \\in (-1, 4)$"] }] },
      { id: "sucesiones", name: "Sucesiones", idea: "Una sucesión es una lista infinita de números: $a_1, a_2, a_3, \\ldots$", teoria: `## Sucesiones\n\n**Definición:** función $a: \\mathbb{N} \\to \\mathbb{R}$, se escribe $a_n$.\n\n**Convergencia:** $\\lim_{n \\to \\infty} a_n = L$ si para todo $\\varepsilon > 0$ existe $N$ tal que $n > N \\Rightarrow |a_n - L| < \\varepsilon$.\n\n**Sucesiones notables:**\n- $a_n = \\frac{1}{n} \\to 0$\n- $a_n = \\frac{n+1}{n} \\to 1$\n- $a_n = (-1)^n$ (no converge)\n\n**Monotonía:** creciente si $a_{n+1} \\geq a_n$, decreciente si $a_{n+1} \\leq a_n$.\n\n**Acotada:** existe $M$ tal que $|a_n| \\leq M$ para todo $n$.\n\n**Teorema:** toda sucesión monótona y acotada converge.`, errores: ["Confundir convergencia con monotonía","No probar que la sucesión está acotada"], ejercicios: [{ titulo: "Convergencia", enunciado: "$$a_n = \\frac{3n^2 + 1}{n^2 + 2n}$$", solucion: ["Dividimos por $n^2$: $\\frac{3 + 1/n^2}{1 + 2/n}$","Cuando $n \\to \\infty$: $\\frac{3+0}{1+0} = 3$","$\\lim a_n = 3$"] }] },
      { id: "limites", name: "Límites y continuidad", idea: "Un límite es el valor al que se aproxima la función.", teoria: `## Límites\n\n**Definición:** $\\lim_{x \\to a} f(x) = L$.\n\n**Límites notables:**\n$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$\n$$\\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x = e$$\n$$\\lim_{x \\to 0} \\frac{e^x - 1}{x} = 1$$\n\n**Indeterminaciones:** $\\frac{0}{0}$, $\\frac{\\infty}{\\infty}$, $0 \\cdot \\infty$, $\\infty - \\infty$, $1^\\infty$, $0^0$, $\\infty^0$\n\n**L'Hôpital:** si $\\frac{0}{0}$ o $\\frac{\\infty}{\\infty}$:\n$$\\lim \\frac{f}{g} = \\lim \\frac{f'}{g'}$$\n\n**Continuidad:** $f$ continua en $a$ si $\\lim_{x \\to a} f(x) = f(a)$.\n\n**Teorema del valor intermedio:** si $f$ continua en $[a,b]$, toma todos los valores entre $f(a)$ y $f(b)$.`, errores: ["No verificar indeterminación antes de reemplazar","L'Hôpital solo para $\\frac{0}{0}$ o $\\frac{\\infty}{\\infty}$"], ejercicios: [{ titulo: "L'Hôpital", enunciado: "$$\\lim_{x \\to 0} \\frac{e^x - 1}{x}$$", solucion: ["$\\frac{e^0-1}{0} = \\frac{0}{0}$ → L'Hôpital","$\\lim \\frac{e^x}{1} = 1$"] }] },
      { id: "derivadas", name: "Derivadas", idea: "La derivada es la pendiente de la tangente.", teoria: `## Derivadas\n\n**Definición:** $f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$\n\n**Derivadas notables:**\n| $f(x)$ | $f'(x)$ |\n|---------|----------|\n| $c$ | $0$ |\n| $x^n$ | $nx^{n-1}$ |\n| $e^x$ | $e^x$ |\n| $\\ln x$ | $1/x$ |\n| $\\sin x$ | $\\cos x$ |\n| $\\cos x$ | $-\\sin x$ |\n\n**Reglas:**\n- Suma: $(f+g)' = f'+g'$\n- Producto: $(fg)' = f'g + fg'$\n- Cociente: $(f/g)' = (f'g-fg')/g^2$\n- Cadena: $(f(g))' = f'(g) \\cdot g'$`, errores: ["Olvidar cadena","Confundir $(fg)'$ con $f'g'$"], ejercicios: [{ titulo: "Cadena", enunciado: "$f(x) = e^{x^2} \\ln x$, Hallar $f'(x)$", solucion: ["Producto: $u=e^{x^2}$, $v=\\ln x$","$u'=2xe^{x^2}$, $v'=1/x$","$f'=e^{x^2}(2x\\ln x + 1/x)$"] }] },
      { id: "tvm-lhopital", name: "Teorema del valor medio y L'Hôpital", idea: "Si la función es suave, en algún punto la tangente es paralela a la secante.", teoria: `## TVM y L'Hôpital\n\n**Teorema del valor medio:** si $f$ es continua en $[a,b]$ y derivable en $(a,b)$, existe $c \\in (a,b)$ tal que:\n$$f'(c) = \\frac{f(b)-f(a)}{b-a}$$\n\n**Consecuencias:**\n- Si $f' = 0$ en todo intervalo, $f$ es constante\n- Si $f' > 0$, $f$ creciente\n- Si $f' < 0$, $f$ decreciente\n\n**L'Hôpital:** para $\\frac{0}{0}$ o $\\frac{\\infty}{\\infty}$:\n$$\\lim \\frac{f}{g} = \\lim \\frac{f'}{g'}$$\n(aplicar hasta que deje de ser indeterminación)`, errores: ["No verificar que sea indeterminación","Aplicar L'Hôpital más de una vez sin recalcular"], ejercicios: [{ titulo: "L'Hôpital doble", enunciado: "$$\\lim_{x \\to 0} \\frac{1 - \\cos x}{x^2}$$", solucion: ["$\\frac{0}{0}$ → L'Hôpital: $\\frac{\\sin x}{2x}$","Todavía $\\frac{0}{0}$ → L'Hôpital: $\\frac{\\cos x}{2}$","$\\frac{\\cos 0}{2} = \\frac{1}{2}$"] }] },
      { id: "estudio-funciones", name: "Estudio de funciones y optimización", idea: "El estudio completo: dominio, derivadas, concavidad, asíntotas, gráfico.", teoria: `## Estudio de funciones\n\n**Pasos:**\n1. Dominio\n2. Intersecciones con ejes\n3. Paridad (par/impar)\n4. Derivada primera → crecimiento/decrecimiento, máximos/mínimos\n5. Derivada segunda → concavidad, puntos de inflexión\n6. Asíntotas (horizontales, verticales, oblicuas)\n7. Gráfico\n\n**Optimización:** para encontrar extremos, resolver $f'(x) = 0$ y verificar con segunda derivada.`, errores: ["Olvidar calcular asíntotas","No verificar si el máximo es realmente máximo"], ejercicios: [{ titulo: "Extremos", enunciado: "Encontrar extremos de $f(x) = x^3 - 3x + 2$", solucion: ["$f'(x) = 3x^2 - 3 = 3(x-1)(x+1)$","$f'=0$ en $x=1$ y $x=-1$","$f''(1) = 6 > 0$ → mínimo","$f''(-1) = -6 < 0$ → máximo","Máx: $f(-1)=4$, Mín: $f(1)=0$"] }] },
      { id: "taylor", name: "Polinomio de Taylor", idea: "Aproximar cualquier función con polinomios.", teoria: `## Taylor\n\n**Polinomio de Taylor de orden $n$ en $a$:**\n$$T_n(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(a)}{k!}(x-a)^k$$\n\n**En $a=0$ (Maclaurin):**\n$$T_n(x) = f(0) + f'(0)x + \\frac{f''(0)}{2!}x^2 + \\cdots$$\n\n**Taylor notables:**\n$$e^x = 1 + x + \\frac{x^2}{2!} + \\frac{x^3}{3!} + \\cdots$$\n$$\\sin x = x - \\frac{x^3}{3!} + \\frac{x^5}{5!} - \\cdots$$\n$$\\cos x = 1 - \\frac{x^2}{2!} + \\frac{x^4}{4!} - \\cdots$$\n$$\\ln(1+x) = x - \\frac{x^2}{2} + \\frac{x^3}{3} - \\cdots$$`, errores: ["Confundir los órdenes de las derivadas","Olvidar que $0! = 1$"], ejercicios: [{ titulo: "Taylor de $e^x$", enunciado: "Taylor de orden 3 de $e^x$ en $a=0$", solucion: ["$f(0)=f'(0)=f''(0)=f'''(0)=1$","$T_3(x) = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6}$"] }] },
      { id: "integrales", name: "Integrales y métodos de integración", idea: "La integral es la inversa de la derivada: acumular cambios.", teoria: `## Integrales\n\n**Integral definida:** $\\int_a^b f(x)dx = F(b) - F(a)$\n\n**Teorema Fundamental:** $\\frac{d}{dx}\\int_a^x f(t)dt = f(x)$\n\n**Integrales notables:**\n$$\\int x^n dx = \\frac{x^{n+1}}{n+1}+C \\quad (n\\neq -1)$$\n$$\\int \\frac{1}{x}dx = \\ln|x|+C$$\n$$\\int e^x dx = e^x+C$$\n$$\\int \\sin x dx = -\\cos x+C$$\n\n**Métodos:**\n- Sustitución: $u = g(x)$\n- Partes: $\\int u\\,dv = uv - \\int v\\,du$\n- Fracciones parciales\n- Trigonométricos`, errores: ["Olvidar $+C$","Error de signo en partes","No cambiar límites en sustitución"], ejercicios: [{ titulo: "Partes", enunciado: "$\\int x e^x dx$", solucion: ["$u=x$, $dv=e^x dx$","$du=dx$, $v=e^x$","$= xe^x - \\int e^x dx = e^x(x-1)+C$"] }] },
      { id: "areas-edo", name: "Área entre curvas y ecuaciones diferenciales", idea: "La integral mide áreas entre curvas y resuelve ecuaciones con derivadas.", teoria: `## Áreas y EDOs\n\n**Área entre curvas:**\n$$A = \\int_a^b |f(x) - g(x)| dx$$\n\n**EDO separables:** $\\frac{dy}{dx} = f(x)g(y)$\n$$\\int \\frac{dy}{g(y)} = \\int f(x)dx$$\n\n**EDO lineales de primer orden:** $y' + P(x)y = Q(x)$\nFactor integrante: $\\mu(x) = e^{\\int P(x)dx}$`, errores: ["No usar valor absoluto en áreas","Error al separar variables en EDO"], ejercicios: [{ titulo: "Área", enunciado: "Área entre $y=x^2$ y $y=x$ en $[0,1]$", solucion: ["$x \\geq x^2$ en $[0,1]$","$A = \\int_0^1 (x-x^2)dx = [x^2/2 - x^3/3]_0^1 = 1/2 - 1/3 = 1/6$"] }] },
      { id: "series", name: "Series", idea: "¿Cuándo una suma infinita da un número finito?", teoria: `## Series\n\n**Definición:** $\\sum_{n=1}^{\\infty} a_n = \\lim_{N \\to \\infty} \\sum_{n=1}^{N} a_n$\n\n**Criterios de convergencia:**\n- **Geométrica:** $\\sum r^n$ converge si $|r| < 1$, suma $\\frac{1}{1-r}$\n- **Armónica:** $\\sum \\frac{1}{n}$ diverge\n- **p-Series:** $\\sum \\frac{1}{n^p}$ converge si $p > 1$\n- **Comparación:** comparar con serie conocida\n- **Ratio:** $\\lim \\left|\\frac{a_{n+1}}{a_n}\\right| < 1$ → converge\n- **Raíz:** $\\lim |a_n|^{1/n} < 1$ → converge`, errores: ["No verificar que $a_n \\to 0$ primero","Confundir serie con sucesión"], ejercicios: [{ titulo: "Serie geométrica", enunciado: "$$\\sum_{n=0}^{\\infty} \\frac{2^n}{3^n}$$", solucion: ["Es geométrica con $r = 2/3$","$|r| < 1$ → converge","Suma $= \\frac{1}{1-2/3} = 3$"] }] }
    ]
  },
  {
    id: "algebra", name: "Álgebra", color: "#8b5cf6", icon: "⊞",
    desc: "Sistemas, matrices, vectores, autovalores",
    altillo: "https://www.altillo.com/examenes/uba/cbc/algebra/",
    units: [
      { id: "sistemas", name: "Sistemas de ecuaciones lineales", idea: "Varias ecuaciones, varias incógnitas, resueltas juntas.", teoria: `## Sistemas lineales\n\n**Métodos:**\n- Sustitución\n- Gauss (reducción a escalaón)\n- Cramer: $x_i = \\frac{\\det(A_i)}{\\det(A)}$ (solo si $\\det A \\neq 0$)\n\n**Clasificación:**\n- Determinado: solución única\n- Indeterminado: infinitas soluciones\n- Incompatible: sin solución\n\n**Rango:** número de filas no nulas en la matriz escalonada.`, errores: ["No verificar $\\det A \\neq 0$ para Cramer","Cambiar filas mal en Gauss"], ejercicios: [{ titulo: "Gauss", enunciado: "$$\\begin{cases} x + y + z = 6 \\\\ 2x - y + z = 3 \\\\ x + 2y - z = 2 \\end{cases}$$", solucion: ["$R_2 \\leftarrow R_2 - 2R_1$: $-3y - z = -9$","$R_3 \\leftarrow R_3 - R_1$: $y - 2z = -4$","De $R_3$: $y = 2z-4$","Reemplazo y resuelvo → $z=1$, $y=-2$, $x=7$"] }] },
      { id: "matrices", name: "Matrices y coordenadas", idea: "Una matriz es una tabla de números que representa una transformación.", teoria: `## Matrices\n\n**Operaciones:** suma componente a componente, producto filas×columnas.\n\n$AB \\neq BA$ (en general)\n\n**Inversa 2×2:**\n$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}^{-1} = \\frac{1}{ad-bc}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$$\n\n**Matriz transpuesta:** $(A^T)_{ij} = A_{ji}$\n\n**Rango:** número de columnas linealmente independientes.\n\n**Sistemas:** $Ax = b$ tiene solución única si $A$ es invertible.`, errores: ["Confundir el orden al multiplicar","Olvidar que $AB \\neq BA$"], ejercicios: [{ titulo: "Inversa", enunciado: "$A = \\begin{pmatrix} 3 & 1 \\\\ 5 & 2 \\end{pmatrix}$, Hallar $A^{-1}$", solucion: ["$\\det A = 6-5 = 1$","$A^{-1} = \\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}$"] }] },
      { id: "determinantes", name: "Determinantes", idea: "El determinante mide cuánto una matriz 'estira' el espacio.", teoria: `## Determinantes\n\n**2×2:** $\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad-bc$\n\n**3×3 (Sarrus):** diagonal principal - diagonal secundaria.\n\n**Propiedades:**\n- $\\det(AB) = \\det A \\cdot \\det B$\n- $\\det(A^T) = \\det A$\n- $\\det A = 0 \\Leftrightarrow$ $A$ singular\n- $\\det(kA) = k^n \\det A$ ($n$ = orden)`, errores: ["Cambiar signos en Sarrus","Olvidar que $\\det(kA) = k^n \\det A$"], ejercicios: [{ titulo: "Sarrus", enunciado: "$\\det\\begin{pmatrix} 3 & 1 & 0 \\\\ 0 & 2 & 1 \\\\ 1 & 0 & 3 \\end{pmatrix}$", solucion: ["Diag. principal: $3\\cdot2\\cdot3 + 1\\cdot1\\cdot1 + 0\\cdot0\\cdot0 = 19$","Diag. secundaria: $0\\cdot2\\cdot1 + 1\\cdot1\\cdot3 + 3\\cdot0\\cdot0 = 3$","$\\det = 19 - 3 = 16$"] }] },
      { id: "espacios-vectoriales", name: "Espacios vectoriales", idea: "Un espacio vectorial es un conjunto donde se puede sumar y escalar.", teoria: `## Espacios vectoriales\n\n**Definición:** conjunto $V$ con operaciones $+$ y $\\cdot$ que cumple 8 axiomas.\n\n**Ejemplos:** $\\mathbb{R}^n$, polinomios, matrices.\n\n**Subespacio:** subconjunto cerrado bajo suma y escalar.\n\n**Independencia lineal:** $v_1, \\ldots, v_k$ son LI si $\\alpha_1 v_1 + \\cdots + \\alpha_k v_k = 0 \\Rightarrow$ todos $\\alpha_i = 0$.\n\n**Base:** conjunto LI que genera todo el espacio.\n\n**Dimensión:** cantidad de vectores en cualquier base.`, errores: ["No verificar que el subconjunto es cerrado","Confundir generación con independencia"], ejercicios: [{ titulo: "Base de $\\mathbb{R}^3$", enunciado: "¿Son base $\\{(1,0,0), (0,1,0), (0,0,1)\\}$?", solucion: ["Son 3 vectores en $\\mathbb{R}^3$","Son LI: si $a(1,0,0)+b(0,1,0)+c(0,0,1)=0$ → $a=b=c=0$","Generan: todo $(x,y,z) = x(1,0,0)+y(0,1,0)+z(0,0,1)$","**Sí son base**"] }] },
      { id: "transformaciones", name: "Transformaciones lineales", idea: "Una transformación lineal preserva suma y escalar.", teoria: `## Transformaciones lineales\n\n**Definición:** $T: V \\to W$ tal que:\n- $T(u+v) = T(u) + T(v)$\n- $T(\\lambda v) = \\lambda T(v)$\n\n**Núcleo:** $\\ker(T) = \\{v : T(v) = 0\\}$\n**Imagen:** $\\text{Im}(T) = \\{T(v) : v \\in V\\}$\n\n**Teorema de la dimensión:**\n$$\\dim V = \\dim \\ker T + \\dim \\text{Im} T$$\n\n**Matriz asociada:** cada transformación lineal se puede representar como una matriz.`, errores: ["Olvidar que $T(0) = 0$ siempre","No calcular核ulo e imagen"], ejercicios: [{ titulo: "Núcleo", enunciado: "$T: \\mathbb{R}^3 \\to \\mathbb{R}^2$, $T(x,y,z) = (x+y, y+z)$", solucion: ["$\\ker T$: resolver $x+y=0$ y $y+z=0$","$y=-x$, $z=-y=x$","$\\ker T = \\{(t, -t, t) : t \\in \\mathbb{R}\\}$","$\\dim \\ker T = 1$"] }] },
      { id: "dual", name: "Espacio dual", idea: "El dual es el espacio de todas las funciones lineales que mapean a $\\mathbb{R}$.", teoria: `## Espacio dual\n\n**Dual:** $V^* = \\{f: V \\to \\mathbb{R} : f \\text{ lineal}\\}$\n\n**Dual canónico:** para base $\\{e_1, \\ldots, e_n\\}$, los funcionales $e^i$ tales que $e^i(e_j) = \\delta_{ij}$\n\n**Matriz de una forma lineal:** es una matriz fila.\n\n**Transpuesta:** la matriz de $T^*$ es la transpuesta de la matriz de $T$.`, errores: ["Confundir dual con transpuesta","Olvidar que el dual tiene la misma dimensión"], ejercicios: [{ titulo: "Funcional", enunciado: "¿$f(x,y) = 2x + 3y$ es lineal?", solucion: ["$f(a u + b v) = 2(ax_1+bx_2) + 3(ay_1+by_2)$","$= a(2x_1+3y_1) + b(2x_2+3y_2) = af(u)+bf(v)$","**Sí es lineal**"] }] },
      { id: "autovalores", name: "Autovalores y autovectores", idea: "Un autovalor es la escala por la que una transformación estira un vector.", teoria: `## Autovalores\n\n**Definición:** $Av = \\lambda v$ donde $\\lambda$ es autovalor y $v$ autovector.\n\n**Cálculo:** resolver $\\det(A - \\lambda I) = 0$ (polinomio característico).\n\n**Propiedades:**\n- $\\sum \\lambda_i = \\text{tr}(A)$\n- $\\prod \\lambda_i = \\det(A)$\n\n**Diagonalización:** $A = PDP^{-1}$ donde $D$ es diagonal con autovalores.\n\n$A$ es diagonalizable si tiene $n$ autovectores linealmente independientes.`, errores: ["Error al calcular polinomio característico","No verificar si es diagonalizable"], ejercicios: [{ titulo: "Autovalores 2×2", enunciado: "$A = \\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}$", solucion: ["$(4-\\lambda)(3-\\lambda) - 2 = 0$","$\\lambda^2 - 7\\lambda + 10 = 0$","$\\lambda = \\frac{7 \\pm 3}{2}$ → $\\lambda_1 = 5$, $\\lambda_2 = 2$"] }] },
      { id: "jordan", name: "Formas de Jordan", idea: "Cuando una matriz no es diagonalizable, Jordan es la mejor aproximación.", teoria: `## Formas de Jordan\n\n**Bloque de Jordan:** $J_k(\\lambda) = \\begin{pmatrix} \\lambda & 1 & & \\\\ & \\lambda & \\ddots & \\\\ & & \\ddots & 1 \\\\ & & & \\lambda \\end{pmatrix}$\n\n**Forma canónica de Jordan:** matriz diagonal por bloques de Jordan.\n\n**Cuándo usar:** cuando $A$ no tiene suficientos autovectores para diagonalizar.\n\n**Valor propio defecto:** la dimensión del autoespacio es menor que la multiplicidad algebraica.`, errores: ["Confundir multiplicidad algebraica con geométrica","No armar los bloques correctamente"], ejercicios: [{ titulo: "Jordan", enunciado: "$A = \\begin{pmatrix} 2 & 1 \\\\ 0 & 2 \\end{pmatrix}$, ¿es diagonalizable?", solucion: ["Autovalor $\\lambda = 2$ (doble)","$A - 2I = \\begin{pmatrix} 0 & 1 \\\\ 0 & 0 \\end{pmatrix}$ → un solo autovector","**No es diagonalizable**","Forma de Jordan: $\\begin{pmatrix} 2 & 1 \\\\ 0 & 2 \\end{pmatrix}$ (ya está en Jordan)"] }] },
      { id: "producto-interno", name: "Producto interno", idea: "El producto interno mide ángulos y longitudes.", teoria: `## Producto interno\n\n**Definición:** función $\\langle \\cdot, \\cdot \\rangle: V \\times V \\to \\mathbb{R}$ tal que:\n- $\\langle u, v \\rangle = \\langle v, u \\rangle$ (simetría)\n- $\\langle au+bw, v \\rangle = a\\langle u,v\\rangle + b\\langle w,v\\rangle$\n- $\\langle v, v \\rangle > 0$ si $v \\neq 0$\n\n**Norma:** $\\|v\\| = \\sqrt{\\langle v, v \\rangle}$\n\n**Coseno del ángulo:** $\\cos\\theta = \\frac{\\langle u,v \\rangle}{\\|u\\|\\|v\\|}$\n\n**Ortogonalidad:** $u \\perp v \\Leftrightarrow \\langle u,v \\rangle = 0$\n\n**Gram-Schmidt:** proceso para ortonormalizar una base.`, errores: ["No verificar simetría","Olvidar que $\\|v\\| = \\sqrt{\\langle v,v \\rangle}$"], ejercicios: [{ titulo: "Gram-Schmidt", enunciado: "Ortogonalizar $\\{(1,1), (1,0)\\}$ en $\\mathbb{R}^2$", solucion: ["$v_1 = (1,1)$","$v_2 = (1,0) - \\frac{\\langle (1,0),(1,1)\\rangle}{\\langle (1,1),(1,1)\\rangle}(1,1) = (1,0) - \\frac{1}{2}(1,1) = (1/2, -1/2)$","Base ortogonal: $\\{(1,1), (1/2, -1/2)\\}$"] }] }
    ]
  },
  {
    id: "fisica", name: "Física I", color: "#f59e0b", icon: "◉",
    desc: "Cinemática, dinámica, trabajo, energía, momento",
    altillo: "https://www.altillo.com/examenes/uba/cbc/fis/",
    units: [
      { id: "cinematica", name: "Cinemática", idea: "Describir el movimiento sin preguntar por qué.", teoria: `## Cinemática\n\n**Posición:** $\\vec{r}(t) = x(t)\\hat{i} + y(t)\\hat{j}$\n\n**Velocidad:** $\\vec{v} = \\frac{d\\vec{r}}{dt}$\n\n**Aceleración:** $\\vec{a} = \\frac{d\\vec{v}}{dt}$\n\n**MRU:** $x = x_0 + vt$ (velocidad constante)\n\n**MRUA:**\n$$x = x_0 + v_0 t + \\frac{1}{2}at^2$$\n$$v = v_0 + at$$\n$$v^2 = v_0^2 + 2a(x-x_0)$$\n\n**Tiro oblicuo:**\n$$x = v_0 \\cos\\theta \\cdot t$$\n$$y = v_0 \\sin\\theta \\cdot t - \\frac{1}{2}gt^2$$`, errores: ["No separar en componentes","Olvidar que $g$ apunta hacia abajo"], ejercicios: [{ titulo: "Tiro oblicuo", enunciado: "Lanzamiento a 30 m/s, 45°. Alcance máximo.", solucion: ["$v_{0x} = 30\\cos45° = 21.2$ m/s","$v_{0y} = 30\\sin45° = 21.2$ m/s","Tiempo hasta máx: $t = v_{0y}/g = 2.16$ s","Alcance: $R = \\frac{v_0^2 \\sin 2\\theta}{g} = \\frac{900}{9.8} \\approx 91.8$ m"] }] },
      { id: "dinamica", name: "Dinámica y Newton", idea: "Fuerza = masa × aceleración.", teoria: `## Newton\n\n**1ª Ley (Inercia):** sin fuerza neta, no hay cambio de movimiento.\n\n**2ª Ley:** $\\vec{F} = m\\vec{a}$\n\n**3ª Ley:** acción = reacción.\n\n**Plano inclinado:**\n$$a = g(\\sin\\theta - \\mu\\cos\\theta)$$\n\n**Fricción:**\n- Estática: $f_s \\leq \\mu_s N$\n- Cinética: $f_k = \\mu_k N$`, errores: ["No descomponer el peso en componentes","Confundir fricción estática con cinética"], ejercicios: [{ titulo: "Plano inclinado", enunciado: "Bloque 5 kg, plano 30°, $\\mu=0.2$. Calcular $a$.", solucion: ["$mg\\sin30° = 24.5$ N","$N = mg\\cos30° = 42.4$ N","$f = \\mu N = 8.48$ N","$a = (24.5-8.48)/5 = 3.2$ m/s²"] }] },
      { id: "trabajo-energia", name: "Trabajo y energía", idea: "El trabajo es energía transferida por una fuerza.", teoria: `## Trabajo y energía\n\n**Trabajo:** $W = \\vec{F} \\cdot \\vec{d} = Fd\\cos\\theta$\n\n**Teorema del trabajo-energía:**\n$$W_{net} = \\Delta K = \\frac{1}{2}mv^2 - \\frac{1}{2}mv_0^2$$\n\n**Energía potencial gravitatoria:** $U = mgh$\n\n**Conservación de la energía:**\n$$K_1 + U_1 = K_2 + U_2$$\n(si solo hay fuerzas conservativas)\n\n**Potencia:** $P = \\frac{dW}{dt} = \\vec{F} \\cdot \\vec{v}$`, errores: ["Olvidar que el trabajo es escalar","No definir el nivel de referencia para $U$"], ejercicios: [{ titulo: "Conservación", enunciado: "Objeto cae desde 10 m. ¿Velocidad al llegar al suelo?", solucion: ["$mgh = \\frac{1}{2}mv^2$","$v = \\sqrt{2gh} = \\sqrt{2 \\cdot 9.8 \\cdot 10} = \\sqrt{196} = 14$ m/s"] }] },
      { id: "momento", name: "Momento lineal y choques", idea: "El momento total se conserva en todo choque.", teoria: `## Momento y choques\n\n**Momento lineal:** $\\vec{p} = m\\vec{v}$\n\n**Conservación:** $m_1\\vec{v}_1 + m_2\\vec{v}_2 = m_1\\vec{v}_1' + m_2\\vec{v}_2'$\n\n**Choque elástico (1D):**\n$$v_1' = \\frac{m_1-m_2}{m_1+m_2}v_1 + \\frac{2m_2}{m_1+m_2}v_2$$\n\n**Choque perfectamente inelástico:**\n$$v' = \\frac{m_1v_1 + m_2v_2}{m_1+m_2}$$`, errores: ["Confundir momento con energía cinética","En inelástico, la energía NO se conserva"], ejercicios: [{ titulo: "Choque elástico", enunciado: "$m_1=3$ kg, $v_1=5$ m/s, $m_2=2$ kg en reposo.", solucion: ["$v_1' = \\frac{3-2}{5}(5) = 1$ m/s","$v_2' = \\frac{2(3)}{5}(5) = 6$ m/s"] }] },
      { id: "rotacion", name: "Movimiento rotatorio", idea: "La rotación es el movimiento circular: ángulos, torque, momento de inercia.", teoria: `## Rotación\n\n**Velocidad angular:** $\\omega = \\frac{d\\theta}{dt}$\n\n**Aceleración angular:** $\\alpha = \\frac{d\\omega}{dt}$\n\n**Torque:** $\\vec{\\tau} = \\vec{r} \\times \\vec{F}$, $\\tau = rF\\sin\\theta$\n\n**2ª Ley para rotación:** $\\tau = I\\alpha$\n\n**Momento de inercia:**\n- Anillo: $I = MR^2$\n- Disco: $I = \\frac{1}{2}MR^2$\n- Esfera: $I = \\frac{2}{5}MR^2$\n\n**Energía rotacional:** $K = \\frac{1}{2}I\\omega^2$`, errores: ["Confundir velocidad angular con lineal ($v = \\omega r$)","Usar masa en vez de momento de inercia"], ejercicios: [{ titulo: "Torque", enunciado: "Fuerza de 10 N a 0.5 m del eje, 30°. Calcular torque.", solucion: ["$\\tau = rF\\sin\\theta = 0.5 \\cdot 10 \\cdot \\sin30°$","$\\tau = 0.5 \\cdot 10 \\cdot 0.5 = 2.5$ N·m"] }] },
      { id: "moh", name: "Movimiento armónico simple", idea: "El MAS es el movimiento que se repite: resortes, péndulos.", teoria: `## MAS\n\n**Ecuación:** $x(t) = A\\cos(\\omega t + \\phi)$\n\n**Período:** $T = \\frac{2\\pi}{\\omega}$\n\n**Frecuencia:** $f = 1/T$, $\\omega = 2\\pi f$\n\n**Resorte:** $F = -kx$, $\\omega = \\sqrt{k/m}$\n\n**Péndulo simple:** $\\omega = \\sqrt{g/l}$ (ángulos chicos)\n\n**Energía en MAS:** se conserva, oscila entre cinética y potencial.`, errores: ["Confundir frecuencia con período","Olvidar que el péndulo es solo para ángulos chicos"], ejercicios: [{ titulo: "Resorte", enunciado: "Resorte $k=200$ N/m, masa 0.5 kg. ¿Período?", solucion: ["$\\omega = \\sqrt{k/m} = \\sqrt{200/0.5} = 20$ rad/s","$T = 2\\pi/\\omega = 2\\pi/20 \\approx 0.314$ s"] }] }
    ]
  },
  {
    id: "penscomp", name: "Pensamiento Computacional", color: "#22c55e", icon: "⟨⟩",
    desc: "Lógica, algoritmos, programación",
    altillo: "https://www.altillo.com/examenes/uba/cbc/pensamientocomputacional/",
    units: [
      { id: "logica", name: "Lógica proposicional", idea: "La lógica es el arte de razonar con reglas.", teoria: `## Lógica\n\n**Proposiciones:** oraciones con valor de verdad (V/F).\n\n**Conectivas:**\n- $\\neg p$: negación\n- $p \\land q$: conjunción (y)\n- $p \\lor q$: disyunción (o)\n- $p \\to q$: condicional (si...entonces)\n- $p \\leftrightarrow q$: bicondicional\n\n**Condicional:** $p \\to q$ solo es F cuando $p$=V y $q$=F.\n\n**De Morgan:** $\\neg(p \\land q) = \\neg p \\lor \\neg q$\n**De Morgan:** $\\neg(p \\lor q) = \\neg p \\land \\neg q$`, errores: ["Confundir $\\lor$ con $\\land$","No saber que $p \\to q \\equiv \\neg p \\lor q$"], ejercicios: [{ titulo: "Tabla de verdad", enunciado: "$p \\to \\neg q$", solucion: ["$p$ | $q$ | $\\neg q$ | $p \\to \\neg q$","V | V | F | **F**","V | F | V | **V**","F | V | F | **V**","F | F | V | **V**"] }] },
      { id: "algoritmos", name: "Algoritmos y pseudocódigo", idea: "Un algoritmo es una receta paso a paso.", teoria: `## Algoritmos\n\n**Estructuras:**\n- Secuencia: pasos en orden\n- Selección: si/entonces/sino\n- Iteración: mientras, para\n\n**Pseudocódigo:**\n\`\`\`\nINICIO\n  LEER x\n  SI x >= 0 ENTONCES\n    IMPRIMIR "positivo"\n  SINO\n    IMPRIMIR "negativo"\n  FIN SI\nFIN\n\`\`\`\n\n**Complejidad:** $O(1) < O(\\log n) < O(n) < O(n^2) < O(2^n)$`, errores: ["No manejar casos borde","Confundir selección con iteración"], ejercicios: [{ titulo: "Suma pares", enunciado: "Sumar pares del 1 al n", solucion: ["suma ← 0","PARA i DESDE 1 HASTA n","  SI i MOD 2 = 0 ENTONCES suma ← suma + i","FIN PARA","IMPRIMIR suma"] }] },
      { id: "python", name: "Introducción a Python", idea: "Python es como hablar: escribís lo que querés.", teoria: `## Python\n\n**Variables:**\n\`\`\`python\nx = 10\nnombre = "FIUBA"\n\`\`\`\n\n**Condicionales:**\n\`\`\`python\nif x >= 0:\n    print("positivo")\nelse:\n    print("negativo")\n\`\`\`\n\n**Ciclos:**\n\`\`\`python\nfor i in range(1, 11): print(i)\n\nwhile x > 0:\n    x = x - 1\n\`\`\`\n\n**Funciones:**\n\`\`\`python\ndef sumar(a, b):\n    return a + b\n\`\`\``, errores: ["Usar \`=\` en vez de \`==\`","Olvidar \`:\` después del if/for","No indentar"], ejercicios: [{ titulo: "Primo", enunciado: " función que diga si n es primo", solucion: ["def es_primo(n):","    if n < 2: return False","    for i in range(2, int(n**0.5)+1):","        if n % i == 0: return False","    return True"] }] },
      { id: "datos", name: "Estructuras de datos", idea: "Organizar la información para que sea útil.", teoria: `## Estructuras de datos\n\n**Listas:** colección ordenada\n\`\`\`python\nlista = [1, 2, 3]\nlista.append(4)\n\`\`\`\n\n**Diccionarios:** pares clave-valor\n\`\`\`python\npersona = {"nombre": "Ana", "edad": 20}\n\`\`\`\n\n**Tuplas:** inmutables\n\`\`\`python\ncoord = (3, 4)\n\`\`\`\n\n**Conjuntos:** sin repetidos\n\`\`\`python\nnums = {1, 2, 3, 3}  # {1, 2, 3}\n\`\`\``, errores: ["Confundir lista con tupla","Olvidar que los diccionarios son mutables"], ejercicios: [{ titulo: "Frecuencia", enunciado: "Contar frecuencia de cada letra en un texto", solucion: ["def frecuencia(texto):","    freq = {}","    for c in texto:","        freq[c] = freq.get(c, 0) + 1","    return freq"] }] },
      { id: "busqueda-ordenamiento", name: "Búsqueda y ordenamiento", idea: "Encontrar datos rápido y ordenarlos eficientemente.", teoria: `## Búsqueda y ordenamiento\n\n**Búsqueda lineal:** revisa uno por uno. $O(n)$\n\n**Búsqueda binaria:** divide a la mitad (requiere lista ordenada). $O(\\log n)$\n\n**Bubble Sort:** compara vecinos y-swapea. $O(n^2)$\n\n**Selection Sort:** busca el mínimo y lo pone al inicio. $O(n^2)$\n\n**Insertion Sort:** inserta cada elemento en su lugar. $O(n^2)$`, errores: ["No verificar que la lista está ordenada para binaria","Usar sort cuando hay sort built-in"], ejercicios: [{ titulo: "Binaria", enunciado: "Implementar búsqueda binaria", solucion: ["def busqueda_binaria(lista, x):","    izq, der = 0, len(lista)-1","    while izq <= der:","        medio = (izq+der)//2","        if lista[medio] == x: return medio","        elif lista[medio] < x: izq = medio+1","        else: der = medio-1","    return -1"] }] }
    ]
  },
  {
    id: "ipc", name: "Introducción al Pensamiento Científico", color: "#06b6d4", icon: "🔬",
    desc: "Método científico, experimentación, pensamiento crítico",
    altillo: "https://www.altillo.com/examenes/uba/cbc/pensamiento/",
    units: [
      { id: "metodo", name: "El método científico", idea: "La ciencia no es una lista de datos: es un proceso.", teoria: `## Método científico\n\n**Pasos:**\n1. Observación\n2. Pregunta\n3. Hipótesis\n4. Predicción\n5. Experimentación\n6. Análisis\n7. Conclusión\n\n**Pseudociencia:** afirmaciones que parecen científicas pero no siguen el método.\n\n**Principio de falsabilidad (Popper):** una hipótesis solo es científica si se puede falsar.`, errores: ["Confundir correlación con causalidad","Aceptar sin evidencia"], ejercicios: [{ titulo: "Falsabilidad", enunciado: "¿Es falsable: 'Los astros influyen en tu destino'?", solucion: ["No se puede diseñar un experimento que lo refute","No hay manera de medir la influencia de estrellas sobre decisiones","**No es falsable → no es científica**"] }] },
      { id: "experimentacion", name: "Diseño experimental", idea: "Un buen experimento aislA la variable causal.", teoria: `## Diseño experimental\n\n**Grupo experimental:** recibe tratamiento\n**Grupo control:** no recibe\n\n**Errores:**\n- Sesgo de selección\n- Efecto Hawthorne\n- Variable confounding\n\n**Estadística descriptiva:**\n- Media: $\\bar{x} = \\frac{\\sum x_i}{n}$\n- Mediana\n- Moda\n- Desvío estándar: $s = \\sqrt{\\frac{\\sum(x_i-\\bar{x})^2}{n-1}}$`, errores: ["No tener control","Muestra chica","No aleatorizar"], ejercicios: [{ titulo: "Variables", enunciado: "¿La luz afecta plantas?", solucion: ["Independiente: cantidad de luz","Dependiente: altura","Control: tierra, agua, temperatura","**Aleatorizar** la asignación"] }] },
      { id: "probabilidad", name: "Probabilidad y azar", idea: "La probabilidad mide cuán probable es un evento.", teoria: `## Probabilidad\n\n**Definición clásica:** $P(A) = \\frac{\\text{casos favorables}}{\\text{casos totales}}$\n\n**Regla de la suma:** $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$\n\n**Regla del producto (independientes):** $P(A \\cap B) = P(A) \\cdot P(B)$\n\n**Condicionada:** $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$\n\n**Teorema de Bayes:**\n$$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$`, errores: ["Sumar probabilidades sin restar la intersección","Confundir independientes con disjuntos"], ejercicios: [{ titulo: "Bayes", enunciado: "1% tiene enfermedad, test 95% sensible, 90% específico. Positivo. ¿Probabilidad real?", solucion: ["$P(E)=0.01$, $P(+|E)=0.95$, $P(+|\\neg E)=0.10$","$P(E|+) = \\frac{0.95 \\cdot 0.01}{0.95 \\cdot 0.01 + 0.10 \\cdot 0.99} = \\frac{0.0095}{0.1085} \\approx 8.8\\%$"] }] },
      { id: "ciencia-datos", name: "Ciencia de datos", idea: "Los datos son el petróleo del siglo XXI.", teoria: `## Ciencia de datos\n\n**Proceso:**\n1. Recolección\n2. Limpieza\n3. Exploración (EDA)\n4. Modelado\n5. Interpretación\n\n**Visualización:**\n- Histograma: distribución\n- Scatter plot: correlación\n- Box plot: outliers, mediana\n\n**Correlación ≠ Causalidad:**\nque dos variables se muevan juntas no significa que una cause la otra.`, errores: ["Concluir causalidad de correlación","No limpiar datos antes de analizar"], ejercicios: [{ titulo: "Outliers", enunciado: "Datos: 10, 12, 11, 13, 100. ¿Es 100 outlier?", solucion: ["Media sin 100: 11.5","Media con 100: 29.2","El 100 distorsiona mucho la media","**Es outlier** — usar mediana en su lugar"] }] }
    ]
  },
  {
    id: "socyestado", name: "Sociedad y Estado", color: "#ec4899", icon: "⚖",
    desc: "Estado, derechos, política, sociedad argentina",
    altillo: "https://www.altillo.com/examenes/uba/cbc/socyestado/",
    units: [
      { id: "estado", name: "El Estado y su organización", idea: "El Estado es el conjunto de instituciones que organizan la vida en común.", teoria: `## Estado\n\n**Definición:** institución que ejerce poder sobre un territorio.\n\n**Elementos:** territorio, población, gobierno, soberanía.\n\n**Poderes:**\n- Ejecutivo: administra\n- Legislativo: hace leyes\n- Judicial: resuelve conflictos\n\n**Art. 1 CN:** "La Nación Argentina adopta para su gobierno la forma federal representativa republicana."`, errores: ["Confundir poder Ejecutivo con Legislativo","No conocer la Constitución"], ejercicios: [{ titulo: "Art. 1", enunciado: "¿Qué implica 'federal' en el art. 1?", solucion: ["Provincias conservan autonomía","El gobierno national comparte poder con provincias","Cada provincia tiene su propia constitución"] }] },
      { id: "constitucion", name: "La Constitución Nacional", idea: "La CN es la ley suprema: organiza el Estado y garantiza derechos.", teoria: `## Constitución\n\n**Partes:**\n- Preámbulo\n- Parte dogmática (derechos, arts. 1-43)\n- Parte orgánica (poderes, arts. 44-129)\n\n**Reforma de 1994:** incorporó derechos (ambiente, protección de ancianos, etc.)\n\n**Principios:**\n-legalidad\n- Separación de poderes\n- Supremacía constitucional\n- Autonomía provincial`, errores: ["No conocer la estructura de la CN","Confundir reforma de 1853 con 1994"], ejercicios: [{ titulo: "Dogmática", enunciado: "¿Qué derechos garantiza la parte dogmática?", solucion: ["Art. 14: libertades civiles","Art. 16: igualdad ante la ley","Art. 17: propiedad","Art. 18: libertad física","Art. 19: autonomía personal (art. de la Libertad)"] }] },
      { id: "derechos", name: "Derechos humanos", idea: "Los derechos son garantías que todos tenemos por existir.", teoria: `## Derechos humanos\n\n**Declaración Universal (1948):**\n- Civiles: vida, libertad\n- Políticos: voto, expresión\n- Económicos/sociales: trabajo, educación, salud\n\n**Generaciones:**\n1. Libertades negativas\n2. Derechos sociales\n3. Derechos colectivos (medio ambiente)\n\n**Principio pro homine:** interpretar a favor de mayor protección.`, errores: ["Pensar que los derechos son absolutos","Confundir derechos con obligaciones"], ejercicios: [{ titulo: "Generaciones", enunciado: "Clasificar: vida, educación, medio ambiente", solucion: ["Vida: 1ª generación (civil)","Educación: 2ª generación (social)","Medio ambiente: 3ª generación (colectivo)"] }] },
      { id: "politica", name: "Sistema político argentino", idea: "La política es la forma de tomar decisiones colectivas.", teoria: `## Sistema político\n\n**Forma:** federal, representativa, republicana\n\n**Elecciones:**\n- Paso (agosto): internas\n- Generales (octubre)\n- Ballotaje: >45% o >40% con +10%\n\n**Partidos:** agrupaciones que presentan candidatos\n\n**Ciudadanía:** nativos o naturalizados, 16+ para votar`, errores: ["No saber cuándo hay ballotaje","Confundir República con Monarquía"], ejercicios: [{ titulo: "Ballotaje", enunciado: "A: 42%, B: 39%, C: 19%. ¿Ballotaje?", solucion: ["A no tiene >45%","A no tiene >40% con +10% de B (diferencia = 3%)","**Sí hay ballotaje** entre A y B"] }] },
      { id: "sociedad", name: "Sociedad, cultura e identidad", idea: "La sociedad es el entramado de relaciones entre personas.", teoria: `## Sociedad y cultura\n\n**Socialización:** proceso por el que aprendemos normas.\n\n**Cultura:** conjunto de creencias, costumbres, valores.\n\n**Identidad:** quiénes somos como grupo.\n\n**Globalización:** interconexión mundial (económica, cultural, tecnológica).\n\n**Desigualdad:** distribución desigual de recursos y oportunidades.`, errores: ["Confundir cultura con civilización","Pensar que la globalización es solo económica"], ejercicios: [{ titulo: "Socialización", enunciado: "¿Qué agentes de socialización conocés?", solucion: ["Familia (primaria)","Escuela (secundaria)","Medios de comunicación","Grupo de pares","Internet y redes sociales"] }] },
      { id: "problemas-sociales", name: "Problemas sociales contemporáneos", idea: "Los grandes desafíos: pobreza, educación, tecnología, ambiente.", teoria: `## Problemas sociales\n\n**Pobreza:** falta de recursos para satisfacer necesidades básicas.\n\n**Educación:** derecho y herramienta de movilidad social.\n\n**Tecnología:** genera oportunidades y nuevas desigualdades.\n\n**Medio ambiente:** cambio climático, contaminación, recursos.\n\n**Género:** igualdad de derechos entre hombres y mujeres.\n\n**Migraciones:** desplazamientos por violencia, pobreza o cambio climático.`, errores: ["Reducir un problema a una sola causa","No considerar el contexto histórico"], ejercicios: [{ titulo: "Pobreza", enunciado: "¿Qué indicadores se usan para medir pobreza?", solucion: ["Línea de pobreza (canasta básica)","Ingreso per cápita","Índice de Gini (desigualdad)","IDH (desarrollo humano)"] }] }
    ]
  }
];

// ═══════════════════════════════════════════════════════
// PARCIALES
// ═══════════════════════════════════════════════════════
const PARCIALES_DATA = {
  am1: [
    { año: 2025, cuat: "1°", cátedra: "Gutiérrez", temas: ["Funciones", "Números reales", "Sucesiones"], ejercicios: [
      { enunciado: "Dominio de $f(x) = \\sqrt{\\frac{x-1}{x+2}}$", pasos: ["Raíz: argumento $\\geq 0$","$\\frac{x-1}{x+2} \\geq 0$","Dominio: $(-\\infty, -2) \\cup [1, +\\infty)$"], errores: ["No contemplar $x < -2$"] },
      { enunciado: "$$a_n = \\frac{3n^2+1}{n^2+2n}$$, Calcular $\\lim a_n$", pasos: ["Dividir por $n^2$: $\\frac{3+1/n^2}{1+2/n}$","$\\lim = \\frac{3}{1} = 3$"], errores: ["No dividir por la mayor potencia"] }
    ]},
    { año: 2025, cuat: "2°", cátedra: "Gutiérrez", temas: ["Límites", "Derivadas", "L'Hôpital"], ejercicios: [
      { enunciado: "$$\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$$", pasos: ["$\\frac{0}{0}$ → límite notable","$\\lim \\frac{\\sin(kx)}{x} = k$","= 3"], errores: ["No verificar indeterminación"] },
      { enunciado: "$$\\lim_{x \\to 0} \\frac{1-\\cos x}{x^2}$$", pasos: ["$\\frac{0}{0}$ → L'Hôpital: $\\frac{\\sin x}{2x}$","Todavía $\\frac{0}{0}$ → L'Hôpital: $\\frac{\\cos x}{2}$","= $\\frac{1}{2}$"], errores: ["No aplicar L'Hôpital dos veces"] }
    ]},
    { año: 2024, cuat: "2°", cátedra: "Gutiérrez", temas: ["Taylor", "Integrales"], ejercicios: [
      { enunciado: "Taylor de orden 3 de $e^x$ en $a=0$", pasos: ["$f(0)=f'(0)=f''(0)=f'''(0)=1$","$T_3(x) = 1 + x + \\frac{x^2}{2} + \\frac{x^3}{6}$"], errores: ["Olvidar $0!=1$"] },
      { enunciado: "$$\\int x e^x dx$$", pasos: ["Partes: $u=x$, $dv=e^x dx$","$= xe^x - e^x + C = e^x(x-1)+C$"], errores: ["Error de signo en partes"] }
    ]}
  ],
  algebra: [
    { año: 2025, cuat: "1°", cátedra: "Cátedra Única", temas: ["Sistemas", "Matrices", "Determinantes"], ejercicios: [
      { enunciado: "$$\\begin{cases} 2x+y=5 \\\\ x-y=1 \\end{cases}$$", pasos: ["Suma: $3x=6$ → $x=2$","$y=1$"], errores: ["Error algebraico"] },
      { enunciado: "$A = \\begin{pmatrix} 3 & 1 \\\\ 5 & 2 \\end{pmatrix}$, Hallar $A^{-1}$", pasos: ["$\\det A = 1$","$A^{-1} = \\begin{pmatrix} 2 & -1 \\\\ -5 & 3 \\end{pmatrix}$"], errores: ["Olvidar dividir por determinante"] }
    ]},
    { año: 2025, cuat: "2°", cátedra: "Cátedra Única", temas: ["Transformaciones", "Autovalores"], ejercicios: [
      { enunciado: "Autovalores de $\\begin{pmatrix} 4 & 1 \\\\ 2 & 3 \\end{pmatrix}$", pasos: ["$(4-\\lambda)(3-\\lambda)-2=0$","$\\lambda^2-7\\lambda+10=0$","$\\lambda_1=5$, $\\lambda_2=2$"], errores: ["Error en polinomio característico"] }
    ]}
  ],
  fisica: [
    { año: 2025, cuat: "1°", cátedra: "Cátedra Única", temas: ["Cinemática", "Dinámica"], ejercicios: [
      { enunciado: "Lanzamiento a 30 m/s, 45°. Alcance.", pasos: ["$v_{0x} = v_{0y} = 21.2$ m/s","$R = \\frac{v_0^2 \\sin 2\\theta}{g} = \\frac{900}{9.8} \\approx 91.8$ m"], errores: ["No separar en componentes"] },
      { enunciado: "Bloque 5 kg, plano 30°, $\\mu=0.2$. ¿Aceleración?", pasos: ["$mg\\sin30° = 24.5$ N","$f = \\mu mg\\cos30° = 8.48$ N","$a = (24.5-8.48)/5 = 3.2$ m/s²"], errores: ["Confundir seno con coseno"] }
    ]},
    { año: 2025, cuat: "2°", cátedra: "Cátedra Única", temas: ["Trabajo y energía", "Choques"], ejercicios: [
      { enunciado: "Objeto cae desde 10 m. Velocidad al suelo.", pasos: ["$mgh = \\frac{1}{2}mv^2$","$v = \\sqrt{2gh} = \\sqrt{196} = 14$ m/s"], errores: ["Olvidar que $v_0=0$"] },
      { enunciado: "$m_1=3$kg, $v_1=5$m/s, $m_2=2$kg en reposo. Choque elástico.", pasos: ["$v_1' = \\frac{3-2}{5}(5) = 1$ m/s","$v_2' = \\frac{6}{5}(5) = 6$ m/s"], errores: ["Confundir elástico con inelástico"] }
    ]}
  ],
  penscomp: [
    { año: 2025, cuat: "1°", cátedra: "Méndez", temas: ["Lógica", "Algoritmos"], ejercicios: [
      { enunciado: "Tabla de $p \\to \\neg q$", pasos: ["Solo F cuando $p$=V y $q$=V","Todas las demás son V"], errores: ["Confundir condicional"] },
      { enunciado: "¿7 es primo?", pasos: ["Verificar divisores de 2 a $\\sqrt{7} \\approx 2.6$","Solo 2: 7 mod 2 = 1 ≠ 0","**Es primo**"], errores: ["Verificar hasta $n$ en vez de $\\sqrt{n}$"] }
    ]}
  ],
  ipc: [
    { año: 2024, cuat: "1°", cátedra: "Dufour", temas: ["Método científico", "Probabilidad"], ejercicios: [
      { enunciado: "1% enfermedad, test 95% sensible, 90% específico. Positivo. ¿Prob. real?", pasos: ["$P(E|+) = \\frac{0.95 \\cdot 0.01}{0.95 \\cdot 0.01 + 0.10 \\cdot 0.99}$","$= \\frac{0.0095}{0.1085} \\approx 8.8\\%$"], errores: ["Confundir sensibilidad con valor predictivo"] }
    ]}
  ],
  socyestado: [
    { año: 2025, cuat: "1°", cátedra: "Bertino", temas: ["Estado", "Constitución", "Derechos"], ejercicios: [
      { enunciado: "¿Qué implica el art. 1 de la CN?", pasos: ["Forma federal: provincias autónomas","Representativa: gobernantes elegidos","Republicana: separación de poderes"], errores: ["No conocer la Constitución"] },
      { enunciado: "A: 42%, B: 39%, C: 19%. ¿Ballotaje?", pasos: ["A no tiene >45%","Diferencia A-B = 3% < 10%","**Sí hay ballotaje**"], errores: ["Confundir los porcentajes"] }
    ]}
  ]
};

// ═══════════════════════════════════════════════════════
// HELPERS
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
    .replace(/`([^`]+)`/g,"<code style='background:rgba(139,92,246,0.1);padding:0.1rem 0.3rem;border-radius:4px;font-size:0.78rem'>$1</code>")
    .replace(/^## (.+)$/gm,"<h3 style='font-size:0.88rem;font-weight:700;margin:0.8rem 0 0.3rem;color:var(--text-primary)'>$1</h3>")
    .replace(/^### (.+)$/gm,"<h4 style='font-size:0.82rem;font-weight:700;margin:0.6rem 0 0.2rem;color:var(--text-primary)'>$1</h4>")
    .replace(/\n\n/g,"</p><p style='margin:0.3rem 0'>")
    .replace(/\n/g,"<br>");
  h = "<p style='margin:0.3rem 0'>" + h + "</p>";
  return btKatex(h);
}

function renderMath(el) {
  setTimeout(() => {
    if (window.renderMathInElement) {
      try { window.renderMathInElement(el, { delimiters: [{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}], throwOnError:false }); } catch {}
    }
  }, 50);
}

function toggleBiblic(id) { const el = document.getElementById(id); if (el) el.style.display = el.style.display === "none" ? "block" : "none"; }
function saveExamDate(s, d) { const sv = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}"); if (d) sv[s] = d; else delete sv[s]; localStorage.setItem("biblic_exam_dates", JSON.stringify(sv)); }
function createStudyPlan() { const s = document.getElementById("biblic-plan-subj")?.value, d = document.getElementById("biblic-plan-date")?.value; if (!s || !d) return; saveExamDate(s, d); BIBLIC_TIZA.currentSubject = s; BIBLIC_TIZA.currentView = "plan"; renderBiblioteca(); }

// ═══════════════════════════════════════════════════════
// RENDER
// ═══════════════════════════════════════════════════════
function renderBiblioteca() {
  const el = document.getElementById("biblioteca-view");
  if (!el) return;
  const v = BIBLIC_TIZA.currentView;
  if (v === "home") renderHome(el);
  else if (v === "subject") renderSubject(el);
  else if (v === "unit") renderUnit(el);
  else if (v === "parciales") renderParcial(el);
  else if (v === "plan") renderPlan(el);
}

function renderHome(el) {
  const saved = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}");
  el.innerHTML = `<div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
    <div style="text-align:center;margin-bottom:1.5rem">
      <h1 style="font-family:var(--font-heading);font-size:1.35rem;color:var(--text-primary);margin-bottom:0.2rem">📚 CBC</h1>
      <p style="color:var(--text-muted);font-size:0.78rem">Explicaciones paso a paso · Parciales resueltos · Plan de estudio</p>
    </div>
    <div style="background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(59,130,246,0.05));border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:0.8rem 1rem;margin-bottom:1rem">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem"><span style="font-size:0.85rem">🎯</span><span style="font-size:0.78rem;font-weight:700;color:var(--text-primary)">Plan de estudio</span></div>
      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center">
        <select id="biblic-plan-subj" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.5rem;font-size:0.7rem;color:var(--text-primary);min-width:140px">${BIBLIC_MATERIAS.map(m=>`<option value="${m.id}">${m.name}</option>`).join("")}</select>
        <input type="date" id="biblic-plan-date" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.5rem;font-size:0.7rem;color:var(--text-primary)">
        <button onclick="createStudyPlan()" style="padding:0.3rem 0.7rem;background:#8b5cf6;color:white;border:none;border-radius:8px;font-size:0.7rem;font-weight:600;cursor:pointer">Armar</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:0.5rem;margin-bottom:1.2rem">
      ${BIBLIC_MATERIAS.map(m=>{const ex=PARCIALES_DATA[m.id]||[];return`<div onclick="BIBLIC_TIZA.currentView='subject';BIBLIC_TIZA.currentSubject='${m.id}';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:0.8rem;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='${m.color}50'" onmouseout="this.style.borderColor='var(--border-color)'"><div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem"><div style="width:36px;height:36px;border-radius:9px;background:${m.color}18;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:${m.color};border:1px solid ${m.color}30">${m.icon}</div><div style="flex:1;min-width:0"><div style="font-size:0.8rem;font-weight:700;color:var(--text-primary)">${m.name}</div><div style="font-size:0.62rem;color:var(--text-muted)">${m.units.length} unidades · ${ex.length} parciales</div></div></div>${saved[m.id]?`<div style="font-size:0.58rem;color:#f59e0b;margin-top:0.2rem">📅 ${saved[m.id]}</div>`:''}</div>`}).join("")}
    </div>
    <div style="margin-bottom:1.2rem"><h3 style="font-size:0.85rem;font-weight:700;color:var(--text-primary);margin-bottom:0.5rem">📄 Parciales recientes</h3><div style="display:flex;flex-direction:column;gap:0.35rem">${Object.entries(PARCIALES_DATA).flatMap(([mid,exams])=>{const mat=BIBLIC_MATERIAS.find(m=>m.id===mid);if(!mat)return[];return exams.map((ex,i)=>`<div onclick="BIBLIC_TIZA.currentView='parciales';BIBLIC_TIZA.currentSubject='${mid}';window._parcIdx=${i};renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.55rem 0.7rem;cursor:pointer;display:flex;align-items:center;justify-content:space-between" onmouseover="this.style.borderColor='${mat.color}40'" onmouseout="this.style.borderColor='var(--border-color)'"><div style="display:flex;align-items:center;gap:0.4rem"><div style="width:6px;height:6px;border-radius:50%;background:${mat.color};flex-shrink:0"></div><span style="font-size:0.72rem;font-weight:600;color:var(--text-primary)">${mat.name}</span><span style="font-size:0.6rem;color:var(--text-muted)">${ex.año} · ${ex.cátedra}</span></div><div style="display:flex;gap:0.2rem">${ex.temas.map(t=>`<span style="font-size:0.52rem;padding:0.08rem 0.3rem;background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:4px;color:#8b5cf6">${t}</span>`).join("")}</div></div>`)}).join("")}</div></div>
    <div style="padding:0.7rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px"><div style="font-size:0.72rem;font-weight:700;color:var(--text-primary);margin-bottom:0.3rem">📂 Repositorios</div><div style="display:flex;flex-direction:column;gap:0.2rem">${BIBLIC_MATERIAS.map(m=>`<a href="${m.altillo}" target="_blank" style="font-size:0.68rem;color:${m.color};text-decoration:none;display:flex;align-items:center;gap:0.3rem" onclick="event.stopPropagation()">→ <span style="font-weight:600">${m.name}</span> <span style="color:var(--text-muted);font-weight:400">— Altillo</span></a>`).join("")}</div></div>
  </div>`;
  renderMath(el);
}

function renderSubject(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  if (!mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }
  const saved = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}");
  el.innerHTML = `<div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem">
      <button onclick="BIBLIC_TIZA.currentView='home';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← CBC</button>
      <div style="width:30px;height:30px;border-radius:8px;background:${mat.color}18;display:flex;align-items:center;justify-content:center;font-size:0.95rem;color:${mat.color}">${mat.icon}</div>
      <h2 style="font-size:1.05rem;font-weight:700;color:var(--text-primary);margin:0">${mat.name}</h2>
    </div>
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.6rem 0.8rem;margin-bottom:0.8rem;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">
      <span style="font-size:0.72rem;font-weight:600;color:var(--text-primary)">📅 Parcial:</span>
      <input type="date" id="subj-date" value="${saved[mat.id]||''}" onchange="saveExamDate('${mat.id}',this.value)" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:6px;padding:0.25rem 0.4rem;font-size:0.68rem;color:var(--text-primary)">
      ${saved[mat.id]?`<button onclick="BIBLIC_TIZA.currentView='plan';renderBiblioteca()" style="padding:0.2rem 0.5rem;background:#8b5cf6;color:white;border:none;border-radius:6px;font-size:0.65rem;font-weight:600;cursor:pointer">Ver plan</button>`:''}
      <a href="${mat.altillo}" target="_blank" style="margin-left:auto;font-size:0.62rem;color:${mat.color};text-decoration:none">→ Altillo</a>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1rem">${mat.units.map((u,i)=>`<div onclick="BIBLIC_TIZA.currentView='unit';BIBLIC_TIZA.currentUnit='${u.id}';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;cursor:pointer;transition:all 0.15s" onmouseover="this.style.borderColor='${mat.color}40'" onmouseout="this.style.borderColor='var(--border-color)'"><div style="display:flex;align-items:center;gap:0.5rem"><span style="width:26px;height:26px;border-radius:50%;background:${mat.color}20;display:flex;align-items:center;justify-content:center;font-size:0.68rem;font-weight:700;color:${mat.color};flex-shrink:0">${i+1}</span><div style="flex:1;min-width:0"><div style="font-size:0.8rem;font-weight:700;color:var(--text-primary)">${u.name}</div><div style="font-size:0.65rem;color:var(--text-muted);font-style:italic">"${u.idea}"</div></div><span style="font-size:0.55rem;color:var(--text-muted)">${u.ejercicios.length} ej</span></div></div>`).join("")}</div>
    ${PARCIALES_DATA[mat.id]?`<h3 style="font-size:0.82rem;font-weight:700;color:var(--text-primary);margin-bottom:0.4rem">📄 Parciales</h3><div style="display:flex;flex-direction:column;gap:0.35rem">${PARCIALES_DATA[mat.id].map((ex,i)=>`<div onclick="BIBLIC_TIZA.currentView='parciales';window._parcIdx=${i};renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem 0.6rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onmouseover="this.style.borderColor='${mat.color}40'" onmouseout="this.style.borderColor='var(--border-color)'"><span style="font-size:0.7rem;font-weight:600;color:var(--text-primary)">${ex.año} · ${ex.cuat}° · ${ex.cátedra}</span><span style="font-size:0.55rem;color:var(--text-muted)">${ex.ejercicios.length} ejercicios</span></div>`).join("")}</div>`:''}
  </div>`;
}

function renderUnit(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  if (!mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }
  const unit = mat.units.find(u => u.id === BIBLIC_TIZA.currentUnit);
  if (!unit) { BIBLIC_TIZA.currentView = "subject"; renderBiblioteca(); return; }
  const ui = mat.units.indexOf(unit);
  el.innerHTML = `<div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.6rem">
      <button onclick="BIBLIC_TIZA.currentView='subject';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← ${mat.name}</button>
    </div>
    <div style="text-align:center;margin-bottom:1rem;padding:0.8rem;background:linear-gradient(135deg,${mat.color}10,${mat.color}05);border:1px solid ${mat.color}25;border-radius:12px">
      <div style="font-size:0.58rem;color:${mat.color};font-weight:600;margin-bottom:0.1rem">UNIDAD ${ui+1}/${mat.units.length}</div>
      <h2 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin:0 0 0.2rem">${unit.name}</h2>
      <p style="font-size:0.75rem;color:var(--text-muted);font-style:italic">"${unit.idea}"</p>
    </div>
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;padding:0.8rem 1rem;margin-bottom:0.8rem"><div style="font-size:0.78rem;color:var(--text-primary);line-height:1.65">${btMd(unit.teoria)}</div></div>
    <div style="background:linear-gradient(135deg,rgba(239,68,68,0.06),rgba(220,38,38,0.03));border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:0.7rem;margin-bottom:0.8rem">
      <div style="font-size:0.75rem;font-weight:700;color:#ef4444;margin-bottom:0.3rem">⚠ Errores comunes</div>
      ${unit.errores.map(er=>`<div style="display:flex;gap:0.35rem;align-items:flex-start;margin-bottom:0.25rem;padding:0.25rem 0.35rem;background:rgba(239,68,68,0.04);border-radius:5px"><span style="color:#ef4444;font-size:0.62rem;flex-shrink:0">✗</span><span style="font-size:0.68rem;color:var(--text-primary);line-height:1.4">${btKatex(er)}</span></div>`).join("")}
    </div>
    <div style="font-size:0.82rem;font-weight:700;color:var(--text-primary);margin-bottom:0.4rem">📝 Ejercicios</div>
    ${unit.ejercicios.map((ej,ei)=>`<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;margin-bottom:0.4rem">
      <div style="font-size:0.75rem;font-weight:700;color:var(--text-primary);margin-bottom:0.25rem">${ej.titulo}</div>
      <div style="font-size:0.78rem;color:var(--text-primary);padding:0.4rem;background:var(--bg-secondary);border-radius:7px;margin-bottom:0.4rem">${btKatex(ej.enunciado)}</div>
      <div id="unit-sol-${ei}" style="display:none;margin-bottom:0.3rem"><div style="font-size:0.65rem;font-weight:600;color:#22c55e;margin-bottom:0.2rem">✅ Solución:</div>${ej.solucion.map(s=>`<div style="display:flex;gap:0.3rem;align-items:flex-start;margin-bottom:0.15rem;padding:0.2rem 0.35rem;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.15);border-radius:5px"><span style="color:#22c55e;font-size:0.6rem;flex-shrink:0">✓</span><span style="font-size:0.68rem;color:var(--text-primary);line-height:1.4">${btKatex(s)}</span></div>`).join("")}</div>
      <div style="display:flex;gap:0.25rem">
        <button onclick="toggleBiblic('unit-sol-${ei}')" style="padding:0.2rem 0.5rem;background:rgba(139,92,246,0.1);color:#8b5cf6;border:1px solid rgba(139,92,246,0.25);border-radius:6px;font-size:0.6rem;cursor:pointer;font-weight:600">Solución</button>
        <button onclick="switchView('chat');const ci=document.getElementById('chatInput');ci.value='Explicá: ${ej.titulo} de ${mat.name}';ci.focus()" style="padding:0.2rem 0.5rem;background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid rgba(59,130,246,0.25);border-radius:6px;font-size:0.6rem;cursor:pointer;font-weight:600">Chat</button>
      </div>
    </div>`).join("")}
    <div style="display:flex;justify-content:space-between;margin-top:0.8rem">
      ${ui>0?`<button onclick="BIBLIC_TIZA.currentUnit='${mat.units[ui-1].id}';renderBiblioteca()" style="padding:0.35rem 0.7rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;font-size:0.68rem;cursor:pointer;color:var(--text-primary)">← ${mat.units[ui-1].name}</button>`:'<div></div>'}
      ${ui<mat.units.length-1?`<button onclick="BIBLIC_TIZA.currentUnit='${mat.units[ui+1].id}';renderBiblioteca()" style="padding:0.35rem 0.7rem;background:${mat.color};color:white;border:none;border-radius:8px;font-size:0.68rem;cursor:pointer;font-weight:600">${mat.units[ui+1].name} →</button>`:'<div></div>'}
    </div>
  </div>`;
  renderMath(el);
}

function renderParcial(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  const exams = PARCIALES_DATA[BIBLIC_TIZA.currentSubject] || [];
  const ex = exams[window._parcIdx || 0];
  if (!ex || !mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }
  el.innerHTML = `<div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.6rem">
      <button onclick="BIBLIC_TIZA.currentView='subject';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← ${mat.name}</button>
      <h2 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin:0">📄 ${ex.año} · ${ex.cuat}°C · ${ex.cátedra}</h2>
    </div>
    <div style="display:flex;gap:0.25rem;flex-wrap:wrap;margin-bottom:0.8rem">${ex.temas.map(t=>`<span style="font-size:0.55rem;padding:0.1rem 0.4rem;background:${mat.color}15;border:1px solid ${mat.color}30;border-radius:5px;color:${mat.color};font-weight:600">${t}</span>`).join("")}</div>
    ${ex.ejercicios.map((ej,ei)=>`<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem;margin-bottom:0.4rem">
      <div style="font-size:0.7rem;font-weight:700;color:var(--text-primary);margin-bottom:0.3rem">Ejercicio ${ei+1}</div>
      <div style="font-size:0.78rem;color:var(--text-primary);padding:0.4rem;background:var(--bg-secondary);border-radius:7px;margin-bottom:0.4rem">${btKatex(ej.enunciado)}</div>
      <div id="p-sol-${ei}" style="display:none;margin-bottom:0.3rem"><div style="font-size:0.65rem;font-weight:600;color:#22c55e;margin-bottom:0.2rem">Resolución:</div>${ej.pasos.map(p=>`<div style="display:flex;gap:0.3rem;align-items:flex-start;margin-bottom:0.15rem;padding:0.2rem 0.35rem;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.15);border-radius:5px"><span style="color:#22c55e;font-size:0.6rem;flex-shrink:0">✓</span><span style="font-size:0.68rem;color:var(--text-primary);line-height:1.4">${btKatex(p)}</span></div>`).join("")}</div>
      <div id="p-err-${ei}" style="display:none;margin-bottom:0.3rem"><div style="font-size:0.65rem;font-weight:600;color:#ef4444;margin-bottom:0.2rem">⚠ Errores:</div>${ej.errores.map(er=>`<div style="display:flex;gap:0.3rem;align-items:flex-start;margin-bottom:0.15rem;padding:0.2rem 0.35rem;background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.15);border-radius:5px"><span style="color:#ef4444;font-size:0.6rem;flex-shrink:0">✗</span><span style="font-size:0.65rem;color:var(--text-primary)">${btKatex(er)}</span></div>`).join("")}</div>
      <div style="display:flex;gap:0.25rem">
        <button onclick="toggleBiblic('p-sol-${ei}')" style="padding:0.2rem 0.5rem;background:rgba(139,92,246,0.1);color:#8b5cf6;border:1px solid rgba(139,92,246,0.25);border-radius:6px;font-size:0.6rem;cursor:pointer;font-weight:600">Pasos</button>
        <button onclick="toggleBiblic('p-err-${ei}')" style="padding:0.2rem 0.5rem;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.25);border-radius:6px;font-size:0.6rem;cursor:pointer;font-weight:600">Errores</button>
        <button onclick="switchView('chat');const ci=document.getElementById('chatInput');ci.value='Explicá: ${ej.enunciado.replace(/'/g,"\\'").replace(/\$/g,"\\$")}';ci.focus()" style="padding:0.2rem 0.5rem;background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid rgba(59,130,246,0.25);border-radius:6px;font-size:0.6rem;cursor:pointer;font-weight:600">Chat</button>
      </div>
    </div>`).join("")}
  </div>`;
  renderMath(el);
}

function renderPlan(el) {
  const mat = BIBLIC_MATERIAS.find(m => m.id === BIBLIC_TIZA.currentSubject);
  if (!mat) { BIBLIC_TIZA.currentView = "home"; renderBiblioteca(); return; }
  const saved = JSON.parse(localStorage.getItem("biblic_exam_dates") || "{}");
  const examDate = saved[mat.id];
  if (!examDate) { BIBLIC_TIZA.currentView = "subject"; renderBiblioteca(); return; }
  const today = new Date(), exam = new Date(examDate);
  const daysLeft = Math.max(1, Math.ceil((exam - today) / (1000*60*60*24)));
  const dpu = Math.max(1, Math.floor(daysLeft / mat.units.length));
  el.innerHTML = `<div style="max-width:820px;margin:0 auto;padding:1.5rem 1.2rem">
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.8rem">
      <button onclick="BIBLIC_TIZA.currentView='subject';renderBiblioteca()" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.25rem 0.5rem;cursor:pointer;font-size:0.68rem;color:var(--text-muted)">← ${mat.name}</button>
      <h2 style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin:0">🎯 Plan de estudio</h2>
    </div>
    <div style="background:linear-gradient(135deg,${mat.color}10,${mat.color}05);border:1px solid ${mat.color}25;border-radius:12px;padding:0.8rem;margin-bottom:0.8rem;text-align:center">
      <div style="font-size:1.8rem;font-weight:800;color:${mat.color}">${daysLeft}</div>
      <div style="font-size:0.72rem;color:var(--text-muted)">días para el parcial</div>
      <div style="font-size:0.62rem;color:var(--text-muted);margin-top:0.15rem">📅 ${examDate}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:0.35rem">${mat.units.map((u,i)=>{const s=i*dpu+1, e=Math.min((i+1)*dpu,daysLeft);return`<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.6rem;display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:0.5rem"><span style="width:26px;height:26px;border-radius:50%;background:${mat.color}18;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:${mat.color};flex-shrink:0">${i+1}</span><div><div style="font-size:0.75rem;font-weight:700;color:var(--text-primary)">${u.name}</div><div style="font-size:0.58rem;color:var(--text-muted)">Días ${s}–${e} · ${u.ejercicios.length} ej</div></div></div><button onclick="BIBLIC_TIZA.currentUnit='${u.id}';BIBLIC_TIZA.currentView='unit';renderBiblioteca()" style="padding:0.2rem 0.5rem;background:${mat.color}15;color:${mat.color};border:1px solid ${mat.color}30;border-radius:6px;font-size:0.58rem;cursor:pointer;font-weight:600">Estudiar</button></div>`}).join("")}</div>
    <div style="margin-top:0.8rem;padding:0.7rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px">
      <div style="font-size:0.72rem;font-weight:700;color:var(--text-primary);margin-bottom:0.3rem">💡 Tips</div>
      <div style="font-size:0.68rem;color:var(--text-muted);line-height:1.5">• Hacé los ejercicios SIN mirar la solución<br>• Resolvé al menos 1 parcial completo cronometrado<br>• Si un tema no cierra, pedile explicación al chat</div>
    </div>
  </div>`;
}

window.renderBiblioteca = renderBiblioteca;
window.toggleBiblic = toggleBiblic;
window.saveExamDate = saveExamDate;
window.createStudyPlan = createStudyPlan;
window._parcIdx = 0;
