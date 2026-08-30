// library-ui.js - UI Biblioteca organizada + Altillo import
import { addLibraryItem, getLibraryItems, deleteLibraryItem, shareCommunityLink, getCommunityLinks, deleteCommunityLink } from "./library.js";
import { authReady } from "./firebase.js";

window.importAltillo = async () => {
  const url = document.getElementById("altillo-url")?.value.trim();
  if (!url) { alert("Pegá una URL de Altillo"); return; }
  const preview = document.getElementById("altillo-preview");
  if (preview) preview.innerHTML = "⏳ Importando y organizando...";
  try {
    const apiBase = window.getApiBase ? window.getApiBase() : "http://localhost:3000";
    const r = await fetch(`${apiBase}/api/altillo/import?url=${encodeURIComponent(url)}`);
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Error");
    let html = `<div style="margin-top:0.4rem"><strong style="color:var(--accent-cyan)">Encontrados ${data.total} archivos</strong> <span style="font-size:0.68rem">(${data.attribution})</span><br>`;
    for (const [section, links] of Object.entries(data.sections)) {
      html += `<div style="margin-top:0.4rem"><strong>${section}</strong> (${links.length})<br>`;
      html += links.slice(0,6).map(l=>`<a href="${l.href}" target="_blank" style="color:var(--text-secondary);font-size:0.7rem">${l.year?l.year+": ":""}${l.label}</a>`).join(" · ");
      if (links.length>6) html += ` <span style="font-size:0.68rem">+${links.length-6} más</span>`;
      html += ` <button onclick="saveAltilloSection('${section.replace(/'/g,"\\'")}')" style="background:var(--primary);color:white;border:none;border-radius:4px;padding:0.15rem 0.4rem;font-size:0.65rem;cursor:pointer;margin-left:0.3rem">Guardar</button></div>`;
    }
    html += `</div><button onclick="saveAllAltillo()" style="margin-top:0.5rem;background:linear-gradient(135deg,var(--primary),var(--accent-cyan));color:white;border:none;border-radius:6px;padding:0.4rem 0.7rem;font-size:0.75rem;cursor:pointer;width:100%">Guardar todo en Biblioteca</button>`;
    if (preview) preview.innerHTML = html;
    window._lastAltilloData = data;
  } catch(e){
    console.error(e);
    if (preview) preview.innerHTML = `<span style="color:var(--danger)">Error: ${e.message}</span>`;
  }
};

window.saveAltilloSection = async (section) => {
  const data = window._lastAltilloData;
  if (!data) return;
  const links = data.sections[section] || [];
  for (const l of links) {
    await addLibraryItem({ subject: "Pensamiento Computacional", category: section, title: `${l.year?l.year+" - ":""}${l.label}`, filename: l.href });
  }
  alert(`Guardados ${links.length} de ${section} en Biblioteca`);
  refreshLibrary();
};
window.saveAllAltillo = async () => {
  const data = window._lastAltilloData;
  if (!data) return;
  let count=0;
  for (const [section, links] of Object.entries(data.sections)) {
    for (const l of links) {
      await addLibraryItem({ subject: "Pensamiento Computacional", category: section, title: `${l.year?l.year+" - ":""}${l.label}`, filename: l.href });
      count++;
    }
  }
  alert(`Guardados ${count} archivos en Biblioteca (organizados por sección)`);
  refreshLibrary();
};

window.openLibraryModal = () => {
  if (!window.getUid || !window.getUid()) { }
  document.getElementById("library-modal")?.classList.add("open");
};
window.closeLibraryModal = () => document.getElementById("library-modal")?.classList.remove("open");

window.handleSaveLibrary = async () => {
  const subject = document.getElementById("lib-subject")?.value.trim();
  const category = document.getElementById("lib-category")?.value;
  const title = document.getElementById("lib-title")?.value.trim();
  const filename = document.getElementById("lib-filename")?.value.trim();
  if (!subject || !title) { alert("Materia y título son obligatorios"); return; }
  try {
    await addLibraryItem({ subject, category, title, filename });
    closeLibraryModal();
    document.getElementById("lib-title").value = "";
    document.getElementById("lib-filename").value = "";
    await refreshLibrary();
  } catch(e){ alert(e.message); }
};

