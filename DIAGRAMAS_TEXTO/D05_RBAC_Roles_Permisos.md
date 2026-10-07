# D05 · RBAC — ROLES Y PERMISOS

**Tipo:** Generales

## Qué es
El mapa de roles (Administrador, Supervisor, Operario, Técnico, Auditor) y los permisos que protegen cada pantalla.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente entra y el servidor le entrega solo los permisos de su rol.
2. En cada pantalla, el servidor revisa de nuevo "¿este usuario puede entrar aquí?".
3. Si no puede, responde el error.
4. Si puede, devuelve los datos.

## Errores
- Sin permiso → "No tienes permisos para realizar esta acción."
- Además, los botones y páginas sin permiso ni siquiera se muestran.

## Reglas verificadas
- Cada rol tiene al menos un permiso.
- Cada permiso tiene al menos un rol dueño.
- El Administrador recibe todos los permisos.

---
*Verificado: revisión automática de roles y permisos correcta.*