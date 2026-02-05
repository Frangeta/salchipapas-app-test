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

## Acceso con clave en Firebase (sin backend extra)
- La app usa una clave de acceso administrada desde Firebase.
- La clave **no se guarda en texto plano**: se transforma a hash SHA-256 antes de guardarse en `family_v9/config/accessCodeHash`.
- El usuario escribe su clave en la pantalla de bloqueo y la app compara hashes para permitir el acceso.

### ¿Cómo crear o cambiar la clave?
1. Entra a la pestaña **Config**.
2. En **Sistema**, escribe una nueva clave en **CLAVE DE ACCESO**.
3. Presiona **Guardar Configuración**.
4. Comparte esa clave con los usuarios.

### ¿Qué se guarda en Firebase?
- `family_v9/config/accessCodeHash`: hash SHA-256 de la clave.
- `family_v9/config/aiApiKey`: API key de IA (si aplica).

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
