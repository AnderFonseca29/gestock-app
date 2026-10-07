# -*- coding: utf-8 -*-
"""Pagina individual por controlador: CLIENTE -> MID -> API -> BASE DE DATOS + rutas + datos + RAMAS."""
from drawlib import Virgen, W, H, NEGRO, GRIS_PC, GRIS_C, GRIS_B, ROJO, ROJO_FONDO, VERDE
from gen_common import strip_txt, seccion, grid_errores

_X1, _X2 = 60, W - 60


def _marco_pagina(titulo, subtitulo=""):
    return Virgen(titulo, subtitulo)


def _col(v, x, y, w, h, nombre, fill, cuerpo):
    v.rect(x, y, w, h, fill=fill, outline=NEGRO, lw=3)
    v.rect(x, y, w, 36, fill=NEGRO, outline=NEGRO, lw=2)
    v.center_text(x, y, w, 36, nombre, size=17, fill=(250, 244, 238), style="b")
    v.box_text(x + 12, y + 44, w - 24, h - 52, cuerpo, size=12, style="r")


def _primer_permiso(c):
    for (_m, _r, _p) in c["coleccion"]:
        if "authorizePermission(" in _p or "authorizeAnyPermission(" in _p:
            for token in (_p.replace("authorizePermission(", " ")
                             .replace("authorizeAnyPermission(", " ")
                             .replace(")", " ").replace("'", " ").split()):
                if "." in token:
                    return token
    return ""


def _ramas_controlador(c):
    if c["id"] == "auth":
        return list(c["ramas"])
    permiso = _primer_permiso(c) or "modulo.accion"
    base = [
        ("429 RATE_LIMITED", "¿apiRateLimiter superado (500/15min)?",
         "Demasiadas solicitudes. Espera unos minutos e intenta de nuevo."),
        ("400 BAD_REQUEST", "¿Body/Params/Query cumplen el schema Zod?",
         "Los datos enviados no son validos."),
        ("401 UNAUTHORIZED", "¿Se envio 'Authorization: Bearer <token>'?",
         "No se proporciono un token de acceso."),
        ("401 UNAUTHORIZED", "¿El token JWT es valido y sin expirar?",
         "El token de acceso no es valido."),
        ("401 UNAUTHORIZED", "¿La sesion sigue activa en BD?",
         "Tu sesion fue cerrada o expiro. Inicia sesion nuevamente."),
        ("403 FORBIDDEN", "¿El rol tiene el permiso '%s'?" % permiso,
         "No tienes permisos para realizar esta accion."),
    ]
    ramas = base + list(c["ramas"])
    if not any(r[0].startswith("500") for r in ramas):
        ramas.append(("500 INTERNAL_ERROR", "¿Fallo inesperado en service/SQL?",
                      "Error interno del servidor."))
    return ramas


