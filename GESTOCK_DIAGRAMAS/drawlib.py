# -*- coding: utf-8 -*-
"""Biblioteca de dibujo apaisada estilo ejemplo (Pillow): grises, negro y acentos rojos."""
import math
import os
from PIL import Image, ImageDraw, ImageFont

W, H = 1600, 1200
_PAD = 40
_MARGEN = 60

_FONTS = r"C:\Windows\Fonts"
_FN = {
    "r": os.path.join(_FONTS, "arial.ttf"),
    "b": os.path.join(_FONTS, "arialbd.ttf"),
    "i": os.path.join(_FONTS, "ariali.ttf"),
}

# paleta inspirada en la imagen de ejemplo
BG = (255, 253, 250)
NEGRO = (24, 24, 24)
GRIS_T = (60, 60, 60)
GRIS_M = (112, 112, 112)
GRIS_B = (160, 160, 160)
GRIS_C = (208, 208, 208)
GRIS_PC = (232, 232, 230)
ROJO = (178, 34, 34)
ROJO_SUAVE = (216, 192, 192)
ROJO_FONDO = (240, 228, 228)
VERDE = (74, 120, 74)
dorado_fondo = (238, 232, 216)
azul_fondo = (222, 230, 238)


class Virgen:
    def __init__(self, titulo="", subtitulo=""):
        self.img = Image.new("RGB", (W, H), BG)
        self.d = ImageDraw.Draw(self.img)
        self.titulo = titulo
        self.subtitulo = subtitulo
        if titulo:
            self._marco(titulo, subtitulo)

    def _marco(self, titulo, subtitulo):
        d = self.d
        d.rectangle([_MARGEN, _MARGEN, W - _MARGEN, H - _MARGEN], outline=NEGRO, width=3)
        barra_h = 92
        d.rectangle([_MARGEN + 2, _MARGEN + 2, W - _MARGEN - 2, _MARGEN + 2 + barra_h],
                    fill=NEGRO)
        f = self._font("b", 34)
        fs = self._font("r", 22)
        marca = "GESTOCK  ·  ARQUITECTURA Y FLUJOS"
        d.text((_MARGEN + 18, _MARGEN + 16 - 4), titulo, font=f, fill=(255, 248, 242))
        ancho_t = d.textlength(titulo, font=f)
        ancho_m = d.textlength(marca, font=fs)
        if _MARGEN + 18 + ancho_t + 24 + ancho_m < W - _MARGEN - 20:
            d.text((_MARGEN + 18 + ancho_t + 24, _MARGEN + 24), marca, font=fs, fill=(208, 190, 178))
        if subtitulo:
            d.text((_MARGEN + 18, _MARGEN + 60), subtitulo, font=fs, fill=(214, 196, 184))
        return barra_h

    def _font(self, style, size):
        try:
            return ImageFont.truetype(_FN[style], size)
        except Exception:
            return ImageFont.load_default()

    def rect(self, x, y, w, h, fill=GRIS_PC, outline=NEGRO, lw=3, radio=0):
        if radio > 0:
            self.d.rounded_rectangle([x, y, x + w, y + h], radius=radio, fill=fill,
                                     outline=outline, width=lw)
        else:
            self.d.rectangle([x, y, x + w, y + h], fill=fill, outline=outline, width=lw)

    def diamond(self, cx, cy, w, h, fill=GRIS_PC, outline=NEGRO, lw=3):
        pts = [(cx, cy - h // 2), (cx + w // 2, cy), (cx, cy + h // 2), (cx - w // 2, cy)]
        self.d.polygon(pts, fill=fill, outline=outline)
        self.d.line([pts[-1], pts[0]], fill=outline, width=lw)

    def text_at(self, x, y, t, size=16, fill=GRIS_T, style="r"):
        self.d.text((x, y), t, font=self._font(style, size), fill=fill)

    def center_text(self, x, y, w, h, t, size=16, fill=NEGRO, style="b"):
        f = self._font(style, size)
        lw = self.d.textlength(t, font=f)
        asc, desc = f.getmetrics()
        th = asc + desc
        self.d.text((x + (w - lw) / 2, y + (h - th) / 2), t, font=f, fill=fill)

    def box_text(self, x, y, w, h, t, size=17, fill=NEGRO, style="b", m=8, line_h=None):
        """Texto multilinea con ajuste de fuente y ENVUELTO por palabras para caber en la caja
        (ninguna linea sale de los margenes horizontales de la caja)."""
        f = self._font(style, size)
        while size > 10:
            f = self._font(style, size)
            lineas = t.split("\n")
            ok = True
            for ln in lineas:
                if self.d.textlength(ln, font=f) > w - 2 * m:
                    size -= 1
                    ok = False
                    break
            if not ok:
                continue
            asc, desc = f.getmetrics()
            th = asc + desc
            if len(lineas) * (th + 2) > h - 2 * m:
                size -= 1
                continue
            break
        f = self._font(style, size)
        lh = (self.d.textlength("M", font=f)**0)  # noqa
        asc, desc = f.getmetrics()
        lh = asc + desc + 2
        lineas = t.split("\n")
        env = []
        for para in lineas:
            cur = ""
            for wd in para.split():
                trial = wd if not cur else cur + " " + wd
                if self.d.textlength(trial, font=f) <= w - 2 * m:
                    cur = trial
                else:
                    if cur:
                        env.append(cur)
                    cur = wd
            if cur:
                env.append(cur)
        lineas = env or [""]
        total = len(lineas) * lh
        yy = y + (h - total) / 2
        for ln in lineas:
            lw = self.d.textlength(ln, font=f)
            self.d.text((x + (w - lw) / 2, yy), ln, font=f, fill=fill)
            yy += lh

    def arrow_h(self, x1, y, x2, lw=4, color=NEGRO, bicolor=None):
        d = self.d
        d.line([x1, y, x2, y], fill=color, width=lw)
        a = 16
        d.polygon([(x2, y), (x2 - a, y - a // 2), (x2 - a, y + a // 2)], fill=color)
        if bicolor:
            mx = (x1 + x2) // 2
            d.line([x1, y, mx, y], fill=bicolor[0], width=lw)
            d.line([mx + 1, y, x2 - a, y], fill=bicolor[1], width=lw)
            d.polygon([(x2, y), (x2 - a, y - a // 2), (x2 - a, y + a // 2)], fill=bicolor[1])

    def arrow_v(self, x, y1, y2, lw=4, color=NEGRO):
        d = self.d
        d.line([x, y1, x, y2], fill=color, width=lw)
        a = 16
        if y2 >= y1:
            d.polygon([(x, y2), (x - a // 2, y2 - a), (x + a // 2, y2 - a)], fill=color)
        else:
            d.polygon([(x, y1), (x - a // 2, y1 + a), (x + a // 2, y1 + a)], fill=color)

    def arrow_elbow(self, xs, ys, xe, ye, lw=4, color=NEGRO):
        d = self.d
        mx = (xs + xe) // 2
        d.line([xs, ys, mx, ys], fill=color, width=lw)
        d.line([mx, ys, mx, ye], fill=color, width=lw)
        d.line([mx, ye, xe, ye], fill=color, width=lw)
        a = 14
        dirv = 1 if ye > ys else -1
        d.polygon([(xe, ye), (xe - a, ye - dirv * a // 2), (xe - a, ye + dirv * a // 2)], fill=color)

    def arrow_path(self, pts, lw=4, color=NEGRO):
        """Polilinea con punta de flecha orientada hacia el ultimo punto."""
        d = self.d
        for i in range(len(pts) - 1):
            d.line([pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]], fill=color, width=lw)
        (x1, y1), (x2, y2) = pts[-2], pts[-1]
        ang = math.atan2(y2 - y1, x2 - x1)
        a = 14
        p1 = (int(x2 - a * math.cos(ang - 0.6)), int(y2 - a * math.sin(ang - 0.6)))
        p2 = (int(x2 - a * math.cos(ang + 0.6)), int(y2 - a * math.sin(ang + 0.6)))
        d.polygon([(x2, y2), p1, p2], fill=color)

    def etiqueta(self, cx, cy, t, size=15, fill=NEGRO, style="b", mx=12):
        f = self._font(style, size)
        lw = self.d.textlength(t, font=f) + 2 * mx
        self.rect(cx - lw // 2, cy - 13, lw, 26, fill=BG, outline=NEGRO, lw=2)
        self.center_text(cx - lw // 2, cy - 13, lw, 26, t, size=size, style=style)

    def save(self, ruta):
        self.img.save(ruta, "PNG")