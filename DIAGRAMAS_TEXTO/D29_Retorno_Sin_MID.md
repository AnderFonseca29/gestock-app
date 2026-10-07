# D29 · RETORNO SIN MID / FORMATO DE RESPUESTA

**Tipo:** Ciclo y Respuesta

## Qué es
Cómo responde el servidor siempre, para que el cliente lo entienda igual en todas las pantallas.

## Flujo CLIENTE → MID → CLIENTE
**Éxito:** el servidor responde con `{success: true, message: "...", data: {...}}`.
- La respuesta **no vuelve a pasar por el servidor**; va de una vez al cliente.
- El cliente toma la parte `data` y la muestra.

**Error:** el servidor responde con `{success: false, message: "..."}`.
- Si el error es de sesión (401), el cliente cierra la sesión y va a la pantalla de entrar.
- Cualquier otro error: el cliente muestra el mensaje en pantalla.

## Errores
- Sin sesión → mensajes de 401 y salida a la pantalla de entrar.
- Otros errores → mensajes de 400 a 500 ya definidos.

---
*Verificado: respuestas y toasts correctos en las suites E2E.*