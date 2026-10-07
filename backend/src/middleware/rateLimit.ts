import { rateLimit } from 'express-rate-limit';
import type { Request } from 'express';
import { createHash } from 'crypto';
import { ApiError } from '../utils/ApiError';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FALLIDOS_POR_CUENTA = 5;
const MAX_POR_IP = 60;

const mensajePorCuenta =
  'Has superado el máximo de intentos para esta cuenta. Espera 15 minutos e intenta de nuevo.';
const mensajeGeneral = 'Demasiadas solicitudes. Espera unos minutos e intenta de nuevo.';

function hashKey(prefijo: string, valor: string | undefined): string {
  const v = (valor ?? '').trim().toLowerCase();
  return createHash('sha256').update(`${prefijo}:${v}`).digest('hex');
}

/** Genera la clave del limiter a partir de un campo del cuerpo (ej: email, telefono). */
export function keyGeneratorPorCampo(campo: string, prefijo: string) {
  return (req: Request): string => hashKey(prefijo, req.body?.[campo]);
}

function responder429(mensaje: string) {
  return (_req: Request, res: any, _next: any) => {
    res.status(429).json({ success: false, message: mensaje, code: 'RATE_LIMITED' });
  };
}

/**
 * Limite por CUENTA para el login: solo el email que falla muchas veces queda
 * bloqueado. Los demás usuarios (incluso desde la misma IP) no se ven afectados.
 */
export const loginEmailLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_FALLIDOS_POR_CUENTA,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: keyGeneratorPorCampo('email', 'login'),
  handler: responder429(mensajePorCuenta),
});

/** Guardia por IP para el login: alto, para no afectar a usuarios legítimos. */
export const loginIpLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_POR_IP,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => req.ip ?? req.socket?.remoteAddress ?? 'unknown',
  handler: responder429(mensajeGeneral),
});

/** Limite por CUENTA para la recuperación de contraseña (se identifica por teléfono). */
export const recuperacionLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_FALLIDOS_POR_CUENTA,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: keyGeneratorPorCampo('telefono', 'recuperar'),
  handler: responder429(mensajePorCuenta),
});

export const apiRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    const error = ApiError.tooManyRequests();
    res.status(error.statusCode).json({ success: false, message: error.message, code: error.code });
  },
});