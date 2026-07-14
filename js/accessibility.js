const FONT_SIZE_KEY = "preferred_font_size";

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 22;
const DEFAULT_FONT_SIZE = 16;
const FONT_STEP = 2;

const toggleButton =
  document.getElementById("accessibility-toggle");

const menu =
  document.getElementById("accessibility-menu");

const decreaseButton =
  document.getElementById("font-decrease");

const resetButton =
  document.getElementById("font-reset");

const increaseButton =
  document.getElementById("font-increase");

function applyFontSize(size) {
  const safeSize = Math.min(
    MAX_FONT_SIZE,
    Math.max(MIN_FONT_SIZE, size)
  );

  document.documentElement.style.fontSize =
    `${safeSize}px`;

  localStorage.setItem(
    FONT_SIZE_KEY,
    String(safeSize)
  );

  updateButtonStates(safeSize);
}

function getCurrentFontSize() {
  const storedSize = Number(
    localStorage.getItem(FONT_SIZE_KEY)
  );

  if (
    Number.isFinite(storedSize) &&
    storedSize >= MIN_FONT_SIZE &&
    storedSize <= MAX_FONT_SIZE
  ) {
    return storedSize;
  }

  return DEFAULT_FONT_SIZE;
}

function updateButtonStates(size) {
  decreaseButton.disabled =
    size <= MIN_FONT_SIZE;

  increaseButton.disabled =
    size >= MAX_FONT_SIZE;
}

function toggleAccessibilityMenu() {
  const isHidden =
    menu.classList.toggle("hidden");

  toggleButton.setAttribute(
    "aria-expanded",
    String(!isHidden)
  );

  toggleButton.setAttribute(
    "aria-label",
    isHidden
      ? "Abrir controles de accesibilidad"
      : "Cerrar controles de accesibilidad"
  );

  if (!isHidden) {
    decreaseButton.focus();
  }
}

function closeAccessibilityMenu() {
  menu.classList.add("hidden");

  toggleButton.setAttribute(
    "aria-expanded",
    "false"
  );

  toggleButton.setAttribute(
    "aria-label",
    "Abrir controles de accesibilidad"
  );
}

function increaseFontSize() {
  applyFontSize(
    getCurrentFontSize() + FONT_STEP
  );
}

function decreaseFontSize() {
  applyFontSize(
    getCurrentFontSize() - FONT_STEP
  );
}

function resetFontSize() {
  applyFontSize(DEFAULT_FONT_SIZE);
}

export function setupAccessibility() {
  if (
    !toggleButton ||
    !menu ||
    !decreaseButton ||
    !resetButton ||
    !increaseButton
  ) {
    return;
  }

  toggleButton.addEventListener(
    "click",
    toggleAccessibilityMenu
  );

  decreaseButton.addEventListener(
    "click",
    decreaseFontSize
  );

  resetButton.addEventListener(
    "click",
    resetFontSize
  );

  increaseButton.addEventListener(
    "click",
    increaseFontSize
  );

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      !menu.classList.contains("hidden")
    ) {
      closeAccessibilityMenu();
      toggleButton.focus();
    }
  });

  document.addEventListener("click", (event) => {
    const container =
      document.querySelector(
        ".accessibility-floating"
      );

    if (
      !container.contains(event.target) &&
      !menu.classList.contains("hidden")
    ) {
      closeAccessibilityMenu();
    }
  });

  applyFontSize(getCurrentFontSize());
}