import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../services/services';
import { ToastService } from '../../../../services/toast.service';
import { AuthService } from '../../../../services/auth';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-productos.html',
  styleUrls: ['./lista-productos.css']
})
export class ListaProductosComponent implements OnInit {

  private inventarioService = inject(InventarioService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  tienePermiso(codigo: string): boolean {
    return this.authService.tienePermiso(codigo);
  }

  private categorias: any[] = [];
  private bodegas: any[] = [];

  productosOriginales: any[] = [];
  filtroBusqueda: string = '';
  menuActivoIndex: number | null = null;
  productoEnEdicion: any = null;
  private productoOriginalSnapshot: any = null;

  mensajeNotificacion: string | null = null;
  mensajeAlertaModal: string | null = null;
  productoAEliminar: any = null;

  // Inyectamos ChangeDetectorRef para forzar el renderizado inmediato en pantalla
  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarProductos();
    if (this.tienePermiso('categorias.view')) {
      this.inventarioService.obtenerCategorias()
        .then((data) => { this.categorias = data ?? []; this.cdRef.detectChanges(); })
        .catch(() => { this.categorias = []; this.cdRef.detectChanges(); });
    }
    if (this.tienePermiso('bodegas.view')) {
      this.inventarioService.obtenerBodegas()
        .then((data) => { this.bodegas = data ?? []; this.cdRef.detectChanges(); })
        .catch(() => { this.bodegas = []; this.cdRef.detectChanges(); });
    }
  }

  cargarProductos() {
    this.inventarioService.obtenerProductos()
      .then((data) => {
        this.productosOriginales = data ?? [];
        this.cdRef.detectChanges();
      })
      .catch(() => {
        this.productosOriginales = [];
        this.cdRef.detectChanges();
      });
  }

  get categoriasDisponibles(): string[] {
    const activas = this.categorias
      .filter(c => c.estado === 'Activo')
      .map(c => c.nombre);
    if (this.productoEnEdicion?.categoria && !activas.includes(this.productoEnEdicion.categoria)) {
      return [...activas, this.productoEnEdicion.categoria].sort();
    }
    return activas.sort();
  }

  get bodegasDisponibles(): string[] {
    return this.bodegas.map(b => b.nombre).sort();
  }

  get productosFiltrados(): any[] {
    const lista = this.productosOriginales || [];
    if (!this.filtroBusqueda || !this.filtroBusqueda.trim()) {
      return lista;
    }
    const texto = this.filtroBusqueda.toLowerCase().trim();
    return lista.filter(p =>
      (p.nombre && p.nombre.toLowerCase().includes(texto)) ||
      (p.codigo && p.codigo.toLowerCase().includes(texto)) ||
      (p.categoria && p.categoria.toLowerCase().includes(texto)) ||
      (p.bodega && p.bodega.toLowerCase().includes(texto))
    );
  }

  abrirModalEditar(prod: any) {
    this.productoEnEdicion = { ...prod };
    this.productoOriginalSnapshot = { ...prod };
    this.mensajeAlertaModal = null;
    this.menuActivoIndex = null;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal() {
    this.productoEnEdicion = null;
    this.productoOriginalSnapshot = null;
    this.mensajeAlertaModal = null;
    document.body.style.overflow = 'auto';
  }

  guardarEdicion(form: any) {
    if (form.valid && this.productoEnEdicion) {
      const prod = this.productoEnEdicion;
      const precioNumerico = Number(prod.precio);
      const stockNumerico = Number(prod.stock);

      if (this.productoOriginalSnapshot && verificarSinCambios({
        codigo: prod.codigo,
        nombre: prod.nombre,
        categoria: prod.categoria,
        bodega: prod.bodega,
        precio: precioNumerico,
        stock: stockNumerico
      }, this.productoOriginalSnapshot)) {
        this.cerrarModal();
        this.mensajeAlertaModal = 'No se realizaron modificaciones en el producto.';
        return;
      }

      const categoriaId = this.categorias.find(c => c.nombre === prod.categoria)?.id ?? null;
      const bodegaId = this.bodegas.find(b => b.nombre === prod.bodega)?.id ?? null;

      const payload = {
        codigo: prod.codigo,
        nombre: prod.nombre,
        categoriaId,
        bodegaId,
        precio: precioNumerico,
        stock: stockNumerico
      };

      this.inventarioService.actualizarProducto(prod.id, payload)
        .then((actualizado) => {
          this.reemplazarProducto(prod.id, {
            ...actualizado,
            categoria: prod.categoria,
            bodega: prod.bodega
          });
          this.cerrarModal();
          this.toastService.mostrar('Producto actualizado exitosamente.', 'success', 'Producto actualizado');
          this.cdRef.detectChanges();
        })
        .catch(() => {
          this.cerrarModal();
          this.cdRef.detectChanges();
        });
    }
  }

  confirmarEliminacion(prod: any) {
    this.productoAEliminar = prod;
    this.menuActivoIndex = null;
    document.body.style.overflow = 'hidden';
  }

  cancelarEliminacion() {
    this.productoAEliminar = null;
    document.body.style.overflow = 'auto';
  }

  ejecutarEliminacion() {
    if (!this.productoAEliminar) return;

    const prod = this.productoAEliminar;
    this.inventarioService.eliminarProducto(prod.id)
      .then(() => {
        this.productosOriginales = this.productosOriginales.filter(p => p.id !== prod.id);
        this.productosOriginales = [...this.productosOriginales];
        this.productoAEliminar = null;
        document.body.style.overflow = 'auto';
        this.toastService.mostrar('Producto eliminado exitosamente.', 'success', 'Producto eliminado');
        this.cdRef.detectChanges();
      })
      .catch(() => {
        this.productoAEliminar = null;
        document.body.style.overflow = 'auto';
        this.cdRef.detectChanges();
      });
  }

  mostrarNotificacion(mensaje: string) {
    this.mensajeNotificacion = mensaje;
    this.cdRef.detectChanges(); // Fuerza a la vista a renderizar el mensaje al instante

    // Limpia la notificación después de 3.5 segundos
    setTimeout(() => {
      if (this.mensajeNotificacion === mensaje) {
        this.mensajeNotificacion = null;
        this.cdRef.detectChanges();
      }
    }, 3500);
  }

  private reemplazarProducto(id: number, actualizado: any) {
    const indexReal = this.productosOriginales.findIndex(p => p.id === id);
    if (indexReal !== -1) {
      this.productosOriginales[indexReal] = actualizado;
    }
    this.productosOriginales = [...this.productosOriginales];
  }
}

function verificarSinCambios(p1: any, p2: any): boolean {
  return (
    p1.nombre === p2.nombre &&
    p1.categoria === p2.categoria &&
    p1.bodega === p2.bodega &&
    p1.precio === p2.precio &&
    p1.stock === p2.stock
  );
}