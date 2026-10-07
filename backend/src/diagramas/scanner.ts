import fs from 'node:fs';
import path from 'node:path';
import type { DiagramaSpec, RutaDiagrama, ErrorDiagrama } from './tipos';

const SRC_DIR = path.resolve(__dirname, '..');
const SQL_DIR = path.resolve(SRC_DIR, '..', 'sql');
const FRONT_SRC = path.resolve(SRC_DIR, '..', '..', 'frontend_gestock', 'src', 'app');

export const API_ERROR_MAP: Record<string, { code: string; status: number }> = {
  badRequest: { code: 'BAD_REQUEST', status: 400 },
  unauthorized: { code: 'UNAUTHORIZED', status: 401 },
  forbidden: { code: 'FORBIDDEN', status: 403 },
  notFound: { code: 'NOT_FOUND', status: 404 },
  conflict: { code: 'CONFLICT', status: 409 },
  tooManyRequests: { code: 'RATE_LIMITED', status: 429 },
  internal: { code: 'INTERNAL_ERROR', status: 500 },
};

export interface ModuloInfo {
  numero: number;
  nombre: string;
  base: string;
}

const MODULOS: ModuloInfo[] = [
  { numero: 10, nombre: 'Auth', base: '/auth' },
  { numero: 11, nombre: 'Usuario', base: '/usuarios' },
  { numero: 12, nombre: 'Rol', base: '/roles' },
  { numero: 13, nombre: 'Permiso', base: '/permisos' },
  { numero: 14, nombre: 'Empresa', base: '/empresas' },
  { numero: 15, nombre: 'Categoria', base: '/categorias' },
  { numero: 16, nombre: 'Bodega', base: '/bodegas' },
  { numero: 17, nombre: 'Producto', base: '/productos' },
  { numero: 18, nombre: 'Movimiento', base: '/movimientos' },
  { numero: 19, nombre: 'Recepcion', base: '/recepciones' },
  { numero: 20, nombre: 'Auditoria', base: '/auditorias' },
  { numero: 21, nombre: 'Incidencia', base: '/incidencias' },
  { numero: 22, nombre: 'Mantenimiento', base: '/mantenimientos' },
  { numero: 23, nombre: 'Sesion', base: '/sesiones' },
  { numero: 24, nombre: 'Notificacion', base: '/notificaciones' },
  { numero: 25, nombre: 'Configuracion', base: '/configuracion' },
  { numero: 26, nombre: 'Dashboard', base: '/dashboard' },
  { numero: 27, nombre: 'Reporte', base: '/reportes' },
];

export function leer(src: string): string {
  return fs.readFileSync(src, 'utf-8');
}

function moduloSlug(nombre: string): string {
  const slug: Record<string, string> = {
    Auth: 'auth',
    Usuario: 'usuario',
    Rol: 'rol',
    Permiso: 'permiso',
    Empresa: 'empresa',
    Categoria: 'categoria',
    Bodega: 'bodega',
    Producto: 'producto',
    Movimiento: 'movimiento',
    Recepcion: 'recepcion',
    Auditoria: 'auditoria',
    Incidencia: 'incidencia',
    Mantenimiento: 'mantenimiento',
    Sesion: 'sesion',
    Notificacion: 'notificacion',
    Configuracion: 'configuracion',
    Dashboard: 'dashboard',
    Reporte: 'reporte',
  };
  return slug[nombre] ?? nombre.toLowerCase();
}

export const rutaRoutesDeModulo = (m: ModuloInfo) =>
  path.join(SRC_DIR, 'routes', `${moduloSlug(m.nombre)}.routes.ts`);
export const rutaControllerDeModulo = (m: ModuloInfo) =>
  path.join(SRC_DIR, 'controllers', `${moduloSlug(m.nombre)}.controller.ts`);

/** Separa el texto de una llamada balanceada desde el paréntesis de apertura. */
function argumentosTopLevel(texto: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let actual = '';
  let quote: string | null = null;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (quote) {
      actual += ch;
      if (ch === '\\') {
        actual += texto[i + 1] ?? '';
        i++;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      actual += ch;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) {
      args.push(actual.trim());
      actual = '';
      continue;
    }
    actual += ch;
  }
  if (actual.trim()) args.push(actual.trim());
  return args;
}

