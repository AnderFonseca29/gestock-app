import { Router } from 'express';
import { mantenimientoController } from '../controllers/mantenimiento.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import { idParamSchema, crearMantenimientoSchema, actualizarMantenimientoSchema } from '../models/schemas';

export const mantenimientoRoutes = Router();

mantenimientoRoutes.use(authenticateToken);

mantenimientoRoutes.get('/', authorizePermission('mantenimiento.view'), mantenimientoController.listar);
mantenimientoRoutes.get('/:id', authorizePermission('mantenimiento.view'), validateParams(idParamSchema), mantenimientoController.detalle);
mantenimientoRoutes.post('/', authorizePermission('mantenimiento.create'), validateBody(crearMantenimientoSchema), mantenimientoController.crear);
mantenimientoRoutes.put('/:id', authorizePermission('mantenimiento.edit'), validateParams(idParamSchema), validateBody(actualizarMantenimientoSchema), mantenimientoController.actualizar);
mantenimientoRoutes.delete('/:id', authorizePermission('mantenimiento.delete'), validateParams(idParamSchema), mantenimientoController.eliminar);