import { Router } from 'express';
import { reporteController } from '../controllers/reporte.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';

export const reporteRoutes = Router();

reporteRoutes.use(authenticateToken);

reporteRoutes.get('/inventario', authorizePermission('reportes.view'), reporteController.inventario);
reporteRoutes.get('/movimientos', authorizePermission('reportes.view'), reporteController.movimientos);
reporteRoutes.get('/stock', authorizePermission('reportes.view'), reporteController.stock);
reporteRoutes.get('/auditorias', authorizePermission('reportes.view'), reporteController.auditorias);
reporteRoutes.get('/incidencias', authorizePermission('reportes.view'), reporteController.incidencias);