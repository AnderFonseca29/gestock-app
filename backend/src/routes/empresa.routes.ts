import { Router } from 'express';
import { empresaController } from '../controllers/empresa.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import { idParamSchema, crearEmpresaSchema, actualizarEmpresaSchema, seleccionarEmpresaSchema } from '../models/schemas';

export const empresaRoutes = Router();

empresaRoutes.use(authenticateToken);

empresaRoutes.post('/seleccionar', authorizePermission('empresas.view'), validateBody(seleccionarEmpresaSchema), empresaController.seleccionar);
empresaRoutes.get('/', authorizePermission('empresas.view'), empresaController.listar);
empresaRoutes.get('/:id', authorizePermission('empresas.view'), validateParams(idParamSchema), empresaController.detalle);
empresaRoutes.post('/', authorizePermission('empresas.create'), validateBody(crearEmpresaSchema), empresaController.crear);
empresaRoutes.put('/:id', authorizePermission('empresas.edit'), validateParams(idParamSchema), validateBody(actualizarEmpresaSchema), empresaController.actualizar);
empresaRoutes.delete('/:id', authorizePermission('empresas.delete'), validateParams(idParamSchema), empresaController.eliminar);