import { Router } from 'express';
import { movimientoController } from '../controllers/movimiento.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateBody, validateParams, validateQuery } from '../middleware/validate';
import { idParamSchema, crearMovimientoSchema, listarMovimientosSchema } from '../models/schemas';

export const movimientoRoutes = Router();

movimientoRoutes.use(authenticateToken);

movimientoRoutes.get('/', authorizePermission('movimientos.view'), validateQuery(listarMovimientosSchema), movimientoController.listar);
movimientoRoutes.get('/:id', authorizePermission('movimientos.view'), validateParams(idParamSchema), movimientoController.detalle);
movimientoRoutes.post('/', authorizePermission('recepcion.create'), validateBody(crearMovimientoSchema), movimientoController.crear);
movimientoRoutes.delete('/:id', authorizePermission('recepcion.delete'), validateParams(idParamSchema), movimientoController.eliminar);