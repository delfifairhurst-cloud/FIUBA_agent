// fiuble.js - FIUBLE v2: Wordle matemático diario (sin IA, sin costo)
const FIUBLE_KEY = 'fiuba_fiuble';
const FIUBLE_TUTORIAL = 'fiuba_fiuble_tutorial';

// ─── ENGINEERING WORD BANK (Wordle mode ~80%) ───
const FIUBLE_WORDS = [
  // Matemática
  { w: "MATRIZ", topic: "Álgebra", hint: "Arreglo de números en filas y columnas" },
  { w: "VECTOR", topic: "Álgebra", hint: "Tiene magnitud y dirección" },
  { w: "LIMITE", topic: "Análisis", hint: "Valor al que tiende una función" },
  { w: "DERIVA", topic: "Análisis", hint: "Pendiente instantánea" },
  { w: "INTEGRA", topic: "Análisis", hint: "Antiderivada / área bajo curva" },
  { w: "TENSOR", topic: "Álgebra", hint: "Generalización de escalar y vector" },
  { w: "EIGEN", topic: "Álgebra", hint: "Valor/vector propio" },
  { w: "BINOMIO", topic: "Álgebra", hint: "Expresión de dos términos" },
  { w: "FACTOR", topic: "Álgebra", hint: "Cada parte de una multiplicación" },
  { w: "MATRIZ", topic: "Álgebra", hint: " Tabla numérica" },
  { w: "RADIAN", topic: "Análisis", hint: "Unidad natural de ángulo" },
  // Física
  { w: "FUERZA", topic: "Física", hint: "Causa de aceleración, F=ma" },
  { w: "ENERGIA", topic: "Física", hint: "Capacidad para hacer trabajo" },
  { w: "INERCIA", topic: "Física", hint: "Resistencia al cambio de movimiento" },
  { w: "MOMENTO", topic: "Física", hint: "p=m·v o r×F" },
  { w: "POTENCIA", topic: "Física", hint: "Trabajo por unidad de tiempo" },
  { w: "PRESION", topic: "Física", hint: "Fuerza sobre área" },
  { w: "DENSIDA", topic: "Física", hint: "Masa por volumen (sin tilde)" },
  { w: "GRAVEDA", topic: "Física", hint: "Campo de 9.8 m/s²" },
  { w: "CALOR", topic: "Física", hint: "Energía en tránsito por diferencia de T" },
  { w: "ENTROPI", topic: "Física", hint: "Medida del desorden" },
  { w: "OSCILA", topic: "Física", hint: "Movimiento periódico alrededor del equilibrio" },
  // Eléctrica / Señales
  { w: "OHMIO", topic: "Circuitos", hint: "Unidad de resistencia" },
  { w: "VOLTIO", topic: "Circuitos", hint: "Unidad de tensión" },
  { w: "CORRIEN", topic: "Circuitos", hint: "Flujo de carga" },
  { w: "CIRCUIT", topic: "Circuitos", hint: "Camino cerrado para la corriente" },
  { w: "BOBINA", topic: "Circuitos", hint: "Inductor enrollado" },
  { w: "FARADIO", topic: "Circuitos", hint: "Unidad de capacidad (sin tilde)" },
  { w: "LAPLACE", topic: "Señales", hint: "Transformada para EDOs" },
  { w: "FOURIER", topic: "Señales", hint: "Descomposición en senos" },
  { w: "FILTRO", topic: "Señales", hint: "Deja pasar ciertas frecuencias" },
  { w: "MUESTRA", topic: "Señales", hint: "Valor discreto de una señal" },
  // Química / Materiales
  { w: "ATOMO", topic: "Química", hint: "Unidad mínima de elemento" },
  { w: "ENLACE", topic: "Química", hint: "Unión entre átomos" },
  { w: "MOLAR", topic: "Química", hint: "Masa por mol" },
  { w: "ACIDO", topic: "Química", hint: "Dona protones, pH<7" },
  { w: "BASE", topic: "Química", hint: "Acepta protones, pH>7" },
  { w: "OXIDO", topic: "Química", hint: "Compuesto con oxígeno" },
  { w: "ALEACI", topic: "Materiales", hint: "Mezcla de metales" },
  { w: "ACERO", topic: "Materiales", hint: "Hierro + carbono" },
  { w: "POLIMER", topic: "Materiales", hint: "Macromolécula de monómeros" },
  // Civil / Mecánica / Fluidos
  { w: "VIGA", topic: "Estructuras", hint: "Elemento que resiste flexión" },
  { w: "PUENTE", topic: "Estructuras", hint: "Cruza un vano" },
  { w: "COLUMNA", topic: "Estructuras", hint: "Elemento a compresión vertical" },
  { w: "TORSION", topic: "Mecánica", hint: "Giro por momento torsor" },
  { w: "CORTE", topic: "Mecánica", hint: "Esfuerzo tangencial" },
  { w: "FLUJO", topic: "Fluidos", hint: "Movimiento de fluido" },
  { w: "VISCOSO", topic: "Fluidos", hint: "Fluido con resistencia interna" },
  { w: "BERNOUL", topic: "Fluidos", hint: "Principio de energía en fluidos" },
  { w: "REYNOLD", topic: "Fluidos", hint: "Número adimensional de régimen" },
  // Programación / Sistemas
  { w: "ALGORIT", topic: "Programación", hint: "Pasos para resolver un problema" },
  { w: "COMPILA", topic: "Programación", hint: "Traduce código fuente" },
  { w: "HEAP", topic: "Programación", hint: "Memoria dinámica" },
  { w: "STACK", topic: "Programación", hint: "Pila LIFO" },
  { w: "CLASE", topic: "Programación", hint: "Molde de objetos" },
  { w: "HERENCIA", topic: "Programación", hint: "Reutiliza de clase padre" },
  { w: "SOCKET", topic: "Redes", hint: "Extremo de comunicación" },
  { w: "ROUTER", topic: "Redes", hint: "Enruta paquetes" },
  { w: "CACHE", topic: "Sistemas", hint: "Memoria rápida intermedia" },
  { w: "KERNEL", topic: "Sistemas", hint: "Núcleo del SO" },
  // Industrial / Optimización
  { w: "STOCK", topic: "Industrial", hint: "Inventario" },
  { w: "PERT", topic: "Industrial", hint: "Técnica de planificación" },
  { w: "FORD", topic: "Industrial", hint: "Pionero de línea de montaje" },
  { w: "TAYLOR", topic: "Industrial", hint: "Padre de la administración científica" },
];

