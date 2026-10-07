import { Request, Response, NextFunction } from 'express';
import { categoriaRepo } from '../repositories/categoria.repo';
import { ok, created, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';

export const categoriaController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const categorias = await categoriaRepo.listar(req.empresaId ?? null);
      ok(res, categorias);
    } catch (error) {
      next(error);
    }
  },

  async detalle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const categoria = await categoriaRepo.buscarPorId(id, req.empresaId ?? null);
      if (!categoria) throw ApiError.notFound('La categoría no existe.');
      ok(res, categoria);
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const { nombre, descripcion } = req.body;
      const empresaId = req.empresaId ?? null;
      const existe = await categoriaRepo.buscarPorNombre(nombre, empresaId);
      if (existe) throw ApiError.conflict('Ya existe una categoría con ese nombre.');

      const categoria = await categoriaRepo.crear(nombre, descripcion, empresaId);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'CREAR',
        modulo: 'CATEGORÍAS',
        entidad: 'categorias',
        registroId: categoria.id,
        descripcion: `Se creó la categoría ${categoria.nombre}.`,
      });

      created(res, categoria, 'Categoría creada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const categoria = await categoriaRepo.buscarPorId(id, req.empresaId ?? null);
      if (!categoria) throw ApiError.notFound('La categoría no existe.');

      const actualizada = await categoriaRepo.actualizar(id, req.body);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ACTUALIZAR',
        modulo: 'CATEGORÍAS',
        entidad: 'categorias',
        registroId: id,
        descripcion: `Se actualizó la categoría ${categoria.nombre}.`,
      });

      ok(res, actualizada, 'Categoría actualizada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const categoria = await categoriaRepo.buscarPorId(id, req.empresaId ?? null);
      if (!categoria) throw ApiError.notFound('La categoría no existe.');

      await categoriaRepo.eliminar(id);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ELIMINAR',
        modulo: 'CATEGORÍAS',
        entidad: 'categorias',
        registroId: id,
        descripcion: `Se eliminó la categoría ${categoria.nombre}.`,
      });

      noContent(res, 'Categoría eliminada correctamente.');
    } catch (error) {
      next(error);
    }
  },
};