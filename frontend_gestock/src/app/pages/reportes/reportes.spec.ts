import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportesComponent } from './reportes';
import { ApiService } from '../../services/api.service';

describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;
  let apiMock: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiMock = {
      get: vi.fn().mockResolvedValue([])
    };

    await TestBed.configureTestingModule({
      imports: [ ReportesComponent ],
      providers: [{ provide: ApiService, useValue: apiMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente de reportes', () => {
    expect(component).toBeTruthy();
  });

  it('debe cambiar de tab activado', () => {
    component.cambiarTab('movimientos');
    expect(component.tabActiva).toBe('movimientos');
  });
});