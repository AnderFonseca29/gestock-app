import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

interface IncidenciaItem {
  id: string;
  titulo: string;
  prioridad: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  descripcion: string;
  reportadoPor: string;
  estado: 'En Revisión' | 'Pendiente' | 'Resuelto';
  fecha: string;
}

interface IncidenciaBackend {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  reportado_por: number;
  reportado_por_nombre?: string | null;
  fecha: string;
}

const PRIORIDADES: IncidenciaItem['prioridad'][] = ['Baja', 'Media', 'Alta', 'Crítica'];
const ESTADOS: IncidenciaItem['estado'][] = ['En Revisión', 'Pendiente', 'Resuelto'];

@Component({
  selector: 'app-incidencias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-incidencias.component.html',
  styleUrls: ['./registro-incidencias.component.css']
})
export class IncidenciasComponent implements OnInit {

  private api = inject(ApiService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  listaIncidencias: IncidenciaItem[] = [];

  nuevaIncidencia: IncidenciaItem = {
    id: '',
    titulo: '',
    prioridad: 'Media',
    descripcion: '',
    reportadoPor: '',
    estado: 'En Revisión',
    fecha: ''
  };

  ngOnInit() {
    this.cargarIncidencias();
  }

  cargarIncidencias(): void {
    this.api.get<IncidenciaBackend[]>('/incidencias').then(
      (lista) => {
        this.listaIncidencias = (lista || []).map((i) => ({
          id: `#${i.id}`,
          titulo: i.titulo,
          prioridad: PRIORIDADES.includes(i.prioridad as IncidenciaItem['prioridad'])
            ? (i.prioridad as IncidenciaItem['prioridad'])
            : 'Media',
          descripcion: i.descripcion,
          reportadoPor: i.reportado_por_nombre || `Usuario #${i.reportado_por}`,
          estado: ESTADOS.includes(i.estado as IncidenciaItem['estado'])
            ? (i.estado as IncidenciaItem['estado'])
            : 'Pendiente',
          fecha: this.formatearFecha(i.fecha)
        }));
        this.cdr.detectChanges();
      },
      () => {
        this.listaIncidencias = [];
        this.cdr.detectChanges();
      }
    );
  }

  guardarIncidencia(): void {
    if (!this.nuevaIncidencia.titulo.trim() || !this.nuevaIncidencia.descripcion.trim()) {
      this.toast.mostrar('Por favor complete los campos obligatorios.', 'error');
      return;
    }

    this.api.post<IncidenciaBackend>('/incidencias', {
      titulo: this.nuevaIncidencia.titulo.trim(),
      descripcion: this.nuevaIncidencia.descripcion.trim(),
      prioridad: this.nuevaIncidencia.prioridad
    }).then(
      () => {
        this.toast.mostrar('Incidencia registrada correctamente.', 'success', 'Incidencia');
        this.nuevaIncidencia = {
          id: '',
          titulo: '',
          prioridad: 'Media',
          descripcion: '',
          reportadoPor: '',
          estado: 'En Revisión',
          fecha: ''
        };
        this.cargarIncidencias();
        this.cdr.detectChanges();
      },
      () => {
        // El interceptor muestra el toast de error automáticamente.
        this.cdr.detectChanges();
      }
    );
  }

  private formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    if (Number.isNaN(fechaObj.getTime())) return String(fecha);
    const dia = fechaObj.toISOString().slice(0, 10);
    const hora = fechaObj.toTimeString().slice(0, 5);
    return `${dia} ${hora}`;
  }
}