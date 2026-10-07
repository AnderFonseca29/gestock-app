import { query, queryOne } from '../config/db';
import { RecepcionRow } from '../models/types';

export interface CrearRecepcionData {
  numeroDocumento: string;
  proveedor: string;
  bodegaId?: number | null;
  estado?: 'En Proceso' | 'Validado' | 'Discrepancia';
  observaciones?: string | null;
  usuarioId: number;
  empresaId?: number | null;
}

export const recepcionRepo = {
  async listar(empresaId?: number | null): Promise<(RecepcionRow & { usuario_nombre?: string; bodega_nombre?: string })[]> {
    if (empresaId != null) {
      return query<RecepcionRow & { usuario_nombre?: string; bodega_nombre?: string }>(
        `SELECT
           r.*,
           CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre,
           b.nombre AS bodega_nombre
         FROM recepciones r
         LEFT JOIN usuarios u ON u.id = r.usuario_id
         LEFT JOIN bodegas b ON b.id = r.bodega_id
         WHERE r.empresa_id = $1
         ORDER BY r.fecha_recepcion DESC`,
        [empresaId]
      );
    }
    return query<RecepcionRow & { usuario_nombre?: string; bodega_nombre?: string }>(
      `SELECT
         r.*,
         CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre,
         b.nombre AS bodega_nombre
       FROM recepciones r
       LEFT JOIN usuarios u ON u.id = r.usuario_id
       LEFT JOIN bodegas b ON b.id = r.bodega_id
       ORDER BY r.fecha_recepcion DESC`
    );
  },

  async buscarPorId(id: number, empresaId?: number | null): Promise<RecepcionRow | null> {
    if (empresaId != null) {
      return queryOne<RecepcionRow>(`SELECT * FROM recepciones WHERE id = $1 AND empresa_id = $2`, [id, empresaId]);
    }
    return queryOne<RecepcionRow>(`SELECT * FROM recepciones WHERE id = $1`, [id]);
  },

  async crear(data: CrearRecepcionData): Promise<RecepcionRow> {
    const filas = await query<RecepcionRow>(
      `INSERT INTO recepciones (empresa_id, numero_documento, proveedor, bodega_id, estado, observaciones, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.empresaId ?? null, data.numeroDocumento.trim(), data.proveedor.trim(), data.bodegaId ?? null, data.estado ?? 'En Proceso', data.observaciones ?? null, data.usuarioId]
    );
    return filas[0];
  },

  async actualizar(id: number, data: Partial<CrearRecepcionData>): Promise<RecepcionRow | null> {
    const setValues: string[] = [];
    const params: any[] = [];

    const campos: Record<string, any> = {
      numero_documento: data.numeroDocumento,
      proveedor: data.proveedor,
      bodega_id: data.bodegaId,
      estado: data.estado,
      observaciones: data.observaciones,
    };

    Object.entries(campos).forEach(([campo, valor]) => {
      if (valor !== undefined) {
        params.push(valor);
        setValues.push(`${campo} = $${params.length}`);
      }
    });

    if (!setValues.length) return this.buscarPorId(id);

    params.push(id);
    const filas = await query<RecepcionRow>(
      `UPDATE recepciones SET ${setValues.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return filas.length ? filas[0] : null;
  },

  async eliminar(id: number): Promise<void> {
    await query(`DELETE FROM recepciones WHERE id = $1`, [id]);
  },
};