/** Devuelve el inicio de cada llamada `routerVar.METHOD(`. */
function iniciosDeRutas(content: string, routerVar: string): Array<{ method: string; start: number }> {
  const out: Array<{ method: string; start: number }> = [];
  const re = new RegExp(`\\b${routerVar}\\.(get|post|put|patch|delete)\\s*\\(`, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    out.push({ method: m[1].toUpperCase(), start: m.index + m[0].length - 1 });
  }
  return out;
}

function extraerRango(texto: string, start: number): string {
  let depth = 0;
  let quote: string | null = null;
  for (let i = start; i < texto.length; i++) {
    const ch = texto[i];
    if (quote) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth === 0) return texto.slice(start, i);
  }
  return texto.slice(start);
}

/** Resuelve un array por nombre (p.ej. `...loginMiddlewares`), tomando la rama no-test. */
function resolverDisperso(nombre: string, content: string): string[] {
  const re = new RegExp(`const\\s+${nombre}\\s*=\\s*`, 'g');
  const m = re.exec(content);
  if (!m) return [];
  const arrStart = content.indexOf('[', m.index + m[0].length);
  if (arrStart < 0) return [];
  const arrText = extraerRango2(content, arrStart, '[', ']');
  let cuerpo = arrText.trim();
  if (cuerpo.startsWith('[')) cuerpo = cuerpo.slice(1, -1);
  const ternario = cuerpo.split(/:\s*\[/);
  if (ternario.length > 1) cuerpo = '[' + ternario.slice(1).join('[exit]');
  return separarPorComa(cuerpo);
}

function extraerRango2(texto: string, start: number, apertura: string, cierre: string): string {
  let depth = 0;
  let quote: string | null = null;
  for (let i = start; i < texto.length; i++) {
    const ch = texto[i];
    if (quote) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === apertura) depth++;
    if (ch === cierre) {
      depth--;
      if (depth === 0) return texto.slice(start, i + 1);
    }
  }
  return texto.slice(start);
}

function separarPorComa(texto: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let actual = '';
  let quote: string | null = null;
  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (quote) {
      actual += ch;
      if (ch === '\\') {
        actual += texto[i + 1] ?? '';
        i++;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      actual += ch;
      continue;
    }
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) {
      args.push(actual.trim());
      actual = '';
      continue;
    }
    actual += ch;
  }
  if (actual.trim()) args.push(actual.trim());
  return args;
}

