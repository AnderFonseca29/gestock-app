import type { DiagramaSpec } from './tipos';
import {
  escanearTodos,
  rbacDeSql,
  erroresBackendDeCodigo,
  baseDatosDeSql,
  pipelineDeApp,
  rutasFrontendDeCodigo,
  menuSidebarDeCodigo,
} from './scanner';

const W = 1600;
const H = 1200;

const COLOR = {
  fondo: '#0f1626',
  texto: '#eef2f8',
  sub: '#9fb0c8',
  azul: '#4dabf7',
  verde: '#51cf66',
  rojo: '#ff6b6b',
  rosa: '#f06595',
  naranja: '#ffa94d',
  amarillo: '#ffd43b',
  morado: '#b197fc',
  cian: '#22b8cf',
};

const COLOR_METODO: Record<string, string> = {
  GET: '#2f9e44',
  POST: '#1971c2',
  PUT: '#e8590c',
  PATCH: '#9c36b5',
  DELETE: '#e03131',
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function envolver(texto: string, px: number, ancho: number): string[] {
  const aprox = px * 0.58;
  const palabras = texto.split(/\s+/);
  const lineas: string[] = [];
  let actual = '';
  for (const p of palabras) {
    const candidata = actual ? `${actual} ${p}` : p;
    if (candidata.length * aprox > ancho && actual) {
      lineas.push(actual);
      actual = p;
    } else {
      actual = candidata;
    }
  }
  if (actual) lineas.push(actual);
  return lineas.length ? lineas : [''];
}

function txt(x: number, y: number, t: string, px: number, color: string, peso = '400', anc = 'start'): string {
  return `<text x="${x}" y="${y}" font-family="Segoe UI, Verdana, sans-serif" font-size="${px}" font-weight="${peso}" fill="${color}" text-anchor="${anc}">${esc(t)}</text>`;
}

function chip(x: number, y: number, t: string, color: string, px = 11, alto = 22): string {
  const ancho = t.length * px * 0.58 + 18;
  return `<g><rect x="${x}" y="${y}" width="${ancho}" height="${alto}" rx="${alto / 2}" fill="${color}" fill-opacity="0.16" stroke="${color}" stroke-width="1"/><text x="${x + ancho / 2}" y="${y + alto / 2 + px * 0.36}" font-family="Segoe UI, Verdana, sans-serif" font-size="${px}" font-weight="600" fill="${color}" text-anchor="middle">${esc(t)}</text></g>`;
}

function rotulo(x: number, y: number, ancho: number, tit: string, color: string, sub?: string): string {
  let s = `<rect x="${x}" y="${y}" width="${ancho}" height="36" rx="9" fill="${color}" fill-opacity="0.14" stroke="${color}" stroke-width="1.4"/>`;
  s += `<text x="${x + 12}" y="${y + 23}" font-family="Segoe UI, Verdana, sans-serif" font-size="13.5" font-weight="700" fill="${color}">${esc(tit)}</text>`;
  if (sub) s += `<text x="${x + ancho - 12}" y="${y + 23}" font-family="Segoe UI, Verdana, sans-serif" font-size="10.5" fill="${COLOR.sub}" text-anchor="end">${esc(sub)}</text>`;
  return s;
}

function barraEtapas(y: number): string {
  const etapas: Array<{ x: number; label: string; sub: string; color: string }> = [
    { x: 30, label: 'CLIENTE', sub: 'Angular + interceptor', color: '#38d9a9' },
    { x: 450, label: 'MID', sub: 'Middleware Express', color: '#4dabf7' },
    { x: 870, label: 'API', sub: 'Controladores', color: '#f06595' },
    { x: 1290, label: 'BASE DE DATOS', sub: 'PostgreSQL Gestock_db', color: '#8ce99a' },
  ];
  let s = '';
  for (const e of etapas) {
    s += `<g><rect x="${e.x}" y="${y}" width="270" height="52" rx="12" fill="#182138" stroke="#2b3b5c" stroke-width="1.5"/>`;
    s += `<rect x="${e.x}" y="${y}" width="270" height="8" rx="4" fill="${e.color}"/>`;
    s += txt(e.x + 14, y + 28, e.label, 16, e.color, '800');
    s += txt(e.x + 14, y + 44, e.sub, 11, COLOR.sub);
    s += `</g>`;
  }
  s += `<line x1="300" y1="${y + 26}" x2="446" y2="${y + 26}" stroke="#51718f" stroke-width="3" marker-end="url(#fh)"/>`;
  s += `<line x1="720" y1="${y + 26}" x2="866" y2="${y + 26}" stroke="#51718f" stroke-width="3" marker-end="url(#fh)"/>`;
  s += `<line x1="1140" y1="${y + 26}" x2="1286" y2="${y + 26}" stroke="#51718f" stroke-width="3" marker-end="url(#fh)"/>`;
  return s;
}

function cabecera(spec: DiagramaSpec): string {
  return `
  <defs>
    <marker id="fh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/>
    </marker>
    <marker id="fha" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="7" markerHeight="7" orient="auto">
      <path d="M 10 0 L 0 5 L 10 10 z" fill="#51cf66"/>
    </marker>
    <filter id="som" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect x="0" y="0" width="${W}" height="${H}" fill="${COLOR.fondo}"/>
  <rect x="0" y="0" width="${W}" height="92" fill="#141c2f" filter="url(#som)"/>
  <rect x="0" y="86" width="${W}" height="8" fill="#203a5c"/>
  <text x="30" y="38" font-family="Segoe UI, Verdana, sans-serif" font-size="22" font-weight="800" fill="#74c0fc">GESTOCK</text>
  <text x="30" y="62" font-family="Segoe UI, Verdana, sans-serif" font-size="12" fill="${COLOR.sub}">SISTEMA DE GESTION DE INVENTARIO · DIAGRAMA ${spec.numero}</text>
  <rect x="268" y="20" width="150" height="40" rx="20" fill="#2b8a3e" fill-opacity="0.2" stroke="#51cf66" stroke-width="1.5"/>
  <text x="343" y="46" font-family="Segoe UI, Verdana, sans-serif" font-size="13" font-weight="700" fill="#8ce99a" text-anchor="middle">${esc(spec.categoria)}</text>
  <text x="440" y="46" font-family="Segoe UI, Verdana, sans-serif" font-size="26" font-weight="700" fill="${COLOR.texto}">${esc(spec.titulo)}</text>
  <text x="440" y="70" font-family="Segoe UI, Verdana, sans-serif" font-size="12.5" fill="${COLOR.sub}">${esc(spec.descripcion)}</text>
  <text x="1560" y="46" font-family="Segoe UI, Verdana, sans-serif" font-size="12" font-weight="600" fill="#9fb0c8" text-anchor="end">generado desde el CODIGO FUENTE</text>
  <text x="1560" y="66" font-family="Segoe UI, Verdana, sans-serif" font-size="11" fill="#6c7d99" text-anchor="end">CLIENTE → MID → API → BASE DE DATOS</text>`;
}

function svgAux(contenido: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <marker id="fh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker>
    <marker id="fha" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 10 0 L 0 5 L 10 10 z" fill="#51cf66"/></marker>
    <filter id="som" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.45"/></filter>
  </defs>
  <rect x="0" y="0" width="${W}" height="${H}" fill="${COLOR.fondo}"/>${contenido}</svg>`;
}

function dibujarControlador(s: DiagramaSpec): string {
  const rutas = s.rutas ?? [];
  const errores = s.errores ?? [];
  const tablas = s.tablas ?? [];
  const resp = s.respuestas ?? { ok: 0, created: 0, noContent: 0 };
  const filaH = rutas.length >= 7 ? 96 : 120;
  const areaTop = 196;
  const areaBtn = areaTop + rutas.length * filaH;

  let o = barraEtapas(104);
  o += rotulo(30, 152, 1540, `RUTAS REALES (${rutas.length})`, '#4dabf7', `/api${s.base ?? ''} · ${rutas.reduce((a, r) => a + r.permisos.length, 0)} permisos declarados`);

  const colX = [
    { x: 30, w: 292, label: 'CLIENTE · peticion' },
    { x: 322, w: 400, label: 'MID · middlewares' },
    { x: 722, w: 250, label: 'API · handler' },
    { x: 972, w: 330, label: 'BD · PostgreSQL' },
    { x: 1302, w: 268, label: 'RESPUESTA' },
  ];

  // columnas de encabezado
  colX.forEach((c) => {
    o += `<rect x="${c.x}" y="${172}" width="${c.w}" height="20" rx="4" fill="#121a2b" stroke="#1e2a42" stroke-width="1"/>`;
    o += txt(c.x + 10, 185, c.label, 10, '#5d7294');
  });

  rutas.forEach((r, i) => {
    const y = areaTop + i * filaH;
    const fondo = i % 2 === 0 ? '#161f33' : '#121a2c';
    colX.forEach((c) => {
      o += `<rect x="${c.x}" y="${y}" width="${c.w}" height="${filaH - 14}" rx="10" fill="${fondo}" stroke="#26334f" stroke-width="1"/>`;
    });
    for (let k = 0; k < colX.length - 1; k++) {
      o += `<line x1="${colX[k].x + colX[k].w}" y1="${y + (filaH - 14) / 2}" x2="${colX[k + 1].x}" y2="${y + (filaH - 14) / 2}" stroke="#3d5a80" stroke-width="2.2" marker-end="url(#fh)"/>`;
    }

    // CLIENTE
    const mc = COLOR_METODO[r.metodo] ?? '#adb5bd';
    o += `<rect x="${colX[0].x + 12}" y="${y + 16}" width="72" height="30" rx="8" fill="${mc}" fill-opacity="0.22" stroke="${mc}" stroke-width="1.6"/>`;
    o += txt(colX[0].x + 48, y + 36, r.metodo, 13, mc, '800', 'middle');
    const lr = envolver(r.rutaCompleta, 11.5, 180);
    lr.forEach((ln, k) => o += txt(colX[0].x + 94, y + 30 + k * 16, ln, 11.5, COLOR.texto, '600'));
    o += txt(colX[0].x + 12, y + filaH - 30, `paso ${i + 1}/${rutas.length}`, 9.5, '#5d7294');

    // MID
    const mws = r.middlewares.length ? r.middlewares : ['SIN MID'];
    let mx = colX[1].x + 12;
    let my = y + 20;
    mws.forEach((mw) => {
      const col = mw.startsWith('PERMISO')
        ? COLOR.naranja
        : mw.startsWith('LIMITE')
          ? COLOR.rosa
          : mw.startsWith('VALID')
            ? COLOR.amarillo
            : '#4dabf7';
      o += chip(mx, my, mw, col, 10, 20);
      mx += mw.length * 10 * 0.58 + 21;
      if (mx > colX[1].x + colX[1].w - 80) {
        mx = colX[1].x + 12;
        my += 25;
      }
    });
    if (r.permisos.length) {
      mx = colX[1].x + 12;
      my += 26;
      r.permisos.forEach((p) => {
        o += chip(mx, my, p, COLOR.naranja, 9.5, 19);
        mx += p.length * 9.5 * 0.58 + 19;
      });
    }

    // API
    o += `<rect x="${colX[2].x + 10}" y="${y + 18}" width="${colX[2].w - 20}" height="34" rx="8" fill="#0d3b57" stroke="#22b8cf" stroke-width="1.4"/>`;
    o += txt(colX[2].x + 20, y + 40, r.handler, 11.5, '#99e9f2', '700');
    o += txt(colX[2].x + 10, y + 68, 'try/catch → next(error)', 9.5, COLOR.sub);

    // BD
    const tbls = tablas.length ? tablas : ['(SQL directo)'];
    let tx = colX[3].x + 12;
    let ty = y + 20;
    tbls.forEach((t) => {
      o += chip(tx, ty, t, COLOR.verde, 10, 20);
      tx += t.length * 10 * 0.58 + 21;
      if (tx > colX[3].x + colX[3].w - 90) {
        tx = colX[3].x + 12;
        ty += 25;
      }
    });
    if (s.multitenant) o += txt(colX[3].x + 12, y + filaH - 28, 'multitenant: empresa_id', 9.5, '#8ce99a');

    // RESPUESTA
    const rTxt =
      resp.ok + resp.created + resp.noContent > 0
        ? [`${resp.ok} OK · ${resp.created} CREATED`, `${resp.noContent} NO CONTENT`]
        : ['responde sin datos'];
    rTxt.forEach((t, k) => o += txt(colX[4].x + 12, y + 32 + k * 18, `${k === 0 ? '2xx ' : '     '}${t}`, 10.5, '#8ce99a'));
  });

  // bandera inferior de flags
  const flags: string[] = [];
  if (s.auditoria) flags.push('AUDITORIA: registrarAuditoria');
  if (s.transaccion) flags.push('TRANSACCION SQL: transaction()');
  if (s.multitenant) flags.push('MULTITENANT: empresa_id');
  if (flags.length) {
    let fx = 30;
    const fy = areaBtn + 8;
    o += `<rect x="30" y="${fy}" width="1540" height="34" rx="9" fill="#162028" stroke="#26344d" stroke-width="1.2"/>`;
    flags.forEach((f) => {
      o += chip(fx, fy + 6, f, '#f08c00', 10.5, 21);
      fx += f.length * 10.5 * 0.58 + 30;
    });
  }

  // Sección de errores
  const errY = areaBtn + (flags.length ? 56 : 18);
  const errH = Math.min(206, H - errY - 104);
  o += `<rect x="30" y="${errY}" width="1540" height="${errH}" rx="12" fill="#141a24" stroke="#2b3550" stroke-width="1.4"/>`;
  o += `<text x="46" y="${errY + 26}" font-family="Segoe UI, Verdana, sans-serif" font-size="13" font-weight="700" fill="#ff8f8f">RAMAS DE ERROR (${errores.length}) — TODAS terminan en errorHandler → JSON { success:false, message, code, details? }</text>`;

  if (errores.length === 0) {
    o += txt(46, errY + 62, 'Este modulo no lanza ApiError directamente; los fallos se resuelven en autorizacion, validacion y errorHandler global.', 12, COLOR.sub);
  }

  const cols = errores.length > 6 ? 3 : 1;
  const eW = cols === 3 ? 496 : 1480;
  errores.forEach((e, i) => {
    const col = i % cols;
    const fila = Math.floor(i / cols);
    const ex = 44 + col * (eW + 8);
    const ey = errY + 40 + fila * 52;
    const ce =
      e.status === 400 ? COLOR.amarillo : e.status === 401 || e.status === 403 ? COLOR.naranja : e.status === 404 ? COLOR.cian : e.status === 409 || e.status === 429 ? COLOR.rosa : COLOR.rojo;
    const centerY = ey + 22;
    o += `<path d="M ${ex} ${centerY - 10} L ${ex + 10} ${centerY} L ${ex} ${centerY + 10} L ${ex - 10} ${centerY} Z" fill="${ce}" fill-opacity="0.2" stroke="${ce}" stroke-width="1.8"/>`;
    o += `<rect x="${ex + 18}" y="${ey}" width="${eW - 24}" height="48" rx="9" fill="#222033" stroke="${ce}" stroke-opacity="0.5" stroke-width="1.2"/>`;
    o += txt(ex + 28, ey + 18, `${e.status} ${e.code}`, 11, ce, '800');
    o += txt(ex + 138, ey + 18, `ApiError.${e.tipo} · ${esc(e.fuente)}`, 9, '#8a97ad');
    const msgs = envolver(e.mensaje, 10.5, eW - 170);
    o += txt(ex + 28, ey + 36, msgs[0], 10.5, '#ffd8d8');
  });

  // vuelta verde
  const vY = errY + errH + 10;
  o += `<path d="M 560 ${vY} C 560 ${vY + 36}, 320 ${vY + 30}, 200 ${vY + 8}" fill="none" stroke="#51cf66" stroke-width="3.5" stroke-dasharray="10 7" marker-end="url(#fh)"/>`;
  o += txt(800, vY + 44, 'VUELTA VERDE: la respuesta 2xx viaja del API directamente al cliente, sin pasar por el MID', 11.5, '#51cf66', '700', 'middle');
  o += txt(800, vY + 62, `Fuentes: routes/${esc(s.modulo ?? '')}.routes.ts · controllers/${esc(s.modulo ?? '')}.controller.ts · repositories · services`, 9.5, '#6c7d99', '400', 'middle');

  return o;
}

function pasosV(iniY: number, pasos: string[], color: string, x = 120, ancho = 1360, alto = 46): string {
  let o = '';
  pasos.forEach((p, i) => {
    const yy = iniY + i * (alto + 14);
    o += `<rect x="${x}" y="${yy}" width="${ancho}" height="${alto}" rx="12" fill="#141c2f" stroke="#26334d" stroke-width="1.4"/>`;
    o += `<circle cx="${x + 34}" cy="${yy + alto / 2}" r="16" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.6"/>`;
    o += `<text x="${x + 34}" y="${yy + alto / 2 + 5}" font-family="Segoe UI, Verdana, sans-serif" font-size="13" font-weight="800" fill="${color}" text-anchor="middle">${i + 1}</text>`;
    o += txt(x + 66, yy + alto / 2 + 5, p, 13.5, '#e7eef9');
    if (i < pasos.length - 1) {
      o += `<line x1="${x + ancho / 2}" y1="${yy + alto}" x2="${x + ancho / 2}" y2="${yy + alto + 12}" stroke="#3d5a80" stroke-width="2.5" marker-end="url(#fh)"/>`;
    }
  });
  return o;
}

