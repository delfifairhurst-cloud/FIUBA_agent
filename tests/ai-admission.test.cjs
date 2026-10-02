const { test } = require('node:test'), assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const wait = ms => new Promise(r => setTimeout(r, ms));
function request(gate, uid, bytes = 100, id = '1234567890123456') {
  const res = new EventEmitter();
  res.set = () => res; res.status = n => { res.code = n; return res; };
  res.json = data => { res.data = data; res.headersSent = true; res.emit('finish'); return res; };
  const req = { nevlaUid: uid, headers: bytes === null ? {} : { 'content-length': String(bytes) }, get: () => id };
  let started = false;
  gate.middleware(req, res, () => { started = true; });
  return { req, res, get started() { return started; }, finish: () => res.emit('finish'), cancel: () => res.emit('close') };
}
test('FIFO queue, private progress, duplicate-account bound, disconnects and slots released exactly once', async () => {
  const { createAdmission } = await import('../backend/ai-admission.js');
  const gate = createAdmission({ concurrent: 1, queued: 3 });
  const a = request(gate, 'alice'), b = request(gate, 'bob'), c = request(gate, 'carol');
  assert.equal(a.started, true); assert.equal(b.started, false);
  const progress = { set() { return this; }, status(n) { this.code = n; return this; }, json(d) { this.data = d; return this; } };
  gate.status({ nevlaUid: 'bob', params: { id: '1234567890123456' } }, progress);
  assert.deepEqual(progress.data, { state: 'queued', position: 1 });
  gate.status({ nevlaUid: 'mallory', params: { id: '1234567890123456' } }, progress);
  assert.equal(progress.code, 404);
  const b2 = request(gate, 'bob'), b3 = request(gate, 'bob');
  assert.equal(b3.res.data.code, 'USER_BUSY');
  b.cancel(); a.finish(); a.cancel();
  assert.equal(c.started, true); assert.equal(b.started, false);
  c.finish(); assert.equal(b2.started, true); b2.cancel();
  assert.equal(gate.snapshot().active, 0); assert.equal(gate.snapshot().waiting, 0);
  assert.equal(a.req.nevlaSignal.aborted, true);
});
test('admission limits queued bodies, expires waiters and rejects oversized requests before parsing', async () => {
  const { createAdmission } = await import('../backend/ai-admission.js');
  const gate = createAdmission({ concurrent: 10, queued: 1, bodyBudget: 100, maxBody: 100, waitMs: 15 });
  const a = request(gate, 'alice', null), b = request(gate, 'bob', 10);
  assert.equal(a.started, true); assert.equal(b.started, false);
  const c = request(gate, 'carol', 10); assert.equal(c.res.data.code, 'QUEUE_FULL');
  const d = request(gate, 'dave', 101); assert.equal(d.res.code, 413);
  assert.equal(gate.snapshot().reservedBytes, 100);
  await wait(30); assert.equal(b.res.data.code, 'QUEUE_TIMEOUT'); a.finish();
  assert.equal(gate.snapshot().reservedBytes, 0); assert.equal(gate.snapshot().waiting, 0);
});
test('work timeout aborts upstream and recovers even if handler never responds', async () => {
  const { createAdmission } = await import('../backend/ai-admission.js');
  const gate = createAdmission({ concurrent: 1, workMs: 10 });
  const a = request(gate, 'alice');
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Deadline did not recover the slot')), 3000);
    a.res.once('finish', () => { clearTimeout(timer); resolve(); });
  });
  assert.equal(a.res.data.code, 'AI_TIMEOUT'); assert.equal(a.req.nevlaSignal.aborted, true);
  assert.equal(gate.snapshot().active, 0);
});
