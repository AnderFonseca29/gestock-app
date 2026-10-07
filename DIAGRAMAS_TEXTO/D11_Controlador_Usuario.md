# D11 · CONTROLADOR USUARIO (8 rutas)

**Tipo:** Controladores

## Qué es
Administrar usuarios: ver la lista o uno, crear, editar, cambiar estado, cambiar rol, cambiar clave y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista (con filtros) o detalle → datos (200).
- **Crear:** datos del usuario con su clave → la clave se guarda encriptada y se registra el cambio → 201.
- **Editar / estado / rol:** cambios → se guardan → 200.
- **Cambiar clave:** clave nueva → se guarda y **se cierran las sesiones de ese usuario** → 200.
- **Borrar:** se borra y se registra → 200.

## Errores
- No existe → "El usuario no existe."
- Correo repetido → "Ya existe un usuario con ese correo electrónico."
- Rol inexistente → "El rol seleccionado no existe."
- Cambiar su propia clave desde esta pantalla → "Para cambiar tu propia contraseña usa la opción de tu perfil."
- Borrarse a sí mismo → "No puedes eliminar tu propio usuario."

---
*Verificado: CRUD de usuarios y prohibiciones (400 y 403) en las suites E2E.*