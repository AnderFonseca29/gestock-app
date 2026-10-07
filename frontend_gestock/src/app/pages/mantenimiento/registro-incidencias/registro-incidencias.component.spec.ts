import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenciasComponent } from './registro-incidencias.component';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

describe('IncidenciasComponent', () => {
  let component: IncidenciasComponent;
  let fixture: ComponentFixture<IncidenciasComponent>;
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
      imports: [IncidenciasComponent],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: ToastService, useValue: toastMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar las incidencias al inicializar', () => {
    expect(apiMock.get).toHaveBeenCalledWith('/incidencias');
  });
});