function dia(spec: DiagramaSpec, cuerpo: string): string {
  return svgAux(cabecera(spec) + cuerpo);
}

// ---------- AUXILIARES ----------

function portada(spec: DiagramaSpec): string {
  const items = escanearTodos();
  const aux: Array<[number, string, string]> = [
    [1, 'Portada', 'Generales'],
    [2, 'Arquitectura General', 'Generales'],
    [3, 'MID Detalle', 'Generales'],
    [4, 'Autenticacion Sesion', 'Generales'],
    [5, 'RBAC Roles Permisos', 'Generales'],
    [6, 'Patron CRUD', 'Generales'],
    [7, 'Errores Backend', 'Generales'],
    [8, 'Base Datos', 'Generales'],
    [9, 'Matriz Trazabilidad', 'Generales'],
    [28, 'Ciclo Completo Ida Vuelta', 'Ciclo y Respuesta'],
    [29, 'Retorno Sin MID', 'Ciclo y Respuesta'],
    [30, 'Publicos Sin MID', 'Servidor y Acceso'],
    [31, 'Pipeline app ts', 'Servidor y Acceso'],
    [32, 'Rutas Frontend Protegidas', 'Frontend'],
    [33, 'Mapa Paginas Endpoints', 'Frontend'],
    [34, 'Errores Cliente', 'Frontend'],
  ];
  const todas: Array<[number, string, string]> = [
    ...aux,
    ...items.map((it) => [it.numero, it.titulo, it.categoria] as [number, string, string]),
  ].sort((a, b) => a[0] - b[0]);
  let o = `<circle cx="1400" cy="170" r="240" fill="#131b2c"/>`;
  o += txt(110, 110, 'GESTOCK', 62, '#eef2f8', '900');
  o += txt(112, 158, 'Sistema de Gestion de Inventario · Diagrama de Arquitectura', 19, '#7ea7d9');
  o += txt(112, 188, `${todas.length} diagramas generados automaticamente desde el codigo fuente: rutas, middlewares, controladores, repositorios y SQL.`, 13, COLOR.sub);
  let gx = 110;
  let gy = 230;
  todas.forEach(([num, tit, cat]) => {
    o += `<g><rect x="${gx}" y="${gy}" width="440" height="34" rx="8" fill="#16202f" stroke="#26344d" stroke-width="1"/>`;
    o += `<rect x="${gx + 10}" y="${gy + 7}" width="52" height="20" rx="10" fill="#1f8f4b" fill-opacity="0.25"/>`;
    o += txt(gx + 36, gy + 21, String(num).padStart(2, '0'), 11, '#8ce99a', '700', 'middle');
    o += txt(gx + 230, gy + 21, tit, 12.5, '#dbe4f1', '400', 'middle');
    o += txt(gx + 424, gy + 21, cat, 9.5, '#5d7294', '400', 'end');
    o += `</g>`;
    gx += 480;
    if (gx > 1400) {
      gx = 110;
      gy += 46;
    }
  });
  return dia(spec, o);
}

