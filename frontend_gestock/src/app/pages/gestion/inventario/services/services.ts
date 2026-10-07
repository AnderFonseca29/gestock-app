import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from '../../../../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private api = inject(ApiService);

  // Signals reactivos para manejar los datos globalmente si lo requieres
  productos = signal<any[]>([]);
  bodegas = signal<any[]>([]);

  constructor() {}

  // ==================== OPERACIONES DE PRODUCTOS ====================

  /** Obtener todos los productos */
  obtenerProductos(): Promise<any[]> {
    return this.api.get('/productos').then((data) => {
      const lista = data as any[];
      this.productos.set(lista);
      return lista;
    });
  }

  /** Obtener productos filtrados por bodega */
  obtenerProductosPorBodega(bodegaId: number): Promise<any[]> {
    return this.api.get('/productos', { bodegaId });
  }

  /** Obtener productos con stock bajo */
  obtenerStockBajo(): Promise<any[]> {
    return this.api.get('/productos/stock-bajo');
  }

  /** Registrar un nuevo producto */
  crearProducto(producto: any): Promise<any> {
    return this.api.post('/productos', producto).then((nuevo) => {
      this.productos.update((lista) => [...lista, nuevo]);
      return nuevo;
    });
  }

  /** Actualizar un producto existente */
  actualizarProducto(id: number, producto: any): Promise<any> {
    return this.api.put(`/productos/${id}`, producto).then((actualizado) => {
      this.productos.update((lista) => lista.map((p) => (p.id === id ? actualizado : p)));
      return actualizado;
    });
  }

  /** Eliminar un producto */
  eliminarProducto(id: number): Promise<any> {
    return this.api.delete(`/productos/${id}`).then((res) => {
      this.productos.update((lista) => lista.filter((p) => p.id !== id));
      return res;
    });
  }

  // ==================== OPERACIONES DE CATEGORÍAS ====================

  /** Obtener todas las categorías */
  obtenerCategorias(): Promise<any[]> {
    return this.api.get('/categorias');
  }

  /** Crear una nueva categoría */
  crearCategoria(categoria: any): Promise<any> {
    return this.api.post('/categorias', categoria);
  }

  /** Actualizar una categoría existente */
  actualizarCategoria(id: number, categoria: any): Promise<any> {
    return this.api.put(`/categorias/${id}`, categoria);
  }

  /** Eliminar una categoría */
  eliminarCategoria(id: number): Promise<any> {
    return this.api.delete(`/categorias/${id}`);
  }

  // ==================== OPERACIONES DE BODEGAS ====================

  /** Obtener todas las bodegas (o solo las activas) */
  obtenerBodegas(activas?: boolean): Promise<any[]> {
    return this.api.get('/bodegas', activas ? { activas: 'true' } : undefined).then((data) => {
      const lista = data as any[];
      this.bodegas.set(lista);
      return lista;
    });
  }

  /** Crear una nueva bodega */
  crearBodega(bodega: any): Promise<any> {
    return this.api.post('/bodegas', bodega).then((nueva) => {
      this.bodegas.update((lista) => [...lista, nueva]);
      return nueva;
    });
  }

  /** Cambiar el estado (activo/inactivo) de una bodega */
  toggleEstadoBodega(id: number, activa: boolean): Promise<any> {
    return this.api.put(`/bodegas/${id}`, { activa }).then((actualizada) => {
      this.bodegas.update((lista) => lista.map((b) => (b.id === id ? actualizada : b)));
      return actualizada;
    });
  }
}