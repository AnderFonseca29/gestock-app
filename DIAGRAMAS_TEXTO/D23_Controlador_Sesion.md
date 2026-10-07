# D23 · CONTROLADOR SESIÓN (3 rutas)

**Tipo:** Controladores

## Qué es
Ver las sesiones abiertas de un usuario (por ejemplo, en varios equipos) y poder cerrarlas.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista de sesiones activas → datos (200).
- **Cerrar otras:** el cliente pide cerrar todas menos la suya → el servidor las cierra → 200.
- **Cerrar una:** el cliente elige una sesión → se cierra → 200.

## Errores
- Su propia sesión no reconocida → "No se pudo identificar la sesión actual."
- Cerrar la sesión en la que está ahora → "No puedes cerrar la sesión actual desde aquí."
- No existe → "La sesión no existe."

---
*Verificado: control de sesiones, cierre de otras y salida en las suites E2E.*