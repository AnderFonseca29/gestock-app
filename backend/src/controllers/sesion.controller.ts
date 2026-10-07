import { Request, Response, NextFunction } from 'express';
import { sesionRepo } from '../repositories/sesion.repo';
import { ok } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';

export const sesionController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const misSesiones = req.query.mias === 'true';
      const sesiones = misSesiones ? await sesionRepo.listarActivas(req.user?.id) : await sesionRepo.listar(req.empresaId ?? null);
      ok(res, sesiones);
    } catch (error) {
      next(error);
    }
  },

  async cerrarOtras(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.sesionId) throw ApiError.unauthorized('No se pudo identificar la sesión actual.');

      await sesionRepo.cerrarOtras(req.user.id, req.user.sesionId);

      await registrarAuditoria({
        usuarioId: req.user.id,
        accion: 'AUTORIZAR',
        modulo: 'SESIONES',
        entidad: 'sesiones',
        registroId: req.user.id,
        descripcion: 'Se cerraron todas las sesiones de este usuario, excepto la actual.',
      });

      ok(res, null, 'Se cerraron las demás sesiones activas.');
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const sesion = await sesionRepo.buscarPorId(id);
      if (!sesion) throw ApiError.notFound('La sesión no existe.');
      if (req.user?.sesionId === id) throw ApiError.forbidden('No puedes cerrar la sesión actual desde aquí.');

      await sesionRepo.cerrar(id);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ELIMINAR',
        modulo: 'SESIONES',
        entidad: 'sesiones',
        registroId: id,
        descripcion: 'Se cerró una sesión activa.',
      });

      ok(res, null, 'Sesión cerrada correctamente.');
    } catch (error) {
      next(error);
    }
  },
};