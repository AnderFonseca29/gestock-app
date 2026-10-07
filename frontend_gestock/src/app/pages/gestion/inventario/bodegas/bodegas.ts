import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { InventarioService } from '../services/services';
import { ToastService } from '../../../../services/toast.service';
import { AuthService } from '../../../../services/auth';

interface ProductoBodega {
  id: string;
  nombre: string;
  sku: string;
  categoria: string;
  cantidad: number;
}

interface Bodega {
  id: number;
  nombre: string;
  codigo: string;
  ciudad: string;
  direccion: string;
  responsable: string;
  telefono: string;
  capacidad: number;
  ocupado: number;
  activa: boolean;
  icono: string;
  productos?: ProductoBodega[];
}

const ICONOS = ['fas fa-building', 'fas fa-industry', 'fas fa-boxes-stacked', 'fas fa-store', 'fas fa-anchor', 'fas fa-tractor', 'fas fa-ship', 'fas fa-industry', 'fas fa-boxes-stacked', 'fas fa-building'];

@Component({
  selector: 'app-bodegas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bodegas.html',
  styleUrls: ['./bodegas.css']
})
export class BodegasComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  mostrarModal = signal(false);
  mostrarModalDetalle = signal(false);
  bodegaSeleccionada = signal<Bodega | null>(null);

  // Objeto vinculado al formulario de nueva bodega
  nuevaBodega = {
    nombre: '',
    codigo: '',
    ciudad: '',
    direccion: '',
    responsable: '',
    telefono: '',
    capacidad: 0
  };

  bodegas = signal<Bodega[]>([]);
  private togglingIds = new Set<number>();

  tienePermiso(codigo: string): boolean {
    return this.authService.tienePermiso(codigo);
  }

  ngOnInit() {
    this.cargarBodegas();
  }

  cargarBodegas() {
    this.inventarioService.obtenerBodegas()
      .then((data) => {
        const lista = (data ?? []).map((b: any, indice: number) => this.mapearBodega(b, indice));
        this.bodegas.set(lista);
      })
      .catch(() => {
        this.bodegas.set([]);
      });
  }

  private mapearBodega(b: any, indice: number): Bodega {
    return {
      id: b.id,
      nombre: b.nombre,
      codigo: b.codigo,
      ciudad: b.ciudad || '',
      direccion: b.direccion || '',
      responsable: b.responsable || '',
      telefono: b.telefono || '',
      capacidad: b.capacidad ?? 0,
      ocupado: b.ocupado ?? 0,
      activa: !!b.activa,
      icono: ICONOS[indice % ICONOS.length],
      productos: []
    };
  }

  // Método para crear una nueva bodega desde el formulario
  crearBodega(form: NgForm) {
    if (form.valid) {
      const payloadBodega = {
        nombre: this.nuevaBodega.nombre.trim(),
        codigo: this.nuevaBodega.codigo.trim(),
        ciudad: this.nuevaBodega.ciudad.trim() || null,
        direccion: this.nuevaBodega.direccion.trim() || null,
        responsable: this.nuevaBodega.responsable.trim() || null,
        telefono: this.nuevaBodega.telefono.trim() || null,
        capacidad: this.nuevaBodega.capacidad ? Number(this.nuevaBodega.capacidad) : undefined
      };

      this.inventarioService.crearBodega(payloadBodega)
        .then((bodega) => {
          this.bodegas.update(lista => [this.mapearBodega(bodega, lista.length), ...lista]);
          this.toastService.mostrar('Bodega creada correctamente.', 'success', 'Bodega creada');
          this.mostrarModal.set(false);
          form.resetForm();
          this.nuevaBodega = {
            nombre: '',
            codigo: '',
            ciudad: '',
            direccion: '',
            responsable: '',
            telefono: '',
            capacidad: 0
          };
        })
        .catch(() => {});
    }
  }

  // Método al hacer clic en una tarjeta
  verDetalleBodega(bodega: Bodega, event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.switch-container') || target.closest('input')) {
      return;
    }

    this.inventarioService.obtenerProductosPorBodega(bodega.id)
      .then((data) => {
        const productos = (data ?? []).map((p: any) => ({
          id: String(p.id),
          nombre: p.nombre,
          sku: p.codigo,
          categoria: p.categoria || 'Sin categoría',
          cantidad: p.stock
        }));
        this.bodegaSeleccionada.set({ ...bodega, productos });
        this.mostrarModalDetalle.set(true);
      })
      .catch(() => {
        this.bodegaSeleccionada.set({ ...bodega, productos: [] });
        this.mostrarModalDetalle.set(true);
      });
  }

  cerrarModalDetalle() {
    this.mostrarModalDetalle.set(false);
    this.bodegaSeleccionada.set(null);
  }

  getPorcentaje(ocupado: number, capacidad: number): number {
    if (!capacidad || capacidad === 0) return 0;
    return Math.round((ocupado / capacidad) * 100);
  }

  toggleEstado(id: number) {
    if (!this.tienePermiso('bodegas.edit')) return;
    const bodega = this.bodegas().find(b => b.id === id);
    if (!bodega || this.togglingIds.has(id)) return;
    this.togglingIds.add(id);

    const nuevoEstado = !bodega.activa;
    this.bodegas.update(lista =>
      lista.map(b => b.id === id ? { ...b, activa: nuevoEstado } : b)
    );

    this.inventarioService.toggleEstadoBodega(id, nuevoEstado)
      .then((actualizada) => {
        this.togglingIds.delete(id);
        this.bodegas.update(lista =>
          lista.map(b => b.id === id ? { ...b, activa: !!actualizada.activa } : b)
        );
        this.toastService.mostrar('Estado de la bodega actualizado correctamente.', 'success', 'Bodega actualizada');
      })
      .catch(() => {
        this.togglingIds.delete(id);
        this.bodegas.update(lista =>
          lista.map(b => b.id === id ? { ...b, activa: bodega.activa } : b)
        );
        this.toastService.mostrar('No se pudo actualizar el estado de la bodega.', 'error', 'Bodega actualizada');
      });
  }
}