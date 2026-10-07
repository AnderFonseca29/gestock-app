import { z } from 'zod';

const emailField = z
  .string({ required_error: 'El correo electrónico es obligatorio.' })
  .email('Ingresa un correo electrónico válido.')
  .max(200, 'El correo no puede superar los 200 caracteres.')
  .transform((v) => v.toLowerCase().trim());

const telefonoField = z
  .string({ required_error: 'El teléfono es obligatorio.' })
  .trim()
  .min(7, 'Ingresa un número de teléfono válido.')
  .max(20, 'El teléfono no puede superar los 20 caracteres.')
  .regex(/^[0-9+()\- ]+$/, 'Ingresa un número de teléfono válido.');

const passwordField = z
  .string({ required_error: 'La contraseña es obligatoria.' })
  .min(8, 'La contraseña debe tener al menos 8 caracteres.')
  .max(72, 'La contraseña no puede superar los 72 caracteres.')
  .regex(/[A-Z]/, 'La contraseña debe incluir al menos una letra mayúscula.')
  .regex(/[0-9]/, 'La contraseña debe incluir al menos un número.')
  .regex(/[^A-Za-z0-9]/, 'La contraseña debe incluir al menos un carácter especial.');

const nombreField = z.string({ required_error: 'El nombre es obligatorio.' }).trim().min(2, 'El nombre debe tener al menos 2 caracteres.').max(150);
const apellidoField = z.string({ required_error: 'El apellido es obligatorio.' }).trim().min(2, 'El apellido debe tener al menos 2 caracteres.').max(150);

export const idParamSchema = z.object({
  id: z.coerce.number({ message: 'El identificador debe ser un número.' }).int().positive(),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'El correo electrónico es obligatorio.' }).email('Ingresa un correo válido.'),
  password: z.string({ required_error: 'La contraseña es obligatoria.' }).min(1, 'La contraseña es obligatoria.'),
});

export const crearUsuarioSchema = z.object({
  nombre: nombreField,
  apellido: apellidoField,
  email: emailField,
  telefono: telefonoField.nullable().optional(),
  password: passwordField,
  rolId: z.number({ required_error: 'El rol es obligatorio.' }).int().positive(),
  empresaId: z.number().int().positive().nullable().optional(),
  estado: z.enum(['Activo', 'Inactivo']).default('Activo'),
});

export const actualizarUsuarioSchema = z.object({
  nombre: nombreField.optional(),
  apellido: apellidoField.optional(),
  email: emailField.optional(),
  telefono: telefonoField.nullable().optional(),
  rolId: z.number().int().positive().optional(),
  empresaId: z.number().int().positive().nullable().optional(),
  estado: z.enum(['Activo', 'Inactivo']).optional(),
  password: passwordField.optional(),
}).refine((data) => Object.keys(data).length > 0, { message: 'No se enviaron campos para actualizar.' });

export const cambiarEstadoUsuarioSchema = z.object({
  estado: z.enum(['Activo', 'Inactivo'], { required_error: 'El estado es obligatorio.' }),
});

export const cambiarRolUsuarioSchema = z.object({
  rolId: z.number().int().positive({ message: 'El rol es obligatorio.' }),
});

export const cambiarPasswordUsuarioSchema = z
  .object({
    nuevaPassword: passwordField,
    confirmarPassword: z.string({ required_error: 'Confirma la nueva contraseña.' }).min(1, 'Confirma la nueva contraseña.'),
  })
  .refine((data) => data.nuevaPassword === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmarPassword'],
  });

export const crearRolSchema = z.object({
  nombre: z.string({ required_error: 'El nombre del rol es obligatorio.' }).trim().min(3, 'El nombre del rol debe tener al menos 3 caracteres.').max(80),
  descripcion: z.string().trim().max(255).optional(),
  permisoIds: z.array(z.number().int().positive()).default([]),
});

export const actualizarRolSchema = z.object({
  nombre: z.string().trim().min(3).max(80).optional(),
  descripcion: z.string().trim().max(255).nullable().optional(),
});

export const cambiarEstadoRolSchema = z.object({
  estado: z.enum(['Activo', 'Inactivo'], { required_error: 'El estado es obligatorio.' }),
});

export const asignarPermisosSchema = z.object({
  permisoIds: z.array(z.number().int().positive(), { required_error: 'La lista de permisos es obligatoria.' }),
});