// ─── EQUATION GENERATOR ───
function randInt(rng, min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

const GEN = {
  aritmetica(rng, diff) {
    const ops = diff === 1 ? ['+', '-', '×'] : diff === 2 ? ['+', '-', '×', '÷'] : ['+', '-', '×', '÷', '%'];
    const op = pick(rng, ops);
    let a, b, answer, eq;
    if (op === '+') { a = randInt(rng, 5, 99); b = randInt(rng, 5, 99); answer = a + b; eq = `${a} + ${b} = ?`; }
    else if (op === '-') { a = randInt(rng, 10, 99); b = randInt(rng, 1, a); answer = a - b; eq = `${a} − ${b} = ?`; }
    else if (op === '×') { a = randInt(rng, 2, diff === 3 ? 25 : 12); b = randInt(rng, 2, diff === 3 ? 25 : 12); answer = a * b; eq = `${a} × ${b} = ?`; }
    else if (op === '÷') { b = randInt(rng, 2, diff === 3 ? 12 : 9); answer = randInt(rng, 2, diff === 3 ? 20 : 12); a = b * answer; eq = `${a} ÷ ${b} = ?`; }
    else { a = randInt(rng, 20, 200); b = randInt(rng, 5, 50); answer = Math.round(a * b / 100); eq = `${b}% de ${a} = ?`; }
    return { eq, answer: String(answer), topic: 'Aritmética', hint: 'Operación básica', difficulty: diff };
  },
  algebra(rng, diff) {
    let x, a, b, c, eq, answer, hint;
    if (diff === 1) {
      x = randInt(rng, 1, 20); a = randInt(rng, 2, 9); b = a * x;
      eq = `${a}x = ${b} → x = ?`; answer = String(x); hint = `Dividí ${b} entre ${a}`;
    } else if (diff === 2) {
      x = randInt(rng, 1, 15); a = randInt(rng, 2, 8); b = randInt(rng, 1, 20); c = a * x + b;
      eq = `${a}x + ${b} = ${c} → x = ?`; answer = String(x); hint = `Restá ${b}, dividí por ${a}`;
    } else {
      x = randInt(rng, 2, 8); a = randInt(rng, 2, 4); b = randInt(rng, 1, 10); c = a * x * x + b;
      eq = `${a}x² + ${b} = ${c} (x>0) → x = ?`; answer = String(x); hint = `Restá ${b}, dividí por ${a}, raíz`;
    }
    return { eq, answer, topic: 'Álgebra', hint, difficulty: diff };
  },
  fisica(rng, diff) {
    const templates = [
      { gen(r) { const m = randInt(r,1,10), a = randInt(r,1,10); return { eq: `F=ma: m=${m}, a=${a} → F=?`, answer: String(m*a), hint: 'F = m × a' }; } },
      { gen(r) { const i = randInt(r,1,15), R = randInt(r,1,10); return { eq: `V=IR: I=${i}, R=${R} → V=?`, answer: String(i*R), hint: 'V = I × R' }; } },
      { gen(r) { const F = randInt(r,5,50), A = randInt(r,1,10); const ans = Math.round(F/A*100)/100; return { eq: `P=F/A: F=${F}, A=${A} → P=?`, answer: String(ans), hint: 'Presión = Fuerza / Área' }; } },
      { gen(r) { const t = randInt(r,1,8); return { eq: `Caída libre: h=5t², t=${t} → h=?`, answer: String(5*t*t), hint: '5 por t al cuadrado' }; } },
      { gen(r) { const d = randInt(r,20,200), t = randInt(r,2,10); const ans = Math.round(d/t*100)/100; return { eq: `Velocidad: d=${d}, t=${t} → v=?`, answer: String(ans), hint: 'v = d / t' }; } },
      { gen(r) { const m = randInt(r,1,8), v = randInt(r,1,8); return { eq: `½mv²: m=${m}, v=${v} → ½mv²=?`, answer: String(Math.round(0.5*m*v*v)), hint: '0.5 × m × v²' }; } },
      { gen(r) { const rad = randInt(r,1,10); return { eq: `Área círculo: r=${rad} → A=?`, answer: String(Math.round(3.1416*rad*rad)), hint: 'π × r²' }; } },
    ];
    if (diff >= 2) {
      templates.push(
        { gen(r) { const m = randInt(r,5,20), v = randInt(r,2,10); return { eq: `p=mv: m=${m}, v=${v} → p=?`, answer: String(m*v), hint: 'Momentum = masa × velocidad' }; } },
        { gen(r) { const q = randInt(r,1,5), d = randInt(r,2,10); const ans = Math.round(q/(d*d)*100)/100; return { eq: `F=kq/d²: k=1, q=${q}, d=${d} → F=?`, answer: String(ans), hint: 'Ley de Coulomb simplificada' }; } },
      );
    }
    return pick(rng, templates).gen(rng);
  },
  quimica(rng, diff) {
    const molar = [
      { name: 'H₂O', mass: 18 }, { name: 'CO₂', mass: 44 }, { name: 'NaCl', mass: 58 },
      { name: 'H₂SO₄', mass: 98 }, { name: 'CaCO₃', mass: 100 }, { name: 'C₂H₅OH', mass: 46 },
      { name: 'NH₃', mass: 17 }, { name: 'CH₄', mass: 16 }, { name: 'HCl', mass: 36 },
    ];
    if (diff === 1) {
      const m = pick(rng, molar);
      return { eq: `Masa molar ${m.name} = ?`, answer: String(m.mass), hint: 'Sumá masas atómicas', difficulty: diff };
    } else if (diff === 2) {
      const m = randInt(rng, 10, 50); const mm = pick(rng, molar);
      const n = Math.round(m / mm.mass * 10) / 10;
      return { eq: `n=m/M: m=${m}g, M=${mm.name}(${mm.mass}) → n=?`, answer: String(Math.round(m/mm.mass)), hint: 'Moles = masa / masa molar', difficulty: diff };
    } else {
      const conc = pick(rng, [0.001, 0.01, 0.1, 1, 10]);
      const pH = -Math.log10(conc);
      const pHr = Math.round(pH * 10) / 10;
      return { eq: `pH de [H⁺]=${conc} = ?`, answer: String(pHr), hint: 'pH = -log[H⁺]', difficulty: diff };
    }
  },
  programacion(rng, diff) {
    if (diff === 1) {
      const base = pick(rng, [2, 8, 16]); const exp = randInt(rng, 3, 8);
      const val = Math.pow(base, exp);
      return { eq: `${base}^${exp} = ?`, answer: String(val), hint: `${base} elevado a ${exp}`, difficulty: diff };
    } else if (diff === 2) {
      const bits = Array.from({ length: randInt(rng, 3, 5) }, () => randInt(rng, 0, 1));
      const dec = bits.reduce((acc, b, i) => acc + b * Math.pow(2, bits.length - 1 - i), 0);
      return { eq: `Binario ${bits.join('')} en decimal = ?`, answer: String(dec), hint: 'Potencias de 2', difficulty: diff };
    } else {
      const n = randInt(rng, 2, 8); const base = pick(rng, [2, 8, 16]);
      const hex = n.toString(base).toUpperCase();
      return { eq: `Hex: ${hex}${base===16?'':` (base ${base})`} en decimal = ?`, answer: String(n), hint: `Base ${base} a decimal`, difficulty: diff };
    }
  },
  cbc(rng, diff) {
    if (diff === 1) {
      const triples = [[3,4,5],[5,12,13],[8,15,17],[7,24,25]];
      const [a,b,c] = pick(rng, triples);
      return { eq: `${a}² + ${b}² = ? (Pitágoras)`, answer: String(c*c), hint: `Teorema de Pitágoras`, difficulty: diff };
    } else if (diff === 2) {
      const angles = [30,45,60];
      const deg = pick(rng, angles); const fn = pick(rng, ['sin','cos','tan']);
      const rad = deg * Math.PI / 180;
      let numVal;
      if (fn === 'sin') numVal = Math.round(Math.sin(rad) * 1000) / 1000;
      else if (fn === 'cos') numVal = Math.round(Math.cos(rad) * 1000) / 1000;
      else numVal = Math.round(Math.tan(rad) * 1000) / 1000;
      if (numVal === Math.round(numVal)) numVal = Math.round(numVal);
      return { eq: `${fn}(${deg}°) = ?`, answer: String(numVal), hint: 'Trigonométrica clásica', difficulty: diff };
    } else {
      const a = randInt(rng, 2, 5); const b = randInt(rng, 1, 10); const c = randInt(rng, 1, 5);
      const result = a + b * 0 + c;
      return { eq: `${a} + ${b}×0 + ${c} = ?`, answer: String(a + c), hint: 'Orden de operaciones', difficulty: diff };
    }
  },
};

const GENERATORS = ['aritmetica','algebra','fisica','quimica','programacion','cbc'];

function generatePuzzle(seed) {
  const rng = seededRandom(seed);
  // 80% palabra de ingeniería (modo Wordle), 20% cuenta matemática
  if (rng() < 0.8) {
    const entry = pick(rng, FIUBLE_WORDS);
    const diff = entry.w.length <= 5 ? 1 : entry.w.length <= 7 ? 2 : 3;
    return {
      eq: `Adiviná la palabra (${entry.w.length} letras)`,
      answer: entry.w,
      topic: entry.topic,
      hint: entry.hint,
      difficulty: diff,
      isWord: true,
      wordLen: entry.w.length
    };
  }
  const diff = randInt(rng, 1, 3);
  const genName = pick(rng, GENERATORS);
  const puzzle = GEN[genName](rng, diff);
  puzzle.difficulty = diff;
  puzzle.isWord = false;
  return puzzle;
}

function getDaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function seededRandom(seed) {
  let s = seed;
  return function() { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

// ─── STATE ───
function loadFiubleState() {
  try {
    const s = JSON.parse(localStorage.getItem(FIUBLE_KEY)) || {};
    return { streak: s.streak||0, bestStreak: s.bestStreak||0, totalWins: s.totalWins||0, totalGames: s.totalGames||0, lastPlayed: s.lastPlayed||null, history: s.history||[] };
  } catch { return { streak:0, bestStreak:0, totalWins:0, totalGames:0, lastPlayed:null, history:[] }; }
}
function saveFiubleState(s) { localStorage.setItem(FIUBLE_KEY, JSON.stringify(s)); }

let gameActive = false, attempts = [], maxAttempts = 6, currentGuess = '', puzzle = null, solved = false, gameOver = false;
let flipAnimating = false;
let lastPuzzleSeed = null;
let lastInitDate = null;

function initFiuble() {
  const todaySeed = getDaySeed();
  const today = getTodayStr();
  const needsReset = !puzzle || lastPuzzleSeed !== todaySeed || lastInitDate !== today;

  if (needsReset) {
    puzzle = generatePuzzle(todaySeed);
    lastPuzzleSeed = todaySeed;
    lastInitDate = today;
    attempts = [];
    solved = false;
    gameOver = false;
    gameActive = true;
    currentGuess = '';
    // Clear stale localStorage so old game state doesn't interfere
    const state = loadFiubleState();
    if (state.lastPlayed && state.lastPlayed !== today) {
      state.lastPlayed = today;
      state.history = state.history.filter(h => h.date === today);
      saveFiubleState(state);
    }
    return;
  }

  const state = loadFiubleState();
  if (state.lastPlayed === today && state.history.length > 0) {
    const tg = state.history.find(h => h.date === today);
    if (tg) {
      attempts = tg.attempts || [];
      solved = tg.solved || false;
      gameOver = tg.solved || attempts.length >= maxAttempts;
      gameActive = !gameOver;
    }
  }
  currentGuess = '';
}

// ─── SOUND EFFECTS (Web Audio) ───
let audioCtx;
function getAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }
function playSound(type) {
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    if (type === 'click') { osc.frequency.value = 600; osc.type = 'sine'; gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.08); osc.start(); osc.stop(ctx.currentTime+0.08); }
    else if (type === 'correct') { osc.frequency.value = 523; osc.type = 'sine'; osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime+0.15); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.25); osc.start(); osc.stop(ctx.currentTime+0.25); }
    else if (type === 'wrong') { osc.frequency.value = 200; osc.type = 'sawtooth'; gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.2); osc.start(); osc.stop(ctx.currentTime+0.2); }
    else if (type === 'win') { [523,659,784,1047].forEach((f,i) => { const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g);g.connect(ctx.destination); o.frequency.value=f; o.type='sine'; g.gain.setValueAtTime(0.06,ctx.currentTime+i*0.12); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+i*0.12+0.3); o.start(ctx.currentTime+i*0.12); o.stop(ctx.currentTime+i*0.12+0.3); }); }
    else if (type === 'lose') { osc.frequency.value = 150; osc.type = 'sawtooth'; osc.frequency.linearRampToValueAtTime(80, ctx.currentTime+0.5); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.5); osc.start(); osc.stop(ctx.currentTime+0.5); }
  } catch {}
}

