# Salchipapas App

Aplicación web estática para la gestión familiar, con foco en planificación de menús semanales, lista de compras y recetas.

## Características
- Planificación de menú semanal.
- Lista de compras con categorización por sección.
- Base para futuras funcionalidades de IA (menú semanal y recetas).

## Estructura del proyecto
```
.
├── index.html
├── css/
├── js/
└── README.md
```

## Autenticación temporal
- El acceso ya no usa PIN en el frontend.
- El frontend solicita un **token temporal** al endpoint `POST /api/auth`.
- El backend valida una clave de acceso (`AUTH_ACCESS_CODE`) y emite tokens firmados con `AUTH_TOKEN_SECRET` (TTL 15 min).

### Variables de entorno necesarias
- `AUTH_ACCESS_CODE`: clave requerida para solicitar token.
- `AUTH_TOKEN_SECRET`: secreto para firmar y validar tokens.

## Cómo ejecutar
Puedes abrir `index.html` directamente en tu navegador o levantar un servidor estático local:

```bash
python3 -m http.server 8000
```
Luego visita `http://localhost:8000`.

## Roadmap
- **V1.0**
  - Menú semanal.
  - Lista de compras con categorización por sección.
- **V2.0**
  - Menú semanal con IA.
  - Recetas con IA.
  - Libro de recetas.
- **V3.0**
  - Refactor general.

## Contribución
1. Crea una rama.
2. Realiza tus cambios.
3. Abre un PR con una descripción clara.

## Licencia
Pendiente de definir.
