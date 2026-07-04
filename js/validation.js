const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function setFieldState(inputEl, hintEl, state, message) {
  inputEl.classList.remove("valid", "invalid");
  hintEl.classList.remove("error", "success");

  if (state === "error") {
    inputEl.classList.add("invalid");
    hintEl.classList.add("error");
  } else if (state === "success") {
    inputEl.classList.add("valid");
    hintEl.classList.add("success");
  }

  hintEl.textContent = message;
}

export function validateEmailField(inputEl, hintEl) {
  const value = inputEl.value.trim();

  if (value === "") {
    setFieldState(inputEl, hintEl, "neutral", "");
    return false;
  }

  if (!EMAIL_REGEX.test(value)) {
    setFieldState(inputEl, hintEl, "error", "Formato de correo inválido.");
    return false;
  }

  setFieldState(inputEl, hintEl, "success", "Correo válido.");
  return true;
}

export function validatePasswordField(inputEl, hintEl, minLength = 6) {
  const value = inputEl.value;

  if (value === "") {
    setFieldState(inputEl, hintEl, "neutral", "");
    return false;
  }

  if (value.length < minLength) {
    setFieldState(inputEl, hintEl, "error", `Mínimo ${minLength} caracteres.`);
    return false;
  }

  setFieldState(inputEl, hintEl, "success", "Contraseña válida.");
  return true;
}

export function validateNameField(inputEl, hintEl) {
  const value = inputEl.value.trim();

  if (value === "") {
    setFieldState(inputEl, hintEl, "neutral", "");
    return false;
  }

  if (value.length < 2) {
    setFieldState(inputEl, hintEl, "error", "Ingresa tu nombre completo.");
    return false;
  }

  setFieldState(inputEl, hintEl, "success", "");
  return true;
}