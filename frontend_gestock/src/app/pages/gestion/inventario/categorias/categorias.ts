import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { InventarioService } from '../services/services';
import { ToastService } from '../../../../services/toast.service';
import { AuthService } from '../../../../services/auth';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
}

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias.html',
  styleUrls: ['./categorias.css']
})
export class CategoriasComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  categorias = signal<Categoria[]>([]);
  mostrarModal = signal(false);
  editandoId = signal<number | null>(null);
  formCategoria = { nombre: '', descripcion: '' };
  private togglingIds = new Set<number>();

  get puedeCrear(): boolean {
    return this.authService.tienePermiso('categorias.create');
  }

  get puedeEditar(): boolean {
    return this.authService.tienePermiso('categorias.edit');
  }

  get puedeEliminar(): boolean {
    return this.authService.tienePermiso('categorias.delete');
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.inventarioService.obtenerCategorias()
      .then((data) => this.categorias.set((data ?? []).sort((a, b) => a.nombre.localeCompare(b.nombre))))
      .catch(() => this.categorias.set([]));
  }

  abrirCrear() {
    this.editandoId.set(null);
    this.formCategoria = { nombre: '', descripcion: '' };
    this.mostrarModal.set(true);
  }

  abrirEditar(cat: Categoria) {
    this.editandoId.set(cat.id);
    this.formCategoria = { nombre: cat.nombre, descripcion: cat.descripcion || '' };
    this.mostrarModal.set(true);
  }

  guardar(form: NgForm) {
    if (!form.valid) return;

    const id = this.editandoId();
    const payload = {
      nombre: this.formCategoria.nombre.trim(),
      descripcion: this.formCategoria.descripcion.trim() || null
    };

    const accion = id == null
      ? this.inventarioService.crearCategoria(payload)
      : this.inventarioService.actualizarCategoria(id, payload);

    accion
      .then(() => {
        this.toastService.mostrar(
          id == null ? 'Categoría creada correctamente.' : 'Categoría actualizada correctamente.',
          'success',
          id == null ? 'Categoría creada' : 'Categoría actualizada'
        );
        this.mostrarModal.set(false);
        form.resetForm();
        this.cargarCategorias();
      })
      .catch((err: any) => {
        this.toastService.mostrar(err?.error?.message || 'No se pudo guardar la categoría.', 'error', 'Error');
      });
  }

  toggleEstado(cat: Categoria) {
    if (!this.puedeEditar || this.togglingIds.has(cat.id)) return;
    this.togglingIds.add(cat.id);

    const nuevoEstado = cat.estado === 'Activo' ? 'Inactivo' : 'Activo';

    this.categorias.update(lista =>
      lista.map(c => c.id === cat.id ? { ...c, estado: nuevoEstado } : c)
    );

    this.inventarioService.actualizarCategoria(cat.id, { estado: nuevoEstado })
      .then((actualizada) => {
        this.togglingIds.delete(cat.id);
        this.categorias.update(lista =>
          lista.map(c => c.id === cat.id ? { ...c, estado: actualizada.estado } : c)
        );
        this.toastService.mostrar('Estado de la categoría actualizado correctamente.', 'success', 'Categoría actualizada');
      })
      .catch((err: any) => {
        this.togglingIds.delete(cat.id);
        this.categorias.update(lista =>
          lista.map(c => c.id === cat.id ? { ...c, estado: cat.estado } : c)
        );
        this.toastService.mostrar(err?.error?.message || 'No se pudo cambiar el estado de la categoría.', 'error', 'Error');
      });
  }

  eliminar(cat: Categoria) {
    if (!this.puedeEliminar) return;
    if (!confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;

    this.inventarioService.eliminarCategoria(cat.id)
      .then(() => {
        this.categorias.update(lista => lista.filter(c => c.id !== cat.id));
        this.toastService.mostrar('Categoría eliminada correctamente.', 'success', 'Categoría eliminada');
      })
      .catch((err: any) => {
        this.toastService.mostrar(err?.error?.message || 'No se pudo eliminar la categoría.', 'error', 'Error');
      });
  }
}