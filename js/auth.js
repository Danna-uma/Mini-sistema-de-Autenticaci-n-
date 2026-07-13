import { apiRequest } from "./api.js";
import { ApiError, AuthError, NetworkError } from "./errors.js";
import { saveSession, clearSession, getStoredUser } from "./storage.js";
import {validateEmailField,validatePasswordField,validateNameField,setFieldState,} from "./validation.js";
import {showView, setButtonLoading,setFormDisabled,showAlert,hideAlert,sleep,} from "./ui.js";
import { loadTeams } from "./teams.js";

const loginEmail = document.getElementById("login-email");
const loginEmailHint = document.getElementById("login-email-hint");
const loginPassword = document.getElementById("login-password");
const loginPasswordHint = document.getElementById("login-password-hint");

const registerName = document.getElementById("register-name");
const registerNameHint = document.getElementById("register-name-hint");
const registerEmail = document.getElementById("register-email");
const registerEmailHint = document.getElementById("register-email-hint");
const registerPassword = document.getElementById("register-password");
const registerPasswordHint = document.getElementById("register-password-hint");

const formRegister = document.getElementById("form-register");
const registerAlert = document.getElementById("register-alert");
const registerSubmit = document.getElementById("register-submit");

const formLogin = document.getElementById("form-login");
const loginAlert = document.getElementById("login-alert");
const loginSubmit = document.getElementById("login-submit");

const userGreeting = document.getElementById("user-greeting");
const logoutBtn = document.getElementById("logout-btn");

export function setupAuth() {
  loginEmail.addEventListener("input", () =>
    validateEmailField(loginEmail, loginEmailHint)
  );

  loginPassword.addEventListener("input", () =>
    validatePasswordField(loginPassword, loginPasswordHint)
  );

  registerName.addEventListener("input", () =>
    validateNameField(registerName, registerNameHint)
  );

  registerEmail.addEventListener("input", () =>
    validateEmailField(registerEmail, registerEmailHint)
  );

  registerPassword.addEventListener("input", () =>
    validatePasswordField(registerPassword, registerPasswordHint)
  );

  formRegister.addEventListener("submit", handleRegisterSubmit);
  formLogin.addEventListener("submit", handleLoginSubmit);
  logoutBtn.addEventListener("click", handleLogout);
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  hideAlert(registerAlert);

  const name = registerName.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;

  const validName = validateNameField(registerName, registerNameHint);
  const validEmail = validateEmailField(registerEmail, registerEmailHint);
  const validPassword = validatePasswordField(registerPassword, registerPasswordHint);

  if (!validName) {
    registerName.focus();
    return;
  }

  if (!validEmail) {
    registerEmail.focus();
    return;
  }

  if (!validPassword) {
    registerPassword.focus();
    return;
  }

  setButtonLoading(registerSubmit, true);
  setFormDisabled(formRegister, true);

  try {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });

    saveSession(data.token, data.user);
    showAlert(registerAlert, "success", "Cuenta creada correctamente. Redirigiendo...");

    await sleep(500);
    enterProtectedView();
  } catch (error) {
    handleFormError(error, {
      alertEl: registerAlert,
      fieldsByKeyword: [
        {
          keywords: ["already exists", "ya existe"],
          input: registerEmail,
          hint: registerEmailHint,
        },
      ],
      fallbackInput: registerEmail,
    });
  } finally {
    setButtonLoading(registerSubmit, false);
    setFormDisabled(formRegister, false);
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  hideAlert(loginAlert);

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  const validEmail = validateEmailField(loginEmail, loginEmailHint);
  const validPassword = validatePasswordField(loginPassword, loginPasswordHint);

  if (!validEmail) {
    loginEmail.focus();
    return;
  }

  if (!validPassword) {
    loginPassword.focus();
    return;
  }

  setButtonLoading(loginSubmit, true);
  setFormDisabled(formLogin, true);

  try {
    const data = await apiRequest("/auth/authenticate", {
      method: "POST",
      body: { email, password },
    });

    saveSession(data.token, data.user);
    showAlert(loginAlert, "success", "Inicio de sesión exitoso. Redirigiendo...");

    await sleep(400);
    enterProtectedView();
  } catch (error) {
    handleFormError(error, {
      alertEl: loginAlert,
      fieldsByKeyword: [
        {
          keywords: ["user not found", "usuario no encontrado"],
          input: loginEmail,
          hint: loginEmailHint,
        },
        {
          keywords: ["invalid password", "contraseña inválida"],
          input: loginPassword,
          hint: loginPasswordHint,
        },
      ],
      fallbackInput: loginEmail,
    });
  } finally {
    setButtonLoading(loginSubmit, false);
    setFormDisabled(formLogin, false);
  }
}

function handleFormError(error, { alertEl, fieldsByKeyword, fallbackInput }) {
  if (error instanceof NetworkError) {
    showAlert(alertEl, "error", "⚠️ " + error.message);
    return;
  }

  if (error instanceof ApiError) {
    const lowerMsg = (error.message || "").toLowerCase();
    const match = fieldsByKeyword.find((field) =>
      field.keywords.some((keyword) => lowerMsg.includes(keyword))
    );

    showAlert(alertEl, "error", error.message);

    if (match) {
      setFieldState(match.input, match.hint, "error", error.message);
      match.input.focus();
    } else if (fallbackInput) {
      fallbackInput.focus();
    }

    return;
  }

  if (error instanceof AuthError) {
    showAlert(alertEl, "error", error.message);
    return;
  }

  showAlert(alertEl, "error", "Ocurrió un error inesperado. Intenta de nuevo.");
  console.error(error);
}

export function enterProtectedView() {
  const user = getStoredUser();

  userGreeting.textContent = user?.name
    ? `Sesión iniciada como ${user.name} (${user.email || ""})`
    : "Sesión activa.";

  showView("protected");
  loadTeams();
}

function handleLogout() {
  clearSession();
  formLogin.reset();
  formRegister.reset();
  hideAlert(loginAlert);
  hideAlert(registerAlert);
  showView("login");
}