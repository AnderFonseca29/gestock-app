# -*- coding: utf-8 -*-
"""GESTOCK - Generador de diagramas apaisados (Pillow).
Incluye pagina por controlador (CLIENTE->MID->API) + paginas transversales + PDF."""
import os
import re
import unicodedata
from drawlib import (Virgen, W, H, NEGRO, GRIS_PC, GRIS_B, GRIS_M, ROJO, ROJO_FONDO)

CARPETA = "GESTOCK_DIAGRAMAS"
PDF = "GESTOCK_Diagramas_Arquitectura_CLIENTE_MID_API.pdf"

_X1, _X2 = 60, W - 60

MI = {  # milenrama de seguridad entre apps
    "cliente": ("Interceptor", "Guards", "Autoriza a la vista"),
    "api": ("validate", "authenticate", "authorize"),
}


def strip_tildes(t):
    return "".join(c for c in unicodedata.normalize("NFD", t) if unicodedata.category(c) != "Mn")


def strip_txt(t):
    return strip_tildes(re.sub(r"[\n\t]+", " ", t))


def strip_caps(t):
    return strip_tildes(t).upper()


def seccion(v, x, y, w, txt, size=19, alto=36):
    """Banda de titulo negra (secction header)."""
    v.rect(x, y, w, alto, fill=NEGRO, outline=NEGRO, lw=2)
    v.center_text(x, y, w, alto, strip_txt(txt), size=size, fill=(250, 244, 238), style="b")


def rama_error(v, x, y, w, h, pregunta, code, message, ps=10, ms=10):
    """UNA rama de error independiente: diamante (pregunta) -> FALLA -> caja (code+message)
    -> pie que baja a errorHandler. Cada error es su propio bloque, NUNCA se agrupan."""
    dh = h - 18
    d_w = max(84, min(int(w * 0.28), 170))
    dx = x + 6
    cx = dx + d_w // 2
    cy = y + dh // 2
    v.diamond(cx, cy, d_w, dh - 2, fill=GRIS_PC, outline=NEGRO, lw=3)
    v.box_text(dx + 5, y + 5, d_w - 10, dh - 12, strip_txt(pregunta), size=ps, style="b")
    bx = dx + d_w + 18
    bw = x + w - 6 - bx
    v.arrow_h(dx + d_w + 2, cy, bx - 4, lw=3)
    v.text_at(bx - 22, cy - 22, "FALLA", size=9, style="b", fill=ROJO)
    v.rect(bx, y + 2, bw, dh, fill=ROJO_FONDO, outline=ROJO, lw=2)
    v.rect(bx, y + 2, bw, 20, fill=ROJO, outline=ROJO, lw=1)
    v.center_text(bx, y + 2, bw, 20, strip_txt(code), size=10, fill=(250, 244, 238), style="b")
    v.box_text(bx + 7, y + 26, bw - 14, dh - 30, strip_txt(message), size=ms, style="r",
               fill=(120, 28, 28), m=4)
    v.center_text(x, y + h - 15, w, 13, "v errorHandler -> {success:false, message, code}",
                  size=8, fill=GRIS_M, style="i")


def grid_errores(v, y0, ramas, bottom=1138, gapx=26, gapy=16, ncols=0):
    """Retcula de ramas de error individuales. Cada entrada: (code, pregunta, message).
    Devuelve la y final de la retcula."""
    n = len(ramas)
    if n == 0:
        return y0
    cols = ncols or (3 if n <= 9 else 4)
    rows = (n + cols - 1) // cols
    while rows > 4 and cols < 5:
        cols += 1
        rows = (n + cols - 1) // cols
    cols = max(1, min(5, cols))
    rows = (n + cols - 1) // cols
    usable = _X2 - _X1
    cw = (usable - (cols - 1) * gapx) // cols
    aval = (bottom - y0) - (rows - 1) * gapy
    ch = max(62, min(300, aval // rows))
    if ch >= 140:
        ps, ms = 12, 12
    elif ch >= 100:
        ps, ms = 11, 11
    else:
        ps, ms = 10, 10
    for i, rama in enumerate(ramas):
        r, c = divmod(i, cols)
        x = _X1 + c * (cw + gapx)
        yy = y0 + r * (ch + gapy)
        rama_error(v, x, yy, cw, ch, rama[1], rama[0], rama[2], ps=ps, ms=ms)
    return y0 + rows * (ch + gapy) - gapy


def save(v, nombre):
    ruta = os.path.join(CARPETA, nombre)
    v.save(ruta)
    print("  OK:", ruta)


def titulo_pagina(titulo, subtitulo=""):
    return Virgen(titulo, subtitulo)