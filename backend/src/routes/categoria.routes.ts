import { Router } from 'express';
import { categoriaController } from '../controllers/categoria.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import { idParamSchema, crearCategoriaSchema, actualizarCategoriaSchema } from '../models/schemas';

export const categoriaRoutes = Router();

categoriaRoutes.use(authenticateToken);

categoriaRoutes.get('/', authorizePermission('categorias.view'), categoriaController.listar);
categoriaRoutes.get('/:id', authorizePermission('categorias.view'), validateParams(idParamSchema), categoriaController.detalle);
categoriaRoutes.post('/', authorizePermission('categorias.create'), validateBody(crearCategoriaSchema), categoriaController.crear);
categoriaRoutes.put('/:id', authorizePermission('categorias.edit'), validateParams(idParamSchema), validateBody(actualizarCategoriaSchema), categoriaController.actualizar);
categoriaRoutes.delete('/:id', authorizePermission('categorias.delete'), validateParams(idParamSchema), categoriaController.eliminar);