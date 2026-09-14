// block-blast.js — Block Blast para FIUBA Agent (galaxy)
const BB_SIZE = 10;
const BB_KEY_BEST = 'fiuba_blockblast_best';
const BB_SHAPES = [
  { cells:[[0,0]], color:'#8b5cf6' },
  { cells:[[0,0],[1,0]], color:'#3b82f6' },
  { cells:[[0,0],[0,1]], color:'#3b82f6' },
  { cells:[[0,0],[1,0],[2,0]], color:'#06b6d4' },
  { cells:[[0,0],[0,1],[0,2]], color:'#06b6d4' },
  { cells:[[0,0],[1,0],[0,1]], color:'#22c55e' },
  { cells:[[0,0],[1,0],[1,1]], color:'#f59e0b' },
  { cells:[[0,0],[0,1],[1,1]], color:'#ec4899' },
  { cells:[[0,0],[1,0],[2,0],[2,1]], color:'#a855f7' },
  { cells:[[0,0],[0,1],[0,2],[1,2]], color:'#14b8a6' },
  { cells:[[0,0],[1,0],[0,1],[1,1]], color:'#eab308' },
  { cells:[[0,1],[1,0],[1,1],[1,2]], color:'#f97316' },
  { cells:[[0,0],[1,0],[2,0],[1,1]], color:'#6366f1' },
  { cells:[[0,0],[0,1],[0,2],[1,1]], color:'#84cc16' },
  { cells:[[0,0],[1,0],[2,0],[3,0]], color:'#ef4444' },
  { cells:[[0,0],[0,1],[0,2],[0,3]], color:'#ef4444' },
  { cells:[[0,0],[1,0],[2,0],[0,1],[0,2]], color:'#8b5cf6' },
  { cells:[[1,0],[1,1],[1,2],[0,2],[2,2]], color:'#06b6d4' },
];

let bbBoard = Array(BB_SIZE).fill(0).map(()=>Array(BB_SIZE).fill(0));
let bbScore = 0;
let bbBest = parseInt(localStorage.getItem(BB_KEY_BEST)||'0');
let bbPieces = [];
let bbSelected = null;
let bbHover = null;

function bbRandomPieces() {
  return [0,1,2].map(()=> BB_SHAPES[Math.floor(Math.random()*BB_SHAPES.length)]);
}
function bbCanPlace(board, shape, r, c) {
  for(const [dr,dc] of shape.cells) {
    const nr=r+dr, nc=c+dc;
    if(nr<0||nr>=BB_SIZE||nc<0||nc>=BB_SIZE) return false;
    if(board[nr][nc]) return false;
  }
  return true;
}
function bbPlace(board, shape, r, c) {
  const nb = board.map(row=>[...row]);
  for(const [dr,dc] of shape.cells) nb[r+dr][c+dc]=shape.color;
  return nb;
}
function bbClearLines(board) {
  let nb = board.map(r=>[...r]);
  let cleared=0;
  const rowsToClear=[], colsToClear=[];
  for(let r=0;r<BB_SIZE;r++) if(nb[r].every(v=>v)) rowsToClear.push(r);
  for(let c=0;c<BB_SIZE;c++) if(nb.every(row=>row[c])) colsToClear.push(c);
  rowsToClear.forEach(r=>{ for(let c=0;c<BB_SIZE;c++) nb[r][c]=0; cleared++; });
  colsToClear.forEach(c=>{ for(let r=0;r<BB_SIZE;r++) nb[r][c]=0; cleared++; });
  return { board: nb, cleared };
}
function bbIsGameOver(board, pieces) {
  for(const p of pieces) {
    for(let r=0;r<BB_SIZE;r++) for(let c=0;c<BB_SIZE;c++) if(bbCanPlace(board,p,r,c)) return false;
  }
  return true;
}

function bbInit() {
  bbBoard = Array(BB_SIZE).fill(0).map(()=>Array(BB_SIZE).fill(0));
  bbScore=0; bbPieces=bbRandomPieces(); bbSelected=null; bbHover=null;
  bbRender();
}
function bbHandleCellClick(r,c) {
  if(bbSelected===null) return;
  const shape = bbPieces[bbSelected];
  if(!shape) return;
  if(!bbCanPlace(bbBoard, shape, r, c)) {
    // shake feedback
    const el=document.getElementById('bb-board'); if(el){ el.style.transform='translateX(3px)'; setTimeout(()=>el.style.transform='',120); }
    return;
  }
  bbBoard = bbPlace(bbBoard, shape, r, c);
  bbScore += shape.cells.length * 10;
  const res = bbClearLines(bbBoard);
  bbBoard = res.board;
  if(res.cleared>0) {
    bbScore += res.cleared * 100;
    if(window.addXP) try{ window.addXP(res.cleared*10, 'Block Blast línea'); }catch{}
    // confetti
    if(window.launchConfetti) try{ }catch{}
  }
  bbPieces[bbSelected]=null;
  if(bbPieces.every(p=>p===null)) bbPieces = bbRandomPieces();
  bbSelected=null; bbHover=null;
  if(bbScore>bbBest){ bbBest=bbScore; localStorage.setItem(BB_KEY_BEST, String(bbBest)); }
  if(bbIsGameOver(bbBoard, bbPieces.filter(Boolean))) {
    setTimeout(()=>{ alert('¡Sin movimientos! Puntaje: '+bbScore); }, 150);
  }
  bbRender();
}
function bbHandleCellHover(r,c) {
  if(bbSelected===null) return;
  bbHover={r,c};
  bbRender();
}

