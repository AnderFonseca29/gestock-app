# D24 · CONTROLADOR NOTIFICACIÓN (3 rutas)

**Tipo:** Controladores

## Qué es
Ver las notificaciones del usuario (por ejemplo, alertas del sistema) y marcarlas como leídas.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente pide la lista de notificaciones.
2. El servidor revisa la sesión y el permiso.
3. Devuelve la lista (200).
4. El cliente marca una (PATCH) o todas (POST) como leídas → éxito (200).

## Errores
- Sin sesión reconocida → "No autenticado."
- No existe → "La notificación no existe."

---
*Verificado: la campana de notificaciones aparece en las pantallas sin errores de consola.*