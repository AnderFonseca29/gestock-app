import { Router } from 'express';
import { configuracionController } from '../controllers/configuracion.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateBody } from '../middleware/validate';
import { configuracionSchema } from '../models/schemas';

export const configuracionRoutes = Router();

configuracionRoutes.use(authenticateToken);

configuracionRoutes.get('/', authorizePermission('configuracion.view'), configuracionController.listar);
configuracionRoutes.put('/', authorizePermission('configuracion.edit'), validateBody(configuracionSchema), configuracionController.actualizar);