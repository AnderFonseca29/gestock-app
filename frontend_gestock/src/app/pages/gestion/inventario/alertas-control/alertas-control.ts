import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../services/services';

@Component({
  selector: 'app-alertas-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alertas-control.html',
  styleUrls: ['./alertas-control.css']
})
export class AlertasControlComponent implements OnInit, OnDestroy {

  private inventarioService = inject(InventarioService);

  listaAlertas: any[] = [];
  alertaSeleccionada: any = null;
  filtroAccion: string = 'TODOS';
  filtroBusqueda: string = '';

  private intervaloActualizacion: any;

  ngOnInit() {
    this.cargarAlertas();
    this.intervaloActualizacion = setInterval(() => {
      this.cargarAlertas();
    }, 4000);
  }

  ngOnDestroy() {
    if (this.intervaloActualizacion) {
      clearInterval(this.intervaloActualizacion);
    }
  }

  cargarAlertas() {
    this.inventarioService.obtenerStockBajo()
      .then((data) => {
        this.listaAlertas = (data ?? []).map((p: any) => ({
          id: p.id,
          codigo: p.codigo,
          nombre: p.nombre,
          bodega: p.bodega || 'Sin bodega',
          stock: p.stock,
          stockMin: p.stock_min,
          estado: p.estado || 'Activo',
          accion: p.stock === 0 ? 'CRÍTICO' : 'ALERTA',
          entidad: p.bodega || 'Sin bodega',
          detalles: `Stock actual ${p.stock} un. (mínimo requerido ${p.stock_min} un.)`,
          jsonDetalle: p
        }));
      })
      .catch(() => {
        this.listaAlertas = [];
      });
  }

  get bodegasDisponibles(): string[] {
    return Array.from(new Set(this.listaAlertas.map(a => a.bodega))).sort();
  }

  get alertasFiltradas(): any[] {
    return this.listaAlertas.filter(item => {
      const cumpleFiltroAccion = this.filtroAccion === 'TODOS' || item.bodega === this.filtroAccion;
      const texto = this.filtroBusqueda.toLowerCase().trim();
      const cumpleBusqueda = !texto ||
        (item.codigo && item.codigo.toLowerCase().includes(texto)) ||
        (item.nombre && item.nombre.toLowerCase().includes(texto)) ||
        (item.bodega && item.bodega.toLowerCase().includes(texto));

      return cumpleFiltroAccion && cumpleBusqueda;
    });
  }

  contarCriticos(): number {
    return this.listaAlertas.filter(i => i.accion === 'CRÍTICO').length;
  }

  limpiarFiltros() {
    this.filtroBusqueda = '';
    this.filtroAccion = 'TODOS';
  }

  exportarReporte() {
    const jsonStr = JSON.stringify(this.listaAlertas, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-alertas-stock-gestock-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  verDetalleAlerta(item: any) {
    this.alertaSeleccionada = item;
    document.body.style.overflow = 'hidden';
  }

  cerrarModalDetalle() {
    this.alertaSeleccionada = null;
    document.body.style.overflow = 'auto';
  }

  obtenerClaseAccion(accion: string): string {
    switch (accion) {
      case 'CRÍTICO': return 'badge-eliminar';
      case 'ALERTA': return 'badge-actualizar';
      default: return 'badge-default';
    }
  }
}