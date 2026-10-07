import { query, queryOne } from '../config/db';
import { CategoriaRow } from '../models/types';

export const categoriaRepo = {
  async listar(empresaId?: number | null): Promise<CategoriaRow[]> {
    if (empresaId != null) {
      return query<CategoriaRow>(`SELECT * FROM categorias WHERE empresa_id = $1 ORDER BY nombre`, [empresaId]);
    }
    return query<CategoriaRow>(`SELECT * FROM categorias ORDER BY nombre`);
  },

  async buscarPorId(id: number, empresaId?: number | null): Promise<CategoriaRow | null> {
    if (empresaId != null) {
      return queryOne<CategoriaRow>(`SELECT * FROM categorias WHERE id = $1 AND empresa_id = $2`, [id, empresaId]);
    }
    return queryOne<CategoriaRow>(`SELECT * FROM categorias WHERE id = $1`, [id]);
  },

  async buscarPorNombre(nombre: string, empresaId?: number | null): Promise<CategoriaRow | null> {
    if (empresaId != null) {
      return queryOne<CategoriaRow>(`SELECT * FROM categorias WHERE LOWER(nombre) = LOWER($1) AND empresa_id = $2`, [nombre, empresaId]);
    }
    return queryOne<CategoriaRow>(`SELECT * FROM categorias WHERE LOWER(nombre) = LOWER($1)`, [nombre]);
  },

  async buscarOPorNombre(nombre: string, empresaId?: number | null): Promise<CategoriaRow | null> {
    return this.buscarPorNombre(nombre, empresaId);
  },

  async crear(nombre: string, descripcion?: string, empresaId?: number | null): Promise<CategoriaRow> {
    const filas = await query<CategoriaRow>(
      `INSERT INTO categorias (empresa_id, nombre, descripcion) VALUES ($1, $2, $3) RETURNING *`,
      [empresaId ?? null, nombre.trim(), descripcion?.trim() || null]
    );
    return filas[0];
  },

  async actualizar(id: number, data: { nombre?: string; descripcion?: string; estado?: string }): Promise<CategoriaRow | null> {
    const setValues: string[] = [];
    const params: any[] = [];

    if (data.nombre !== undefined) {
      params.push(data.nombre);
      setValues.push(`nombre = $${params.length}`);
    }
    if (data.descripcion !== undefined) {
      params.push(data.descripcion || null);
      setValues.push(`descripcion = $${params.length}`);
    }
    if (data.estado !== undefined) {
      params.push(data.estado);
      setValues.push(`estado = $${params.length}`);
    }
    if (!setValues.length) return this.buscarPorId(id);

    params.push(id);
    const filas = await query<CategoriaRow>(
      `UPDATE categorias SET ${setValues.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return filas.length ? filas[0] : null;
  },

  async eliminar(id: number): Promise<void> {
    await query(`DELETE FROM categorias WHERE id = $1`, [id]);
  },
};