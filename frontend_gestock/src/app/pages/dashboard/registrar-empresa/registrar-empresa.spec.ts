import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RegistrarEmpresaComponent } from './registrar-empresa';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

describe('RegistrarEmpresaComponent', () => {
  let component: RegistrarEmpresaComponent;
  let fixture: ComponentFixture<RegistrarEmpresaComponent>;
  let apiMock: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let toastMock: { mostrar: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiMock = {
      get: vi.fn().mockResolvedValue([]),
      post: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({})
    };
    toastMock = {
      mostrar: vi.fn()
    };
    routerMock = {
      navigate: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [RegistrarEmpresaComponent],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: ToastService, useValue: toastMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrarEmpresaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario de registro de empresa', () => {
    expect(component.nuevaEmpresaForm).toBeTruthy();
    expect(component.nuevaEmpresaForm.contains('nombre')).toBe(true);
    expect(component.nuevaEmpresaForm.contains('email')).toBe(true);
  });
});