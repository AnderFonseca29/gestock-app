import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';
import { SESION_KEY, TOKEN_KEY } from '../interceptors/api.interceptor';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn().mockResolvedValue(true)
    };

    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debe crearse el servicio AuthService', () => {
    expect(service).toBeTruthy();
  });

  it('debe iniciar sesión y guardar el token y la sesión', async () => {
    const usuario = { id: 1, nombre: 'Ana', email: 'ana@gestock.com' };
    const promesa = service.login('ana@gestock.com', '123456');

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: { token: 'token-abc', usuario } });

    const resultado = await promesa;
    expect(resultado.ok).toBe(true);
    expect(localStorage.getItem(TOKEN_KEY)).toBe('token-abc');
    expect(localStorage.getItem(SESION_KEY)).toBe(JSON.stringify(usuario));
  });

  it('debe devolver mensaje de credenciales incorrectas en 401', async () => {
    const promesa = service.login('ana@gestock.com', 'incorrecta');

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ message: 'bad credentials' }, { status: 401, statusText: 'Unauthorized' });

    const resultado = await promesa;
    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toContain('Credenciales incorrectas');
  });

  it('debe obtener el usuario actual guardado en localStorage', () => {
    const usuario = { id: 1, nombre: 'Ana', email: 'ana@gestock.com', rol: 'Administrador' };
    localStorage.setItem(SESION_KEY, JSON.stringify(usuario));
    expect(service.obtenerUsuarioActual()).toEqual(usuario);
  });

  it('debe devolver null si no hay sesión guardada', () => {
    expect(service.obtenerUsuarioActual()).toBeNull();
  });
});