import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SesionesActivasComponent } from './sesiones-activas';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

describe('SesionesActivasComponent', () => {
  let component: SesionesActivasComponent;
  let fixture: ComponentFixture<SesionesActivasComponent>;
  let apiMock: { get: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn> };
  let toastMock: { mostrar: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiMock = {
      get: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue({}),
      post: vi.fn().mockResolvedValue({})
    };
    toastMock = {
      mostrar: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [SesionesActivasComponent],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: ToastService, useValue: toastMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SesionesActivasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar las sesiones activas al inicializar', async () => {
    expect(apiMock.get).toHaveBeenCalledWith('/sesiones');
    await fixture.whenStable();
    expect(component.sesiones).toEqual([]);
  });

  it('debe cerrar una sesión y removerla de la lista', async () => {
    component.sesiones = [
      { id: '1', dispositivo: 'PC', navegador: 'Chrome', ubicacion: '-', ip: '1.1.1.1', ultimaActividad: '-', esActual: false }
    ];
    await component.cerrarSesion('1');
    expect(apiMock.delete).toHaveBeenCalledWith('/sesiones/1');
    expect(component.sesiones).toEqual([]);
  });
});