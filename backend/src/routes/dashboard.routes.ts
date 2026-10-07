import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticateToken);

dashboardRoutes.get('/resumen', authorizePermission('dashboard.view'), dashboardController.resumen);