function arquitectura(spec: DiagramaSpec): string {
  const cajas: Array<{ x: number; tit: string; sub: string; det: string[]; color: string }> = [
    { x: 70, tit: 'CLIENTE', sub: 'Angular + TypeScript', det: ['SPA standalone', 'Guard de permisos (RBAC)', 'Interceptor Bearer JWT', 'Toasts y manejo de errores'], color: '#38d9a9' },
    { x: 590, tit: 'BACKEND', sub: 'Node.js + Express 5', det: ['API REST bajo /api', 'Rutas por modulo', 'MID: token/permiso/validacion/limite', 'Servicios + repositorios (pg)'], color: '#4dabf7' },
    { x: 1110, tit: 'BASE DE DATOS', sub: 'PostgreSQL Gestock_db', det: ['18 tablas relacionales', 'Esquema multitenant (empresa_id)', 'Claves foraneas normalizadas', 'SQL real en repositories'], color: '#8ce99a' },
  ];
  let o = '';
  cajas.forEach((c) => {
    o += `<rect x="${c.x}" y="150" width="420" height="380" rx="16" fill="#141c2f" stroke="#26334d" stroke-width="1.6"/>`;
    o += `<rect x="${c.x}" y="150" width="420" height="54" rx="16" fill="#1b283f"/>`;
    o += `<text x="${c.x + 20}" y="${150 + 32}" font-family="Segoe UI, Verdana, sans-serif" font-size="19" font-weight="800" fill="${c.color}">${esc(c.tit)}</text>`;
    o += txt(c.x + 20, 150 + 52, c.sub, 11, COLOR.sub);
    c.det.forEach((d, i) => o += txt(c.x + 24, 230 + i * 30, '•  ' + d, 12.5, '#c9d6ea'));
  });
  o += `<line x1="500" y1="340" x2="580" y2="340" stroke="#67a7f5" stroke-width="3" marker-end="url(#fh)"/>`;
  o += `<line x1="1020" y1="340" x2="1100" y2="340" stroke="#67a7f5" stroke-width="3" marker-end="url(#fh)"/>`;
  o += txt(540, 328, 'HTTP / JSON', 11, COLOR.sub, '400', 'middle');
  o += txt(1060, 328, 'SQL / pg', 11, COLOR.sub, '400', 'middle');
  o += `<path d="M 800 540 C 800 600, 300 620, 300 570" fill="none" stroke="#51cf66" stroke-width="3.5" stroke-dasharray="10 7" marker-end="url(#fh)"/>`;
  o += txt(540, 570, 'RESPUESTA JSON { success, message, data }', 13, '#51cf66', '700', 'middle');
  o += `<rect x="200" y="620" width="1200" height="90" rx="14" fill="#16263a" stroke="#2b3b5c" stroke-width="1.5"/>`;
  o += txt(800, 662, 'Flujo base de una operacion', 14, '#eef2f8', '700', 'middle');
  o += txt(800, 688, '1. Peticion SPA → /api · 2. MID (token, permiso, validacion, limite) · 3. Controlador · 4. Repositorio SQL · 5. Vuelta directa', 12, COLOR.sub, '400', 'middle');
  return dia(spec, o);
}

