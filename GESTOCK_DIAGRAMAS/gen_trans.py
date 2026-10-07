# -*- coding: utf-8 -*-
"""Paginas transversales + ensamblado PDF."""
from drawlib import Virgen, W, H, NEGRO, GRIS_PC, GRIS_C, GRIS_B, ROJO, ROJO_FONDO, VERDE
from datos import CONTROLADORES
from gen_common import strip_txt, seccion, grid_errores

_X1, _X2 = 60, W - 60


def _page(tit, sub=""):
    return Virgen(tit, sub)


def _sec(v, x, y, w, txt, size=19, alto=36):
    v.rect(x, y, w, alto, fill=NEGRO, outline=NEGRO, lw=2)
    v.center_text(x, y, w, alto, strip_txt(txt), size=size, fill=(250, 244, 238), style="b")


def _box(v, x, y, w, h, tit, cuerpo, fill=GRIS_PC, size_c=15, size_t=16):
    v.rect(x, y, w, h, fill=fill, outline=NEGRO, lw=3)
    v.rect(x, y, w, 38, fill=NEGRO, outline=NEGRO, lw=2)
    v.center_text(x, y, w, 38, strip_txt(tit), size=size_t, fill=(250, 244, 238), style="b")
    v.box_text(x + 14, y + 48, w - 28, h - 58, cuerpo, size=size_c, style="r")


def _arrow(v, x1, y, x2, color=NEGRO):
    v.arrow_h(x1, y, x2, lw=5, color=color)


