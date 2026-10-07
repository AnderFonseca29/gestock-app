import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { InventarioService } from '../services/services';
import { ToastService } from '../../../../services/toast.service';

interface Categoria {
  id: number;
  nombre: string;
  estado: string;
}

interface Bodega {
  id: number;
  nombre: string;
  activa: boolean;
}

@Component({
  selector: 'app-registrar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registrar-productos.html',
  styleUrls: ['./registrar-productos.css']
})
export class RegistrarProductosComponent implements OnInit {
  private inventarioService = inject(InventarioService);
  private toastService = inject(ToastService);

  categorias = signal<Categoria[]>([]);
  bodegas = signal<Bodega[]>([]);
  bodegasCargadas = signal(false);

  categoriasActivas = computed(() => this.categorias().filter(c => c.estado === 'Activo'));

  bodegasActivas = computed(() => this.bodegas().filter(b => b.activa));

  mensajeExito = signal<string | null>(null);

  producto = signal({
    codigo: '',
    nombre: '',
    categoria: '',
    bodega: '',
    precio: null as number | null,
    stock: null as number | null
  });

  ngOnInit() {
    this.cargarCategorias();
    this.cargarBodegas();
  }

  private cargarCategorias() {
    this.inventarioService.obtenerCategorias()
      .then((data) => {
        const lista = (data ?? []) as any[];
        this.categorias.set(
          lista
            .map(c => ({ id: c.id, nombre: c.nombre, estado: c.estado }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
        );
      })
      .catch((err) => this.mostrarError(err, 'No se pudieron cargar las categorías.'));
  }

  private cargarBodegas() {
    this.inventarioService.obtenerBodegas()
      .then((data) => {
        const lista = (data ?? []) as any[];
        this.bodegas.set(lista.map(b => ({ id: b.id, nombre: b.nombre, activa: b.activa === true })));
      })
      .catch((err) => this.mostrarError(err, 'No se pudieron cargar las bodegas.'))
      .finally(() => this.bodegasCargadas.set(true));
  }

  registrarProducto(form: NgForm) {
    if (!form.valid) {
      this.toastService.mostrar('Complete todos los campos obligatorios antes de guardar.', 'error', 'Formulario incompleto');
      return;
    }

    const valores = this.producto();
    const categoriaId = this.categoriasActivas().find(c => c.nombre === valores.categoria)?.id ?? null;
    const bodegaId = this.bodegas().find(b => b.nombre === valores.bodega)?.id ?? null;

    if (categoriaId == null || bodegaId == null) {
      this.toastService.mostrar('Seleccione una categoría y una bodega válidas.', 'error', 'Datos inválidos');
      return;
    }

    const nuevoProductoData = {
      codigo: valores.codigo.trim(),
      nombre: valores.nombre.trim(),
      categoriaId,
      bodegaId,
      precio: Number(valores.precio),
      stock: Number(valores.stock)
    };

    this.inventarioService.crearProducto(nuevoProductoData)
      .then(() => {
        this.mensajeExito.set('Producto registrado correctamente y visible en el listado.');
        this.toastService.mostrar('Producto registrado correctamente.', 'success', 'Producto registrado');
        form.resetForm();
        this.producto.set({
          codigo: '',
          nombre: '',
          categoria: '',
          bodega: '',
          precio: null,
          stock: null
        });
        setTimeout(() => this.mensajeExito.set(null), 3500);
      })
      .catch((err) => this.mostrarError(err, 'No se pudo registrar el producto.'));
  }

  private mostrarError(err: any, fallback: string) {
    this.toastService.mostrar(err?.error?.message || fallback, 'error', 'Error');
  }
}