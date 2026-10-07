# D31 · PIPELINE DEL SERVIDOR (`app.ts`)

**Tipo:** Servidor y Acceso

## Qué es
El orden en que el servidor arranca, prepara todo y atiende cada petición.

## Flujo CLIENTE → MID → CLIENTE
Toda petición entra por este orden:
1. Seguridad de cabeceras (helmet).
2. Permisos de origen (CORS, solo el sitio de la página).
3. Lectura del JSON enviado (máximo 2 MB).
4. Límite global de solicitudes (500 cada 15 minutos).
5. Documentación disponible en `/api/docs`.
6. Montaje de las rutas de `/api`.
7. Error 404 para rutas que no existen.
8. Controlador general de errores (al final).

Cualquier respuesta sale al final, directo al cliente.

## Errores
- Ruta inexistente → 404 con mensaje "Ruta no encontrada."
- Cualquier error atrapado → mensaje según el catálogo (400 a 500).

---
*Verificado: el orden coincide con el código y las peticiones responden conforme.*