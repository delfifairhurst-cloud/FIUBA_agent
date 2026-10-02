// Admission happens before JSON parsing: queued uploads cannot fill the heap.
// No request text, API key or token is retained in diagnostics.
export function createAdmission({ concurrent = 64, queued = 300, waitMs = 90000,
  workMs = 90000, bodyBudget = 32 * 1024 * 1024, maxBody = 5 * 1024 * 1024 } = {}) {
  const waiting = [], users = new Map(), states = new Map();
  let active = 0, bytes = 0, accepted = 0, rejected = 0;
  function drain() {
    while (waiting.length && active < concurrent && bytes + waiting[0].size <= bodyBudget) {
      waiting.shift().start();
    }
  }
  const snapshot = () => ({ active, waiting: waiting.length, reservedBytes: bytes, accepted, rejected, capacity: concurrent });
  function middleware(req, res, next) {
    const uid = req.nevlaUid;
    if (!uid) return res.status(401).json({ code: 'AUTH_REQUIRED', retryable: false });
    // Chunked/unknown size reserves the full permitted body. The parser still enforces it.
    const declared = Number(req.headers?.['content-length']);
    const size = Number.isSafeInteger(declared) && declared > 0 ? declared : maxBody;
    const fail = (code, status = 503) => { rejected++; return res.set('Retry-After', '5').status(status).json({ code, retryable: true, ok: false }); };
    if (size > maxBody) return res.status(413).json({ code: 'INPUT_LIMIT', retryable: false, ok: false });
    if ((users.get(uid) || 0) >= 2) return fail('USER_BUSY', 429);
    if (waiting.length >= queued) return fail('QUEUE_FULL');
    users.set(uid, (users.get(uid) || 0) + 1);
    accepted++;
    const controller = new AbortController();
    const rawId = req.get?.('X-Nevla-Request-Id') || '';
    const key = /^[a-zA-Z0-9-]{16,80}$/.test(rawId) ? uid + ':' + rawId : null;
    const entry = { size, running: false, done: false, start };
    if (key && !states.has(key)) states.set(key, entry);
    let timer;
    function release() {
      if (entry.done) return;
      entry.done = true;
      clearTimeout(timer);
      controller.abort();
      res.off('close', release); res.off('finish', release);
      if (entry.running) { active--; bytes -= size; }
      else { const index = waiting.indexOf(entry); if (index >= 0) waiting.splice(index, 1); }
      const count = users.get(uid) - 1;
      if (count) users.set(uid, count); else users.delete(uid);
      if (key && states.get(key) === entry) states.delete(key);
      drain();
    }
    function start() {
      if (entry.done) return;
      clearTimeout(timer); entry.running = true; active++; bytes += size;
      timer = setTimeout(() => {
        controller.abort(new DOMException('AI deadline exceeded', 'TimeoutError'));
        // Give the handler a turn to preserve a partial answer or send its timeout.
        timer = setTimeout(() => {
          if (!res.headersSent && !res.destroyed) res.status(504).json({ code: 'AI_TIMEOUT', retryable: true, ok: false });
          release();
        }, 250);
      }, workMs);
      req.nevlaSignal = controller.signal;
      next();
    }
    res.once('close', release); res.once('finish', release);
    if (!waiting.length && active < concurrent && bytes + size <= bodyBudget) start();
    else {
      waiting.push(entry);
      timer = setTimeout(() => { fail('QUEUE_TIMEOUT'); release(); }, waitMs);
    }
  }
  function status(req, res) {
    const entry = states.get(req.nevlaUid + ':' + req.params.id);
    if (!entry) return res.status(404).json({ state: 'unknown' });
    res.set('Cache-Control', 'no-store').json({ state: entry.running ? 'processing' : 'queued',
      ...(entry.running ? {} : { position: waiting.indexOf(entry) + 1 }) });
  }
  return { middleware, snapshot, status };
}
