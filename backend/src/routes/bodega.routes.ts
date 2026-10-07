import { Router } from 'express';
import { bodegaController } from '../controllers/bodega.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import { idParamSchema, crearBodegaSchema, actualizarBodegaSchema } from '../models/schemas';

export const bodegaRoutes = Router();

bodegaRoutes.use(authenticateToken);

bodegaRoutes.get('/', authorizePermission('bodegas.view'), bodegaController.listar);
bodegaRoutes.get('/:id', authorizePermission('bodegas.view'), validateParams(idParamSchema), bodegaController.detalle);
bodegaRoutes.post('/', authorizePermission('bodegas.create'), validateBody(crearBodegaSchema), bodegaController.crear);
bodegaRoutes.put('/:id', authorizePermission('bodegas.edit'), validateParams(idParamSchema), validateBody(actualizarBodegaSchema), bodegaController.actualizar);
bodegaRoutes.delete('/:id', authorizePermission('bodegas.delete'), validateParams(idParamSchema), bodegaController.eliminar);