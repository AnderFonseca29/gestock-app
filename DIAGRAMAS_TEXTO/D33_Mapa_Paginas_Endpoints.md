# D33 · MAPA PÁGINAS ↔ ENDPOINTS

**Tipo:** Frontend

## Qué es
Qué botón del menú manda a qué ruta del servidor.

## Secciones del menú lateral
- **PANEL:** Panel, Empresas, Configuración.
- **GESTIÓN:** Inventario, Recepción, Historial Logístico, Auditorías, Roles y Usuarios, Reportes.
- **MANTENIMIENTO:** Programación, Incidencias.
- **DOCUMENTACIÓN:** Diagramas.

## Flujo CLIENTE → MID → CLIENTE
1. Al entrar, el servidor le da al cliente la lista de permisos del usuario.
2. El menú solo muestra las opciones permitidas (en cada sección que corresponda).
3. Al hacer clic (por ejemplo "Inventario"), la página pide al servidor los datos de esa opción: `GET /productos`, `GET /bodegas`, `GET /categorias`.
4. El servidor vuelve a verificar el permiso y responde.

## Ejemplos de relación
- Empresas → `GET/POST/PUT/DELETE /empresas`
- Roles y Usuarios → `/roles` y `/usuarios`
- Recepción → `POST/GET /recepciones`
- Reportes → `/reportes/*`
- Incidencias → `/incidencias`
- Diagramas → `/diagramas` (pendiente de decisión sobre su permanencia)

## Errores
- Sin permiso → las opciones no se ven y si se accede por dirección, aparece el 403.

---
*Verificado: el menú cambió según el rol en los 5 usuarios de prueba.*