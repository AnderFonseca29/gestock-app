import { query, queryOne } from '../config/db';
import { MantenimientoRow } from '../models/types';

export interface CrearMantenimientoData {
  equipo: string;
  tipo: 'Preventivo' | 'Correctivo' | 'Predictivo';
  fechaProgramada: string;
  descripcion?: string | null;
  usuarioId?: number | null;
  empresaId?: number | null;
}

export const mantenimientoRepo = {
  async listar(empresaId?: number | null): Promise<(MantenimientoRow & { responsable_nombre?: string })[]> {
    if (empresaId != null) {
      return query<MantenimientoRow & { responsable_nombre?: string }>(
        `SELECT
           m.id, m.equipo, m.tipo, m.fecha_programada, m.estado, m.usuario_id, m.descripcion,
           CONCAT(u.nombre, ' ', u.apellido) AS responsable_nombre
         FROM mantenimientos m
         LEFT JOIN usuarios u ON u.id = m.usuario_id
         WHERE m.empresa_id = $1
         ORDER BY m.fecha_programada DESC`,
        [empresaId]
      );
    }
    return query<MantenimientoRow & { responsable_nombre?: string }>(
      `SELECT
         m.id, m.equipo, m.tipo, m.fecha_programada, m.estado, m.usuario_id, m.descripcion,
         CONCAT(u.nombre, ' ', u.apellido) AS responsable_nombre
       FROM mantenimientos m
       LEFT JOIN usuarios u ON u.id = m.usuario_id
       ORDER BY m.fecha_programada DESC`
    );
  },

  async buscarPorId(id: number, empresaId?: number | null): Promise<MantenimientoRow | null> {
    if (empresaId != null) {
      return queryOne<MantenimientoRow>(`SELECT * FROM mantenimientos WHERE id = $1 AND empresa_id = $2`, [id, empresaId]);
    }
    return queryOne<MantenimientoRow>(`SELECT * FROM mantenimientos WHERE id = $1`, [id]);
  },

  async crear(data: CrearMantenimientoData): Promise<MantenimientoRow> {
    const filas = await query<MantenimientoRow>(
      `INSERT INTO mantenimientos (empresa_id, equipo, tipo, fecha_programada, descripcion, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.empresaId ?? null, data.equipo.trim(), data.tipo, data.fechaProgramada, data.descripcion ?? null, data.usuarioId ?? null]
    );
    return filas[0];
  },

  async actualizar(id: number, data: Partial<CrearMantenimientoData> & { estado?: string }): Promise<MantenimientoRow | null> {
    const setValues: string[] = [];
    const params: any[] = [];

    const campos: Record<string, any> = {
      equipo: data.equipo,
      tipo: data.tipo,
      fecha_programada: data.fechaProgramada,
      descripcion: data.descripcion,
      usuario_id: data.usuarioId,
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
    const filas = await query<MantenimientoRow>(
      `UPDATE mantenimientos SET ${setValues.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return filas.length ? filas[0] : null;
  },

  async eliminar(id: number): Promise<void> {
    await query(`DELETE FROM mantenimientos WHERE id = $1`, [id]);
  },
};