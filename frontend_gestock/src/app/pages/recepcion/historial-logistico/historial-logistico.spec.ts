import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialLogisticoComponent as HistorialLogistico } from './historial-logistico';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

describe('HistorialLogistico', () => {
  let component: HistorialLogistico;
  let fixture: ComponentFixture<HistorialLogistico>;
  let apiMock: { get: ReturnType<typeof vi.fn> };
  let toastMock: { mostrar: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiMock = {
      get: vi.fn().mockResolvedValue([])
    };
    toastMock = {
      mostrar: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [HistorialLogistico],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: ToastService, useValue: toastMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistorialLogistico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar el historial logístico al inicializar', () => {
    expect(apiMock.get).toHaveBeenCalledWith('/movimientos');
    expect(apiMock.get).toHaveBeenCalledWith('/recepciones');
  });
});