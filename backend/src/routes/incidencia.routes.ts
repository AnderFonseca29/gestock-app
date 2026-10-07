import { Router } from 'express';
import { incidenciaController } from '../controllers/incidencia.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import { idParamSchema, crearIncidenciaSchema, actualizarIncidenciaSchema } from '../models/schemas';

export const incidenciaRoutes = Router();

incidenciaRoutes.use(authenticateToken);

incidenciaRoutes.get('/', authorizePermission('incidencias.view'), incidenciaController.listar);
incidenciaRoutes.get('/:id', authorizePermission('incidencias.view'), validateParams(idParamSchema), incidenciaController.detalle);
incidenciaRoutes.post('/', authorizePermission('incidencias.create'), validateBody(crearIncidenciaSchema), incidenciaController.crear);
incidenciaRoutes.put('/:id', authorizePermission('incidencias.edit'), validateParams(idParamSchema), validateBody(actualizarIncidenciaSchema), incidenciaController.actualizar);
incidenciaRoutes.delete('/:id', authorizePermission('incidencias.delete'), validateParams(idParamSchema), incidenciaController.eliminar);