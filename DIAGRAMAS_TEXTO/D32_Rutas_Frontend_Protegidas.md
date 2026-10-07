# D32 · RUTAS FRONTEND PROTEGIDAS

**Tipo:** Frontend

## Qué es
Las pantallas de la página que exigen permiso para poder entrar (25 rutas protegidas).

## Flujo CLIENTE → MID → CLIENTE
1. El usuario navega a una pantalla.
2. La página revisa el permiso que el servidor le dio al entrar.
3. Si no lo tiene → lo manda a una pantalla de "sin acceso" o a la pantalla de entrar.
4. Si lo tiene → muestra la pantalla y pide los datos al servidor.

## Ejemplos de pantallas
- Panel (necesita `dashboard.view`)
- Empresas, Configuración
- Gestión / Inventario (productos, bodegas, categorías)
- Recepción, Historial Logístico
- Auditorías, Roles y Usuarios, Reportes
- Programación, Incidencias

## Errores
- Sin permiso → "No tienes permisos para realizar esta acción."
- Sin sesión → va a la pantalla de entrar.

---
*Verificado: cada rol llegó a su pantalla permitida en las pruebas de landings.*