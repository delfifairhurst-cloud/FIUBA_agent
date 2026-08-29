import http.server
import socketserver
import json
import os
import sys
import urllib.request
import urllib.error

# Configurar encoding UTF-8 para la consola en Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass


# Función simple para cargar variables del archivo .env sin dependencias externas
def load_env_file(filepath=".env"):
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip()

# Cargar variables de entorno al iniciar (junto al script, no según el cwd)
load_env_file(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

PORT = int(os.environ.get("PORT", 3000))

# Prompts de sistema según el modo de estudio seleccionado
SYSTEM_PROMPTS = {
    "profesor": "Sos FIUBA Agent en modo PROFESOR. Tu objetivo es explicar conceptos de ingeniería de la UBA/FIUBA (matemática, física, química, programación, etc.) de forma didáctica, clara y rigurosa. Utilizá analogías sencillas, ejemplos prácticos y formato Markdown.",
    "tutor": "Sos FIUBA Agent en modo TUTOR ACADÉMICO. Tu objetivo es guiar al estudiante de ingeniería para que descubra la respuesta por sí mismo. NUNCA des la resolución completa inmediatamente. Hacé preguntas orientadoras, da pistas sutiles y ayuda a estructurar el pensamiento.",
    "examinador": "Sos FIUBA Agent en modo EXAMINADOR. Tu objetivo es evaluar al estudiante como en un parcial o final de FIUBA. Hacé una pregunta técnica sobre el tema que mencione el estudiante, esperá su respuesta, evalúa su precisión conceptual y dale retroalimentación constructiva.",
    "resolucion": "Sos FIUBA Agent en modo RESOLUCIÓN PASO A PASO. Tu objetivo es resolver ejercicios de ingeniería detallando minuciosamente cada paso matemático, principio físico o lógica de código. Explicá el 'por qué' de cada paso."
}

class RequestHandler(http.server.BaseHTTPRequestHandler):

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        # Cabeceras CORS para permitir peticiones desde el frontend web
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        # Manejo de peticiones preflight CORS del navegador
        self._set_headers(200)

    def do_GET(self):
        if self.path == "/api/health":
            self._set_headers(200)
            response = {
                "status": "ok",
                "message": "Servidor FIUBA Agent (Python) corriendo correctamente"
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Ruta no encontrada"}).encode("utf-8"))

    def do_POST(self):
        if self.path == "/api/chat":
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)

            try:
                data = json.loads(post_data.decode("utf-8"))
            except Exception:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Formato JSON inválido"}).encode("utf-8"))
                return

            user_message = data.get("message", "").strip()
            mode = data.get("mode", "profesor")
            context = data.get("context", "").strip()

            if not user_message:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "El mensaje no puede estar vacío"}).encode("utf-8"))
                return

            api_key = os.environ.get("GEMINI_API_KEY", "").strip()

            # Si la API Key aún no fue configurada en .env, devolvemos mensaje informativo amigable
            if not api_key or api_key == "tu_api_key_aqui":
                print("⚠️ Petición recibida pero GEMINI_API_KEY no está configurada.")
                reply = (
                    f"¡Hola! Soy **FIUBA Agent** (modo **{mode.upper()}**).\n\n"
                    f"Veo que tu servidor backend en Python está **100% funcionando**, pero todavía falta configurar tu **GEMINI_API_KEY** en el archivo `.env` del backend.\n\n"
                    f"### 🔑 Pasos para activar respuestas reales de la IA:\n"
                    f"1. Ingresá gratis a [Google AI Studio](https://aistudio.google.com/).\n"
                    f"2. Hacé clic en **Get API key** y copiá tu clave.\n"
                    f"3. Pegala en el archivo `backend/.env` en la línea `GEMINI_API_KEY=tu_clave`.\n"
                    f"4. Reiniciá el servidor.\n\n"
                    f"¡Mientras tanto, tu interfaz web de chat ya está totalmente activa! ¿Sobre qué tema de ingeniería te gustaría consultar hoy?"
                )
                self._set_headers(200)
                self.wfile.write(json.dumps({"reply": reply, "isMock": True}, ensure_ascii=False).encode("utf-8"))
                return

            system_instruction = SYSTEM_PROMPTS.get(mode, SYSTEM_PROMPTS["profesor"])

            # Si hay materiales académicos cargados, los inyectamos en el mensaje de usuario
            full_user_prompt = user_message
            if context:
                full_user_prompt = f"📚 MATERIAL ACADÉMICO ADJUNTO (PDF/Apunte):\n\n{context}\n\n---\n💬 PREGUNTA DEL ALUMNO DE FIUBA:\n{user_message}"

            payload = {
                "system_instruction": {
                    "parts": [{"text": system_instruction}]
                },
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": full_user_prompt}]
                    }
                ]
            }

            models = [
                os.environ.get("GEMINI_MODEL", "").strip(),
                "gemini-3.6-flash",
                "gemini-3.5-flash",
                "gemini-2.5-flash",
            ]
            models = [m for m in models if m]

            last_error = "Error desconocido"
            reply_text = None

            try:
                for model in models:
                    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
                    req = urllib.request.Request(
                        gemini_url,
                        data=json.dumps(payload).encode("utf-8"),
                        headers={"Content-Type": "application/json"},
                        method="POST"
                    )
                    try:
                        with urllib.request.urlopen(req) as resp:
                            resp_body = resp.read().decode("utf-8")
                            result_json = json.loads(resp_body)
                            candidates = result_json.get("candidates", [])
                            if candidates:
                                reply_text = candidates[0]["content"]["parts"][0]["text"]
                            else:
                                reply_text = "No se recibió respuesta legible del modelo."
                            break
                    except urllib.error.HTTPError as e:
                        error_body = e.read().decode("utf-8")
                        last_error = error_body
                        print(f"Error HTTP de Gemini API ({model}, {e.code})")
                        continue

                if reply_text is None:
                    self._set_headers(500)
                    self.wfile.write(json.dumps({
                        "error": "Error de comunicación con Gemini API",
                        "details": last_error
                    }, ensure_ascii=False).encode("utf-8"))
                    return

                self._set_headers(200)
                self.wfile.write(json.dumps({"reply": reply_text, "isMock": False}, ensure_ascii=False).encode("utf-8"))

            except Exception as e:
                import traceback
                print(f"Error general en backend: {e}")
                traceback.print_exc()
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": "Error interno del servidor", "details": str(e)}, ensure_ascii=False).encode("utf-8"))


        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Ruta no encontrada"}).encode("utf-8"))

import sys

# Configurar encoding UTF-8 para la consola en Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    server_address = ("", PORT)
    httpd = socketserver.TCPServer(server_address, RequestHandler)
    print(f"[+] Servidor FIUBA Agent (Python) corriendo en http://localhost:{PORT}")
    print(f"[+] Endpoint de Chat: http://localhost:{PORT}/api/chat")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")

if __name__ == "__main__":
    run_server()

