# Mini-sistema de Autenticación JWT - World Cup 2026 API

## Descripción

Mini-sistema de autenticación desarrollado para el curso **ISW-521 – Programación en Ambiente Web I** de la **Universidad Técnica Nacional**.

La aplicación permite registrar usuarios, iniciar sesión y acceder a una vista protegida con información del Mundial 2026 mediante autenticación con **JWT**. Además, implementa validaciones en tiempo real, manejo de errores, accesibilidad y estados visuales utilizando únicamente **HTML, CSS y JavaScript puro**.


> **Nota:** Debido a restricciones de **CORS** en la API pública, el proyecto utiliza el backend oficial del repositorio de GitHub ejecutado localmente para los procesos de autenticación, manteniendo los mismos endpoints y la misma lógica del laboratorio. La información de los equipos se obtiene del archivo JSON público del repositorio oficial.

---

## Tecnologías

- HTML5
- CSS3
- JavaScript (ES6 Modules)
- Fetch API
- Async/Await
- JWT (JSON Web Tokens)
- LocalStorage
- MongoDB Atlas (backend local)
- Node.js (API local)

---

## Funcionalidades

- Registro de usuarios mediante API REST.
- Inicio de sesión con autenticación JWT.
- Almacenamiento seguro del token en LocalStorage.
- Vista protegida accesible únicamente con un JWT válido.
- Carga dinámica de los equipos del Mundial 2026.
- Validación de formularios en tiempo real.
- Estados visuales de carga, éxito y error sin utilizar `alert()`.
- Manejo diferenciado de errores HTTP 400 leyendo el cuerpo de la respuesta.
- Detección de errores HTTP 401 con cierre automático de sesión y redirección al login.
- Conservación de la información escrita por el usuario cuando ocurre un fallo de red.
- Cierre de sesión eliminando la información almacenada.
- Accesibilidad mediante control de foco, navegación con teclado, atributos ARIA y mensajes accesibles.
- Código organizado mediante separación de responsabilidades en archivos CSS y JavaScript.

---

## Estructura del proyecto

```text
MINI-SISTEMA
│
├── css/
│   ├── alerts.css
│   ├── animations.css
│   ├── buttons.css
│   ├── forms.css
│   ├── global.css
│   ├── layout.css
│   ├── media-queries.css
│   ├── reset.css
│   ├── stats.css
│   ├── teams.css
│   └── variables.css
│
├── js/
│   ├── api.js
│   ├── app.js
│   ├── auth.js
│   ├── config.js
│   ├── errors.js
│   ├── storage.js
│   ├── teams.js
│   ├── ui.js
│   └── validation.js
│
├── index.html
├── styles.css
└── README.md
```

---

## Características implementadas

- JavaScript puro (sin frameworks).
- Consumo de API mediante `fetch`.
- Programación asíncrona con `async/await`.
- Manipulación del DOM.
- Validaciones del lado del cliente.
- Manejo de errores y excepciones.
- Accesibilidad web.
- Diseño responsive.
- Separación de responsabilidades.

---

## Autor

**Danna Villegas**