function midDetalle(spec: DiagramaSpec): string {
  const pasos = [
    'MID authenticateToken: lee Authorization; sin "Bearer" → 401 UNAUTHORIZED (No se proporciono un token de acceso)',
    'MID jwt.verify: token expirado → 401 "Tu sesion ha expirado"; invalido → 401 "El token de acceso no es valido"',
    'Carga usuario con permisos; no existe → 401; estado != Activo → 403 FORBIDDEN (cuenta inactiva)',
    'Valida sesion activa (tabla sesiones) y fija req.empresaId para multitenant; sesion cerrada → 401',
    'MID authorize: sin req.user → 401; sin permiso → 403 (authorizePermission / authorizeAnyPermission)',
    'MID validate: validateBody/Params/Query (Zod) → 400 BAD_REQUEST con detalle de campos',
    'MID rateLimit: loginEmailLimiter (5/cuenta), loginIpLimiter (60/IP), recuperacionLimiter (5), apiRateLimiter (500/15min) → 429',
    'Controlador: try/catch → next(error) envía todo a errorHandler global',
  ];
  let o = `<rect x="30" y="104" width="1540" height="60" rx="12" fill="#12233b" stroke="#2b4a74"/>`;
  o += txt(60, 132, 'CADENA DEL MID  ·  EXPRESS MIDDLEWARE', 16, '#4dabf7', '800');
  o += txt(60, 152, 'fuente: src/middleware/*.ts — cada paso lanza ApiError con status y code exactos', 11, COLOR.sub);
  o += pasosV(180, pasos, '#4dabf7');
  return dia(spec, o);
}

