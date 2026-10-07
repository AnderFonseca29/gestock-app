import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertasControlComponent } from './alertas-control';
import { ApiService } from '../../../../services/api.service';

describe('AlertasControl', () => {
  let component: AlertasControlComponent;
  let fixture: ComponentFixture<AlertasControlComponent>;
  let apiMock: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiMock = {
      get: vi.fn().mockResolvedValue([]),
      post: vi.fn().mockResolvedValue({}),
      put: vi.fn().mockResolvedValue({}),
      patch: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({})
    };

    await TestBed.configureTestingModule({
      imports: [AlertasControlComponent],
      providers: [{ provide: ApiService, useValue: apiMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertasControlComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});