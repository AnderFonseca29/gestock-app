import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth';

interface MovimientoLogistico {
  id: string;
  fecha: string;
  tipoMovimiento: 'Entrada' | 'Salida' | 'Transferencia';
  producto: string;
  cantidad: number;
  responsable: string;
  destinoOrigen: string;
}

interface MovimientoApi {
  id: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';
  cantidad: number;
  responsable: string;
  fecha: string;
  sku?: string | null;
  producto?: string | null;
  bodega?: string | null;
}

interface RecepcionApi {
  id: number;
  numero_documento: string;
  proveedor: string;
  fecha_recepcion: string;
  bodega_id: number | null;
  estado: string;
  observaciones: string | null;
  usuario_nombre?: string | null;
  bodega_nombre?: string | null;
}

@Component({
  selector: 'app-historial-logistico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-logistico.html',
  styleUrls: ['./historial-logistico.css']
})
export class HistorialLogisticoComponent implements OnInit {

  private api = inject(ApiService);
  private toast = inject(ToastService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  tienePermiso(codigo: string): boolean {
    return this.authService.tienePermiso(codigo);
  }

  // Filtros (HU042)
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';
  filtroTipo: string = 'Todos';
  filtroProducto: string = '';
  filtroResponsable: string = '';

  // Lista maestra de movimientos (HU041)
  historialMovimientos: MovimientoLogistico[] = [];

  async ngOnInit() {
    await this.cargarHistorial();
  }

  async cargarHistorial() {
    const [movimientosData, recepcionesData] = await Promise.all([
      this.api.get<{ movimientos: MovimientoApi[] }>('/movimientos'),
      this.api.get<RecepcionApi[]>('/recepciones')
    ]);

    const movimientos: MovimientoLogistico[] = (movimientosData?.movimientos ?? []).map((m) => ({
      id: `MOV-${m.id}`,
      fecha: this.normalizarFecha(m.fecha),
      tipoMovimiento: this.tipoLabel(m.tipo),
      producto: m.producto ?? '',
      cantidad: m.cantidad,
      responsable: m.responsable,
      destinoOrigen: m.bodega ?? ''
    }));

    const recepciones: MovimientoLogistico[] = (recepcionesData ?? []).map((r) => ({
      id: `REC-${r.id}`,
      fecha: this.normalizarFecha(r.fecha_recepcion),
      tipoMovimiento: 'Entrada',
      producto: '',
      cantidad: 0,
      responsable: r.usuario_nombre ?? '',
      destinoOrigen: r.bodega_nombre ? `${r.proveedor} → ${r.bodega_nombre}` : r.proveedor
    }));

    this.historialMovimientos = [...recepciones, ...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha));
    this.cdr.detectChanges();
  }

  private tipoLabel(tipo: MovimientoApi['tipo']): MovimientoLogistico['tipoMovimiento'] {
    if (tipo === 'ENTRADA') return 'Entrada';
    if (tipo === 'SALIDA') return 'Salida';
    return 'Transferencia';
  }

  private normalizarFecha(fecha: string): string {
    const iso = fecha ? String(fecha) : '';
    return iso ? iso.slice(0, 10) : '';
  }

  // Propiedad computada para filtrar por rango de fechas, tipo, producto y responsable (HU042)
  get movimientosFiltrados(): MovimientoLogistico[] {
    return this.historialMovimientos.filter(item => {
      // Filtro por rango de fechas (Desde - Hasta)
      let coincideFecha = true;
      if (this.filtroFechaDesde && this.filtroFechaHasta) {
        coincideFecha = item.fecha >= this.filtroFechaDesde && item.fecha <= this.filtroFechaHasta;
      } else if (this.filtroFechaDesde) {
        coincideFecha = item.fecha >= this.filtroFechaDesde;
      } else if (this.filtroFechaHasta) {
        coincideFecha = item.fecha <= this.filtroFechaHasta;
      }

      // Filtro por tipo de movimiento
      const coincideTipo = this.filtroTipo && this.filtroTipo !== 'Todos'
        ? item.tipoMovimiento === this.filtroTipo
        : true;

      // Filtro por producto
      const coincideProducto = this.filtroProducto
        ? item.producto.toLowerCase().includes(this.filtroProducto.toLowerCase())
        : true;

      // Filtro por responsable
      const coincideResponsable = this.filtroResponsable && this.filtroResponsable !== 'Todos los usuarios'
        ? item.responsable === this.filtroResponsable
        : true;

      return coincideFecha && coincideTipo && coincideProducto && coincideResponsable;
    });
  }

  // Generación de reporte con el botón Exportar (HU043)
  exportarReporte(): void {
    const filtrosAplicados = {
      fechaDesde: this.filtroFechaDesde || 'Sin límite inicial',
      fechaHasta: this.filtroFechaHasta || 'Sin límite final',
      tipoMovimiento: this.filtroTipo,
      producto: this.filtroProducto || 'Ninguno',
      responsable: this.filtroResponsable || 'Ninguno'
    };

    this.toast.mostrar(
      `Reporte generado con ${this.movimientosFiltrados.length} registro(s). Filtros: ${JSON.stringify(filtrosAplicados)}`,
      'success',
      'Exportación de reporte'
    );
  }

  limpiarFiltros(): void {
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.filtroTipo = 'Todos';
    this.filtroProducto = '';
    this.filtroResponsable = 'Todos los usuarios';
  }
}