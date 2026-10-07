# D14 · CONTROLADOR EMPRESA (6 rutas)

**Tipo:** Controladores

## Qué es
Administrar empresas: ver, cambiar de empresa, crear una empresa con su administrador, editar y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle → datos (200).
- **Cambiar de empresa:** el cliente elige otra empresa y envía correo + contraseña → el servidor valida y mueve la sesión a esa empresa → 200.
- **Crear empresa con su admin:** el cliente envía los datos, el correo y la clave del administrador → el servidor crea empresa, rol y administrador todo junto (transacción) → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.

## Errores
- Sesión no reconocida → "No se pudo identificar la sesión actual."
- No existe → "La empresa no existe."
- Empresa inactiva → "La empresa está inactiva. No puedes seleccionarla."
- NIT repetido → "Ya existe una empresa con ese NIT."
- Sin rol Administrador al crear → "No existe el rol Administrador en el sistema."

## Nota
Al borrar una empresa, sus usuarios y sesiones pueden quedar sin empresa (quedan huérfanos). Se recomendó corregirlo.

---
*Verificado: suite multientidad 41/41 (crear empresa, seleccionar, cambiar de empresa y datos aislados).*