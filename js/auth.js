import { apiRequest } from "./api.js";
import { ApiError, AuthError, NetworkError } from "./errors.js";
import { saveSession, clearSession, getStoredUser } from "./storage.js";
import {validateEmailField,validatePasswordField,validateNameField,setFieldState,} from "./validation.js";
import {showView, setButtonLoading,setFormDisabled,showAlert,hideAlert,sleep,} from "./ui.js";
import { loadTeams, clearTeamsView } from "./teams.js";

let loginAttempts = 0;
let loginBlockedUntil = 0;

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_TIME = 60000;

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
    validatePasswordField(
      loginPassword,
      loginPasswordHint,
      {
        minLength: 6,
        requireUppercase: false,
      }
    )
  );

  registerName.addEventListener("input", () =>
    validateNameField(registerName, registerNameHint)
  );

  registerEmail.addEventListener("input", () =>
    validateEmailField(registerEmail, registerEmailHint)
  );

  registerPassword.addEventListener("input", () =>
    validatePasswordField(
      registerPassword,
      registerPasswordHint,
      {
        minLength: 6,
        requireUppercase: true,
      }
    )
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
  const validPassword = validatePasswordField(
    registerPassword,
    registerPasswordHint,
    {
      minLength: 6,
      requireUppercase: true,
    }
  );

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

    showAlert(
      registerAlert,
      "success",
      "Cuenta creada correctamente. Redirigiendo..."
    );

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

  if (Date.now() < loginBlockedUntil) {
    const remainingSeconds = Math.ceil(
      (loginBlockedUntil - Date.now()) / 1000
    );

    showAlert(
      loginAlert,
      "error",
      `Demasiados intentos fallidos. Intenta nuevamente en ${remainingSeconds} segundos.`
    );

    loginEmail.focus();
    return;
  }

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  const validEmail = validateEmailField(loginEmail, loginEmailHint);
  const validPassword = validatePasswordField(
    loginPassword,
    loginPasswordHint,
    {
      minLength: 6,
      requireUppercase: false,
    }
  );

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

    loginAttempts = 0;
    loginBlockedUntil = 0;

    saveSession(data.token, data.user);

    showAlert(
      loginAlert,
      "success",
      "Inicio de sesión exitoso. Redirigiendo..."
    );

    await sleep(400);
    enterProtectedView();
  } catch (error) {
    if (
      error instanceof ApiError ||
      error instanceof AuthError
    ) {
      loginAttempts++;

      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        loginBlockedUntil =
          Date.now() + BLOCK_TIME;

        loginAttempts = 0;

        showAlert(
          loginAlert,
          "error",
          "Demasiados intentos fallidos. El inicio de sesión estará bloqueado durante 60 segundos."
        );

        loginEmail.focus();
        return;
      }
    }

    handleFormError(error, {
      alertEl: loginAlert,
      fieldsByKeyword: [
        {
          keywords: [
            "user not found",
            "usuario no encontrado",
          ],
          input: loginEmail,
          hint: loginEmailHint,
        },
        {
          keywords: [
            "invalid password",
            "contraseña inválida",
          ],
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
      field.keywords.some((keyword) =>
        lowerMsg.includes(keyword)
      )
    );

    showAlert(alertEl, "error", error.message);

    if (match) {
      setFieldState(
        match.input,
        match.hint,
        "error",
        error.message
      );

      match.input.focus();
    } else if (fallbackInput) {
      fallbackInput.focus();
    }

    return;
  }

  if (error instanceof AuthError) {
    clearSession();

    clearTeamsView();

    formLogin.reset();

    showView("login");

    loginEmail.focus();

    showAlert(
      loginAlert,
      "error",
      error.message
    );

    return;
  }

  showAlert(
    alertEl,
    "error",
    "Ocurrió un error inesperado. Intenta de nuevo."
  );

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
  loginAttempts = 0;
  loginBlockedUntil = 0;

  clearSession();

  clearTeamsView();

  formLogin.reset();
  formRegister.reset();

  hideAlert(loginAlert);
  hideAlert(registerAlert);

  setFieldState(
    loginEmail,
    loginEmailHint,
    "neutral",
    ""
  );

  setFieldState(
    loginPassword,
    loginPasswordHint,
    "neutral",
    ""
  );

  setFieldState(
    registerName,
    registerNameHint,
    "neutral",
    ""
  );

  setFieldState(
    registerEmail,
    registerEmailHint,
    "neutral",
    ""
  );

  setFieldState(
    registerPassword,
    registerPasswordHint,
    "neutral",
    ""
  );

  showView("login");

  loginEmail.focus();
}