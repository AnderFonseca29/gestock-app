import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { ok } from '../utils/response';

export const reporteController = {
  async inventario(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = req.empresaId ?? null;
      const filtro = empresaId != null ? `AND c.empresa_id = $1` : '';
      const params: any[] = empresaId != null ? [empresaId] : [];
      const datos = await query(
        `SELECT
           c.nombre AS categoria,
           COUNT(p.id) AS cantidad,
           COALESCE(SUM(p.precio * p.stock), 0) AS valor
         FROM categorias c
         LEFT JOIN productos p ON p.categoria_id = c.id AND p.estado = 'Activo'
         WHERE c.empresa_id IS NOT NULL
         ${filtro}
         GROUP BY c.nombre
         ORDER BY valor DESC`,
        params
      );
      ok(res, datos);
    } catch (error) {
      next(error);
    }
  },

  async movimientos(req: Request, res: Response, next: NextFunction) {
    try {
      const desde = (req.query.desde as string) || undefined;
      const hasta = (req.query.hasta as string) || undefined;
      const empresaId = req.empresaId ?? null;
      const params: any[] = [];
      const condiciones: string[] = [];
      if (empresaId != null) {
        params.push(empresaId);
        condiciones.push(`m.empresa_id = $${params.length}`);
      }
      if (desde && hasta) {
        params.push(desde, hasta);
        condiciones.push(`m.fecha::date BETWEEN $${params.length - 1} AND $${params.length}`);
      }

      const filtro = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

      const filas = await query(
        `SELECT
           DATE(m.fecha) AS fecha,
           m.tipo,
           COUNT(*) AS total,
           COALESCE(SUM(m.cantidad), 0) AS cantidad
         FROM movimientos_inventario m
         ${filtro}
         GROUP BY DATE(m.fecha), m.tipo
         ORDER BY fecha ASC`,
        params
      );
      ok(res, filas);
    } catch (error) {
      next(error);
    }
  },

  async stock(req: Request, res: Response, next: NextFunction) {
    try {
      const filtroBodega = req.query.bodegaId ? Number(req.query.bodegaId) : undefined;
      const empresaId = req.empresaId ?? null;
      const params: any[] = [];
      const condiciones: string[] = [];
      if (filtroBodega) {
        params.push(filtroBodega);
        condiciones.push(`b.id = $${params.length}`);
      }
      if (empresaId != null) {
        params.push(empresaId);
        condiciones.push(`p.empresa_id = $${params.length}`);
      }
      const filtro = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
      const filas = await query(
        `SELECT
           p.codigo, p.nombre, p.stock, p.stock_min, p.estado,
           c.nombre AS categoria, b.nombre AS bodega
         FROM productos p
         LEFT JOIN categorias c ON c.id = p.categoria_id
         LEFT JOIN bodegas b ON b.id = p.bodega_id
         ${filtro}
         ORDER BY p.nombre`,
        params
      );
      ok(res, filas);
    } catch (error) {
      next(error);
    }
  },

  async auditorias(req: Request, res: Response, next: NextFunction) {
    try {
      const desde = (req.query.desde as string) || undefined;
      const hasta = (req.query.hasta as string) || undefined;
      const accion = (req.query.accion as string) || undefined;
      const params: any[] = [];
      const condiciones: string[] = [];
      if (desde) { params.push(desde); condiciones.push(`a.fecha::date >= $${params.length}`); }
      if (hasta) { params.push(hasta); condiciones.push(`a.fecha::date <= $${params.length}`); }
      if (accion && accion !== 'TODOS') { params.push(accion); condiciones.push(`a.accion = $${params.length}`); }
      const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

      const filas = await query(
        `SELECT a.accion, a.modulo, COUNT(*) AS total
         FROM auditorias a
         ${where}
         GROUP BY a.accion, a.modulo
         ORDER BY total DESC`,
        params
      );
      ok(res, filas);
    } catch (error) {
      next(error);
    }
  },

  async incidencias(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = req.empresaId ?? null;
      const filtro = empresaId != null ? `WHERE i.empresa_id = $1` : '';
      const params: any[] = empresaId != null ? [empresaId] : [];
      const filas = await query(
        `SELECT i.prioridad, i.estado, COUNT(*) AS total
         FROM incidencias i
         ${filtro}
         GROUP BY i.prioridad, i.estado`,
        params
      );
      ok(res, filas);
    } catch (error) {
      next(error);
    }
  },
};