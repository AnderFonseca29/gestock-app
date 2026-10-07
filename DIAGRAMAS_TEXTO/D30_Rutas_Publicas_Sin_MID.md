# D30 · RUTAS PÚBLICAS SIN SESIÓN

**Tipo:** Servidor y Acceso

## Qué es
Las pocas pantallas que no necesitan estar dentro del sistema:
- Entrar: `POST /auth/login`
- Recuperar contraseña: `POST /auth/recuperar`, `POST /auth/recuperar/validar`, `POST /auth/recuperar/restablecer`
- Estado del servidor: `GET /health`

## Flujo CLIENTE → MID → CLIENTE
1. El cliente envía los datos **sin código de seguridad**.
2. El servidor solo revisa los datos y los límites de intentos (no la sesión ni el permiso).
3. Responde con éxito o con el error.

## Errores
- Muchos intentos al entrar → "Has superado el máximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo."
- Muchas solicitudes → "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."
- Código de recuperación mal o vencido → "El código ingresado no es válido o ha expirado."

---
*Verificado: entrada, recuperación por mensaje y salud del servidor funcionando.*