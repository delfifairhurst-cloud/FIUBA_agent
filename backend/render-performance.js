import { AsyncLocalStorage } from 'node:async_hooks';
import { setTimeout as delay } from 'node:timers/promises';

const requests = new AsyncLocalStorage();
const aiPaths = new Set(['/chat', '/admin-qa', '/test-key', '/generate-quiz', '/generate-flashcards']);
const deadlineMs = 45000;

export function installPerformance(app) {
  let active = 0;
  app.use('/api', (req, res, next) => {
    res.set('X-Nevla-Runtime', 'bounded-v1');
    if (req.method !== 'POST' || !aiPaths.has(req.path)) return next();
    if (active >= 6) return res.set('Retry-After', '5').status(503).json({error:'El Tutor está ocupado. Reintentá en unos segundos.', code:'BUSY', retryable:true});
    const controller = new AbortController();
    active++;
    const timer = setTimeout(() => controller.abort(), deadlineMs);
    let released = false;
    const release = () => { if (released) return; released = true; active--; clearTimeout(timer); controller.abort(); };
    res.once('close', release);
    res.once('finish', release);
    requests.run({ signal: controller.signal }, next);
  });
}

// One deadline across attempts. Never repeat quota failures or timeouts.
export async function callGeminiWithRetry(apiKey, payload, { maxRetries = 2 } = {}) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const signal = AbortSignal.any([requests.getStore()?.signal || new AbortController().signal, AbortSignal.timeout(deadlineMs)]);
  const generationConfig = {...payload.generationConfig};
  const requested = generationConfig.maxOutputTokens;
  generationConfig.maxOutputTokens = Number.isInteger(requested) && requested > 0 ? Math.min(requested, 8192) : 8192;
  const started = Date.now();
  for (let attempt = 1; attempt <= Math.min(2, maxRetries); attempt++) {
    signal.throwIfAborted();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method:'POST', headers:{'Content-Type':'application/json', 'x-goog-api-key':apiKey},
      body:JSON.stringify({...payload, generationConfig}), signal
    });
    const data = await response.json();
    if (response.ok) return {data, model, attempts:attempt, elapsed:Date.now()-started, fallback:false};
    const temporary = [500,502,503,504].includes(response.status);
    const raw = response.headers.get('Retry-After');
    const wait = raw ? (/^\d+$/.test(raw) ? Number(raw)*1000 : Date.parse(raw)-Date.now()) : 700;
    if (!temporary || attempt >= Math.min(2,maxRetries) || !Number.isFinite(wait) || Date.now()-started+wait >= deadlineMs) {
      throw {status:response.status, permanent:!temporary, message:response.status===429?'Provider quota or rate limit':'Provider unavailable'};
    }
    await delay(Math.max(0,wait), undefined, {signal});
  }
  throw {status:503, message:'Provider unavailable'};
}
