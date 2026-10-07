import { describe, it, expect } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import { rateLimit } from 'express-rate-limit';
import { keyGeneratorPorCampo } from '../../src/middleware/rateLimit';

const WINDOW_MS = 60 * 1000;

function crearAppLimitePorCampo(campo: string, prefijo: string, max: number) {
  const app = express();
  app.use(express.json());
  app.use(
    rateLimit({
      windowMs: WINDOW_MS,
      max,
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: true,
      keyGenerator: keyGeneratorPorCampo(campo, prefijo),
      handler: (_req: any, res: any) => {
        res.status(429).json({ success: false, message: 'bloqueado', code: 'RATE_LIMITED' });
      },
    })
  );
  app.post('/login', (_req: any, res: any) => {
    const { password } = _req.body;
    if (password === 'correcta') {
      res.status(200).json({ success: true, data: { token: 't' } });
    } else {
      res.status(401).json({ success: false, message: 'credenciales invalidas' });
    }
  });
  return supertest(app);
}

function login(app: ReturnType<typeof supertest>, email: string, password: string) {
  return app.post('/login').send({ email, password });
}

function recuperar(app: ReturnType<typeof supertest>, telefono: string) {
  return app.post('/login').send({ telefono });
}

describe('Login limitado por cuenta (email)', () => {
  const app = crearAppLimitePorCampo('email', 'login', 5);

  it('bloquea solo el email que falla 5 veces; otros no se ven afectados', async () => {
    for (let i = 0; i < 5; i++) {
      const r = await login(app, 'victima@gestock.com', 'mala' + i);
      expect(r.status).toBe(401);
    }
    expect((await login(app, 'victima@gestock.com', 'mala5')).status).toBe(429);
    expect((await login(app, 'victima@gestock.com', 'correcta')).status).toBe(429);

    const otro = await login(app, 'otro@gestock.com', 'mala');
    expect(otro.status).toBe(401);

    const otroOk = await login(app, 'otro@gestock.com', 'correcta');
    expect(otroOk.status).toBe(200);
  });

  it('los intentos exitosos no cuentan para el bloqueo', async () => {
    for (let i = 0; i < 8; i++) {
      const r = await login(app, 'bueno@gestock.com', 'correcta');
      expect(r.status).toBe(200);
    }
  });
});

describe('Recuperacion limitada por cuenta (telefono)', () => {
  const app = crearAppLimitePorCampo('telefono', 'recuperar', 5);

  it('bloquea solo el telefono que insiste; otro telefono sigue operativo', async () => {
    for (let i = 0; i < 5; i++) {
      const r = await recuperar(app, '3001112222');
      expect(r.status).toBe(401);
    }
    expect((await recuperar(app, '3001112222')).status).toBe(429);
    expect((await recuperar(app, '3003334444')).status).not.toBe(429);
  });
});