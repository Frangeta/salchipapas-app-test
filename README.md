# Salchipapas Frontend (GitHub Pages)

Frontend estático de Salchipapas. Esta versión ya no contiene secretos y consume una API externa con JWT.

## Configuración de API

Define la URL del backend antes de cargar `js/main.js`:

```html
<script>
  window.SALCHIPAPAS_API_URL = "https://salchipapas-api.vercel.app";
</script>
```

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

## Cambios clave en frontend

- Eliminada dependencia de API keys en UI de configuración.
- Eliminada validación de PIN/hash en cliente.
- Lógica de IA movida a backend.
- Persistencia de menú y compra a través de API.

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
- `CORS_ORIGIN` (ej. URL GitHub Pages)

### Deploy rápido

1. Crear repo `salchipapas-api` y subir carpeta `salchipapas-api/*`.
2. Importar repo en Vercel.
3. Configurar variables de entorno.
4. Deploy.
5. Copiar URL final y asignarla a `window.SALCHIPAPAS_API_URL` en frontend.

## Checklist post-deploy

- [ ] `POST /api/login` retorna token JWT.
- [ ] `GET /api/calendar` sin token retorna 401.
- [ ] `GET /api/calendar` con token retorna 200.
- [ ] `POST /api/pantry` persiste items.
- [ ] `POST /api/ai-recipes` devuelve 7 comidas y 7 cenas.
- [ ] Frontend carga sin exponer secretos en código.
