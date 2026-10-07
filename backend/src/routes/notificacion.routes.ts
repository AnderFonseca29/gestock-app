import { Router } from 'express';
import { notificacionController } from '../controllers/notificacion.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateParams } from '../middleware/validate';
import { idParamSchema } from '../models/schemas';

export const notificacionRoutes = Router();

notificacionRoutes.use(authenticateToken);

notificacionRoutes.get('/', authorizePermission('notificaciones.view'), notificacionController.listar);
notificacionRoutes.patch('/:id/leida', authorizePermission('notificaciones.view'), validateParams(idParamSchema), notificacionController.marcarLeida);
notificacionRoutes.post('/leidas', authorizePermission('notificaciones.view'), notificacionController.marcarTodasLeidas);