import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { EmpresasComponent } from './empresa';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

describe('EmpresasComponent', () => {
  let component: EmpresasComponent;
  let fixture: ComponentFixture<EmpresasComponent>;
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
      imports: [EmpresasComponent],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: ToastService, useValue: toastMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmpresasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario de nueva empresa', () => {
    expect(component.nuevaEmpresaForm).toBeTruthy();
    expect(component.nuevaEmpresaForm.contains('nombre')).toBe(true);
    expect(component.nuevaEmpresaForm.contains('email')).toBe(true);
  });

  it('debe cargar la lista de empresas al inicializar', () => {
    expect(apiMock.get).toHaveBeenCalledWith('/empresas');
  });
});