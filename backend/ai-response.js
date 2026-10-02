// Gemini can return multiple public text parts, plus non-public thinking parts.
export function responseText(data) {
  return (data.candidates?.[0]?.content?.parts || [])
    .filter(part => part.thought !== true && typeof part.text === 'string')
    .map(part => part.text).join('');
}

export async function completeChat(apiKey, payload, call, { structured = false } = {}) {
  const initial = await call(apiKey, payload, { endpoint: 'chat' });
  let text = responseText(initial.data);
  let reason = initial.data.candidates?.[0]?.finishReason;
  let incomplete = reason !== 'STOP';
  // Continue only a known token cutoff, never a safety block or an unknown error.
  // One continuation at most; both calls share the admission deadline.
  if (reason === 'MAX_TOKENS' && text && !structured) {
    const contents = [...payload.contents,
      { role: 'model', parts: [{ text }] },
      { role: 'user', parts: [{ text: 'Tu respuesta anterior se cortó por el límite de longitud. Continuá exactamente desde donde quedó, sin repetir ni resumir lo ya escrito. Terminá la explicación y su conclusión.' }] }];
    try {
      const continuation = await call(apiKey, { ...payload, contents }, { endpoint: 'chat', maxRetries: 1 });
      const tail = responseText(continuation.data);
      if (tail) text += tail;
      reason = continuation.data.candidates?.[0]?.finishReason;
      incomplete = !tail || reason !== 'STOP';
    } catch {
      // Preserve useful partial work and tell the client it still needs completion.
      incomplete = true;
    }
  }
  if (!text || (structured && incomplete)) throw { code: 'AI_INCOMPLETE', status: 502 };
  return { text, incomplete };
}
