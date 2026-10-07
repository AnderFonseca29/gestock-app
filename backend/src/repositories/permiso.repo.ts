import { query, queryOne } from '../config/db';
import { PermisoRow } from '../models/types';

export const permisoRepo = {
  async listar(): Promise<PermisoRow[]> {
    return query<PermisoRow>(`SELECT * FROM permisos ORDER BY modulo, id`);
  },

  async listarPorModulo(modulo: string): Promise<PermisoRow[]> {
    return query<PermisoRow>(`SELECT * FROM permisos WHERE modulo = $1 ORDER BY id`, [modulo]);
  },

  async buscarPorId(id: number): Promise<PermisoRow | null> {
    return queryOne<PermisoRow>(`SELECT * FROM permisos WHERE id = $1`, [id]);
  },

  async buscarPorCodigo(codigo: string): Promise<PermisoRow | null> {
    return queryOne<PermisoRow>(`SELECT * FROM permisos WHERE codigo = $1`, [codigo]);
  },

  async listarModulos(): Promise<string[]> {
    const filas = await query<{ modulo: string }>(
      `SELECT DISTINCT modulo FROM permisos ORDER BY modulo`
    );
    return filas.map((f) => f.modulo);
  },
};