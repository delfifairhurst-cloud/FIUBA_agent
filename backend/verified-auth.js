import { createPublicKey, verify } from 'node:crypto';
const project = process.env.FIREBASE_PROJECT_ID || 'agente-fiuba';
let certificates, expires = 0, loading;
export async function verifyToken(token) {
  if (typeof token !== 'string' || token.length > 8192) throw new Error('auth');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('auth');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url'));
  const claim = JSON.parse(Buffer.from(parts[1], 'base64url'));
  const now = Date.now() / 1000;
  if (header.alg !== 'RS256' || typeof header.kid !== 'string' ||
      claim.aud !== project || claim.iss !== `https://securetoken.google.com/${project}` ||
      typeof claim.sub !== 'string' || !claim.sub || claim.sub.length > 128 ||
      !Number.isFinite(claim.exp) || claim.exp <= now || !Number.isFinite(claim.iat) || claim.iat > now ||
      !Number.isFinite(claim.auth_time) || claim.auth_time > now || claim.firebase?.sign_in_provider === 'anonymous') throw new Error('auth');
  if (!certificates || expires <= Date.now()) {
    if (!loading) loading = (async () => {
      const response = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('auth unavailable');
      certificates = await response.json();
      const age = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1] || 300);
      expires = Date.now() + Math.min(age, 3600) * 1000;
    })().finally(() => { loading = null; });
    await loading;
  }
  if (!Object.hasOwn(certificates, header.kid) || !verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey(certificates[header.kid]), Buffer.from(parts[2], 'base64url'))) throw new Error('auth');
  if (claim.email_verified !== true) throw Object.assign(new Error('verify email'), {code:'EMAIL_UNVERIFIED'});
  return claim.sub;
}


export function installAuthentication(app) {
  app.use('/api', async (req,res,next) => {
    if(req.method === 'GET' && req.path === '/health') return next();
    try {
      const token=(req.get('Authorization')||'').match(/^Bearer (.+)$/)?.[1];
      req.nevlaUid=await verifyToken(token);
      return next();
    } catch(error) {
      if(error.code==='EMAIL_UNVERIFIED') return res.status(403).json({error:'Verificá tu correo antes de usar esta función.',code:'EMAIL_UNVERIFIED',retryable:false});
      return res.status(401).json({error:'Iniciá sesión nuevamente para usar esta función.',code:'AUTH_REQUIRED',retryable:false});
    }
  });
}
