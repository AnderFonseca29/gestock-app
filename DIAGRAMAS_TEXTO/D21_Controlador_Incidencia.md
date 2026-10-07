# D21 · CONTROLADOR INCIDENCIA (5 rutas)

**Tipo:** Controladores

## Qué es
Reportar y administrar incidencias (problemas o fallas). La prioridad solo puede ser Baja, Media, Alta o Crítica.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle → datos (200).
- **Crear:** el cliente envía título, descripción y prioridad → se valida la prioridad → se guarda y se registra el cambio → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.

## Errores
- No existe → "La incidencia no existe."
- Prioridad inválida → "Los datos enviados no son válidos."

---
*Verificado: incidencias creadas y listadas en las pruebas; pantalla auditada sin errores.*