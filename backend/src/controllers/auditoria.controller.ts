import { Request, Response, NextFunction } from 'express';
import { auditoriaRepo } from '../repositories/auditoria.repo';
import { ok } from '../utils/response';
import { ApiError } from '../utils/ApiError';

export const auditoriaController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const auditorias = await auditoriaRepo.listar({
        busqueda: req.query.busqueda as string | undefined,
        accion: req.query.accion as string | undefined,
        modulo: req.query.modulo as string | undefined,
      });
      const modulos = await auditoriaRepo.listarModulos();
      ok(res, { auditorias, modulos });
    } catch (error) {
      next(error);
    }
  },

  async detalle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const auditoria = await auditoriaRepo.buscarPorId(id);
      if (!auditoria) throw ApiError.notFound('El registro de auditoría no existe.');
      ok(res, auditoria);
    } catch (error) {
      next(error);
    }
  },
};