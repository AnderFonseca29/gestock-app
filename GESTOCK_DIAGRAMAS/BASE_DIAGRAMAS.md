# GESTOCK · BASE PARA CREAR CADA DIAGRAMA (DETALLADA CON ERRORES REALES)

Cada diagrama NO empieza ni termina igual: depende de la funcionalidad.
Patrón base de inicio (casi todos) y de fin, más las ramas específicas:

INICIO (mayoría): Pagina Angular -> Servicio (api.service.ts) -> Interceptor (Bearer <token>)
                    -> Express app (/api, apiRateLimiter 500) -> Router -> validate -> authenticate -> authorize -> Controller
FIN (mayoría): Controller -> ok() 200 / created() 201 / noContent() 200 -> Interceptor (solo reacciona a errores) -> Componente renderiza
Ramas de error: en cada paso. Códigos posibles del core (errorHandler):
  400 BAD_REQUEST · 400 BAD_JSON · 400 NOT_NULL_VIOLATION(23502) · 400 INVALID_PARAMETER(22P02)
  401 UNAUTHORIZED · 403 FORBIDDEN · 404 NOT_FOUND · 409 CONFLICT · 409 DUPLICATE_KEY(23505)
  409 FOREIGN_KEY_VIOLATION(23503) · 429 RATE_LIMITED · 500 INTERNAL_ERROR

================================================================================
## 1. AUTH (login / perfil / logout / cambiar contraseña / recuperar)
INICIO: Login.ts (formulario) -> auth.ts/service -> Interceptor (SIN token en login)
PASOS: POST /api/auth/login -> validateBody(loginSchema) -> loginEmailLimiter(5 por email)
       -> loginIpLimiter(60 por IP) -> auth.controller.login() -> auth.service (bcrypt.compare)
       -> usuario Activo + rol Activo -> Genera JWT (exp 8h, userId+sesionId) -> inserta sesion Activa (IP+userAgent)
FIN: ok(200) { token, usuario, permisos } -> localStorage gestock_token + gestock_usuario_sesion
ERRORES LOGIN:
   429 RATE_LIMITED - "Has superado el máximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo." (email, 5)
   429 RATE_LIMITED - "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo." (IP, 60)
   400 BAD_REQUEST  - "Los datos enviados no son válidos." (Zod, con details por campo)
   401 UNAUTHORIZED - "Las credenciales ingresadas no son válidas." (usuario no existe o password erroneo)
   401 UNAUTHORIZED - "El usuario no pertenece a esa empresa."
   403 FORBIDDEN    - "Tu cuenta está inactiva. Contacta al administrador."
   403 FORBIDDEN    - "El rol asignado a tu cuenta está inactivo. Contacta al administrador."
   500 INTERNAL_ERROR - "No se pudieron cargar los permisos del usuario."
SUBFLUJO GET /auth/perfil (MID authenticateToken):
   401 - "No se proporcionó un token de acceso." (sin header Bearer)
   401 - "El token de acceso no es válido." (jwt inválido) / "Tu sesión ha expirado..." (TokenExpired)
   401 - "El usuario ya no existe en el sistema." / "Tu sesión fue cerrada. Inicia sesión nuevamente."
   403 - "El usuario está inactivo. Contacta al administrador."
SUBFLUJO POST /auth/logout: authenticateToken -> cierra la sesión actual -> ok(200)
SUBFLUJO PUT /auth/contrasena (con passwordActual + nueva): authenticateToken + validateBody
   401 - "La contraseña actual no es correcta." · 404 - "El usuario no existe."
SUBFLUJO POST /auth/recuperar (telefono): recuperacionLimiter(5 por telefono) -> genera codigo -> email/SMS -> ok(200)
   POST /auth/recuperar/validar: 400 BAD_REQUEST - "El código ingresado no es válido o ha expirado." (3 comprobaciones)
   POST /auth/recuperar/restablecer: 400 - "El código ingresado no es válido o ha expirado."

