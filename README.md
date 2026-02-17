# Salchipapas Frontend (Firebase)

Frontend estático de Salchipapas conectado directamente a Firebase Realtime Database.

## Acceso

El login usa `username` y `password` guardados en Firebase en:

- `family_v9/config/authUsername`
- `family_v9/config/authPassword`

Compatibilidad legacy: si todavía usas una clave única antigua, también se acepta `family_v9/config/accessCode` (o `family_v9/config/authAccessCode`) como contraseña.

Al iniciar sesión correctamente se guarda una sesión local en `sessionStorage`.

## Datos persistidos

- Calendario: `family_v9/calendar`
- Lista de compra: `family_v9/pantry`

## IA

La generación de recetas por API externa quedó desactivada para eliminar la dependencia de Vercel.

## Troubleshooting

### `POST https://frangeta.github.io/api/login` devuelve `405`

`GitHub Pages` solo sirve archivos estáticos (HTML/CSS/JS), por lo que no ejecuta endpoints `POST /api/*`.

Si ves ese request, estás cargando una versión anterior del frontend que todavía intentaba autenticar contra una API serverless.

Pasos recomendados:

1. Haz un hard refresh (`Ctrl+F5` o `Cmd+Shift+R`).
2. Borra cache y `sessionStorage` del sitio.
3. Verifica que el login actual use `username` + `password` leídos desde Firebase (sin request a `/api/login`).

## Estructura

- `js/services/firebase.js`: lectura/escritura de Firebase.
- `js/services/api.js`: capa de acceso usada por la app (login + calendario + compra).
- `js/security/auth.js`: control de pantalla de login y cierre de sesión.
