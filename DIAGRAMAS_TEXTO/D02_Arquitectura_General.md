# D02 · ARQUITECTURA GENERAL

**Tipo:** Generales

## Qué es
La vista de las 3 capas del sistema: página web (Angular), servidor (Node/Express) y base de datos (PostgreSQL).

## Flujo CLIENTE → MID → CLIENTE
1. El cliente (la página Angular) pide datos con su código de seguridad.
2. El MID (servidor Express) atiende la petición y consulta la base de datos.
3. El cliente recibe los datos en formato JSON y los muestra.

## Errores
- Si el servidor está apagado → "No se pudo completar la solicitud."
- Errores generales: datos malos, sin sesión, sin permiso, o error interno del servidor.

---
*Verificado: salud del servidor OK y pruebas de pantalla completas.*