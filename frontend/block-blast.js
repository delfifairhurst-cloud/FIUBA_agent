// block-blast.js — Block Blast FIUBA (60fps, drag real)
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
let bbDragging = null;
let bbHover = null;
let bbGhost = null;
let bbCellEls = []; // 10x10
let bbPrevPreview = []; // last preview cells
let bbLastHoverKey = null;
let bbCombo = 0;
let bbAnimating = false;

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
  return { board: nb, cleared, rows, cols };
}
function bbIsGameOver(board, pieces){
  for(const p of pieces) for(let r=0;r<BB_SIZE;r++) for(let c=0;c<BB_SIZE;c++) if(bbCanPlace(board,p,r,c)) return false;
  return true;
}
function bbInit(){
  bbBoard = Array(BB_SIZE).fill(0).map(()=>Array(BB_SIZE).fill(0));
  bbScore=0; bbCombo=0; bbAnimating=false; bbPieces=bbRandomPieces(); bbDragging=null; bbHover=null;
  bbRenderFull();
}
function bbShowFloating(text, color, offsetY){
  const board=document.getElementById('bb-board');
  if(!board) return;
  const el=document.createElement('div');
  el.textContent=text;
  el.style.cssText=`position:absolute;left:50%;top:45%;transform:translate(-50%,-50%);background:${color};color:white;font-weight:900;font-size:1.1rem;padding:0.35rem 0.7rem;border-radius:10px;pointer-events:none;z-index:20;box-shadow:0 6px 20px rgba(0,0,0,0.3);opacity:0;`;
  board.style.position='relative';
  board.appendChild(el);
  el.animate([{opacity:0, transform:'translate(-50%,-30%) scale(0.85)'},{opacity:1, transform:'translate(-50%,-50%) scale(1.08)'},{opacity:1, transform:'translate(-50%,-50%) scale(1)'},{opacity:0, transform:'translate(-50%,-70%) scale(0.95)'}],{duration:900, easing:'cubic-bezier(0.2,0.8,0.2,1)'});
  setTimeout(()=>el.remove(),900);
}
function bbTryPlace(idx,r,c){
  if(bbAnimating) return;
  const shape = bbPieces[idx]; if(!shape) return;
  if(!bbCanPlace(bbBoard, shape, r, c)){
    const el=document.getElementById('bb-board'); if(el){ el.animate([{transform:'translateX(0)'},{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(0)'}],{duration:180}); }
    return;
  }
  bbBoard = bbPlace(bbBoard, shape, r, c);
  bbUpdateBoard();
  let gained = shape.cells.length * 10;
  const res = bbClearLines(bbBoard);
  const cleared = res.cleared;
  let comboBonus=0;
  if(cleared>0){
    bbCombo++;
    comboBonus = bbCombo>=2 ? (bbCombo-1)*50*cleared : 0;
    // animate rows/cols: scale + flash
    const toFlash = new Set();
    res.rows.forEach(rr=>{ for(let cc=0;cc<BB_SIZE;cc++) toFlash.add(rr+','+cc); });
    res.cols.forEach(cc=>{ for(let rr=0;rr<BB_SIZE;rr++) toFlash.add(rr+','+cc); });
    toFlash.forEach(key=>{
      const [rr,cc]=key.split(',').map(Number);
      const el=bbCellEls[rr][cc];
      el.animate([{transform:'scale(1)', background: el.style.background},{transform:'scale(1.12)', background:'white'},{transform:'scale(0.2)', background:'white', opacity:0.6}],{duration:260, easing:'cubic-bezier(0.4,0,0.6,1)'});
    });
    bbAnimating=true;
    setTimeout(()=>{
      bbBoard=res.board;
      gained += cleared*100 + comboBonus;
      bbScore += gained;
      if(window.addXP) try{ window.addXP(cleared*10 + (bbCombo>=2?5:0), 'Block Blast'); }catch{}
      if(bbScore>bbBest){ bbBest=bbScore; localStorage.setItem(BB_KEY_BEST, String(bbBest)); }
      const scoreEl=document.getElementById('bb-score'); if(scoreEl) scoreEl.textContent=bbScore;
      const bestEl=document.getElementById('bb-best'); if(bestEl) bestEl.textContent=bbBest;
      bbUpdateBoard();
      // floating texts
      if(cleared>=2) bbShowFloating('¡'+cleared+' líneas! +'+(cleared*100), '#8b5cf6', 0);
      if(bbCombo>=2) setTimeout(()=>bbShowFloating('COMBO x'+bbCombo+' +'+comboBonus+'!', '#f59e0b', -28), 180);
      else if(cleared===1) bbShowFloating('+100', '#22c55e', 0);
      bbPieces[idx]=null;
      if(bbPieces.every(p=>p===null)) bbPieces = bbRandomPieces();
      bbUpdatePieces();
      bbAnimating=false;
      if(bbIsGameOver(bbBoard, bbPieces.filter(Boolean))){
        setTimeout(()=>{ alert('¡Sin movimientos! Puntaje: '+bbScore+' | Récord: '+bbBest); },250);
      }
    }, 260);
  } else {
    bbCombo=0;
    bbScore += gained;
    const scoreEl=document.getElementById('bb-score'); if(scoreEl) scoreEl.textContent=bbScore;
    if(bbScore>bbBest){ bbBest=bbScore; localStorage.setItem(BB_KEY_BEST, String(bbBest)); const b=document.getElementById('bb-best'); if(b) b.textContent=bbBest; }
    bbPieces[idx]=null;
    if(bbPieces.every(p=>p===null)) bbPieces = bbRandomPieces();
    bbUpdateBoard(); bbUpdatePieces();
    if(bbIsGameOver(bbBoard, bbPieces.filter(Boolean))){
      setTimeout(()=>{ alert('¡Sin movimientos! Puntaje: '+bbScore+' | Récord: '+bbBest); },200);
    }
  }
  // immediate visual for placed piece
  if(cleared===0){
    document.getElementById('bb-score').textContent=bbScore;
  }
}

function bbHandleCellClick(r,c){
  if(bbDragging!==null) return;
  if(bbSelected===null) return;
  const sh=bbPieces[bbSelected];
  if(!sh) return;
  const rows=Math.max(...sh.cells.map(cc=>cc[0]))+1, cols=Math.max(...sh.cells.map(cc=>cc[1]))+1;
  const offR=Math.floor(rows/2), offC=Math.floor(cols/2);
  bbTryPlace(bbSelected, r - offR, c - offC);
}
function bbHandleCellHover(r,c){}
// DOM helpers
function bbUpdateBoard(){
  for(let r=0;r<BB_SIZE;r++) for(let c=0;c<BB_SIZE;c++){
    const el=bbCellEls[r][c];
    const val=bbBoard[r][c];
    if(val){ el.style.background=val; el.style.border='1px solid rgba(255,255,255,0.14)'; el.style.boxShadow='inset 0 1px 0 rgba(255,255,255,0.25)'; }
    else { el.style.background='rgba(255,255,255,0.035)'; el.style.border='1px solid rgba(255,255,255,0.05)'; el.style.boxShadow='none'; }
    el.style.transform='';
  }
}
function bbUpdatePieces(){
  const wrap=document.getElementById('bb-pieces');
  if(!wrap) return;
  wrap.innerHTML = bbPieces.map((p,i)=>{
    if(!p) return `<div style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;opacity:0.18;border:1.5px dashed var(--border-color);border-radius:12px;font-size:0.6rem;color:var(--text-muted)">✓</div>`;
    const rows=Math.max(...p.cells.map(c=>c[0]))+1, cols=Math.max(...p.cells.map(c=>c[1]))+1;
    const sel = bbDragging===i;
    return `<div data-bb-piece="${i}" style="width:96px;height:96px;display:grid;place-items:center;background:${sel?'rgba(139,92,246,0.18)':'var(--bg-card)'};border:2px solid ${sel?'#8b5cf6':'var(--border-color)'};border-radius:12px;cursor:grab;touch-action:none;user-select:none;transition:transform 0.12s, box-shadow 0.12s;${sel?'transform:scale(1.06);box-shadow:0 8px 24px rgba(139,92,246,0.35)':''}">
      <div style="display:grid;grid-template-columns:repeat(${cols},18px);gap:2px;pointer-events:none">
        ${Array.from({length:rows}).map((_,r)=> Array.from({length:cols}).map((_,c)=> p.cells.some(([dr,dc])=>dr===r&&dc===c) ? `<div style="width:18px;height:18px;border-radius:4px;background:${p.color};border:1px solid rgba(255,255,255,0.18);box-shadow:inset 0 1px 0 rgba(255,255,255,0.25)"></div>` : `<div style="width:18px;height:18px"></div>`).join('')).join('')}
      </div>
    </div>`;
  }).join('');
  // bind drag
  wrap.querySelectorAll('[data-bb-piece]').forEach(el=>{
    const idx=parseInt(el.getAttribute('data-bb-piece'));
    el.addEventListener('pointerdown', (e)=> bbDragStart(idx,e));
  });
}

function bbClearPreview(){
  for(const key of bbPrevPreview){
    const [r,c]=key.split(',').map(Number);
    const el=bbCellEls[r] && bbCellEls[r][c];
    if(el && !bbBoard[r][c]){
      el.style.background='rgba(255,255,255,0.035)';
      el.style.transform='';
      el.style.border='1px solid rgba(255,255,255,0.05)';
    }
  }
  bbPrevPreview=[];
}
function bbSetPreview(hover){
  bbClearPreview();
  if(!hover || bbDragging===null) return;
  const sh=bbPieces[bbDragging];
  if(!sh) return;
  const rows=Math.max(...sh.cells.map(c=>c[0]))+1, cols=Math.max(...sh.cells.map(c=>c[1]))+1;
  const offR=Math.floor(rows/2), offC=Math.floor(cols/2);
  const baseR=hover.r - offR, baseC=hover.c - offC;
  const can=bbCanPlace(bbBoard, sh, baseR, baseC);
  for(const [dr,dc] of sh.cells){
    const nr=baseR+dr, nc=baseC+dc;
    if(nr>=0&&nr<BB_SIZE&&nc>=0&&nc<BB_SIZE && !bbBoard[nr][nc]){
      const el=bbCellEls[nr][nc];
      el.style.background = can ? sh.color+'B0' : 'rgba(239,68,68,0.55)';
      el.style.transform='scale(0.92)';
      el.style.border=can ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(239,68,68,0.4)';
      bbPrevPreview.push(nr+','+nc);
    }
  }
}
function bbDragStart(idx, e){
  if(!bbPieces[idx]) return;
  bbDragging=idx; bbHover=null; bbPrevPreview=[];
  e.preventDefault(); try{ e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); }catch{}
  const piece=bbPieces[idx];
  const ghost=document.createElement('div');
  ghost.id='bb-ghost';
  ghost.style.cssText='position:fixed;left:0;top:0;pointer-events:none;z-index:9999;opacity:0.96;transform:translate(-50%,-50%);filter:drop-shadow(0 10px 20px rgba(0,0,0,0.45));will-change:transform,left,top';
  const cols=Math.max(...piece.cells.map(c=>c[1]))+1, rows=Math.max(...piece.cells.map(c=>c[0]))+1;
  ghost.innerHTML=`<div style="display:grid;grid-template-columns:repeat(${cols},20px);gap:2px">${Array.from({length:rows}).map((_,r)=> Array.from({length:cols}).map((_,c)=> piece.cells.some(([dr,dc])=>dr===r&&dc===c) ? `<div style="width:20px;height:20px;border-radius:4px;background:${piece.color};border:1px solid rgba(255,255,255,0.22)"></div>` : `<div style="width:20px;height:20px"></div>`).join('')).join('')}</div>`;
  document.body.appendChild(ghost); bbGhost=ghost;
  let lastX=0,lastY=0, raf=null;
  const onMove = (ev)=>{
    lastX=ev.clientX; lastY=ev.clientY;
    if(raf) return;
    raf=requestAnimationFrame(()=>{
      raf=null;
      ghost.style.left=lastX+'px'; ghost.style.top=lastY+'px';
      const el=document.elementFromPoint(lastX,lastY);
      const cell=el && el.closest && el.closest('[data-bb-cell]');
      if(cell){
        const r=parseInt(cell.getAttribute('data-r')), c=parseInt(cell.getAttribute('data-c'));
        const key=r+','+c;
        if(bbLastHoverKey!==key){
          bbLastHoverKey=key;
          const rows2=Math.max(...piece.cells.map(cc=>cc[0]))+1, cols2=Math.max(...piece.cells.map(cc=>cc[1]))+1;
          const offR=Math.floor(rows2/2), offC=Math.floor(cols2/2);
          const baseR=r - offR, baseC=c - offC;
          const newHover={r:baseR,c:baseC};
          // use base for placement, but hover for preview base
          if(!bbHover || bbHover.r!==newHover.r || bbHover.c!==newHover.c){
            bbHover=newHover;
            bbSetPreview(newHover);
          }
        }
      } else {
        if(bbHover){ bbHover=null; bbLastHoverKey=null; bbClearPreview(); }
      }
    });
  };
  const onUp = (ev)=>{
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    if(ghost.parentNode) ghost.remove(); bbGhost=null;
    const x=ev.clientX, y=ev.clientY;
    const el=document.elementFromPoint(x,y);
    const cell=el && el.closest && el.closest('[data-bb-cell]');
    if(cell){
      const r=parseInt(cell.getAttribute('data-r')), c=parseInt(cell.getAttribute('data-c'));
      const rows2=Math.max(...piece.cells.map(cc=>cc[0]))+1, cols2=Math.max(...piece.cells.map(cc=>cc[1]))+1;
      const offR=Math.floor(rows2/2), offC=Math.floor(cols2/2);
      bbTryPlace(idx,r - offR, c - offC);
    } else {
      bbHover=null; bbLastHoverKey=null; bbClearPreview(); bbUpdateBoard();
    }
    bbDragging=null; bbHover=null; bbLastHoverKey=null; bbClearPreview(); bbUpdatePieces();
  };
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
}

function bbRenderFull(){
  const el=document.getElementById('blockblast-content');
  if(!el) return;
  el.innerHTML = `
    <div style="max-width:560px;margin:0 auto;padding:0.6rem 0.8rem 1rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;flex-wrap:wrap;gap:0.4rem">
        <h2 style="font-family:var(--font-heading);font-size:1.15rem;color:var(--text-primary);margin:0;display:flex;align-items:center;gap:0.4rem"><span style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#8b5cf6,#ec4899);display:flex;align-items:center;justify-content:center">🧱</span> Block Blast</h2>
        <div style="display:flex;gap:0.35rem;align-items:center">
          <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.3rem 0.65rem;text-align:center;min-width:74px">
            <div style="font-size:0.58rem;color:var(--text-muted)">PUNTAJE</div>
            <div id="bb-score" style="font-size:1rem;font-weight:800;color:var(--text-primary)">${bbScore}</div>
          </div>
          <div style="background:linear-gradient(135deg,rgba(245,158,11,0.12),rgba(249,115,22,0.12));border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:0.3rem 0.65rem;text-align:center;min-width:74px">
            <div style="font-size:0.58rem;color:#f59e0b">RÉCORD</div>
            <div id="bb-best" style="font-size:1rem;font-weight:800;color:#f59e0b">${bbBest}</div>
          </div>
          <button onclick="bbInit()" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:10px;padding:0.4rem 0.7rem;cursor:pointer;font-size:0.72rem;color:var(--text-primary);font-weight:600">↻</button>
        </div>
      </div>
      <p style="font-size:0.68rem;color:var(--text-muted);margin:0 0 0.45rem;text-align:center">Arrastra y suelta. Completa filas o columnas.</p>
      <div id="bb-board" style="width:100%;aspect-ratio:1;display:grid;grid-template-columns:repeat(${BB_SIZE},1fr);gap:4px;background:rgba(15,15,25,0.96);border:2px solid rgba(139,92,246,0.22);border-radius:14px;padding:8px;box-shadow:0 10px 36px rgba(0,0,0,0.35)">
        ${Array.from({length:BB_SIZE}).map((_,r)=> Array.from({length:BB_SIZE}).map((_,c)=> `<div data-bb-cell data-r="${r}" data-c="${c}" style="aspect-ratio:1;border-radius:6px;background:rgba(255,255,255,0.035);border:1px solid rgba(255,255,255,0.05);transition:background 0.08s, transform 0.08s"></div>`).join('')).join('')}
      </div>
      <div id="bb-pieces" style="display:flex;gap:0.6rem;justify-content:center;margin-top:0.85rem"></div>
      <div style="text-align:center;margin-top:0.45rem;font-size:0.62rem;color:var(--text-muted)">Tip: arrastra rápido, sin lag. +10 por bloque, +100 por línea.</div>
    </div>
  `;
  // cache cells
  bbCellEls = Array(BB_SIZE).fill(0).map(()=>Array(BB_SIZE).fill(0));
  el.querySelectorAll('[data-bb-cell]').forEach(cell=>{
    const r=parseInt(cell.getAttribute('data-r')), c=parseInt(cell.getAttribute('data-c'));
    bbCellEls[r][c]=cell;
    cell.addEventListener('click', ()=>{ if(bbDragging===null && bbPieces.some(Boolean)){ /* click fallback: select first piece if none selected */ }});
  });
  bbUpdateBoard(); bbUpdatePieces();
}

window.bbHandleCellClick=bbHandleCellClick;
window.bbHandleDragStart=bbDragStart;
window.bbInit=bbInit;
window.renderBlockBlast=bbRenderFull;
