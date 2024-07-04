# ¿Ya salieron los resultados de las pruebas nacionales?

Pequeño proyecto hecho en Node.js que envia una notificación en el momento en que sea detectado la publicación de los resultados de las pruebas nacionales en la República Dominicana. Esto fue hecho de forma rápida, no temas en abrir una pull request, licenciado bajo AGPLv3.

## Dependencias / Dependecies

- Express
- Ejs
- Web-Push
- node-cron
- dotenv

## Alojar / Setup

- Ejecuta `node generateKeys.js`, para generar tu llave pública y privada.
- Edita las variables de entorno en `.env.example`.
- Renombra el archivo a `.env`.
- Ejecuta `node index.js`

## ¿Qué aprendí? / Procedimiento

- Lo primero fue visitar la página web oficial y analizar cualquier petición http a una API. En el peor de los casos, parsear el HTML era la otra opción.
- Luego de encontrar la API, creé un pequeño servidor en Node.js.
- Al no ser nada complicado, con un motor de plantillas desde el mismo Node.js se renderiza el HTML con el CSS y JavaScript necesario.
- Se crea las rutas necesarias para suscribir al usuario con las API's proporcionadas por el navegador. (Service Worker, Push API)
- Los usuarios registrados por conveniencia se guardan en un archivo JSON.
