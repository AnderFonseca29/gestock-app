import { describe, it, expect } from 'vitest';
import { validateBody } from '../../src/middleware/validate';
import { loginSchema, crearUsuarioSchema } from '../../src/models/schemas';
import { ApiError } from '../../src/utils/ApiError';

function correrMiddleware(mw: (req: any, res: any, next: any) => void, body: any) {
  const req = { body };
  let error: any;
  const next = (e: any) => {
    error = e;
  };
  mw(req, {}, next);
  return { req, error };
}

describe('validateBody con loginSchema', () => {
  it('acepta credenciales válidas', () => {
    const { req, error } = correrMiddleware(validateBody(loginSchema), {
      email: 'Admin@Gestock.com',
      password: 'Admin2026!',
    });
    expect(error).toBeUndefined();
    expect(req.body.email).toBe('Admin@Gestock.com');
    expect(req.body.password).toBe('Admin2026!');
  });

  it('rechaza un body sin contraseña', () => {
    const { error } = correrMiddleware(validateBody(loginSchema), { email: 'admin@gestock.com' });
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.details).toBeDefined();
  });

  it('rechaza un email inválido', () => {
    const { error } = correrMiddleware(validateBody(loginSchema), { email: 'no-es-correo', password: 'x' });
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
  });
});

describe('validateBody con crearUsuarioSchema', () => {
  it('rechaza contraseñas débiles', () => {
    const { error } = correrMiddleware(validateBody(crearUsuarioSchema), {
      nombre: 'Ana',
      apellido: 'Ríos',
      email: 'ana@gestock.com',
      password: 'sololetras',
      rolId: 2,
    });
    expect(error).toBeInstanceOf(ApiError);
  });

  it('rechaza un rol no numérico', () => {
    const { error } = correrMiddleware(validateBody(crearUsuarioSchema), {
      nombre: 'Ana',
      apellido: 'Ríos',
      email: 'ana@gestock.com',
      password: 'Pass2026!',
      rolId: 'x',
    });
    expect(error).toBeInstanceOf(ApiError);
  });
});