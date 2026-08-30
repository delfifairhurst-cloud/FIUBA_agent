// auth-ui.js - conecta el overlay de login con firebase.js
import { loginEmail, registerEmail, logout, resetPassword, loginWithGoogle } from "./firebase.js";

function showError(msg) {
  const el = document.getElementById("auth-error");
  if (el) el.textContent = msg;
}
function showRegError(msg) {
  const el = document.getElementById("reg-error");
  if (el) el.textContent = msg;
}
function clearError() { showError(""); }
function clearRegError() { showRegError(""); }

window.showRegisterPage = () => {
  document.getElementById("login-page").style.display = "none";
  document.getElementById("register-page").style.display = "block";
  clearRegError();
};

window.showLoginPage = () => {
  document.getElementById("register-page").style.display = "none";
  document.getElementById("login-page").style.display = "block";
  clearError();
};

window.handleLogin = async () => {
  const email = document.getElementById("auth-email")?.value.trim();
  const pass = document.getElementById("auth-password")?.value;
  if (!email || !pass) { showError("Completá email y contraseña"); return; }
  clearError();
  try {
    await loginEmail(email, pass);
  } catch (e) {
    console.error(e);
    const code = e.code || "";
    if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) showError("Email o contraseña incorrectos");
    else if (code.includes("invalid-email")) showError("Email inválido");
    else showError(e.message);
  }
};

window.handleRegister = async () => {
  const emailEl = document.getElementById("reg-email") || document.getElementById("auth-email");
  const passEl = document.getElementById("reg-password") || document.getElementById("auth-password");
  const email = emailEl?.value.trim();
  const pass = passEl?.value;
  if (!email || !pass) { showRegError("Completá email y contraseña"); return; }
  if (pass.length < 6) { showRegError("La contraseña debe tener al menos 6 caracteres"); return; }
  clearRegError();
  try {
    await registerEmail(email, pass);
  } catch (e) {
    console.error(e);
    if (e.code?.includes("email-already-in-use")) showRegError("Ese email ya está registrado. Probá ingresar.");
    else if (e.code?.includes("invalid-email")) showRegError("Email inválido");
    else showRegError(e.message);
  }
};

window.handleLogout = async () => {
  try { await logout(); } catch (e) { console.error(e); }
};

window.handleResetPassword = async () => {
  const email = document.getElementById("auth-email")?.value.trim();
  if (!email) { showError("Escribí tu email arriba para enviarte el reset"); return; }
  try {
    await resetPassword(email);
    showError("Te enviamos un mail para restablecer la contraseña ✉️");
  } catch (e) {
    showError(e.message);
  }
};

window.handleGoogleLogin = async () => {
  clearError();
  try {
    await loginWithGoogle();
  } catch (e) {
    console.error(e);
    if (e.code?.includes("popup-closed-by-user")) showError("Cerraste la ventana de Google");
    else if (e.code?.includes("unauthorized-domain")) showError("Dominio no autorizado en Firebase Console");
    else showError(e.message);
  }
};

// Enter para enviar
document.getElementById("auth-password")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") window.handleLogin();
});
