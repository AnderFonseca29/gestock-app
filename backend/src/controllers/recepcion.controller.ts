import { Request, Response, NextFunction } from 'express';
import { recepcionRepo } from '../repositories/recepcion.repo';
import { ok, created, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';

export const recepcionController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const recepciones = await recepcionRepo.listar(req.empresaId ?? null);
      ok(res, recepciones);
    } catch (error) {
      next(error);
    }
  },

  async detalle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const recepcion = await recepcionRepo.buscarPorId(id, req.empresaId ?? null);
      if (!recepcion) throw ApiError.notFound('La recepción no existe.');
      ok(res, recepcion);
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('No autenticado.');
      const datos = req.body;
      const recepcion = await recepcionRepo.crear({
        numeroDocumento: datos.numero_documento,
        proveedor: datos.proveedor,
        bodegaId: datos.bodega_id ?? null,
        estado: datos.estado,
        observaciones: datos.observaciones,
        usuarioId: req.user.id,
        empresaId: req.empresaId ?? null,
      });

      await registrarAuditoria({
        usuarioId: req.user.id,
        accion: 'CREAR',
        modulo: 'RECEPCIÓN',
        entidad: 'recepciones',
        registroId: recepcion.id,
        descripcion: `Se registró la recepción ${datos.numero_documento} del proveedor ${datos.proveedor}.`,
      });

      created(res, recepcion, 'Recepción registrada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const recepcion = await recepcionRepo.buscarPorId(id, req.empresaId ?? null);
      if (!recepcion) throw ApiError.notFound('La recepción no existe.');

      const actualizada = await recepcionRepo.actualizar(id, {
        numeroDocumento: req.body.numero_documento,
        proveedor: req.body.proveedor,
        bodegaId: req.body.bodega_id,
        estado: req.body.estado,
        observaciones: req.body.observaciones,
      });

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ACTUALIZAR',
        modulo: 'RECEPCIÓN',
        entidad: 'recepciones',
        registroId: id,
        descripcion: `Se actualizó la recepción ${recepcion.numero_documento}.`,
      });

      ok(res, actualizada, 'Recepción actualizada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const recepcion = await recepcionRepo.buscarPorId(id, req.empresaId ?? null);
      if (!recepcion) throw ApiError.notFound('La recepción no existe.');

      await recepcionRepo.eliminar(id);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ELIMINAR',
        modulo: 'RECEPCIÓN',
        entidad: 'recepciones',
        registroId: id,
        descripcion: `Se eliminó la recepción ${recepcion.numero_documento}.`,
      });

      noContent(res, 'Recepción eliminada correctamente.');
    } catch (error) {
      next(error);
    }
  },
};