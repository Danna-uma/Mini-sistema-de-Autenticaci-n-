import { hasSession } from "./storage.js";
import { setupNavigation, showView, updateOnlineStatus } from "./ui.js";
import { setupAuth, enterProtectedView } from "./auth.js";
import { setupTeams } from "./teams.js";
import { setupAccessibility } from "./accessibility.js";

function init() {
  setupNavigation();
  setupAuth();
  setupTeams();
  setupAccessibility();

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);

  updateOnlineStatus();

  if (hasSession()) {
    enterProtectedView();
  } else {
    showView("login");
  }
}

init();