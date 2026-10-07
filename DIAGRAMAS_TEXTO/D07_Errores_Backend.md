# D07 · ERRORES DEL BACKEND

**Tipo:** Generales

## Qué es
Cómo el servidor clasifica todos los errores para dar mensajes claros en español.

## Flujo CLIENTE → MID → CLIENTE
1. Algo falla en cualquier parte.
2. El servidor atrapa el error, le pone un código y un mensaje.
3. El cliente recibe y muestra el mensaje en pantalla.

## Los 7 tipos de error
- **400** datos malos → "Los datos enviados no son válidos."
- **401** sin sesión → "No se proporcionó un token de acceso."
- **403** sin permiso → "No tienes permisos para realizar esta acción."
- **404** no existe → "El ... no existe."
- **409** repetido o en uso → "Ya existe un ..." / "No se puede eliminar porque está en uso."
- **429** demasiadas solicitudes → "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."
- **500** error interno → "Ocurrió un error inesperado en el servidor."

## Errores que vienen de la base de datos
- Campo obligatorio vacío → mensaje de datos no válidos.
- Valor repetido → "Ya existe un registro con esos datos."
- Tipo de dato incorrecto → mensaje de datos no válidos.

---
*Verificado: los 7 tipos de error se probaron en las suites E2E (401, 403, 404, 409 y 429 incluidos).*