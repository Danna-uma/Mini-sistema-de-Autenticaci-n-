import { fetchTeamsJson } from "./api.js";
import { NetworkError } from "./errors.js";
import { setButtonLoading, hideAlert } from "./ui.js";

const teamsGrid = document.getElementById("teams-grid");
const teamsStatus = document.getElementById("teams-status");
const protectedAlert = document.getElementById("protected-alert");
const reloadTeamsBtn = document.getElementById("reload-teams-btn");

export function setupTeams() {
  reloadTeamsBtn.addEventListener("click", loadTeams);
}

export function setTeamsStatus(state, message) {
  teamsStatus.className = `status-box ${state}`;
  teamsStatus.textContent = message;
  teamsStatus.classList.toggle("hidden", state === "hidden");
}

export async function loadTeams() {
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

export function renderTeams(teams) {
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
    card.setAttribute(
      "aria-label",
      `${name}${code ? ", código FIFA " + code : ""}${group ? ", grupo " + group : ""}`
    );

    card.innerHTML = `
      ${flag ? `<img src="${flag}" alt="Bandera de ${name}" loading="lazy">` : ""}
      <span class="team-name">${name}</span>
      <span class="team-meta">${code}${group ? " · Grupo " + group : ""}</span>
    `;

    fragment.appendChild(card);
  });

  teamsGrid.appendChild(fragment);
}