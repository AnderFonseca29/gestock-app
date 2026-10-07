import { Request, Response, NextFunction } from 'express';
import { diagramaRepo } from '../repositories/diagrama.repo';
import { ok } from '../utils/response';
import { ApiError } from '../utils/ApiError';

export const diagramaController = {
  async listar(_req: Request, res: Response, next: NextFunction) {
    try {
      const diagramas = await diagramaRepo.listar();
      ok(res, diagramas);
    } catch (error) {
      next(error);
    }
  },

  async imagen(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw ApiError.notFound('El diagrama no existe.');
      }
      const diagrama = await diagramaRepo.obtenerPorId(id);
      if (!diagrama || (!diagrama.svg && !diagrama.imagen)) {
        throw ApiError.notFound('El diagrama no existe.');
      }
      if (diagrama.svg) {
        const cuerpo = Buffer.from(diagrama.svg, 'utf-8');
        res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
        res.setHeader('Content-Length', String(cuerpo.length));
        res.setHeader('Cache-Control', 'private, max-age=3600');
        return res.send(cuerpo);
      }
      res.setHeader('Content-Type', diagrama.content_type || 'image/png');
      res.setHeader('Content-Length', String(diagrama.imagen?.length ?? 0));
      res.setHeader('Cache-Control', 'private, max-age=3600');
      res.send(diagrama.imagen);
    } catch (error) {
      next(error);
    }
  },
};