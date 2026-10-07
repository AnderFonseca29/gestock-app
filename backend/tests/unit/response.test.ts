import { describe, it, expect } from 'vitest';
import { ok, created, noContent } from '../../src/utils/response';

function crearRes() {
  const captura: { status: number; body: any } = { status: 0, body: undefined };
  const res = {
    status: (s: number) => {
      captura.status = s;
      return res;
    },
    json: (body: unknown) => {
      captura.body = body;
    },
  };
  return { res, captura };
}

describe('helpers de respuesta', () => {
  it('ok devuelve 200 y estructura { success, message, data }', () => {
    const { res, captura } = crearRes();
    ok(res as any, { id: 1 }, 'Listo');
    expect(captura.status).toBe(200);
    expect(captura.body).toEqual({ success: true, message: 'Listo', data: { id: 1 } });
  });

  it('created devuelve 201', () => {
    const { res, captura } = crearRes();
    created(res as any, { id: 2 }, 'Creado');
    expect(captura.status).toBe(201);
    expect(captura.body).toEqual({ success: true, message: 'Creado', data: { id: 2 } });
  });

  it('noContent usa 200 con data null', () => {
    const { res, captura } = crearRes();
    noContent(res as any);
    expect(captura.status).toBe(200);
    expect(captura.body).toEqual({ success: true, message: 'Operación realizada correctamente.', data: null });
  });
});