function quitarComillas(s: string): string {
  return s.replace(/^['"`]|['"`]$/g, '');
}

function entreParentesis(s: string): string {
  const i = s.indexOf('(');
  const j = s.lastIndexOf(')');
  if (i < 0 || j < i) return '';
  return s.slice(i + 1, j);
}

function argumentosEntreParentesis(s: string): string[] {
  return separarPorComa(entreParentesis(s));
}

interface Clasificado {
  etiqueta: string;
  permisos?: string[];
  limiter?: string;
  esHandler: boolean;
}

function clasificarArgumento(arg: string): Clasificado {
  if (!arg || arg.startsWith('...')) return { etiqueta: '', esHandler: false };
  if (/^[a-zA-Z_][\w]*\.[\w]+$/.test(arg)) return { etiqueta: arg, esHandler: true };
  const nombre = arg.replace(/\(.*$/s, '');
  const limpio = nombre.trim();
  switch (limpio) {
    case 'authenticateToken':
      return { etiqueta: 'TOKEN', esHandler: false };
    case 'loginEmailLimiter':
      return { etiqueta: 'LIMITE LOGIN', limiter: 'loginEmailLimiter', esHandler: false };
    case 'loginIpLimiter':
      return { etiqueta: 'LIMITE IP', limiter: 'loginIpLimiter', esHandler: false };
    case 'recuperacionLimiter':
      return { etiqueta: 'LIMITE RECUP', limiter: 'recuperacionLimiter', esHandler: false };
    case 'apiRateLimiter':
      return { etiqueta: 'LIMITE API', limiter: 'apiRateLimiter', esHandler: false };
    case 'authorizeRoles':
    case 'authorizePermission':
    case 'authorizeAnyPermission':
      return {
        etiqueta: 'PERMISO',
        permisos: argumentosEntreParentesis(arg).map(quitarComillas),
        esHandler: false,
      };
    case 'validateBody':
      return { etiqueta: 'VALIDAR BODY', esHandler: false };
    case 'validateParams':
      return { etiqueta: 'VALIDAR PARAMS', esHandler: false };
    case 'validateQuery':
      return { etiqueta: 'VALIDAR QUERY', esHandler: false };
    default:
      return { etiqueta: limpio.toUpperCase(), esHandler: false };
  }
}

function extraerRutas(content: string, routerVar: string, basePath: string): RutaDiagrama[] {
  const rutas: RutaDiagrama[] = [];
  for (const { method, start } of iniciosDeRutas(content, routerVar)) {
    const cuerpo = extraerRango(content, start);
    let args = argumentosTopLevel(cuerpo);
    if (!args.length) continue;
    const subruta = quitarComillas(args[0]) || '/';
    args = args.slice(1);
    const expandidos: string[] = [];
    for (const a of args) {
      if (a.startsWith('...')) expandidos.push(...resolverDisperso(a.slice(3), content));
      else expandidos.push(a);
    }
    const handlerRaw = expandidos[expandidos.length - 1] ?? '';
    const middlewares: string[] = [];
    const permisos: string[] = [];
    let limiter: string | undefined;
    for (const a of expandidos.slice(0, -1)) {
      const c = clasificarArgumento(a);
      if (c.esHandler) continue;
      if (c.etiqueta) middlewares.push(c.etiqueta);
      if (c.permisos) permisos.push(...c.permisos);
      if (c.limiter) limiter = c.limiter;
    }
    if (permisos.length === 0 && clasificarArgumento(handlerRaw).esHandler) {
      // sin permisos declarados
    }
    const rutaCompleta = `/api${basePath}${subruta === '/' ? '' : subruta}`;
    rutas.push({
      metodo: method,
      rutaCompleta: rutaCompleta.replace(/\/+$/, '') || '/api',
      subruta,
      handler: handlerRaw || 'handler',
      middlewares,
      permisos,
      limiter,
    });
  }
  return rutas;
}

export function extraerErrores(...archivos: string[]): ErrorDiagrama[] {
  const errores: ErrorDiagrama[] = [];
  const vistos = new Set<string>();
  for (const archivo of archivos) {
    if (!fs.existsSync(archivo)) continue;
    const content = leer(archivo);
    const re = /ApiError\.(\w+)\(\s*['"]((?:[^'"\\]|\\.)*?)['"]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const tipo = m[1];
      const mensaje = m[2];
      const key = `${tipo}|${mensaje}`;
      if (vistos.has(key)) continue;
      vistos.add(key);
      const mapeo = API_ERROR_MAP[tipo] ?? { code: 'ERROR', status: 500 };
      errores.push({ tipo, status: mapeo.status, code: mapeo.code, mensaje, fuente: path.basename(archivo) });
    }
  }
  return errores;
}

/** Nombres de tablas conocidas, extraídos directamente del SQL. */
export function tablasDeSql(): string[] {
  const sql = leer(path.join(SQL_DIR, '02_create_tables.sql'));
  const tablas: string[] = [];
  const re = /CREATE TABLE IF NOT EXISTS\s+(\w+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    tablas.push(m[1]);
  }
  return tablas;
}

const TABLAS_CONOCIDAS = new Set(tablasDeSql());

function extraerTablasDeContenido(content: string): string[] {
  const vistas = new Set<string>();
  const out: string[] = [];
  const re = /(?:FROM|INTO|UPDATE|JOIN)\s+(?:ONLY\s+)?([a-z_][a-z0-9_]*)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const t = m[1];
    if (TABLAS_CONOCIDAS.has(t) && !vistas.has(t)) {
      vistas.add(t);
      out.push(t);
    }
  }
  return out;
}

function importsDe(fuente: string, contenido: string): string[] {
  const out: string[] = [];
  const re = /from\s+'(\.\.?\/)*((?:repositories|services)\/[\w.-]+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(contenido)) !== null) {
    let ruta = path.join(SRC_DIR, m[2]);
    if (!ruta.endsWith('.ts')) ruta += '.ts';
    out.push(ruta);
  }
  return out;
}

function archivosFuente(mod: ModuloInfo): { controller: string; servicios: string[]; repos: string[] } {
  const controller = rutaControllerDeModulo(mod);
  const servicios: string[] = [];
  const repos: string[] = [];
  const visitados = new Set<string>();
  const cola: string[] = [controller];
  while (cola.length) {
    const archivo = cola.pop()!;
    if (visitados.has(archivo) || !fs.existsSync(archivo)) continue;
    visitados.add(archivo);
    const content = leer(archivo);
    for (const imp of importsDe(archivo, content)) {
      if (/[\\/]services[\\/]/.test(imp)) {
        if (path.basename(imp).endsWith('.service.ts')) servicios.push(imp);
        cola.push(imp);
      } else if (/[\\/]repositories[\\/]/.test(imp)) {
        repos.push(imp);
      }
    }
  }
  return { controller, servicios, repos };
}

export function escanearModulo(mod: ModuloInfo): DiagramaSpec {
  const rutasFile = rutaRoutesDeModulo(mod);
  const { controller, servicios, repos } = archivosFuente(mod);
  const rutas = extraerRutas(leer(rutasFile), `${moduloSlug(mod.nombre)}Routes`, mod.base);
  // errores: solo del controlador y del servicio propio del modulo (evita contaminacion cruzada)
  const servicioPropio = path.join(SRC_DIR, 'services', `${moduloSlug(mod.nombre)}.service.ts`);
  const errores = extraerErrores(controller, servicioPropio);
  const contenidosRepos = repos.filter((r) => fs.existsSync(r)).map((r) => leer(r));
  const tablas = extraerTablasDeContenido([...contenidosRepos, ...servicios.map((s) => (fs.existsSync(s) ? leer(s) : ''))].join('\n'));
  const contenidoCont = fs.existsSync(controller) ? leer(controller) : '';
  const respuestas = {
    ok: (contenidoCont.match(/\bok\(res/g) ?? []).length,
    created: (contenidoCont.match(/\bcreated\(res/g) ?? []).length,
    noContent: (contenidoCont.match(/\bnoContent\(res/g) ?? []).length,
  };
  const multitenant = contenidosRepos.some((c) => c.includes('empresa_id'));
  const descripcion =
    `Controlador ${mod.nombre}: ${rutas.length} rutas declaradas en ${path.basename(rutasFile)} ` +
    `y ${errores.length} ramas de error lanzadas con ApiError en el codigo.`;
  return {
    numero: mod.numero,
    nombre: `Controlador ${mod.nombre}`,
    titulo: `Controlador ${mod.nombre}`,
    categoria: 'Controladores',
    descripcion,
    modulo: moduloSlug(mod.nombre),
    base: mod.base,
    rutas,
    errores,
    tablas,
    respuestas,
    auditoria: contenidoCont.includes('registrarAuditoria'),
    transaccion: contenidoCont.includes('transaction'),
    multitenant,
  };
}

export function escanearTodos(): DiagramaSpec[] {
  return MODULOS.map((m) => escanearModulo(m));
}

/** Datos para el diagrama RBAC (5): roles y permisos desde los SQL. */
export function rbacDeSql(): { roles: string[]; permisos: Array<{ nombre: string; codigo: string; modulo: string }>; mapa: Record<string, string[]> } {
  const roles: string[] = [];
  const reRol = /\(\s*'([^']+)'\s*,/g;
  let rol: RegExpExecArray | null;
  let rolesSql = '';
  const archivoRoles = path.join(SQL_DIR, '03_insert_roles.sql');
  if (fs.existsSync(archivoRoles)) {
    rolesSql = leer(archivoRoles);
    while ((rol = reRol.exec(rolesSql)) !== null) {
      roles.push(rol[1]);
    }
  }
  const permisos: Array<{ nombre: string; codigo: string; modulo: string }> = [];
  const archivoPermisos = path.join(SQL_DIR, '04_insert_permissions.sql');
  if (fs.existsSync(archivoPermisos)) {
    const sql = leer(archivoPermisos);
    const reP = /\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'[^']*'\s*,\s*'([^']+)'\s*\)/g;
    let mp: RegExpExecArray | null;
    while ((mp = reP.exec(sql)) !== null) {
      permisos.push({ nombre: mp[1], codigo: mp[2], modulo: mp[3] });
    }
  }
  const mapa: Record<string, string[]> = {};
  for (const r of roles) mapa[r] = [];
  const archivoSeed = path.join(SQL_DIR, '05_seed_data.sql');
  if (fs.existsSync(archivoSeed)) {
    const seed = leer(archivoSeed);
    if (roles.includes('Administrador')) {
      for (const c of permisos) mapa['Administrador'].push(c.codigo);
    }
    // Acota a la sección de mapeo rol_permiso (evita los INSERT de usuarios).
    const inicio = seed.indexOf('INSERT INTO rol_permiso');
    const cuerpo = inicio >= 0 ? seed.slice(inicio) : seed;
    const reIn = /p\.codigo IN\s*\(/g;
    let m: RegExpExecArray | null;
    while ((m = reIn.exec(cuerpo)) !== null) {
      const open = cuerpo.indexOf('(', m.index);
      let close = -1;
      let depth = 0;
      for (let i = open; i < cuerpo.length; i++) {
        if (cuerpo[i] === '(') depth++;
        else if (cuerpo[i] === ')') {
          depth--;
          if (depth === 0) { close = i; break; }
        }
      }
      if (close < 0) continue;
      const codigos = [...cuerpo.slice(open + 1, close).matchAll(/'([^']+)'/g)].map((x) => x[1]);
      // Contexto previo a la lista: dueño y tipo de sentencia (la inmediatamente anterior).
      const ctx = cuerpo.slice(Math.max(0, m.index - 700), m.index);
      const tipo = ctx.slice(Math.max(ctx.lastIndexOf('DELETE FROM'), ctx.lastIndexOf('INSERT INTO')));
      const ultimoRol = [...tipo.matchAll(/r\.nombre = '([^']+)'/g)].pop();
      if (!ultimoRol) continue;
      const owner = ultimoRol[1];
      const isDelete = /^DELETE FROM/.test(tipo.trim());
      const arr = (mapa[owner] ??= []);
      for (const c of codigos) {
        const i = arr.indexOf(c);
        if (isDelete) {
          if (i >= 0) arr.splice(i, 1);
        } else if (i < 0) {
          arr.push(c);
        }
      }
    }
  }
  return { roles, permisos, mapa };
}

/** Datos de errores del backend (7): métodos de ApiError y códigos del errorHandler. */
export function erroresBackendDeCodigo(): { api: ErrorDiagrama[]; handler: Array<{ status: number; code: string; mensaje: string }> } {
  const apiArchivo = path.join(SRC_DIR, 'utils', 'ApiError.ts');
  const handlerArchivo = path.join(SRC_DIR, 'middleware', 'errorHandler.ts');
  const api: ErrorDiagrama[] = [];
  if (fs.existsSync(apiArchivo)) {
    const content = leer(apiArchivo);
    const re = /static\s+(\w+)\(message:\s*string(?:\s*=\s*'([^']*)')?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const mapeo = API_ERROR_MAP[m[1]] ?? { code: 'ERROR', status: 500 };
      api.push({ tipo: m[1], status: mapeo.status, code: mapeo.code, mensaje: m[2] ?? '(mensaje obligatorio en cada llamada)', fuente: 'ApiError.ts' });
    }
  }
  const handler: Array<{ status: number; code: string; mensaje: string }> = [];
  if (fs.existsSync(handlerArchivo)) {
    const content = leer(handlerArchivo);
    const re = /res\.status\((\d+)\)\.json\(\{\s*success:\s*false,\s*message:\s*'([^']*)',\s*code:\s*'([A-Z_]+)'/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      handler.push({ status: Number(m[1]), code: m[3], mensaje: m[2] });
    }
  }
  return { api, handler };
}

/** Entidades y relaciones de la base de datos (8) desde el SQL. */
export function baseDatosDeSql(): Array<{ tabla: string; fks: string[]; campos: number; multitenant: boolean }> {
  const sql = leer(path.join(SQL_DIR, '02_create_tables.sql'));
  const entidades: Array<{ tabla: string; fks: string[]; campos: number; multitenant: boolean }> = [];
  const re = /CREATE TABLE IF NOT EXISTS\s+(\w+)\s*\(([\s\S]*?)\n\s*\);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    const tabla = m[1];
    const cuerpo = m[2];
    const fks = [...cuerpo.matchAll(/REFERENCES\s+(\w+)/g)].map((x) => x[1]);
    const campos = cuerpo.split('\n').filter((l) => /^\s{2}\w/.test(l) && !/CONSTRAINT|PRIMARY|UNIQUE|FOREIGN/.test(l)).length;
    entidades.push({ tabla, fks: [...new Set(fks)], campos, multitenant: cuerpo.includes('empresa_id') });
  }
  return entidades;
}

/** Pipeline de la app Express (31) desde app.ts. */
export function pipelineDeApp(): string[] {
  const appFile = path.join(SRC_DIR, 'app.ts');
  const content = leer(appFile);
  const pasos: string[] = [];
  const re = /app\.use\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const open = m.index + m[0].length - 1;
    let close = -1;
    let depth = 0;
    for (let i = open; i < content.length; i++) {
      if (content[i] === '(') depth++;
      else if (content[i] === ')') {
        depth--;
        if (depth === 0) { close = i; break; }
      }
    }
    if (close < 0) continue;
    const args = argumentosTopLevel(content.slice(open + 1, close));
    const primero = (args[0] ?? '').trim();
    if (primero.startsWith("'") || primero.startsWith('"')) {
      pasos.push(`MONTAR ${primero.replace(/^['"]|['"]$/g, '')}`);
      continue;
    }
    const todos = args.join(' ');
    if (todos.includes('errorHandler')) pasos.push('GESTOR DE ERRORES (errorHandler)');
    else if (todos.includes('helmet')) pasos.push('SEGURIDAD helmet()');
    else if (todos.includes('cors')) pasos.push('CORS origen <frontend>');
    else if (todos.includes('express.json')) pasos.push('PARSER JSON (limite 2mb)');
    else if (todos.includes('express.urlencoded')) pasos.push('PARSER URLENCODED (limite 2mb)');
    else if (todos.includes('swaggerUi')) pasos.push('DOCUMENTACION Swagger en /api/docs');
    else if (todos.includes('apiRateLimiter')) pasos.push('LIMITADOR global /api (500 req / 15 min)');
    else if (todos.includes('apiRoutes')) pasos.push('RUTAS /api montadas');
    else if (/=>/.test(primero)) pasos.push('404 JSON: la ruta solicitada no existe');
    else if (args.length >= 2) pasos.push('RUTA GLOBAL (404) JSON');
    else pasos.push(primero || '(middleware)');
  }
  return pasos;
}

