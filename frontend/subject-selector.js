// subject-selector.js - Selector de materias con IA (tips, profesores, parciales)
const SS_KEY = 'fiuba_subject_selector';
const CAREERS = [
  { id: 'informatica', name: 'Ingeniería en Informática', subjects: [
    'Introducción a la Programación','Algoritmos y Estructuras de Datos','Base de Datos','Sistemas Operativos','Redes de Computadoras','Ingeniería de Software','Inteligencia Artificial','Compiladores','Organización del Computador','Matemática Discreta',
  ]},
  { id: 'electrica', name: 'Ingeniería Eléctrica', subjects: [
    'Circuitos Eléctricos','Electromagnetismo','Electrónica General','Máquinas Eléctricas','Control Automático','Potencia','Señales y Sistemas',
  ]},
  { id: 'mecanica', name: 'Ingeniería Mecánica', subjects: [
    'Mecánica de Sólidos','Mecánica de Fluidos','Termodinámica','Transferencia de Calor','Manufactura','Diseño Mecánico',
  ]},
  { id: 'quimica', name: 'Ingeniería Química', subjects: [
    'Química General','Química Inorgánica','Termodinámica','Operaciones Unitarias','Fisicoquímica','Ingeniería Ambiental',
  ]},
  { id: 'civil', name: 'Ingeniería Civil', subjects: [
    'Mecánica de Sólidos','Mecánica de Fluidos','Topografía','Geología','Hidráulica','Materiales de Construcción',
  ]},
  { id: 'sistemas', name: 'Lic. en Análisis de Sistemas', subjects: [
    'Introducción a la Programación','Algoritmos y Estructuras de Datos','Base de Datos','Sistemas de Representación','Probabilidad y Estadística','Ingeniería de Software',
  ]},
  { id: 'nautica', name: 'Ingeniería en Naval', subjects: [
    'Mecánica de Fluidos','Termodinámica','Resistencia de Materiales','Diseño Naval','Propulsión','Estabilidad',
  ]},
  { id: 'petroleo', name: 'Ingeniería en Petróleo', subjects: [
    'Mecánica de Fluidos','Termodinámica','Petroquímica','Perforación','Reservorios','Sismicidad',
  ]},
  { id: 'alimentos', name: 'Ingeniería en Alimentos', subjects: [
    'Química General','Microbiología','Termodinámica','Operaciones Unitarias','Seguridad Alimentaria','Control de Calidad',
  ]},
  { id: 'ambiental', name: 'Ingeniería Ambiental', subjects: [
    'Química General','Mecánica de Fluidos','Microbiología','Contaminación Ambiental','Tratamiento de Aguas','Gestión Ambiental',
  ]},
  { id: 'agrimensa', name: 'Ingeniería Agrimensura', subjects: [
    'Topografía','Geodesia','Cartografía','Sistemas de Información Geográfica','Derecho','Mensura',
  ]},
  { id: 'electricista', name: 'Ingeniería Electricista', subjects: [
    'Circuitos Eléctricos','Electromagnetismo','Electrónica','Máquinas Eléctricas','Instalaciones','Potencia',
  ]},
  { id: 'biomedica', name: 'Ingeniería Biomédica', subjects: [
    'Señales y Sistemas','Electrónica','Instrumentación','Biomecánica','Imagenología','Fisiología',
  ]},
];

const CBC_SUBJECTS = [
  'Análisis Matemático I','Álgebra y Geometría Analítica','Física I','Química General',
  'Sistemas de Representación','Introducción a la Computación','Inglés','Economía',
  'Física II','Análisis Matemático II',
];

let ssCareer = null;
let ssSubject = null;

