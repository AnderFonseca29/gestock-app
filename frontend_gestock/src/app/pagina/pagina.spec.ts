import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PaginaComponent } from './pagina';
import { AuthService } from '../services/auth';

vi.hoisted(() => {
  const mediaQueryListStub = {
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({ ...mediaQueryListStub, media: query }),
  });
});

describe('PaginaComponent', () => {
  let component: PaginaComponent;
  let fixture: ComponentFixture<PaginaComponent>;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let authMock: { estaAutenticado: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    routerMock = {
      navigate: vi.fn(),
    };
    authMock = {
      estaAutenticado: vi.fn().mockReturnValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [PaginaComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe navegar hacia /app al ejecutar irAlSistema', () => {
    component.irAlSistema();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app']);
  });
});