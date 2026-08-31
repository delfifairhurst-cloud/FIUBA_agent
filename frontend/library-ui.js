// library-ui.js - Links útiles (simplificado)
import { authReady } from "./firebase.js";

const USEFUL_LINKS = [
  { label: "Altillo - Parciales de FIUBA", url: "https://altillo.com/fiuba" },
  { label: "FIUBA - Sitio oficial", url: "https://fi.uba.ar" },
  { label: "UBA - Sitio oficial", url: "https://www.uba.ar" },
  { label: "Khan Academy - Matemáticas", url: "https://www.khanacademy.org/math" },
  { label: "Wolfram Alpha - Calculadora", url: "https://www.wolframalpha.com" },
];

function populateBibliotecaLinks() {
  const container = document.getElementById("biblioteca-view-links");
  if (!container) return;
  container.innerHTML = USEFUL_LINKS.map(l => `
    <a href="${l.url}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.7rem;background:rgba(255,255,255,0.03);border:1px solid var(--border-color);border-radius:8px;text-decoration:none;color:var(--text-secondary);font-size:0.82rem;transition:background 0.15s">
      <span style="color:var(--accent-cyan)">→</span> ${l.label}
    </a>
  `).join("");
}

authReady.then(() => populateBibliotecaLinks());
window.addEventListener("fiuba-auth-ready", populateBibliotecaLinks);
