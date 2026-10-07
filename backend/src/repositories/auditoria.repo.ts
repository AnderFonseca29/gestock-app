import { query, queryOne } from '../config/db';
import { AuditoriaRow } from '../models/types';

const SOLO_ACCIONES_USUARIOS = `
  ((a.modulo = 'AUTENTICACIÓN' AND a.accion IN ('LOGIN', 'LOGOUT'))
   OR (a.modulo = 'USUARIOS' AND a.accion IN ('CREAR', 'ACTUALIZAR', 'ELIMINAR')))`;

export const auditoriaRepo = {
  async listar(filtros: { busqueda?: string; accion?: string; modulo?: string } = {}): Promise<AuditoriaRow[]> {
    const condiciones: string[] = [SOLO_ACCIONES_USUARIOS];
    const params: any[] = [];

    if (filtros.busqueda) {
      params.push(`%${filtros.busqueda}%`);
      condiciones.push(`(a.usuario_nombre ILIKE $${params.length} OR a.entidad ILIKE $${params.length} OR a.descripcion ILIKE $${params.length})`);
    }
    if (filtros.accion && filtros.accion !== 'TODOS') {
      params.push(filtros.accion);
      condiciones.push(`a.accion = $${params.length}`);
    }
    if (filtros.modulo && filtros.modulo !== 'TODOS') {
      params.push(filtros.modulo);
      condiciones.push(`a.modulo = $${params.length}`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    return query<AuditoriaRow>(
      `SELECT a.id, a.usuario_id, a.usuario_nombre, a.accion, a.modulo, a.entidad, a.registro_id, a.descripcion, a.fecha
       FROM auditorias a
       ${where}
       ORDER BY a.fecha DESC
       LIMIT 1000`,
      params
    );
  },

  async buscarPorId(id: number): Promise<AuditoriaRow | null> {
    return queryOne<AuditoriaRow>(`SELECT * FROM auditorias WHERE id = $1`, [id]);
  },

  async listarModulos(): Promise<string[]> {
    const filas = await query<{ modulo: string }>(`SELECT DISTINCT modulo FROM auditorias ORDER BY modulo`);
    return filas.map((f) => f.modulo);
  },
};