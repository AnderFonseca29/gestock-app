import { query, queryOne } from '../config/db';
import { RolRow } from '../models/types';

export interface CrearRolData {
  nombre: string;
  descripcion?: string;
  permisoIds?: number[];
}

export const rolRepo = {
  async listar(): Promise<RolRow[]> {
    return query<RolRow>(`SELECT * FROM roles ORDER BY id`);
  },

  async listarConPermisos(): Promise<(RolRow & { permiso_ids: number[]; permiso_codigos: string[] })[]> {
    const filas = await query<RolRow & { permiso_ids: number[]; permiso_codigos: string[] }>(
      `SELECT
         r.id, r.nombre, r.descripcion, r.estado, r.fecha_creacion,
         COALESCE(ARRAY_AGG(rp.permiso_id) FILTER (WHERE rp.permiso_id IS NOT NULL), '{}') AS permiso_ids,
         COALESCE(ARRAY_AGG(p.codigo) FILTER (WHERE p.codigo IS NOT NULL), '{}') AS permiso_codigos
       FROM roles r
       LEFT JOIN rol_permiso rp ON rp.rol_id = r.id
       LEFT JOIN permisos p ON p.id = rp.permiso_id
       GROUP BY r.id, r.nombre, r.descripcion, r.estado, r.fecha_creacion
       ORDER BY r.id`
    );
    return filas;
  },

  async buscarPorId(id: number): Promise<RolRow | null> {
    return queryOne<RolRow>(`SELECT * FROM roles WHERE id = $1`, [id]);
  },

  async buscarPorNombre(nombre: string): Promise<RolRow | null> {
    return queryOne<RolRow>(`SELECT * FROM roles WHERE LOWER(nombre) = LOWER($1)`, [nombre]);
  },

  async crear(data: CrearRolData): Promise<RolRow> {
    const filas = await query<RolRow>(
      `INSERT INTO roles (nombre, descripcion) VALUES ($1, $2) RETURNING *`,
      [data.nombre, data.descripcion?.trim() || null]
    );
    return filas[0];
  },

  async actualizar(id: number, data: { nombre?: string; descripcion?: string }): Promise<RolRow | null> {
    const setValues: string[] = [];
    const params: any[] = [];
    if (data.nombre !== undefined) {
      params.push(data.nombre);
      setValues.push(`nombre = $${params.length}`);
    }
    if (data.descripcion !== undefined) {
      params.push(data.descripcion.trim() || null);
      setValues.push(`descripcion = $${params.length}`);
    }
    if (!setValues.length) return this.buscarPorId(id);
    params.push(id);
    const filas = await query<RolRow>(
      `UPDATE roles SET ${setValues.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return filas.length ? filas[0] : null;
  },

  async cambiarEstado(id: number, estado: 'Activo' | 'Inactivo'): Promise<RolRow | null> {
    const filas = await query<RolRow>(`UPDATE roles SET estado = $2 WHERE id = $1 RETURNING *`, [id, estado]);
    return filas.length ? filas[0] : null;
  },

  async asignarPermisos(id: number, permisoIds: number[]): Promise<void> {
    await query(`DELETE FROM rol_permiso WHERE rol_id = $1`, [id]);
    for (const permisoId of permisoIds) {
      await query(`INSERT INTO rol_permiso (rol_id, permiso_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [id, permisoId]);
    }
  },

  async contarUsuariosConRol(id: number): Promise<number> {
    const filas = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM usuarios WHERE rol_id = $1`, [id]);
    return Number(filas[0]?.total || 0);
  },

  async eliminar(id: number): Promise<void> {
    await query(`DELETE FROM roles WHERE id = $1`, [id]);
  },
};