================================================================================
## 2. USUARIO (CRUD + estado + rol + password + eliminar)
INICIO: /app/gestion/roles-yusuarios -> usuario.service.ts -> Interceptor (Bearer)
PASOS MID: apiRateLimiter -> Router usuario.routes.ts -> validateBody/Params -> authenticateToken -> authorizePermission('usuarios.x') -> controller
- GET /usuarios (listar)  -> authorizePermission('usuarios.view') + filtros (busqueda, filtroRol, estado, empresaId) -> ok(200) lista
- GET /usuarios/:id       -> authorizePermission('usuarios.view') + validateParams -> 404 "El usuario no existe." -> ok(200){usuario, roles}
- POST /usuarios          -> authorizePermission('usuarios.create') + validateBody
      -> 409 "Ya existe un usuario con ese correo electrónico."
      -> 404 "El rol seleccionado no existe."
      -> bcrypt.hash 10 -> repo.crear -> registrarAuditoria(CREAR) -> created(201)
- PUT /usuarios/:id       -> authorizePermission('usuarios.edit') + validateBody + validateParams
      -> 404 "El usuario no existe." · 404 "El rol seleccionado no existe." (si cambia rol)
      -> actualizar (password opcional) -> auditoria(ACTUALIZAR) -> ok(200)
- PATCH /usuarios/:id/estado -> authorizePermission('usuarios.desactivar')
      -> 404 "El usuario no existe." -> auditoria(ACTIVAR/DESACTIVAR) -> ok(200)
- PATCH /usuarios/:id/rol -> authorizePermission('usuarios.edit') + validateBody
      -> 404 "El usuario no existe." · 404 "El rol seleccionado no existe." -> auditoria(AUTORIZAR) -> ok(200)
- PUT /usuarios/:id/password -> authorizePermission('usuarios.password') + validateBody
      -> 400 "Para cambiar tu propia contraseña usa la opción de tu perfil." (si req.user.id === id)
      -> 404 "El usuario no existe." -> bcrypt -> elimina sesiones del usuario -> auditoria(CAMBIAR_PASSWORD) -> ok(200)
- DELETE /usuarios/:id    -> authorizePermission('usuarios.delete') + validateParams
      -> 403 "No puedes eliminar tu propio usuario." (si id === req.user.id)
      -> 404 "El usuario no existe." -> repo.eliminar -> auditoria(ELIMINAR) -> noContent(200)

================================================================================
## 3. ROL (CRUD + permisos RBAC)
INICIO: roles-yusuarios (Roles) -> rol.service.ts -> Interceptor
PASOS MID: apiRateLimiter -> rol.routes.ts -> validateBody/Params -> authenticateToken -> authorizePermission('roles.x')
- GET /roles/basicos -> authorizePermission('roles.view') -> ok(200) roles minimales
- GET /roles         -> authorizePermission('roles.view') -> ok(200) lista con count usuarios
- GET /roles/:id     -> authorizePermission('roles.view') + validateParams -> 404 "El rol no existe." -> ok(200)
- POST /roles        -> authorizePermission('roles.create') + validateBody
      -> 409 "Ya existe un rol con ese nombre." -> repo.crear -> auditoria(CREAR) -> created(201)
- PUT /roles/:id     -> authorizePermission('roles.edit') + validateBody
      -> 404 "El rol no existe." · 409 "Ya existe un rol con ese nombre." (otro rol)
      -> ok(200) + auditoria(ACTUALIZAR)
- PATCH /roles/:id/estado -> authorizePermission('roles.edit') + validateBody -> 404 "El rol no existe." -> ok(200)
- PUT /roles/:id/permisos -> authorizePermission('roles.asignar_permisos') + validateBody
      -> 404 "El rol no existe." -> reemplaza rol_permiso -> auditoria(ASIGNAR_PERMISOS) -> ok(200)
- DELETE /roles/:id   -> authorizePermission('roles.delete') + validateParams
      -> 404 "El rol no existe." · 409 "No se puede eliminar un rol que tiene usuarios asignados." -> noContent(200)

