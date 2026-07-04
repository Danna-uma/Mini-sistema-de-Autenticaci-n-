import { TOKEN_KEY, USER_KEY } from "./config.js";

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function hasSession() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}