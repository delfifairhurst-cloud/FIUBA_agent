import { createAdmission } from './ai-admission.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { setTimeout as delay } from 'node:timers/promises';

const requests = new AsyncLocalStorage();
const aiPaths = new Set(['/chat', '/admin-qa', '/test-key', '/generate-quiz', '/generate-flashcards']);
const deadlineMs = 90000;

export function installPerformance(app) {
  const admission = createAdmission();
  app.get('/api/request-status/:id', admission.status);
  app.use('/api', (req, res, next) => {
    res.set('X-Nevla-Runtime', 'queued-v3');
    if (req.method !== 'POST' || !aiPaths.has(req.path)) return next();
    admission.middleware(req, res, () => requests.run({ signal: req.nevlaSignal }, next));
  });
  return admission;
}

// One deadline across attempts. Never repeat quota failures or timeouts.
export async function callGeminiWithRetry(apiKey, payload, { maxRetries = 2, endpoint } = {}) {
  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const signal = AbortSignal.any([requests.getStore()?.signal || new AbortController().signal, AbortSignal.timeout(deadlineMs)]);
  const generationConfig = {...payload.generationConfig};
  const requested = generationConfig.maxOutputTokens;
  const outputLimit = endpoint === 'chat' ? 16384 : 8192;
  generationConfig.maxOutputTokens = Number.isInteger(requested) && requested > 0 ? Math.min(requested, outputLimit) : outputLimit;
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
      const details = data.error?.details || [];
      const quotas = details.flatMap(d => d.violations || []).map(v => v.quotaId || '').join(' ');
      const code = details.some(d => d.reason === 'API_KEY_INVALID') ? 'KEY_INVALID' : /perday|permonth|daily|monthly/i.test(quotas) ? 'PROVIDER_QUOTA' : /perminute/i.test(quotas) ? 'PROVIDER_RATE_LIMIT' : undefined;
      throw {status:response.status, code, retryAfter:Number.isFinite(wait)?Math.max(0,wait):0, permanent:!temporary, message:response.status===429?'Provider quota or rate limit':'Provider unavailable'};
    }
    await delay(Math.max(0,wait), undefined, {signal});
  }
  throw {status:503, message:'Provider unavailable'};
}
