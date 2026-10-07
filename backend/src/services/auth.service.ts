import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHash } from 'node:crypto';
import { query } from '../config/db';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { AuthRequestUser, JwtPayload, UsuarioRow } from '../models/types';
import { usuarioRepo } from '../repositories/usuario.repo';
import { sesionRepo, CrearSesionData } from '../repositories/sesion.repo';
import { registrarAuditoria } from './auditoria.service';
import { enviarCodigoSms, revelarCodigoEnDesarrollo } from './mailer.service';

const CODIGO_EXPIRA_MINUTOS = 15;

export interface LoginResultado {
  token: string;
  sesionId: number;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rolId: number;
    rol: string;
    empresaId: number | null;
    permisos: string[];
  };
}

export async function login(
  email: string,
  password: string,
  sesionInfo: Omit<CrearSesionData, 'usuarioId'>
): Promise<LoginResultado> {
  return autenticarEnEmpresa(email, password, sesionInfo);
}

export async function loginEnEmpresa(
  email: string,
  password: string,
  empresaId: number,
  sesionInfo: Omit<CrearSesionData, 'usuarioId'>
): Promise<LoginResultado> {
  return autenticarEnEmpresa(email, password, sesionInfo, empresaId);
}

async function autenticarEnEmpresa(
  email: string,
  password: string,
  sesionInfo: Omit<CrearSesionData, 'usuarioId'>,
  empresaId?: number
): Promise<LoginResultado> {
  const usuario = await usuarioRepo.buscarPorEmail(email.toLowerCase().trim());
  if (!usuario) {
    throw ApiError.unauthorized('Las credenciales ingresadas no son válidas.');
  }
  if (empresaId != null && usuario.empresa_id !== empresaId) {
    throw ApiError.unauthorized('El usuario no pertenece a esa empresa.');
  }
  if (usuario.estado !== 'Activo') {
    throw ApiError.forbidden('Tu cuenta está inactiva. Contacta al administrador.');
  }

  const existeRol = await query<{ estado: string }>(`SELECT estado FROM roles WHERE id = $1`, [usuario.rol_id]);
  if (!existeRol.length || existeRol[0].estado !== 'Activo') {
    throw ApiError.forbidden('El rol asignado a tu cuenta está inactivo. Contacta al administrador.');
  }

  const esValida = await bcrypt.compare(password, usuario.password_hash);
  if (!esValida) {
    throw ApiError.unauthorized('Las credenciales ingresadas no son válidas.');
  }

  const sesionEmpresaId = empresaId ?? usuario.empresa_id ?? null;
  const sesion = await sesionRepo.crear({ usuarioId: usuario.id, empresaId: sesionEmpresaId, ...sesionInfo });
  await usuarioRepo.registrarUltimoAcceso(usuario.id);

  const usuarioCompleto = await getUsuarioConPermisosPorId(usuario.id);
  if (!usuarioCompleto) {
    throw ApiError.internal('No se pudieron cargar los permisos del usuario.');
  }

  const payload: JwtPayload = {
    userId: usuario.id,
    roleId: usuario.rol_id,
    role: usuarioCompleto.rol,
    email: usuario.email,
    sesionId: sesion.id,
  };

  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);

  await registrarAuditoria({
    usuarioId: usuario.id,
    accion: 'LOGIN',
    modulo: 'AUTENTICACIÓN',
    entidad: 'usuarios',
    registroId: usuario.id,
    descripcion: empresaId != null
      ? `El usuario ${usuario.email} ingresó a la empresa id ${empresaId}.`
      : `El usuario ${usuario.email} inició sesión.`,
  });

  return {
    token,
    sesionId: sesion.id,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rolId: usuario.rol_id,
      rol: usuarioCompleto.rol,
      empresaId: usuario.empresa_id,
      permisos: usuarioCompleto.permisos,
    },
  };
}

export async function cambiarContrasena(
  userId: number,
  passwordActual: string,
  nuevaPassword: string
): Promise<void> {
  const usuario: UsuarioRow | null = await usuarioRepo.buscarPorId(userId);
  if (!usuario) {
    throw ApiError.notFound('El usuario no existe.');
  }

  const esValida = await bcrypt.compare(passwordActual, usuario.password_hash);
  if (!esValida) {
    throw ApiError.unauthorized('La contraseña actual no es correcta.');
  }

  const hash = await bcrypt.hash(nuevaPassword, 10);
  await usuarioRepo.actualizarContrasena(userId, hash);
  await registrarAuditoria({
    usuarioId: userId,
    accion: 'ACTUALIZAR',
    modulo: 'SEGURIDAD',
    entidad: 'usuarios',
    registroId: userId,
    descripcion: 'El usuario cambió su contraseña.',
  });
}

export async function getUsuarioConPermisosPorId(id: number): Promise<AuthRequestUser | null> {
  const rows = await query(
    `SELECT
       u.id,
       u.nombre,
       u.apellido,
       u.email,
       u.estado,
       u.rol_id AS "rolId",
       u.empresa_id AS "empresaId",
       r.nombre AS "rol"
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE u.id = $1 AND r.estado = 'Activo'`,
    [id]
  );
  if (!rows.length) return null;

  const usuario = rows[0] as AuthRequestUser;

  const permisoRows = await query(
    `SELECT DISTINCT p.codigo
     FROM rol_permiso rp
     JOIN permisos p ON p.id = rp.permiso_id
     WHERE rp.rol_id = $1`,
    [usuario.rolId]
  );

  usuario.permisos = permisoRows.map((p: any) => p.codigo);
  return usuario;
}

