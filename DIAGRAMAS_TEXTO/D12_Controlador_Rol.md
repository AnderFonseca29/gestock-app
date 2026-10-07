# D12 · CONTROLADOR ROL (8 rutas)

**Tipo:** Controladores

## Qué es
Administrar los roles del sistema y los permisos de cada uno: ver, crear, editar, cambiar estado, asignar permisos y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista completa o lista básica (o uno por id) → datos (200).
- **Crear:** nombre + permisos → se guarda → 201.
- **Editar / estado / permisos:** cambios → se guardan (los permisos se reemplazan completos) → 200.
- **Borrar:** se borra → 200.

## Errores
- Nombre repetido → "Ya existe un rol con ese nombre."
- No existe → "El rol no existe."
- Rol que tiene usuarios asignados → "No se puede eliminar un rol que tiene usuarios asignados."

---
*Verificado: gestión de roles y asignación de permisos en las suites E2E.*