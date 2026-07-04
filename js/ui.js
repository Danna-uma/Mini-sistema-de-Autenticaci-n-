export function showView(name) {
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.dataset.view === name);
  });
}

export function setupNavigation() {
  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => showView(btn.dataset.nav));
  });
}

export function setButtonLoading(buttonEl, isLoading) {
  buttonEl.disabled = isLoading;
  buttonEl.classList.toggle("loading", isLoading);
}

export function setFormDisabled(formEl, disabled) {
  formEl.querySelectorAll("input").forEach((input) => {
    input.disabled = disabled;
  });
}

export function showAlert(alertEl, type, message) {
  alertEl.textContent = message;
  alertEl.classList.remove("hidden", "error", "success");
  alertEl.classList.add(type);
}

export function hideAlert(alertEl) {
  alertEl.classList.add("hidden");
  alertEl.textContent = "";
}

export function updateOnlineStatus() {
  const offlineBanner = document.getElementById("offline-banner");
  offlineBanner.classList.toggle("hidden", navigator.onLine);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}