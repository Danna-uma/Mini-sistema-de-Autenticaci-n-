import { API_BASE, TEAMS_JSON_URL } from "./config.js";
import { NetworkError, AuthError, ApiError } from "./errors.js";
import { getToken, clearSession } from "./storage.js";

function extractMessage(data) {
  if (!data) return null;
  return data.message || data.error || null;
}

export async function apiRequest(endpoint, { method = "GET", body = null, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();

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
  } catch {
    throw new NetworkError(
      "No se pudo conectar con el servidor. Revisa tu conexión a internet."
    );
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401) {
    clearSession();
    const message =
      extractMessage(data) || "Sesión inválida o expirada. Inicia sesión nuevamente.";
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

export async function fetchTeamsJson() {
  let response;

  try {
    response = await fetch(TEAMS_JSON_URL);
  } catch {
    throw new NetworkError(
      "No se pudo conectar para obtener los equipos. Revisa tu conexión a internet."
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `No se pudo obtener el archivo de equipos (status ${response.status}).`
    );
  }

  try {
    return await response.json();
  } catch {
    throw new ApiError("El archivo de equipos no tiene un formato JSON válido.");
  }
}