import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

interface Mantenimiento {
  id: number;
  equipo: string;
  tipo: string;
  fecha: string;
  estado: string;
}

interface MantenimientoBackend {
  id: number;
  equipo: string;
  tipo: string;
  fecha_programada: string;
  estado: string;
  descripcion?: string | null;
}

@Component({
  selector: 'app-programacion-mantenimiento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './programacion-mantenimiento.component.html',
  styleUrl: './programacion-mantenimiento.component.css',
})
export class ProgramacionMantenimientoComponent implements OnInit {

  private api = inject(ApiService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  // Modelo del formulario
  nuevoMantenimiento = {
    equipo: '',
    tipo: 'Preventivo',
    fecha: ''
  };

  // Programaciones cargadas desde la API
  programaciones: Mantenimiento[] = [];

  ngOnInit(): void {
    this.cargarProgramaciones();
  }

  cargarProgramaciones(): void {
    this.api.get<MantenimientoBackend[]>('/mantenimientos').then(
      (lista) => {
        this.programaciones = (lista || []).map((m) => ({
          id: m.id,
          equipo: m.equipo,
          tipo: m.tipo,
          fecha: m.fecha_programada ? String(m.fecha_programada).slice(0, 10) : '',
          estado: m.estado
        }));
        this.cdr.detectChanges();
      },
      () => {
        this.programaciones = [];
        this.cdr.detectChanges();
      }
    );
  }

  // Función para procesar el formulario
  guardarProgramacion(): void {
    if (!this.nuevoMantenimiento.equipo.trim() || !this.nuevoMantenimiento.fecha) {
      this.toast.mostrar('Por favor complete los campos obligatorios.', 'error');
      return;
    }

    this.api.post<MantenimientoBackend>('/mantenimientos', {
      equipo: this.nuevoMantenimiento.equipo.trim(),
      tipo: this.nuevoMantenimiento.tipo,
      fecha_programada: this.nuevoMantenimiento.fecha
    }).then(
      () => {
        this.toast.mostrar('Mantenimiento programado correctamente.', 'success', 'Mantenimiento');
        this.nuevoMantenimiento = {
          equipo: '',
          tipo: 'Preventivo',
          fecha: ''
        };
        this.cargarProgramaciones();
        this.cdr.detectChanges();
      },
      () => {
        // El interceptor muestra el toast de error automáticamente.
      }
    );
  }
}