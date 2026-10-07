# D20 · CONTROLADOR AUDITORÍA (2 rutas)

**Tipo:** Controladores

## Qué es
Ver el historial de auditoría: quién hizo qué y cuándo. Es de solo lectura.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente pide la lista o un registro del historial.
2. El servidor revisa el permiso (`auditoria.view`).
3. Devuelve los registros (200).

## Errores
- No existe → "El registro de auditoría no existe."
- Sin permiso → "No tienes permisos para realizar esta acción."

---
*Verificado: lectura del historial con el rol correcto en las suites E2E.*