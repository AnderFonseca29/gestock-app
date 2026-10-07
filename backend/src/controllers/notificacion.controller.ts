import { Request, Response, NextFunction } from 'express';
import { notificacionRepo } from '../repositories/notificacion.repo';
import { ok, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';

export const notificacionController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('No autenticado.');
      const notificaciones = await notificacionRepo.listarPorUsuario(req.user.id);
      const sinLeer = await notificacionRepo.contarNoLeidas(req.user.id);
      ok(res, { notificaciones, sinLeer });
    } catch (error) {
      next(error);
    }
  },

  async marcarLeida(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await notificacionRepo.marcarLeida(id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  },

  async marcarTodasLeidas(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('No autenticado.');
      await notificacionRepo.marcarTodasLeidas(req.user.id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  },
};