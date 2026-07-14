import { API_BASE } from "./config.js";
import {NetworkError, AuthError, ApiError,} from "./errors.js";
import { getToken } from "./storage.js";

/**
 * Convierte la respuesta HTTP en JSON o texto.
 
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function parseResponse(response) {

  if (response.status === 204) {
    return null;
  }

  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();

    return text || null;
  } catch {
    return null;
  }
}

/**
 * Extrae un mensaje de error desde la respuesta.
 *
 * @param {any} data
 * @param {string} defaultMessage
 * @returns {string}
 */
function getErrorMessage(data, defaultMessage) {
  if (
    typeof data === "string" &&
    data.trim() !== ""
  ) {
    return data;
  }

  if (data && typeof data === "object") {
    return (data.message ||data.error ||data.msg ||defaultMessage);
  }

  return defaultMessage;
}

/**
 * Realiza una petición HTTP utilizando el proxy local.
 *
 * @param {string} endpoint
 * @param {{
 *   method?: string,
 *   body?: object | null,
 *   auth?: boolean
 * }} options
 *
 * @returns {Promise<any>}
 */
export async function apiRequest(
  endpoint,
  {
    method = "GET",
    body = null,
    auth = false,
  } = {},
) {
  const headers = {
    Accept: "application/json",
  };

  if (body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();

    if (!token) {
      throw new AuthError(
        "No existe una sesión activa. Inicia sesión nuevamente.",
      );
    }

    headers.Authorization = `Bearer ${token}`;
  }

  const requestOptions = {
    method,
    headers,
  };

  if (body !== null) {
    requestOptions.body = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE}${endpoint}`,
      requestOptions,
    );
  } catch (error) {
    console.error(
      "No fue posible realizar la petición:",
      error,
    );

    throw new NetworkError(
      "No se pudo conectar con el proxy local. Verifica que proxy.js esté ejecutándose en http://localhost:3050.",
    );
  }

  const data = await parseResponse(response);

  if (response.status === 401) {
    throw new AuthError(
      data?.message ||
        "Tu sesión ha expirado. Inicia sesión nuevamente."
    );
  }

  if (response.status === 400) {
    throw new ApiError(
      getErrorMessage(
        data,
        "Los datos enviados no son válidos.",
      ),
      response.status,
      data,
    );
  }


  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(
        data,
        `La petición falló con el código ${response.status}.`,
      ),
      response.status,
      data,
    );
  }

  return data;
}