import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth';

interface ProductoApi {
  id: number;
  codigo: string;
  nombre: string;
}

interface BodegaApi {
  id: number;
  nombre: string;
  codigo: string;
}

interface MovimientoApi {
  id: number;
  producto_id: number | null;
  bodega_id: number | null;
  tipo: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';
  cantidad: number;
  motivo: string;
  responsable: string;
  observaciones: string | null;
  estado: 'Validado' | 'Discrepancia';
  usuario_id: number | null;
  fecha: string;
  sku?: string | null;
  producto?: string | null;
  bodega?: string | null;
}

interface RecepcionItem {
  id: string;
  fecha: string;
  sku: string;
  producto: string;
  cantidad: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';
  motivo: string;
  responsable: string;
  observaciones: string;
  estado: 'Validado' | 'Discrepancia';
}

interface NuevoMovimientoForm {
  productoId: number | null;
  bodegaId: number | null;
  tipo: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  motivo: string;
  responsable: string;
  observaciones: string;
  estado: 'Validado' | 'Discrepancia';
}

@Component({
  selector: 'app-recepcion-mercancias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recepcion-mercancias.html',
  styleUrls: ['./recepcion-mercancias.css']
})
export class RecepcionMercanciasComponent implements OnInit {

  private api = inject(ApiService);
  private toast = inject(ToastService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  tienePermiso(codigo: string): boolean {
    return this.authService.tienePermiso(codigo);
  }

  filtroTipo: string = 'TODOS';
  filtroEstado: string = 'TODOS';
  listaRecepciones: RecepcionItem[] = [];

  productos: ProductoApi[] = [];
  bodegas: BodegaApi[] = [];

  menuAccionesAbierto: boolean = false;
  modalActivo: boolean = false;
  modalTitulo: string = '';

  nuevoItem: NuevoMovimientoForm = {
    productoId: null,
    bodegaId: null,
    tipo: 'ENTRADA',
    cantidad: 1,
    motivo: 'Compra',
    responsable: '',
    observaciones: '',
    estado: 'Validado'
  };

  async ngOnInit() {
    await Promise.all([this.cargarMovimientos(), this.cargarProductos(), this.cargarBodegas()]);
  }

  async cargarProductos() {
    const data = await this.api.get<ProductoApi[]>('/productos');
    this.productos = data ?? [];
    this.cdr.detectChanges();
  }

  async cargarBodegas() {
    const data = await this.api.get<BodegaApi[]>('/bodegas');
    this.bodegas = data ?? [];
    this.cdr.detectChanges();
  }

  async cargarMovimientos() {
    const data = await this.api.get<{ movimientos: MovimientoApi[] }>('/movimientos', {
      tipo: this.filtroTipo === 'TODOS' ? undefined : this.filtroTipo,
      estado: this.filtroEstado === 'TODOS' ? undefined : this.filtroEstado,
    });
    this.listaRecepciones = (data?.movimientos ?? []).map((m) => this.mapearMovimiento(m));
    this.cdr.detectChanges();
  }

  private mapearMovimiento(m: MovimientoApi): RecepcionItem {
    const iso = m.fecha ? String(m.fecha) : '';
    return {
      id: `MOV-${m.id}`,
      fecha: iso ? `${iso.slice(0, 10)} ${iso.slice(11, 16)}` : '',
      sku: m.sku ?? '',
      producto: m.producto ?? '',
      cantidad: m.cantidad,
      tipo: m.tipo,
      motivo: m.motivo,
      responsable: m.responsable,
      observaciones: m.observaciones ?? '',
      estado: m.estado
    };
  }

  get recepcionesFiltradas(): RecepcionItem[] {
    return this.listaRecepciones;
  }

  filtrarPorTipo(tipo: string) {
    this.filtroTipo = tipo;
    this.cargarMovimientos();
  }

  aplicarFiltros() {
    this.cargarMovimientos();
  }

  toggleMenuAcciones() {
    this.menuAccionesAbierto = !this.menuAccionesAbierto;
  }

  abrirFormulario(tipo: 'ENTRADA' | 'SALIDA') {
    this.menuAccionesAbierto = false;

    this.nuevoItem = {
      productoId: null,
      bodegaId: null,
      tipo: tipo,
      cantidad: 1,
      motivo: tipo === 'ENTRADA' ? 'Compra' : 'Venta',
      responsable: '',
      observaciones: '',
      estado: 'Validado'
    };
    this.modalTitulo = tipo === 'ENTRADA' ? 'Registrar Nueva Entrada de Mercancía' : 'Registrar Nuevo Despacho / Salida';
    this.modalActivo = true;
  }

  cerrarModal() {
    this.modalActivo = false;
  }

  async guardarMovimiento() {
    if (!this.nuevoItem.productoId || !this.nuevoItem.responsable || !this.nuevoItem.cantidad || this.nuevoItem.cantidad <= 0) {
      this.toast.mostrar('Por favor complete los campos obligatorios.', 'error', 'Validación');
      return;
    }

    try {
      await this.api.post<MovimientoApi>('/movimientos', {
        productoId: this.nuevoItem.productoId,
        bodegaId: this.nuevoItem.bodegaId,
        tipo: this.nuevoItem.tipo,
        cantidad: this.nuevoItem.cantidad,
        motivo: this.nuevoItem.motivo,
        responsable: this.nuevoItem.responsable,
        observaciones: this.nuevoItem.observaciones || null,
        estado: this.nuevoItem.estado
      });

      this.toast.mostrar('Movimiento registrado correctamente.', 'success', 'Registro exitoso');
      this.modalActivo = false;
      await this.cargarMovimientos();
      this.cdr.detectChanges();
    } catch {
      // El interceptor de la API ya muestra el mensaje de error.
      this.cdr.detectChanges();
    }
  }

  generarInforme(item: RecepcionItem) {
    this.toast.mostrar(
      `SKU: ${item.sku} | Producto: ${item.producto} | Cantidad: ${item.cantidad} un. | ${item.observaciones}`,
      'info',
      `Detalle ${item.id}`
    );
  }
}