function ssRender() {
  const container = document.getElementById('materias-ai-content');
  if (!container) return;

  let html = `
    <div style="text-align:center;margin-bottom:1rem">
      <h2 style="font-family:var(--font-heading);font-size:1.1rem;color:var(--text-primary);margin-bottom:0.15rem;display:flex;align-items:center;justify-content:center;gap:0.4rem">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7.5L12 19l-3-2.5C7 14.5 5 12 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
        Selector de Materias
      </h2>
      <p style="color:var(--text-muted);font-size:0.75rem">Elegí tu carrera y materia, la IA te da tips personalizados</p>
    </div>`;

  if (!ssCareer) {
    // Show CBC first, then careers
    html += `
    <div style="background:linear-gradient(135deg,rgba(100,116,139,0.1),rgba(100,116,139,0.05));border:1px solid rgba(100,116,139,0.2);border-radius:10px;padding:0.8rem;margin-bottom:0.8rem">
      <div style="font-weight:700;color:var(--text-primary);margin-bottom:0.4rem;font-size:0.9rem">📋 CBC — Ciclo Básico Común</div>
      <div style="display:flex;flex-wrap:wrap;gap:0.3rem">`;
    CBC_SUBJECTS.forEach(s => {
      html += `<button onclick="ssSelectSubject('CBC','${s.replace(/'/g,"\\'")}')" style="background:rgba(100,116,139,0.08);border:1px solid rgba(100,116,139,0.2);border-radius:6px;padding:0.35rem 0.6rem;cursor:pointer;font-size:0.75rem;color:var(--text-primary);transition:all 0.15s;text-align:left">${s}</button>`;
    });
    html += `</div></div>`;

    html += `<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.5rem;font-weight:600">Carreras:</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:0.4rem">`;
    CAREERS.forEach(c => {
      html += `<button onclick="ssSelectCareer('${c.id}')" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.7rem 0.5rem;cursor:pointer;text-align:left;transition:all 0.15s">
        <div style="font-weight:700;color:var(--text-primary);font-size:0.8rem;margin-bottom:0.15rem">${c.name}</div>
        <div style="font-size:0.65rem;color:var(--text-muted)">${c.subjects.length} materias</div>
      </button>`;
    });
    html += `</div>`;

  } else if (!ssSubject) {
    const career = CAREERS.find(c => c.id === ssCareer);
    html += `
    <button onclick="ssBack()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:0.8rem;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.3rem">← Volver a carreras</button>
    <div style="font-weight:700;color:var(--text-primary);font-size:0.95rem;margin-bottom:0.6rem">${career.name}</div>
    <div style="display:flex;flex-direction:column;gap:0.3rem">`;
    career.subjects.forEach(s => {
      html += `<button onclick="ssSelectSubject('${career.id}','${s.replace(/'/g,"\\'")}')" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.6rem 0.8rem;cursor:pointer;text-align:left;transition:all 0.15s;display:flex;align-items:center;gap:0.5rem">
        <span style="font-size:1.1rem">📖</span>
        <span style="font-weight:600;color:var(--text-primary);font-size:0.85rem">${s}</span>
      </button>`;
    });
    html += `</div>`;

  } else {
    html += `
    <button onclick="ssBack()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:0.8rem;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.3rem">← Volver a materias</button>
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:1rem;margin-bottom:0.8rem">
      <div style="font-weight:700;color:var(--text-primary);font-size:0.95rem;margin-bottom:0.2rem">${ssSubject}</div>
      <div style="font-size:0.75rem;color:var(--text-muted)">${ssCareer === 'CBC' ? 'Ciclo Básico Común' : CAREERS.find(c=>c.id===ssCareer)?.name || ''}</div>
    </div>
    <div id="ss-ai-response" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:1rem;color:var(--text-primary);font-size:0.85rem;line-height:1.6">
      <div style="text-align:center;padding:1rem;color:var(--text-muted)">
        <div style="font-size:1.5rem;margin-bottom:0.3rem">🤖</div>
        Cargando tips de la IA...
      </div>
    </div>`;
  }

  container.innerHTML = html;

  if (ssCareer && ssSubject) {
    ssLoadAITips();
  }
}

async function ssLoadAITips() {
  const el = document.getElementById('ss-ai-response');
  if (!el) return;

  const prompt = `Sos un experto de la FIUBA (Facultad de Ingeniería de la UBA). Respondé en texto plano con markdown básico (negritas con **, listas con -). NUNCA uses \$, \`\`\`math, LaTeX, ni KaTeX.

Dame información completa sobre la materia "${ssSubject}" de ${ssCareer === 'CBC' ? 'CBC' : CAREERS.find(c=>c.id===ssCareer)?.name || 'FIUBA'}.

Incluí EXACTAMENTE estas secciones:
1. **Qué se ve**: Temas principales y contenido del programa
2. **Profesores recomendados**: Los mejores profesores conocidos en FIUBA para esta materia
3. **Tips para aprobar**: Consejos prácticos de estudiantes que la cursaron
4. **Parciales frecuentes**: Tipo de ejercicios que suelen salir
5. **Bibliografía recomendada**: Libros y material de estudio
6. **Dificultad**: Qué tan difícil es y por qué

Respondé de forma concisa pero completa. Máximo 400 palabras.`;

  try {
    const apiBase = window.getApiBase ? window.getApiBase() : 'https://fiuba-agent-backend-1.onrender.com';
    const userKey = window.getUserGeminiKey ? window.getUserGeminiKey() : '';
    const body = { message: prompt, history: [] };
    if (userKey) body.userApiKey = userKey;

    const resp = await fetch(apiBase + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    const reply = data.reply || data.error || 'No se pudo obtener información.';
    el.innerHTML = ssFormatReply(reply);
  } catch (e) {
    el.innerHTML = `<div style="color:var(--text-muted)">❌ Error de conexión: ${e.message}</div>`;
  }
}

function ssFormatReply(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)/gm, '<div style="padding-left:0.8rem;position:relative"><span style="position:absolute;left:0">•</span>$1</div>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

function ssSelectCareer(id) { ssCareer = id; ssSubject = null; ssRender(); }
function ssSelectSubject(career, subject) { ssCareer = career; ssSubject = subject; ssRender(); }
function ssBack() {
  if (ssSubject) { ssSubject = null; }
  else { ssCareer = null; }
  ssRender();
}

window.ssRender = ssRender;
window.ssSelectCareer = ssSelectCareer;
window.ssSelectSubject = ssSelectSubject;
window.ssBack = ssBack;
