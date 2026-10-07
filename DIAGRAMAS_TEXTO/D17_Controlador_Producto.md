# D17 · CONTROLADOR PRODUCTO (7 rutas)

**Tipo:** Controladores

## Qué es
Administrar los productos: ver lista y detalle, ver los de stock bajo, crear, editar, cambiar estado y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista, detalle o stock bajo → datos (200).
- **Crear:** datos del producto → se guardan → 201.
- **Editar / estado:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.

## Errores
- No existe → "El producto no existe."
- Código repetido → "Ya existe un producto con ese código."
- Producto con movimientos o recepciones → "No se puede eliminar porque está siendo utilizado." (409)

## Regla
El stock del producto se ajusta con cada movimiento y **nunca queda negativo**.

---
*Verificado: CRUD de productos y prueba de persistencia (producto creado por API sigue tras reiniciar el servidor).*