// knowledge-graph-galaxy.js — FIUBA second brain with vis-network 9.1.9 (guide PM Tools)
(function(){
if(typeof vis==='undefined'){ console.warn('vis-network not loaded'); return; }

// --- Paleta galaxy (dark always) ---
const KB = {
  font: "'Inter','Segoe UI',sans-serif",
  mono: "'JetBrains Mono','Courier New',monospace",
  colors: {
    center:   { main:'#f5f3ff', glow:'#c4b5fd', text:'#1e1b4b' },
    memory:   { main:'#60a5fa', glow:'#3b82f6', text:'#ffffff' }, // materias
    skills:   { main:'#34d399', glow:'#10b981', text:'#ffffff' }, // conceptos
    apps:     { main:'#fb923c', glow:'#f97316', text:'#ffffff' }, // ideas
    routines: { main:'#fbbf24', glow:'#f59e0b', text:'#1f1300' }, // preguntas
    file:     { main:'#c4b5fd', glow:'#8b5cf6', text:'#ede9fe' }, // apuntes/recursos/examenes
    proyecto: { main:'#2dd4bf', glow:'#14b8a6', text:'#ffffff' },
  }
};
(function injectGalaxyCSS(){
  if(document.getElementById('kb-galaxy-css')) return;
  const s=document.createElement('style'); s.id='kb-galaxy-css';
  s.textContent=`
:root{--kb-bg-0:#05050c;--kb-bg-1:#0d0d1c;--kb-glass:rgba(15,15,25,0.75);--kb-glass-soft:rgba(15,15,25,0.55);--kb-border:rgba(139,92,246,0.22);--kb-border-strong:rgba(139,92,246,0.45);--kb-text:#e6e6f0;--kb-muted:#9a9ab5;--kb-accent:#8b5cf6;--kb-accent-2:#38bdf8;--kb-memory:#60a5fa;--kb-skills:#34d399;--kb-apps:#fb923c;--kb-routines:#fbbf24;--kb-file:#c4b5fd;--kb-oracle:#fb923c;--kb-wiki:#22d3ee;}
.kb-graph-wrap{position:relative;height:560px;border-radius:0.75rem;overflow:hidden;border:1px solid var(--kb-border);background:radial-gradient(ellipse at 30% 20%,#151530 0%,var(--kb-bg-1) 45%,var(--kb-bg-0) 100%);box-shadow:inset 0 0 80px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.02);}
.kb-stars{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;}
.kb-graph{position:absolute;inset:0;z-index:1;background:transparent !important;}
#kbGraph canvas{background:transparent !important;}
.kb-graph-wrap.is-fullscreen{position:fixed;top:60px;left:0;width:100vw;height:calc(100vh - 60px);z-index:10000;border-radius:0;border:none;}
.kb-overlay{position:absolute;z-index:2;background:var(--kb-glass);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid var(--kb-border);border-radius:0.6rem;color:var(--kb-text);box-shadow:0 8px 30px rgba(0,0,0,0.45);}
.kb-overlay-tl{top:12px;left:12px;max-width:min(520px,calc(100% - 24px));}
.kb-overlay-tr{top:12px;right:12px;}
.kb-node-hint{font-size:0.72rem;color:var(--kb-muted);margin-top:0.3rem;opacity:0.85;}
.kb-mini-legend{display:flex;flex-wrap:wrap;gap:0.35rem 0.8rem;font-size:0.72rem;color:var(--kb-muted);padding:0.4rem 0.7rem;max-width:320px;justify-content:flex-end;}
.kb-mini-legend span{display:inline-flex;align-items:center;white-space:nowrap;}
.kb-node-details{padding:0.7rem 0.9rem;min-height:0;font-size:0.85rem;}
.kb-legend-swatch{display:inline-block;width:0.65rem;height:0.65rem;border-radius:50%;margin-right:0.4rem;box-shadow:0 0 6px currentColor;}
.kb-legend-swatch.memory{background:var(--kb-memory);color:var(--kb-memory);}
.kb-legend-swatch.skills{background:var(--kb-skills);color:var(--kb-skills);}
.kb-legend-swatch.apps{background:var(--kb-apps);color:var(--kb-apps);}
.kb-legend-swatch.routines{background:var(--kb-routines);color:var(--kb-routines);}
.kb-legend-swatch.file{background:var(--kb-file);color:var(--kb-file);}
`;
  document.head.appendChild(s);
})();
const _rgbCache={};
function rgb(hex){ if(_rgbCache[hex]) return _rgbCache[hex]; const h=hex.replace('#',''); const n=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16); return (_rgbCache[hex]=((n>>16)&255)+', '+((n>>8)&255)+', '+(n&255)); }
function rgba(hex,a){ return 'rgba('+rgb(hex)+','+a+')'; }
function roundRectPath(ctx,x,y,w,h,r){ r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); }
function drawGlow(ctx,x,y,radius,hex,intensity){
  [[1.9,0.10],[1.35,0.18],[1.0,0.32]].forEach(([m,a])=>{ const r=radius*m; const g=ctx.createRadialGradient(x,y,radius*0.35,x,y,r); g.addColorStop(0,rgba(hex,a*intensity)); g.addColorStop(1,rgba(hex,0)); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); });
}
function drawGlassBody(ctx,x,y,w,h,radius,color,state){
  const l=x-w/2,t=y-h/2;
  const body=ctx.createRadialGradient(l+w*0.25,t+h*0.15,2,x,y,Math.max(w,h)*0.9);
  body.addColorStop(0,rgba(color.main, state.selected?0.75:0.55));
  body.addColorStop(0.6,rgba(color.main,0.28));
  body.addColorStop(1,rgba(color.glow,0.18));
  roundRectPath(ctx,l,t,w,h,radius); ctx.fillStyle='rgba(15,15,25,0.72)'; ctx.fill();
  ctx.fillStyle=body; ctx.fill();
  ctx.lineWidth=state.selected?2.2:(state.hover?1.8:1.2); ctx.strokeStyle=state.selected?'#ffffff':rgba(color.main,state.hover?0.95:0.75); ctx.stroke();
  ctx.save(); roundRectPath(ctx,l,t,w,h,radius); ctx.clip();
  const hl=ctx.createLinearGradient(0,t,0,t+h*0.5); hl.addColorStop(0,'rgba(255,255,255,0.22)'); hl.addColorStop(1,'rgba(255,255,255,0)'); ctx.fillStyle=hl; ctx.fillRect(l,t,w,h*0.5); ctx.restore();
}
function nodeAlpha(id){ const n=nodes.get(id); return n && typeof n.opacity==='number'?n.opacity:1; }
function galaxyRenderer(kind){
  return function({ctx,id,x,y,state,label}){
    const color=KB.colors[kind]||KB.colors.memory;
    const lines=String(label||'').split('\n'); const title=lines[0]||''; const count=lines.length>1?lines.slice(1).join(' '):null;
    const isFile=kind==='file'; const isCenter=kind==='center';
    const titleFont=isCenter?'700 15px '+KB.font:(isFile?'500 11px '+KB.mono:'600 12.5px '+KB.font);
    ctx.font=titleFont; const tw=ctx.measureText(title).width;
    let w,h,r; if(isCenter){ w=h=76; r=38; } else if(isFile){ w=Math.ceil(tw)+22; h=24; r=12; } else { w=Math.max(Math.ceil(tw)+34,96); h=count?50:38; r=h/2; }
    return {
      drawNode(){
        const alpha=nodeAlpha(id); ctx.save(); ctx.globalAlpha=alpha;
        const glowIntensity=state.selected?1.6:(state.hover?1.25:(isFile?0.55:1));
        drawGlow(ctx,x,y,Math.max(w,h)*(isFile?0.55:0.75),color.glow,glowIntensity);
        drawGlassBody(ctx,x,y,w,h,r,color,state);
        ctx.textAlign='center'; ctx.textBaseline='middle';
        if(isCenter){
          const core=ctx.createRadialGradient(x-8,y-10,2,x,y,30);
          core.addColorStop(0,'rgba(255,255,255,0.95)'); core.addColorStop(0.5,rgba(color.glow,0.45)); core.addColorStop(1,rgba(color.glow,0));
          ctx.fillStyle=core; ctx.beginPath(); ctx.arc(x,y,30,0,Math.PI*2); ctx.fill();
          ctx.font=titleFont; ctx.fillStyle='#f5f3ff'; ctx.shadowColor='rgba(0,0,0,0.8)'; ctx.shadowBlur=6; ctx.fillText(title,x,y+h/2+14);
        } else {
          ctx.font=titleFont; ctx.fillStyle=isFile?color.text:'#ffffff'; ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=3; ctx.fillText(title,x,count?y-9:y+0.5);
          if(count){
            ctx.shadowBlur=0; ctx.font='600 10.5px '+KB.font;
            const bw=ctx.measureText(count).width+14,bh=16;
            roundRectPath(ctx,x-bw/2,y+4,bw,bh,8); ctx.fillStyle='rgba(255,255,255,0.16)'; ctx.fill();
            ctx.strokeStyle='rgba(255,255,255,0.28)'; ctx.lineWidth=1; ctx.stroke();
            ctx.fillStyle='#ffffff'; ctx.fillText(count,x,y+12.5);
          }
        }
        ctx.restore();
      },
      nodeDimensions:{width:w,height:h}
    };
  };
}
const EDGE_STYLES={
  trunk:{color:'#a78bfa',opacity:0.6,width:3,highlight:'#e9d5ff',shadow:{enabled:true,color:'rgba(139,92,246,0.45)',size:12,x:0,y:0},smooth:{enabled:true,type:'continuous'}},
  branch:{color:'#a78bfa',opacity:0.45,width:2,highlight:'#e9d5ff',shadow:{enabled:true,color:'rgba(139,92,246,0.3)',size:8,x:0,y:0},smooth:{enabled:true,type:'continuous'}},
  leaf:{color:'#a78bfa',opacity:0.35,width:1.5,highlight:'#e9d5ff',shadow:{enabled:false},smooth:{enabled:true,type:'continuous'}},
  file:{color:'#c4b5fd',opacity:0.45,width:1.2,highlight:'#ede9fe',shadow:{enabled:false},smooth:{enabled:true,type:'continuous'}},
  oracle:{color:'#ffb066',opacity:1,width:2.8,highlight:'#ffd0a0',shadow:{enabled:true,color:'rgba(251,146,60,0.9)',size:14,x:0,y:0},dashes:[8,5],smooth:{enabled:true,type:'cubicBezier'}},
  wiki:{color:'#5eeaff',opacity:1,width:2.4,highlight:'#a5f3fc',shadow:{enabled:true,color:'rgba(34,211,238,0.9)',size:14,x:0,y:0},dashes:[6,5],smooth:{enabled:true,type:'curvedCW',roundness:0.2}}
};
function edgeStyle(kind, dimmed){
  const st=EDGE_STYLES[kind]||EDGE_STYLES.leaf;
  const isCross=kind==='oracle'||kind==='wiki';
  return {kbKind:kind, color:{color:st.color,highlight:st.highlight,hover:st.highlight,opacity:dimmed?(isCross?0.55:0.12):st.opacity,inherit:false}, width:dimmed?(isCross?2:0.8):st.width, shadow:dimmed?(isCross?{enabled:true,color:st.shadow.color,size:6,x:0,y:0}:{enabled:false}):st.shadow, dashes:st.dashes||false, smooth:st.smooth};
}

