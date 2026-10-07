# D18 · CONTROLADOR MOVIMIENTO (4 rutas)

**Tipo:** Controladores

## Qué es
Registrar las entradas, salidas y transferencias del inventario, y ver el histórico.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista con filtros (búsqueda, tipo, estado, desde, hasta) con límite de 500 → datos con totales (200).
- **Registrar movimiento:** el cliente envía la cantidad y el tipo → el servidor guarda y ajusta el stock del producto y el espacio de la bodega → 201.
- **Borrar:** se borra (no devuelve el stock) → 200.

## Errores
- No existe → "El movimiento no existe."
- Producto inexistente → "El producto seleccionado no existe."
- Bodega inexistente → "La bodega seleccionada no existe."

## Regla clave
El stock **nunca queda negativo** ni la bodega pasa de su capacidad: el sistema lo recorta solo (no es un error).

---
*Verificado: movimiento de entrada por pantalla y persistencia del movimiento 25.*