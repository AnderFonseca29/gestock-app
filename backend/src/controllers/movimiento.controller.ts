import { Request, Response, NextFunction } from 'express';
import { movimientoRepo } from '../repositories/movimiento.repo';
import { ok, created, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';

export const movimientoController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const movimientos = await movimientoRepo.listar({
        busqueda: req.query.busqueda as string | undefined,
        tipo: req.query.tipo as string | undefined,
        estado: req.query.estado as string | undefined,
        desde: req.query.desde as string | undefined,
        hasta: req.query.hasta as string | undefined,
        empresaId: req.empresaId ?? null,
      });
      ok(res, { movimientos, totales: await movimientoRepo.totales(req.empresaId ?? null) });
    } catch (error) {
      next(error);
    }
  },

  async detalle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const movimiento = await movimientoRepo.buscarPorId(id, req.empresaId ?? null);
      if (!movimiento) throw ApiError.notFound('El movimiento no existe.');
      ok(res, movimiento);
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const { productoId, bodegaId, tipo, cantidad, motivo, responsable, observaciones, estado } = req.body;
      const movimiento = await movimientoRepo.crear({
        productoId: productoId ?? null,
        bodegaId: bodegaId ?? null,
        tipo,
        cantidad,
        motivo,
        responsable,
        observaciones,
        estado,
        usuarioId: req.user?.id ?? null,
        empresaId: req.empresaId ?? null,
      });

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'CREAR',
        modulo: 'INVENTARIO',
        entidad: 'movimientos_inventario',
        registroId: movimiento.id,
        descripcion: `Se registró un movimiento de ${tipo} por ${cantidad} unidades.`,
      });

      created(res, movimiento, 'Movimiento registrado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const movimiento = await movimientoRepo.buscarPorId(id, req.empresaId ?? null);
      if (!movimiento) throw ApiError.notFound('El movimiento no existe.');

      await movimientoRepo.eliminar(id);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ELIMINAR',
        modulo: 'INVENTARIO',
        entidad: 'movimientos_inventario',
        registroId: id,
        descripcion: 'Se eliminó un movimiento de inventario.',
      });

      noContent(res, 'Movimiento eliminado correctamente.');
    } catch (error) {
      next(error);
    }
  },
};