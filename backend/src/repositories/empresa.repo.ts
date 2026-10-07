import { query, queryOne } from '../config/db';
import { EmpresaRow } from '../models/types';

export interface CrearEmpresaData {
  nombre: string;
  nit: string;
  correo: string;
  telefono?: string | null;
  direccion?: string | null;
  moneda?: string;
  formatoFecha?: string;
}

export const empresaRepo = {
  async listar(): Promise<EmpresaRow[]> {
    return query<EmpresaRow>(`SELECT * FROM empresas ORDER BY fecha_creacion DESC`);
  },

  async buscarPorId(id: number): Promise<EmpresaRow | null> {
    return queryOne<EmpresaRow>(`SELECT * FROM empresas WHERE id = $1`, [id]);
  },

  async buscarPorNit(nit: string): Promise<EmpresaRow | null> {
    return queryOne<EmpresaRow>(`SELECT * FROM empresas WHERE nit = $1`, [nit]);
  },

  async crear(data: CrearEmpresaData): Promise<EmpresaRow> {
    const filas = await query<EmpresaRow>(
      `INSERT INTO empresas (nombre, nit, correo, telefono, direccion, moneda, formato_fecha)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        data.nombre,
        data.nit,
        data.correo,
        data.telefono ?? null,
        data.direccion ?? null,
        data.moneda ?? 'COP - Peso Colombiano',
        data.formatoFecha ?? 'DD/MM/YYYY',
      ]
    );
    return filas[0];
  },

  async actualizar(
    id: number,
    data: Partial<CrearEmpresaData> & { estado?: string }
  ): Promise<EmpresaRow | null> {
    const setValues: string[] = [];
    const params: any[] = [];

    const campos: Record<string, any> = {
      nombre: data.nombre,
      nit: data.nit,
      correo: data.correo,
      telefono: data.telefono,
      direccion: data.direccion,
      moneda: data.moneda,
      formato_fecha: data.formatoFecha,
      estado: data.estado,
    };

    Object.entries(campos).forEach(([campo, valor]) => {
      if (valor !== undefined) {
        params.push(valor);
        setValues.push(`${campo} = $${params.length}`);
      }
    });

    if (!setValues.length) return this.buscarPorId(id);

    setValues.push(`fecha_actualizacion = NOW()`);
    params.push(id);

    const filas = await query<EmpresaRow>(
      `UPDATE empresas SET ${setValues.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return filas.length ? filas[0] : null;
  },

  async eliminar(id: number): Promise<void> {
    await query(`DELETE FROM empresas WHERE id = $1`, [id]);
  },
};