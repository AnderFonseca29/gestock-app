import fs from 'node:fs';
import path from 'node:path';
import type { DiagramaSpec, ErrorDiagrama } from './tipos';
import {
  escanearTodos,
  rutaRoutesDeModulo,
  rutaControllerDeModulo,
  tablasDeSql,
  rbacDeSql,
  erroresBackendDeCodigo,
  baseDatosDeSql,
  pipelineDeApp,
  rutasFrontendDeCodigo,
  API_ERROR_MAP,
  MODULOS,
  SRC_DIR,
} from './scanner';
import { construirSpecs } from './build';

interface Falla {
  ok: boolean;
  detalle?: string;
}

function checks(f: Falla[], nombre: string, ok: boolean, detalle?: string) {
  f.push({ ok, detalle: `${nombre}: ${detalle ?? ''}` });
}

function contarRutasIndependiente(contenido: string, routerVar: string): string[] {
  const re = new RegExp(`\\b${routerVar}\\.(get|post|put|patch|delete)\\s*\\(`, 'g');
  const en = contenido.match(re);
  return en ? en.map((p) => p.split('.')[1].split('(')[0].toUpperCase()) : [];
}

function contarErroresIndependiente(contenido: string): Array<{ tipo: string; mensaje: string }> {
  const out: Array<{ tipo: string; mensaje: string }> = [];
  const re = /ApiError\.(\w+)\(\s*['"]((?:[^'"\\]|\\.)*?)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(contenido)) !== null) {
    out.push({ tipo: m[1], mensaje: m[2] });
  }
  return out;
}

function contenidoDe(modulo: string, tipo: 'routes' | 'controllers' | 'services'): string {
  const ruta =
    tipo === 'routes'
      ? path.join(SRC_DIR, 'routes', `${modulo}.routes.ts`)
      : tipo === 'controllers'
        ? path.join(SRC_DIR, 'controllers', `${modulo}.controller.ts`)
        : path.join(SRC_DIR, 'services', `${modulo}.service.ts`);
  if (!fs.existsSync(ruta)) return '';
  return fs.readFileSync(ruta, 'utf-8');
}

function ordenarNumeros(specs: DiagramaSpec[]): void {
  specs.sort((a, b) => a.numero - b.numero);
}

export function verificacion(): { fallas: string[]; total: number; ok: number; bad: number } {
  const fallas: Falla[] = [];
  const specs = construirSpecs();
  ordenarNumeros(specs);

  checks(fallas, 'cantidad', specs.length === 34, `se obtuvieron ${specs.length} diagramas`);
  const numeros = new Set(specs.map((s) => s.numero));
  let continuo = true;
  for (let n = 1; n <= 34; n++) if (!numeros.has(n)) continuo = false;
  checks(fallas, 'numeros 1..34', continuo, [...numeros].join(','));

  const tablas = tablasDeSql();
  const { api: apiErrores } = erroresBackendDeCodigo();
  const { roles, permisos, mapa } = rbacDeSql();
  const entidades = baseDatosDeSql();
  const pipeline = pipelineDeApp();
  const front = rutasFrontendDeCodigo();

  // ---- Controladores (10-27): comparacion independiente contra el codigo ----
  const controles = escanearTodos();
  for (const c of controles) {
    const mod = c.modulo ?? '';

    const defR = rutaRoutesDeModulo(MODULOS.find((m) => m.numero === c.numero)!);
    const contenidoRutas = fs.readFileSync(defR, 'utf-8');
    const metodos = contarRutasIndependiente(contenidoRutas, `${mod}Routes`);
    const rutas = c.rutas ?? [];
    checks(
      fallas,
      `diag${c.numero} rutas`,
      metodos.length === rutas.length,
      `${mod}: codigo ${metodos.length} vs diagrama ${rutas.length}`
    );
    rutas.forEach((r, i) => {
      const md = metodos[i] ?? '?';
      checks(
        fallas,
        `diag${c.numero} metodo#${i + 1}`,
        md === r.metodo,
        `${mod} ${r.rutaCompleta}: codigo ${md} vs diagrama ${r.metodo}`
      );
    });

    // errores reales vs diagrama
    const contCtrl = contenidoDe(mod, 'controllers');
    const contSvc = contenidoDe(mod, 'services');
    const origen = `${contCtrl}\n${contSvc}`;
    const reales = contarErroresIndependiente(origen);
    const unicos = new Map<string, string>();
    for (const e of reales) {
      const k = `${e.tipo}|${e.mensaje}`;
      unicos.set(k, e.mensaje);
    }
    const errores = c.errores ?? [];
    const enDiagrama = new Map(errores.map((e) => [`${e.tipo}|${e.mensaje}`, e]));
    checks(
      fallas,
      `diag${c.numero} errores`,
      unicos.size === errores.length,
      `${mod}: codigo ${unicos.size} unicos vs diagrama ${errores.length}`
    );
    for (const [k, men] of unicos) {
      const ed = enDiagrama.get(k);
      checks(fallas, `diag${c.numero} error "${men.slice(0, 30)}..."`, !!ed, `${mod} falta en el diagrama`);
      if (ed) {
        const mapeo = API_ERROR_MAP[ed.tipo];
        checks(fallas, `diag${c.numero} code ${ed.code}`, mapeo && mapeo.code === ed.code, `${mod} ${ed.tipo} -> ${ed.code}`);
      }
    }
    checks(fallas, `diag${c.numero} tablas`, (c.tablas ?? []).every((t) => tablas.includes(t)), `${mod} tablas invalidas: ${(c.tablas ?? []).filter((t) => !tablas.includes(t)).join(', ')}`);
  }

  // ---- Verificacion cruzada de tablas usadas vs tablas del esquema ----
  const usadas = new Set(controles.flatMap((c) => c.tablas ?? []));
  checks(fallas, 'tablas usadas ⊆ esquema', [...usadas].every((t) => tablas.includes(t)), [...usadas].filter((t) => !tablas.includes(t)).join(',') || 'ok');

  // ---- Auxiliares ----
  const s3 = specs.find((s) => s.numero === 3)!;
  checks(fallas, 'diag3 describir MID', (s3.descripcion ?? '').length > 10, 'descripcion vacia');

  const s5 = specs.find((s) => s.numero === 5)!;
  if (s5.extras) {
    // (reservado)
  }
  checks(fallas, 'diag5 roles', roles.length >= 5, `roles=${roles.length}`);
  for (const r of roles) {
    checks(fallas, `diag5 rol ${r}`, (mapa[r] ?? []).length >= 1, `${r} sin permisos asignados`);
  }
  for (const p of permisos) {
    checks(fallas, `diag5 perm ${p.codigo}`, Object.values(mapa).some((m) => m.includes(p.codigo)), `${p.codigo} sin dueno`);
  }

  const s7 = specs.find((s) => s.numero === 7)!;
  for (const a of apiErrores) {
    checks(fallas, `diag7 ApiError.${a.tipo}`, a.status >= 400 && a.status <= 500, `${a.tipo}`);
  }
  checks(fallas, 'diag7 fabricas', apiErrores.length >= 6, `fabricas=${apiErrores.length}`);

  const s8 = specs.find((s) => s.numero === 8)!;
  for (const t of tablas) {
    checks(fallas, `diag8 tabla ${t}`, entidades.some((e) => e.tabla === t), `${t} ausente`);
  }

  const s31 = specs.find((s) => s.numero === 31)!;
  checks(fallas, 'diag31 pipeline', pipeline.length >= 8, `pasos=${pipeline.length}`);

  const s32 = specs.find((s) => s.numero === 32)!;
  checks(fallas, 'diag32 rutas frontend', front.length >= 12, `rutas=${front.length}`);

  // ----
  const bad = fallas.filter((f) => !f.ok).length;
  return { fallas: fallas.map((f) => `${f.ok ? 'OK' : 'FAIL'} ${f.detalle}`), total: fallas.length, ok: fallas.length - bad, bad };
}

if (require.main === module) {
  const r = verificacion();
  console.log(r.fallas.join('\n'));
  console.log(`\nVERIFICACION DIAGRAMAS: ${r.ok}/${r.total} comprobaciones OK · ${r.bad} fallos`);
  if (r.bad > 0) process.exit(1);
}