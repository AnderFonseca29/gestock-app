import { Router } from 'express';
import { auditoriaController } from '../controllers/auditoria.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateParams } from '../middleware/validate';
import { idParamSchema } from '../models/schemas';

export const auditoriaRoutes = Router();

auditoriaRoutes.use(authenticateToken);

auditoriaRoutes.get('/', authorizePermission('auditoria.view'), auditoriaController.listar);
auditoriaRoutes.get('/:id', authorizePermission('auditoria.view'), validateParams(idParamSchema), auditoriaController.detalle);