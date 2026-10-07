import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelComponent as Panel } from './panel';
import { ApiService } from '../../../services/api.service';

describe('Panel', () => {
  let component: Panel;
  let fixture: ComponentFixture<Panel>;
  let apiMock: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiMock = {
      get: vi.fn().mockResolvedValue([])
    };

    await TestBed.configureTestingModule({
      imports: [Panel],
      providers: [{ provide: ApiService, useValue: apiMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(Panel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});