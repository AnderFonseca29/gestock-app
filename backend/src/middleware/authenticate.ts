import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { query } from '../config/db';
import { ApiError } from '../utils/ApiError';
import { AuthRequestUser, JwtPayload } from '../models/types';
import { getUsuarioConPermisosPorId } from '../services/auth.service';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthRequestUser;
      empresaId?: number | null;
    }
  }
}

export async function authenticateToken(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No se proporcionó un token de acceso.');
    }

    const token = header.slice(7).trim();
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

    const usuario = await getUsuarioConPermisosPorId(payload.userId);
    if (!usuario) {
      throw ApiError.unauthorized('El usuario ya no existe en el sistema.');
    }
    if (usuario.estado !== 'Activo') {
      throw ApiError.forbidden('El usuario está inactivo. Contacta al administrador.');
    }

    if (payload.sesionId) {
      const sesion = await query(
        `SELECT id, empresa_id FROM sesiones WHERE id = $1 AND estado = 'Activa'`,
        [payload.sesionId]
      );
      if (!sesion.length) {
        throw ApiError.unauthorized('Tu sesión fue cerrada. Inicia sesión nuevamente.');
      }
      // La empresa activa de la sesión tiene prioridad; si no está definida,
      // se usa la empresa del usuario.
      req.empresaId = sesion[0].empresa_id ?? usuario.empresaId ?? null;
    } else {
      req.empresaId = usuario.empresaId ?? null;
    }

    usuario.sesionId = payload.sesionId;
    req.user = usuario;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized('Tu sesión ha expirado. Inicia sesión nuevamente.'));
    }
    return next(ApiError.unauthorized('El token de acceso no es válido.'));
  }
}