================================================================================
## 4. PERMISO (catálogo, solo lectura)
INICIO: roles-yusuarios -> permiso.service.ts -> Interceptor
PASOS MID: apiRateLimiter -> permiso.routes.ts -> authenticateToken -> authorizePermission('permisos.view')
- GET /permisos              -> ok(200) todos
- GET /permisos/modulo/:modulo -> ok(200) filtrados por módulo
FIN: ok(200) -> Interceptor pasa data -> componente pinta
ERRORES: 400 (params) · 401 · 403 · 500

================================================================================
## 5. EMPRESA (CRUD multiempresa + seleccionar activa)
PASOS MID: apiRateLimiter -> empresa.routes.ts -> validateBody/Params -> authenticateToken -> authorizePermission('empresas.x')
- POST /empresas/seleccionar -> authorizePermission('empresas.view') + validateBody
      -> 401 "No se pudo identificar la sesión actual." (sin sesionId)
      -> 404 "La empresa no existe." · 403 "La empresa está inactiva. No puedes seleccionarla."
      -> actualiza sesion.empresa_id + usuario.empresa_id -> ok(200)
- GET /empresas -> authorizePermission('empresas.view') -> ok(200) lista
- GET /empresas/:id -> authorizePermission('empresas.view') + validateParams -> 404 "La empresa no existe." -> ok(200)
- POST /empresas -> authorizePermission('empresas.create') + validateBody
      -> 409 "Ya existe una empresa con ese NIT."
      -> 500 "No existe el rol Administrador en el sistema." (al crear la primera: crea admin de la empresa)
      -> 404 rol admin? -> created(201) + auditoria(CREAR)
- PUT /empresas/:id -> authorizePermission('empresas.edit') + validateBody -> 404 "La empresa no existe." -> ok(200)
- DELETE /empresas/:id -> authorizePermission('empresas.delete') + validateParams -> 404 "La empresa no existe." -> noContent(200)

================================================================================
## 6. CATEGORIA (CRUD simple)
PASOS MID: apiRateLimiter -> categoria.routes.ts -> validateBody/Params -> authenticateToken -> authorizePermission('categorias.x')
- GET /categorias -> ok(200) · GET /categorias/:id -> 404 "La categoría no existe." -> ok(200)
- POST /categorias -> 409 "Ya existe una categoría con ese nombre." -> created(201)
- PUT /categorias/:id -> 404 · 409 (nombre duplicado en otra) -> ok(200)
- DELETE /categorias/:id -> 404 -> noContent(200) (FK -> 409 si productos la usan)

================================================================================
## 7. BODEGA (CRUD simple, capacidad/ocupado)
PASOS MID: apiRateLimiter -> bodega.routes.ts -> validateBody/Params -> authenticateToken -> authorizePermission('bodegas.x')
- GET /bodegas -> ok(200) · GET /bodegas/:id -> 404 "La bodega no existe." -> ok(200)
- POST /bodegas -> 409 "Ya existe una bodega con ese código." -> created(201)
- PUT /bodegas/:id -> 404 · 409 (código duplicado) -> ok(200)
- DELETE /bodegas/:id -> 404 -> noContent(200)
NOTA: al crear movimiento ENTRADA/SALIDA se actualiza bodega.ocupado con LEAST(capacidad,...) / GREATEST(0,...)

================================================================================
## 8. PRODUCTO (CRUD + stock-bajo + estado)
PASOS MID: apiRateLimiter -> producto.routes.ts -> validateBody/Params -> authenticateToken -> authorizePermission('productos.x'|'inventario.view')
- GET /productos -> authorizePermission('productos.view') -> ok(200)
- GET /productos/stock-bajo -> authorizePermission('inventario.view') -> ok(200)
- GET /productos/:id -> authorizePermission('productos.view') + validateParams -> 404 "El producto no existe." -> ok(200)
- POST /productos -> authorizePermission('productos.create') + validateBody
      -> 409 "Ya existe un producto con ese código." -> created(201)
- PUT /productos/:id -> authorizePermission('productos.edit') + validateBody
      -> 404 "El producto no existe." · 409 código duplicado (existe.id !== id) -> ok(200)
