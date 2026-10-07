import { Request, Response, NextFunction } from 'express';
import { mantenimientoRepo } from '../repositories/mantenimiento.repo';
import { ok, created, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';

export const mantenimientoController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const mantenimientos = await mantenimientoRepo.listar(req.empresaId ?? null);
      ok(res, mantenimientos);
    } catch (error) {
      next(error);
    }
  },

  async detalle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const mantenimiento = await mantenimientoRepo.buscarPorId(id, req.empresaId ?? null);
      if (!mantenimiento) throw ApiError.notFound('El mantenimiento no existe.');
      ok(res, mantenimiento);
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const mantenimiento = await mantenimientoRepo.crear({
        equipo: req.body.equipo,
        tipo: req.body.tipo,
        fechaProgramada: req.body.fecha_programada,
        descripcion: req.body.descripcion,
        usuarioId: req.user?.id,
        empresaId: req.empresaId ?? null,
      });

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'CREAR',
        modulo: 'MANTENIMIENTO',
        entidad: 'mantenimientos',
        registroId: mantenimiento.id,
        descripcion: `Se programó el mantenimiento ${req.body.tipo} para ${req.body.equipo}.`,
      });

      created(res, mantenimiento, 'Mantenimiento programado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const mantenimiento = await mantenimientoRepo.buscarPorId(id, req.empresaId ?? null);
      if (!mantenimiento) throw ApiError.notFound('El mantenimiento no existe.');

      const actualizado = await mantenimientoRepo.actualizar(id, {
        equipo: req.body.equipo,
        tipo: req.body.tipo,
        fechaProgramada: req.body.fecha_programada,
        descripcion: req.body.descripcion,
        estado: req.body.estado,
      });

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ACTUALIZAR',
        modulo: 'MANTENIMIENTO',
        entidad: 'mantenimientos',
        registroId: id,
        descripcion: `Se actualizó el mantenimiento de ${mantenimiento.equipo}.`,
      });

      ok(res, actualizado, 'Mantenimiento actualizado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const mantenimiento = await mantenimientoRepo.buscarPorId(id, req.empresaId ?? null);
      if (!mantenimiento) throw ApiError.notFound('El mantenimiento no existe.');

      await mantenimientoRepo.eliminar(id);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ELIMINAR',
        modulo: 'MANTENIMIENTO',
        entidad: 'mantenimientos',
        registroId: id,
        descripcion: `Se eliminó el mantenimiento de ${mantenimiento.equipo}.`,
      });

      noContent(res, 'Mantenimiento eliminado correctamente.');
    } catch (error) {
      next(error);
    }
  },
};