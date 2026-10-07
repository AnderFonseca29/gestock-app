import { query, queryOne } from '../config/db';
import { MovimientoRow } from '../models/types';

export interface CrearMovimientoData {
  productoId?: number | null;
  bodegaId?: number | null;
  tipo: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';
  cantidad: number;
  motivo: string;
  responsable: string;
  observaciones?: string | null;
  estado?: 'Validado' | 'Discrepancia';
  usuarioId?: number | null;
  empresaId?: number | null;
}

export const movimientoRepo = {
  async listar(filtros: {
    busqueda?: string;
    tipo?: string;
    estado?: string;
    desde?: string;
    hasta?: string;
    empresaId?: number | null;
  } = {}): Promise<(MovimientoRow & { sku?: string; producto?: string; bodega?: string })[]> {
    const condiciones: string[] = [];
    const params: any[] = [];

    if (filtros.empresaId != null) {
      params.push(filtros.empresaId);
      condiciones.push(`m.empresa_id = $${params.length}`);
    }
    if (filtros.busqueda) {
      params.push(`%${filtros.busqueda}%`);
      condiciones.push(`(p.nombre ILIKE $${params.length} OR p.codigo ILIKE $${params.length} OR m.responsable ILIKE $${params.length})`);
    }
    if (filtros.tipo && filtros.tipo !== 'TODOS') {
      params.push(filtros.tipo);
      condiciones.push(`m.tipo = $${params.length}`);
    }
    if (filtros.estado && filtros.estado !== 'TODOS') {
      params.push(filtros.estado);
      condiciones.push(`m.estado = $${params.length}`);
    }
    if (filtros.desde) {
      params.push(filtros.desde);
      condiciones.push(`m.fecha::date >= $${params.length}`);
    }
    if (filtros.hasta) {
      params.push(filtros.hasta);
      condiciones.push(`m.fecha::date <= $${params.length}`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    return query<MovimientoRow & { sku?: string; producto?: string; bodega?: string }>(
      `SELECT
         m.id, m.producto_id, m.bodega_id, m.tipo, m.cantidad, m.motivo, m.responsable,
         m.observaciones, m.estado, m.usuario_id, m.fecha,
         p.codigo AS sku, p.nombre AS producto, b.nombre AS bodega
       FROM movimientos_inventario m
       LEFT JOIN productos p ON p.id = m.producto_id
       LEFT JOIN bodegas b ON b.id = m.bodega_id
       ${where}
       ORDER BY m.fecha DESC
       LIMIT 500`,
      params
    );
  },

  async buscarPorId(id: number, empresaId?: number | null): Promise<MovimientoRow | null> {
    if (empresaId != null) {
      return queryOne<MovimientoRow>(`SELECT * FROM movimientos_inventario WHERE id = $1 AND empresa_id = $2`, [id, empresaId]);
    }
    return queryOne<MovimientoRow>(`SELECT * FROM movimientos_inventario WHERE id = $1`, [id]);
  },

  async crear(data: CrearMovimientoData): Promise<MovimientoRow> {
    const filas = await query<MovimientoRow>(
      `INSERT INTO movimientos_inventario
         (empresa_id, producto_id, bodega_id, tipo, cantidad, motivo, responsable, observaciones, estado, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.empresaId ?? null,
        data.productoId ?? null,
        data.bodegaId ?? null,
        data.tipo,
        data.cantidad,
        data.motivo,
        data.responsable,
        data.observaciones ?? null,
        data.estado ?? 'Validado',
        data.usuarioId ?? null,
      ]
    );

    if (data.productoId && data.tipo !== 'TRANSFERENCIA') {
      const delta = data.tipo === 'ENTRADA' ? data.cantidad : -data.cantidad;
      await query(`UPDATE productos SET stock = GREATEST(0, stock + $2) WHERE id = $1`, [data.productoId, delta]);
    }
    if (data.bodegaId) {
      const deltaOcupado = data.tipo === 'ENTRADA' ? data.cantidad : -data.cantidad;
      await query(
        `UPDATE bodegas SET ocupado = LEAST(capacidad, GREATEST(0, ocupado + $2)) WHERE id = $1`,
        [data.bodegaId, deltaOcupado]
      );
    }
    return filas[0];
  },

  async eliminar(id: number): Promise<void> {
    await query(`DELETE FROM movimientos_inventario WHERE id = $1`, [id]);
  },

  async totales(empresaId?: number | null): Promise<{ totalEntradas: number; totalSalidas: number }> {
    const filtro = empresaId != null ? `WHERE empresa_id = $1` : '';
    const params: any[] = empresaId != null ? [empresaId] : [];
    const filas = await query<{ totalEntradas: string; totalSalidas: string }>(
      `SELECT
         COALESCE(SUM(CASE WHEN tipo = 'ENTRADA' THEN cantidad ELSE 0 END), 0) AS "totalEntradas",
         COALESCE(SUM(CASE WHEN tipo = 'SALIDA' THEN cantidad ELSE 0 END), 0) AS "totalSalidas"
       FROM movimientos_inventario
       ${filtro}`,
      params
    );
    const f = filas[0] || { totalEntradas: '0', totalSalidas: '0' };
    return { totalEntradas: Number(f.totalEntradas), totalSalidas: Number(f.totalSalidas) };
  },
};