def pg_arquitectura():
    v = _page("ARQUITECTURA GENERAL GESTOCK",
              "CLIENTE (Angular) -> MID (front+back) -> API (Express) -> PostgreSQL")
    y0 = 174
    # fila grande
    bw = 330
    gap = 46
    total = 4 * bw + 3 * gap
    x0 = _X1 + ((_X2 - _X1) - total) // 2
    y = y0
    h = 150
    _box(v, x0, y, bw, h, "CLIENTE", "Angular 18\nfrontend_gestock\npaginas + guards + interceptor",
         fill=(230, 238, 242))
    _box(v, x0 + bw + gap, y, bw, h, "MID (2 frentes)", "Interceptor (cliente)\nGuards (cliente)\nrateLimit · validate ·\nauthenticate · authorize (API)", fill=ROJO_FONDO)
    _box(v, x0 + 2 * (bw + gap), y, bw, h, "API", "Express 5 + TS\n18 routers + controllers\nApiError + errorHandler", fill=(236, 240, 232))
    _box(v, x0 + 3 * (bw + gap), y, bw, h, "POSTGRESQL", "Gestock_db\n18 tablas\nmultitenant: empresa_id", fill=(222, 230, 238))
    midY = y + h // 2
    for i in range(3):
        _arrow(v, x0 + i * (bw + gap) + bw + 4, midY, x0 + (i + 1) * (bw + gap) - 4)
    v.etiqueta(x0 + bw + gap // 2, midY - 52, "HTTPS / JSON / Bearer", size=14)

    # detalle del MID
    y2 = y + h + 34
    _sec(v, _X1, y2, _X2 - _X1, "DETALLE DEL MID (no ficticio)")
    yb = y2 + 36 + 14
    bh = 132
    cols = [
        ("EN EL CLIENTE (Angular)", "api.service.ts: devuelve res.data\napi.interceptor.ts: agrega Authorization: Bearer <jwt>\nmaneja 401 (-> login) y demas errores (toast)\nguards: permissionGuard / roleGuard / homeGuard"),
        ("EN EL API (Express)", "apiRateLimiter (500 / 15 min)\nvalidate (Zod schemas)\nauthenticate (JWT + sesion activa)\nauthorize (permisos del rol)\nerrorHandler normaliza ApiError / PG"),
    ]
    cw = ( _X2 - _X1 - gap) // 2
    _box(v, _X1, yb, cw, bh, cols[0][0], cols[0][1], fill=ROJO_FONDO)
    _box(v, _X1 + cw + gap, yb, cw, bh, cols[1][0], cols[1][1], fill=ROJO_FONDO)

    # controladores
    y3 = yb + bh + 34
    _sec(v, _X1, y3, _X2 - _X1, "18 CONTROLADORES REALES (routes/ de backend/src)")
    nombres = [c["id"] for c in CONTROLADORES]
    yc = y3 + 36 + 16
    nh = 46
    nw_ = ( _X2 - _X1 - 5 * 14) // 6
    g = 14
    for i, nm in enumerate(nombres):
        x = _X1 + (i % 6) * (nw_ + g)
        yy = yc + (i // 6) * (nh + 14)
        v.rect(x, yy, nw_, nh, fill=GRIS_C, outline=NEGRO, lw=2)
        v.center_text(x, yy, nw_, nh, nm, size=16, style="b")
    return v


def pg_mid_detalle():
    v = _page("LA CAPA MID EN GESTOCK (DETALLE)",
              "Frontera de seguridad entre el navegador y los controladores")
    y0 = 174
    _sec(v, _X1, y0, _X2 - _X1, "FLUJO DE UNA PETICION AUTENTICADA", size=20)
    pasos = [
        ("1. Angular", "componente -> Servicio llama\napi.service.request(...)"),
        ("2. Interceptor", "adjunta Bearer <jwt>\ntoken gestock_token en\nlocalStorage"),
        ("3. Ruta backend", "apiRoutes.use('/usuarios',\nusuarioRoutes) con /api"),
        ("4. Middleware", "rateLimit -> validate(Zod)\n-> authenticate(JWT)\n-> authorize"),
        ("5. Controller", "usuario.controller.ts\n(auth.usuario...)"),
        ("6. Datos", "Service/Repo (SQL)\n-> PostgreSQL"),
    ]
    n = len(pasos)
    bh = 150
    gap = 34
    cw = (_X2 - _X1 - (n - 1) * gap) // n
    y = y0 + 40
    for i, (t, c) in enumerate(pasos):
        _box(v, _X1 + i * (cw + gap), y, cw, bh, t, c, fill=(ROJO_FONDO if i in (1, 3) else GRIS_PC))
        if i < n - 1:
            _arrow(v, _X1 + i * (cw + gap) + cw + 4, y + bh // 2, _X1 + (i + 1) * (cw + gap) - 4)
    y2 = y + bh + 36
    _sec(v, _X1, y2, _X2 - _X1, "ARCHIVOS REALES DE LA CAPA MID")
    filas = [
        ("frontend_gestock/src/app/interceptors/api.interceptor.ts", "Agrega Authorization: Bearer <jwt>; 401 != login -> limpiar + toast 'Tu sesion ha expirado' + /auth/login; otros -> toast"),
        ("frontend_gestock/src/app/guards/permission-guard.ts", "refrescarSesion -> estaAutenticado -> data.permission/anyPermission -> toast 'Acceso denegado'"),
        ("frontend_gestock/src/app/guards/home-guard.ts · role-guard.ts", "Redirige por rol a la ruta inicial / restringe acceso"),
        ("backend/src/middleware/validate.ts", "parsea con schema Zod de models/schemas.ts: 400 BAD_JSON / 400 BAD_REQUEST"),
        ("backend/src/middleware/authenticate.ts", "verifica token JWT + sesion activa en BD: 401 UNAUTHORIZED"),
        ("backend/src/middleware/authorize.ts", "permiso del rol (rol_permiso): 403 FORBIDDEN"),
        ("backend/src/middleware/rateLimit.ts", "apiRateLimiter(500), loginEmailLimiter(5), loginIpLimiter(60), recuperacionLimiter"),
    ]
    yt = y2 + 40
    rh = 56
    hdr = 38
    c1 = 560
    c2 = _X2 - _X1 - c1
    for x, tw, t in [(_X1, c1, "Archivo"), (_X1 + c1, c2, "Responsabilidad")]:
        v.rect(x, yt, tw, hdr, fill=GRIS_B, outline=NEGRO, lw=2)
        v.center_text(x, yt, tw, hdr, t, size=15, fill=(250, 244, 238), style="b")
    yy = yt + hdr
    for i, (a, b) in enumerate(filas):
        f = GRIS_PC if i % 2 == 0 else (248, 246, 242)
        v.rect(_X1, yy, c1, rh, fill=f, outline=NEGRO, lw=2)
        v.rect(_X1 + c1, yy, c2, rh, fill=f, outline=NEGRO, lw=2)
        v.box_text(_X1 + 10, yy, c1 - 20, rh, a, size=11, style="b")
        v.box_text(_X1 + c1 + 10, yy, c2 - 20, rh, b, size=11, style="r")
        yy += rh

    # ---- RAMAS DE ERROR DEL MID (cada error una rama -> errorHandler) ----
    y3 = yy + 14
    seccion(v, _X1, y3, _X2 - _X1,
            "ERRORES DEL MID: CADA FALLA ES UNA RAMA INDEPENDIENTE", size=16, alto=30)
    mid_err = [
        ("429 RATE_LIMITED", "¿Se supero apiRateLimiter (500/15min)?",
         "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."),
        ("400 BAD_REQUEST", "¿Body/Params/Query cumplen el schema Zod?",
         "Los datos enviados no son validos."),
        ("401 UNAUTHORIZED", "¿Se envio 'Authorization: Bearer <token>'?",
         "No se proporciono un token de acceso."),
        ("401 UNAUTHORIZED", "¿El token JWT es valido?", "El token de acceso no es valido."),
        ("401 UNAUTHORIZED", "¿La sesion sigue activa en BD?",
         "Tu sesion fue cerrada. Inicia sesion nuevamente."),
        ("403 FORBIDDEN", "¿El rol tiene el permiso requerido?",
         "No tienes permisos para realizar esta accion."),
    ]
    grid_errores(v, y3 + 34 + 8, mid_err, bottom=1136)
    return v


def pg_autenticacion():
    v = _page("AUTENTICACION Y SESION",
              "Login con rateLimit -> JWT 8h -> sesiones activas -> logout")
    y0 = 174
    _sec(v, _X1, y0, _X2 - _X1, "POST /auth/login (auth.routes.ts)", size=20)
    pasos = [
        ("Angular login()", "auth.ts/service\nformulario email+password"),
        ("POST /api/auth/login", "validateBody\nloginSchema"),
        ("rate limits", "loginEmailLimiter\nloginIpLimiter\nrecuperacionLimiter (429)"),
        ("auth.controller login()", "verifica credenciales\nbcrypt"),
        ("Genera JWT", "jsonwebtoken\nexp: 8h\npayload: id, rol"),
        ("Inserta sesion", "sesiones (Activa)\nIP + userAgent"),
        ("Responde", "ok(200) {token,\nusuario, permisos}"),
    ]
    n = len(pasos)
    bh = 120
    gap = 22
    cw = (_X2 - _X1 - (n - 1) * gap) // n
    y = y0 + 38
    for i, (t, c) in enumerate(pasos):
        fill = VERDE if i == 0 else (ROJO_FONDO if i in (2, 3) else GRIS_PC)
        _box(v, _X1 + i * (cw + gap), y, cw, bh, t, c, fill=fill, size_c=12)
        if i < n - 1:
            _arrow(v, _X1 + i * (cw + gap) + cw + 4, y + bh // 2, _X1 + (i + 1) * (cw + gap) - 4)

    y2 = y + bh + 26
    _sec(v, _X1, y2, _X2 - _X1, "RUTAS PROTEGIDAS CON MIDDLEWARE")
    filas = [
        ("GET /auth/perfil", "authenticateToken"),
        ("POST /auth/logout", "authenticateToken -> cierra sesion (Activa->Cerrada)"),
        ("PUT /auth/contrasena", "authenticateToken + validateBody(cambiarContrasenaSchema)"),
        ("POST /auth/recuperar", "recuperacionLimiter + validateBody(solicitarRecuperacionSchema) -> email con codigo"),
        ("POST /auth/recuperar/validar", "validateBody(validarCodigoRecuperacionSchema)"),
        ("POST /auth/recuperar/restablecer", "validateBody(restablecerPasswordSchema)"),
    ]
    yt = y2 + 36
    rh = 40
    hdr = 32
    c1 = 320
    c2 = _X2 - _X1 - c1
    for x, tw, t in [(_X1, c1, "Ruta"), (_X1 + c1, c2, "Middleware / comportamiento")]:
        v.rect(x, yt, tw, hdr, fill=GRIS_B, outline=NEGRO, lw=2)
        v.center_text(x, yt, tw, hdr, t, size=15, fill=(250, 244, 238), style="b")
    yy = yt + hdr
    for i, (a, b) in enumerate(filas):
        f = GRIS_PC if i % 2 == 0 else (248, 246, 242)
        v.rect(_X1, yy, c1, rh, fill=f, outline=NEGRO, lw=2)
        v.rect(_X1 + c1, yy, c2, rh, fill=f, outline=NEGRO, lw=2)
        v.center_text(_X1, yy, c1, rh, a, size=13, style="b")
        v.box_text(_X1 + c1 + 12, yy, c2 - 24, rh, b, size=12, style="r")
        yy += rh

    y3 = yy + 16
    v.rect(_X1, y3, _X2 - _X1, 48, fill=GRIS_PC, outline=NEGRO, lw=2)
    v.box_text(_X1 + 14, y3, _X2 - _X1 - 28, 48, "FRONTEND (MID): localStorage 'gestock_token' + 'gestock_usuario_sesion'; api.interceptor agrega Authorization: Bearer <jwt> y en 401 (ruta != login) redirige a /auth/login con toast.",
               size=13, style="r")
    y4 = y3 + 48 + 12
    _sec(v, _X1, y4, _X2 - _X1, "RAMAS DE ERROR DE LOGIN (cada falla una rama -> errorHandler)",
         size=16, alto=30)
    login_err = [
        ("429 RATE_LIMITED", "¿Email supero 5 intentos/15min?",
         "Has superado el maximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo."),
        ("429 RATE_LIMITED", "¿IP supero 60 peticiones/15min?",
         "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."),
        ("400 BAD_REQUEST", "¿loginSchema valida email+password?", "Los datos enviados no son validos."),
        ("401 UNAUTHORIZED", "¿Email+password correctos (bcrypt.compare)?",
         "Las credenciales ingresadas no son validas."),
        ("401 UNAUTHORIZED", "¿El usuario pertenece a la empresa?",
         "El usuario no pertenece a esa empresa."),
        ("403 FORBIDDEN", "¿Cuenta activa?", "Tu cuenta esta inactiva. Contacta al administrador."),
        ("403 FORBIDDEN", "¿Rol asignado activo?", "El rol asignado a tu cuenta esta inactivo. Contacta al administrador."),
        ("500 INTERNAL_ERROR", "¿Se cargaron los permisos del usuario?",
         "No se pudieron cargar los permisos del usuario."),
    ]
    grid_errores(v, y4 + 30 + 6, login_err, bottom=1136)
    return v


def pg_rbac():
    v = _page("RBAC: ROLES Y PERMISOS",
              "Roles -> rol_permiso -> permisos -> authorizePermission(...)")
    y0 = 174
    bw = 300
    gap = 50
    total = 3 * bw + 2 * gap
    x0 = _X1 + ((_X2 - _X1) - total) // 2
    y = y0
    h = 150
    _box(v, x0, y, bw, h, "ROL", "Administrador\nSupervisor\nTecnico de Mantenimiento\nAuditor\nOperario", fill=GRIS_PC)
    _box(v, x0 + bw + gap, y, bw, h, "ROL_PERMISO", "relacion N:M\nusuarios.rol_id -> roles.id\nroles.id -> rol_permiso.rol_id\nrol_permiso.permiso_id -> permisos.id", fill=ROJO_FONDO)
    _box(v, x0 + 2 * (bw + gap), y, bw, h, "PERMISO", "modulo.accion\nej: usuarios.create\nroles.asignar_permisos\nproductos.view\nreportes.view ...", fill=(236, 240, 232))
    for i in range(2):
        _arrow(v, x0 + i * (bw + gap) + bw + 4, y + h // 2, x0 + (i + 1) * (bw + gap) - 4)

    y2 = y + h + 36
    _sec(v, _X1, y2, _X2 - _X1, "PERMISOS REALES POR OBSERVABLE (05_insert_permissions.sql)")
    filas = [
        ("Dashboard", "dashboard.view"),
        ("Empresas", "empresas.view · create · edit · delete"),
        ("Usuarios", "usuarios.view · create · edit · desactivar · password · delete"),
        ("Roles / Permisos", "roles.view · create · edit · delete · asignar_permisos · permisos.view"),
        ("Categorias / Bodegas", "categorias.view · create · edit · delete · bodegas.view · create · edit · delete"),
        ("Productos / Inventario", "productos.view · create · edit · delete · inventario.view"),
        ("Movimientos / Recepcion", "movimientos.view · recepcion.view · create · edit · delete · historial.view"),
        ("Auditoria / Incidencias / Mantenimiento", "auditoria.view · incidencias.view · create · edit · delete · mantenimiento.view · create · edit · delete"),
        ("Sesiones / Notificaciones / Config / Reportes", "sesiones.view · delete · notificaciones.view · configuracion.view · edit · reportes.view"),
    ]
    yt = y2 + 40
    rh = 42
    hdr = 36
    c1 = 330
    c2 = _X2 - _X1 - c1
    for x, tw, t in [(_X1, c1, "Modulo"), (_X1 + c1, c2, "Permisos (patron modulo.accion)")]:
        v.rect(x, yt, tw, hdr, fill=GRIS_B, outline=NEGRO, lw=2)
        v.center_text(x, yt, tw, hdr, t, size=15, fill=(250, 244, 238), style="b")
    yy = yt + hdr
    for i, (a, b) in enumerate(filas):
        f = GRIS_PC if i % 2 == 0 else (248, 246, 242)
        v.rect(_X1, yy, c1, rh, fill=f, outline=NEGRO, lw=2)
        v.rect(_X1 + c1, yy, c2, rh, fill=f, outline=NEGRO, lw=2)
        v.center_text(_X1, yy, c1, rh, a, size=13, style="b")
        v.box_text(_X1 + c1 + 12, yy, c2 - 24, rh, b, size=13, style="r")
        yy += rh
    y3 = yy + 26
    _sec(v, _X1, y3, _X2 - _X1, "COMO SE APLICA EN BACKEND")
    _box(v, _X1, y3 + 40, _X2 - _X1, 88,
         "authorizePermission('modulo.accion') · authorizeAnyPermission('a','b')",
         "Cada ruta protegida llama authorizePermission con el permiso exacto. El frontend usa los permisos del login para mostrar/ocultar y los guards refuerzan con data.permission o data.anyPermission.")
    return v


def pg_crud():
    v = _page("PATRON CRUD TIPICO EN GESTOCK",
              "Un controlador = un modulo · Create/Read/Update/Delete con auditoria")
    y0 = 174
    _sec(v, _X1, y0, _X2 - _X1, "CICLO DE VIDA DE UN REGISTRO (ej. Producto)", size=20)
    ops = [
        ("LISTAR\nGET /:ruta", "authorize('x.view')\nlistar() -> repo.listar"),
        ("CREAR\nPOST /:ruta", "authorize('x.create')\nvalidateBody -> crear()"),
        ("DETALLE\nGET /:ruta/:id", "authorize('x.view')\nvalidateParams -> detalle()"),
        ("EDITAR\nPUT /:ruta/:id", "authorize('x.edit')\nvalidateBody -> actualizar()"),
        ("ESTADO\nPATCH /:ruta/:id", "authorize('x.edit')\ncambiarEstado()"),
        ("ELIMINAR\nDELETE /:ruta/:id", "authorize('x.delete')\neliminar()"),
    ]
    n = len(ops)
    bh = 168
    gap = 26
    cw = (_X2 - _X1 - (n - 1) * gap) // n
    y = y0 + 42
    for i, (t, c) in enumerate(ops):
        _box(v, _X1 + i * (cw + gap), y, cw, bh, t, c, fill=(ROJO_FONDO if i % 2 else GRIS_PC), size_c=13)
    y2 = y + bh + 30
    _sec(v, _X1, y2, _X2 - _X1, "CODIGO TIPO EN UN CONTROLLER (usuario.controller.ts)")
    codigo = ("async listar(req, res, next) { try { const lista = await usuarioService.listar(req.usuarioId); ok(res, lista); } "
              "catch (e) { next(e); } }\n"
              "async crear(req, res, next)  { try { const nuevo = await usuarioService.crear(req.body); created(res, nuevo); } "
              "catch (e) { next(e); } }")
    yc = y2 + 42
    v.rect(_X1, yc, _X2 - _X1, 150, fill=(248, 246, 242), outline=NEGRO, lw=2)
    v.box_text(_X1 + 24, yc, _X2 - _X1 - 48, 150, codigo, size=16, style="r", fill=NEGRO)
    y3 = yc + 150 + 10
    _box(v, _X1, y3, _X2 - _X1, 56,
         "AUDITORIA Y RESPUESTAS",
         "Cada operacion relevante inserta en auditorias (usuario_id, accion, entidad, id_registro). Respuestas: ok() 200 · created() 201 · noContent() 200. Errores: next(e) -> errorHandler.")
    y4 = y3 + 56 + 12
    _sec(v, _X1, y4, _X2 - _X1, "RAMAS DE ERROR DEL PATRON (cada falla su rama -> errorHandler)",
         size=15, alto=30)
    crud_err = [
        ("401 UNAUTHORIZED", "¿Token presente + valido en la peticion?",
         "No se proporciono un token de acceso."),
        ("403 FORBIDDEN", "¿El rol tiene el permiso x.create/edit/delete?",
         "No tienes permisos para realizar esta accion."),
        ("400 BAD_REQUEST", "¿DTO valido (POST/PUT/PATCH)?", "Los datos enviados no son validos."),
        ("404 NOT_FOUND", "¿Existe el id (GET/:id, PUT, DELETE)?", "El recurso solicitado no existe."),
        ("409 CONFLICT", "¿Valor unico duplicado al crear/editar?", "Ya existe un registro con ese valor unico."),
        ("409 CONFLICT", "¿FK: el registro esta en uso (DELETE)?", "El registro esta siendo utilizado por otra entidad."),
        ("400 BAD_REQUEST", "¿Estado permitido (PATCH /estado)?", "El estado enviado no es valido."),
        ("500 INTERNAL_ERROR", "¿Fallo SQL o service?", "Error interno del servidor."),
    ]
    grid_errores(v, y4 + 30 + 8, crud_err, bottom=1136)
    return v


def pg_errores():
    v = _page("MANEJO DE ERRORES (BACKEND)",
              "ApiError + errorHandler + PostgreSQL codes · cada error es su propia rama")
    y0 = 174
    _sec(v, _X1, y0, _X2 - _X1, "CADA CODIGO DE ERROR ES UNA RAMA INDEPENDIENTE -> errorHandler",
         size=18, alto=34)
    er = [
        ("429 RATE_LIMITED", "¿apiRateLimiter superado (500/15min)?",
         "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."),
        ("400 BAD_REQUEST", "¿Body/Params/Query cumplen Zod?", "Los datos enviados no son validos."),
        ("400 BAD_JSON", "¿El cuerpo es JSON mal formado?", "El cuerpo de la solicitud contiene JSON invalido."),
        ("400 NOT_NULL_VIOLATION", "¿Falta una columna NOT NULL (PG 23502)?", "Faltan campos obligatorios."),
        ("400 INVALID_PARAMETER", "¿Parametro con tipo invalido (PG 22P02)?", "Uno de los parametros enviados no es valido."),
        ("401 UNAUTHORIZED", "¿Se envio 'Authorization: Bearer <token>'?", "No se proporciono un token de acceso."),
        ("401 UNAUTHORIZED", "¿El token JWT es valido?", "El token de acceso no es valido."),
        ("401 UNAUTHORIZED", "¿La sesion sigue activa?", "Tu sesion fue cerrada. Inicia sesion nuevamente."),
        ("401 UNAUTHORIZED", "¿El usuario aun existe?", "El usuario ya no existe en el sistema."),
        ("403 FORBIDDEN", "¿El usuario esta activo?", "El usuario esta inactivo. Contacta al administrador."),
        ("403 FORBIDDEN", "¿El rol tiene el permiso requerido?", "No tienes permisos para realizar esta accion."),
        ("404 NOT_FOUND", "¿Existe el recurso solicitado?", "El recurso solicitado no existe."),
        ("409 CONFLICT", "¿Regla de negocio violada?", "Ej: contrasena actual incorrecta · body vacio."),
        ("409 DUPLICATE_KEY", "¿Violacion de unicidad (PG 23505)?", "Ya existe un registro con ese valor unico."),
        ("409 FOREIGN_KEY_VIOLATION", "¿Violacion de FK (PG 23503)?", "El registro esta siendo utilizado por otra entidad."),
        ("500 INTERNAL_ERROR", "¿Error no controlado en service/BD?", "Error interno del servidor."),
    ]
    grid_errores(v, y0 + 34 + 12, er, bottom=1136, ncols=4)
    return v


def pg_bd():
    v = _page("BASE DE DATOS GESTOCK (PostgreSQL)",
              "18 tablas + relaciones (multitenant: empresa_id en tablas de negocio)")
    grupos = [
        ("NUCLEO / IDENTIDAD", ["empresas", "roles", "permisos", "rol_permiso", "usuarios", "sesiones", "restablecimientos_contrasena"]),
        ("CATALOGOS", ["categorias", "bodegas"]),
        ("INVENTARIO", ["productos", "movimientos_inventario"]),
        ("OPERACIONES", ["recepciones", "recepcion_detalle", "incidencias", "mantenimientos"]),
        ("SEGURIDAD / CONFIG", ["auditorias", "notificaciones", "configuracion_sistema"]),
    ]
    y0 = 174
    _sec(v, _X1, y0, _X2 - _X1, "TABLAS REALES DE GESTOCK", size=20)
    cstart = _X1
    colw = (_X2 - _X1 - 4 * 20) // 5
    y = y0 + 44
    hh = 250
    for g in range(5):
        x = cstart + g * (colw + 20)
        nombre = grupos[g][0]
        items = grupos[g][1]
        v.rect(x, y, colw, hh, fill=(236, 240, 232), outline=NEGRO, lw=3)
        v.rect(x, y, colw, 38, fill=NEGRO, outline=NEGRO, lw=2)
        v.center_text(x, y, colw, 38, nombre, size=14, fill=(250, 244, 238), style="b")
        yy = y + 48
        for it in items:
            v.rect(x + 14, yy, colw - 28, 30, fill=GRIS_PC, outline=GRIS_B, lw=2)
            v.center_text(x + 14, yy, colw - 28, 30, it, size=14, style="r")
            yy += 36
    y2 = y + hh + 30
    _sec(v, _X1, y2, _X2 - _X1, "RELACIONES PRINCIPALES")
    rels = [
        "usuarios.rol_id -> roles.id · usuarios.empresa_id -> empresas.id",
        "rol_permiso.rol_id -> roles.id · rol_permiso.permiso_id -> permisos.id",
        "productos.categoria_id -> categorias.id · productos.bodega_id -> bodegas.id",
        "movimientos_inventario.producto_id -> productos.id · bodega_id -> bodegas.id",
        "recepcion_detalle.recepcion_id -> recepciones.id · producto_id -> productos.id",
        "incidencias/mantenimientos .usuario_id -> usuarios.id · auditorias.usuario_id -> usuarios.id",
    ]
    yt = y2 + 40
    rh = 42
    c1 = _X2 - _X1
    for x, tw, t in [(_X1, c1, "Relacion (FK)")]:
        v.rect(x, yt, tw, 34, fill=GRIS_B, outline=NEGRO, lw=2)
        v.center_text(x, yt, tw, 34, t, size=15, fill=(250, 244, 238), style="b")
    yy = yt + 34
    for i, r in enumerate(rels):
        f = GRIS_PC if i % 2 == 0 else (248, 246, 242)
        v.rect(_X1, yy, c1, rh, fill=f, outline=NEGRO, lw=2)
        v.box_text(_X1 + 14, yy, c1 - 28, rh, r, size=14, style="r")
        yy += rh
    return v


def pg_matriz():
    v = _page("MATRIZ DE TRAZABILIDAD: CONTROLADOR -> MODULO -> PERMISOS",
              "Resumen de los 18 controladores reales")
    y0 = 174
    hdr = 40
    rh = 42
    yt = y0
    c_id = 130
    c_mod = 130
    c_perm = _X2 - _X1 - c_id - c_mod
    hdrs = [(_X1, c_id, "Controlador"), (_X1 + c_id, c_mod, "Modulo"), (_X1 + c_id + c_mod, c_perm, "Permisos que protegen sus rutas (reales)")]
    for x, tw, t in hdrs:
        v.rect(x, yt, tw, hdr, fill=GRIS_B, outline=NEGRO, lw=2)
        v.center_text(x, yt, tw, hdr, t, size=15, fill=(250, 244, 238), style="b")
    yy = yt + hdr
    for i, c in enumerate(CONTROLADORES):
        f = GRIS_PC if i % 2 == 0 else (248, 246, 242)
        v.rect(_X1, yy, c_id, rh, fill=f, outline=NEGRO, lw=2)
        v.rect(_X1 + c_id, yy, c_mod, rh, fill=f, outline=NEGRO, lw=2)
        v.rect(_X1 + c_id + c_mod, yy, c_perm, rh, fill=f, outline=NEGRO, lw=2)
        v.center_text(_X1, yy, c_id, rh, c["id"], size=13, style="b")
        v.center_text(_X1 + c_id, yy, c_mod, rh, c["modulo"], size=13, style="b")
        perms = set()
        for (_m, _r, _p) in c["coleccion"]:
            for token in _p.replace("authorizeAnyPermission(", "authorizePermission(").replace(")", "").split("authorizePermission("):
                token = token.strip()
                if token and "'" in token:
                    perms.add(token.split("'")[1])
        v.box_text(_X1 + c_id + c_mod + 12, yy, c_perm - 24, rh, " · ".join(sorted(perms)), size=13, style="r")
        yy += rh
    return v


def pg_portada():
    v = Virgen("")
    im = v.img
    from PIL import ImageDraw
    d = v.d
    d.rectangle([60, 60, W - 60, H - 60], outline=NEGRO, width=4)
    d.rectangle([90, 90, W - 90, H - 90], outline=GRIS_B, width=2)
    d.rectangle([_X1, 120, _X2, 420], fill=NEGRO)
    v.center_text(_X1, 120, _X2 - _X1, 300, "", size=1)
    # titulo
    d.text((W / 2, 150), "GESTOCK", font=v._font("b", 110), fill=(250, 244, 238), anchor="mm")
    d.text((W / 2, 300), "ARQUITECTURA  ·  CLIENTE <-> MID <-> API  ·  POSTGRESQL",
           font=v._font("b", 44), fill=(246, 170, 60), anchor="mm")
    y = 470
    items = [
        "34 DIAGRAMAS EN APAIZADO: 1 POR CONTROLADOR + TRANSVERSALES DE MID/ERRORES/BD",
        "CLIENTE  -  Angular 18 · interceptor + guards (Bearer, 401, permisos)",
        "MID      -  rateLimit -> validate (Zod) -> authenticate (JWT+sesion) -> authorize",
        "API      -  Express 5 · 18 controladores · ApiError + errorHandler",
        "DATOS    -  PostgreSQL Gestock_db · 18 tablas · multitenant empresa_id",
        "ERRORES  -  400/401/403/404/409/429/500 con code (ApiError | PG mapping)",
    ]
    for it in items:
        v.rect(_X1 + 60, y, _X2 - _X1 - 120, 46, fill=GRIS_PC, outline=NEGRO, lw=2)
        v.box_text(_X1 + 60, y, _X2 - _X1 - 120, 46, it, size=17, style="r")
        y += 58
    v.rect(_X1 + 60, y + 20, _X2 - _X1 - 120, 60, fill=ROJO_FONDO, outline=ROJO, lw=2)
    v.center_text(_X1 + 60, y + 20, _X2 - _X1 - 120, 60,
                  "El MID integra AMBOS lados: valida la peticion que ENTRA; la respuesta SALE directo del API al cliente.",
                  size=17, fill=(120, 28, 28), style="b")
    d.text((W / 2, H - 110), "Diagramas generados desde el codigo fuente real del proyecto",
           font=v._font("i", 24), fill=GRIS_B, anchor="mm")
    return v