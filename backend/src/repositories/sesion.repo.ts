import { query, queryOne } from '../config/db';
import { SesionRow } from '../models/types';

export interface CrearSesionData {
  usuarioId: number;
  empresaId?: number | null;
  ip?: string | null;
  userAgent?: string | null;
  dispositivo?: string | null;
  navegador?: string | null;
}

export const sesionRepo = {
  async crear(data: CrearSesionData): Promise<SesionRow> {
    const filas = await query<SesionRow>(
      `INSERT INTO sesiones (usuario_id, empresa_id, ip, user_agent, dispositivo, navegador)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.usuarioId, data.empresaId ?? null, data.ip ?? null, data.userAgent ?? null, data.dispositivo ?? null, data.navegador ?? null]
    );
    return filas[0];
  },

  async cerrar(id: number): Promise<void> {
    await query(
      `UPDATE sesiones SET fecha_cierre = NOW(), estado = 'Cerrada' WHERE id = $1 AND estado = 'Activa'`,
      [id]
    );
  },

  async cerrarOtras(usuarioId: number, sesionActualId: number): Promise<void> {
    await query(
      `UPDATE sesiones SET fecha_cierre = NOW(), estado = 'Cerrada'
       WHERE usuario_id = $1 AND id <> $2 AND estado = 'Activa'`,
      [usuarioId, sesionActualId]
    );
  },

  async eliminarPorUsuario(usuarioId: number): Promise<void> {
    await query(`DELETE FROM sesiones WHERE usuario_id = $1`, [usuarioId]);
  },

  async listarActivas(usuarioId?: number, empresaId?: number | null): Promise<SesionRow[]> {
    if (usuarioId) {
      return query<SesionRow>(
        `SELECT s.*, CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre, u.email AS usuario_email
         FROM sesiones s
         JOIN usuarios u ON u.id = s.usuario_id
         WHERE s.usuario_id = $1
         ORDER BY s.fecha_inicio DESC`,
        [usuarioId]
      );
    }
    const condiciones: string[] = [];
    const params: any[] = [];
    if (empresaId != null) {
      params.push(empresaId);
      condiciones.push(`s.empresa_id = $${params.length}`);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    return query<SesionRow>(
      `SELECT s.*, CONCAT(u.nombre, ' ', u.apellido) AS usuario_nombre, u.email AS usuario_email
       FROM sesiones s
       JOIN usuarios u ON u.id = s.usuario_id
       ${where}
       ORDER BY s.fecha_inicio DESC`,
      params
    );
  },

  async listar(empresaId?: number | null) {
    return this.listarActivas(undefined, empresaId);
  },

  async buscarPorId(id: number): Promise<SesionRow | null> {
    return queryOne<SesionRow>(`SELECT * FROM sesiones WHERE id = $1`, [id]);
  },
};