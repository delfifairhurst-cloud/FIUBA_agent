// Public, stable errors only: never forward provider bodies or key details.
export function retryAfterMs(value, now = Date.now()) {
  if (!value) return 0;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(value) - now;
  return Number.isFinite(delay) ? Math.max(0, delay) : 0;
}
export function publicAiError(error) {
  const status = error.status;
  let code = 'AI_UNAVAILABLE', http = 503, message = 'El servicio de IA está temporalmente no disponible. Podés seguir usando el resto de Nevla.', retryable = true;
  if (error.name === 'TimeoutError' || error.name === 'AbortError') {
    code = 'AI_TIMEOUT'; http = 504; message = 'La respuesta tardó demasiado. Podés volver a intentarlo.';
  } else if (status === 429) {
    code = 'PROVIDER_LIMIT'; http = 429; retryable = false;
    message = 'Gemini alcanzó un límite de solicitudes, tokens o cuota de tu proyecto. Revisá el límite y su reinicio en Google AI Studio.';
    if (error.code === 'PROVIDER_QUOTA') { code = error.code; message = 'Se agotó la cuota de Gemini de tu proyecto. Revisá cuándo se restablece en Google AI Studio.'; }
    if (error.code === 'PROVIDER_RATE_LIMIT') { code = error.code; message = 'Llegaste al límite de solicitudes o tokens por minuto de Gemini. Esperá antes de volver a intentar.'; }
  } else if (status === 401 || status === 403 || error.code === 'KEY_INVALID') {
    code = 'KEY_INVALID'; http = 400; retryable = false;
    message = 'Gemini rechazó tu clave o sus permisos. Revisá la API key y el proyecto en Google AI Studio.';
  } else if (status === 400) {
    code = 'PROVIDER_INPUT'; http = 400; retryable = false;
    message = 'Gemini no pudo procesar esta entrada. Revisá el material y la configuración de tu clave.';
  } else if (status === 404) {
    code = 'MODEL_UNAVAILABLE'; retryable = false;
    message = 'El modelo configurado no está disponible. Probá más tarde mientras se revisa la configuración.';
  } else if (error.code === 'AI_INCOMPLETE') {
    code = 'AI_INCOMPLETE'; http = 502; retryable = false;
    message = 'La IA no devolvió una respuesta completa. Probá con una tarea más breve.';
  } else if (error instanceof TypeError) {
    code = 'AI_NETWORK'; http = 502; message = 'No se pudo conectar con el proveedor de IA. Intentá de nuevo más tarde.';
  }
  return { status: http, body: { error: message, code, retryable, ok: false }, retryAfter: error.retryAfter };
}
export function sendAiError(res, error) {
  const result = publicAiError(error);
  if (Number.isFinite(result.retryAfter) && result.retryAfter > 0) res.set('Retry-After', String(Math.ceil(result.retryAfter / 1000)));
  return res.status(result.status).json(result.body);
}
