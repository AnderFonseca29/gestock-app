import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BodegasComponent } from './bodegas';
import { ApiService } from '../../../../services/api.service';

describe('BodegasComponent', () => {
  let component: BodegasComponent;
  let fixture: ComponentFixture<BodegasComponent>;
  let apiMock: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiMock = {
      get: vi.fn().mockResolvedValue([]),
      post: vi.fn().mockResolvedValue({}),
      put: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({})
    };

    await TestBed.configureTestingModule({
      imports: [BodegasComponent],
      providers: [{ provide: ApiService, useValue: apiMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(BodegasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});