import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { diagramaController } from '../controllers/diagrama.controller';

export const diagramaRoutes = Router();

diagramaRoutes.use(authenticateToken);

diagramaRoutes.get('/', authorizePermission('diagramas.view'), diagramaController.listar);
diagramaRoutes.get('/:id/imagen', authorizePermission('diagramas.view'), diagramaController.imagen);