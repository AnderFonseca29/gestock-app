# D13 · CONTROLADOR PERMISO (2 rutas)

**Tipo:** Controladores

## Qué es
Ver el catálogo de permisos para poder asignarlos a los roles.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente pide la lista completa de permisos o la de un módulo.
2. El servidor revisa el permiso de lectura (`permisos.view`).
3. Devuelve el catálogo (200).

## Errores
- Sin sesión → aviso de sesión (401).
- Sin permiso → "No tienes permisos para realizar esta acción."

---
*Verificado: el catálogo se muestra en la pantalla de Roles y Usuarios.*