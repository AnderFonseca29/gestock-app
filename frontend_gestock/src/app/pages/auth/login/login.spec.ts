import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginComponent } from './login';
import { AuthService } from '../../../services/auth';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authMock: { login: ReturnType<typeof vi.fn>; obtenerRutaInicialPorRol: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    authMock = {
      login: vi.fn().mockResolvedValue({ ok: true }),
      obtenerRutaInicialPorRol: vi.fn().mockReturnValue('/app/panel')
    };
    routerMock = {
      navigate: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario de login con email y password', () => {
    expect(component.loginForm).toBeTruthy();
    expect(component.loginForm.contains('email')).toBe(true);
    expect(component.loginForm.contains('password')).toBe(true);
  });

  it('no debe llamar a login si el formulario es inválido', () => {
    component.loginForm.setValue({ email: '', password: '', recordar: false });
    component.procesarLogin();
    expect(authMock.login).not.toHaveBeenCalled();
    expect(component.loginForm.get('email')?.touched).toBe(true);
  });

  it('debe iniciar sesión y navegar a la ruta inicial con credenciales válidas', async () => {
    component.loginForm.setValue({ email: 'admin@gestock.com', password: '123456', recordar: false });
    component.procesarLogin();
    expect(authMock.login).toHaveBeenCalledWith('admin@gestock.com', '123456');
    await fixture.whenStable();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/panel']);
  });
});