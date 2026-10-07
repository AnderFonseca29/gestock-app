import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RecuperacionContrasenaComponent } from './recuperacion-contrasena';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

describe('RecuperacionContrasenaComponent (verificación en dos pasos)', () => {
  let component: RecuperacionContrasenaComponent;
  let fixture: ComponentFixture<RecuperacionContrasenaComponent>;
  let toastMock: { mostrar: ReturnType<typeof vi.fn> };
  let apiMock: { post: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    toastMock = {
      mostrar: vi.fn()
    };
    apiMock = {
      post: vi.fn()
    };
    routerMock = {
      navigate: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [RecuperacionContrasenaComponent],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: ToastService, useValue: toastMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecuperacionContrasenaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('PASO 1: debe mostrar error si se solicita recuperación sin teléfono válido', () => {
    component.datosRecuperacion.telefono = 'abc';
    component.solicitarRecuperacion();
    expect(apiMock.post).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('teléfono');
    expect(component.pasoActual).toBe(1);
  });

  it('PASO 1: teléfono válido envía el código y avanza al paso 2', async () => {
    apiMock.post.mockResolvedValue({ enmascarado: '315 *** ** 11', codigoDemo: '812813' });
    component.datosRecuperacion.telefono = '315 400 1111';
    await component.solicitarRecuperacion();
    expect(apiMock.post).toHaveBeenCalledWith('/auth/recuperar', { telefono: '315 400 1111' });
    expect(component.pasoActual).toBe(2);
    expect(component.codigoDemo).toBe('812813');
    expect(component.telefonoDestino).toBe('315 *** ** 11');
    expect(toastMock.mostrar).toHaveBeenCalled();
  });

  it('PASO 2: rechaza el envío si el código no tiene 6 dígitos', async () => {
    component.pasoActual = 2;
    component.datosRecuperacion.codigo = '123';
    component.datosRecuperacion.nuevaPassword = 'NuevaPass2026!';
    component.datosRecuperacion.confirmarPassword = 'NuevaPass2026!';
    await component.restablecerPassword();
    expect(apiMock.post).not.toHaveBeenCalled();
    expect(component.errorMessage).toBeTruthy();
    expect(component.pasoActual).toBe(2);
  });

  it('PASO 2: rechaza si las contraseñas no coinciden', async () => {
    component.pasoActual = 2;
    component.datosRecuperacion.codigo = '812813';
    component.datosRecuperacion.nuevaPassword = 'NuevaPass2026!';
    component.datosRecuperacion.confirmarPassword = 'NuevaPass2027!';
    await component.restablecerPassword();
    expect(apiMock.post).not.toHaveBeenCalled();
    expect(component.errorMessage).toBeTruthy();
  });

  it('PASO 2: rechaza contraseñas débiles', async () => {
    component.pasoActual = 2;
    component.datosRecuperacion.codigo = '812813';
    component.datosRecuperacion.nuevaPassword = 'hola';
    component.datosRecuperacion.confirmarPassword = 'hola';
    await component.restablecerPassword();
    expect(apiMock.post).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('8 caracteres');
  });

  it('PASO 2: restablece la contraseña, limpia el formulario y redirige al login', async () => {
    vi.useFakeTimers();
    apiMock.post.mockResolvedValue(null);
    component.pasoActual = 2;
    component.datosRecuperacion.telefono = '315 400 1111';
    component.datosRecuperacion.codigo = '812813';
    component.datosRecuperacion.nuevaPassword = 'NuevaPass2026!';
    component.datosRecuperacion.confirmarPassword = 'NuevaPass2026!';
    component.codigoDemo = '812813';
    await component.restablecerPassword();
    expect(apiMock.post).toHaveBeenCalledWith('/auth/recuperar/restablecer', {
      telefono: '315 400 1111',
      codigo: '812813',
      nuevaPassword: 'NuevaPass2026!'
    });
    expect(toastMock.mostrar).toHaveBeenCalled();
    expect(component.pasoActual).toBe(1);
    expect(component.codigoDemo).toBe('');
    expect(component.datosRecuperacion.telefono).toBe('');
    expect(component.datosRecuperacion.nuevaPassword).toBe('');
    vi.runAllTimers();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
    vi.useRealTimers();
  });

  it('PASO 2: muestra el error del backend si el código es inválido y no navega', async () => {
    vi.useFakeTimers();
    apiMock.post.mockRejectedValue({ error: { message: 'El código ingresado no es válido o ha expirado.' } });
    component.pasoActual = 2;
    component.datosRecuperacion.telefono = '315 400 1111';
    component.datosRecuperacion.codigo = '111111';
    component.datosRecuperacion.nuevaPassword = 'NuevaPass2026!';
    component.datosRecuperacion.confirmarPassword = 'NuevaPass2026!';
    await component.restablecerPassword();
    expect(component.errorMessage).toContain('El código ingresado no es válido');
    expect(component.shakeAnimacion).toBe(true);
    expect(component.pasoActual).toBe(2);
    vi.runAllTimers();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});