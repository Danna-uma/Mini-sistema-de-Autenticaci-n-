const API_BASE = "http://localhost:3050";
const TEAMS_JSON_URL =
  "https://raw.githubusercontent.com/rezarahiminia/worldcup2026/refs/heads/main/football.teams.json";

const TOKEN_KEY = "jwt_token";
const USER_KEY = "auth_user";

class NetworkError extends Error {}
class AuthError extends Error {}
class ApiError extends Error {
  constructor(message, body) {
    super(message);
    this.body = body; 
  }
}

async function apiRequest(endpoint, { method = "GET", body = null, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      throw new AuthError("No hay una sesión activa.");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkFailure) {
    throw new NetworkError(
      "No se pudo conectar con el servidor. Revisa tu conexión a internet."
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch (parseFailure) {
    data = null; 
  }

  if (response.status === 401) {
    clearSession();
    const message = extractMessage(data) || "Sesión inválida o expirada. Inicia sesión nuevamente.";
    throw new AuthError(message);
  }

  if (response.status === 400) {
    const message = extractMessage(data) || "Solicitud inválida.";
    throw new ApiError(message, data);
  }

  if (!response.ok) {
    const message = extractMessage(data) || `Error del servidor (${response.status}).`;
    throw new ApiError(message, data);
  }

  return data;
}

function extractMessage(data) {
  if (!data) return null;
  return data.message || data.error || null;
}

async function fetchTeamsJson() {
  let response;
  try {
    response = await fetch(TEAMS_JSON_URL);
  } catch (networkFailure) {
    throw new NetworkError(
      "No se pudo conectar para obtener los equipos. Revisa tu conexión a internet."
    );
  }

  if (!response.ok) {
    throw new ApiError(`No se pudo obtener el archivo de equipos (status ${response.status}).`);
  }

  let data;
  try {
    data = await response.json();
  } catch (parseFailure) {
    throw new ApiError("El archivo de equipos no tiene un formato JSON válido.");
  }

  return data;
}

/* SESIÓN (localStorage) */
function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function hasSession() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

/* NAVEGACIÓN ENTRE VISTAS*/
function showView(name) {
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.dataset.view === name);
  });
}

document.querySelectorAll("[data-nav]").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.nav));
});

/* VALIDACIÓN EN TIEMPO REAL */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmailField(inputEl, hintEl) {
  const value = inputEl.value.trim();
  if (value === "") {
    setFieldState(inputEl, hintEl, "neutral", "");
    return false;
  }
  if (!EMAIL_REGEX.test(value)) {
    setFieldState(inputEl, hintEl, "error", "Formato de correo inválido.");
    return false;
  }
  setFieldState(inputEl, hintEl, "success", "Correo válido.");
  return true;
}

function validatePasswordField(inputEl, hintEl, minLength = 6) {
  const value = inputEl.value;
  if (value === "") {
    setFieldState(inputEl, hintEl, "neutral", "");
    return false;
  }
  if (value.length < minLength) {
    setFieldState(inputEl, hintEl, "error", `Mínimo ${minLength} caracteres.`);
    return false;
  }
  setFieldState(inputEl, hintEl, "success", "Contraseña válida.");
  return true;
}

function validateNameField(inputEl, hintEl) {
  const value = inputEl.value.trim();
  if (value === "") {
    setFieldState(inputEl, hintEl, "neutral", "");
    return false;
  }
  if (value.length < 2) {
    setFieldState(inputEl, hintEl, "error", "Ingresa tu nombre completo.");
    return false;
  }
  setFieldState(inputEl, hintEl, "success", "");
  return true;
}

function setFieldState(inputEl, hintEl, state, message) {
  inputEl.classList.remove("valid", "invalid");
  hintEl.classList.remove("error", "success");

  if (state === "error") {
    inputEl.classList.add("invalid");
    hintEl.classList.add("error");
  } else if (state === "success") {
    inputEl.classList.add("valid");
    hintEl.classList.add("success");
  }
  hintEl.textContent = message;
}

/* ---- Bindings de validación en vivo: LOGIN ---- */
const loginEmail = document.getElementById("login-email");
const loginEmailHint = document.getElementById("login-email-hint");
const loginPassword = document.getElementById("login-password");
const loginPasswordHint = document.getElementById("login-password-hint");

loginEmail.addEventListener("input", () => validateEmailField(loginEmail, loginEmailHint));
loginPassword.addEventListener("input", () => validatePasswordField(loginPassword, loginPasswordHint));

/* ---- Bindings de validación en vivo: REGISTER ---- */
const registerName = document.getElementById("register-name");
const registerNameHint = document.getElementById("register-name-hint");
const registerEmail = document.getElementById("register-email");
const registerEmailHint = document.getElementById("register-email-hint");
const registerPassword = document.getElementById("register-password");
const registerPasswordHint = document.getElementById("register-password-hint");

registerName.addEventListener("input", () => validateNameField(registerName, registerNameHint));
registerEmail.addEventListener("input", () => validateEmailField(registerEmail, registerEmailHint));
registerPassword.addEventListener("input", () => validatePasswordField(registerPassword, registerPasswordHint));

/*ESTADOS VISUALES DE BOTÓN (idle / loading) */
function setButtonLoading(buttonEl, isLoading) {
  buttonEl.disabled = isLoading;
  buttonEl.classList.toggle("loading", isLoading);
}

function setFormDisabled(formEl, disabled) {
  formEl.querySelectorAll("input").forEach((input) => {
    input.disabled = disabled;
  });
}

