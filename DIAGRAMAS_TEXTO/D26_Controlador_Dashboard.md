# D26 · CONTROLADOR DASHBOARD (1 ruta)

**Tipo:** Controladores

## Qué es
El panel de resumen (dashboard) con los números principales del negocio.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente pide el resumen.
2. El servidor revisa el permiso (`dashboard.view`).
3. Calcula: totales de productos, stock bajo, valor del inventario y las gráficas mensuales de entradas y salidas.
4. Devuelve todo (200).

## Errores
- Sin permiso → "No tienes permisos para realizar esta acción."

---
*Verificado: el panel se carga correctamente para cada empresa en las pruebas.*