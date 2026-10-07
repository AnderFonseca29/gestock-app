import { Request } from 'express';

export interface SesionInfo {
  ip: string | null;
  userAgent: string | null;
  dispositivo: string | null;
  navegador: string | null;
}

export function obtenerSesionInfo(req: Request): SesionInfo {
  const userAgent = req.headers['user-agent'] || null;
  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    null;

  let dispositivo: string | null = 'Desconocido';
  let navegador: string | null = 'Desconocido';

  if (userAgent) {
    if (/mobile/i.test(userAgent)) dispositivo = 'Móvil';
    else if (/tablet/i.test(userAgent)) dispositivo = 'Tablet';
    else dispositivo = 'Computadora';

    if (/edg/i.test(userAgent)) navegador = 'Microsoft Edge';
    else if (/chrome|crios/i.test(userAgent)) navegador = 'Google Chrome';
    else if (/firefox|fxios/i.test(userAgent)) navegador = 'Mozilla Firefox';
    else if (/safari/i.test(userAgent)) navegador = 'Safari';
    else navegador = 'Otro';
  }

  return { ip, userAgent, dispositivo, navegador };
}