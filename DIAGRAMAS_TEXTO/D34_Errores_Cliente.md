# D34 · ERRORES DEL CLIENTE

**Tipo:** Frontend

## Qué es
Cómo muestra la página los errores cuando algo falla.

## Flujo CLIENTE → MID → CLIENTE (manejo de errores)
1. La respuesta llega con error.
2. La página decide qué hacer según el tipo:

**Errores de sesión (401):**
- Cierra la sesión y lleva al usuario a la pantalla de entrar.

**Errores de datos, permiso, no-existe, repetido o límites (400, 403, 404, 409, 429):**
- Muestra el mensaje del servidor en pantalla (aviso tipo toast).

**Errores del formulario (antes de enviar):**
- Se marca el campo en rojo con su mensaje, por ejemplo:
  - "Las contraseñas no coinciden."
  - "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo."
  - "El teléfono no es válido."
  - "Este campo es obligatorio."

**Servidor apagado o sin red:**
- "No se pudo completar la solicitud."

## Verificación
En la revisión de las 21 pantallas (computador y celular) **no apareció ningún error de consola**.

---
*Verificado: manejo de 401 en sesiones expiradas y mensajes de validación en las suites E2E.*