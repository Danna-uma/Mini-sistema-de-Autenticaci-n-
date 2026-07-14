import { TOKEN_KEY, USER_KEY } from "./config.js";


export function saveSession(token, user) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(
    USER_KEY,
    JSON.stringify(user || {})
  );
}


export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  // Elimina posibles datos antiguos guardados antes en localStorage.
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem(USER_KEY) || "null"
    );
  } catch {
    return null;
  }
}

export function hasSession() {
  return Boolean(
    sessionStorage.getItem(TOKEN_KEY)
  );
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}