async function refreshLibrary() {
  try {
    const items = await getLibraryItems();
    const badge = document.getElementById("library-count");
    const container = document.getElementById("library-list");
    if (badge) badge.textContent = `${items.length}`;
    if (container) {
      if (items.length === 0) {
        container.innerHTML = `<div style="font-size:0.72rem;color:var(--text-muted);text-align:center;padding:0.6rem;background:rgba(255,255,255,0.03);border:1px dashed var(--border-color);border-radius:8px">Vacía. Creá carpetas por materia.</div>`;
      } else {
        const bySubject = {};
        items.forEach(it=>{ if (!bySubject[it.subject]) bySubject[it.subject]=[]; bySubject[it.subject].push(it); });
        const catIcon = (c)=> ({Apuntes:"",Guías:"",Parciales:"",Finales:"",Resúmenes:"",Otros:""}[c]||"");
        container.innerHTML = Object.entries(bySubject).map(([subj, list])=> `
          <div style="margin-bottom:0.5rem;background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.3rem">
              <span style="font-weight:700;font-size:0.8rem;color:var(--text-primary);display:flex;align-items:center;gap:0.3rem"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> ${subj}</span>
              <span style="font-size:0.68rem;background:var(--accent-cyan);color:white;padding:0.1rem 0.4rem;border-radius:10px">${list.length}</span>
            </div>
            ${list.slice(0,4).map(it=>`
              <div style="display:flex;justify-content:space-between;align-items:center;padding:0.25rem 0;border-bottom:1px solid rgba(255,255,255,0.04)">
                <div style="flex:1;min-width:0">
                  <div style="font-size:0.75rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-secondary)">${catIcon(it.category)} ${it.title}</div>
                  <div style="font-size:0.65rem;color:var(--text-muted)">${it.category}</div>
                </div>
                <button onclick="handleDeleteLibrary('${it.id}')" title="Eliminar" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.8rem;padding:0.15rem">✕</button>
              </div>
            `).join("")}
            ${list.length>4 ? `<div style="font-size:0.68rem;color:var(--accent-cyan);text-align:center;margin-top:0.3rem;cursor:pointer" onclick="switchView('biblioteca')">+${list.length-4} más en Biblioteca →</div>` : ``}
          </div>
        `).join("");
      }
    }
    const grid = document.getElementById("biblioteca-view-grid");
    const empty = document.getElementById("biblioteca-view-empty");
    const listEl = document.getElementById("biblioteca-view-list");
    window._allLibraryItems = items;
    if (grid) {
      if (items.length === 0) {
        grid.innerHTML = "";
        if (empty) empty.classList.remove("hidden");
      } else {
        if (empty) empty.classList.add("hidden");
        renderBibliotecaGrid(items);
      }
    }
    if (listEl) {
      listEl.innerHTML = items.length ? `<div style="font-size:0.7rem;color:var(--text-muted);text-align:center;margin-top:0.5rem">${items.length} archivos en tu biblioteca privada</div>` : "";
    }
  } catch(e){ console.error(e); }
}

function renderBibliotecaGrid(items) {
  const grid = document.getElementById("biblioteca-view-grid");
  if (!grid) return;
  const bySubject = {};
  items.forEach(it=>{ if (!bySubject[it.subject]) bySubject[it.subject]=[]; bySubject[it.subject].push(it); });
  const catColor = (c)=> ({Apuntes:"#3b82f6",Guías:"#06b6d4",Parciales:"#8b5cf6",Finales:"#10b981",Resúmenes:"#f59e0b",Otros:"#64748b"}[c]||"#64748b");
  grid.innerHTML = Object.entries(bySubject).map(([subj, list])=> `
    <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;overflow:hidden;display:flex;flex-direction:column">
      <div style="padding:0.8rem 1rem;background:linear-gradient(135deg, ${catColor(list[0].category)}15, transparent);border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:700;font-size:0.9rem;color:var(--text-primary);display:flex;align-items:center;gap:0.4rem"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> ${subj}</span>
        <span style="font-size:0.68rem;background:var(--bg-dark);color:var(--text-muted);padding:0.2rem 0.45rem;border-radius:10px;border:1px solid var(--border-color)">${list.length} archivos</span>
      </div>
      <div style="padding:0.5rem;display:flex;flex-direction:column;gap:0.4rem;flex:1">
        ${list.map(it=>`
          <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);border-radius:8px;padding:0.5rem 0.6rem">
            <div style="flex:1;min-width:0">
              <div style="font-size:0.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--text-primary)">${it.title}</div>
              <div style="font-size:0.68rem;color:var(--text-muted);display:flex;gap:0.4rem;align-items:center"><span style="background:${catColor(it.category)};color:white;padding:0.1rem 0.35rem;border-radius:10px;font-size:0.6rem">${it.category}</span> ${it.filename?`<span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px">${it.filename}</span>`:""}</div>
            </div>
            <button onclick="handleDeleteLibrary('${it.id}')" title="Eliminar" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0.3rem">✕</button>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
}

