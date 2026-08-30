// export-chat.js — Exportar conversación a PDF limpio
(function () {
  'use strict';

  function exportChatPDF() {
    const chat = window.getActiveChat ? window.getActiveChat() : null;
    if (!chat || !chat.messages || chat.messages.length === 0) {
      alert('No hay mensajes para exportar.');
      return;
    }

    // Build clean HTML for PDF
    const modeLabels = { profesor: 'Profesor', tutor: 'Tutor', examinador: 'Examinador', resolucion: 'Resolución' };

    let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; padding: 40px; max-width: 700px; margin: 0 auto; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; }
    .header h1 { font-size: 1.4rem; color: #0f172a; margin-bottom: 0.3rem; }
    .header p { font-size: 0.85rem; color: #64748b; }
    .msg { margin-bottom: 1rem; padding: 0.8rem 1rem; border-radius: 10px; font-size: 0.9rem; }
    .msg.user { background: #eff6ff; border-left: 3px solid #3b82f6; }
    .msg.agent { background: #f8fafc; border-left: 3px solid #94a3b8; }
    .msg-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem; }
    .msg.user .msg-label { color: #3b82f6; }
    .msg.agent .msg-label { color: #64748b; }
    .msg-text { white-space: pre-wrap; word-break: break-word; }
    .msg-text strong { font-weight: 700; }
    .msg-text code { background: #f1f5f9; padding: 0.1em 0.3em; border-radius: 3px; font-size: 0.85em; }
    .msg img { max-width: 100%; border-radius: 6px; margin-top: 0.5rem; }
    .footer { text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.75rem; color: #94a3b8; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>FIUBA Agent — ${chat.title || 'Conversación'}</h1>
    <p>${modeLabels[chat.mode] || chat.mode} · ${chat.messages.length} mensajes · ${new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>`;

    chat.messages.forEach(msg => {
      const isUser = msg.sender === 'user';
      let text = msg.text || '';
      // Basic markdown to HTML
      text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
      text = text.replace(/`(.+?)`/g, '<code>$1</code>');
      text = text.replace(/\n/g, '<br>');

      html += `
  <div class="msg ${isUser ? 'user' : 'agent'}">
    <div class="msg-label">${isUser ? 'Vos' : 'FIUBA Agent'}</div>
    <div class="msg-text">${text}</div>
  </div>`;
    });

    html += `
  <div class="footer">
    Generado por FIUBA Agent · agente-fiuba.web.app · ${new Date().toLocaleDateString('es-AR')}
  </div>
</body></html>`;

    // Open in new window for print/save as PDF
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    } else {
      // Fallback: download as HTML
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fiuba-agent-${chat.title || 'chat'}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  window.exportChatPDF = exportChatPDF;
})();
