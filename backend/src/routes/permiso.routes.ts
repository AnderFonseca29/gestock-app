import { Router } from 'express';
import { permisoController } from '../controllers/permiso.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';

export const permisoRoutes = Router();

permisoRoutes.use(authenticateToken);

permisoRoutes.get('/', authorizePermission('permisos.view'), permisoController.listar);
permisoRoutes.get('/modulo/:modulo', authorizePermission('permisos.view'), permisoController.listarPorModulo);