window.filterBiblioteca = (val) => {
  const search = (val !== undefined ? val : document.getElementById("biblioteca-search")?.value || "").toLowerCase();
  const cat = document.getElementById("biblioteca-filter-cat")?.value || "";
  const items = window._allLibraryItems || [];
  const filtered = items.filter(it=>{
    const matchSearch = !search || it.subject.toLowerCase().includes(search) || it.title.toLowerCase().includes(search);
    const matchCat = !cat || it.category === cat;
    return matchSearch && matchCat;
  });
  renderBibliotecaGrid(filtered);
  const empty = document.getElementById("biblioteca-view-empty");
  if (empty) empty.classList.toggle("hidden", filtered.length!==0);
};

window.shareToCommunityComunidad = async () => {
  const url = document.getElementById("community-link-comunidad")?.value.trim();
  const title = document.getElementById("community-title-comunidad")?.value.trim();
  if (!url || !title) { alert("Título y link son obligatorios"); return; }
  if (!url.startsWith("http")) { alert("Link debe empezar con https://"); return; }
  try {
    await shareCommunityLink({ title, url });
    document.getElementById("community-link-comunidad").value = "";
    document.getElementById("community-title-comunidad").value = "";
    refreshCommunity();
    alert("¡Compartido en Comunidad!");
  } catch(e){ alert(e.message); }
};

async function refreshCommunity() {
  try {
    const list = await getCommunityLinks();
    const container = document.getElementById("community-list-comunidad");
    if (!container) return;
    
    if (list.length === 0) {
      container.innerHTML = `<div style="font-size:0.72rem;color:var(--text-muted);text-align:center;padding:0.4rem">Aún nadie compartió. Sé el primero.</div>`;
      return;
    }
    
    // Agrupar por URL para detectar duplicados
    const byUrl = {};
    list.forEach(item => {
      if (!byUrl[item.url]) byUrl[item.url] = [];
      byUrl[item.url].push(item);
    });
    
    const html = Object.entries(byUrl).map(([url, items]) => {
      const isDuplicate = items.length > 1;
      const mainItem = items[0];
      const duplicates = items.slice(1);
      
      return `
        <div style="display:flex;flex-direction:column;gap:0.3rem;margin-bottom:0.5rem">
          <div style="display:flex;align-items:center;gap:0.4rem;background:rgba(255,255,255,0.04);border:1px solid var(--border-color);border-radius:8px;padding:0.5rem 0.7rem">
            <a href="${mainItem.url}" target="_blank" style="flex:1;display:flex;justify-content:space-between;align-items:center;text-decoration:none;color:var(--text-secondary);gap:0.5rem;min-width:0">
              <span style="font-size:0.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1">${mainItem.title}</span>
              <span style="font-size:0.65rem;color:var(--accent-cyan);white-space:nowrap">Abrir →</span>
            </a>
            <button onclick="handleDeleteCommunity('${mainItem.id}')" title="Eliminar" style="background:none;border:none;color:var(--text-muted);cursor:pointer;padding:0.2rem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
          ${isDuplicate ? `
            <div style="margin-left:1.5rem;font-size:0.65rem;color:var(--text-muted);display:flex;gap:0.3rem;flex-wrap:wrap">
              ${duplicates.map(d => `<button onclick="handleDeleteCommunity('${d.id}')" style="background:rgba(255,255,255,0.08);color:var(--text-muted);border:1px solid var(--border-color);border-radius:4px;padding:0.15rem 0.4rem;font-size:0.6rem;cursor:pointer">Borrar dup</button>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
  } catch(e){ console.error(e); }
}

window.handleDeleteLibrary = async (id) => { if(!confirm("¿Eliminar?")) return; await deleteLibraryItem(id); refreshLibrary(); };
window.handleDeleteCommunity = async (id) => { if(!confirm("¿Eliminar link compartido?")) return; try { await deleteCommunityLink(id); refreshCommunity(); } catch(e){ alert(e.message); } };
window.refreshLibrary = refreshLibrary;
window.refreshCommunity = refreshCommunity;

authReady.then(()=> { refreshLibrary(); refreshCommunity(); });
window.addEventListener("fiuba-auth-ready", ()=> { refreshLibrary(); refreshCommunity(); });
