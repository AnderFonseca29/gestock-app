import { query } from '../config/db';

export interface RegistrarAuditoriaParams {
  usuarioId: number | null;
  usuarioNombre?: string | null;
  accion: 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR' | 'LOGIN' | 'LOGOUT' | 'CONSULTAR' | 'AUTORIZAR' | 'DESACTIVAR' | 'ACTIVAR' | 'CAMBIAR_ROL' | 'CAMBIAR_PASSWORD' | 'SOLICITAR_RECUPERACION' | 'RESTABLECER_PASSWORD' | 'VALIDAR_CODIGO' | 'SELECCIONAR';
  modulo: string;
  entidad?: string | null;
  registroId?: string | number | null;
  descripcion: string;
}

export async function registrarAuditoria(params: RegistrarAuditoriaParams): Promise<void> {
  if (!params.usuarioId && !params.usuarioNombre) {
    return;
  }
  try {
    await query(
      `INSERT INTO auditorias (usuario_id, usuario_nombre, accion, modulo, entidad, registro_id, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        params.usuarioId ?? null,
        params.usuarioNombre ?? null,
        params.accion,
        params.modulo,
        params.entidad ?? null,
        params.registroId != null ? String(params.registroId) : null,
        params.descripcion,
      ]
    );
  } catch (error) {
    console.error('[auditoria] No se pudo registrar la auditoría:', error);
  }
}