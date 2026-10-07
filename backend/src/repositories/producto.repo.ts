import { query, queryOne } from '../config/db';
import { ProductoRow } from '../models/types';

export interface CrearProductoData {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  categoriaId?: number | null;
  bodegaId?: number | null;
  precio: number;
  costo?: number;
  stock: number;
  stockMin?: number;
  empresaId?: number | null;
}

const SELECT_BASE = `
  SELECT
    p.id, p.codigo, p.nombre, p.descripcion, p.categoria_id, p.bodega_id,
    p.precio, p.costo, p.stock, p.stock_min, p.estado,
    c.nombre AS categoria,
    b.nombre AS bodega
  FROM productos p
  LEFT JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN bodegas b ON b.id = p.bodega_id
`;

export const productoRepo = {
  async listar(filtros: { busqueda?: string; categoriaId?: number | null; bodegaId?: number | null; empresaId?: number | null } = {}): Promise<(ProductoRow & { totalValor?: number })[]> {
    const condiciones: string[] = [];
    const params: any[] = [];

    if (filtros.empresaId != null) {
      params.push(filtros.empresaId);
      condiciones.push(`p.empresa_id = $${params.length}`);
    }
    if (filtros.busqueda) {
      params.push(`%${filtros.busqueda}%`);
      condiciones.push(`(p.nombre ILIKE $${params.length} OR p.codigo ILIKE $${params.length} OR c.nombre ILIKE $${params.length} OR b.nombre ILIKE $${params.length})`);
    }
    if (filtros.categoriaId) {
      params.push(filtros.categoriaId);
      condiciones.push(`p.categoria_id = $${params.length}`);
    }
    if (filtros.bodegaId) {
      params.push(filtros.bodegaId);
      condiciones.push(`p.bodega_id = $${params.length}`);
    }
    if (filtros.bodegaId === null || filtros.bodegaId === 0) {
      // sin filtro
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    return query<ProductoRow & { totalValor?: number }>(`${SELECT_BASE} ${where} ORDER BY p.fecha_creacion DESC`, params);
  },

  async buscarPorId(id: number, empresaId?: number | null): Promise<ProductoRow | null> {
    if (empresaId != null) {
      return queryOne<ProductoRow>(`${SELECT_BASE} WHERE p.id = $1 AND p.empresa_id = $2`, [id, empresaId]);
    }
    return queryOne<ProductoRow>(`${SELECT_BASE} WHERE p.id = $1`, [id]);
  },

  async buscarPorCodigo(codigo: string, empresaId?: number | null): Promise<ProductoRow | null> {
    if (empresaId != null) {
      return queryOne<ProductoRow>(`${SELECT_BASE} WHERE LOWER(p.codigo) = LOWER($1) AND p.empresa_id = $2`, [codigo, empresaId]);
    }
    return queryOne<ProductoRow>(`${SELECT_BASE} WHERE LOWER(p.codigo) = LOWER($1)`, [codigo]);
  },

  async buscarOPorCodigo(codigo: string, empresaId?: number | null): Promise<ProductoRow | null> {
    return this.buscarPorCodigo(codigo, empresaId);
  },

  async crear(data: CrearProductoData): Promise<ProductoRow> {
    const filas = await query<ProductoRow>(
      `INSERT INTO productos (empresa_id, codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, codigo, nombre, descripcion, categoria_id, bodega_id, precio, costo, stock, stock_min, estado`,
      [
        data.empresaId ?? null,
        data.codigo.trim().toUpperCase(),
        data.nombre.trim(),
        data.descripcion ?? null,
        data.categoriaId ?? null,
        data.bodegaId ?? null,
        data.precio,
        data.costo ?? data.precio,
        data.stock,
        data.stockMin ?? 0,
      ]
    );
    const creado = filas[0];
    if (creado.bodega_id && data.stock > 0) {
      await query(`UPDATE bodegas SET ocupado = LEAST(capacidad, ocupado + $2) WHERE id = $1`, [creado.bodega_id, data.stock]);
    }
    return creado;
  },

  async actualizar(id: number, data: Partial<CrearProductoData> & { estado?: string }): Promise<ProductoRow | null> {
    const setValues: string[] = [];
    const params: any[] = [];

    const campos: Record<string, any> = {
      codigo: data.codigo,
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoria_id: data.categoriaId,
      bodega_id: data.bodegaId,
      precio: data.precio,
      costo: data.costo,
      stock: data.stock,
      stock_min: data.stockMin,
      estado: data.estado,
    };

    Object.entries(campos).forEach(([campo, valor]) => {
      if (valor !== undefined) {
        params.push(valor);
        setValues.push(`${campo} = $${params.length}`);
      }
    });

    if (!setValues.length) return this.buscarPorId(id);

    params.push(id);
    const filas = await query<ProductoRow>(
      `UPDATE productos SET ${setValues.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return filas.length ? filas[0] : null;
  },

  async ajustarStock(id: number, delta: number): Promise<void> {
    await query(
      `UPDATE productos SET stock = GREATEST(0, stock + $2) WHERE id = $1`,
      [id, delta]
    );
  },

  async eliminar(id: number): Promise<void> {
    await query(`DELETE FROM productos WHERE id = $1`, [id]);
  },

  async contar(empresaId?: number | null): Promise<number> {
    if (empresaId != null) {
      const filas = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM productos WHERE empresa_id = $1`, [empresaId]);
      return Number(filas[0]?.total || 0);
    }
    const filas = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM productos`);
    return Number(filas[0]?.total || 0);
  },

  async valorTotalInventario(empresaId?: number | null): Promise<number> {
    if (empresaId != null) {
      const filas = await query<{ total: string }>(`SELECT COALESCE(SUM(precio * stock), 0) AS total FROM productos WHERE empresa_id = $1`, [empresaId]);
      return Number(filas[0]?.total || 0);
    }
    const filas = await query<{ total: string }>(`SELECT COALESCE(SUM(precio * stock), 0) AS total FROM productos`);
    return Number(filas[0]?.total || 0);
  },

  async contarAlertasStock(empresaId?: number | null): Promise<number> {
    if (empresaId != null) {
      const filas = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM productos WHERE empresa_id = $1 AND stock <= stock_min AND stock_min > 0`, [empresaId]);
      return Number(filas[0]?.total || 0);
    }
    const filas = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM productos WHERE stock <= stock_min AND stock_min > 0`);
    return Number(filas[0]?.total || 0);
  },

  async listarStockBajo(empresaId?: number | null): Promise<ProductoRow[]> {
    if (empresaId != null) {
      return query<ProductoRow>(
        `SELECT p.id, p.codigo, p.nombre, p.stock, p.stock_min, p.bodega_id, b.nombre AS bodega
         FROM productos p
         LEFT JOIN bodegas b ON b.id = p.bodega_id
         WHERE p.empresa_id = $1 AND p.stock <= p.stock_min AND p.stock_min > 0
         ORDER BY p.stock ASC LIMIT 10`,
        [empresaId]
      );
    }
    return query<ProductoRow>(
      `SELECT p.id, p.codigo, p.nombre, p.stock, p.stock_min, p.bodega_id, b.nombre AS bodega
       FROM productos p
       LEFT JOIN bodegas b ON b.id = p.bodega_id
       WHERE p.stock <= p.stock_min AND p.stock_min > 0
       ORDER BY p.stock ASC LIMIT 10`
    );
  },
};