- PATCH /productos/:id/estado -> authorizePermission('productos.edit') + validateBody -> 404 "El producto no existe." -> ok(200)
- DELETE /productos/:id -> authorizePermission('productos.delete') + validateParams -> 404 "El producto no existe." -> noContent(200) (FK->409 si tiene movimientos/recepciones)

================================================================================
## 9. MOVIMIENTO (inventario: entrada/salida/transferencia)
PASOS MID: apiRateLimiter -> movimiento.routes.ts -> validateBody/Params -> authenticateToken
           authorizePermission('movimientos.view' | 'recepcion.create' | 'recepcion.delete')
- GET /movimientos -> authorizePermission('movimientos.view') + validateQuery (busqueda, tipo, estado, desde, hasta)
      -> ok(200) { movimientos, totales: {totalEntradas, totalSalidas} } LIMIT 500
- GET /movimientos/:id -> authorizePermission('movimientos.view') + validateParams -> 404 "El movimiento no existe." -> ok(200)
- POST /movimientos -> authorizePermission('recepcion.create') + validateBody
      -> inserta movimiento -> SI producto.id y tipo != TRANSFERENCIA: stock = GREATEST(0, stock ± cantidad)
      -> SI bodegaId: ocupado = LEAST(capacidad, GREATEST(0, ocupado ± cantidad))
      -> auditoria(CREAR, modulo INVENTARIO) -> created(201) "Movimiento registrado correctamente."
- DELETE /movimientos/:id -> authorizePermission('recepcion.delete') + validateParams
      -> 404 "El movimiento no existe." -> elimina (NO revierte stock) -> auditoria(ELIMINAR) -> noContent(200)
NOTA: la lógica GREATEST/LEAST hace que stock y ocupado NUNCA bajen de 0 ni suban de capacidad (regla de negocio, no error).

================================================================================
## 10. RECEPCION (mercancía con detalle, transacción)
PASOS MID: apiRateLimiter -> recepcion.routes.ts -> validateBody/Params -> authenticateToken
           authorizeAnyPermission('recepcion.view','historial.view') | authorizePermission('recepcion.create'/'edit'/'delete')
- GET /recepciones -> ok(200) lista · GET /recepciones/:id -> 404 "La recepción no existe." -> ok(200) {recepcion, detalle}
- POST /recepciones -> authorizePermission('recepcion.create') + validateBody -> 404 "La recepción no existe."? no:
        inserta cabecera + detalle en transacción -> 409 numero_documento duplicado / FK producto (repo) -> created(201)
- PUT /recepciones/:id -> authorizePermission('recepcion.edit') + validateBody -> 404 "La recepción no existe." -> ok(200)
- DELETE /recepciones/:id -> authorizePermission('recepcion.delete') + validateParams -> 404 "La recepción no existe." -> noContent(200) (FK->409)
NOTA: usa recepciones + recepcion_detalle (productos, cantidades, bodegas, usuario).

================================================================================
## 11. AUDITORIA (solo lectura)
- GET /auditorias -> authorizePermission('auditoria.view') -> ok(200) lista (join usuarios)
- GET /auditorias/:id -> authorizePermission('auditoria.view') + validateParams -> 404 "El registro de auditoría no existe." -> ok(200)

================================================================================
## 12. INCIDENCIA (reporte de incidencias)
- GET /incidencias -> authorizePermission('incidencias.view') -> ok(200)
- GET /incidencias/:id -> authorizePermission('incidencias.view') + validateParams -> 404 "La incidencia no existe." -> ok(200)
- POST /incidencias -> authorizePermission('incidencias.create') + validateBody -> created(201)
- PUT /incidencias/:id -> authorizePermission('incidencias.edit') + validateBody -> 404 "La incidencia no existe." -> ok(200)
- DELETE /incidencias/:id -> authorizePermission('incidencias.delete') + validateParams -> 404 "La incidencia no existe." -> noContent(200)

