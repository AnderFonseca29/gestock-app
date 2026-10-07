# D25 · CONTROLADOR CONFIGURACIÓN (2 rutas)

**Tipo:** Controladores

## Qué es
Ver y guardar los valores de configuración del sistema (clave - valor).

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** el cliente pide la configuración → se devuelve la lista (200).
- **Guardar:** el cliente envía los valores → se guardan (si la clave ya existe, se actualiza) → 200.

## Errores
- Guardar sin enviar nada → "No se enviaron configuraciones para actualizar."
- Sin permiso de edición → "No tienes permisos para realizar esta acción."

---
*Verificado: guardar y leer configuración en las suites E2E.*