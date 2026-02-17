# Salchipapas Frontend (Firebase)

Frontend estático de Salchipapas conectado directamente a Firebase Realtime Database.

## Acceso

El login usa `username` y `password` guardados en Firebase en:

- `family_v9/config/authUsername`
- `family_v9/config/authPassword`

Al iniciar sesión correctamente se guarda una sesión local en `sessionStorage`.

## Datos persistidos

- Calendario: `family_v9/calendar`
- Lista de compra: `family_v9/pantry`

## IA

La generación de recetas por API externa quedó desactivada para eliminar la dependencia de Vercel.

## Estructura

- `js/services/firebase.js`: lectura/escritura de Firebase.
- `js/services/api.js`: capa de acceso usada por la app (login + calendario + compra).
- `js/security/auth.js`: control de pantalla de login y cierre de sesión.
