# D04 · AUTENTICACIÓN Y SESIÓN

**Tipo:** Generales

## Qué es
Entrar al sistema, crear el código de seguridad (JWT, dura 8 horas) y controlar las sesiones abiertas.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente envía correo y contraseña.
2. El servidor compara los datos, exige que la cuenta y el rol estén activos, crea el código y abre la sesión.
3. El cliente recibe el código, su usuario y sus permisos.

## Errores
- Datos mal puestos → "Los datos enviados no son válidos."
- Muchos intentos seguidos (máximo 5) → "Has superado el máximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo."
- Correo o contraseña mal → "Las credenciales ingresadas no son válidas."
- Usuario de otra empresa → "El usuario no pertenece a esa empresa."
- Cuenta desactivada → "Tu cuenta está inactiva. Contacta al administrador."
- Rol desactivado → "El rol asignado a tu cuenta está inactivo. Contacta al administrador."
- Código vencido → "Tu sesión ha expirado. Inicia sesión nuevamente."

---
*Verificado: pruebas de entrar/salir correctas en las suites E2E.*