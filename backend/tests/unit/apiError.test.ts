import { describe, it, expect } from 'vitest';
import { ApiError } from '../../src/utils/ApiError';

describe('ApiError', () => {
  it('crea errores con código y status correctos', () => {
    const err = ApiError.badRequest('Datos inválidos');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.message).toBe('Datos inválidos');
    expect(err.name).toBe('ApiError');
  });

  it('expone helpers con status correctos', () => {
    expect(ApiError.unauthorized().statusCode).toBe(401);
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.notFound().statusCode).toBe(404);
    expect(ApiError.conflict('x').statusCode).toBe(409);
    expect(ApiError.tooManyRequests().statusCode).toBe(429);
    expect(ApiError.internal().statusCode).toBe(500);
  });

  it('mantiene details adicionales', () => {
    const details = [{ campo: 'email', mensaje: 'inválido' }];
    const err = ApiError.badRequest('x', details);
    expect(err.details).toEqual(details);
  });
});