================================================================================
## 13. MANTENIMIENTO
- GET /mantenimientos -> authorizePermission('mantenimiento.view') -> ok(200)
- GET /mantenimientos/:id -> authorizePermission('mantenimiento.view') + validateParams -> 404 "El mantenimiento no existe." -> ok(200)
- POST /mantenimientos -> authorizePermission('mantenimiento.create') + validateBody -> created(201)
- PUT /mantenimientos/:id -> authorizePermission('mantenimiento.edit') + validateBody -> 404 "El mantenimiento no existe." -> ok(200)
- DELETE /mantenimientos/:id -> authorizePermission('mantenimiento.delete') + validateParams -> 404 "El mantenimiento no existe." -> noContent(200)

================================================================================
## 14. SESION (sesiones activas)
- GET /sesiones -> authorizePermission('sesiones.view') -> 401 "No se pudo identificar la sesión actual." (sin sesionId en req.user) -> ok(200) lista
- POST /sesiones/cerrar-otras -> authorizePermission('sesiones.delete') -> cierra todas las demas -> ok(200)
- DELETE /sesiones/:id -> authorizePermission('sesiones.delete') + validateParams
      -> 404 "La sesión no existe." · 403 "No puedes cerrar la sesión actual desde aquí." (id === req.user.sesionId) -> noContent(200)

================================================================================
## 15. NOTIFICACION
- GET /notificaciones -> authorizePermission('notificaciones.view') -> 401 "No autenticado." (sin req.user) -> ok(200)
- PATCH /notificaciones/:id/leida -> authorizePermission('notificaciones.view') + validateBody -> 404 "La notificación no existe." -> ok(200)
- POST /notificaciones/leidas -> authorizePermission('notificaciones.view') -> marca todas -> ok(200)

================================================================================
## 16. CONFIGURACION
- GET /configuracion -> authorizePermission('configuracion.view') -> ok(200) clave-valor
- PUT /configuracion -> authorizePermission('configuracion.edit') + validateBody
      -> 400 "No se enviaron configuraciones para actualizar." (objeto vacío) -> UPSERT clave-valor -> ok(200)

================================================================================
## 17. DASHBOARD (panel)
- GET /dashboard/resumen -> authorizePermission('dashboard.view') -> ok(200) totales (productos, stock bajo, inventario, gráficas: entradas/salidas por mes, conteos)

================================================================================
## 18. REPORTE
- GET /reportes/inventario  · /reportes/movimientos · /reportes/stock · /reportes/auditorias · /reportes/incidencias
      -> authorizePermission('reportes.view') -> ok(200) serie de datos agregada

================================================================================
## PATRONES TRANSVERSALES PARA DIBUJAR
ERORRE COMUNES DE CADA RUTA (en este orden): rateLimit -> validate -> authenticate -> authorize -> reglas de negocio -> repo(PG) -> errorHandler
- 429 RATE_LIMITED: apiRateLimiter 500/15min
- 400 BAD_REQUEST (details campos) : validateBody/Params/Query
- 401 UNAUTHORIZED: authenticateToken
- 403 FORBIDDEN: authorizePermission / usuario inactivo
- 404 NOT_FOUND: controller (buscarPorId)
- 409 CONFLICT: controller (duplicados) o PG 23505/23503
- 500 INTERNAL_ERROR: errorHandler genérico
FIN SIEMPRE (éxito): ok/created/noContent -> JSON {success, message, data} -> Interceptor devuelve res.data -> componente usa data

## CLAVE PARA DIBUJAR "DIFERENTES"
- Login y Recuperación: SIN authenticate/authorize (solo validate + rate limit) y NO tienen token al inicio.
- Cada POST/PUT/PATCH tiene rama de 409 específica (qué campo se duplica).
- Cada GET de detalle/*/:id tiene rama de 404 específica.
- Cambiar password del propio usuario y eliminar propio usuario tienen ramas 400/403 especiales.
- Sesión: rama 403 al intentar cerrar la sesión actual.
- Configuración: rama 400 si el body viene vacío.
- La respuesta cruza SIN volver por el MID: el interceptor solo reacciona a errores (401 -> login, otros -> toast).