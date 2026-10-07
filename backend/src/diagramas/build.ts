import type { DiagramaSpec } from './tipos';
import { escanearTodos } from './scanner';
import { renderer } from './render';

export interface DiagramaGenerado extends DiagramaSpec {
  nombre: string;
  ancho: number;
  alto: number;
  svg: string;
}

const AUX: Array<Omit<DiagramaSpec, 'descripcion'>> = [
  { numero: 1, nombre: 'Portada', titulo: 'Portada', categoria: 'Generales' },
  { numero: 2, nombre: 'Arquitectura General', titulo: 'Arquitectura General', categoria: 'Generales' },
  { numero: 3, nombre: 'MID Detalle', titulo: 'MID Detalle', categoria: 'Generales' },
  { numero: 4, nombre: 'Autenticacion Sesion', titulo: 'Autenticacion Sesion', categoria: 'Generales' },
  { numero: 5, nombre: 'RBAC Roles Permisos', titulo: 'RBAC Roles Permisos', categoria: 'Generales' },
  { numero: 6, nombre: 'Patron CRUD', titulo: 'Patron CRUD', categoria: 'Generales' },
  { numero: 7, nombre: 'Errores Backend', titulo: 'Errores Backend', categoria: 'Generales' },
  { numero: 8, nombre: 'Base Datos', titulo: 'Base Datos', categoria: 'Generales' },
  { numero: 9, nombre: 'Matriz Trazabilidad', titulo: 'Matriz Trazabilidad', categoria: 'Generales' },
  { numero: 28, nombre: 'Ciclo Completo Ida Vuelta', titulo: 'Ciclo Completo Ida Vuelta', categoria: 'Ciclo y Respuesta' },
  { numero: 29, nombre: 'Retorno Sin MID', titulo: 'Retorno Sin MID', categoria: 'Ciclo y Respuesta' },
  { numero: 30, nombre: 'Publicos Sin MID', titulo: 'Publicos Sin MID', categoria: 'Servidor y Acceso' },
  { numero: 31, nombre: 'Pipeline app ts', titulo: 'Pipeline app ts', categoria: 'Servidor y Acceso' },
  { numero: 32, nombre: 'Rutas Frontend Protegidas', titulo: 'Rutas Frontend Protegidas', categoria: 'Frontend' },
  { numero: 33, nombre: 'Mapa Paginas Endpoints', titulo: 'Mapa Paginas Endpoints', categoria: 'Frontend' },
  { numero: 34, nombre: 'Errores Cliente', titulo: 'Errores Cliente', categoria: 'Frontend' },
];

const DESCRIPCIONES: Record<number, string> = {
  1: 'Portada del conjunto: nombre del proyecto y listado de los 34 diagramas.',
  2: 'Vista general de la plataforma: Frontend Angular, Backend Node/Express y PostgreSQL.',
  3: 'El MID como capa intermedia: lo que atraviesa la solicitud y lo que nunca toca.',
  4: 'Inicio de sesion, generacion de JWT y control de sesiones activas.',
  5: 'Mapeo RBAC de roles y permisos que protegen cada ruta del sistema.',
  6: 'Secuencia base CRUD (crear/leer/actualizar/eliminar) y sus respuestas.',
  7: 'Clasificacion de errores del backend: ApiError y casos del errorHandler.',
  8: 'Entidades y relaciones de la base de datos Gestock_db.',
  9: 'Matriz de trazabilidad entre cada diagrama y la lectura del codigo fuente.',
  28: 'Ciclo completo de una solicitud: IDA por el MID y VUELTA directa al cliente.',
  29: 'Formato de respuestas 2xx y manejo de errores en el interceptor del cliente.',
  30: 'Rutas publicas sin autenticacion: login y recuperacion de contrasena.',
  31: 'Pipeline de creacion de la app Express: middlewares, rate limit y errorHandler.',
  32: 'Rutas del frontend protegidas por permisos.',
  33: 'Mapa de paginas del frontend y su relacion con los endpoints del backend.',
  34: 'Manejo de errores en el cliente: toasts, sesion expirada y respuestas del backend.',
};

export function construirSpecs(): DiagramaSpec[] {
  const specs: DiagramaSpec[] = AUX.map((a) => ({
    ...a,
    descripcion: DESCRIPCIONES[a.numero] ?? '',
  }));
  const controles = escanearTodos();
  for (const c of controles) {
    specs.push(c);
  }
  return specs.sort((x, y) => x.numero - y.numero);
}

export function generarTodas(): DiagramaGenerado[] {
  const specs = construirSpecs();
  return specs.map((s) => ({
    ...s,
    nombre: `${String(s.numero).padStart(2, '0')}_${s.titulo.replace(/ /g, '_')}.svg`,
    ancho: 1600,
    alto: 1200,
    svg: renderer(s),
  }));
}