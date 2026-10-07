import { Request, Response, NextFunction } from 'express';
import { configuracionRepo } from '../repositories/configuracion.repo';
import { ok } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';

function aString(entradas: Record<string, any>): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const [clave, valor] of Object.entries(entradas)) {
    if (valor !== undefined) resultado[clave] = String(valor);
  }
  return resultado;
}

export const configuracionController = {
  async listar(_req: Request, res: Response, next: NextFunction) {
    try {
      const configuracion = await configuracionRepo.listar();
      const comoObjeto: Record<string, string> = {};
      for (const fila of configuracion) {
        comoObjeto[fila.clave] = fila.valor;
      }
      ok(res, comoObjeto);
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw ApiError.unauthorized('No autenticado.');
      const entradas = aString(req.body);
      if (!Object.keys(entradas).length) throw ApiError.badRequest('No se enviaron configuraciones para actualizar.');

      await configuracionRepo.actualizarVarias(entradas);

      await registrarAuditoria({
        usuarioId: req.user.id,
        accion: 'ACTUALIZAR',
        modulo: 'CONFIGURACIÓN',
        entidad: 'configuracion_sistema',
        descripcion: 'Se actualizó la configuración del sistema.',
      });

      ok(res, entradas, 'Configuración actualizada correctamente.');
    } catch (error) {
      next(error);
    }
  },
};