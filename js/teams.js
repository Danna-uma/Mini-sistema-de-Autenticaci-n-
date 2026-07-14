import { apiRequest } from "./api.js";
import {NetworkError,AuthError,ApiError,} from "./errors.js";
import {setButtonLoading,hideAlert,showView,showAlert,} from "./ui.js";
import { clearSession } from "./storage.js";

const teamsGrid =
  document.getElementById("teams-grid");

const teamsStatus =
  document.getElementById("teams-status");

const reloadTeamsBtn =
  document.getElementById("reload-teams-btn");

const protectedAlert =
  document.getElementById("protected-alert");

const loginAlert =
  document.getElementById("login-alert");

const loginEmail =
  document.getElementById("login-email");

const userGreeting =
  document.getElementById("user-greeting");

/*Configura el evento para actualizar los equipos.*/
export function setupTeams() {
  if (!reloadTeamsBtn) {
    return;
  }

  reloadTeamsBtn.addEventListener(
    "click",
    loadTeams
  );
}

/**
 * Modifica el mensaje y el estado visual
 * de la sección de equipos.
 *
 * @param {"idle" | "loading" | "success" | "error"} state
 * @param {string} message
 */
function setTeamsStatus(state, message) {
  if (!teamsStatus) {
    return;
  }

  teamsStatus.dataset.state = state;
  teamsStatus.textContent = message;

  teamsStatus.classList.remove(
    "idle",
    "loading",
    "success",
    "error"
  );

  teamsStatus.classList.add(state);
}

export function clearTeamsView() {
  if (teamsGrid) {
    teamsGrid.replaceChildren();
  }

  if (userGreeting) {
    userGreeting.textContent = "";
  }

  setTeamsStatus(
    "idle",
    "Debes iniciar sesión para consultar los equipos."
  );
}

/**
 * Controla una sesión inválida o expirada.
 *
 * @param {string} message
 */
function handleInvalidSession(message) {
  clearSession();
  clearTeamsView();

  if (protectedAlert) {
    hideAlert(protectedAlert);
  }

  showView("login");

  if (loginAlert) {
    showAlert(
      loginAlert,
      "error",
      message
    );
  }

  if (loginEmail) {
    loginEmail.focus();
  }
}


export async function loadTeams() {
  if (protectedAlert) {
    hideAlert(protectedAlert);
  }

  if (teamsGrid) {
    teamsGrid.replaceChildren();
  }

  if (reloadTeamsBtn) {
    setButtonLoading(
      reloadTeamsBtn,
      true
    );
  }

  setTeamsStatus(
    "loading",
    "Cargando equipos del Mundial 2026..."
  );

  try {
    const data = await apiRequest(
      "/get/teams",
      {
        method: "GET",
        auth: true,
      }
    );

    const teams = Array.isArray(data)
      ? data
      : data?.teams ||
        data?.data ||
        data?.results ||
        [];

    if (
      !Array.isArray(teams) ||
      teams.length === 0
    ) {
      setTeamsStatus(
        "error",
        "La API no devolvió equipos."
      );

      return;
    }

    renderTeams(teams);

    setTeamsStatus(
      "success",
      `${teams.length} equipos cargados correctamente.`
    );
  } catch (error) {
    console.error(
      "Error al cargar los equipos:",
      error
    );

    if (error instanceof AuthError) {
      handleInvalidSession(
        error.message ||
          "Sesión inválida o expirada. Inicia sesión nuevamente."
      );

      return;
    }

    if (error instanceof NetworkError) {
      setTeamsStatus(
        "error",
        `⚠️ ${error.message}`
      );

      return;
    }

    if (error instanceof ApiError) {
      setTeamsStatus(
        "error",
        error.message ||
          "La API no pudo devolver los equipos."
      );

      return;
    }

    setTeamsStatus(
      "error",
      error?.message ||
        "No se pudieron cargar los equipos."
    );
  } finally {
    if (reloadTeamsBtn) {
      setButtonLoading(
        reloadTeamsBtn,
        false
      );
    }
  }
}

/**
 * Convierte un valor recibido de la API
 * en texto seguro.
 *
 * @param {unknown} value
 * @param {string} fallback
 * @returns {string}
 */
function getSafeText(value, fallback = "") {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const text = String(value).trim();
    return text || fallback;
  }

  return fallback;
}

/**
 * Obtiene el nombre del grupo.
 *
 * @param {unknown} groupValue
 * @returns {string}
 */
function getGroupName(groupValue) {
  if (
    groupValue &&
    typeof groupValue === "object"
  ) {
    return getSafeText(
      groupValue.name ||
        groupValue.title ||
        groupValue.group,
      "Sin asignar"
    );
  }

  return getSafeText(
    groupValue,
    "Sin asignar"
  );
}

/**
 * @param {Array<object>} teams
 */
export function renderTeams(teams) {
  if (
    !teamsGrid ||
    !Array.isArray(teams)
  ) {
    return;
  }

  teamsGrid.replaceChildren();

  const fragment =
    document.createDocumentFragment();

  teams.forEach((team) => {
    if (
      !team ||
      typeof team !== "object"
    ) {
      return;
    }

    const name = getSafeText(
      team.name_en ||
        team.name_es ||
        team.name ||
        team.country ||
        team.team_name,
      "Equipo sin nombre"
    );

    const code = getSafeText(
      team.fifa_code ||
        team.code ||
        team.short_code ||
        team.iso2 ||
        team.iso3,
      "---"
    );

    const group = getGroupName(
      team.group ||
        team.groups ||
        team.group_name
    );

    const flag = getSafeText(
      team.flag ||
        team.flag_url ||
        team.logo ||
        team.image ||
        team.image_url
    );

    const card =
      document.createElement("article");

    card.className = "team-card";
    card.tabIndex = 0;

    card.setAttribute(
      "aria-label",
      `${name}, código FIFA ${code}, grupo ${group}`
    );

    const flagContainer =
      document.createElement("div");

    flagContainer.className =
      "team-flag-container";

    if (flag) {
      const flagImage =
        document.createElement("img");

      flagImage.className = "team-flag";
      flagImage.src = flag;
      flagImage.alt = `Bandera de ${name}`;
      flagImage.loading = "lazy";
      flagImage.referrerPolicy =
        "no-referrer";

      flagImage.addEventListener(
        "error",
        () => {
          flagImage.remove();
          flagContainer.textContent = "🏳️";
          flagContainer.setAttribute(
            "aria-label",
            `Bandera no disponible para ${name}`
          );
        },
        {
          once: true,
        }
      );

      flagContainer.appendChild(
        flagImage
      );
    } else {
      flagContainer.textContent = "🏳️";

      flagContainer.setAttribute(
        "aria-label",
        `Bandera no disponible para ${name}`
      );
    }

    const information =
      document.createElement("div");

    information.className = "team-info";

    const title =
      document.createElement("h3");

    title.className = "team-name";
    title.textContent = name;

    const codeElement =
      document.createElement("p");

    codeElement.className = "team-code";
    codeElement.textContent =
      `Código FIFA: ${code}`;

    const groupElement =
      document.createElement("p");

    groupElement.className =
      "team-group";

    groupElement.textContent =
      `Grupo: ${group}`;

    information.append(
      title,
      codeElement,
      groupElement
    );

    card.append(
      flagContainer,
      information
    );

    fragment.appendChild(card);
  });

  teamsGrid.appendChild(fragment);
}