export interface JwtPayload {
  userId: number;
  roleId: number;
  role: string;
  email: string;
  sesionId?: number;
}

export interface AuthRequestUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  rolId: number;
  rol: string;
  empresaId: number | null;
  permisos: string[];
  sesionId?: number;
}

export interface EmpresaRow {
  id: number;
  nombre: string;
  nit: string;
  correo: string;
  telefono: string | null;
  direccion: string | null;
  estado: string;
  moneda: string;
  formato_fecha: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface RolRow {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
  fecha_creacion: Date;
}

export interface PermisoRow {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  modulo: string;
}

export interface UsuarioRow {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  password_hash: string;
  estado: string;
  rol_id: number;
  empresa_id: number | null;
  ultimo_acceso: Date | null;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  rol_nombre?: string;
  empresa_nombre?: string;
}

export interface CategoriaRow {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
}

export interface BodegaRow {
  id: number;
  nombre: string;
  codigo: string;
  ciudad: string | null;
  direccion: string | null;
  responsable: string | null;
  telefono: string | null;
  capacidad: number;
  ocupado: number;
  activa: boolean;
}

export interface ProductoRow {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria_id: number | null;
  bodega_id: number | null;
  precio: number;
  costo: number;
  stock: number;
  stock_min: number;
  estado: string;
  categoria?: string | null;
  bodega?: string | null;
}

export interface MovimientoRow {
  id: number;
  producto_id: number | null;
  bodega_id: number | null;
  tipo: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';
  cantidad: number;
  motivo: string;
  responsable: string;
  observaciones: string | null;
  estado: string;
  usuario_id: number | null;
  fecha: Date;
  sku?: string;
  producto?: string;
  bodega?: string;
}

export interface RecepcionRow {
  id: number;
  numero_documento: string;
  proveedor: string;
  fecha_recepcion: Date;
  usuario_id: number;
  bodega_id: number | null;
  estado: string;
  observaciones: string | null;
}

export interface IncidenciaRow {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  reportado_por: number;
  fecha: Date;
  resuelto_por: number | null;
  fecha_resolucion: Date | null;
}

export interface MantenimientoRow {
  id: number;
  equipo: string;
  tipo: string;
  fecha_programada: Date;
  estado: string;
  usuario_id: number | null;
  descripcion: string | null;
}

export interface AuditoriaRow {
  id: number;
  usuario_id: number | null;
  usuario_nombre: string | null;
  accion: string;
  modulo: string;
  entidad: string | null;
  registro_id: string | null;
  descripcion: string;
  fecha: Date;
}

export interface SesionRow {
  id: number;
  usuario_id: number;
  ip: string | null;
  user_agent: string | null;
  dispositivo: string | null;
  navegador: string | null;
  fecha_inicio: Date;
  fecha_cierre: Date | null;
  ultimo_acceso: Date;
  estado: string;
  es_actual: boolean;
  usuario_nombre?: string;
  usuario_email?: string;
}

export interface NotificacionRow {
  id: number;
  usuario_id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fecha: Date;
}

export interface ConfiguracionRow {
  clave: string;
  valor: string;
  descripcion: string | null;
  fecha_actualizacion: Date;
}

export interface DiagramaRow {
  id: number;
  numero: number;
  nombre: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  imagen?: Buffer;
  svg?: string;
  content_type: string;
  ancho?: number;
  alto?: number;
  tamanio?: number;
  actualizado_en?: Date;
}