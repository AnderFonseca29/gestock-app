# D15 · CONTROLADOR CATEGORÍA (5 rutas)

**Tipo:** Controladores

## Qué es
Administrar las categorías de productos: ver, crear, editar y borrar.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle → datos (200).
- **Crear:** el cliente envía el nombre → se guarda y se registra el cambio → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra y se registra → 200.

## Errores
- No existe → "La categoría no existe."
- Nombre repetido → "Ya existe una categoría con ese nombre."
- Categoría que tiene productos → "No se puede eliminar porque está siendo utilizada." (409)

---
*Verificado: creación de categoría por pantalla y por API, con persistencia.*