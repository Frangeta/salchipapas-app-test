# Salchipapas Frontend (GitHub Pages)

Frontend estático de Salchipapas. Esta versión no contiene secretos y consume una API externa con JWT.

## Configuración de API

Define la URL del backend antes de cargar `js/main.js`:

```html
<script>
  window.SALCHIPAPAS_API_URL = "https://salchipapas-app-test.vercel.app";
</script>
```

> Si no quieres hardcodearlo en el HTML, también puedes definir `window.SALCHIPAPAS_API_URL`
> antes de cargar `js/main.js` desde otra etiqueta `<script>` o desde un archivo de configuración.

Si no se define, el cliente usa `http://localhost:3000`.

## Flujo de autenticación

1. Login en pantalla de bloqueo (`username` + `password`).
2. `POST /api/login`.
3. Guardado del token en `sessionStorage` (no `localStorage`).
4. Todas las llamadas protegidas incluyen `Authorization: Bearer <token>`.

## Endpoints usados por frontend

- `POST /api/login`
- `GET/POST /api/calendar`
- `GET/POST /api/pantry`
- `POST /api/ai-recipes`

## Nuevo backend (repo separado)

Este proyecto incluye una carpeta de referencia `salchipapas-api/` para copiar a un repo dedicado.

### Estructura

```txt
salchipapas-api/
  api/
    login.js
    ai-recipes.js
    calendar.js
    pantry.js
  lib/
    auth.js
    db.js
  package.json
  vercel.json
```

### Variables de entorno en Vercel

- `JWT_SECRET`
- `JWT_EXPIRES_IN` (ej. `2h`)
- `AUTH_USERNAME`
- `AUTH_PASSWORD`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (opcional)
- `CORS_ORIGIN` (opcional, recomendado)


### Login con usuario y contraseña (qué configurar exactamente)

Para que funcione el acceso desde la pantalla de login del frontend, en Vercel necesitas **mínimo** estas variables:

- `AUTH_USERNAME`: usuario válido para iniciar sesión.
- `AUTH_PASSWORD`: contraseña válida para iniciar sesión.
- `JWT_SECRET`: secreto para firmar el token JWT.
- `JWT_EXPIRES_IN` (opcional): duración del token, por ejemplo `2h`.

Si `AUTH_USERNAME` o `AUTH_PASSWORD` faltan, `/api/login` responde `500` con `Credenciales no configuradas`.
Si envías un usuario/clave distintos a los configurados, responde `403` con `Credenciales inválidas`.

#### Paso a paso en Vercel

1. Ve a **Vercel → Project → Settings → Environment Variables**.
2. Crea estas variables para Production (y Preview si lo usas):
   - `AUTH_USERNAME=tu_usuario`
   - `AUTH_PASSWORD=tu_password_seguro`
   - `JWT_SECRET=una_cadena_larga_y_secreta`
   - `JWT_EXPIRES_IN=2h` (opcional)
3. Añade también `CORS_ORIGIN` con tu dominio frontend exacto (GitHub Pages).
4. Guarda y ejecuta **Redeploy**.

#### Verificación rápida del login

```bash
curl -i -X POST 'https://salchipapas-app-test.vercel.app/api/login' \
  -H 'Content-Type: application/json' \
  --data '{"username":"tu_usuario","password":"tu_password_seguro"}'
```

Resultado esperado: `200 OK` y un JSON con `data.token`.

`CORS_ORIGIN` acepta una o varias URLs separadas por coma, por ejemplo:

```txt
https://frangeta.github.io,http://localhost:8000,http://127.0.0.1:8000
```

Si no configuras `CORS_ORIGIN`, la API reflejará el origin solicitante para facilitar desarrollo.

### Configuración sugerida para este proyecto

Con tu backend en Vercel (`https://salchipapas-app-test.vercel.app`):

1. En Vercel → **Project Settings** → **Environment Variables**, configura:
   - `CORS_ORIGIN=https://<tu-usuario>.github.io`
   - si pruebas localmente, añade también: `,http://localhost:8000,http://127.0.0.1:8000`
2. Guarda cambios y ejecuta **Redeploy** para aplicar variables.
3. Comprueba en navegador:
   - `https://salchipapas-app-test.vercel.app/api/login` (debe responder, aunque sea 405 si usas GET)
4. En frontend, usa exactamente esa URL como `window.SALCHIPAPAS_API_URL`.

### Deploy rápido

1. Crear repo `salchipapas-api` y subir carpeta `salchipapas-api/*`.
2. Importar repo en Vercel.
3. Configurar variables de entorno.
4. Deploy.
5. Copiar URL final y asignarla a `window.SALCHIPAPAS_API_URL` en frontend.

## Solución al error CORS (`Solicitud CORS sin éxito`, status null)

1. Verifica que `window.SALCHIPAPAS_API_URL` apunte a una URL válida y desplegada.
2. Revisa en Vercel que la función `/api/login` responda directamente.
3. Configura `CORS_ORIGIN` con tu dominio GitHub Pages exacto.
4. Haz redeploy tras cambiar variables de entorno.

## Checklist post-deploy

- [ ] `POST /api/login` retorna token JWT.
- [ ] `GET /api/calendar` sin token retorna 401.
- [ ] `GET /api/calendar` con token retorna 200.
- [ ] `POST /api/pantry` persiste items.
- [ ] `POST /api/ai-recipes` devuelve 7 comidas y 7 cenas.
- [ ] Frontend carga sin exponer secretos en código.