def pg_controlador(c):
    mod = c["modulo"]
    tit = "CLIENTE -> MID -> API -> BASE DE DATOS · " + mod.upper()
    sub = strip_txt(c["titulo"]) + "  ·  " + strip_txt(c["desc"])[:118]
    v = _marco_pagina(tit, sub)

    # ---- 1. Cuatro columnas CLIENTE / MID / API / BASE DE DATOS ----
    y0 = 170
    hcol = 128
    gap = 26
    cw = (_X2 - _X1 - 3 * gap) // 4
    xx = [_X1 + i * (cw + gap) for i in range(4)]
    _col(v, xx[0], y0, cw, hcol, "CLIENTE", (230, 238, 242),
         "Angular 18\ncomponente -> servicio\napi.service.ts\nInterceptor Bearer + 401\nGuards permission/role/home")
    _col(v, xx[1], y0, cw, hcol, "MID", ROJO_FONDO,
         "[Cliente] Interceptor + Guards\n[API] rateLimit -> validate\nauthenticate (JWT+sesion)\nauthorize (permisos)\n\nLa vuelta NO repasa el MID")
    _col(v, xx[2], y0, cw, hcol, "API", (236, 240, 232),
         "Express 5 + TypeScript\n" + c["id"] + ".routes.ts\n" + c["id"]
         + ".controller.ts\n" + c["id"] + ".service.ts\n" + c["id"] + ".repo.ts")
    _col(v, xx[3], y0, cw, hcol, "BASE DE DATOS", (230, 238, 242),
         "PostgreSQL\nGestock_db\n" + c["tablas"] + "\nmultitenant: empresa_id")
    midY = y0 + hcol // 2
    lbl_y = y0 + 22
    for i in range(3):
        v.arrow_h(xx[i] + cw + 6, midY, xx[i + 1] - 6, lw=4)
    v.etiqueta((xx[0] + cw + xx[1]) // 2, lbl_y, "Bearer <jwt>", size=13)
    v.etiqueta((xx[1] + cw + xx[2]) // 2, lbl_y, "HTTP / JSON", size=13)
    v.etiqueta((xx[2] + cw + xx[3]) // 2, lbl_y, "SQL", size=13)

    # ---- Vuelta verde: API -> CLIENTE por debajo, sin repasar el MID ----
    lane = y0 + hcol + 14
    ax = xx[2] + cw // 2
    bx = xx[0] + cw // 2
    v.arrow_path([(ax, y0 + hcol), (ax, lane), (bx, lane), (bx, y0 + hcol)], lw=3, color=VERDE)
    v.etiqueta(((ax + bx) // 2), lane, "RESPUESTA ok/created/noContent -> CLIENTE (sin MID)", size=12)

    # ---- 2. Tabla de rutas ----
    yt = y0 + hcol + 40
    seccion(v, _X1, yt, _X2 - _X1, "RUTAS, PERMISOS Y MIDDLEWARE (reales)", size=17, alto=30)
    rows = c["coleccion"]
    yhead = yt + 30 + 9
    hdr_h = 28
    rh = 22
    col_met = 150
    col_rut = 470
    col_per = _X2 - _X1 - col_met - col_rut
    for i, (x, tw, t) in enumerate([(_X1, col_met, "Metodo"),
                                    (_X1 + col_met, col_rut, "Ruta"),
                                    (_X1 + col_met + col_rut, col_per, "Permiso / Middleware")]):
        v.rect(x, yhead, tw, hdr_h, fill=GRIS_B, outline=NEGRO, lw=2)
        v.center_text(x, yhead, tw, hdr_h, t, size=14, fill=(250, 244, 238), style="b")
    yy = yhead + hdr_h
    for idx, (met, rut, perm) in enumerate(rows):
        fill_ = GRIS_PC if idx % 2 == 0 else (248, 246, 242)
        v.rect(_X1, yy, col_met, rh, fill=fill_, outline=NEGRO, lw=2)
        v.rect(_X1 + col_met, yy, col_rut, rh, fill=fill_, outline=NEGRO, lw=2)
        v.rect(_X1 + col_met + col_rut, yy, col_per, rh, fill=fill_, outline=NEGRO, lw=2)
        v.center_text(_X1, yy, col_met, rh, met, size=12, style="b")
        v.center_text(_X1 + col_met, yy, col_rut, rh, rut, size=12, style="r")
        v.center_text(_X1 + col_met + col_rut, yy, col_per, rh, strip_txt(perm), size=12, style="r")
        yy += rh

    # ---- 3. Capa de datos ----
    yd = yy + 10
    seccion(v, _X1, yd, _X2 - _X1, "CAPA DE DATOS: ROUTER -> CONTROLLER -> SERVICE/REPO -> POSTGRESQL",
            size=15, alto=30)
    yb = yd + 30 + 8
    bh = 38
    bw = 340
    gap2 = 30
    total = 4 * bw + 3 * gap2
    x0 = _X1 + ((_X2 - _X1) - total) // 2
    names = ["Router", "Controller", "Service / Repo", "PostgreSQL"]
    bodies = [c["id"] + ".routes.ts", c["id"] + ".controller.ts", c["id"] + ".repo.ts",
              c["tablas"].split("·")[0].strip()]
    for i in range(4):
        bx = x0 + i * (bw + gap2)
        v.rect(bx, yb, bw, bh, fill=GRIS_C, outline=NEGRO, lw=2)
        v.rect(bx, yb, bw, 26, fill=NEGRO, outline=NEGRO, lw=1)
        v.center_text(bx, yb, bw, 26, names[i], size=14, fill=(250, 244, 238), style="b")
        v.box_text(bx + 8, yb + 28, bw - 16, bh - 30, bodies[i], size=11, style="r")
        if i < 3:
            v.arrow_h(bx + bw + 4, yb + bh // 2, bx + bw + gap2 - 4, lw=4)

    # ---- 4. RAMAS DE ERROR (cada error es su propia rama -> errorHandler) ----
    ye = yb + bh + 12
    seccion(v, _X1, ye, _X2 - _X1,
            "ERRORES: UNA RAMA INDEPENDIENTE POR CADA FALLA (diamante -> falla -> errorHandler)",
            size=15, alto=30)
    ygrid = ye + 30 + 8
    grid_errores(v, ygrid, _ramas_controlador(c), bottom=1136)
    return v