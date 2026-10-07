export interface RutaDiagrama {
  metodo: string;
  rutaCompleta: string;
  subruta: string;
  handler: string;
  middlewares: string[];
  permisos: string[];
  limiter?: string;
}

export interface ErrorDiagrama {
  tipo: string;
  status: number;
  code: string;
  mensaje: string;
  fuente: string;
}

export interface DiagramaSpec {
  numero: number;
  nombre: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  modulo?: string;
  base?: string;
  rutas?: RutaDiagrama[];
  errores?: ErrorDiagrama[];
  tablas?: string[];
  respuestas?: { ok: number; created: number; noContent: number };
  auditoria?: boolean;
  transaccion?: boolean;
  multitenant?: boolean;
  pasos?: string[];
  extras?: Record<string, unknown>;
}