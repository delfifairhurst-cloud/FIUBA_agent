// block-blast.js — Block Blast FIUBA (drag & drop, fullscreen board, record)
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
let bbDragging = null; // idx of piece being dragged
let bbDragGhost = null;

function bbRandomPieces(){ return [0,1,2].map(()=> BB_SHAPES[Math.floor(Math.random()*BB_SHAPES.length)]); }
function bbCanPlace(board, shape, r, c){
  for(const [dr,dc] of shape.cells){ const nr=r+dr,nc=c+dc; if(nr<0||nr>=BB_SIZE||nc<0||nc>=BB_SIZE) return false; if(board[nr][nc]) return false; }
  return true;
}
function bbPlace(board, shape, r, c){
  const nb = board.map(row=>[...row]);
  for(const [dr,dc] of shape.cells) nb[r+dr][c+dc]=shape.color;
  return nb;
}
function bbClearLines(board){
  let nb = board.map(r=>[...r]); let cleared=0; const rows=[], cols=[];
  for(let r=0;r<BB_SIZE;r++) if(nb[r].every(v=>v)) rows.push(r);
  for(let c=0;c<BB_SIZE;c++) if(nb.every(row=>row[c])) cols.push(c);
  rows.forEach(r=>{ for(let c=0;c<BB_SIZE;c++) nb[r][c]=0; cleared++; });
  cols.forEach(c=>{ for(let r=0;r<BB_SIZE;r++) nb[r][c]=0; cleared++; });
  return { board: nb, cleared };
}
function bbIsGameOver(board, pieces){
  for(const p of pieces) for(let r=0;r<BB_SIZE;r++) for(let c=0;c<BB_SIZE;c++) if(bbCanPlace(board,p,r,c)) return false;
  return true;
}
function bbInit(){
  bbBoard = Array(BB_SIZE).fill(0).map(()=>Array(BB_SIZE).fill(0));
  bbScore=0; bbPieces=bbRandomPieces(); bbSelected=null; bbHover=null; bbDragging=null;
  bbRender();
}
function bbTryPlace(idx,r,c){
  const shape = bbPieces[idx]; if(!shape) return false;
  if(!bbCanPlace(bbBoard, shape, r, c)){
    const el=document.getElementById('bb-board'); if(el){ el.style.transform='translateX(4px)'; setTimeout(()=>el.style.transform='',130); }
    return false;
  }
  bbBoard = bbPlace(bbBoard, shape, r, c);
  bbScore += shape.cells.length * 10;
  const res = bbClearLines(bbBoard); bbBoard=res.board;
  if(res.cleared>0){ bbScore += res.cleared*100; if(window.addXP) try{ window.addXP(res.cleared*10, 'Block Blast'); }catch{} }
  bbPieces[idx]=null;
  if(bbPieces.every(p=>p===null)) bbPieces = bbRandomPieces();
  if(bbScore>bbBest){ bbBest=bbScore; localStorage.setItem(BB_KEY_BEST, String(bbBest)); }
  if(bbIsGameOver(bbBoard, bbPieces.filter(Boolean))){
    setTimeout(()=>{ alert('¡Sin movimientos! Puntaje: '+bbScore+' | Récord: '+bbBest); },180);
  }
  bbSelected=null; bbHover=null; bbDragging=null;
  bbRender();
  return true;
}
function bbHandleCellClick(r,c){
  if(bbSelected!==null && bbDragging===null) bbTryPlace(bbSelected,r,c);
}
function bbHandleDragStart(idx, e){
  bbDragging=idx; bbSelected=idx;
  // ghost
  const piece = bbPieces[idx];
  if(!piece) return;
  const ghost=document.createElement('div');
  ghost.id='bb-ghost';
  ghost.style.cssText='position:fixed;pointer-events:none;z-index:9999;opacity:0.92;transform:translate(-50%,-50%) scale(1.15);filter:drop-shadow(0 8px 16px rgba(0,0,0,0.4))';
  const cols=Math.max(...piece.cells.map(c=>c[1]))+1, rows=Math.max(...piece.cells.map(c=>c[0]))+1;
  ghost.innerHTML=`<div style="display:grid;grid-template-columns:repeat(${cols},18px);gap:2px">${Array.from({length:rows}).map((_,r)=> Array.from({length:cols}).map((_,c)=> piece.cells.some(([dr,dc])=>dr===r&&dc===c) ? `<div style="width:18px;height:18px;border-radius:4px;background:${piece.color};border:1px solid rgba(255,255,255,0.2)"></div>` : `<div style="width:18px;height:18px"></div>`).join('')).join('')}</div>`;
  document.body.appendChild(ghost);
  bbDragGhost=ghost;
  const move = (ev)=>{ const x=ev.touches?ev.touches[0].clientX:ev.clientX; const y=ev.touches?ev.touches[0].clientY:ev.clientY; ghost.style.left=x+'px'; ghost.style.top=y+'px';
    const el=document.elementFromPoint(x,y);
    const cell=el && el.closest && el.closest('[data-bb-cell]');
    if(cell){ const rr=parseInt(cell.getAttribute('data-r')), cc=parseInt(cell.getAttribute('data-c')); bbHover={r:rr,c:cc}; bbRenderPreview(); }
  };
  const up = (ev)=>{
    document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up);
    document.removeEventListener('touchmove',move); document.removeEventListener('touchend',up);
    if(ghost.parentNode) ghost.remove(); bbDragGhost=null;
    const x=ev.changedTouches?ev.changedTouches[0].clientX:ev.clientX; const y=ev.changedTouches?ev.changedTouches[0].clientY:ev.clientY;
    const el=document.elementFromPoint(x,y);
    const cell=el && el.closest && el.closest('[data-bb-cell]');
    if(cell){ const rr=parseInt(cell.getAttribute('data-r')), cc=parseInt(cell.getAttribute('data-c')); bbTryPlace(idx,rr,cc); }
    else { bbSelected=null; bbHover=null; bbDragging=null; bbRender(); }
  };
  document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
  document.addEventListener('touchmove',move,{passive:false}); document.addEventListener('touchend',up);
  if(e) e.preventDefault();
}
function bbRenderPreview(){
  // quick preview without full re-render: update board cells border
  document.querySelectorAll('[data-bb-cell]').forEach(el=>{
    const r=parseInt(el.getAttribute('data-r')), c=parseInt(el.getAttribute('data-c'));
    if(bbDragging!==null && bbHover){
      const sh=bbPieces[bbDragging];
      let isPreview=false;
      if(sh) for(const [dr,dc] of sh.cells) if(r===bbHover.r+dr && c===bbHover.c+dc) isPreview=true;
      if(isPreview){
        const can=bbCanPlace(bbBoard, sh, bbHover.r, bbHover.c);
        el.style.background = can ? sh.color+'90' : 'rgba(239,68,68,0.45)';
        el.style.transform='scale(0.96)';
      } else if(!bbBoard[r][c]) {
        el.style.background='rgba(255,255,255,0.04)';
        el.style.transform='';
      }
    }
  });
}
function bbRender(){
  const el=document.getElementById('blockblast-content');
  if(!el) return;
  const canPlaceAny = !bbIsGameOver(bbBoard, bbPieces.filter(Boolean));
  let html = `
    <div style="max-width:520px;margin:0 auto;padding:0.6rem 0.8rem 1rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;flex-wrap:wrap;gap:0.4rem">
        <h2 style="font-family:var(--font-heading);font-size:1.15rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem"><span style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center;font-size:1rem">🧱</span> Block Blast</h2>
        <div style="display:flex;gap:0.35rem;align-items:center">
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.3rem 0.65rem;text-align:center;min-width:74px">
            <div style="font-size:0.58rem;color:var(--text-muted);letter-spacing:0.04em">PUNTAJE</div>
            <div style="font-size:1rem;font-weight:800;color:var(--text-primary)">${bbScore}</div>
          </div>
          <div style="background:linear-gradient(135deg,rgba(245,158,11,0.12),rgba(249,115,22,0.12));border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:0.3rem 0.65rem;text-align:center;min-width:74px">
            <div style="font-size:0.58rem;color:#f59e0b;letter-spacing:0.04em">RÉCORD</div>
            <div style="font-size:1rem;font-weight:800;color:#f59e0b">${bbBest}</div>
          </div>
          <button onclick="bbInit()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:10px;padding:0.4rem 0.7rem;cursor:pointer;font-size:0.72rem;color:var(--text-primary);font-weight:600">↻</button>
        </div>
      </div>
      <p style="font-size:0.68rem;color:var(--text-muted);margin:0 0 0.5rem;text-align:center">Arrastra una pieza al tablero. ¡Llena filas o columnas completas!</p>
      <div id="bb-board" style="width:100%;aspect-ratio:1;display:grid;grid-template-columns:repeat(${BB_SIZE},1fr);gap:4px;background:rgba(15,15,25,0.95);border:2px solid rgba(139,92,246,0.25);border-radius:14px;padding:8px;box-shadow:0 10px 36px rgba(0,0,0,0.35),0 0 24px rgba(139,92,246,0.15)">
        ${bbBoard.map((row,r)=> row.map((cell,c)=>{
          const bg = cell ? cell : 'rgba(255,255,255,0.035)';
          const border = cell ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.05)';
          return `<div data-bb-cell data-r="${r}" data-c="${c}" onclick="bbHandleCellClick(${r},${c})" style="aspect-ratio:1;border-radius:6px;background:${bg};border:${border};cursor:pointer;transition:all 0.12s"></div>`;
        }).join('')).join('')}
      </div>
      <div style="display:flex;gap:0.6rem;justify-content:center;margin-top:0.85rem;align-items:center">
        ${bbPieces.map((p,i)=>{
          if(!p) return `<div style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;opacity:0.18;border:1.5px dashed var(--border-color);border-radius:12px;font-size:0.6rem;color:var(--text-muted)">usada</div>`;
          const rows=Math.max(...p.cells.map(c=>c[0]))+1, cols=Math.max(...p.cells.map(c=>c[1]))+1;
          const sel = bbSelected===i;
          return `<div draggable="true" ondragstart="bbHandleDragStart(${i}, event)" ontouchstart="bbHandleDragStart(${i}, event)" onclick="bbSelected=${i};bbDragging=null;bbRender()" style="width:96px;height:96px;display:grid;place-items:center;background:${sel?'rgba(139,92,246,0.14)':'var(--bg-card)'};border:2px solid ${sel?'#8b5cf6':'var(--border-color)'};border-radius:12px;cursor:grab;touch-action:none;user-select:none;transition:all 0.15s;transform:${sel?'scale(1.04)':''};box-shadow:${sel?'0 6px 20px rgba(139,92,246,0.3)':''}">
            <div style="display:grid;grid-template-columns:repeat(${cols},18px);gap:2px;pointer-events:none">
              ${Array.from({length:rows}).map((_,r)=> Array.from({length:cols}).map((_,c)=> p.cells.some(([dr,dc])=>dr===r&&dc===c) ? `<div style="width:18px;height:18px;border-radius:4px;background:${p.color};border:1px solid rgba(255,255,255,0.18);box-shadow:inset 0 1px 0 rgba(255,255,255,0.25)"></div>` : `<div style="width:18px;height:18px"></div>`).join('')).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
      ${!canPlaceAny && bbPieces.some(Boolean) ? `<div style="margin-top:0.7rem;padding:0.65rem;background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.25);border-radius:10px;text-align:center;font-size:0.8rem;color:#f87171;font-weight:600">Sin movimientos — <button onclick="bbInit()" style="background:#ef4444;color:white;border:none;border-radius:6px;padding:0.2rem 0.5rem;cursor:pointer;margin-left:0.3rem">Reiniciar</button></div>` : ''}
      <div style="text-align:center;margin-top:0.5rem;font-size:0.62rem;color:var(--text-muted)">Tip: en celular mantén presionado y arrastra. En PC arrastra o toca pieza + celda.</div>
    </div>
  `;
  el.innerHTML=html;
}
window.bbHandleCellClick=bbHandleCellClick;
window.bbHandleDragStart=bbHandleDragStart;
window.bbInit=bbInit;
window.renderBlockBlast=bbRender;
