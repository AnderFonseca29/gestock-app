import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';
import { ok } from '../utils/response';
import { productoRepo } from '../repositories/producto.repo';
import { movimientoRepo } from '../repositories/movimiento.repo';

export const dashboardController = {
  async resumen(req: Request, res: Response, next: NextFunction) {
    try {
      const empresaId = req.empresaId ?? null;
      const puedeAislar = empresaId != null;
      const usuariosFiltro = puedeAislar ? `WHERE u.estado = 'Activo' AND u.empresa_id = $1` : `WHERE u.estado = 'Activo'`;
      const usuariosParams: any[] = puedeAislar ? [empresaId] : [];
      const incidenciasFiltro = puedeAislar ? `WHERE i.empresa_id = $1 AND i.estado <> 'Resuelto'` : `WHERE i.estado <> 'Resuelto'`;
      const incidenciasParams: any[] = puedeAislar ? [empresaId] : [];
      const mantenimientosFiltro = puedeAislar ? `WHERE m.empresa_id = $1 AND m.estado NOT IN ('Completado','Cancelado')` : `WHERE m.estado NOT IN ('Completado','Cancelado')`;
      const mantenimientosParams: any[] = puedeAislar ? [empresaId] : [];
      const empresaActivaFiltro = puedeAislar ? `WHERE id = $1 AND estado = 'Activa'` : `WHERE estado = 'Activa'`;
      const empresaActivaParams: any[] = puedeAislar ? [empresaId] : [];

      const [productos, valor, stockBajo, usuarios, empresas, incidenciasPendientes, mantenimientos, auditorias] =
        await Promise.all([
          productoRepo.contar(empresaId),
          productoRepo.valorTotalInventario(empresaId),
          productoRepo.contarAlertasStock(empresaId),
          (async () => {
            const r = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM usuarios u ${usuariosFiltro}`, usuariosParams);
            return Number(r[0]?.total || 0);
          })(),
          (async () => {
            const r = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM empresas ${empresaActivaFiltro}`, empresaActivaParams);
            return Number(r[0]?.total || 0);
          })(),
          (async () => {
            const r = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM incidencias i ${incidenciasFiltro}`, incidenciasParams);
            return Number(r[0]?.total || 0);
          })(),
          (async () => {
            const r = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM mantenimientos m ${mantenimientosFiltro}`, mantenimientosParams);
            return Number(r[0]?.total || 0);
          })(),
          (async () => {
            const r = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM auditorias`);
            return Number(r[0]?.total || 0);
          })(),
        ]);

      const ultimosMovimientos = await movimientoRepo.listar({ empresaId });
      const totalesMovimientos = await movimientoRepo.totales(empresaId);
      const ultimosMovimientosRecientes = ultimosMovimientos.slice(0, 5);

      const productosStockBajo = await productoRepo.listarStockBajo(empresaId);

      const ultimasIncidenciasFiltro = puedeAislar ? `WHERE i.empresa_id = $1` : '';
      const ultimasIncidenciasParams: any[] = puedeAislar ? [empresaId] : [];
      const ultimasIncidencias = await query(
        `SELECT i.id, i.titulo, i.prioridad, i.estado, i.fecha, CONCAT(u.nombre, ' ', u.apellido) AS reportado_por_nombre
         FROM incidencias i
         LEFT JOIN usuarios u ON u.id = i.reportado_por
         ${ultimasIncidenciasFiltro}
         ORDER BY i.fecha DESC LIMIT 5`,
        ultimasIncidenciasParams
      );

      const ultimasAuditorias = await query(
        `SELECT id, usuario_nombre, accion, modulo, descripcion, fecha
         FROM auditorias ORDER BY fecha DESC LIMIT 5`
      );

      ok(res, {
        totalProductos: productos,
        valorTotalInventario: valor,
        alertasStock: stockBajo,
        totalUsuariosActivos: usuarios,
        totalEmpresasActivas: empresas,
        incidenciasPendientes,
        mantenimientosPendientes: mantenimientos,
        totalAuditorias: auditorias,
        ocurrencias: {
          totalEntradas: totalesMovimientos.totalEntradas,
          totalSalidas: totalesMovimientos.totalSalidas,
        },
        ultimosMovimientos: ultimosMovimientosRecientes,
        productosStockBajo,
        ultimasIncidencias,
        ultimasAuditorias,
      });
    } catch (error) {
      next(error);
    }
  },
};