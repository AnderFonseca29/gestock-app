# D19 · CONTROLADOR RECEPCIÓN (5 rutas)

**Tipo:** Controladores

## Qué es
Registrar la llegada de mercancía (cabecera + detalle de productos) y ver el historial logístico.

## Flujo CLIENTE → MID → CLIENTE
- **Ver:** lista o detalle (con su detalle de productos) → datos (200).
- **Crear:** cabecera + detalle juntos → se guarda todo → 201.
- **Editar:** cambios → se guardan → 200.
- **Borrar:** se borra → 200.

## Errores
- No existe → "La recepción no existe."
- Número de documento repetido → "Ya existe una recepción con ese número de documento."
- Producto del detalle inexistente → "El producto seleccionado no existe."

## Permisos
- Leer: `recepcion.view` o `historial.view`.
- Crear/editar/borrar: `recepcion.create/edit/delete`.

---
*Verificado: recepción 24 con entrada de 13 unidades en las pruebas; historial logístico sin errores.*