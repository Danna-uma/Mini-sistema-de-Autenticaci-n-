const http = require("node:http");

const HOST = "localhost";
const PORT = 3050;
const PUBLIC_API_BASE = "https://worldcup26.ir";


const ALLOWED_ROUTES = new Set([
  "POST /auth/register",
  "POST /auth/authenticate",
  "GET /get/teams",
]);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

/**
 * Agrega los encabezados CORS a una respuesta.
 *
 * @param {http.ServerResponse} response
 */
function addCorsHeaders(response) {
  for (const [header, value] of Object.entries(CORS_HEADERS)) {
    response.setHeader(header, value);
  }
}

/**
 * @param {http.ServerResponse} response
 * @param {number} statusCode
 * @param {object} data
 */
function sendJson(response, statusCode, data) {
  addCorsHeaders(response);

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });

  response.end(JSON.stringify(data));
}

/**
 * Lee el cuerpo completo de una petición POST.
 *
 * @param {http.IncomingMessage} request
 * @returns {Promise<Buffer>}
 */
function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;

    const MAX_BODY_SIZE = 1_000_000;

    request.on("data", (chunk) => {
      totalSize += chunk.length;

      if (totalSize > MAX_BODY_SIZE) {
        const error = new Error(
          "El cuerpo de la petición es demasiado grande.",
        );

        error.code = "BODY_TOO_LARGE";
        reject(error);
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });

    request.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    request.on("error", reject);
  });
}

/**
 * @param {http.IncomingMessage} request
 * @returns {boolean}
 */
function hasValidJwtFormat(request) {
  const authorization =
    request.headers.authorization;

  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return false;
  }

  const token = authorization
    .slice(7)
    .trim();

  const tokenParts = token.split(".");

  return (
    tokenParts.length === 3 &&
    tokenParts.every(
      (part) => part.length > 0,
    )
  );
}

/**
 * @param {http.IncomingMessage} request
 * @returns {Headers}
 */
function createForwardHeaders(request) {
  const headers = new Headers();

  const contentType =
    request.headers["content-type"];

  const authorization =
    request.headers.authorization;

  const accept =
    request.headers.accept;

  if (contentType) {
    headers.set(
      "Content-Type",
      contentType,
    );
  }

  if (authorization) {
    headers.set(
      "Authorization",
      authorization,
    );
  }

  headers.set(
    "Accept",
    accept || "application/json",
  );

  return headers;
}

/**
 * Reenvía una petición hacia la API pública.
 *
 * @param {http.IncomingMessage} request
 * @param {http.ServerResponse} response
 * @param {URL} localUrl
 */
async function forwardRequest(
  request,
  response,
  localUrl,
) {
  const method =
    request.method || "GET";

  const route =
    `${method} ${localUrl.pathname}`;

  if (!ALLOWED_ROUTES.has(route)) {
    sendJson(response, 404, {
      message:
        "Ruta no encontrada en el proxy.",
    });

    return;
  }

  if (
    method === "GET" &&
    localUrl.pathname === "/get/teams" &&
    !hasValidJwtFormat(request)
  ) {
    sendJson(response, 401, {
      message:
        "Sesión inválida o expirada.",
    });

    return;
  }

  const publicUrl =
    `${PUBLIC_API_BASE}${localUrl.pathname}${localUrl.search}`;

  const fetchOptions = {
    method,
    headers: createForwardHeaders(request),
    redirect: "manual",
  };

  if (method === "POST") {
    fetchOptions.body =
      await readRequestBody(request);
  }

  console.log(
    `${method} ${localUrl.pathname}`,
  );

  console.log(
    `Reenviando a: ${publicUrl}`,
  );

  const publicResponse =
    await fetch(
      publicUrl,
      fetchOptions,
    );

  const responseBody = Buffer.from(
    await publicResponse.arrayBuffer(),
  );

  addCorsHeaders(response);

  const responseContentType =
    publicResponse.headers.get(
      "content-type",
    );

  if (responseContentType) {
    response.setHeader(
      "Content-Type",
      responseContentType,
    );
  } else {
    response.setHeader(
      "Content-Type",
      "application/json; charset=utf-8",
    );
  }

  response.statusCode =
    publicResponse.status;

  response.end(responseBody);

  console.log(
    `Respuesta recibida: ${publicResponse.status}`,
  );
}

const server = http.createServer(
  async (request, response) => {
    addCorsHeaders(response);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    try {
      const localUrl = new URL(
        request.url || "/",
        `http://${request.headers.host || `${HOST}:${PORT}`}`,
      );

      await forwardRequest(
        request,
        response,
        localUrl,
      );
    } catch (error) {
      console.error(
        "Error en el proxy:",
        error,
      );

      if (
        error.code === "BODY_TOO_LARGE"
      ) {
        if (!response.headersSent) {
          sendJson(response, 400, {
            message:
              error.message,
          });
        }

        return;
      }

      if (!response.headersSent) {
        sendJson(response, 500, {
          message:
            "No se pudo conectar con la API pública del Mundial 2026.",
        });

        return;
      }

      response.end();
    }
  },
);

/*Maneja errores HTTP enviados por el cliente.*/
server.on(
  "clientError",
  (error, socket) => {
    console.error(
      "Petición HTTP inválida:",
      error.message,
    );

    if (socket.writable) {
      socket.end(
        "HTTP/1.1 400 Bad Request\r\n" +
          "Content-Type: application/json\r\n" +
          "Connection: close\r\n" +
          "\r\n" +
          JSON.stringify({
            message:
              "Petición HTTP inválida.",
          }),
      );
    }
  },
);


server.listen(
  PORT,
  HOST,
  () => {
    console.log("");
    console.log(
      "====================================",
    );
    console.log(
      "PROXY LOCAL INICIADO",
    );
    console.log(
      `Dirección: http://${HOST}:${PORT}`,
    );
    console.log(
      `API pública: ${PUBLIC_API_BASE}`,
    );
    console.log(
      "====================================",
    );
    console.log("");
  },
);