// Mapeo FIUBA -> galaxy groups/kinds
function fiubaGroup(n){
  if(n.type==='materia') return 'memory';
  if(n.type==='concepto') return 'skills';
  if(n.type==='pregunta') return 'routines';
  if(n.type==='idea') return 'apps';
  if(n.type==='proyecto') return 'center';
  return 'file';
}
function fiubaEdgeKind(e){
  const l=(e.label||'').toLowerCase();
  if(l.includes('contiene')) return 'trunk';
  if(l.includes('relacionado')||l.includes('necesario')) return 'branch';
  if(l.includes('describe')||l.includes('ejercicio')||l.includes('examen')) return 'file';
  if(l.includes('aplica')||l.includes('base')) return 'oracle';
  return 'leaf';
}

let nodes, edges, network, focusedNodeId=null;
let categoryVisibility={}, filteredOutNodeIds=new Set();

function buildDatasets(){
  const allNodes = (window.KG && window.KG.nodes) || [];
  const allEdges = (window.KG && window.KG.edges) || [];
  const dsNodes = allNodes.map(n=>({
    id:n.id,
    label: n.title + (n.materia && n.type==='materia' ? '' : ''),
    title: n.title + (n.materia? ' — '+n.materia:''),
    group: fiubaGroup(n),
    raw: n
  }));
  const dsEdges = allEdges.map(e=>({
    id:e.id,
    from:e.source,
    to:e.target,
    label:e.label||'',
    ...edgeStyle(fiubaEdgeKind(e), false)
  }));
  return {dsNodes, dsEdges};
}

