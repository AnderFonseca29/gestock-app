import { query, queryOne } from '../config/db';
import { BodegaRow } from '../models/types';

export interface CrearBodegaData {
  nombre: string;
  codigo: string;
  ciudad?: string | null;
  direccion?: string | null;
  responsable?: string | null;
  telefono?: string | null;
  capacidad?: number;
  empresaId?: number | null;
}

export const bodegaRepo = {
  async listar(empresaId?: number | null): Promise<BodegaRow[]> {
    if (empresaId != null) {
      return query<BodegaRow>(`SELECT * FROM bodegas WHERE empresa_id = $1 ORDER BY nombre`, [empresaId]);
    }
    return query<BodegaRow>(`SELECT * FROM bodegas ORDER BY nombre`);
  },

  async listarActivas(empresaId?: number | null): Promise<BodegaRow[]> {
    if (empresaId != null) {
      return query<BodegaRow>(`SELECT * FROM bodegas WHERE empresa_id = $1 AND activa = TRUE ORDER BY nombre`, [empresaId]);
    }
    return query<BodegaRow>(`SELECT * FROM bodegas WHERE activa = TRUE ORDER BY nombre`);
  },

  async buscarPorId(id: number, empresaId?: number | null): Promise<BodegaRow | null> {
    if (empresaId != null) {
      return queryOne<BodegaRow>(`SELECT * FROM bodegas WHERE id = $1 AND empresa_id = $2`, [id, empresaId]);
    }
    return queryOne<BodegaRow>(`SELECT * FROM bodegas WHERE id = $1`, [id]);
  },

  async buscarPorCodigo(codigo: string, empresaId?: number | null): Promise<BodegaRow | null> {
    if (empresaId != null) {
      return queryOne<BodegaRow>(`SELECT * FROM bodegas WHERE codigo = $1 AND empresa_id = $2`, [codigo, empresaId]);
    }
    return queryOne<BodegaRow>(`SELECT * FROM bodegas WHERE codigo = $1`, [codigo]);
  },

  async buscarOPorNombre(nombre: string, empresaId?: number | null): Promise<BodegaRow | null> {
    if (empresaId != null) {
      return queryOne<BodegaRow>(`SELECT * FROM bodegas WHERE LOWER(nombre) = LOWER($1) AND empresa_id = $2`, [nombre, empresaId]);
    }
    return queryOne<BodegaRow>(`SELECT * FROM bodegas WHERE LOWER(nombre) = LOWER($1)`, [nombre]);
  },

  async buscarPorIdONombre(valor: string | number, empresaId?: number | null): Promise<BodegaRow | null> {
    const id = Number(valor);
    if (!isNaN(id)) {
      const porId = await this.buscarPorId(id, empresaId);
      if (porId) return porId;
    }
    if (empresaId != null) {
      return queryOne<BodegaRow>(`SELECT * FROM bodegas WHERE (LOWER(codigo) = LOWER($1) OR LOWER(nombre) = LOWER($1)) AND empresa_id = $2`, [String(valor), empresaId]);
    }
    return queryOne<BodegaRow>(`SELECT * FROM bodegas WHERE LOWER(codigo) = LOWER($1) OR LOWER(nombre) = LOWER($1)`, [String(valor)]);
  },

  async crear(data: CrearBodegaData): Promise<BodegaRow> {
    const filas = await query<BodegaRow>(
      `INSERT INTO bodegas (empresa_id, nombre, codigo, ciudad, direccion, responsable, telefono, capacidad)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.empresaId ?? null, data.nombre.trim(), data.codigo.trim().toUpperCase(), data.ciudad ?? null, data.direccion ?? null, data.responsable ?? null, data.telefono ?? null, data.capacidad ?? 0]
    );
    return filas[0];
  },

  async actualizar(
    id: number,
    data: Partial<CrearBodegaData> & { activa?: boolean; ocupado?: number }
  ): Promise<BodegaRow | null> {
    const setValues: string[] = [];
    const params: any[] = [];

    const campos: Record<string, any> = {
      nombre: data.nombre,
      codigo: data.codigo,
      ciudad: data.ciudad,
      direccion: data.direccion,
      responsable: data.responsable,
      telefono: data.telefono,
      capacidad: data.capacidad,
      activa: data.activa,
      ocupado: data.ocupado,
    };

    Object.entries(campos).forEach(([campo, valor]) => {
      if (valor !== undefined) {
        params.push(valor);
        setValues.push(`${campo} = $${params.length}`);
      }
    });

    if (!setValues.length) return this.buscarPorId(id);

    params.push(id);
    const filas = await query<BodegaRow>(
      `UPDATE bodegas SET ${setValues.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return filas.length ? filas[0] : null;
  },

  async eliminar(id: number): Promise<void> {
    await query(`DELETE FROM bodegas WHERE id = $1`, [id]);
  },

  async sumarOcupado(bodegaId: number, cantidad: number): Promise<void> {
    const bodega = await this.buscarPorId(bodegaId);
    if (!bodega) return;
    const nuevo = Math.max(0, Math.min(bodega.capacidad, bodega.ocupado + cantidad));
    await query(`UPDATE bodegas SET ocupado = $2 WHERE id = $1`, [bodegaId, nuevo]);
  },
};