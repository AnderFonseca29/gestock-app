import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecepcionMercanciasComponent } from './recepcion-mercancias';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

describe('RecepcionMercanciasComponent', () => {
  let component: RecepcionMercanciasComponent;
  let fixture: ComponentFixture<RecepcionMercanciasComponent>;
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
      imports: [RecepcionMercanciasComponent],
      providers: [
        { provide: ApiService, useValue: apiMock },
        { provide: ToastService, useValue: toastMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecepcionMercanciasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar movimientos, productos y bodegas al inicializar', () => {
    expect(apiMock.get).toHaveBeenCalledWith('/productos');
    expect(apiMock.get).toHaveBeenCalledWith('/bodegas');
    expect(apiMock.get).toHaveBeenCalledWith('/movimientos', {
      tipo: undefined,
      estado: undefined
    });
  });
});