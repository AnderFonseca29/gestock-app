import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export function authorizePermission(permiso: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!req.user.permisos.includes(permiso)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}

export function authorizeAnyPermission(...permisos: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!permisos.some((permiso) => req.user!.permisos.includes(permiso))) {
      return next(ApiError.forbidden());
    }
    next();
  };
}

export function authorizeRoles(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.rol)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}