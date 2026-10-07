import { Request, Response, NextFunction } from 'express';
import { productoRepo } from '../repositories/producto.repo';
import { ok, created, noContent } from '../utils/response';
import { ApiError } from '../utils/ApiError';
import { registrarAuditoria } from '../services/auditoria.service';

export const productoController = {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const productos = await productoRepo.listar({
        busqueda: req.query.busqueda as string | undefined,
        categoriaId: req.query.categoriaId ? Number(req.query.categoriaId) : undefined,
        bodegaId: req.query.bodegaId ? Number(req.query.bodegaId) : undefined,
        empresaId: req.empresaId ?? null,
      });
      ok(res, productos);
    } catch (error) {
      next(error);
    }
  },

  async detalle(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const producto = await productoRepo.buscarPorId(id, req.empresaId ?? null);
      if (!producto) throw ApiError.notFound('El producto no existe.');
      ok(res, producto);
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction) {
    try {
      const { codigo, nombre, descripcion, categoriaId, bodegaId, precio, costo, stock, stockMin } = req.body;
      const empresaId = req.empresaId ?? null;
      const existe = await productoRepo.buscarPorCodigo(codigo, empresaId);
      if (existe) throw ApiError.conflict('Ya existe un producto con ese código.');

      const producto = await productoRepo.crear({
        codigo,
        nombre,
        descripcion,
        categoriaId: categoriaId ?? null,
        bodegaId: bodegaId ?? null,
        precio,
        costo,
        stock,
        stockMin,
        empresaId,
      });

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'CREAR',
        modulo: 'PRODUCTOS',
        entidad: 'productos',
        registroId: producto.id,
        descripcion: `Se creó el producto ${producto.nombre} (${producto.codigo}).`,
      });

      created(res, producto, 'Producto registrado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const empresaId = req.empresaId ?? null;
      const producto = await productoRepo.buscarPorId(id, empresaId);
      if (!producto) throw ApiError.notFound('El producto no existe.');

      if (req.body.codigo !== undefined) {
        const existe = await productoRepo.buscarPorCodigo(req.body.codigo, empresaId);
        if (existe && existe.id !== id) throw ApiError.conflict('Ya existe un producto con ese código.');
      }

      const actualizado = await productoRepo.actualizar(id, {
        codigo: req.body.codigo,
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        categoriaId: req.body.categoriaId,
        bodegaId: req.body.bodegaId,
        precio: req.body.precio,
        costo: req.body.costo,
        stock: req.body.stock,
        stockMin: req.body.stockMin,
        estado: req.body.estado,
      });

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ACTUALIZAR',
        modulo: 'PRODUCTOS',
        entidad: 'productos',
        registroId: id,
        descripcion: `Se actualizó el producto ${producto.nombre}.`,
      });

      ok(res, actualizado, 'Producto actualizado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async cambiarEstado(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const producto = await productoRepo.buscarPorId(id, req.empresaId ?? null);
      if (!producto) throw ApiError.notFound('El producto no existe.');

      const actualizado = await productoRepo.actualizar(id, { estado: req.body.estado });

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: req.body.estado === 'Activo' ? 'ACTIVAR' : 'DESACTIVAR',
        modulo: 'PRODUCTOS',
        entidad: 'productos',
        registroId: id,
        descripcion: `Se ${req.body.estado === 'Activo' ? 'activó' : 'desactivó'} el producto ${producto.nombre}.`,
      });

      ok(res, actualizado, 'Estado del producto actualizado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const producto = await productoRepo.buscarPorId(id, req.empresaId ?? null);
      if (!producto) throw ApiError.notFound('El producto no existe.');

      await productoRepo.eliminar(id);

      await registrarAuditoria({
        usuarioId: req.user?.id ?? null,
        accion: 'ELIMINAR',
        modulo: 'PRODUCTOS',
        entidad: 'productos',
        registroId: id,
        descripcion: `Se eliminó el producto ${producto.nombre}.`,
      });

      noContent(res, 'Producto eliminado correctamente.');
    } catch (error) {
      next(error);
    }
  },

  async stockBajo(req: Request, res: Response, next: NextFunction) {
    try {
      const productos = await productoRepo.listarStockBajo(req.empresaId ?? null);
      ok(res, productos);
    } catch (error) {
      next(error);
    }
  },
};