function autenticacionSesion(spec: DiagramaSpec): string {
  const pasos = [
    'CLIENTE POST /api/auth/login { email, password }',
    'VALIDAR BODY (loginSchema) → 400 si no cumple',
    'LIMITE loginEmailLimiter (5) + loginIpLimiter (60) → 429 RATE_LIMITED',
    'autenticarEnEmpresa → usuarioRepo.buscarPorEmail',
    'auditoria real: usuario inexistente → 401 · inactivo → 403 · rol inactivo → 403 · bcrypt != → 401',
    'sesionRepo.crear (tabla sesiones) + registrarUltimoAcceso',
    'getUsuarioConPermisosPorId → arma permisos (500 si falla)',
    'jwt.sign({ userId, roleId, role, email, sesionId }) → { token, sesionId, usuario } + auditoria LOGIN',
  ];
  const errores: Array<[number, string]> = [
    [401, 'Las credenciales ingresadas no son validas.'],
    [401, 'El usuario no pertenece a esa empresa.'],
    [403, 'Tu cuenta esta inactiva. Contacta al administrador.'],
    [403, 'El rol asignado a tu cuenta esta inactivo.'],
    [500, 'No se pudieron cargar los permisos del usuario.'],
  ];
  let o = txt(60, 118, 'LOGIN → JWT → SESION ACTIVA', 17, '#38d9a9', '800');
  o += txt(60, 138, 'fuente: services/auth.service.ts (autenticarEnEmpresa) · repositories/sesion.repo.ts', 11, COLOR.sub);
  o += pasosV(166, pasos, '#38d9a9', 120, 900, 50);
  o += txt(1080, 196, 'RAMAS DE ERROR', 16, '#ff6b6b', '800');
  errores.forEach(([st, msg], i) => {
    const y = 218 + i * 78;
    const ce = st === 401 ? COLOR.naranja : st === 403 ? COLOR.rosa : COLOR.rojo;
    o += `<rect x="1080" y="${y}" width="440" height="60" rx="10" fill="#261016" stroke="#5c2b31" stroke-width="1.4"/>`;
    o += txt(1100, y + 24, `HTTP ${st}`, 12, ce, '800');
    o += txt(1100, y + 46, msg, 11, '#ffd8d8');
  });
  return dia(spec, o);
}

function rbac(spec: DiagramaSpec): string {
  const { roles, permisos, mapa } = rbacDeSql();
  const modulos = [...new Set(permisos.map((p) => p.modulo))];
  let o = txt(60, 110, `RBAC  ·  ${roles.length} ROLES  ·  ${permisos.length} PERMISOS`, 17, '#b197fc', '800');
  o += txt(60, 132, 'fuente: sql/03_insert_roles.sql · sql/04_insert_permissions.sql · sql/05_seed_data.sql (mapeo rol_permiso)', 11, COLOR.sub);

  let mx = 60;
  let my = 160;
  modulos.forEach((mod) => {
    const ps = permisos.filter((p) => p.modulo === mod);
    o += `<rect x="${mx}" y="${my}" width="235" height="${46 + ps.length * 22}" rx="10" fill="#171f33" stroke="#2c3a58"/>`;
    o += txt(mx + 12, my + 24, `${mod}  (${ps.length})`, 13, '#b197fc', '800');
    ps.forEach((p, k) => {
      const con = roles.filter((r) => (mapa[r] ?? []).includes(p.codigo)).length;
      o += txt(mx + 14, my + 46 + k * 22, p.codigo, 10, '#c9d6ea', '400');
      o += txt(mx + 220, my + 46 + k * 22, `${con} rol${con === 1 ? '' : 'es'}`, 9, con >= 2 ? '#8ce99a' : '#ffa94d', '700', 'end');
    });
    my += 46 + ps.length * 22 + 16;
    if (my > 1000) {
      my = 160;
      mx += 285;
    }
  });

  // roles resumen a la derecha
  const rolX = 1180;
  let ry = 160;
  roles.forEach((r) => {
    const cant = (mapa[r] ?? []).length;
    o += `<rect x="${rolX}" y="${ry}" width="360" height="120" rx="12" fill="#14223a" stroke="#28406a"/>`;
    o += txt(rolX + 16, ry + 30, r, 15, '#b197fc', '700');
    o += txt(rolX + 16, ry + 56, `${cant} de ${permisos.length} permisos`, 12, '#8ce99a', '700');
    const mods = modulos.filter((mod) => permisos.some((p) => p.modulo === mod && (mapa[r] ?? []).includes(p.codigo))).slice(0, 4);
    o += txt(rolX + 16, ry + 82, mods.join(' · ') || 'sin modulos', 10, COLOR.sub);
    o += txt(rolX + 16, ry + 104, r === 'Administrador' ? 'TODOS los permisos del sistema' : 'cargado desde 05_seed_data.sql', 9.5, '#5d7294');
    ry += 142;
  });
  return dia(spec, o);
}

function patronCrud(spec: DiagramaSpec): string {
  const filas: Array<{ op: string; metodo: string; ruta: string; pasos: string; ok: string; err: string }> = [
    { op: 'CREATE', metodo: 'POST', ruta: '/api/<modulo>', pasos: 'TOKEN → PERMISO create → VALIDAR BODY → controller.crear → repo INSERT → auditoria', ok: '201 CREATED { success:true, data }', err: '400 validacion · 403 permiso · 409 conflict (duplicado)' },
    { op: 'READ', metodo: 'GET', ruta: '/api/<modulo> y /:id', pasos: 'TOKEN → PERMISO view (o any) → VALIDAR PARAMS → controller.listar/detalle → repo SELECT', ok: '200 OK { success:true, data } · detalle inexistente → 404', err: '404 NOT_FOUND · 401 · 403' },
    { op: 'UPDATE', metodo: 'PUT', ruta: '/api/<modulo>/:id', pasos: 'TOKEN → PERMISO edit → VALIDAR PARAMS+BODY → existe? → repo UPDATE → auditoria', ok: '200 OK { success:true, message }', err: '404 no existe · 409 duplicado al editar' },
    { op: 'DELETE', metodo: 'DELETE', ruta: '/api/<modulo>/:id', pasos: 'TOKEN → PERMISO delete → VALIDAR PARAMS → existe? → repo DELETE → auditoria', ok: '200 OK (noContent con message)', err: '404 no existe · 409 en uso por otra entidad' },
  ];
  let o = txt(60, 110, 'PATRON CRUD UNIVERSAL', 17, '#ffd43b', '800');
  o += txt(60, 132, 'esquema derivado de los 18 controladores: todas las rutas siguen esta secuencia MID', 11, COLOR.sub);
  let y = 170;
  filas.forEach((f) => {
    o += `<rect x="60" y="${y}" width="1480" height="218" rx="14" fill="#161f33" stroke="#26334d"/>`;
    o += `<rect x="80" y="${y + 22}" width="112" height="40" rx="10" fill="${COLOR_METODO[f.metodo]}" fill-opacity="0.25" stroke="${COLOR_METODO[f.metodo]}"/>`;
    o += txt(136, y + 48, f.op, 15, COLOR_METODO[f.metodo], '800', 'middle');
    o += txt(220, y + 34, `${f.metodo}  ${f.ruta}`, 13, '#dbe4f1', '700');
    o += txt(220, y + 62, f.pasos, 12.5, COLOR.sub);
    o += txt(80, y + 96, 'OK    → ' + f.ok, 12, '#8ce99a', '700');
    o += txt(560, y + 96, 'ERROR → ' + f.err, 12, '#ff8f8f', '700');
    o += txt(80, y + 128, 'Error no controlado: catch → next(err) → errorHandler: 400 JSON invalido · 409 duplicado/FK · 400 campo nulo/parametro · 500 interno', 11, '#5d7294');
    o += txt(80, y + 154, 'Los controladores responden SIEMPRE JSON: { success, message, data, code?, details? }; registro de auditoria al mutar.', 11, '#5d7294');
    o += txt(80, y + 192, 'VUELTA VERDE: respuesta 2xx directa al cliente (sin recalcular el MID).', 11, '#51cf66', '600');
    y += 232;
  });
  return dia(spec, o);
}

