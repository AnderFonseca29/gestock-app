import { ApiError } from '../utils/ApiError';

export function errorHandler(err: any, _req: any, res: any, _next: any) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.details !== undefined ? { details: err.details } : {}),
    });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'El cuerpo de la solicitud contiene JSON inválido.',
      code: 'BAD_JSON',
    });
  }

  if (err?.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con ese valor único.',
      code: 'DUPLICATE_KEY',
      details: err.detail,
    });
  }

  if (err?.code === '23503') {
    return res.status(409).json({
      success: false,
      message: 'El registro está siendo utilizado por otra entidad.',
      code: 'FOREIGN_KEY_VIOLATION',
      details: err.detail,
    });
  }

  if (err?.code === '23502') {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios para completar la operación.',
      code: 'NOT_NULL_VIOLATION',
      details: err.detail,
    });
  }

  if (err?.code === '22P02') {
    return res.status(400).json({
      success: false,
      message: 'Uno de los parámetros enviados no es válido.',
      code: 'INVALID_PARAMETER',
    });
  }

  console.error('[ErrorHandler]', err);
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor.',
    code: 'INTERNAL_ERROR',
  });
}