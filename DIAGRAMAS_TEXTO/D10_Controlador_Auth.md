# D10 · CONTROLADOR AUTH (7 rutas)

**Tipo:** Controladores

## Qué es
Entrar al sistema, ver el perfil, salir, cambiar la contraseña y recuperarla.
Rutas públicas (sin sesión): entrar (`/auth/login`) y recuperar (`/auth/recuperar`, `/auth/recuperar/validar`, `/auth/recuperar/restablecer`).

## Flujo CLIENTE → MID → CLIENTE
- **Entrar:** correo + contraseña → se comparan y se crea el código (8 h) y la sesión → recibe `{token, usuario, permisos}`.
- **Perfil:** envía su código → se revisa que siga sirviendo → recibe sus datos.
- **Salir:** envía su código → el servidor cierra la sesión → éxito.
- **Cambiar clave:** clave actual + nueva → se compara y se reemplaza → éxito.
- **Recuperar:** teléfono → el servidor crea un código de 6 números (15 min) y lo envía por mensaje → se valida el código y se pone la nueva clave → éxito.

## Errores
- Datos malos → "Los datos enviados no son válidos."
- Muchos intentos al entrar → "Has superado el máximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo."
- Correo o clave mal → "Las credenciales ingresadas no son válidas."
- Sin código → "No se proporcionó un token de acceso."
- Código vencido → "Tu sesión ha expirado. Inicia sesión nuevamente."
- Sesión cerrada → "Tu sesión fue cerrada. Inicia sesión nuevamente."
- Usuario borrado → "El usuario ya no existe en el sistema."
- Clave actual mal → "La contraseña actual no es correcta."
- Código de recuperación mal o vencido → "El código ingresado no es válido o ha expirado."
- Muchas solicitudes de recuperación → "Has superado el máximo de solicitudes de recuperación para esta cuenta. Espera 15 minutos."

---
*Verificado: pruebas de contraseñas 22/22, recuperación 6/6 y mensaje SMS de punta a punta.*