function bbRender() {
  const el=document.getElementById('blockblast-content');
  if(!el) return;
  const canPlaceAny = !bbIsGameOver(bbBoard, bbPieces.filter(Boolean));
  let html = `
    <div style="max-width:520px;margin:0 auto;padding:1rem 1rem 1.2rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.6rem;flex-wrap:wrap;gap:0.4rem">
        <h2 style="font-family:var(--font-heading);font-size:1.15rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem"><span style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center;font-size:1rem">🧱</span> Block Blast</h2>
        <div style="display:flex;gap:0.4rem;align-items:center">
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.6rem;text-align:center;min-width:70px">
            <div style="font-size:0.6rem;color:var(--text-muted)">Puntaje</div>
            <div style="font-size:0.95rem;font-weight:800;color:var(--text-primary)">${bbScore}</div>
          </div>
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.3rem 0.6rem;text-align:center;min-width:70px">
            <div style="font-size:0.6rem;color:var(--text-muted)">Récord</div>
            <div style="font-size:0.95rem;font-weight:800;color:#f59e0b">${bbBest}</div>
          </div>
          <button onclick="bbInit()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:8px;padding:0.35rem 0.6rem;cursor:pointer;font-size:0.72rem;color:var(--text-primary)">↻ Reiniciar</button>
        </div>
      </div>
      <p style="font-size:0.72rem;color:var(--text-muted);margin:0 0 0.6rem;text-align:center">Toca una pieza abajo, luego toca el tablero para colocarla. ¡Completa filas o columnas!</p>
      <div id="bb-board" style="display:grid;grid-template-columns:repeat(${BB_SIZE},1fr);gap:3px;background:rgba(15,15,25,0.9);border:2px solid rgba(139,92,246,0.25);border-radius:12px;padding:6px;box-shadow:0 8px 32px rgba(0,0,0,0.3),0 0 20px rgba(139,92,246,0.15);transition:transform 0.12s">
        ${bbBoard.map((row,r)=> row.map((cell,c)=>{
          const hoverActive = bbSelected!==null && bbHover && (()=>{ const sh=bbPieces[bbSelected]; if(!sh) return false; for(const [dr,dc] of sh.cells) if(r===bbHover.r+dr && c===bbHover.c+dc) return true; return false; })();
          const canPlaceHere = bbSelected!==null ? bbCanPlace(bbBoard, bbPieces[bbSelected], r, c) : false;
          const previewColor = hoverActive ? (canPlaceHere ? bbPieces[bbSelected].color+'90' : 'rgba(239,68,68,0.5)') : null;
          const bg = previewColor || (cell ? cell : 'rgba(255,255,255,0.04)');
          const border = cell ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.04)';
          return `<div onclick="bbHandleCellClick(${r},${c})" onmouseenter="bbHandleCellHover(${r},${c})" style="aspect-ratio:1;border-radius:5px;background:${bg};border:${border};cursor:${bbSelected!==null?'pointer':'default'};transition:all 0.12s;${hoverActive?'transform:scale(0.95)':''}"></div>`;
        }).join('')).join('')}
      </div>
      <div style="display:flex;gap:0.6rem;justify-content:center;margin-top:0.8rem">
        ${bbPieces.map((p,i)=>{
          if(!p) return `<div style="width:90px;height:90px;display:flex;align-items:center;justify-content:center;opacity:0.2;border:1px dashed var(--border-color);border-radius:10px;font-size:0.6rem;color:var(--text-muted)">usada</div>`;
          const sel = bbSelected===i;
          // compute bounds
          const rows=Math.max(...p.cells.map(c=>c[0]))+1, cols=Math.max(...p.cells.map(c=>c[1]))+1;
          return `<div onclick="bbSelected=${i};bbRender()" style="width:90px;height:90px;display:grid;place-items:center;background:${sel?'rgba(139,92,246,0.15)':'var(--bg-card)'};border:2px solid ${sel?'#8b5cf6':'var(--border-color)'};border-radius:10px;cursor:pointer;transition:all 0.15s;transform:${sel?'scale(1.05)':''};box-shadow:${sel?'0 4px 16px rgba(139,92,246,0.3)':''}">
            <div style="display:grid;grid-template-columns:repeat(${cols},16px);gap:2px">
              ${Array.from({length:rows}).map((_,r)=> Array.from({length:cols}).map((_,c)=> p.cells.some(([dr,dc])=>dr===r&&dc===c) ? `<div style="width:16px;height:16px;border-radius:3px;background:${p.color};border:1px solid rgba(255,255,255,0.15)"></div>` : `<div style="width:16px;height:16px"></div>`).join('')).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
      ${!canPlaceAny && bbPieces.some(Boolean) ? `<div style="margin-top:0.6rem;padding:0.6rem;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:8px;text-align:center;font-size:0.78rem;color:#f87171">Sin movimientos posibles — Reinicia</div>` : ''}
    </div>
  `;
  el.innerHTML=html;
}

window.bbHandleCellClick=bbHandleCellClick;
window.bbHandleCellHover=bbHandleCellHover;
window.bbInit=bbInit;
window.renderBlockBlast=bbRender;
