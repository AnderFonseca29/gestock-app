/**
 * Seed de Prisma (documentación/alternativa).
 *
 * El backend oficial usa SQL parametrizado (migraciones en backend/sql).
 * Este archivo es equivalente al 05_seed_data.sql y solo se ejecuta si se
 * decide migrar el backend a Prisma.
 *
 * Uso (opcional):
 *   npm i -D prisma @prisma/client
 *   npx prisma generate
 *   npx prisma db push
 *   npx tsx prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USUARIOS_SEED = [
  {
    email: 'admin@gestock.com',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    rol: 'Administrador',
    hash: '$2b$10$hdR9lkvMKZMBhK/s7hvuf.bGsurFYelR9Kt9fP8Sou0cLhiQ3CeSq',
  },
  {
    email: 'supervisor@gestock.com',
    nombre: 'María',
    apellido: 'Fernández',
    rol: 'Supervisor',
    hash: '$2b$10$aG9DnFwoT.0/HkN0/Y63R.ThnyszoPRkW/IP39hvrmt73ErHFFZKy',
  },
  {
    email: 'operario@gestock.com',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'Operario',
    hash: '$2b$10$lY2sWSzpCS4fhsr9OLAazOBYGfKiiE9KNE7PRhJA3ZW.gnhTe2G/e',
  },
  {
    email: 'tecnico@gestock.com',
    nombre: 'Andrés',
    apellido: 'Gómez',
    rol: 'Técnico de Mantenimiento',
    hash: '$2b$10$jQdVNWobYkT0GJGT45iXWuo6JBv4LJF0frk3CPWEK7814I0AggvV2',
  },
  {
    email: 'auditor@gestock.com',
    nombre: 'Laura',
    apellido: 'Martínez',
    rol: 'Auditor',
    hash: '$2b$10$te.aYBmfzv/5uLUz3m6PROERjSWYTeHs1n0QkAfqaSc8VObvS800a',
  },
];

const PERMISOS_POR_ROL: Record<string, string[]> = {
  Administrador: [],
  Supervisor: [
    'dashboard.view', 'productos.view', 'productos.create', 'productos.edit', 'productos.delete',
    'categorias.view', 'categorias.create', 'categorias.edit', 'bodegas.view', 'bodegas.create', 'bodegas.edit',
    'inventario.view', 'inventario.registrar', 'movimientos.view', 'recepcion.view', 'recepcion.create', 'recepcion.edit',
    'historial.view', 'reportes.view', 'reportes.exportar', 'mantenimiento.view', 'mantenimiento.create', 'mantenimiento.edit',
    'incidencias.view', 'incidencias.create', 'incidencias.edit', 'incidencias.resolver', 'notificaciones.view',
  ],
  Operario: [
    'inventario.view', 'productos.view', 'bodegas.view', 'movimientos.view',
    'recepcion.view', 'recepcion.create', 'incidencias.view', 'incidencias.create', 'notificaciones.view',
  ],
  'Técnico de Mantenimiento': [
    'dashboard.view', 'productos.view', 'bodegas.view', 'movimientos.view', 'historial.view',
    'mantenimiento.view', 'mantenimiento.create', 'mantenimiento.edit',
    'incidencias.view', 'incidencias.create', 'incidencias.edit', 'incidencias.resolver', 'notificaciones.view',
  ],
  Auditor: [
    'dashboard.view', 'empresas.view', 'usuarios.view', 'roles.view', 'permisos.view',
    'productos.view', 'categorias.view', 'bodegas.view', 'inventario.view', 'movimientos.view',
    'recepcion.view', 'historial.view', 'auditoria.view', 'reportes.view', 'reportes.exportar',
    'sesiones.view', 'notificaciones.view',
  ],
};

async function main() {
  const empresa = await prisma.empresa.upsert({
    where: { nit: '900123456-7' },
    update: {},
    create: {
      nombre: 'GESTOCK S.A.S.',
      nit: '900123456-7',
      correo: 'contacto@gestock.com',
      telefono: '+57 601 123 4567',
      direccion: 'Av. El Dorado # 68-90, Bogotá',
    },
  });

  for (const permiso of await prisma.permiso.findMany()) {
    if (permiso.codigo) void permiso;
  }

  const roles = await prisma.rol.findMany();
  const permisos = await prisma.permiso.findMany();

  for (const [rolNombre, codigos] of Object.entries(PERMISOS_POR_ROL)) {
    const rol = roles.find((r) => r.nombre === rolNombre);
    if (!rol) continue;
    const permisosDeRol = codigos.length
      ? permisos.filter((p) => codigos.includes(p.codigo))
      : permisos;
    await prisma.$transaction(
      permisosDeRol.map((p) =>
        prisma.rol.update({
          where: { id: rol.id },
          data: { permisos: { connect: { id: p.id } } },
        })
      )
    );
  }

  for (const u of USUARIOS_SEED) {
    const rol = roles.find((r) => r.nombre === u.rol);
    if (!rol) continue;
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nombre: u.nombre,
        apellido: u.apellido,
        email: u.email,
        passwordHash: u.hash,
        rolId: rol.id,
        empresaId: empresa.id,
        estado: 'Activo',
      },
    });
  }

  console.log('Seed de Prisma ejecutado correctamente.');
  console.log('admin@gestock.com / Admin2026!');
}

main()
  .catch((e) => {
    console.error('Error en el seed de Prisma:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());