export const crearEmpresaSchema = z.object({
  nombre: z.string({ required_error: 'El nombre de la empresa es obligatorio.' }).trim().min(2).max(200),
  nit: z.string({ required_error: 'El NIT es obligatorio.' }).trim().min(3).max(50),
  correo: emailField,
  telefono: z.string().trim().max(30).nullable().optional(),
  direccion: z.string().trim().max(255).nullable().optional(),
  moneda: z.string().trim().max(50).optional(),
  formatoFecha: z.string().trim().max(20).optional(),
  adminEmail: emailField,
  adminPassword: passwordField,
  adminNombre: z.string().trim().min(2).max(150).optional(),
  adminApellido: z.string().trim().min(2).max(150).optional(),
});

export const actualizarEmpresaSchema = z.object({
  nombre: z.string().trim().min(2).max(200).optional(),
  nit: z.string().trim().min(3).max(50).optional(),
  correo: emailField.optional(),
  telefono: z.string().trim().max(30).nullable().optional(),
  direccion: z.string().trim().max(255).nullable().optional(),
  moneda: z.string().trim().max(50).optional(),
  formatoFecha: z.string().trim().max(20).optional(),
  estado: z.enum(['Activa', 'Inactiva']).optional(),
});

export const seleccionarEmpresaSchema = z.object({
  empresaId: z.number({ required_error: 'Debes indicar la empresa.' }).int().positive(),
  email: emailField,
  password: z.string({ required_error: 'La contraseña es obligatoria.' }).min(1, 'La contraseña es obligatoria.'),
});

export const crearCategoriaSchema = z.object({
  nombre: z.string({ required_error: 'El nombre de la categoría es obligatorio.' }).trim().min(2).max(120),
  descripcion: z.string().trim().max(255).optional(),
});

export const actualizarCategoriaSchema = z.object({
  nombre: z.string().trim().min(2).max(120).optional(),
  descripcion: z.string().trim().max(255).nullable().optional(),
  estado: z.enum(['Activo', 'Inactivo']).optional(),
});

export const crearBodegaSchema = z.object({
  nombre: z.string({ required_error: 'El nombre de la bodega es obligatorio.' }).trim().min(2).max(150),
  codigo: z.string({ required_error: 'El código es obligatorio.' }).trim().min(2).max(20),
  ciudad: z.string().trim().max(100).nullable().optional(),
  direccion: z.string().trim().max(255).nullable().optional(),
  responsable: z.string().trim().max(150).nullable().optional(),
  telefono: z.string().trim().max(30).nullable().optional(),
  capacidad: z.number().int().nonnegative().optional(),
});

export const actualizarBodegaSchema = z.object({
  nombre: z.string().trim().min(2).max(150).optional(),
  codigo: z.string().trim().min(2).max(20).optional(),
  ciudad: z.string().trim().max(100).nullable().optional(),
  direccion: z.string().trim().max(255).nullable().optional(),
  responsable: z.string().trim().max(150).nullable().optional(),
  telefono: z.string().trim().max(30).nullable().optional(),
  capacidad: z.number().int().nonnegative().optional(),
  estado: z.enum(['Activa', 'Inactiva']).optional(),
  activa: z.boolean().optional(),
  ocupado: z.number().int().nonnegative().optional(),
});

export const crearProductoSchema = z.object({
  codigo: z.string({ required_error: 'El código es obligatorio.' }).trim().min(2).max(50),
  nombre: z.string({ required_error: 'El nombre es obligatorio.' }).trim().min(2).max(200),
  descripcion: z.string().trim().max(500).nullable().optional(),
  categoriaId: z.number().int().positive().nullable().optional(),
  bodegaId: z.number().int().positive().nullable().optional(),
  precio: z.number({ required_error: 'El precio es obligatorio.' }).nonnegative(),
  costo: z.number().nonnegative().optional(),
  stock: z.number({ required_error: 'El stock inicial es obligatorio.' }).int().nonnegative(),
  stockMin: z.number().int().nonnegative().optional(),
});

export const actualizarProductoSchema = z.object({
  codigo: z.string().trim().min(2).max(50).optional(),
  nombre: z.string().trim().min(2).max(200).optional(),
  descripcion: z.string().trim().max(500).nullable().optional(),
  categoriaId: z.number().int().positive().nullable().optional(),
  bodegaId: z.number().int().positive().nullable().optional(),
  precio: z.number().nonnegative().optional(),
  costo: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  stockMin: z.number().int().nonnegative().optional(),
  estado: z.enum(['Activo', 'Inactivo']).optional(),
});

export const cambiarEstadoProductoSchema = z.object({
  estado: z.enum(['Activo', 'Inactivo'], { required_error: 'El estado es obligatorio.' }),
});

