import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import {
  idParamSchema,
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  cambiarEstadoUsuarioSchema,
  cambiarRolUsuarioSchema,
  cambiarPasswordUsuarioSchema,
} from '../models/schemas';

export const usuarioRoutes = Router();

usuarioRoutes.use(authenticateToken);

usuarioRoutes.get('/', authorizePermission('usuarios.view'), usuarioController.listar);
usuarioRoutes.get('/:id', authorizePermission('usuarios.view'), validateParams(idParamSchema), usuarioController.detalle);
usuarioRoutes.post('/', authorizePermission('usuarios.create'), validateBody(crearUsuarioSchema), usuarioController.crear);
usuarioRoutes.put('/:id', authorizePermission('usuarios.edit'), validateParams(idParamSchema), validateBody(actualizarUsuarioSchema), usuarioController.actualizar);
usuarioRoutes.patch('/:id/estado', authorizePermission('usuarios.desactivar'), validateParams(idParamSchema), validateBody(cambiarEstadoUsuarioSchema), usuarioController.cambiarEstado);
usuarioRoutes.patch('/:id/rol', authorizePermission('usuarios.edit'), validateParams(idParamSchema), validateBody(cambiarRolUsuarioSchema), usuarioController.cambiarRol);
usuarioRoutes.put('/:id/password', authorizePermission('usuarios.password'), validateParams(idParamSchema), validateBody(cambiarPasswordUsuarioSchema), usuarioController.cambiarPassword);
usuarioRoutes.delete('/:id', authorizePermission('usuarios.delete'), validateParams(idParamSchema), usuarioController.eliminar);