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
- Lista de compra / despensa: `family_v9/pantry`

## IA (reactivada)

La generación de menú vuelve a estar activa para:

- Menú de **7 días** con **comidas y cenas**.
- Generación usando ingredientes desde:
  - la **Despensa** (lista de compra), o
  - ingredientes manuales escritos en el planner.

El frontend llama a un endpoint externo (`POST /api/ai-recipes`) y espera la forma:

```json
{
  "comidas": [{ "dia": "Lunes", "plato": "..." }],
  "cenas": [{ "dia": "Lunes", "plato": "..." }]
}
```

## ¿Hace falta Vercel?

**Sí, solo para IA** si quieres mantener el frontend estático en GitHub Pages/Firebase Hosting sin exponer la `OPENAI_API_KEY`.

Recomendación:

1. Mantener frontend estático (sin backend propio para auth).
2. Desplegar **solo** la función `api/ai-recipes.js` en Vercel.
3. Sin autenticación para esa ruta (como pediste), pero con:
   - CORS restringido a tu dominio,
   - rate limiting (ideal en Vercel o proxy),
   - validación estricta del payload.

Configurable en frontend con:

```html
<script>
  window.SALCHIPAPAS_AI_API_URL = 'https://TU-PROYECTO.vercel.app/api/ai-recipes';
</script>
```

Si no defines esta variable, usa por defecto:

- `https://salchipapas-ai.vercel.app/api/ai-recipes`

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
- `js/services/api.js`: login Firebase + calendario + compra + IA.
- `js/services/ai.js`: orquestación de prompts de menú y aceptación en calendario.
- `js/security/auth.js`: control de pantalla de login y cierre de sesión.
