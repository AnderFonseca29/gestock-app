import { Request, Response, NextFunction } from 'express';
import { rolRepo } from '../repositories/rol.repo';
import { permisoRepo } from '../repositories/permiso.repo';
import { ok, created, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';

export const rolController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await rolRepo.listarConPermisos();
      ok(res, roles);
    } catch (error) {
      next(error);
    }
  },

  async listarBasico(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await rolRepo.listar();
      ok(res, roles);
    } catch (error) {
      next(error);
    }
  },

  async detalle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const rol = await rolRepo.buscarPorId(id);
      if (!rol) throw ApiError.notFound('El rol no existe.');
      const permisosDelRol = await permisoRepo.listar();
      ok(res, { rol, permisos: permisosDelRol });
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const { nombre, descripcion, permisoIds } = req.body;
      const existe = await rolRepo.buscarPorNombre(nombre);
      if (existe) throw ApiError.conflict('Ya existe un rol con ese nombre.');

      const rol = await rolRepo.crear({ nombre, descripcion, permisoIds });
      if (permisoIds?.length) {
        await rolRepo.asignarPermisos(rol.id, permisoIds);
      }

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'CREAR',
        modulo: 'ROLES',
        entidad: 'roles',
        registroId: rol.id,
        descripcion: `Se creó el rol ${rol.nombre}.`,
      });

      created(res, rol, 'Rol creado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const rol = await rolRepo.buscarPorId(id);
      if (!rol) throw ApiError.notFound('El rol no existe.');

      if (req.body.nombre !== undefined) {
        const duplicado = await rolRepo.buscarPorNombre(req.body.nombre);
        if (duplicado && duplicado.id !== id) throw ApiError.conflict('Ya existe un rol con ese nombre.');
      }

      const actualizado = await rolRepo.actualizar(id, req.body);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ACTUALIZAR',
        modulo: 'ROLES',
        entidad: 'roles',
        registroId: id,
        descripcion: `Se actualizó el rol ${rol.nombre}.`,
      });

      ok(res, actualizado, 'Rol actualizado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async cambiarEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const rol = await rolRepo.buscarPorId(id);
      if (!rol) throw ApiError.notFound('El rol no existe.');

      const actualizado = await rolRepo.cambiarEstado(id, req.body.estado);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: req.body.estado === 'Activo' ? 'ACTIVAR' : 'DESACTIVAR',
        modulo: 'ROLES',
        entidad: 'roles',
        registroId: id,
        descripcion: `Se ${req.body.estado === 'Activo' ? 'activó' : 'desactivó'} el rol ${rol.nombre}.`,
      });

      ok(res, actualizado, 'Estado del rol actualizado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async asignarPermisos(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const rol = await rolRepo.buscarPorId(id);
      if (!rol) throw ApiError.notFound('El rol no existe.');

      await rolRepo.asignarPermisos(id, req.body.permisoIds);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'AUTORIZAR',
        modulo: 'ROLES',
        entidad: 'roles',
        registroId: id,
        descripcion: `Se asignaron permisos al rol ${rol.nombre}.`,
      });

      ok(res, { rolId: id, permisoIds: req.body.permisoIds }, 'Permisos asignados correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const rol = await rolRepo.buscarPorId(id);
      if (!rol) throw ApiError.notFound('El rol no existe.');

      const usuarios = await rolRepo.contarUsuariosConRol(id);
      if (usuarios > 0) {
        throw ApiError.conflict('No se puede eliminar un rol que tiene usuarios asignados.');
      }

      await rolRepo.eliminar(id);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ELIMINAR',
        modulo: 'ROLES',
        entidad: 'roles',
        registroId: id,
        descripcion: `Se eliminó el rol ${rol.nombre}.`,
      });

      noContent(res, 'Rol eliminado correctamente.');
    } catch (error) {
      next(error);
    }
  },
};