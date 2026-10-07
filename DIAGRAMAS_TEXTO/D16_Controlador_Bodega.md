# D16 · CONTROLADOR BODEGA (5 rutas)

**Tipo:** Controladores

## Qué es
Administrar las bodegas (lugares donde se guarda el inventario): ver, crear, editar y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle → datos (200).
- **Crear:** datos de la bodega → se guardan → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.
- Al recibir o sacar mercancía, el servidor recalcula el espacio ocupado **sin pasarse de la capacidad** (LEAST de la capacidad, nunca negativo).

## Errores
- No existe → "La bodega no existe."
- Código repetido → "Ya existe una bodega con ese código."

---
*Verificado: creación de bodegas por pantalla y por API, con persistencia.*