import { query, queryOne } from '../config/db';
import { IncidenciaRow } from '../models/types';

export interface CrearIncidenciaData {
  titulo: string;
  descripcion: string;
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  reportadoPor: number;
  empresaId?: number | null;
}

export const incidenciaRepo = {
  async listar(filtros: { estado?: string; prioridad?: string; empresaId?: number | null } = {}): Promise<(IncidenciaRow & { reportado_por_nombre?: string; resuelto_por_nombre?: string })[]> {
    const condiciones: string[] = [];
    const params: any[] = [];

    if (filtros.empresaId != null) {
      params.push(filtros.empresaId);
      condiciones.push(`i.empresa_id = $${params.length}`);
    }
    if (filtros.estado && filtros.estado !== 'TODOS') {
      params.push(filtros.estado);
      condiciones.push(`i.estado = $${params.length}`);
    }
    if (filtros.prioridad && filtros.prioridad !== 'TODOS') {
      params.push(filtros.prioridad);
      condiciones.push(`i.prioridad = $${params.length}`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    return query<IncidenciaRow & { reportado_por_nombre?: string; resuelto_por_nombre?: string }>(
      `SELECT
         i.id, i.titulo, i.descripcion, i.prioridad, i.estado, i.reportado_por, i.fecha,
         i.resuelto_por, i.fecha_resolucion,
         CONCAT(ur.nombre, ' ', ur.apellido) AS reportado_por_nombre,
         CONCAT(us.nombre, ' ', us.apellido) AS resuelto_por_nombre
       FROM incidencias i
       LEFT JOIN usuarios ur ON ur.id = i.reportado_por
       LEFT JOIN usuarios us ON us.id = i.resuelto_por
       ${where}
       ORDER BY i.fecha DESC`,
      params
    );
  },

  async buscarPorId(id: number, empresaId?: number | null): Promise<IncidenciaRow | null> {
    if (empresaId != null) {
      return queryOne<IncidenciaRow>(`SELECT * FROM incidencias WHERE id = $1 AND empresa_id = $2`, [id, empresaId]);
    }
    return queryOne<IncidenciaRow>(`SELECT * FROM incidencias WHERE id = $1`, [id]);
  },

  async crear(data: CrearIncidenciaData): Promise<IncidenciaRow> {
    const filas = await query<IncidenciaRow>(
      `INSERT INTO incidencias (empresa_id, titulo, descripcion, prioridad, reportado_por)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.empresaId ?? null, data.titulo.trim(), data.descripcion.trim(), data.prioridad, data.reportadoPor]
    );
    return filas[0];
  },

  async actualizar(
    id: number,
    data: Partial<CrearIncidenciaData> & { estado?: string; resueltoPor?: number }
  ): Promise<IncidenciaRow | null> {
    const setValues: string[] = [];
    const params: any[] = [];

    const campos: Record<string, any> = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      prioridad: data.prioridad,
      estado: data.estado,
    };

    Object.entries(campos).forEach(([campo, valor]) => {
      if (valor !== undefined) {
        params.push(valor);
        setValues.push(`${campo} = $${params.length}`);
      }
    });

    if (data.estado === 'Resuelto') {
      setValues.push(`resuelto_por = $${params.length + 1}`);
      setValues.push(`fecha_resolucion = NOW()`);
      params.push(data.resueltoPor ?? null);
    }

    if (!setValues.length) return this.buscarPorId(id);

    params.push(id);
    const filas = await query<IncidenciaRow>(
      `UPDATE incidencias SET ${setValues.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return filas.length ? filas[0] : null;
  },

  async eliminar(id: number): Promise<void> {
    await query(`DELETE FROM incidencias WHERE id = $1`, [id]);
  },
};