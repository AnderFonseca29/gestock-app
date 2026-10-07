import { TestBed } from '@angular/core/testing';
import { RolesUsuariosService } from './services';
import { ApiService } from '../../../../services/api.service';

describe('RolesUsuariosService', () => {
  let service: RolesUsuariosService;
  let apiMock: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    apiMock = {
      get: vi.fn().mockResolvedValue([]),
      post: vi.fn().mockResolvedValue({}),
      put: vi.fn().mockResolvedValue({}),
      patch: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({})
    };

    TestBed.configureTestingModule({
      providers: [{ provide: ApiService, useValue: apiMock }]
    });

    service = TestBed.inject(RolesUsuariosService);
  });

  it('debe crearse el servicio RolesUsuariosService', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener usuarios y actualizar la señal', async () => {
    const usuarios = [{ id: 1, nombre: 'Ana', email: 'ana@gestock.com', rol_id: 1 }];
    apiMock.get.mockResolvedValue(usuarios);
    const resultado = await service.obtenerUsuarios();
    expect(apiMock.get).toHaveBeenCalledWith('/usuarios');
    expect(resultado).toEqual(usuarios);
    expect(service.usuarios()).toEqual(usuarios);
  });

  it('debe obtener roles y actualizar la señal', async () => {
    const roles = [{ id: 1, nombre: 'Administrador', descripcion: null, estado: 'Activo' }];
    apiMock.get.mockResolvedValue(roles);
    const resultado = await service.obtenerRoles();
    expect(apiMock.get).toHaveBeenCalledWith('/roles/basicos');
    expect(resultado).toEqual(roles);
    expect(service.roles()).toEqual(roles);
  });

  it('debe crear un usuario y refrescar la lista', async () => {
    const payload = { nombre: 'Luis', apellido: 'Pérez', email: 'luis@gestock.com', password: '123456', rolId: 2 };
    apiMock.post.mockResolvedValue({ id: 3, ...payload });
    const nuevo = await service.crearUsuario(payload);
    expect(apiMock.post).toHaveBeenCalledWith('/usuarios', payload);
    expect(nuevo).toEqual({ id: 3, ...payload });
    expect(apiMock.get).toHaveBeenCalledWith('/usuarios');
  });

  it('debe eliminar un usuario y removerlo de la señal', async () => {
    const usuarioBase = {
      apellido: 'Pérez',
      email: 'x@gestock.com',
      estado: 'Activo',
      rol_id: 2,
      empresa_id: 1,
      ultimo_acceso: null,
      fecha_creacion: '2026-01-01',
      fecha_actualizacion: '2026-01-01'
    };
    service.usuarios.set([
      { id: 1, nombre: 'Ana', ...usuarioBase },
      { id: 2, nombre: 'Luis', ...usuarioBase }
    ]);
    await service.eliminarUsuario(1);
    expect(apiMock.delete).toHaveBeenCalledWith('/usuarios/1');
    expect(service.usuarios()).toEqual([{ id: 2, nombre: 'Luis', ...usuarioBase }]);
  });

  it('debe cambiar la contraseña de un usuario (nueva + confirmación)', async () => {
    apiMock.put.mockResolvedValue({ success: true });
    const payload = { nuevaPassword: 'Nueva2026!', confirmarPassword: 'Nueva2026!' };
    await service.cambiarPasswordUsuario(5, payload);
    expect(apiMock.put).toHaveBeenCalledWith('/usuarios/5/password', payload);
  });
});