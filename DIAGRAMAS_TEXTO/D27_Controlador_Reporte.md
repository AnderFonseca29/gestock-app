# D27 · CONTROLADOR REPORTE (5 rutas)

**Tipo:** Controladores

## Qué es
Los reportes del sistema: inventario, movimientos, stock, auditorías e incidencias.

## Flujo CLIENTE → MID → CLIENTE
1. El cliente pide uno de los 5 reportes (`/reportes/inventario`, `/movimientos`, `/stock`, `/auditorias`, `/incidencias`).
2. El servidor revisa el permiso (`reportes.view`).
3. Junta y ordena los datos (los agrupa).
4. Devuelve el reporte (200) para verlo o imprimirlo.

## Errores
- Sin permiso → "No tienes permisos para realizar esta acción."

---
*Verificado: pantalla de Reporte y Análisis cargada sin errores en las pruebas.*