function erroresBackend(spec: DiagramaSpec): string {
  const { api, handler } = erroresBackendDeCodigo();
  let o = txt(60, 110, `CLASIFICACION DE ERRORES DEL BACKEND`, 17, '#ff6b6b', '800');
  o += txt(60, 132, 'fuente: utils/ApiError.ts + middleware/errorHandler.ts — codigo real', 11, COLOR.sub);
  o += `<rect x="60" y="160" width="720" height="44" rx="10" fill="#1a2230"/><text x="80" y="189" font-family="Segoe UI, Verdana, sans-serif" font-size="14" font-weight="800" fill="#ffa8a8">ApiError (fabrica) — ${api.length} metodos</text>`;
  api.forEach((a, i) => {
    const y = 214 + i * 72;
    o += `<rect x="60" y="${y}" width="720" height="58" rx="10" fill="#191228" stroke="#3a2f45" stroke-width="1.2"/>`;
    o += txt(78, y + 24, `ApiError.${a.tipo}()`, 11.5, '#ffd8d8', '700');
    o += txt(300, y + 24, `${a.status}`, 11, a.status >= 500 ? '#ff6b6b' : '#ffa94d', '800');
    o += txt(356, y + 24, a.code, 11, '#4dabf7', '600');
    o += txt(78, y + 45, `"${esc(a.mensaje)}"`, 11, '#efe3e3');
  });
  o += `<rect x="830" y="160" width="710" height="44" rx="10" fill="#1a2230"/><text x="850" y="189" font-family="Segoe UI, Verdana, sans-serif" font-size="14" font-weight="800" fill="#ffa8a8">errorHandler (middleware final) — ${handler.length} casos</text>`;
  handler.forEach((h, i) => {
    const y = 214 + i * 62;
    o += `<rect x="830" y="${y}" width="710" height="48" rx="10" fill="#16201a" stroke="#2b4a33" stroke-width="1.2"/>`;
    o += txt(850, y + 22, `${h.status}`, 11, h.status >= 500 ? '#ff6b6b' : '#ffa94d', '800');
    o += txt(910, y + 22, h.code, 11, '#4dabf7', '600');
    o += txt(850, y + 42, `"${esc(h.mensaje)}"`, 10.5, '#efe3e3');
  });
  return dia(spec, o);
}

function baseDatos(spec: DiagramaSpec): string {
  const entidades = baseDatosDeSql();
  let o = txt(60, 108, `ESQUEMA POSTGRESQL · GESTOCK_DB · ${entidades.length} TABLAS`, 17, '#8ce99a', '800');
  o += txt(60, 130, 'fuente: sql/02_create_tables.sql — claves foraneas (REFERENCES) reales entre tablas', 11, COLOR.sub);
  let x = 60;
  let y = 160;
  entidades.forEach((e, i) => {
    if (i > 0 && i % 6 === 0) {
      x += 262;
      y = 160;
    }
    o += `<rect x="${x}" y="${y}" width="232" height="108" rx="12" fill="${e.multitenant ? '#0f2a1c' : '#141c2f'}" stroke="${e.multitenant ? '#2f9e44' : '#26334d'}" stroke-width="1.6"/>`;
    o += txt(x + 12, y + 26, e.tabla, 12.5, e.multitenant ? '#8ce99a' : '#dbe4f1', '700');
    o += txt(x + 12, y + 48, `${e.campos} campos`, 10, '#6f819f');
    const fks = e.fks.filter((f) => f !== e.tabla);
    if (fks.length) o += txt(x + 12, y + 68, `FK → ${esc(fks.join(', '))}`, 9.5, COLOR.sub);
    if (e.multitenant) o += txt(x + 12, y + 88, 'MULTITENANT · empresa_id', 9.5, '#51cf66', '700');
    y += 112 + 24;
    if (y > 152 + 4 * 136) {
      y = 160;
      x += 262;
    }
  });
  return dia(spec, o);
}

function matriz(spec: DiagramaSpec): string {
  const items = escanearTodos();
  let o = txt(60, 108, 'MATRIZ DE TRAZABILIDAD · CODIGO → DIAGRAMA', 17, '#ffd43b', '800');
  o += txt(60, 130, 'cada diagrama de controlador deriva de: routes + controller + services + repositories del modulo', 11, COLOR.sub);
  let y = 160;
  o += `<rect x="60" y="${y}" width="58" height="30" rx="6" fill="#1f8f4b" fill-opacity="0.5"/><text x="89" y="${y + 21}" font-family="Segoe UI, Verdana, sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">N°</text>`;
  o += `<rect x="124" y="${y}" width="210" height="30" rx="6" fill="#2b4a74"/><text x="229" y="${y + 21}" font-family="Segoe UI, Verdana, sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">MODULO</text>`;
  o += `<rect x="340" y="${y}" width="100" height="30" rx="6" fill="#2b4a74"/><text x="390" y="${y + 21}" font-family="Segoe UI, Verdana, sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">RUTAS</text>`;
  o += `<rect x="446" y="${y}" width="100" height="30" rx="6" fill="#2b4a74"/><text x="496" y="${y + 21}" font-family="Segoe UI, Verdana, sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">ERRORES</text>`;
  o += `<rect x="552" y="${y}" width="180" height="30" rx="6" fill="#2b4a74"/><text x="642" y="${y + 21}" font-family="Segoe UI, Verdana, sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">TABLAS BD</text>`;
  o += `<rect x="738" y="${y}" width="782" height="30" rx="6" fill="#2b4a74"/><text x="1129" y="${y + 21}" font-family="Segoe UI, Verdana, sans-serif" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">FUENTES DEL CODIGO</text>`;
  y += 46;
  items.forEach((it) => {
    const fuentes = `routes/${it.modulo}.routes.ts · controllers/${it.modulo}.controller.ts${it.auditoria ? ' + auditoria.service' : ''}`;
    o += `<rect x="60" y="${y}" width="1460" height="36" rx="6" fill="${y % 92 === 46 ? '#161f33' : '#131b2d'}"/>`;
    o += txt(89, y + 23, `${it.numero}`, 11, '#8ce99a', '700', 'middle');
    o += txt(229, y + 23, it.titulo, 11.5, '#dbe4f1', '400', 'middle');
    o += txt(390, y + 23, `${(it.rutas ?? []).length}`, 11, '#4dabf7', '600', 'middle');
    o += txt(496, y + 23, `${(it.errores ?? []).length}`, 11, '#ff8f8f', '600', 'middle');
    o += txt(642, y + 23, (it.tablas ?? []).slice(0, 4).join(', ') || '—', 9.5, '#8ce99a', '400', 'middle');
    o += txt(738, y + 23, fuentes, 9.5, '#6f819f');
    y += 42;
  });
  return dia(spec, o);
}

