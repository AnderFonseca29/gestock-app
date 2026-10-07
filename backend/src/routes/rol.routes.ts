import { Router } from 'express';
import { rolController } from '../controllers/rol.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import {
  idParamSchema,
  crearRolSchema,
  actualizarRolSchema,
  cambiarEstadoRolSchema,
  asignarPermisosSchema,
} from '../models/schemas';

export const rolRoutes = Router();

rolRoutes.use(authenticateToken);

rolRoutes.get('/basicos', authorizePermission('roles.view'), rolController.listarBasico);
rolRoutes.get('/', authorizePermission('roles.view'), rolController.listar);
rolRoutes.get('/:id', authorizePermission('roles.view'), validateParams(idParamSchema), rolController.detalle);
rolRoutes.post('/', authorizePermission('roles.create'), validateBody(crearRolSchema), rolController.crear);
rolRoutes.put('/:id', authorizePermission('roles.edit'), validateParams(idParamSchema), validateBody(actualizarRolSchema), rolController.actualizar);
rolRoutes.patch('/:id/estado', authorizePermission('roles.edit'), validateParams(idParamSchema), validateBody(cambiarEstadoRolSchema), rolController.cambiarEstado);
rolRoutes.put('/:id/permisos', authorizePermission('roles.asignar_permisos'), validateParams(idParamSchema), validateBody(asignarPermisosSchema), rolController.asignarPermisos);
rolRoutes.delete('/:id', authorizePermission('roles.delete'), validateParams(idParamSchema), rolController.eliminar);