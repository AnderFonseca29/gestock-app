import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RolesUsuariosComponent } from './roles-yusuarios';
import { RolesUsuariosService } from './services/services';
import { ToastService } from '../../../services/toast.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('RolesUsuariosComponent', () => {
  let component: RolesUsuariosComponent;
  let fixture: ComponentFixture<RolesUsuariosComponent>;
  let serviceMock: Record<string, ReturnType<typeof vi.fn>>;

  const usuarioVista = {
    id: 1,
    nombre: 'Ana',
    apellido: 'López',
    email: 'ana@gestock.com',
    rol: 'Operario',
    rolId: 3,
    activo: true,
    estadoTexto: 'En línea',
    estado: 'Activo',
    horasTrabajadas: 0
  };

  beforeEach(async () => {
    serviceMock = {
      obtenerUsuarios: vi.fn().mockResolvedValue([]),
      obtenerRoles: vi.fn().mockResolvedValue([]),
      obtenerRolesConPermisos: vi.fn().mockResolvedValue([]),
      obtenerPermisos: vi.fn().mockResolvedValue({ permisos: [], modulos: [] }),
      crearUsuario: vi.fn().mockResolvedValue({}),
      cambiarRolUsuario: vi.fn().mockResolvedValue({}),
      asignarPermisosRol: vi.fn().mockResolvedValue({}),
      cambiarPasswordUsuario: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [RolesUsuariosComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RolesUsuariosService, useValue: serviceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RolesUsuariosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('abre y cierra el modal de cambio de contraseña', () => {
    component.abrirModalPassword(usuarioVista);
    expect(component.usuarioPassword).toBe(usuarioVista);

    component.cerrarModalPassword();
    expect(component.usuarioPassword).toBeNull();
  });

  it('verifica que las contraseñas coincidan', () => {
    component.passwordForm.setValue({ nuevaPassword: 'Clave2026!', confirmarPassword: 'Clave2026!' });
    expect(component.passwordsCoinciden()).toBe(true);

    component.passwordForm.setValue({ nuevaPassword: 'Clave2026!', confirmarPassword: 'Otra2026!' });
    expect(component.passwordsCoinciden()).toBe(false);
  });

  it('guarda la nueva contraseña y cierra el modal al tener éxito', async () => {
    const toastSpy = vi.spyOn(TestBed.inject(ToastService), 'mostrar');
    component.usuarioPassword = usuarioVista;
    component.passwordForm.setValue({ nuevaPassword: 'Clave2026!', confirmarPassword: 'Clave2026!' });

    component.guardarCambioPassword();
    await fixture.whenStable();

    expect(serviceMock['cambiarPasswordUsuario']).toHaveBeenCalledWith(1, {
      nuevaPassword: 'Clave2026!',
      confirmarPassword: 'Clave2026!'
    });
    expect(component.usuarioPassword).toBeNull();
    expect(toastSpy).toHaveBeenCalled();
  });

  it('no llama al servicio cuando las contraseñas no coinciden', () => {
    component.usuarioPassword = usuarioVista;
    component.passwordForm.setValue({ nuevaPassword: 'Clave2026!', confirmarPassword: 'Otra2026!' });

    component.guardarCambioPassword();

    expect(serviceMock['cambiarPasswordUsuario']).not.toHaveBeenCalled();
    expect(component.usuarioPassword).toBe(usuarioVista);
  });
});