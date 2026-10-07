import { Router } from 'express';
import { productoController } from '../controllers/producto.controller';
import { authenticateToken } from '../middleware/authenticate';
import { authorizePermission } from '../middleware/authorize';
import { validateBody, validateParams } from '../middleware/validate';
import {
  idParamSchema,
  crearProductoSchema,
  actualizarProductoSchema,
  cambiarEstadoProductoSchema,
} from '../models/schemas';

export const productoRoutes = Router();

productoRoutes.use(authenticateToken);

productoRoutes.get('/', authorizePermission('productos.view'), productoController.listar);
productoRoutes.get('/stock-bajo', authorizePermission('inventario.view'), productoController.stockBajo);
productoRoutes.get('/:id', authorizePermission('productos.view'), validateParams(idParamSchema), productoController.detalle);
productoRoutes.post('/', authorizePermission('productos.create'), validateBody(crearProductoSchema), productoController.crear);
productoRoutes.put('/:id', authorizePermission('productos.edit'), validateParams(idParamSchema), validateBody(actualizarProductoSchema), productoController.actualizar);
productoRoutes.patch('/:id/estado', authorizePermission('productos.edit'), validateParams(idParamSchema), validateBody(cambiarEstadoProductoSchema), productoController.cambiarEstado);
productoRoutes.delete('/:id', authorizePermission('productos.delete'), validateParams(idParamSchema), productoController.eliminar);