function initGalaxy(){
  const wrap=document.getElementById('kbGraphWrap');
  const graphEl=document.getElementById('kbGraph');
  if(!wrap||!graphEl) return;
  const {dsNodes, dsEdges}=buildDatasets();
  nodes=new vis.DataSet(dsNodes);
  edges=new vis.DataSet(dsEdges);
  const groups={};
  Object.keys(KB.colors).forEach(k=>{ groups[k]={shape:'custom',ctxRenderer:galaxyRenderer(k),color:{background:KB.colors[k].main,border:KB.colors[k].glow},shadow:{enabled:false},borderWidth:0}; });
  const options={
    physics:{enabled:true,solver:'forceAtlas2Based',forceAtlas2Based:{gravitationalConstant:-110,springLength:160,springConstant:0.07,damping:0.6,avoidOverlap:0.4},timestep:0.5,stabilization:{iterations:200}},
    interaction:{hover:true,tooltipDelay:150,navigationButtons:false,keyboard:true,zoomView:true,dragView:true},
    edges:{smooth:{type:'continuous',forceDirection:'none'},arrows:{to:{enabled:false}},color:{color:'#a78bfa',highlight:'#e9d5ff',hover:'#e9d5ff',opacity:0.4,inherit:false},width:1.5,hoverWidth:0.6,selectionWidth:0.8,font:{size:10,color:'#c4b5fd',strokeWidth:0}},
    nodes:{borderWidthSelected:0,scaling:{min:26,max:300},font:{face:KB.font,color:'#fff'}}
  };
  network=new vis.Network(graphEl,{nodes,edges},{groups,...options});
  window.kbGalaxy={network,nodes,edges,KB};
  // starfield
  initStarfield();
  // events
  network.on('click', params=>{
    if(params.nodes.length){
      selectGraphNode(params.nodes[0]);
    } else if(params.edges.length){
      // edge click
    } else {
      clearGraphFocus();
    }
  });
  network.on('doubleClick', params=>{
    if(params.nodes.length){
      const n=nodes.get(params.nodes[0]);
      if(n && n.raw && window.kgShowModal) window.kgShowModal(n.raw.id);
    }
  });
  // drag re-heat physics
  network.on('dragStart', ()=>{ network.setOptions({physics:{enabled:true}}); });
  setTimeout(()=>network.setOptions({physics:{enabled:false}}),6000);
}