export async function obtenerPermisosPorRol(rolId: number): Promise<string[]> {
  const rows = await query(
    `SELECT p.codigo
     FROM rol_permiso rp
     JOIN permisos p ON p.id = rp.permiso_id
     WHERE rp.rol_id = $1`,
    [rolId]
  );
  return rows.map((r: any) => r.codigo);
}

function generarCodigoRecuperacion(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashCodigoRecuperacion(codigo: string): string {
  return createHash('sha256').update(codigo).digest('hex');
}

export function normalizarTelefono(input: string): string {
  const digitos = input.replace(/\D/g, '');
  if (digitos.length === 12 && digitos.startsWith('57')) return digitos.slice(2);
  if (digitos.length === 11 && digitos.startsWith('0')) return digitos.slice(1);
  return digitos;
}

export function enmascararTelefono(input: string): string {
  const digitos = input.replace(/\D/g, '');
  if (digitos.length < 7) return input;
  return `${digitos.slice(0, 3)} *** ** ${digitos.slice(-2)}`;
}

async function buscarCodigoRecuperacionValido(
  usuarioId: number,
  codigo: string
): Promise<{ id: number; expira_en: Date } | null> {
  const hash = hashCodigoRecuperacion(codigo.trim());
  const filas = await query(
    `SELECT id, expira_en
     FROM restablecimientos_contrasena
     WHERE usuario_id = $1 AND codigo = $2 AND usado = FALSE
     ORDER BY id DESC
     LIMIT 1`,
    [usuarioId, hash]
  );
  if (!filas.length) return null;
  const fila = filas[0] as { id: number; expira_en: Date };
  if (new Date(fila.expira_en) < new Date()) return null;
  return fila;
}

export async function solicitarRecuperacion(
  telefono: string
): Promise<{ enmascarado: string; codigoDemo?: string; enviado: boolean }> {
  const normalizado = normalizarTelefono(telefono);
  const enmascarado = enmascararTelefono(telefono);
  const usuario = await usuarioRepo.buscarPorTelefono(normalizado);

  if (!usuario || usuario.estado !== 'Activo') {
    return { enmascarado, enviado: false };
  }

  const codigo = generarCodigoRecuperacion();
  await query(`DELETE FROM restablecimientos_contrasena WHERE usuario_id = $1`, [usuario.id]);
  await query(
    `INSERT INTO restablecimientos_contrasena (usuario_id, codigo, expira_en)
     VALUES ($1, $2, NOW() + INTERVAL '${CODIGO_EXPIRA_MINUTOS} minutes')`,
    [usuario.id, hashCodigoRecuperacion(codigo)]
  );

  const enviado = await enviarCodigoSms(telefono, codigo, usuario.nombre);

  await registrarAuditoria({
    usuarioId: usuario.id,
    accion: 'SOLICITAR_RECUPERACION',
    modulo: 'AUTENTICACIÓN',
    entidad: 'usuarios',
    registroId: usuario.id,
    descripcion: `Se solicitó la recuperación de contraseña para el número ${enmascarado}.`,
  });

  return {
    enmascarado,
    enviado,
    codigoDemo: revelarCodigoEnDesarrollo() ? codigo : undefined,
  };
}

export async function validarCodigoRecuperacion(telefono: string, codigo: string): Promise<void> {
  const usuario = await usuarioRepo.buscarPorTelefono(normalizarTelefono(telefono));
  if (!usuario) {
    throw ApiError.badRequest('El código ingresado no es válido o ha expirado.');
  }
  const valido = await buscarCodigoRecuperacionValido(usuario.id, codigo);
  if (!valido) {
    throw ApiError.badRequest('El código ingresado no es válido o ha expirado.');
  }
}

export async function restablecerPassword(
  telefono: string,
  codigo: string,
  nuevaPassword: string
): Promise<void> {
  const usuario = await usuarioRepo.buscarPorTelefono(normalizarTelefono(telefono));
  if (!usuario) {
    throw ApiError.badRequest('El código ingresado no es válido o ha expirado.');
  }
  const valido = await buscarCodigoRecuperacionValido(usuario.id, codigo);
  if (!valido) {
    throw ApiError.badRequest('El código ingresado no es válido o ha expirado.');
  }

  const hash = await bcrypt.hash(nuevaPassword, 10);
  await usuarioRepo.actualizarContrasena(usuario.id, hash);
  await query(`UPDATE restablecimientos_contrasena SET usado = TRUE WHERE id = $1`, [valido.id]);
  await query(`DELETE FROM sesiones WHERE usuario_id = $1 AND estado = 'Activa'`, [usuario.id]);

  await registrarAuditoria({
    usuarioId: usuario.id,
    accion: 'RESTABLECER_PASSWORD',
    modulo: 'AUTENTICACIÓN',
    entidad: 'usuarios',
    registroId: usuario.id,
    descripcion: `El usuario ${enmascararTelefono(telefono)} restableció su contraseña mediante código.`,
  });
}