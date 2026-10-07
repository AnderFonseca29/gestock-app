import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../utils/ApiError';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        campo: e.path.join('.'),
        mensaje: e.message,
      }));
      return next(ApiError.badRequest('Los datos enviados no son válidos.', details));
    }
    req.body = result.data;
    next();
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(ApiError.badRequest('Los parámetros de la ruta no son válidos.'));
    }
    req.params = { ...req.params, ...result.data };
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(ApiError.badRequest('Los parámetros de consulta no son válidos.'));
    }
    const validado = { ...req.query, ...result.data };
    Object.defineProperty(req, 'query', {
      value: validado,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    next();
  };
}