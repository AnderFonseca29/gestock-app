import { describe, it, expect, test, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { testConnection, query } from '../../src/config/db';

/**
 * Pruebas de integración que requieren PostgreSQL con el seed aplicado.
 * Si la base de datos no está disponible, estos tests se omiten.
 * POSTGRESQL/psql NO ESTÁ INSTALADO EN EL EQUIPO DE DESARROLLO:
 * estas pruebas deben ejecutarse en un entorno con la BD levantada:
 *    npm run db:setup && npm test
 */

let app: ReturnType<typeof createApp>;
let server: any;

async function login(email: string, password: string) {
  return request(app).post('/api/auth/login').send({ email, password });
}

describe('Backend con base de datos', () => {
  test.beforeAll(async ({ task }) => {
    try {
      await testConnection();
    } catch {
      task.skip();
      return;
    }
    app = createApp();
    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  describe('Autenticación', () => {
    it('login con credenciales correctas devuelve 200, token y permisos', async () => {
      const res = await login('admin@gestock.com', 'Admin2026!');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeTruthy();
      expect(res.body.data.usuario.email).toBe('admin@gestock.com');
      expect(Array.isArray(res.body.data.usuario.permisos)).toBe(true);
      expect(res.body.data.usuario.permisos).toContain('dashboard.view');
    });

    it('login con contraseña incorrecta responde 401', async () => {
      const res = await login('admin@gestock.com', 'ContraseñaIncorrecta2026!');
      expect(res.status).toBe(401);
    });

    it('login con correo inexistente responde 401', async () => {
      const res = await login('no-existe@gestock.com', 'Admin2026!');
      expect(res.status).toBe(401);
    });

    it('login de un usuario inactivo responde 403', async () => {
      const reg = await login('admin@gestock.com', 'Admin2026!');
      const token = reg.body.data.token;

      const crear = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Inactivo', apellido: 'Prueba', email: 'inactivo.test@gestock.com', password: 'Prueba2026!', rolId: 3 });
      expect(crear.status).toBe(201);
      const nuevoId = crear.body.data.id;

      await request(app)
        .patch(`/api/usuarios/${nuevoId}/estado`)
        .set('Authorization', `Bearer ${token}`)
        .send({ estado: 'Inactivo' });

      const res = await login('inactivo.test@gestock.com', 'Prueba2026!');
      expect(res.status).toBe(403);

      await request(app).delete(`/api/usuarios/${nuevoId}`).set('Authorization', `Bearer ${token}`);
    });
  });

  describe('Permisos (RBAC)', () => {
    it('operario sí puede crear productos (201)', async () => {
      const res = await login('operario@gestock.com', 'Operario2026!');
      expect(res.status).toBe(200);
      const token = res.body.data.token;

      const codigo = `PRB-OP-${Date.now()}`;
      const crear = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send({ codigo, nombre: 'Prueba Operario', precio: 1000, stock: 1, categoriaId: 1, bodegaId: 1 });
      expect(crear.status).toBe(201);
      const nuevoId = crear.body.data.id;

      const admin = await login('admin@gestock.com', 'Admin2026!');
      await request(app).delete(`/api/productos/${nuevoId}`).set('Authorization', `Bearer ${admin.body.data.token}`);
    });

    it('tecnico de mantenimiento NO puede crear productos (403)', async () => {
      const res = await login('tecnico@gestock.com', 'Tecnico2026!');
      expect(res.status).toBe(200);
      const token = res.body.data.token;

      const crear = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send({ codigo: `PRB-TE-${Date.now()}`, nombre: 'Prueba', precio: 1000, stock: 1 });
      expect(crear.status).toBe(403);
    });

    it('operario sí puede listar productos (200)', async () => {
      const res = await login('operario@gestock.com', 'Operario2026!');
      const token = res.body.data.token;

      const listar = await request(app).get('/api/productos').set('Authorization', `Bearer ${token}`);
      expect(listar.status).toBe(200);
    });

    it('auditor no puede modificar configuraciones (403)', async () => {
      const res = await login('auditor@gestock.com', 'Auditor2026!');
      const token = res.body.data.token;

      const update = await request(app)
        .put('/api/configuracion')
        .set('Authorization', `Bearer ${token}`)
        .send({ seguridadActiva: false });
      expect(update.status).toBe(403);
    });

    it('auditor puede consultar auditorías (200)', async () => {
      const res = await login('auditor@gestock.com', 'Auditor2026!');
      const token = res.body.data.token;

      const listar = await request(app).get('/api/auditorias').set('Authorization', `Bearer ${token}`);
      expect(listar.status).toBe(200);
    });
  });

  describe('CRUD de usuarios', () => {
    it('evita crear un usuario con email duplicado (409)', async () => {
      const res = await login('admin@gestock.com', 'Admin2026!');
      const token = res.body.data.token;

      const crear = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Dup', apellido: 'Test', email: 'admin@gestock.com', password: 'Dup2026!', rolId: 3 });
      expect(crear.status).toBe(409);
      expect(crear.body.code).toBe('CONFLICT');
    });

    it('crea, lista y elimina un usuario', async () => {
      const res = await login('admin@gestock.com', 'Admin2026!');
      const token = res.body.data.token;
      const email = `crear.test.${Date.now()}@gestock.com`;

      const crear = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Nuevo', apellido: 'Usuario', email, password: 'Nuevo2026!', rolId: 3 });
      expect(crear.status).toBe(201);

      const listar = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${token}`);
      expect(listar.status).toBe(200);
      expect(listar.body.data.some((u: any) => u.email === email)).toBe(true);

      await request(app)
        .delete(`/api/usuarios/${crear.body.data.id}`)
        .set('Authorization', `Bearer ${token}`);
    });
  });

  describe('CRUD de productos', () => {
    it('crea, actualiza y elimina un producto', async () => {
      const res = await login('admin@gestock.com', 'Admin2026!');
      const token = res.body.data.token;
      const codigo = `CRUD-${Date.now()}`;

      const crear = await request(app)
        .post('/api/productos')
        .set('Authorization', `Bearer ${token}`)
        .send({ codigo, nombre: 'Producto Prueba', precio: 15000, stock: 10 });
      expect(crear.status).toBe(201);
      const id = crear.body.data.id;

      const actualizar = await request(app)
        .put(`/api/productos/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ precio: 12000 });
      expect(actualizar.status).toBe(200);
      expect(Number(actualizar.body.data.precio)).toBe(12000);

      const detalle = await request(app).get(`/api/productos/${id}`).set('Authorization', `Bearer ${token}`);
      expect(detalle.status).toBe(200);
      expect(detalle.body.data.nombre).toBe('Producto Prueba');

      await request(app).delete(`/api/productos/${id}`).set('Authorization', `Bearer ${token}`);
    });
  });

  describe('Seguridad de contraseñas', () => {
    it('el listado y detalle de usuarios nunca exponen el hash de contraseña', async () => {
      const res = await login('admin@gestock.com', 'Admin2026!');
      const token = res.body.data.token;

      const listar = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${token}`);
      expect(listar.status).toBe(200);
      expect(Array.isArray(listar.body.data)).toBe(true);
      for (const usuario of listar.body.data) {
        expect(usuario.password_hash).toBeUndefined();
      }

      const detalle = await request(app).get('/api/usuarios/1').set('Authorization', `Bearer ${token}`);
      expect(detalle.status).toBe(200);
      expect(detalle.body.data.usuario.password_hash).toBeUndefined();
    });

    it('el admin puede cambiar la contraseña de otro usuario y se invalidan sus sesiones', async () => {
      const admin = await login('admin@gestock.com', 'Admin2026!');
      expect(admin.status).toBe(200);
      const token = admin.body.data.token;
      const email = `pass.reset.${Date.now()}@gestock.com`;

      const crear = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${token}`)
        .send({ nombre: 'Reset', apellido: 'Test', email, password: 'Original2026!', rolId: 3 });
      expect(crear.status).toBe(201);
      const id = crear.body.data.id;

      const sesionPrevia = await login(email, 'Original2026!');
      expect(sesionPrevia.status).toBe(200);
      const tokenViejo = sesionPrevia.body.data.token;

      const usoPrevio = await request(app).get('/api/productos').set('Authorization', `Bearer ${tokenViejo}`);
      expect(usoPrevio.status).toBe(200);

      const cambio = await request(app)
        .put(`/api/usuarios/${id}/password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nuevaPassword: 'Nueva2026!', confirmarPassword: 'Nueva2026!' });
      expect(cambio.status).toBe(200);

      expect((await login(email, 'Original2026!')).status).toBe(401);
      expect((await login(email, 'Nueva2026!')).status).toBe(200);

      const usoPosterior = await request(app).get('/api/productos').set('Authorization', `Bearer ${tokenViejo}`);
      expect(usoPosterior.status).toBe(401);

      await request(app).delete(`/api/usuarios/${id}`).set('Authorization', `Bearer ${token}`);
    });

    it('el supervisor puede cambiar contraseñas (permiso usuarios.password)', async () => {
      const admin = await login('admin@gestock.com', 'Admin2026!');
      const tokenAdmin = admin.body.data.token;
      const email = `pass.sup.${Date.now()}@gestock.com`;

      const crear = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ nombre: 'Sup', apellido: 'Test', email, password: 'Original2026!', rolId: 4 });
      expect(crear.status).toBe(201);
      const id = crear.body.data.id;

      const supervisor = await login('supervisor@gestock.com', 'Supervisor2026!');
      expect(supervisor.status).toBe(200);
      const tokenSup = supervisor.body.data.token;

      const cambio = await request(app)
        .put(`/api/usuarios/${id}/password`)
        .set('Authorization', `Bearer ${tokenSup}`)
        .send({ nuevaPassword: 'Nueva2026!', confirmarPassword: 'Nueva2026!' });
      expect(cambio.status).toBe(200);

      expect((await login(email, 'Nueva2026!')).status).toBe(200);

      await request(app).delete(`/api/usuarios/${id}`).set('Authorization', `Bearer ${tokenAdmin}`);
    });

    it('el auditor no puede cambiar contraseñas (403)', async () => {
      const auditor = await login('auditor@gestock.com', 'Auditor2026!');
      const token = auditor.body.data.token;

      const res = await request(app)
        .put('/api/usuarios/1/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ nuevaPassword: 'Nueva2026!', confirmarPassword: 'Nueva2026!' });
      expect(res.status).toBe(403);
    });

    it('impide cambiarse la propia contraseña por este endpoint (400)', async () => {
      const filas = await query<{ id: number }>(`SELECT id FROM usuarios WHERE email = 'admin@gestock.com'`);
      const adminId = filas[0].id;

      const admin = await login('admin@gestock.com', 'Admin2026!');
      const token = admin.body.data.token;

      const res = await request(app)
        .put(`/api/usuarios/${adminId}/password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ nuevaPassword: 'Nueva2026!', confirmarPassword: 'Nueva2026!' });
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('BAD_REQUEST');
    });

    it('rechaza contraseñas no coincidentes o débiles (400)', async () => {
      const admin = await login('admin@gestock.com', 'Admin2026!');
      const token = admin.body.data.token;

      const noCoincide = await request(app)
        .put('/api/usuarios/1/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ nuevaPassword: 'Nueva2026!', confirmarPassword: 'Otra2026!' });
      expect(noCoincide.status).toBe(400);

      const debil = await request(app)
        .put('/api/usuarios/1/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ nuevaPassword: 'abc', confirmarPassword: 'abc' });
      expect(debil.status).toBe(400);
    });
  });

  describe('Recuperación de contraseña con código hasheado', () => {
    test('los códigos se guardan con hash SHA-256 y el flujo completo funciona', async () => {
      const telefonos = await query<{ id: number; telefono: string }>(
        `SELECT id, telefono FROM usuarios WHERE email = 'supervisor@gestock.com'`
      );
      expect(telefonos.length).toBe(1);
      const telefono = telefonos[0].telefono;

      const solicitud = await request(app).post('/api/auth/recuperar').send({ telefono });
      expect(solicitud.status).toBe(200);
      const codigoDemo: string = solicitud.body.data.codigoDemo;
      expect(codigoDemo).toMatch(/^\d{6}$/);

      const filas = await query<{ codigo: string }>(
        `SELECT codigo FROM restablecimientos_contrasena WHERE usuario_id = $1 ORDER BY id DESC LIMIT 1`,
        [telefonos[0].id]
      );
      const almacenado = filas[0].codigo;
      expect(almacenado).toMatch(/^[a-f0-9]{64}$/);
      expect(almacenado).not.toBe(codigoDemo);

      const valido = await request(app)
        .post('/api/auth/recuperar/validar')
        .send({ telefono, codigo: codigoDemo });
      expect(valido.status).toBe(200);

      const restablecer = await request(app)
        .post('/api/auth/recuperar/restablecer')
        .send({ telefono, codigo: codigoDemo, nuevaPassword: 'NuevaSup2026!' });
      expect(restablecer.status).toBe(200);

      expect((await login('supervisor@gestock.com', 'NuevaSup2026!')).status).toBe(200);
      expect((await login('supervisor@gestock.com', 'Supervisor2026!')).status).toBe(401);

      const reuso = await request(app)
        .post('/api/auth/recuperar/validar')
        .send({ telefono, codigo: codigoDemo });
      expect(reuso.status).toBe(400);

      const admin = await login('admin@gestock.com', 'Admin2026!');
      const restaurado = await request(app)
        .put(`/api/usuarios/${telefonos[0].id}/password`)
        .set('Authorization', `Bearer ${admin.body.data.token}`)
        .send({ nuevaPassword: 'Supervisor2026!', confirmarPassword: 'Supervisor2026!' });
      expect(restaurado.status).toBe(200);
      expect((await login('supervisor@gestock.com', 'Supervisor2026!')).status).toBe(200);
    });
  });
});