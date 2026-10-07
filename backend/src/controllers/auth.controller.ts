import { Request, Response, NextFunction } from 'express';
import {
  login,
  cambiarContrasena,
  solicitarRecuperacion,
  validarCodigoRecuperacion,
  restablecerPassword,
} from '../services/auth.service';
import { ok, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { obtenerSesionInfo } from '../utils/requestInfo';
import { sesionRepo } from '../repositories/sesion.repo';
import { registrarAuditoria } from '../services/auditoria.service';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const sesionInfo = obtenerSesionInfo(req);
      const resultado = await login(email, password, sesionInfo);
      ok(res, resultado, 'Inicio de sesión exitoso.');
    } catch (error) {
      next(error);
    }
  },

  async perfil(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('No autenticado.');
      const sesion = req.user.sesionId ? await sesionRepo.buscarPorId(req.user.sesionId) : null;
      ok(res, { ...req.user, empresaId: req.empresaId ?? req.user.empresaId, sesionActual: sesion });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.id) {
        await registrarAuditoria({
          usuarioId: req.user.id,
          accion: 'LOGOUT',
          modulo: 'AUTENTICACIÓN',
          entidad: 'usuarios',
          registroId: req.user.id,
          descripcion: `El usuario ${req.user.email} cerró sesión.`,
        });
      }
      if (req.user?.sesionId) {
        await sesionRepo.cerrar(req.user.sesionId);
      }
      noContent(res, 'Sesión cerrada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async cambiarContrasena(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('No autenticado.');
      await cambiarContrasena(req.user.id, req.body.passwordActual, req.body.nuevaPassword);
      noContent(res, 'Contraseña actualizada correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async solicitarRecuperacion(req: Request, res: Response, next: NextFunction) {
    try {
      const { telefono } = req.body;
      const resultado = await solicitarRecuperacion(telefono);
      ok(res, resultado, 'Si el número está registrado recibirás un SMS con el código.');
    } catch (error) {
      next(error);
    }
  },

  async validarCodigoRecuperacion(req: Request, res: Response, next: NextFunction) {
    try {
      const { telefono, codigo } = req.body;
      await validarCodigoRecuperacion(telefono, codigo);
      ok(res, null, 'Código verificado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async restablecerPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { telefono, codigo, nuevaPassword } = req.body;
      await restablecerPassword(telefono, codigo, nuevaPassword);
      noContent(res, 'Contraseña restablecida correctamente.');
    } catch (error) {
      next(error);
    }
  },
};