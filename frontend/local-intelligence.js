// local-intelligence.js - Resumen local de chats (sin IA, extrae keywords)
function extractKeywords(text, topN = 12) {
  const stopWords = new Set(['el','la','los','las','un','una','uno','de','del','en','con','por','para','que','qué','es','son','ser','estar','hay','no','si','sí','me','te','se','nos','le','lo','al','a','e','o','u','y','pero','mas','más','como','cómo','muy','bien','mal','todo','esta','este','eso','ese','aquí','ahí','allí','donde','cuando','tiene','tiene','puedo','puedes','necesito','quiero','cómo','puedo','hacer','ayuda','help','please','gracias']);
  const words = text.toLowerCase().replace(/[^\wáéíóúñü\s]/g, '').split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, topN).map(([w]) => w);
}

function extractTopics(messages) {
  const topicPatterns = [
    { pattern: /algebr|matrices|determinante|autoval|vector/i, topic: 'Álgebra' },
    { pattern: /análisis|derivad|integral|límite|serie|converg/i, topic: 'Análisis' },
    { pattern: /físic|newton|energía|movim|fuerza|cinemát/i, topic: 'Física' },
    { pattern: /químic|elemento|enlace|reacc|átomo|molecul/i, topic: 'Química' },
    { pattern: /program|código|función|algoritm|variable|loop/i, topic: 'Programación' },
    { pattern: /base de datos|sql|query|tabla|relacion/i, topic: 'Bases de datos' },
    { pattern: /red|tcp|ip|servidor|protocolo|http/i, topic: 'Redes' },
    { pattern: /probabilidad|estadística|varianza|desvío|distrib/i, topic: 'Prob y Estadística' },
  ];

  const fullText = messages.map(m => m.text || '').join(' ');
  const topics = [];
  topicPatterns.forEach(({ pattern, topic }) => {
    if (pattern.test(fullText)) topics.push(topic);
  });
  return topics;
}

function summarizeChatHistory() {
  const container = document.getElementById('local-intel-content');
  if (!container) return;

  let chats = [];
  try { chats = JSON.parse(localStorage.getItem('fiuba_agent_chats') || '[]'); } catch {}

  if (chats.length === 0) {
    container.innerHTML = `
      <div class="intel-empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <p>No hay chats para analizar</p>
      </div>`;
    return;
  }

  let allMessages = [];
  let chatSummaries = [];

  chats.forEach(chat => {
    const msgs = chat.messages || [];
    allMessages = allMessages.concat(msgs);
    const userMsgs = msgs.filter(m => m.role === 'user');
    const keywords = extractKeywords(userMsgs.map(m => m.text || m.content || '').join(' '));
    const topics = extractTopics(userMsgs.map(m => ({ text: m.text || m.content || '' })));
    chatSummaries.push({
      title: chat.title || 'Sin título',
      count: msgs.length,
      keywords,
      topics,
      lastDate: msgs[msgs.length - 1]?.timestamp
    });
  });

  const globalKeywords = extractKeywords(allMessages.filter(m => m.role === 'user').map(m => m.text || m.content || '').join(' '), 20);
  const allTopics = extractTopics(allMessages.filter(m => m.role === 'user').map(m => ({ text: m.text || m.content || '' })));

  let html = `
    <div class="intel-header">
      <h2 class="intel-title">Análisis de tus chats</h2>
      <p class="intel-subtitle">${chats.length} conversaciones · ${allMessages.length} mensajes totales</p>
    </div>

    <div class="intel-section">
      <h4 class="intel-section-title">Temas más frecuentes</h4>
      <div class="intel-topics-grid">
        ${allTopics.length > 0 ? allTopics.map(t => {
          const count = allMessages.filter(m => {
            const text = m.text || m.content || '';
            const tp = topicPatterns.find(p => p.topic === t);
            return tp && tp.pattern.test(text);
          }).length;
          return `<div class="intel-topic-chip">${t} <span class="intel-topic-count">${count}</span></div>`;
        }).join('') : '<span class="intel-empty-text">No se detectaron temas específicos</span>'}
      </div>
    </div>

    <div class="intel-section">
      <h4 class="intel-section-title">Palabras clave frecuentes</h4>
      <div class="intel-keywords-cloud">
        ${globalKeywords.map(k => `<span class="intel-keyword">${k}</span>`).join('')}
      </div>
    </div>

    <div class="intel-section">
      <h4 class="intel-section-title">Resumen por chat</h4>
      <div class="intel-chats-list">`;

  const topicPatterns = [
    { pattern: /algebr|matrices|determinante|autoval|vector/i, topic: 'Álgebra' },
    { pattern: /análisis|derivad|integral|límite|serie|converg/i, topic: 'Análisis' },
    { pattern: /físic|newton|energía|movim|fuerza|cinemát/i, topic: 'Física' },
    { pattern: /químic|elemento|enlace|reacc|átomo|molecul/i, topic: 'Química' },
    { pattern: /program|código|función|algoritm|variable|loop/i, topic: 'Programación' },
    { pattern: /base de datos|sql|query|tabla|relacion/i, topic: 'Bases de datos' },
    { pattern: /red|tcp|ip|servidor|protocolo|http/i, topic: 'Redes' },
    { pattern: /probabilidad|estadística|varianza|desvío|distrib/i, topic: 'Prob y Estadística' },
  ];

  chatSummaries.slice(0, 15).forEach(chat => {
    html += `<div class="intel-chat-item">
      <div class="intel-chat-title">${chat.title}</div>
      <div class="intel-chat-meta">${chat.count} mensajes</div>
      ${chat.topics.length > 0 ? `<div class="intel-chat-topics">${chat.topics.map(t => `<span class="intel-chat-topic">${t}</span>`).join('')}</div>` : ''}
      ${chat.keywords.length > 0 ? `<div class="intel-chat-keywords">${chat.keywords.slice(0, 5).map(k => `<span class="intel-kw-small">${k}</span>`).join('')}</div>` : ''}
    </div>`;
  });

  html += `</div></div>`;
  container.innerHTML = html;
}

window.renderLocalIntelligence = summarizeChatHistory;
