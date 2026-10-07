# D28 · CICLO COMPLETO IDA Y VUELTA

**Tipo:** Ciclo y Respuesta

## Qué es
El viaje de una petición de principio a fin: la ida por el servidor (MID) y la vuelta directa al cliente.

## Flujo CLIENTE → MID → CLIENTE
**Ida:**
1. El cliente (Angular) pide por su servicio con el código de seguridad (JWT).
2. Pasa por: límite de solicitudes → revisión de datos → sesión → permiso.
3. El controlador procesa con la base de datos.

**Vuelta:**
4. La respuesta va **directa al cliente**: no vuelve a pasar por la revisión del servidor.
5. El cliente muestra los datos o el error.

## Errores
Cualquiera de los códigos del catálogo (400, 401, 403, 404, 409, 429, 500) con su mensaje en español.

---
*Verificado: todo el ciclo ida + vuelta se probó en las suites E2E.*