export const crearMovimientoSchema = z.object({
  productoId: z.number().int().positive().nullable().optional(),
  bodegaId: z.number().int().positive().nullable().optional(),
  tipo: z.enum(['ENTRADA', 'SALIDA', 'TRANSFERENCIA'], { required_error: 'El tipo de movimiento es obligatorio.' }),
  cantidad: z.number({ required_error: 'La cantidad es obligatoria.' }).int().positive(),
  motivo: z.string({ required_error: 'El motivo es obligatorio.' }).trim().max(100),
  responsable: z.string({ required_error: 'El responsable es obligatorio.' }).trim().max(150),
  observaciones: z.string().trim().max(255).nullable().optional(),
  estado: z.enum(['Validado', 'Discrepancia']).default('Validado'),
});

export const listarMovimientosSchema = z.object({
  busqueda: z.string().optional(),
  tipo: z.string().optional(),
  estado: z.string().optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
});

export const crearRecepcionSchema = z.object({
  numero_documento: z.string({ required_error: 'El número de documento es obligatorio.' }).trim().min(2).max(50),
  proveedor: z.string({ required_error: 'El proveedor es obligatorio.' }).trim().min(2).max(200),
  bodega_id: z.number().int().positive().nullable().optional(),
  estado: z.enum(['En Proceso', 'Validado', 'Discrepancia']).default('En Proceso'),
  observaciones: z.string().trim().max(255).nullable().optional(),
});

export const crearIncidenciaSchema = z.object({
  titulo: z.string({ required_error: 'El título es obligatorio.' }).trim().min(2).max(150),
  descripcion: z.string({ required_error: 'La descripción es obligatoria.' }).trim().min(2).max(1000),
  prioridad: z.enum(['Baja', 'Media', 'Alta', 'Crítica'], { required_error: 'La prioridad es obligatoria.' }),
});

export const actualizarIncidenciaSchema = z.object({
  titulo: z.string().trim().min(2).max(150).optional(),
  descripcion: z.string().trim().min(2).max(1000).optional(),
  prioridad: z.enum(['Baja', 'Media', 'Alta', 'Crítica']).optional(),
  estado: z.enum(['Pendiente', 'En Revisión', 'Resuelto']).optional(),
});

export const crearMantenimientoSchema = z.object({
  equipo: z.string({ required_error: 'El equipo es obligatorio.' }).trim().min(2).max(150),
  tipo: z.enum(['Preventivo', 'Correctivo', 'Predictivo'], { required_error: 'El tipo es obligatorio.' }),
  fecha_programada: z.string({ required_error: 'La fecha programada es obligatoria.' }).refine((f) => !isNaN(Date.parse(f)), 'La fecha no es válida.'),
  descripcion: z.string().trim().max(500).nullable().optional(),
});

export const actualizarMantenimientoSchema = z.object({
  equipo: z.string().trim().min(2).max(150).optional(),
  tipo: z.enum(['Preventivo', 'Correctivo', 'Predictivo']).optional(),
  fecha_programada: z.string().refine((f) => !isNaN(Date.parse(f)), 'La fecha no es válida.').optional(),
  descripcion: z.string().trim().max(500).nullable().optional(),
  estado: z.enum(['Pendiente', 'En Proceso', 'Completado', 'Cancelado']).optional(),
});

export const configuracionSchema = z.object({
  notificacionesEmail: z.boolean().optional(),
  resumenSemanal: z.boolean().optional(),
  seguridadActiva: z.boolean().optional(),
  dosFactores: z.boolean().optional(),
  tiempoSesion: z.number().int().positive().optional(),
  expiracionPassword: z.number().int().positive().optional(),
  copiasSeguridad: z.boolean().optional(),
  backupAutomatico: z.boolean().optional(),
  frecuenciaBackup: z.enum(['diario', 'semanal', 'mensual', 'anual']).optional(),
});

export const cambiarContrasenaSchema = z.object({
  passwordActual: z.string({ required_error: 'La contraseña actual es obligatoria.' }).min(1),
  nuevaPassword: passwordField,
});

export const solicitarRecuperacionSchema = z.object({
  telefono: telefonoField,
});

export const validarCodigoRecuperacionSchema = z.object({
  telefono: telefonoField,
  codigo: z
    .string({ required_error: 'El código es obligatorio.' })
    .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos.'),
});

export const restablecerPasswordSchema = z.object({
  telefono: telefonoField,
  codigo: z
    .string({ required_error: 'El código es obligatorio.' })
    .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos.'),
  nuevaPassword: passwordField,
});