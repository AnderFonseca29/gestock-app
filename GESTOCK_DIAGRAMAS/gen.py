# -*- coding: utf-8 -*-
"""Ensamblado: 34 PNG apaisados + PDF unico."""
import os
from PIL import Image
from drawlib import W, H
from gen_common import save, CARPETA, PDF
from datos import CONTROLADORES
import gen_trans
import gen_ctrl
import gen_extra

PAGS = []


def add(v, nombre):
    save(v, nombre)
    PAGS.append(os.path.join(CARPETA, nombre))


def main():
    os.makedirs(CARPETA, exist_ok=True)

    # 01 portada
    add(gen_trans.pg_portada(), "01_Portada.png")

    # transversales 02-09
    add(gen_trans.pg_arquitectura(), "02_Arquitectura_General.png")
    add(gen_trans.pg_mid_detalle(), "03_MID_Detalle.png")
    add(gen_trans.pg_autenticacion(), "04_Autenticacion_Sesion.png")
    add(gen_trans.pg_rbac(), "05_RBAC_Roles_Permisos.png")
    add(gen_trans.pg_crud(), "06_Patron_CRUD.png")
    add(gen_trans.pg_errores(), "07_Errores_Backend.png")
    add(gen_trans.pg_bd(), "08_Base_Datos.png")
    add(gen_trans.pg_matriz(), "09_Matriz_Trazabilidad.png")

    # 18 controladores 10-27
    orden = [c["id"] for c in CONTROLADORES]
    for i, c in enumerate(CONTROLADORES, start=10):
        nombre = ("%02d_Controlador_%s.png" % (i, c["id"].capitalize()))
        v = gen_ctrl.pg_controlador(c)
        add(v, nombre)

    # extras 28-34
    add(gen_extra.pg_ciclo_completo(), "28_Ciclo_Completo_Ida_Vuelta.png")
    add(gen_extra.pg_retorno_sin_mid(), "29_Retorno_Sin_MID.png")
    add(gen_extra.pg_publicos_sin_mid(), "30_Publicos_Sin_MID.png")
    add(gen_extra.pg_pipeline_app(), "31_Pipeline_app_ts.png")
    add(gen_extra.pg_rutas_frontend(), "32_Rutas_Frontend_Protegidas.png")
    add(gen_extra.pg_mapa_paginas(), "33_Mapa_Paginas_Endpoints.png")
    add(gen_extra.pg_errores_cliente(), "34_Errores_Cliente.png")

    # PDF
    imgs = [Image.open(p) for p in PAGS]
    pdf_path = PDF
    imgs[0].save(pdf_path, "PDF", resolution=150.0, save_all=True, append_images=imgs[1:])
    print("PDF:", pdf_path, os.path.getsize(pdf_path), "bytes ·", len(imgs), "paginas")


if __name__ == "__main__":
    main()