// ─── CONFETTI ───
function launchConfetti() {
  const canvas = document.getElementById('fiuble-confetti');
  if (!canvas) return;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  const colors = ['#8b5cf6','#6366f1','#22c55e','#f59e0b','#ec4899','#06b6d4'];
  const particles = Array.from({length:80}, () => ({
    x: Math.random()*canvas.width, y: -20-Math.random()*200,
    w: 6+Math.random()*6, h: 4+Math.random()*4,
    color: colors[Math.floor(Math.random()*colors.length)],
    vx: (Math.random()-0.5)*6, vy: 2+Math.random()*4,
    rot: Math.random()*360, vr: (Math.random()-0.5)*12,
    life: 1
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let alive = false;
    particles.forEach(p => {
      if (p.life <= 0) return;
      alive = true;
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.rot += p.vr;
      if (frame > 40) p.life -= 0.015;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.globalAlpha = Math.max(0,p.life); ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
    });
    frame++;
    if (alive && frame < 200) requestAnimationFrame(draw);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  draw();
}

// ─── GAME LOGIC ───
function normalizeAnswer(s) {
  if (!puzzle || puzzle.isWord) return String(s).trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return String(s).replace(/,/g, '.').replace(/\.?0+$/, '');
}
function checkGuess(guess) {
  const target = puzzle.answer;
  const gs = normalizeAnswer(guess), ts = normalizeAnswer(target);
  if (gs === ts) return 'correct';
  // Pad to same length for Wordle-style comparison
  const gd = gs.split(''), td = ts.split('');
  const result = Array(gd.length).fill('absent');
  const tu = Array(td.length).fill(false), gu = Array(gd.length).fill(false);
  for (let i=0;i<gd.length;i++) { if (i<td.length && gd[i]===td[i]) { result[i]='correct'; tu[i]=true; gu[i]=true; } }
  for (let i=0;i<gd.length;i++) { if (gu[i]) continue; for (let j=0;j<td.length;j++) { if (!tu[j] && gd[i]===td[j]) { result[i]='present'; tu[j]=true; break; } } }
  return result;
}

function submitGuess() {
  if (!gameActive || !currentGuess) return;
  const guess = currentGuess.trim();
  if (!guess) return;
  playSound('click');
  const result = checkGuess(guess);
  attempts.push({ guess, result });
  const isWin = result === 'correct' || (Array.isArray(result) && result.every(r => r === 'correct'));
  if (isWin) { solved = true; gameActive = false; gameOver = true; }
  else if (attempts.length >= maxAttempts) { gameActive = false; gameOver = true; }

  const state = loadFiubleState();
  const today = getTodayStr();
  if (gameOver) {
    state.totalGames++;
    if (solved) {
      state.totalWins++;
      state.streak = (state.lastPlayed === getYesterday()) ? state.streak + 1 : 1;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      playSound('win'); setTimeout(() => launchConfetti(), 200);
    } else { state.streak = 0; playSound('lose'); }
    state.lastPlayed = today;
    state.history.unshift({ date: today, attempts: attempts.map(a=>({guess:a.guess,result:a.result})), solved, topic: puzzle.topic, difficulty: puzzle.difficulty });
    state.history = state.history.slice(0, 30);
    saveFiubleState(state);
  }
  currentGuess = '';
  renderFiuble();
  // Flip animation
  if (!gameOver) {
    const lastRow = document.querySelector('.fiuble-row-done:last-of-type');
    if (lastRow) { lastRow.classList.add('fiuble-flip'); }
  }
}

function getYesterday() { const d=new Date(); d.setDate(d.getDate()-1); const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; }
function getTimeUntilReset() { const now=new Date(),tom=new Date(now); tom.setDate(tom.getDate()+1); tom.setHours(0,0,0,0); const diff=tom-now; return `${Math.floor(diff/3600000)}h ${Math.floor((diff%3600000)/60000)}m`; }

function getShareText() {
  const today = getTodayStr();
  const diffBadge = puzzle.difficulty===1?'⚡':puzzle.difficulty===2?'🔥':'💀';
  const emoji = solved ? '🟢' : '🔴';
  const grid = attempts.map(a => {
    if (a.result === 'correct') return '🟩';
    if (Array.isArray(a.result)) return a.result.map(r => r==='correct'?'🟩':r==='present'?'🟨':'⬛').join('');
    return '⬛';
  }).join('\n');
  return `FIUBLE ${today} ${diffBadge} ${emoji}\n${attempts.length}/${maxAttempts}\n\n${grid}\n\n#FIUBLE #FIUBA`;
}

function getHintColor(result) {
  if (result === 'correct') return '#22c55e';
  if (Array.isArray(result)) {
    if (result.every(r=>r==='correct')) return '#22c55e';
    if (result.some(r=>r==='present')) return '#f59e0b';
  }
  return '#ef4444';
}

function getAttemptEmoji(idx, total) {
  if (idx === 0) return '🤯';
  if (idx === 1) return '😎';
  if (idx === 2) return '💪';
  if (idx === 3) return '😅';
  if (idx === 4) return '😰';
  return '🫣';
}

function getDiffLabel(d) { return d===1?'Fácil':d===2?'Medio':'Difícil'; }
function getDiffColor(d) { return d===1?'#22c55e':d===2?'#f59e0b':'#ef4444'; }

// ─── RENDER ───
function renderFiuble() {
  const container = document.getElementById('fiuble-content');
  if (!container) return;
  initFiuble();
  if (!puzzle) return;
  const state = loadFiubleState();
  const showTutorial = !localStorage.getItem(FIUBLE_TUTORIAL);

  let html = `<canvas id="fiuble-confetti" style="position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;display:none"></canvas>`;

  if (showTutorial) {
    html += `
    <div class="fiuble-tutorial-overlay" onclick="if(event.target===this)window.closeFiubleTutorial()">
      <div class="fiuble-tutorial">
        <div class="fiuble-tutorial-icon">🧩</div>
        <h3>¿Cómo jugar FIUBLE?</h3>
        <p>${puzzle.isWord ? 'Adiviná la palabra de ingeniería del día.' : 'Resolvé la ecuación y escribí tu respuesta.'}</p>
        <div class="fiuble-tutorial-colors">
          <div><span class="fiuble-tile-preview" style="background:#22c55e">A</span> <strong>Verde</strong>: letra/dígito correcto en posición correcta</div>
          <div><span class="fiuble-tile-preview" style="background:#f59e0b">A</span> <strong>Amarillo</strong>: letra/dígito correcto pero en otra posición</div>
          <div><span class="fiuble-tile-preview" style="background:#ef4444">A</span> <strong>Rojo</strong>: no está en la respuesta</div>
        </div>
        <div class="fiuble-tutorial-example">
          <div class="fiuble-tutorial-eq">${puzzle.isWord ? 'Palabra de 6 letras — pista: Arreglo de números' : 'Ejemplo: 15 × 4 = ?'}</div>
          <div class="fiuble-tutorial-answer">Respuesta: ${puzzle.isWord ? 'MATRIZ' : '60'}</div>
          <div class="fiuble-tutorial-guess">Si decís <strong>${puzzle.isWord ? 'MOTRIZ' : '56'}</strong>:</div>
          <div class="fiuble-tutorial-tiles">
            <span class="fiuble-tile-preview" style="background:#22c55e">${puzzle.isWord?'M':'6'}</span>
            <span class="fiuble-tile-preview" style="background:#f59e0b">${puzzle.isWord?'O':'5'}</span>
            <span class="fiuble-tile-preview" style="background:#ef4444">${puzzle.isWord?'T':'0'}</span>
          </div>
        </div>
        <button class="fiuble-tutorial-btn" onclick="window.closeFiubleTutorial()">¡A jugar!</button>
      </div>
    </div>`;
  }

  html += `
    <div class="fiuble-header">
      <div class="fiuble-logo">
        <div class="fiuble-logo-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="16" y="2" width="6" height="6" rx="1"/><rect x="2" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/><rect x="16" y="9" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="16" width="6" height="6" rx="1"/></svg>
        </div>
        <h2 class="fiuble-title">FIUBLE</h2>
        <span class="fiuble-subtitle">Resolvé la ecuación · Nuevo todos los días</span>
      </div>
      <div class="fiuble-stats-row">
        <div class="fiuble-stat-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg><span>${state.streak}</span></div>
        <div class="fiuble-stat-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 7 7 7"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 17 7 17 7"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg><span>${state.bestStreak}</span></div>
        <div class="fiuble-stat-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>${state.totalGames>0?Math.round((state.totalWins/state.totalGames)*100):0}%</span></div>
        <div class="fiuble-stat-pill fiuble-timer-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>${getTimeUntilReset()}</span></div>
      </div>
    </div>

    <div class="fiuble-equation-card">
      <div class="fiuble-topic-row">
        <div class="fiuble-topic-badge">${puzzle.topic}</div>
        <div class="fiuble-diff-badge" style="background:${getDiffColor(puzzle.difficulty)}">${getDiffLabel(puzzle.difficulty)}</div>
        ${puzzle.isWord ? `<div class="fiuble-topic-badge" style="background:rgba(139,92,246,0.15);color:#8b5cf6;border:1px solid rgba(139,92,246,0.3)">${puzzle.wordLen} letras</div>` : ''}
      </div>
      <div class="fiuble-equation">${puzzle.eq}</div>
      <div class="fiuble-hint"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>${puzzle.hint}${puzzle.isWord ? ` · <em style="opacity:0.7">${puzzle.wordLen} letras</em>` : ''}</div>
    </div>

    <div class="fiuble-grid">`;

  for (let i=0;i<maxAttempts;i++) {
    if (i < attempts.length) {
      const a = attempts[i];
      const isC = a.result==='correct'||(Array.isArray(a.result)&&a.result.every(r=>r==='correct'));
      const guess = String(a.guess).toUpperCase();
      let tiles = '';
      if (a.result === 'correct') {
        tiles = guess.split('').map(ch => `<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:6px;background:#22c55e;color:white;font-weight:800;font-size:0.85rem;border:1px solid #16a34a">${ch}</span>`).join('');
      } else if (Array.isArray(a.result)) {
        tiles = guess.split('').map((ch, idx) => {
          const r = a.result[idx] || 'absent';
          const bg = r === 'correct' ? '#22c55e' : r === 'present' ? '#f59e0b' : '#52525b';
          const border = r === 'correct' ? '#16a34a' : r === 'present' ? '#d97706' : '#3f3f46';
          return `<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:6px;background:${bg};color:white;font-weight:800;font-size:0.85rem;border:1px solid ${border}">${ch}</span>`;
        }).join('');
      } else {
        tiles = `<span style="color:#ef4444;font-weight:700">${a.guess}</span>`;
      }
      html += `<div class="fiuble-row fiuble-row-done fiuble-flip" style="border-color:${isC ? '#22c55e' : '#3f3f46'}">
        <div style="display:flex;gap:4px;flex-wrap:wrap;flex:1">${tiles}</div>
        <span class="fiuble-check" style="color:${isC ? '#22c55e' : '#ef4444'};font-size:1rem;flex-shrink:0">${isC?getAttemptEmoji(i,attempts.length):'✗'}</span>
      </div>`;
    } else if (i===attempts.length && gameActive) {
      const inputMode = puzzle.isWord ? 'text' : 'numeric';
      const placeholder = puzzle.isWord ? `Palabra de ${puzzle.wordLen} letras...` : 'Tu respuesta...';
      html += `<div class="fiuble-row fiuble-row-active">
        <input id="fiuble-input" class="fiuble-input" type="text" inputmode="${inputMode}" placeholder="${placeholder}"
          value="${currentGuess}" oninput="window.setFiubleGuess(this.value)" autocomplete="off" autocapitalize="characters"
          onkeydown="if(event.key==='Enter')window.submitFiubleGuess()" ${!gameActive?'disabled':''}>
        <button class="fiuble-submit-btn" onclick="window.submitFiubleGuess()" ${!gameActive?'disabled':''}>→</button>
      </div>`;
    } else {
      html += `<div class="fiuble-row fiuble-row-empty"><span class="fiuble-placeholder">${i+1}</span></div>`;
    }
  }
  html += `</div>`;

  if (gameOver) {
    const shareText = getShareText();
    const emoji = solved ? getAttemptEmoji(attempts.length-1, attempts.length) : '😔';
    // Histogram
    const hist = Array(maxAttempts+1).fill(0);
    state.history.forEach(h => { if (h.solved) hist[h.attempts.length] = (hist[h.attempts.length]||0)+1; });
    const maxHist = Math.max(...hist, 1);

    html += `<div class="fiuble-result">
      <div class="fiuble-result-emoji">${emoji}</div>
      <h3 class="fiuble-result-title">${solved?'¡Correcto!':'Sin intentos'}</h3>
      <p class="fiuble-result-answer">Respuesta: <strong>${puzzle.answer}</strong></p>
      <p class="fiuble-result-stat">${attempts.length}/${maxAttempts} intentos</p>

      <div class="fiuble-histogram">
        <h4>Distribución de intentos</h4>
        ${Array.from({length:maxAttempts},(_, i)=>{
          const count = hist[i+1]||0;
          const pct = maxHist>0?(count/maxHist)*100:0;
          return `<div class="fiuble-hist-row${solved&&attempts.length===i+1?' fiuble-hist-current':''}">
            <span class="fiuble-hist-num">${i+1}</span>
            <div class="fiuble-hist-bar" style="width:${Math.max(pct,4)}%">${count}</div>
          </div>`;
        }).join('')}
      </div>

      <div class="fiuble-result-actions">
        <button onclick="window.copyFiubleShare()" class="fiuble-btn-share">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copiar resultado
        </button>
        <button onclick="window.showFiubleStats()" class="fiuble-btn-stats">📊 Estadísticas</button>
      </div>
    </div>`;
  }

  html += `<div class="fiuble-footer"><p>${puzzle.isWord ? 'Adiviná la palabra' : 'Resolvé la ecuación'} · 6 intentos · Se renueva a medianoche</p></div>`;
  container.innerHTML = html;
  const input = document.getElementById('fiuble-input');
  if (input) setTimeout(()=>input.focus(),100);
}

// ─── WINDOW EXPORTS ───
window.setFiubleGuess = function(v) {
  if (puzzle && puzzle.isWord) {
    currentGuess = v.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ]/g,'').toUpperCase().slice(0, 12);
  } else {
    currentGuess = v.replace(/[^0-9,.\-]/g,'');
  }
  const inp = document.getElementById('fiuble-input');
  if (inp && inp.value !== currentGuess) inp.value = currentGuess;
};
window.submitFiubleGuess = function() { submitGuess(); };

window.copyFiubleShare = function() {
  navigator.clipboard.writeText(getShareText()).then(()=>{
    const t=document.createElement('div'); t.textContent='Copiado para compartir 📋';
    t.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#22c55e;color:white;padding:0.5rem 1.2rem;border-radius:10px;font-size:0.85rem;z-index:9999;font-weight:600';
    document.body.appendChild(t); setTimeout(()=>t.remove(),2000);
  });
};

window.closeFiubleTutorial = function() {
  localStorage.setItem(FIUBLE_TUTORIAL, '1');
  const overlay = document.querySelector('.fiuble-tutorial-overlay');
  if (overlay) overlay.classList.add('fiuble-tutorial-hide');
  setTimeout(()=>{ if (overlay) overlay.remove(); }, 300);
};

window.showFiubleStats = function() {
  const state = loadFiubleState();
  const container = document.getElementById('fiuble-content');
  if (!container) return;
  const topicCounts = {};
  state.history.forEach(h => { topicCounts[h.topic]=(topicCounts[h.topic]||0)+1; });
  const hist = Array(maxAttempts+1).fill(0);
  state.history.forEach(h => { if(h.solved) hist[h.attempts.length]=(hist[h.attempts.length]||0)+1; });
  const maxHist = Math.max(...hist,1);

  let html = `<div class="fiuble-stats-page">
    <h3 class="fiuble-stats-title">📊 Tus estadísticas FIUBLE</h3>
    <div class="fiuble-stats-grid">
      <div class="fiuble-stat-card"><div class="fiuble-stat-val">${state.totalGames}</div><div class="fiuble-stat-lbl">Jugados</div></div>
      <div class="fiuble-stat-card"><div class="fiuble-stat-val">${state.totalWins}</div><div class="fiuble-stat-lbl">Ganados</div></div>
      <div class="fiuble-stat-card"><div class="fiuble-stat-val">${state.totalGames>0?Math.round((state.totalWins/state.totalGames)*100):0}%</div><div class="fiuble-stat-lbl">Win rate</div></div>
      <div class="fiuble-stat-card"><div class="fiuble-stat-val" style="color:#f59e0b">${state.streak}</div><div class="fiuble-stat-lbl">Racha actual</div></div>
      <div class="fiuble-stat-card"><div class="fiuble-stat-val" style="color:#8b5cf6">${state.bestStreak}</div><div class="fiuble-stat-lbl">Mejor racha</div></div>
    </div>

    <div class="fiuble-histogram fiuble-histogram-lg">
      <h4>Distribución de intentos</h4>
      ${Array.from({length:maxAttempts},(_,i)=>{
        const count=hist[i+1]||0; const pct=maxHist>0?(count/maxHist)*100:0;
        return `<div class="fiuble-hist-row"><span class="fiuble-hist-num">${i+1}</span><div class="fiuble-hist-bar" style="width:${Math.max(pct,4)}%">${count}</div></div>`;
      }).join('')}
    </div>

    ${Object.keys(topicCounts).length>0?`<div class="fiuble-topic-stats"><h4>Por materia</h4>${Object.entries(topicCounts).sort((a,b)=>b[1]-a[1]).map(([t,c])=>`<div class="fiuble-topic-row"><span>${t}</span><span>${c} partidas</span></div>`).join('')}</div>`:''}
    <div class="fiuble-history"><h4>Historial reciente</h4>
      ${state.history.slice(0,7).map(h=>{const d=new Date(h.date+'T12:00:00'); return `<div class="fiuble-history-row"><span>${h.solved?'🟢':'🔴'}</span><span>${h.topic}</span><span>${h.attempts.length}/6</span><span style="opacity:0.5">${d.toLocaleDateString('es-AR',{day:'numeric',month:'short'})}</span></div>`;}).join('')}
    </div>
    <button onclick="window.renderFiuble()" class="fiuble-btn-back">← Volver al juego</button>
  </div>`;
  container.innerHTML = html;
};

window.renderFiuble = renderFiuble;
initFiuble();
