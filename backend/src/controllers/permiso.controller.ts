import { Request, Response, NextFunction } from 'express';
import { permisoRepo } from '../repositories/permiso.repo';
import { ok } from '../utils/response';

export const permisoController = {
  async listar(_req: Request, res: Response, next: NextFunction) {
    try {
      const permisos = await permisoRepo.listar();
      const modulos = await permisoRepo.listarModulos();
      ok(res, { permisos, modulos });
    } catch (error) {
      next(error);
    }
  },

  async listarPorModulo(req: Request, res: Response, next: NextFunction) {
    try {
      const permisos = await permisoRepo.listarPorModulo(String(req.params.modulo));
      ok(res, permisos);
    } catch (error) {
      next(error);
    }
  },
};