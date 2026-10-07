import { Router } from 'express';
import { sesionController } from '../controllers/sesion.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateParams } from '../middleware/validate';
import { idParamSchema } from '../models/schemas';

export const sesionRoutes = Router();

sesionRoutes.use(authenticateToken);

sesionRoutes.get('/', authorizePermission('sesiones.view'), sesionController.listar);
sesionRoutes.post('/cerrar-otras', authorizePermission('sesiones.delete'), sesionController.cerrarOtras);
sesionRoutes.delete('/:id', authorizePermission('sesiones.delete'), validateParams(idParamSchema), sesionController.eliminar);