import { TestBed } from '@angular/core/testing';
import { InventarioService } from './services';
import { ApiService } from '../../../../services/api.service';

describe('InventarioService', () => {
  let service: InventarioService;
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

    service = TestBed.inject(InventarioService);
  });

  it('debe crearse el servicio InventarioService', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener productos y actualizar la señal', async () => {
    apiMock.get.mockResolvedValue([{ id: 1, nombre: 'Perforadora' }]);
    const productos = await service.obtenerProductos();
    expect(apiMock.get).toHaveBeenCalledWith('/productos');
    expect(productos).toEqual([{ id: 1, nombre: 'Perforadora' }]);
    expect(service.productos()).toEqual([{ id: 1, nombre: 'Perforadora' }]);
  });

  it('debe crear un producto y agregarlo a la señal', async () => {
    apiMock.post.mockResolvedValue({ id: 2, nombre: 'Taladro' });
    const nuevo = await service.crearProducto({ nombre: 'Taladro' });
    expect(apiMock.post).toHaveBeenCalledWith('/productos', { nombre: 'Taladro' });
    expect(nuevo).toEqual({ id: 2, nombre: 'Taladro' });
    expect(service.productos()).toContainEqual({ id: 2, nombre: 'Taladro' });
  });

  it('debe obtener bodegas y actualizar la señal', async () => {
    service.obtenerBodegas();
    expect(apiMock.get).toHaveBeenCalledWith('/bodegas', undefined);
  });

  it('debe eliminar un producto y removerlo de la señal', async () => {
    service.productos.set([{ id: 1 }, { id: 2 }]);
    await service.eliminarProducto(1);
    expect(apiMock.delete).toHaveBeenCalledWith('/productos/1');
    expect(service.productos()).toEqual([{ id: 2 }]);
  });
});