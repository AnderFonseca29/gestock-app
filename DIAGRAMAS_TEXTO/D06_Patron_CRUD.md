# D06 · PATRÓN CRUD

**Tipo:** Generales

## Qué es
La secuencia base de crear, ver, editar y eliminar que usan casi todos los módulos.

## Flujo CLIENTE → MID → CLIENTE
- **Crear (POST):** el cliente envía los datos → el servidor los guarda y registra el cambio → "creado con éxito" (201).
- **Ver (GET):** el cliente pide la lista o un registro → el servidor responde los datos (200).
- **Editar (PUT):** el cliente envía los cambios → el servidor los guarda y registra → éxito (200).
- **Eliminar (DELETE):** el cliente pide borrar → el servidor borra y registra → "borrado" (200).

## Errores generales del patrón
- Datos malos → "Los datos enviados no son válidos." (400)
- Sin sesión → aviso de sesión (401)
- Sin permiso → "No tienes permisos para realizar esta acción." (403)
- No existe → "El ... no existe." (404)
- Repetido → "Ya existe un ..." (409)
- El registro está siendo usado → "No se puede eliminar porque está en uso." (409)

---
*Verificado: CRUD de usuarios, roles, productos, bodegas y categorías probados en las suites E2E.*