function cicloCompleto(spec: DiagramaSpec): string {
  const etapas = [
    { x: 70, tit: 'CLIENTE', color: '#38d9a9', det: 'action → service → HTTP' },
    { x: 590, tit: 'MID', color: '#4dabf7', det: 'token · permiso · validacion · limite' },
    { x: 1110, tit: 'API + BD', color: '#8ce99a', det: 'controller → repo → sql' },
  ];
  let o = '';
  etapas.forEach((e) => {
    o += `<rect x="${e.x}" y="150" width="420" height="120" rx="16" fill="#141c2f" stroke="#26334d" stroke-width="1.6"/>`;
    o += txt(e.x + 20, 190, e.tit, 18, e.color, '800');
    o += txt(e.x + 20, 214, e.det, 11.5, COLOR.sub);
  });
  o += `<line x1="500" y1="210" x2="580" y2="210" stroke="#3d5a80" stroke-width="3" marker-end="url(#fh)"/>`;
  o += `<line x1="1020" y1="210" x2="1100" y2="210" stroke="#3d5a80" stroke-width="3" marker-end="url(#fh)"/>`;
  const pasos = [
    'CLIENTE Angular → interceptor agrega Authorization: Bearer <jwt>',
    'HTTP /api/... con el proxy → pipeline Express (/api + apiRateLimiter 500/15min)',
    'MID: authenticateToken (JWT + sesion activa) → authorize (permiso) → validate (Zod)',
    'CONTROLADOR ejecuta la logica de negocio y orquesta repositorios',
    'REPOSITORIO ejecuta SQL real (query / transaction()) contra PostgreSQL Gestock_db',
    'VUELTA VERDE: JSON { success, message, data } viaja directo del API al cliente SIN volver por el MID',
  ];
  o += pasosV(300, pasos, '#4dabf7', 150, 1300, 52);
  return dia(spec, o);
}

function retornoSinMid(spec: DiagramaSpec): string {
  const respuestas: Array<[string, string, string]> = [
    ['ok(res, data, msg?)', '200', '{ success:true, message, data }'],
    ['created(res, data, msg)', '201', '{ success:true, message, data }'],
    ['noContent(res, msg?)', '200', '{ success:true, message, data:null }'],
    ['errorHandler (ApiError)', '#{status}', '{ success:false, message, code, details? }'],
  ];
  let o = txt(60, 104, 'FORMATO DE RESPUESTA · RETURN WITHOUT MID', 17, '#51cf66', '800');
  o += txt(60, 126, 'fuente: utils/response.ts + middleware/errorHandler.ts', 11, COLOR.sub);
  respuestas.forEach(([fn, code, json], i) => {
    const y = 160 + i * 170;
    const esErr = code.startsWith('#');
    o += `<rect x="60" y="${y}" width="1480" height="140" rx="12" fill="#141c2f" stroke="#26334d" stroke-width="1.4"/>`;
    o += txt(90, y + 34, fn, 15, esErr ? '#ff6b6b' : '#8ce99a', '700');
    o += txt(430, y + 34, `HTTP ${esErr ? code.slice(1) : code}`, 13, esErr ? '#ff8f8f' : '#ffd43b', '800');
    o += txt(620, y + 34, json, 13, '#dbe4f1');
    o += txt(90, y + 68, 'La respuesta NO vuelve a pasar por el MID; viaja directo del controlador al cliente.', 11.5, COLOR.sub);
    o += txt(90, y + 92, 'El interceptor consume err.error.message y err.error.code para toasts y redireccion de sesion expirada.', 10.5, '#6c7d99');
    o += txt(90, y + 116, 'success: true para 2xx · success: false + code para errores (padron GESTOCK)', 11, '#51cf66', '600');
  });
  return dia(spec, o);
}

function publicosSinMid(spec: DiagramaSpec): string {
  const pubs: Array<[string, string, string, string]> = [
    ['POST', '/api/auth/login', 'loginEmailLimiter 5/cuenta + loginIpLimiter 60/IP', 'login'],
    ['POST', '/api/auth/recuperar', 'recuperacionLimiter 5/telefono', 'solicitarRecuperacion'],
    ['POST', '/api/auth/recuperar/validar', 'sin limitador', 'validarCodigoRecuperacion'],
    ['POST', '/api/auth/recuperar/restablecer', 'sin limitador', 'restablecerPassword'],
    ['GET', '/api/health', 'sin limitador', 'health'],
  ];
  let o = txt(60, 104, 'RUTAS PUBLICAS SIN AUTENTICACION', 17, '#ffd43b', '800');
  o += txt(60, 126, 'extraidas de rutas/auth.routes.ts + routes/index.ts: no usan authenticateToken (acceso anonimo)', 11, COLOR.sub);
  pubs.forEach(([m, r, lim, handler], i) => {
    const y = 160 + i * 112;
    o += `<rect x="60" y="${y}" width="1480" height="94" rx="12" fill="#171f2c" stroke="#2c3a58" stroke-width="1.4"/>`;
    o += `<rect x="84" y="${y + 24}" width="76" height="34" rx="8" fill="${COLOR_METODO[m]}" fill-opacity="0.22" stroke="${COLOR_METODO[m]}"/>`;
    o += txt(122, y + 46, m, 13, COLOR_METODO[m], '800', 'middle');
    o += txt(190, y + 46, r, 14.5, '#dfe8f5', '700');
    o += txt(620, y + 36, `handler: authController.${handler}`, 11.5, COLOR.sub);
    o += txt(620, y + 64, `proteccion: ${lim}`, 11.5, '#ffa94d');
    o += txt(1150, y + 46, 'acceso sin token JWT', 11.5, '#8ce99a');
  });
  o += `<rect x="60" y="800" width="1480" height="70" rx="12" fill="#2b2b14"/>`;
  o += txt(800, 836, 'El resto de modulos montan authenticateToken a nivel de router (router.use(authenticateToken))', 13, '#ffd43b', '700', 'middle');
  o += txt(800, 858, 'POST /login usa loginSchema de zod y limitadores ANTES de tocar el controlador', 11, COLOR.sub, '400', 'middle');
  return dia(spec, o);
}

