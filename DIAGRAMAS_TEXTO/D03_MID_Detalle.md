# D03 · MID DETALLE

**Tipo:** Generales

## Qué es
La capa intermedia (MID): lo que atraviesa cada petición y lo que nunca vuelve a tocar.

## Flujo CLIENTE → MID → CLIENTE
La petición pasa por este orden:
1. Límite de solicitudes (500 cada 15 minutos).
2. Revisión de los datos enviados (Zod).
3. Revisión del código de sesión (JWT).
4. Revisión del permiso del usuario.
5. Controlador → base de datos.
6. Respuesta directa al cliente.

## Errores
- Pasó el límite de solicitudes → "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."
- Cuando la respuesta vuelve, **no pasa de nuevo por el servidor**: va directo al cliente.

---
*Verificado: la cadena de pasos coincide con el código del servidor.*