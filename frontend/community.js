// community.js - Funcionalidad de comunidad (links compartidos)
import { shareCommunityLink, getCommunityLinks, deleteCommunityLink } from "./library.js";
import { authReady, getUid } from "./firebase.js";

async function refreshCommunity() {
  const list = document.getElementById("community-list-comunidad");
  if (!list) return;
  try {
    const items = await getCommunityLinks();
    if (items.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.82rem;border:1px dashed var(--border-color);border-radius:12px">No hay material compartido aún. Sé el primero en compartir algo.</div>';
      return;
    }
    const uid = getUid();
    list.innerHTML = items.map(function(item) {
      var isAuthor = uid && item.author === uid.slice(0, 6);
      var dateStr = item.createdAt && item.createdAt.toDate ? item.createdAt.toDate().toLocaleDateString("es-AR") : "";
      return '<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:10px;padding:0.75rem 1rem;display:flex;align-items:center;gap:0.7rem">' +
        '<div style="flex:1;min-width:0">' +
          '<a href="' + item.url + '" target="_blank" rel="noopener" style="font-size:0.88rem;font-weight:600;color:var(--accent-cyan);text-decoration:none;word-break:break-all">' + item.title + '</a>' +
          '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.2rem">' + item.url.replace(/https?:\/\//, '').slice(0, 50) + (item.url.length > 50 ? '...' : '') + ' · ' + dateStr + '</div>' +
        '</div>' +
        (isAuthor ? '<button onclick="deleteCommunityItemComunidad(\'' + item.id + '\')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.8rem;flex-shrink:0" title="Eliminar">🗑️</button>' : '') +
      '</div>';
    }).join("");
  } catch (e) {
    list.innerHTML = '<div style="text-align:center;padding:1rem;color:var(--danger);font-size:0.82rem">Error al cargar: ' + e.message + '</div>';
  }
}

window.shareToCommunityComunidad = async function() {
  var linkInput = document.getElementById("community-link-comunidad");
  var titleInput = document.getElementById("community-title-comunidad");
  var url = linkInput ? linkInput.value.trim() : "";
  var title = titleInput ? titleInput.value.trim() : "";
  if (!url) { alert("Pegá un link (Drive, Notion, GitHub, etc.)"); return; }
  if (!title) { alert("Poné un título para el material"); return; }
  try {
    await shareCommunityLink({ title: title, url: url });
    if (linkInput) linkInput.value = "";
    if (titleInput) titleInput.value = "";
    alert("Compartido con la comunidad");
    refreshCommunity();
  } catch (e) {
    alert("Error: " + e.message);
  }
};

window.deleteCommunityItemComunidad = async function(id) {
  if (!confirm("¿Eliminar este material compartido?")) return;
  try {
    await deleteCommunityLink(id);
    refreshCommunity();
  } catch (e) {
    alert("Error: " + e.message);
  }
};

window.refreshCommunity = refreshCommunity;