/* ALERTAS EN FORMULARIO*/
function showAlert(alertEl, type, message) {
  alertEl.textContent = message;
  alertEl.classList.remove("hidden", "error", "success");
  alertEl.classList.add(type);
}

function hideAlert(alertEl) {
  alertEl.classList.add("hidden");
  alertEl.textContent = "";
}

/* REGISTRO DE USUARIO*/
const formRegister = document.getElementById("form-register");
const registerAlert = document.getElementById("register-alert");
const registerSubmit = document.getElementById("register-submit");

formRegister.addEventListener("submit", async (event) => {
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
        { keywords: ["already exists", "ya existe"], input: registerEmail, hint: registerEmailHint },
      ],
      fallbackInput: registerEmail,
    });
  } finally {
    setButtonLoading(registerSubmit, false);
    setFormDisabled(formRegister, false);
  }
});

/* LOGIN DE USUARIO*/
const formLogin = document.getElementById("form-login");
const loginAlert = document.getElementById("login-alert");
const loginSubmit = document.getElementById("login-submit");

formLogin.addEventListener("submit", async (event) => {
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
        { keywords: ["user not found", "usuario no encontrado"], input: loginEmail, hint: loginEmailHint },
        { keywords: ["invalid password", "contraseña inválida"], input: loginPassword, hint: loginPasswordHint },
      ],
      fallbackInput: loginEmail,
    });
  } finally {
    setButtonLoading(loginSubmit, false);
    setFormDisabled(formLogin, false);
  }
});

function handleFormError(error, { alertEl, fieldsByKeyword, fallbackInput }) {
  if (error instanceof NetworkError) {
    showAlert(alertEl, "error", "⚠️ " + error.message);
    return;
  }

  if (error instanceof ApiError) {
    const lowerMsg = (error.message || "").toLowerCase();
    const match = fieldsByKeyword.find((f) =>
      f.keywords.some((kw) => lowerMsg.includes(kw))
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

/* VISTA PROTEGIDA — LISTA DE EQUIPOS (Mundial 2026) */
const teamsGrid = document.getElementById("teams-grid");
const teamsStatus = document.getElementById("teams-status");
const protectedAlert = document.getElementById("protected-alert");
const reloadTeamsBtn = document.getElementById("reload-teams-btn");
const userGreeting = document.getElementById("user-greeting");
const logoutBtn = document.getElementById("logout-btn");

function enterProtectedView() {
  const user = getStoredUser();
  userGreeting.textContent = user?.name
    ? `Sesión iniciada como ${user.name} (${user.email || ""})`
    : "Sesión activa.";
  showView("protected");
  loadTeams();
}

function setTeamsStatus(state, message) {
  teamsStatus.className = `status-box ${state}`;
  teamsStatus.textContent = message;
  teamsStatus.classList.toggle("hidden", state === "hidden");
}

async function loadTeams() {
  hideAlert(protectedAlert);
  teamsGrid.innerHTML = "";
  setButtonLoading(reloadTeamsBtn, true);
  setTeamsStatus("loading", "Cargando equipos del Mundial 2026...");

  try {
    const data = await fetchTeamsJson();
    const teams = Array.isArray(data) ? data : data?.teams || data?.data || [];

    if (!teams.length) {
      setTeamsStatus("error", "El archivo de equipos no contiene datos.");
      return;
    }

    renderTeams(teams);
    setTeamsStatus("success", `${teams.length} equipos cargados correctamente.`);
  } catch (error) {
    if (error instanceof NetworkError) {
      setTeamsStatus("error", "⚠️ " + error.message);
    } else {
      setTeamsStatus("error", error.message || "No se pudieron cargar los equipos.");
    }
  } finally {
    setButtonLoading(reloadTeamsBtn, false);
  }
}

function renderTeams(teams) {
  teamsGrid.innerHTML = "";
  const fragment = document.createDocumentFragment();

  teams.forEach((team) => {
    const card = document.createElement("div");
    card.className = "team-card";

    const name = team.name_en || team.name || "Equipo";
    const code = team.fifa_code || team.code || "";
    const group = team.groups || team.group || "";
    const flag = team.flag || team.flag_url || "";

    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "article");
    card.setAttribute("aria-label",`${name}${code ? ", código FIFA " + code : ""}${group ? ", grupo " + group : ""}`);

    card.innerHTML = `${flag ? `<img src="${flag}" alt="Bandera de ${name}" loading="lazy">` : ""}
      <span class="team-name">${name}</span>
      <span class="team-meta">${code}${group ? " · Grupo " + group : ""}</span>`;

    fragment.appendChild(card);});

  teamsGrid.appendChild(fragment);
}

reloadTeamsBtn.addEventListener("click", loadTeams);

logoutBtn.addEventListener("click", () => {
  clearSession();
  formLogin.reset();
  formRegister.reset();
  hideAlert(loginAlert);
  hideAlert(registerAlert);
  showView("login");
});

/* DETECCIÓN DE ESTADO DE RED (modo offline del navegador)*/
const offlineBanner = document.getElementById("offline-banner");

function updateOnlineStatus() {
  offlineBanner.classList.toggle("hidden", navigator.onLine);
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

/* UTILIDADES */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* INICIALIZACIÓN*/
(function init() {
  updateOnlineStatus();

  if (hasSession()) {
    enterProtectedView();
  } else {
    showView("login");
  }
})();