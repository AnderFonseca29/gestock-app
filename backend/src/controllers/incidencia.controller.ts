import { Request, Response, NextFunction } from 'express';
import { incidenciaRepo } from '../repositories/incidencia.repo';
import { ok, created, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';

export const incidenciaController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const incidencias = await incidenciaRepo.listar({
        estado: req.query.estado as string | undefined,
        prioridad: req.query.prioridad as string | undefined,
        empresaId: req.empresaId ?? null,
      });
      ok(res, incidencias);
    } catch (error) {
      next(error);
    }
  },

  async detalle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const incidencia = await incidenciaRepo.buscarPorId(id, req.empresaId ?? null);
      if (!incidencia) throw ApiError.notFound('La incidencia no existe.');
      ok(res, incidencia);
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('No autenticado.');
      const incidencia = await incidenciaRepo.crear({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        prioridad: req.body.prioridad,
        reportadoPor: req.user.id,
        empresaId: req.empresaId ?? null,
      });

      await registrarAuditoria({
        usuarioId: req.user.id,
        accion: 'CREAR',
        modulo: 'INCIDENCIAS',
        entidad: 'incidencias',
        registroId: incidencia.id,
        descripcion: `Se reportó la incidencia "${incidencia.titulo}".`,
      });

      created(res, incidencia, 'Incidencia registrada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const incidencia = await incidenciaRepo.buscarPorId(id, req.empresaId ?? null);
      if (!incidencia) throw ApiError.notFound('La incidencia no existe.');

      const actualizada = await incidenciaRepo.actualizar(id, {
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        prioridad: req.body.prioridad,
        estado: req.body.estado,
        resueltoPor: req.body.estado === 'Resuelto' ? req.user?.id : undefined,
      });
      if (!actualizada) throw ApiError.notFound('La incidencia no existe.');

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ACTUALIZAR',
        modulo: 'INCIDENCIAS',
        entidad: 'incidencias',
        registroId: id,
        descripcion: `Se actualizó la incidencia "${incidencia.titulo}" (estado: ${actualizada.estado}).`,
      });

      ok(res, actualizada, 'Incidencia actualizada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const incidencia = await incidenciaRepo.buscarPorId(id, req.empresaId ?? null);
      if (!incidencia) throw ApiError.notFound('La incidencia no existe.');

      await incidenciaRepo.eliminar(id);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ELIMINAR',
        modulo: 'INCIDENCIAS',
        entidad: 'incidencias',
        registroId: id,
        descripcion: `Se eliminó la incidencia "${incidencia.titulo}".`,
      });

      noContent(res, 'Incidencia eliminada correctamente.');
    } catch (error) {
      next(error);
    }
  },
};