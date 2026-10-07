# -*- coding: utf-8 -*-
"""Paginas adicionales: ciclos de ida y vuelta, retorno sin MID, publicos sin MID,
pipeline app.ts, rutas frontend protegidas, mapa paginas->endpoints y errores en cliente."""
from drawlib import Virgen, W, H, NEGRO, GRIS_PC, GRIS_C, GRIS_B, ROJO, ROJO_FONDO, VERDE
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


def filas_tabla(v, y, cws, hdr, filas, rh, size=13):
    """Tabla decorativa para listas de filas (sin cabecera oscura)."""
    yy = y
    for i, fila in enumerate(filas):
        f = GRIS_PC if i % 2 == 0 else (248, 246, 242)
        x = _X1
        for j, cell in enumerate(fila):
            v.rect(x, yy, cws[j], rh, fill=f, outline=NEGRO, lw=2)
            v.box_text(x + 10, yy, cws[j] - 20, rh, cell, size=size, style="r")
            x += cws[j]
        yy += rh
    return yy


def pg_ciclo_completo():
    v = _page("CICLO COMPLETO DE UNA PETICION: IDA CON MID, VUELTA SIN MID",
              "El MID valida la peticion que ENTRA; la respuesta SALE directo del API al cliente")
    y0 = 174
    # ---- IDA ----
    _sec(v, _X1, y0, _X2 - _X1, "1) IDA (SOLICITUD) - EL MID INTEGRA AMBOS LADOS")
    cajas = [
        ("Pagina Angular", "componente llama\nservicio / api.service"),
        ("Interceptor (MID CLIENTE)", "agrega Authorization:\nBearer <jwt>"),
        ("express app", "app.use('/api', apiRateLimiter)\napp.use('/api', apiRoutes)"),
        ("Middleware (MID API)", "validate(Zod) -> authenticate\n(JWT+sesion) -> authorize"),
        ("Controller", "controlador + service,\nreglas de negocio"),
        ("Repository / SQL", "pg -> PostgreSQL\nGestock_db"),
    ]
    n = len(cajas)
    bh = 150
    gap = 26
    cw = (_X2 - _X1 - (n - 1) * gap) // n
    y = y0 + 40
    for i, (t, c) in enumerate(cajas):
        fill = ROJO_FONDO if i in (1, 3) else GRIS_PC
        _box(v, _X1 + i * (cw + gap), y, cw, bh, t, c, fill=fill, size_c=13, size_t=14)
        if i < n - 1:
            _arrow(v, _X1 + i * (cw + gap) + cw + 4, y + bh // 2, _X1 + (i + 1) * (cw + gap) - 4)
    y2 = y + bh + 16
    v.rect(_X1, y2, _X2 - _X1, 44, fill=ROJO_FONDO, outline=ROJO, lw=2)
    v.center_text(_X1, y2, _X2 - _X1, 44,
                  "El MID NO revalida nada en la vuelta: la respuesta no vuelve a pasar por authenticate/authorize/validate.",
                  size=16, fill=(120, 28, 28), style="b")
    # ---- VUELTA ----
    y3 = y2 + 44 + 20
    _sec(v, _X1, y3, _X2 - _X1, "2) VUELTA (RESPUESTA) - CRUD -> CLIENTE SIN VOLVER POR EL MID")
    vuelta = [
        ("PostgreSQL", "datos / resultado\ndel CRUD"),
        ("Repo / Service", "devuelve filas o\nobjeto"),
        ("response.ts", "ok()/created()/\nnoContent()"),
        ("HTTP 200/201", "JSON {success,\nmessage, data}"),
        ("Interceptor (solo reacciona)", "200 pasa directo;\nerror -> toast / 401 login"),
        ("Componente", "renderiza la vista\nsegun res.data"),
    ]
    n = len(vuelta)
    cw = (_X2 - _X1 - (n - 1) * gap) // n
    y = y3 + 40
    for i, (t, c) in enumerate(vuelta):
        fill = (222, 230, 238) if i < 4 else GRIS_PC
        _box(v, _X1 + i * (cw + gap), y, cw, bh, t, c, fill=fill, size_c=13)
        if i < n - 1:
            _arrow(v, _X1 + i * (cw + gap) + cw + 4, y + bh // 2, _X1 + (i + 1) * (cw + gap) - 4)
    return v


def pg_retorno_sin_mid():
    v = _page("RETORNO API -> CLIENTE SIN MID (CRUD DIRECTO)",
              "Solo los errores y el 401 reaccionan en el interceptor")
    y0 = 174
    _sec(v, _X1, y0, _X2 - _X1, "RESPUESTAS DE EXITO (2xx) - LLEGAN TAL CUAL")
    exito = [
        ("ok()", "200 {success:true,\nmessage, data}"),
        ("created()", "201 {success:true,\nmessage, data}"),
        ("noContent()", "200 {success:true,\nmessage, data:null}"),
    ]
    bh = 130
    gap = 40
    cw = (_X2 - _X1 - 2 * gap) // 3
    y = y0 + 40
    for i, (t, c) in enumerate(exito):
        _box(v, _X1 + i * (cw + gap), y, cw, bh, t, c, fill=(226, 236, 226), size_c=14)
    y2 = y + bh + 16
    v.rect(_X1, y2, _X2 - _X1, 44, fill=(226, 236, 226), outline=VERDE, lw=2)
    v.center_text(_X1, y2, _X2 - _X1, 44,
                  "Estas respuestas NO pasan por ninguna validacion del MID: llegan tal cual al componente.",
                  size=16, fill=(40, 90, 40), style="b")
    y3 = y2 + 44 + 24
    _sec(v, _X1, y3, _X2 - _X1, "RESPUESTAS DE ERROR (4xx/5xx) - CADA CODIGO SU PROPIA RAMA EN EL INTERCEPTOR")
    ret_err = [
        ("CLI 2xx", "¿Status 200/201 del API?", "Se devuelve res.data tal cual al componente; sin toast."),
        ("CLI 401", "¿Status 401 y la ruta NO es /auth/login?",
         "Se limpia localStorage, toast 'Tu sesion ha expirado' y se redirige a /auth/login."),
        ("CLI 403", "¿Status 403?", "Toast 'No tienes permiso para realizar esta accion'; la vista ya estaba oculta por guards."),
        ("CLI 400/404/409", "¿Status 400/404/409?", "Toast con error.message del backend."),
        ("CLI 429", "¿Status 429?", "Toast 'Demasiados intentos, intente mas tarde'."),
        ("CLI 500", "¿Status 500?", "Toast generico 'Ocurrio un error en el servidor' + log en consola."),
    ]
    grid_errores(v, y3 + 36 + 12, ret_err, bottom=1136)
    return v


def pg_publicos_sin_mid():
    v = _page("ENDPOINTS PUBLICOS: FLUJOS QUE NO REQUIEREN MID",
              "Login, recuperacion y documentacion acceden sin token (sin authenticate/authorize)")
    y0 = 174
    _sec(v, _X1, y0, _X2 - _X1, "RUTAS QUE RESPONDEN AL CLIENTE SIN PASAR POR AUTHENTICATE/AUTHORIZE")
    tabla = [
        ("GET /", "info de la app: version, docs, health"),
        ("GET /api/docs", "Swagger UI (swaggerUi.serve + setup)"),
        ("GET /api/health", "estado del servicio"),
        ("POST /api/auth/login", "validateBody(loginSchema) + loginEmailLimiter(5) + loginIpLimiter(60)"),
        ("POST /api/auth/recuperar", "recuperacionLimiter + validateBody(solicitarRecuperacionSchema)"),
        ("POST /api/auth/recuperar/validar", "validateBody(validarCodigoRecuperacionSchema)"),
        ("POST /api/auth/recuperar/restablecer", "validateBody(restablecerPasswordSchema)"),
    ]
    cws = [370, _X2 - _X1 - 370]
    yt = y0 + 40
    for j, h in enumerate(["Ruta", "Validacion / comportamiento"]):
        x = _X1 + (0 if j == 0 else cws[0])
        v.rect(x, yt, cws[j], 36, fill=GRIS_B, outline=NEGRO, lw=2)
        v.center_text(x, yt, cws[j], 36, h, size=15, fill=(250, 244, 238), style="b")
    filas_tabla(v, yt + 36, cws, None, [t for t in tabla], 52, size=14)

    y2 = yt + 36 + 7 * 52 + 30
    _sec(v, _X1, y2, _X2 - _X1, "FLUJO LOGIN SIN MID (solo validacion de forma y limites de intentos)")
    pasos = [
        ("Login.ts", "formulario ->\nauth.login(email,pass)"),
        ("POST /api/auth/login", "validateBody\n(Zod loginSchema)"),
        ("rate limits", "loginEmailLimiter(5)\nloginIpLimiter(60)\n429 RATE_LIMITED"),
        ("auth.controller\nlogin()", "bcrypt.compare +\nusuario Activo + rol"),
        ("Genera JWT", "firma token exp 8h\n+ crea sesion Activa"),
        ("Responde", "ok(200) {token,\nusuario, permisos}"),
    ]
    n = len(pasos)
    bh = 150
    gap = 26
    cw = (_X2 - _X1 - (n - 1) * gap) // n
    y = y2 + 40
    for i, (t, c) in enumerate(pasos):
        _box(v, _X1 + i * (cw + gap), y, cw, bh, t, c, fill=(ROJO_FONDO if i in (1, 2, 3) else (230, 238, 242)), size_c=12)
        if i < n - 1:
            _arrow(v, _X1 + i * (cw + gap) + cw + 4, y + bh // 2, _X1 + (i + 1) * (cw + gap) - 4)
    return v


def pg_pipeline_app():
    v = _page("CADENA DE MIDDLEWARE DE app.ts (PUNTO DE ENTRADA UNICO)",
              "Como se construye la aplicacion Express en backend/src/app.ts")
    y0 = 174
    cajas = [
        ("helmet()", "seguridad cabeceras\n+ disable x-powered-by"),
        ("cors()", "origins desde env.\nfrontendUrl + creds"),
        ("express.json/urlencoded", "limit 2mb\nbody parsing"),
        ("/api/docs", "swaggerUi.serve +\nswaggerUi.setup"),
        ("GET /", "info app: version,\ndocs, health"),
        ("/api (apiRoutes)", "apiRateLimiter(500)\n+ 18 routers"),
        ("404", "ruta no existe\ncode NOT_FOUND"),
        ("errorHandler", "normaliza errores\nApiError/DB"),
    ]
    n = len(cajas)
    bh = 150
    gap = 22
    cw = (_X2 - _X1 - (n - 1) * gap) // n
    y = y0 + 40
    for i, (t, c) in enumerate(cajas):
        fill = ROJO_FONDO if i in (5, 7) else (GRIS_PC if i < 5 else (236, 240, 232))
        _box(v, _X1 + i * (cw + gap), y, cw, bh, t, c, fill=fill, size_c=12, size_t=13)
        if i < n - 1:
            _arrow(v, _X1 + i * (cw + gap) + cw + 4, y + bh // 2, _X1 + (i + 1) * (cw + gap) - 4)
    y2 = y + bh + 34
    _sec(v, _X1, y2, _X2 - _X1, "DETALLE DE app.use('/api', apiRateLimiter, apiRoutes)")
    det = [
        ("apiRoutes (routes/index.ts)", "app.use('/api', apiRateLimiter, apiRoutes) · apiRoutes monta un router por controlador con prefijo /api"),
        ("Rate limit global", "apiRateLimiter: 500 peticiones / 15 min por IP -> 429 RATE_LIMITED"),
        ("Routers reales", "auth.routes.ts · usuario.routes.ts · rol.routes.ts · permiso.routes.ts · empresa.routes.ts · categoria.routes.ts · bodega.routes.ts · producto.routes.ts · movimiento.routes.ts · recepcion.routes.ts · auditoria.routes.ts · incidencia.routes.ts · mantenimiento.routes.ts · sesion.routes.ts · notificacion.routes.ts · configuracion.routes.ts · dashboard.routes.ts · reporte.routes.ts"),
    ]
    yt = y2 + 40
    cws = [300, _X2 - _X1 - 300]
    for j, h in enumerate(["Concepto", "Detalle"]):
        x = _X1 + (0 if j == 0 else cws[0])
        v.rect(x, yt, cws[j], 36, fill=GRIS_B, outline=NEGRO, lw=2)
        v.center_text(x, yt, cws[j], 36, h, size=15, fill=(250, 244, 238), style="b")
    filas_tabla(v, yt + 36, cws, None, [t for t in det], 92, size=13)
    return v


def pg_rutas_frontend():
    v = _page("RUTAS ANGULAR PROTEGIDAS POR GUARDS (MID CLIENTE)",
              "app.routes.ts: canActivate + data.permission / anyPermission")
    y0 = 174
    _sec(v, _X1, y0, _X2 - _X1, "RUTAS DEL FRONTEND CON SU GUARD Y PERMISO", size=19)
    rutas = [
        ("/ (pagina)", "sin guard", "publica · home / landing"),
        ("/auth/login", "sin guard", "publica · login"),
        ("/auth/recuperar-contrasena", "sin guard", "publica · recuperacion"),
        ("/auth/crear-usuario", "permissionGuard", "data.permission: usuarios.create"),
        ("/auth/sesiones-activas", "permissionGuard", "data.permission: sesiones.view"),
        ("/app/panel", "permissionGuard", "data.permission: dashboard.view"),
        ("/app/empresas", "permissionGuard", "data.permission: empresas.view"),
        ("/app/registrar-empresa", "permissionGuard", "data.permission: empresas.create"),
        ("/app/gestion/inventario/lista-productos", "permissionGuard", "data.permission: productos.view"),
        ("/app/gestion/inventario/registrar-productos", "permissionGuard", "data.permission: productos.create"),
        ("/app/gestion/inventario/bodegas", "permissionGuard", "data.permission: bodegas.view"),
        ("/app/gestion/inventario/categorias", "permissionGuard", "data.permission: categorias.view"),
        ("/app/recepcion/recepcion-mercancias", "permissionGuard", "data.anyPermission: [recepcion.view, recepcion.create]"),
        ("/app/recepcion/historial-logistico", "permissionGuard", "data.permission: historial.view"),
        ("/app/gestion/auditorias", "permissionGuard", "data.permission: auditoria.view"),
        ("/app/gestion/roles-yusuarios", "permissionGuard", "data.anyPermission: [usuarios.view, roles.view]"),
        ("/app/reportes", "permissionGuard", "data.permission: reportes.view"),
        ("/app/configuracion", "permissionGuard", "data.permission: configuracion.view"),
        ("/app/programacion", "permissionGuard", "data.anyPermission: [mantenimiento.view, mantenimiento.create]"),
        ("/app/incidencias", "permissionGuard", "data.anyPermission: [incidencias.view, incidencias.create]"),
    ]
    cws = [420, 250, _X2 - _X1 - 670]
    yt = y0 + 40
    for j, h in enumerate(["Ruta", "Guard", "Permiso requerido"]):
        x = _X1 + sum(cws[:j])
        v.rect(x, yt, cws[j], 36, fill=GRIS_B, outline=NEGRO, lw=2)
        v.center_text(x, yt, cws[j], 36, h, size=15, fill=(250, 244, 238), style="b")
    filas_tabla(v, yt + 36, cws, None, rutas, 36, size=12)
    return v


def pg_mapa_paginas():
    v = _page("MAPA: PAGINA FRONTEND -> ENDPOINTS QUE LLAMA (CON/SIN MID)",
              "Cada pagina Angular consulta su(s) recurso(s) via ApiService (11 llamadas directas listadas)")
    y0 = 174
    a = "Todas las llamadas pasan por apiInterceptor (Bearer + manejo de errores). Las rutas publicas "
    b = "(login, recuperacion) no tienen token: el interceptor no adjunta Authorization."
    v.rect(_X1, y0, _X2 - _X1, 60, fill=GRIS_PC, outline=NEGRO, lw=2)
    v.box_text(_X1, y0, _X2 - _X1, 60, a + b, size=15, style="i")
    mapa = [
        ("Login", "POST /api/auth/login", "publica (sin token)"),
        ("Recuperacion de contrasena", "POST /auth/recuperar · POST /auth/recuperar/validar · POST /auth/recuperar/restablecer", "publica (sin token)"),
        ("Crear usuario", "GET /roles/basicos · POST /usuarios", "MID (Bearer + permisos)"),
        ("Sesiones activas", "GET /sesiones · POST /sesiones/cerrar-otras · DELETE /sesiones/:id", "MID"),
        ("Panel", "GET /dashboard/resumen · GET /empresas", "MID"),
        ("Empresas", "GET /empresas · POST /empresas · POST /empresas/seleccionar", "MID"),
        ("Registrar empresa", "POST /empresas · POST /empresas/seleccionar", "MID"),
        ("Inventario", "GET/POST/PUT/PATCH/DELETE /productos · GET /productos/stock-bajo · GET /categorias · GET /bodegas", "MID"),
        ("Recepcion de mercancias", "GET/POST /productos, /bodegas, /movimientos y /recepciones", "MID"),
        ("Historial logistico", "GET /movimientos · GET /recepciones", "MID"),
        ("Auditorias", "GET /auditorias", "MID"),
        ("Roles y usuarios", "GET /usuarios · GET /roles · GET /roles/basicos · GET /permisos · PUT /roles/:id/permisos", "MID"),
        ("Configuracion", "GET /configuracion · PUT /configuracion · GET /sesiones", "MID"),
        ("Mantenimiento", "GET/POST/PUT/DELETE /mantenimientos", "MID"),
        ("Incidencias", "GET/POST/PUT/DELETE /incidencias", "MID"),
        ("Reportes", "GET /reportes/inventario · /movimientos · /stock · /auditorias · /incidencias", "MID"),
        ("Header", "GET /notificaciones · POST /notificaciones/leidas", "MID"),
    ]
    cws = [340, _X2 - _X1 - 340 - 240, 240]
    yt = y0 + 60 + 18
    for j, h in enumerate(["Pagina", "Endpoints llamados", "MID?"]):
        x = _X1 + sum(cws[:j])
        v.rect(x, yt, cws[j], 36, fill=GRIS_B, outline=NEGRO, lw=2)
        v.center_text(x, yt, cws[j], 36, h, size=15, fill=(250, 244, 238), style="b")
    yy = yt + 36
    for i, fila in enumerate(mapa):
        f = GRIS_PC if i % 2 == 0 else (248, 246, 242)
        fill_mid = ROJO_FONDO if fila[2] != "publica (sin token)" else (226, 236, 226)
        v.rect(_X1, yy, cws[0], 46, fill=f, outline=NEGRO, lw=2)
        v.rect(_X1 + cws[0], yy, cws[1], 46, fill=f, outline=NEGRO, lw=2)
        v.rect(_X1 + cws[0] + cws[1], yy, cws[2], 46, fill=fill_mid, outline=NEGRO, lw=2)
        v.box_text(_X1 + 10, yy, cws[0] - 20, 46, fila[0], size=13, style="b")
        v.box_text(_X1 + cws[0] + 10, yy, cws[1] - 20, 46, fila[1], size=13, style="r")
        v.center_text(_X1 + cws[0] + cws[1], yy, cws[2], 46, fila[2], size=11, style="r")
        yy += 46
    return v


def pg_errores_cliente():
    v = _page("MANEJO DE ERRORES EN EL CLIENTE (frontend)",
              "Que hace Angular cuando la API devuelve cada codigo · cada codigo su propia rama")
    y0 = 174
    _sec(v, _X1, y0, _X2 - _X1, "REACCION DEL INTERCEPTOR POR CADA CODIGO (api.interceptor.ts)",
         size=17, alto=32)
    cli = [
        ("CLI 2xx", "¿Status 200/201?", "Se devuelve res.data tal cual; el componente pinta la vista. Sin toast."),
        ("CLI 400", "¿Status 400 BAD_REQUEST?", "Toast con error.message (validacion Zod); se conservan los datos del formulario."),
        ("CLI 401", "¿Status 401 y ruta != /auth/login?",
         "Limpia localStorage (gestock_token, gestock_usuario_sesion), toast 'Tu sesion ha expirado' y redirige a /auth/login."),
        ("CLI 403", "¿Status 403?", "Toast 'No tienes permiso para realizar esta accion'; las opciones ya estaban ocultas por guards."),
        ("CLI 404", "¿Status 404?", "Toast con message; en listados se muestra estado vacio."),
        ("CLI 409", "¿Status 409?", "Toast con message (duplicado o violacion de FK)."),
        ("CLI 429", "¿Status 429?", "Toast 'Demasiados intentos, intente mas tarde' (login/recuperacion)."),
        ("CLI 500", "¿Status 500?", "Toast generico 'Ocurrio un error en el servidor'; se logea en consola."),
        ("CLI NET", "¿Sin conexion / timeout?", "Toast de error de red (timeouts configurados en api.service)."),
    ]
    grid_errores(v, y0 + 32 + 12, cli, bottom=1136)
    return v