function pipelineApp(spec: DiagramaSpec): string {
  const pasos = pipelineDeApp();
  let o = txt(60, 104, 'PIPELINE DE LA APP EXPRESS · app.ts', 17, '#4dabf7', '800');
  o += txt(60, 126, 'orden real de app.use() leido de src/app.ts', 11, COLOR.sub);
  o += pasosV(160, pasos, '#4dabf7', 120, 1360, 52);
  return dia(spec, o);
}

function rutasFrontend(spec: DiagramaSpec): string {
  const rutas = rutasFrontendDeCodigo();
  let o = txt(60, 104, 'RUTAS FRONTEND PROTEGIDAS · permissionGuard', 17, '#b197fc', '800');
  o += txt(60, 126, 'fuente: src/app/app.routes.ts — cada ruta con data.permission o data.anyPermission', 11, COLOR.sub);
  let y = 160;
  rutas.forEach((r) => {
    o += `<rect x="60" y="${y}" width="1480" height="54" rx="10" fill="${y % 108 === 46 ? '#171f33' : '#131b2d'}"/>`;
    o += txt(90, y + 33, `/app/${esc(r.ruta)}`, 12.5, '#dbe4f1', '700');
    o += txt(620, y + 33, r.permiso, 11.5, '#ffd43b', '600');
    o += txt(1120, y + 33, 'guard: permissionGuard · lazy loadComponent', 10.5, '#6f819f');
    y += 64;
  });
  return dia(spec, o);
}

function mapaPaginas(spec: DiagramaSpec): string {
  const items = menuSidebarDeCodigo();
  let o = txt(60, 104, 'MAPA DE PAGINAS DEL FRONTEND', 17, '#22b8cf', '800');
  o += txt(60, 126, 'fuente: layout/sidebar/sidebar.ts — cada pagina con sus permisos', 11, COLOR.sub);
  const seccionColor: Record<string, string> = { PANEL: '#4dabf7', 'GESTIÓN': '#38d9a9', MANTENIMIENTO: '#ffa94d', 'DOCUMENTACIÓN': '#b197fc' };
  let x = 60;
  let y = 160;
  let actual = '';
  items.forEach((it) => {
    if (it.seccion !== actual) {
      actual = it.seccion;
      o += txt(x + 12, y, actual, 14, seccionColor[actual] ?? '#ccc', '800');
      y += 28;
    }
    o += `<rect x="${x + 8}" y="${y}" width="560" height="92" rx="12" fill="#141c2f" stroke="#26334d" stroke-width="1.4"/>`;
    o += txt(x + 24, y + 28, it.label, 13.5, '#eef2f8', '700');
    o += txt(x + 24, y + 50, it.ruta, 10.5, '#9fb0c8');
    o += txt(x + 24, y + 72, it.permisos.join(' | ') || '(sin permisos)', 9.5, '#ffd43b');
    y += 108;
    if (y > 1040) {
      y = 160;
      x += 620;
    }
  });
  return dia(spec, o);
}

function erroresCliente(spec: DiagramaSpec): string {
  const pasos = [
    'Peticion sale del servicio Angular → interceptor apiInterceptor (src/app/interceptors/api.interceptor.ts)',
    'Si existe token (localStorage gestock_token) → clona la peticion con Authorization: Bearer <token>',
    'Despues de next(request): catchError captura el error HTTP (RxJS)',
    'status === 401 y la peticion NO es /auth/login → limpia storage + toast "Tu sesion ha expirado" + navega a /auth/login',
    'Cualquier otro status ≠ 401 → toast.mostrar(message, error) con el message enviado por el backend',
    'Sin respuesta de red → message = err.message || "Error de conexion con el servidor." → toast error',
    'Respuestas 2xx se entregan sin cambios; el componente consume data y message',
  ];
  let o = txt(60, 104, 'MANEJO DE ERRORES EN EL CLIENTE · INTERCEPTOR', 17, '#ff6b6b', '800');
  o += txt(60, 126, 'fuente: interceptor.ts — respeta el JSON { success, message, code } del backend', 11, COLOR.sub);
  o += pasosV(160, pasos, '#ff6b6b', 120, 1360, 50);
  const finY = 160 + pasos.length * 64;
  o += `<rect x="120" y="${finY}" width="1360" height="76" rx="12" fill="#242b38"/>`;
  o += txt(800, finY + 30, 'Flujo de sesion: login OK guarda token → cualquier 401 redirige al login automaticamente', 13, '#eef2f8', '700', 'middle');
  o += txt(800, finY + 56, 'Plantillas toast: sesion expirada · message del backend · "Error de conexion con el servidor."', 11, COLOR.sub, '400', 'middle');
  return dia(spec, o);
}

export function renderer(spec: DiagramaSpec): string {
  if (spec.numero >= 10 && spec.numero <= 27 && spec.rutas) {
    return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${cabecera(spec)}${dibujarControlador(spec)}</svg>`;
  }
  const a: Record<number, (s: DiagramaSpec) => string> = {
    1: portada,
    2: arquitectura,
    3: midDetalle,
    4: autenticacionSesion,
    5: rbac,
    6: patronCrud,
    7: erroresBackend,
    8: baseDatos,
    9: matriz,
    28: cicloCompleto,
    29: retornoSinMid,
    30: publicosSinMid,
    31: pipelineApp,
    32: rutasFrontend,
    33: mapaPaginas,
    34: erroresCliente,
  };
  const fn = a[spec.numero];
  if (fn) return fn(spec);
  return dia(spec, txt(800, 600, 'Diagrama pendiente', 20, COLOR.sub, '400', 'middle'));
}