import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

interface AuditoriaRow {
  id: number;
  usuario_id: number | null;
  usuario_nombre: string | null;
  accion: string;
  modulo: string;
  entidad: string | null;
  registro_id: string | null;
  descripcion: string;
  fecha: string;
}

interface AuditoriaVista extends AuditoriaRow {
  fechaHora: string;
  estado: string;
}

@Component({
  selector: 'app-auditorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditorias.html',
  styleUrls: ['./auditorias.css']
})
export class AuditoriasComponent implements OnInit {
  private api: ApiService | null;
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    try {
      this.api = inject(ApiService);
    } catch {
      this.api = null;
    }
  }

  listaAuditorias: AuditoriaVista[] = [];
  auditoriaSeleccionada: AuditoriaVista | null = null;
  filtroAccion: string = 'TODOS';
  filtroBusqueda: string = '';

  ngOnInit(): void {
    this.cargarAuditorias();
  }

  cargarAuditorias(): void {
    if (!this.api) {
      return;
    }
    this.api.get<{ auditorias: AuditoriaRow[]; modulos: string[] }>('/auditorias').then(
      (respuesta) => {
        const filas = respuesta?.auditorias ?? [];
        this.listaAuditorias = filas.map((fila) => this.aVista(fila));
        this.cdr.detectChanges();
      },
      () => {
        this.listaAuditorias = [];
        this.cdr.detectChanges();
      }
    );
  }

  private aVista(fila: AuditoriaRow): AuditoriaVista {
    return {
      ...fila,
      fechaHora: this.formatearFecha(fila.fecha),
      estado: 'Completado'
    };
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) {
      return '';
    }
    const d = new Date(fecha);
    if (isNaN(d.getTime())) {
      return String(fecha);
    }
    return d.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get auditoriasFiltradas(): AuditoriaVista[] {
    const texto = this.filtroBusqueda.toLowerCase().trim();
    return this.listaAuditorias.filter((item) => {
      const cumpleFiltroAccion = this.filtroAccion === 'TODOS' || item.accion === this.filtroAccion;
      const cumpleBusqueda =
        !texto ||
        (item.usuario_nombre !== null && item.usuario_nombre.toLowerCase().includes(texto)) ||
        (item.entidad !== null && item.entidad.toLowerCase().includes(texto)) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(texto));

      return cumpleFiltroAccion && cumpleBusqueda;
    });
  }

  contarExitosas(): number {
    return this.listaAuditorias.filter((i) => i.estado === 'Completado').length;
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroAccion = 'TODOS';
  }

  exportarReporte(): void {
    const jsonStr = JSON.stringify(this.listaAuditorias, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-auditoria-gestock-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.mostrar('¡Reporte de auditoría exportado exitosamente!', 'success', 'Exportación completada');
  }

  verDetalleAuditoria(item: AuditoriaVista): void {
    this.auditoriaSeleccionada = item;
    document.body.style.overflow = 'hidden';
  }

  cerrarModalDetalle(): void {
    this.auditoriaSeleccionada = null;
    document.body.style.overflow = 'auto';
  }

  obtenerClaseAccion(accion: string): string {
    switch (accion) {
      case 'CREAR':
      case 'ACTIVAR':
        return 'badge-crear';
      case 'ACTUALIZAR':
      case 'AUTORIZAR':
        return 'badge-actualizar';
      case 'ELIMINAR':
      case 'DESACTIVAR':
        return 'badge-eliminar';
      default:
        return 'badge-default';
    }
  }
}