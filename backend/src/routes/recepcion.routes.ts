import { Router } from 'express';
import { recepcionController } from '../controllers/recepcion.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission, authorizeAnyPermission } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import { idParamSchema, crearRecepcionSchema } from '../models/schemas';

export const recepcionRoutes = Router();

recepcionRoutes.use(authenticateToken);

recepcionRoutes.get('/', authorizeAnyPermission('recepcion.view', 'historial.view'), recepcionController.listar);
recepcionRoutes.get('/:id', authorizeAnyPermission('recepcion.view', 'historial.view'), validateParams(idParamSchema), recepcionController.detalle);
recepcionRoutes.post('/', authorizePermission('recepcion.create'), validateBody(crearRecepcionSchema), recepcionController.crear);
recepcionRoutes.put('/:id', authorizePermission('recepcion.edit'), validateParams(idParamSchema), validateBody(crearRecepcionSchema.partial()), recepcionController.actualizar);
recepcionRoutes.delete('/:id', authorizePermission('recepcion.delete'), validateParams(idParamSchema), recepcionController.eliminar);