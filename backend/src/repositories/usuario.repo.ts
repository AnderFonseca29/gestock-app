import { query, queryOne } from '../config/db';
import { UsuarioRow } from '../models/types';

export interface CrearUsuarioData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  passwordHash: string;
  rolId: number;
  empresaId: number | null;
  estado: string;
}

export interface ActualizarUsuarioData {
  nombre?: string;
  apellido?: string;
  rolId?: number;
  empresaId?: number | null;
  telefono?: string | null;
  passwordHash?: string;
}

const SELECT_BASE = `
  SELECT
    u.id, u.nombre, u.apellido, u.email, u.telefono, u.password_hash, u.estado,
    u.rol_id, u.empresa_id, u.ultimo_acceso, u.fecha_creacion, u.fecha_actualizacion,
    r.nombre AS rol_nombre,
    e.nombre AS empresa_nombre
  FROM usuarios u
  JOIN roles r ON r.id = u.rol_id
  LEFT JOIN empresas e ON e.id = u.empresa_id
`;

const SELECT_PUBLICO = `
  SELECT
    u.id, u.nombre, u.apellido, u.email, u.telefono, u.estado,
    u.rol_id, u.empresa_id, u.ultimo_acceso, u.fecha_creacion, u.fecha_actualizacion,
    r.nombre AS rol_nombre,
    e.nombre AS empresa_nombre
  FROM usuarios u
  JOIN roles r ON r.id = u.rol_id
  LEFT JOIN empresas e ON e.id = u.empresa_id
`;

export const usuarioRepo = {
  async listar(filtros: { busqueda?: string; filtroRol?: string; estado?: string; empresaId?: number | null } = {}): Promise<UsuarioRow[]> {
    const condiciones: string[] = [];
    const params: any[] = [];

    if (filtros.empresaId != null) {
      params.push(filtros.empresaId);
      condiciones.push(`u.empresa_id = $${params.length}`);
    }
    if (filtros.busqueda) {
      params.push(`%${filtros.busqueda}%`);
      condiciones.push(`(u.nombre ILIKE $${params.length} OR u.apellido ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
    }
    if (filtros.filtroRol && filtros.filtroRol !== 'TODOS') {
      params.push(filtros.filtroRol);
      condiciones.push(`r.nombre = $${params.length}`);
    }
    if (filtros.estado) {
      params.push(filtros.estado);
      condiciones.push(`u.estado = $${params.length}`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const order = 'ORDER BY u.fecha_creacion DESC';
    return query<UsuarioRow>(`${SELECT_PUBLICO} ${where} ${order}`, params);
  },

  async buscarDetalle(id: number): Promise<UsuarioRow | null> {
    return queryOne<UsuarioRow>(`${SELECT_PUBLICO} WHERE u.id = $1`, [id]);
  },

  async buscarPorEmail(email: string): Promise<UsuarioRow | null> {
    return queryOne<UsuarioRow>(`${SELECT_BASE} WHERE LOWER(u.email) = LOWER($1)`, [email]);
  },

  async buscarPorTelefono(telefono: string): Promise<UsuarioRow | null> {
    return queryOne<UsuarioRow>(
      `${SELECT_BASE} WHERE regexp_replace(u.telefono, '\\D', '', 'g') IN ($1, '57' || $1, '0' || $1)`,
      [telefono]
    );
  },

  async buscarPorId(id: number): Promise<UsuarioRow | null> {
    return queryOne<UsuarioRow>(`${SELECT_BASE} WHERE u.id = $1`, [id]);
  },

  async crear(data: CrearUsuarioData): Promise<UsuarioRow> {
    const filas = await query<UsuarioRow>(
      `INSERT INTO usuarios (nombre, apellido, email, telefono, password_hash, rol_id, empresa_id, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, nombre, apellido, email, telefono, password_hash, estado, rol_id, empresa_id, ultimo_acceso, fecha_creacion, fecha_actualizacion`,
      [data.nombre, data.apellido, data.email, data.telefono, data.passwordHash, data.rolId, data.empresaId, data.estado]
    );
    return filas[0];
  },

  async actualizar(id: number, data: ActualizarUsuarioData): Promise<UsuarioRow | null> {
    const setValues: string[] = [];
    const params: any[] = [];

    const agregar = (campo: string, valor: any) => {
      params.push(valor);
      setValues.push(`${campo} = $${params.length}`);
    };

    if (data.nombre !== undefined) agregar('nombre', data.nombre);
    if (data.apellido !== undefined) agregar('apellido', data.apellido);
    if (data.rolId !== undefined) agregar('rol_id', data.rolId);
    if (data.empresaId !== undefined) agregar('empresa_id', data.empresaId);
    if (data.telefono !== undefined) agregar('telefono', data.telefono);
    if (data.passwordHash !== undefined) agregar('password_hash', data.passwordHash);

    if (!setValues.length) return this.buscarPorId(id);

    setValues.push(`fecha_actualizacion = NOW()`);
    params.push(id);

    const filas = await query<UsuarioRow>(
      `UPDATE usuarios SET ${setValues.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    return filas.length ? filas[0] : null;
  },

  async cambiarEstado(id: number, estado: 'Activo' | 'Inactivo'): Promise<UsuarioRow | null> {
    const filas = await query<UsuarioRow>(
      `UPDATE usuarios SET estado = $2, fecha_actualizacion = NOW() WHERE id = $1 RETURNING *`,
      [id, estado]
    );
    return filas.length ? filas[0] : null;
  },

  async registrarUltimoAcceso(id: number): Promise<void> {
    await query(`UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1`, [id]);
  },

  async actualizarContrasena(id: number, passwordHash: string): Promise<void> {
    await query(`UPDATE usuarios SET password_hash = $2, fecha_actualizacion = NOW() WHERE id = $1`, [id, passwordHash]);
  },

  async eliminar(id: number): Promise<void> {
    await query(`DELETE FROM usuarios WHERE id = $1`, [id]);
  },

  async contarActivos(): Promise<number> {
    const filas = await query<{ total: string }>(`SELECT COUNT(*) AS total FROM usuarios WHERE estado = 'Activo'`);
    return Number(filas[0]?.total || 0);
  },
};