/** Rutas protegidas del frontend (32) desde app.routes.ts. */
export function rutasFrontendDeCodigo(): Array<{ ruta: string; permiso: string; titulo?: string }> {
  const file = path.join(FRONT_SRC, 'app.routes.ts');
  if (!fs.existsSync(file)) return [];
  const content = leer(file);
  const out: Array<{ ruta: string; permiso: string }> = [];
  const re = /path:\s*'([^']+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const ruta = m[1];
    const resto = content.slice(m.index, m.index + 900);
    const perm = /data:\s*\{\s*(?:permission|anyPermission)\s*:\s*(?:'([^']+)'|\[([^\]]+)\])/.exec(resto);
    if (!perm) continue;
    const permiso = perm[1] ?? perm[2].split(',').map((s) => s.trim().replace(/['"]/g, '')).join(' | ');
    out.push({ ruta, permiso });
  }
  return out;
}

/** Items del menú lateral (33) desde sidebar.ts. */
export function menuSidebarDeCodigo(): Array<{ label: string; seccion: string; ruta: string; permisos: string[] }> {
  const file = path.join(FRONT_SRC, 'layout', 'sidebar', 'sidebar.ts');
  if (!fs.existsSync(file)) return [];
  const content = leer(file);
  const items: Array<{ label: string; seccion: string; ruta: string; permisos: string[] }> = [];
  const re = /label:\s*'([^']+)',\s*icon:\s*'[^']+',\s*route:\s*'([^']+)',\s*section:\s*'([^']+)',\s*permisos:\s*\[([^\]]*)\]/gs;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const permisos = m[4].split(',').map((s) => s.trim().replace(/['"]/g, '')).filter(Boolean);
    items.push({ label: m[1], seccion: m[3], ruta: m[2], permisos });
  }
  return items;
}

export { MODULOS, SRC_DIR, SQL_DIR, FRONT_SRC };