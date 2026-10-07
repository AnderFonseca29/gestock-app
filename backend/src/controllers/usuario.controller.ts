import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { usuarioRepo, CrearUsuarioData } from '../repositories/usuario.repo';
import { rolRepo } from '../repositories/rol.repo';
import { sesionRepo } from '../repositories/sesion.repo';
import { ok, created, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';
import { AuthRequestUser } from '../models/types';

function authInfo(req: Request): AuthRequestUser | null {
  return req.user ?? null;
}

export const usuarioController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const datos = await usuarioRepo.listar({
        busqueda: req.query.busqueda as string | undefined,
        filtroRol: req.query.filtroRol as string | undefined,
        estado: req.query.estado as string | undefined,
        empresaId: req.empresaId ?? null,
      });
      ok(res, datos);
    } catch (error) {
      next(error);
    }
  },

  async detalle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const usuario = await usuarioRepo.buscarDetalle(id);
      if (!usuario) throw ApiError.notFound('El usuario no existe.');
      const permisos = await rolRepo.listar();
      ok(res, { usuario, roles: permisos });
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const { nombre, apellido, email, telefono, password, rolId, empresaId } = req.body;
      const existe = await usuarioRepo.buscarPorEmail(email);
      if (existe) throw ApiError.conflict('Ya existe un usuario con ese correo electrónico.');

      const rol = await rolRepo.buscarPorId(rolId);
      if (!rol) throw ApiError.notFound('El rol seleccionado no existe.');

      const passwordHash = await bcrypt.hash(password, 10);
      const data: CrearUsuarioData = {
        nombre,
        apellido,
        email: email.toLowerCase().trim(),
        telefono: telefono ?? null,
        passwordHash,
        rolId,
        empresaId: empresaId ?? req.empresaId ?? null,
        estado: 'Activo',
      };
      const usuario = await usuarioRepo.crear(data);

      const usuarioActual = authInfo(req);
      await registrarAuditoria({
        usuarioId: usuarioActual?.id ?? null,
        usuarioNombre: usuarioActual ? `${usuarioActual.nombre} ${usuarioActual.apellido}` : null,
        accion: 'CREAR',
        modulo: 'USUARIOS',
        entidad: 'usuarios',
        registroId: usuario.id,
        descripcion: `Se creó el usuario ${usuario.email} con rol ${rol.nombre}.`,
      });

      created(res, { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, rolId, estado: usuario.estado }, 'Usuario creado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const usuario = await usuarioRepo.buscarPorId(id);
      if (!usuario) throw ApiError.notFound('El usuario no existe.');

      const datos: { nombre?: string; apellido?: string; rolId?: number; empresaId?: number | null; telefono?: string | null; passwordHash?: string } = {};
      if (req.body.nombre !== undefined) datos.nombre = req.body.nombre;
      if (req.body.apellido !== undefined) datos.apellido = req.body.apellido;
      if (req.body.rolId !== undefined) {
        const rol = await rolRepo.buscarPorId(req.body.rolId);
        if (!rol) throw ApiError.notFound('El rol seleccionado no existe.');
        datos.rolId = req.body.rolId;
      }
      if (req.body.empresaId !== undefined) datos.empresaId = req.body.empresaId;
      if (req.body.telefono !== undefined) datos.telefono = req.body.telefono ?? null;
      if (req.body.password) {
        datos.passwordHash = await bcrypt.hash(req.body.password, 10);
      }

      const actualizado = await usuarioRepo.actualizar(id, datos);

      const usuarioActual = authInfo(req) as unknown as AuthRequestUser & { email?: string };
      await registrarAuditoria({
        usuarioId: usuarioActual?.id ?? null,
        usuarioNombre: usuarioActual ? `${usuarioActual.nombre} ${usuarioActual.apellido}` : null,
        accion: 'ACTUALIZAR',
        modulo: 'USUARIOS',
        entidad: 'usuarios',
        registroId: id,
        descripcion: `Se actualizó el usuario ${usuario.email}.`,
      });

      ok(res, { ...actualizado, password_hash: undefined }, 'Usuario actualizado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async cambiarEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const estado = req.body.estado;
      const usuario = await usuarioRepo.buscarPorId(id);
      if (!usuario) throw ApiError.notFound('El usuario no existe.');

      const actualizado = await usuarioRepo.cambiarEstado(id, estado);

      const usuarioActual = authInfo(req);
      await registrarAuditoria({
        usuarioId: usuarioActual?.id ?? null,
        accion: estado === 'Activo' ? 'ACTIVAR' : 'DESACTIVAR',
        modulo: 'USUARIOS',
        entidad: 'usuarios',
        registroId: id,
        descripcion: `Se ${estado === 'Activo' ? 'activó' : 'desactivó'} al usuario ${usuario.email}.`,
      });

      ok(res, { ...actualizado, password_hash: undefined }, `Usuario ${estado === 'Activo' ? 'activado' : 'desactivado'} correctamente.`);
    } catch (error) {
      next(error);
    }
  },

  async cambiarRol(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const rolId = req.body.rolId;
      const usuario = await usuarioRepo.buscarPorId(id);
      if (!usuario) throw ApiError.notFound('El usuario no existe.');
      const rol = await rolRepo.buscarPorId(rolId);
      if (!rol) throw ApiError.notFound('El rol seleccionado no existe.');

      const actualizado = await usuarioRepo.actualizar(id, { rolId });

      const usuarioActual = authInfo(req);
      await registrarAuditoria({
        usuarioId: usuarioActual?.id ?? null,
        accion: 'AUTORIZAR',
        modulo: 'USUARIOS',
        entidad: 'usuarios',
        registroId: id,
        descripcion: `Se asignó el rol ${rol.nombre} al usuario ${usuario.email}.`,
      });

      ok(res, { ...actualizado, password_hash: undefined }, 'Rol asignado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async cambiarPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (req.user?.id === id) {
        throw ApiError.badRequest('Para cambiar tu propia contraseña usa la opción de tu perfil.');
      }

      const usuario = await usuarioRepo.buscarPorId(id);
      if (!usuario) throw ApiError.notFound('El usuario no existe.');

      const passwordHash = await bcrypt.hash(req.body.nuevaPassword, 10);
      await usuarioRepo.actualizarContrasena(id, passwordHash);
      await sesionRepo.eliminarPorUsuario(id);

      const usuarioActual = authInfo(req);
      await registrarAuditoria({
        usuarioId: usuarioActual?.id ?? null,
        usuarioNombre: usuarioActual ? `${usuarioActual.nombre} ${usuarioActual.apellido}` : null,
        accion: 'CAMBIAR_PASSWORD',
        modulo: 'USUARIOS',
        entidad: 'usuarios',
        registroId: id,
        descripcion: `Se cambió la contraseña del usuario ${usuario.email}. Sus sesiones fueron cerradas.`,
      });

      ok(res, null, 'Contraseña actualizada. El usuario deberá iniciar sesión con la nueva contraseña.');
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (req.user?.id === id) throw ApiError.forbidden('No puedes eliminar tu propio usuario.');

      const usuario = await usuarioRepo.buscarPorId(id);
      if (!usuario) throw ApiError.notFound('El usuario no existe.');

      await usuarioRepo.eliminar(id);

      const usuarioActual = authInfo(req);
      await registrarAuditoria({
        usuarioId: usuarioActual?.id ?? null,
        accion: 'ELIMINAR',
        modulo: 'USUARIOS',
        entidad: 'usuarios',
        registroId: id,
        descripcion: `Se eliminó al usuario ${usuario.email}.`,
      });

      noContent(res, 'Usuario eliminado correctamente.');
    } catch (error) {
      next(error);
    }
  },
};