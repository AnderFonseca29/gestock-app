import { Request, Response, NextFunction } from 'express';
import { bodegaRepo } from '../repositories/bodega.repo';
import { ok, created, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';

export const bodegaController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const bodegas = req.query.activas === 'true' ? await bodegaRepo.listarActivas(req.empresaId ?? null) : await bodegaRepo.listar(req.empresaId ?? null);
      ok(res, bodegas);
    } catch (error) {
      next(error);
    }
  },

  async detalle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const bodega = await bodegaRepo.buscarPorId(id, req.empresaId ?? null);
      if (!bodega) throw ApiError.notFound('La bodega no existe.');
      ok(res, bodega);
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const { nombre, codigo, ciudad, direccion, responsable, telefono, capacidad } = req.body;
      const empresaId = req.empresaId ?? null;
      const existe = await bodegaRepo.buscarPorCodigo(codigo, empresaId);
      if (existe) throw ApiError.conflict('Ya existe una bodega con ese código.');

      const bodega = await bodegaRepo.crear({ nombre, codigo, ciudad, direccion, responsable, telefono, capacidad, empresaId });

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'CREAR',
        modulo: 'BODEGAS',
        entidad: 'bodegas',
        registroId: bodega.id,
        descripcion: `Se creó la bodega ${bodega.nombre} (${bodega.codigo}).`,
      });

      created(res, bodega, 'Bodega creada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const empresaId = req.empresaId ?? null;
      const bodega = await bodegaRepo.buscarPorId(id, empresaId);
      if (!bodega) throw ApiError.notFound('La bodega no existe.');

      if (req.body.codigo !== undefined) {
        const existe = await bodegaRepo.buscarPorCodigo(req.body.codigo, empresaId);
        if (existe && existe.id !== id) throw ApiError.conflict('Ya existe una bodega con ese código.');
      }

      const actualizada = await bodegaRepo.actualizar(id, req.body);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ACTUALIZAR',
        modulo: 'BODEGAS',
        entidad: 'bodegas',
        registroId: id,
        descripcion: `Se actualizó la bodega ${bodega.nombre}.`,
      });

      ok(res, actualizada, 'Bodega actualizada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const bodega = await bodegaRepo.buscarPorId(id, req.empresaId ?? null);
      if (!bodega) throw ApiError.notFound('La bodega no existe.');

      await bodegaRepo.eliminar(id);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ELIMINAR',
        modulo: 'BODEGAS',
        entidad: 'bodegas',
        registroId: id,
        descripcion: `Se eliminó la bodega ${bodega.nombre}.`,
      });

      noContent(res, 'Bodega eliminada correctamente.');
    } catch (error) {
      next(error);
    }
  },
};