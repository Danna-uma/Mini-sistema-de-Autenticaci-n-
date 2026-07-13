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

const viewLogin =
  document.getElementById("view-login");

export function setupTeams() {
  if (!reloadTeamsBtn) {
    return;
  }

  reloadTeamsBtn.addEventListener(
    "click",
    loadTeams,
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
}

/*Carga los equipos utilizando el JWT.*/
export async function loadTeams() {
  if (protectedAlert) {
    hideAlert(protectedAlert);
  }

  if (teamsGrid) {
    teamsGrid.innerHTML = "";
  }

  setButtonLoading(reloadTeamsBtn, true);

  setTeamsStatus(
    "loading",
    "Cargando equipos del Mundial 2026...",
  );

  try {
    const data = await apiRequest("/get/teams", {
      method: "GET",
      auth: true,
    });

    const teams = Array.isArray(data)
      ? data
      : data?.teams ||
        data?.data ||
        data?.results ||
        [];

    if (!Array.isArray(teams) || teams.length === 0) {
      setTeamsStatus(
        "error",
        "La API no devolvió equipos.",
      );

      return;
    }

    renderTeams(teams);

    setTeamsStatus(
      "success",
      `${teams.length} equipos cargados correctamente.`,
    );
    } catch (error) {
    console.error(
      "Error al cargar los equipos:",
      error,
    );

      if (error instanceof AuthError) {
    clearSession();

    if (protectedAlert) {
      showAlert(
        protectedAlert,
        "Sesión inválida o expirada. Inicia sesión nuevamente.",
        "error",
      );
    }

    setTeamsStatus(
      "error",
      "Sesión inválida o expirada.",
    );

    showView("login");

    return;
  }

    if (error instanceof NetworkError) {
      setTeamsStatus(
        "error",
        `⚠️ ${error.message}`,
      );

      return;
    }

    if (error instanceof ApiError) {
      setTeamsStatus(
        "error",
        error.message ||
          "La API no pudo devolver los equipos.",
      );

      return;
    }

    setTeamsStatus(
      "error",
      error.message ||
        "No se pudieron cargar los equipos.",
    );
  } finally {
    setButtonLoading(reloadTeamsBtn, false);
  }

/**
 * Renderiza las tarjetas de los equipos.
 *
 * @param {Array<object>} teams
 */
function renderTeams(teams) {
  if (!teamsGrid) {
    return;
  }

  teamsGrid.innerHTML = "";

  const fragment =
    document.createDocumentFragment();

  teams.forEach((team) => {
    /*
     * Distintos nombres que podría utilizar la API.
     */
    const name =
      team.name_en ||
      team.name_es ||
      team.name ||
      team.country ||
      team.team_name ||
      "Equipo sin nombre";

    const code =
      team.fifa_code ||
      team.code ||
      team.short_code ||
      team.iso2 ||
      team.iso3 ||
      "---";

    const groupValue =
      team.group ||
      team.groups ||
      team.group_name ||
      "Sin asignar";

    const group =
      typeof groupValue === "object"
        ? groupValue?.name ||
          groupValue?.title ||
          "Sin asignar"
        : groupValue;

    const flag =
      team.flag ||
      team.flag_url ||
      team.logo ||
      team.image ||
      team.image_url ||
      "";


    const card =
      document.createElement("article");

    card.className = "team-card";
    card.tabIndex = 0;
    card.setAttribute(
      "aria-label",
      `${name}, código ${code}, grupo ${group}`,
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

      flagImage.addEventListener(
        "error",
        () => {
          flagContainer.innerHTML = "";
          flagContainer.textContent = "🏳️";
        },
        {
          once: true,
        },
      );

      flagContainer.appendChild(flagImage);
    } else {
      flagContainer.textContent = "🏳️";
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

    groupElement.className = "team-group";
    groupElement.textContent =
      `Grupo: ${group}`;

    information.append(
      title,
      codeElement,
      groupElement,
    );

    card.append(
      flagContainer,
      information,
    );

    fragment.appendChild(card);
  });

  teamsGrid.appendChild(fragment);
}}