function graphCategory(node){
  // map group to category name for legend if needed
  return node.group;
}
function updateGraphPresentation(){
  const focusNodes = focusedNodeId===null?new Set(): new Set([focusedNodeId].concat(network.getConnectedNodes(focusedNodeId)));
  const focusEdges = focusedNodeId===null?new Set(): new Set(network.getConnectedEdges(focusedNodeId));
  const allEdges=edges.get();
  if(focusedNodeId!==null){
    allEdges.forEach(ed=>{
      if(ed.kbKind!=='oracle' && ed.kbKind!=='wiki') return;
      if(focusNodes.has(ed.from)||focusNodes.has(ed.to)){ focusEdges.add(ed.id); focusNodes.add(ed.from); focusNodes.add(ed.to); }
    });
  }
  nodes.get().forEach(node=>{
    const hidden = filteredOutNodeIds.has(node.id);
    const opacity = focusedNodeId===null || focusNodes.has(node.id) ? 1 : 0.35;
    nodes.update({id:node.id, hidden, opacity});
  });
  edges.update(allEdges.map(e=>({id:e.id, ...edgeStyle(e.kbKind||'leaf', !(focusedNodeId===null || focusEdges.has(e.id)))})));
}
function selectGraphNode(nodeId){ focusedNodeId=nodeId; updateGraphPresentation(); if(window.kgShowModal){ const n=nodes.get(nodeId); if(n&&n.raw) window.kgShowModal(n.raw.id); } }
function clearGraphFocus(){ focusedNodeId=null; updateGraphPresentation(); }

