import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { CreacionUsuariosComponent as CreacionUsuarios } from './creacion-usuarios';
import { UsuarioService } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';

describe('CreacionUsuarios', () => {
  let component: CreacionUsuarios;
  let fixture: ComponentFixture<CreacionUsuarios>;
  let usuarioServiceMock: { obtenerRolesBasicos: ReturnType<typeof vi.fn>; crearUsuario: ReturnType<typeof vi.fn> };
  let toastMock: { mostrar: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    usuarioServiceMock = {
      obtenerRolesBasicos: vi.fn().mockResolvedValue([]),
      crearUsuario: vi.fn().mockResolvedValue({})
    };
    toastMock = {
      mostrar: vi.fn()
    };
    routerMock = {
      navigate: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [CreacionUsuarios],
      providers: [
        { provide: UsuarioService, useValue: usuarioServiceMock },
        { provide: ToastService, useValue: toastMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreacionUsuarios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar los roles básicos al inicializar', () => {
    expect(usuarioServiceMock.obtenerRolesBasicos).toHaveBeenCalled();
  });
});