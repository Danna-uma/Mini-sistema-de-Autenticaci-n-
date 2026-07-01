🔐 Mini-sistema de Autenticación JWT - World Cup 2026 API

Descripción:
Mini-sistema de autenticación desarrollado para el curso ISW-521 (Programación en Ambiente Web I) de la Universidad Técnica Nacional. 
Permite registrar usuarios, iniciar sesión y acceder a una vista protegida (lista de equipos) consumiendo la API pública del Mundial 2026, todo mediante peticiones asíncronas con manejo diferenciado de errores.

Tecnologías:

HTML5
CSS
JavaScript (async/await)
Fetch API
JWT (JSON Web Tokens)


Funcionalidades:


-Registro y login de usuarios contra una API REST real
-Vista protegida accesible únicamente con un JWT válido
-Validación de formularios en tiempo real (correo y contraseña)
-Estados visuales de carga, error y éxito sin usar alert()
-Manejo diferenciado de errores 400 según el mensaje real del servidor
-Detección de sesión inválida (401) con limpieza automática y redirección al login
-Preservación de los datos del formulario ante fallos de conexión
-Cierre de sesión con limpieza de token



Autor
Danna Villegas
