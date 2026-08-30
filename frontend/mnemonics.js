// mnemonics.js — Generador de mnemónicos para fórmulas y conceptos
(function () {
  'use strict';

  function openMnemonics() {
    const modal = document.getElementById('mnemonics-modal');
    if (modal) modal.classList.add('open');
  }

  function closeMnemonics() {
    document.getElementById('mnemonics-modal')?.classList.remove('open');
  }

  async function generateMnemonic() {
    const input = document.getElementById('mnemonic-input');
    const text = input?.value.trim();
    if (!text) {
      alert('Escribí la fórmula o concepto que querés memorizar');
      return;
    }

    const resultEl = document.getElementById('mnemonic-result');
    if (!resultEl) return;

    resultEl.innerHTML = `
      <div class="mn-loading">
        <div class="typing-dots"><span></span><span></span><span></span></div>
        Creando mnemónico...
      </div>
    `;

    const prompt = `Soy estudiante de la UBA/FIUBA. Necesito memorizar esto: "${text}"

Creame 2-3 mnemónicos creativos y divertidos para no olvidarlo. Podés usar:
- Frases donde las primeras letras formen la fórmula
- Historias ridículas o escenas visuales
- Asociaciones con cosas cotidianas
- Rimas o canciones cortas

Formato:
**Mnemónico 1**: [la frase/historia] — [explicación de por qué funciona]
**Mnemónico 2**: [la frase/historia] — [explicación]

Sé creativo y gracioso, que se quede en la cabeza.`;

    try {
      const userApiKey = (typeof window.getUserGeminiKey === 'function' ? window.getUserGeminiKey() : '');
      const response = await fetch(window.getApiBase ? window.getApiBase() : 'http://localhost:3000', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          mode: 'profesor',
          context: '',
          userApiKey
        })
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        let html = data.reply
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/\n/g, '<br>');
        resultEl.innerHTML = `<div class="mn-content">${html}</div>`;
      } else {
        resultEl.innerHTML = `<div class="mn-error">⚠️ ${data.error || 'No se pudo generar'}</div>`;
      }
    } catch (e) {
      resultEl.innerHTML = `<div class="mn-error">❌ Error de conexión</div>`;
    }
  }

  function initMnemonics() {
    const modal = document.getElementById('mnemonics-modal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="mn-panel">
        <div class="mn-header">
          <div>
            <h3>Generador de Mnemónicos</h3>
            <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem">Acordate de cualquier fórmula con frases graciosas</p>
          </div>
          <button class="mn-close" onclick="closeMnemonics()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="mn-body">
          <div class="mn-emoji">🧠</div>
          <input type="text" id="mnemonic-input" placeholder="Ej: PV=nRT, fórmula de Bhaskara, Ley de Ohm..." class="mn-input"
            onkeydown="if(event.key==='Enter') generateMnemonic()">
          <button class="mn-btn" onclick="generateMnemonic()">Generar Mnemónicos</button>
          <div id="mnemonic-result" class="mn-result"></div>
        </div>
      </div>
    `;

    document.querySelector('.mn-close')?.addEventListener('click', closeMnemonics);
  }

  window.openMnemonics = openMnemonics;
  window.closeMnemonics = closeMnemonics;
  window.generateMnemonic = generateMnemonic;
  window.initMnemonics = initMnemonics;
})();
