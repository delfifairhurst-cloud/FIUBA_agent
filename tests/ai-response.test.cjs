const { test } = require('node:test'), assert = require('node:assert/strict');
const result = (parts, finishReason = 'STOP') => ({ data: { candidates: [{ content: { parts }, finishReason }] } });
test('keeps all public text parts, hides thinking, continues a cutoff once', async () => {
  const { completeChat } = await import('../backend/ai-response.js');
  const payload = { contents: [{ role: 'user', parts: [{ text: 'Explicá' }] }] };
  let calls = 0;
  const response = await completeChat('fixture', payload, async (_, sent, options) => {
    calls++;
    if (calls === 1) return result([{ text: 'private', thought: true }, { text: 'Primera ' }, { text: 'parte.' }], 'MAX_TOKENS');
    assert.equal(sent.contents.at(-2).parts[0].text, 'Primera parte.');
    assert.equal(options.maxRetries, 1);
    return result([{ text: '\nSegunda parte.' }, { text: ' Fin.' }]);
  });
  assert.deepEqual(response, { text: 'Primera parte.\nSegunda parte. Fin.', incomplete: false });
  assert.equal(calls, 2); assert.equal(payload.contents.length, 1);
});
test('retains partial answer with explicit flag when continuation fails or is cut off again', async () => {
  const { completeChat } = await import('../backend/ai-response.js');
  for (const fail of [true, false]) {
    let calls = 0;
    const response = await completeChat('fixture', { contents: [] }, async () => {
      calls++; if (calls === 2 && fail) throw { status: 429 };
      return result([{ text: 'Parte' }], 'MAX_TOKENS');
    });
    assert.equal(calls, 2); assert.equal(response.incomplete, true); assert.ok(response.text.startsWith('Parte'));
  }
});
test('never continues a safety block; rejects empty/unfinished structured results', async () => {
  const { completeChat } = await import('../backend/ai-response.js');
  let calls = 0;
  const call = async () => { calls++; return result([{ text: 'Respuesta parcial' }], 'SAFETY'); };
  assert.equal((await completeChat('fixture', { contents: [] }, call)).incomplete, true);
  assert.equal(calls, 1);
  await assert.rejects(completeChat('fixture', { contents: [] }, call, { structured: true }), e => e.code === 'AI_INCOMPLETE');
  await assert.rejects(completeChat('fixture', { contents: [] }, async () => result([])), e => e.code === 'AI_INCOMPLETE');
});
