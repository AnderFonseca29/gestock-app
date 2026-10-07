import { query } from '../config/db';
import { NotificacionRow } from '../models/types';

export const notificacionRepo = {
  async listarPorUsuario(usuarioId: number): Promise<NotificacionRow[]> {
    return query<NotificacionRow>(
      `SELECT * FROM notificaciones WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT 50`,
      [usuarioId]
    );
  },

  async listarTodas(): Promise<NotificacionRow[]> {
    return query<NotificacionRow>(`SELECT * FROM notificaciones ORDER BY fecha DESC LIMIT 200`);
  },

  async crear(usuarioId: number, data: { titulo: string; mensaje: string; tipo: string }): Promise<void> {
    await query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo) VALUES ($1, $2, $3, $4)`,
      [usuarioId, data.titulo, data.mensaje, data.tipo]
    );
  },

  async crearParaVarios(usuarioIds: number[], data: { titulo: string; mensaje: string; tipo: string }): Promise<void> {
    for (const userId of usuarioIds) {
      await this.crear(userId, data);
    }
  },

  async marcarLeida(id: number): Promise<void> {
    await query(`UPDATE notificaciones SET leida = TRUE WHERE id = $1`, [id]);
  },

  async marcarTodasLeidas(usuarioId: number): Promise<void> {
    await query(`UPDATE notificaciones SET leida = TRUE WHERE usuario_id = $1`, [usuarioId]);
  },

  async contarNoLeidas(usuarioId: number): Promise<number> {
    const filas = await query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM notificaciones WHERE usuario_id = $1 AND leida = FALSE`,
      [usuarioId]
    );
    return Number(filas[0]?.total || 0);
  },
};