function initStarfield(){
  const wrap=document.getElementById('kbGraphWrap');
  const canvas=document.getElementById('kbStars');
  if(!wrap||!canvas) return;
  const ctx=canvas.getContext('2d');
  const stars=[]; for(let i=0;i<120;i++) stars.push({x:Math.random(),y:Math.random(),r:0.4+Math.random()*1.4,phase:Math.random()*Math.PI*2,speed:0.4+Math.random()*1.2,tint:Math.random()<0.15?'196, 181, 253':(Math.random()<0.5?'255, 255, 255':'186, 230, 253')});
  const nebulas=[{x:0.18,y:0.22,r:0.55,c:'139, 92, 246',a:0.20},{x:0.82,y:0.78,r:0.5,c:'56, 189, 248',a:0.14},{x:0.65,y:0.15,r:0.35,c:'236, 72, 153',a:0.10}];
  let staticLayer=null,W=0,H=0,dpr=1,raf=null,last=0;
  function resize(){
    const rect=wrap.getBoundingClientRect(); if(!rect.width||!rect.height) return;
    dpr=Math.min(window.devicePixelRatio||1,2); W=rect.width; H=rect.height;
    canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr); ctx.setTransform(dpr,0,0,dpr,0,0);
    staticLayer=document.createElement('canvas'); staticLayer.width=canvas.width; staticLayer.height=canvas.height;
    const sc=staticLayer.getContext('2d'); sc.setTransform(dpr,0,0,dpr,0,0);
    nebulas.forEach(n=>{ const rad=Math.max(W,H)*n.r; const g=sc.createRadialGradient(n.x*W,n.y*H,0,n.x*W,n.y*H,rad); g.addColorStop(0,'rgba('+n.c+','+n.a+')'); g.addColorStop(0.45,'rgba('+n.c+','+(n.a*0.35)+')'); g.addColorStop(1,'rgba('+n.c+',0)'); sc.fillStyle=g; sc.fillRect(0,0,W,H); });
    sc.fillStyle='rgba(255,255,255,0.055)'; for(let gx=14;gx<W;gx+=28) for(let gy=14;gy<H;gy+=28) sc.fillRect(gx,gy,1,1);
  }
  function frame(t){
    raf=null;
    if(document.hidden||!wrap.offsetParent){ schedule(); return; }
    if(t-last<33){ schedule(); return; } last=t;
    if(!staticLayer) resize(); if(!staticLayer){ schedule(); return; }
    ctx.clearRect(0,0,W,H); ctx.drawImage(staticLayer,0,0,W,H);
    const time=t/1000;
    for(let i=0;i<stars.length;i++){ const st=stars[i]; const tw=0.55+0.45*Math.sin(time*st.speed+st.phase); const x=st.x*W,y=st.y*H; ctx.fillStyle='rgba('+st.tint+','+(0.25+0.7*tw)+')'; ctx.beginPath(); ctx.arc(x,y,st.r,0,Math.PI*2); ctx.fill(); if(st.r>1.3){ ctx.fillStyle='rgba('+st.tint+','+(0.12*tw)+')'; ctx.beginPath(); ctx.arc(x,y,st.r*3,0,Math.PI*2); ctx.fill(); } }
    schedule();
  }
  function schedule(){ if(!raf) raf=requestAnimationFrame(frame); }
  if(window.ResizeObserver) new ResizeObserver(()=>resize()).observe(wrap); else window.addEventListener('resize',resize);
  resize(); schedule();
}

// expose
window.kbGalaxyInit=initGalaxy;
window.kbGalaxySelect=selectGraphNode;
window.kbGalaxyClear=clearGraphFocus;

// auto-init when tech-tree view opens
document.addEventListener('DOMContentLoaded', ()=>{
  const obs=new MutationObserver(()=>{
    const wrap=document.getElementById('kbGraphWrap');
    if(wrap && wrap.offsetParent && !wrap.dataset.inited){
      wrap.dataset.inited='1';
      setTimeout(initGalaxy,200);
    }
  });
  obs.observe(document.body,{childList:true,subtree:true});
});
})();
