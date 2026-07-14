const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

const NAME_REGEX =
  /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:[\s'-][A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)+$/;

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

  if (value.includes(" ")) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "El correo no debe contener espacios."
    );
    return false;
  }

  if (!EMAIL_REGEX.test(value)) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "Ingresa un correo válido, por ejemplo: usuario@gmail.com."
    );
    return false;
  }

  const [localPart, domain] = value.split("@");

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..")
  ) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "El correo no puede iniciar, terminar ni contener dos puntos seguidos."
    );
    return false;
  }

  if (localPart.length > 64) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "La parte anterior al @ es demasiado larga."
    );
    return false;
  }

  if (!domain || domain.length > 253) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "El dominio del correo no es válido."
    );
    return false;
  }

  const domainParts = domain.split(".");
  const extension = domainParts.at(-1);

  if (!extension || extension.length < 2) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "El correo debe incluir una extensión válida, como .com, .net, .org o .co.cr."
    );
    return false;
  }

  const invalidDomainPart = domainParts.some(
    (part) =>
      part === "" ||
      part.startsWith("-") ||
      part.endsWith("-")
  );

  if (invalidDomainPart) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "El dominio del correo está escrito incorrectamente."
    );
    return false;
  }

  setFieldState(
    inputEl,
    hintEl,
    "success",
    "Correo válido."
  );

  return true;
}

export function validatePasswordField(
  inputEl,
  hintEl,
  {
    minLength = 6,
    requireUppercase = false,
  } = {}
) {
  const value = inputEl.value;

  if (value === "") {
    setFieldState(
      inputEl,
      hintEl,
      "neutral",
      ""
    );

    return false;
  }

  if (value.length < minLength) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      `La contraseña debe tener mínimo ${minLength} caracteres.`
    );

    return false;
  }

  if (
    requireUppercase &&
    !/[A-Z]/.test(value)
  ) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "La contraseña debe incluir al menos una letra mayúscula."
    );

    return false;
  }

  setFieldState(
    inputEl,
    hintEl,
    "success",
    "Contraseña válida."
  );

  return true;
}

export function validateNameField(inputEl, hintEl) {
  const value = inputEl.value.trim();

  if (value === "") {
    setFieldState(
      inputEl,
      hintEl,
      "neutral",
      ""
    );
    return false;
  }

  if (value.length < 5) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "Ingresa al menos un nombre y un apellido."
    );
    return false;
  }

  if (value.length > 80) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "El nombre no puede superar los 80 caracteres."
    );
    return false;
  }

  if (!NAME_REGEX.test(value)) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "Escribe tu nombre y apellido usando únicamente letras."
    );
    return false;
  }

  const words = value
    .split(/\s+/)
    .filter(Boolean);

  const hasShortWord = words.some((word) => {
    const cleanWord = word.replace(/['-]/g, "");
    return cleanWord.length < 2;
  });

  if (hasShortWord) {
    setFieldState(
      inputEl,
      hintEl,
      "error",
      "Cada nombre o apellido debe tener al menos 2 letras."
    );
    return false;
  }

  setFieldState(
    inputEl,
    hintEl,
    "success",
    "Nombre válido."
  );

  return true;
}