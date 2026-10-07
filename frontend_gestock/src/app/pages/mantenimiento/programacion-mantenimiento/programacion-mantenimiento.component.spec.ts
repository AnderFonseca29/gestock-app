import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramacionMantenimientoComponent } from './programacion-mantenimiento.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

describe('ProgramacionMantenimientoComponent', () => {
  let component: ProgramacionMantenimientoComponent;
  let fixture: ComponentFixture<ProgramacionMantenimientoComponent>;
  let apiMock: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };
  let toastMock: { mostrar: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiMock = {
      get: vi.fn().mockResolvedValue([]),
      post: vi.fn().mockResolvedValue({})
    };
    toastMock = {
      mostrar: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ProgramacionMantenimientoComponent],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: ToastService, useValue: toastMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramacionMantenimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar las programaciones al inicializar', () => {
    expect(apiMock.get).toHaveBeenCalledWith('/mantenimientos');
  });
});