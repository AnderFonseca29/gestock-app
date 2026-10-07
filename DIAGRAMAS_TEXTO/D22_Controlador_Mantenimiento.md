# D22 · CONTROLADOR MANTENIMIENTO (5 rutas)

**Tipo:** Controladores

## Qué es
Administrar los mantenimientos programados de los equipos o instalaciones.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle → datos (200).
- **Crear:** datos del mantenimiento → se guardan → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.

## Errores
- No existe → "El mantenimiento no existe."
- Datos malos → "Los datos enviados no son válidos."

---
*Verificado: pantalla de Programación cargada sin errores en las pruebas de landings.*