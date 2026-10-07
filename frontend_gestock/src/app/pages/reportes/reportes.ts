import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ApiService } from '../../services/api.service';
import { 
  KpiResumen, 
  CategoriaReporte, 
  ProductoMovimiento, 
  MovimientosResumen,
  BodegaReporte 
} from '../../models/reportes';

interface ReporteInventarioRow {
  categoria: string;
  cantidad: string | number;
  valor: string | number;
}

interface ReporteMovimientoRow {
  fecha: string;
  tipo: string;
  total: string | number;
  cantidad: string | number;
}

interface MovimientoListado {
  id: number;
  tipo: string;
  cantidad: number;
  sku?: string | null;
  producto?: string | null;
}

interface ProductoReporte {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  costo: number;
  stock: number;
  stock_min: number;
  estado: string;
  categoria?: string | null;
  bodega?: string | null;
}

interface BodegaBackend {
  id: number;
  nombre: string;
  codigo: string;
  ciudad: string | null;
  direccion: string | null;
  responsable: string | null;
  telefono: string | null;
  capacidad: number;
  ocupado: number;
  activa: boolean;
}

interface BodegaAgregada {
  id: number;
  nombre: string;
  ubicacion: string;
  estado: 'Activa' | 'Inactiva';
  responsable: string;
  direccion: string;
  capacidad: number;
  ocupado: number;
  cantidad: number;
  valor: number;
  top: { nombre: string; stock: number; valor: number }[];
}

const PALETA_COLORES = ['#007bff', '#ffc107', '#28a745', '#dc3545', '#9c27b0', '#17a2b8', '#fd7e14', '#6f42c1'];

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css']
})
export class ReportesComponent implements OnInit {
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  tabActiva: 'inventarios' | 'movimientos' | 'bodega' = 'inventarios';

  // Control de interfaz
  bodegaExpandidaId: number | null = null;
  mostrarModalConfirmacion: boolean = false;

  // Datos (cargados desde la API)
  kpis: KpiResumen = {
    valorTotal: 0,
    costeTotal: 0,
    margenGanancia: 0,
    porcentajeMargen: 0
  };

  categorias: CategoriaReporte[] = [];

  movimientosKpi: MovimientosResumen = {
    totalEntradas: 0,
    totalSalidas: 0
  };

  productosMovimiento: ProductoMovimiento[] = [];

  bodegas: BodegaReporte[] = [];

  ngOnInit(): void {
    this.cargarInventario();
    this.cargarMovimientos();
    this.cargarBodegas();
  }

  cambiarTab(tab: 'inventarios' | 'movimientos' | 'bodega'): void {
    this.tabActiva = tab;
  }

  toggleDetalleBodega(id: number): void {
    this.bodegaExpandidaId = this.bodegaExpandidaId === id ? null : id;
  }

  // --- CARGA DE DATOS DESDE LA API ---
  cargarInventario(): void {
    this.api.get<ReporteInventarioRow[]>('/reportes/inventario').then(
      (filas) => {
        const lista = filas || [];
        const totalValor = lista.reduce((acc, r) => acc + Number(r.valor), 0);
        this.categorias = lista.map((r, idx) => ({
          nombre: r.categoria,
          cantidadProductos: Number(r.cantidad),
          totalValor: Number(r.valor),
          porcentaje: totalValor > 0 ? Math.round((Number(r.valor) / totalValor) * 1000) / 10 : 0,
          colorHex: PALETA_COLORES[idx % PALETA_COLORES.length]
        }));
        this.cdr.detectChanges();
      },
      () => {
        this.categorias = [];
        this.cdr.detectChanges();
      }
    );

    this.api.get<ProductoReporte[]>('/productos').then(
      (productos) => {
        const activos = (productos || []).filter((p) => p.estado === 'Activo');
        const valorTotal = activos.reduce((acc, p) => acc + Number(p.precio) * Number(p.stock), 0);
        const costeTotal = activos.reduce((acc, p) => acc + Number(p.costo || p.precio) * Number(p.stock), 0);
        const margenGanancia = valorTotal - costeTotal;
        this.kpis = {
          valorTotal,
          costeTotal,
          margenGanancia,
          porcentajeMargen: valorTotal > 0 ? Math.round((margenGanancia / valorTotal) * 1000) / 10 : 0
        };
        this.cdr.detectChanges();
      },
      () => {
        const totalValor = this.categorias.reduce((acc, c) => acc + c.totalValor, 0);
        this.kpis = { valorTotal: totalValor, costeTotal: totalValor, margenGanancia: 0, porcentajeMargen: 0 };
        this.cdr.detectChanges();
      }
    );
  }

  cargarMovimientos(): void {
    this.api.get<ReporteMovimientoRow[]>('/reportes/movimientos').then(
      (filas) => {
        const lista = filas || [];
        this.movimientosKpi = {
          totalEntradas: lista.filter((r) => r.tipo === 'ENTRADA').reduce((acc, r) => acc + Number(r.cantidad), 0),
          totalSalidas: lista.filter((r) => r.tipo === 'SALIDA').reduce((acc, r) => acc + Number(r.cantidad), 0)
        };
        this.cdr.detectChanges();
      },
      () => {
        this.movimientosKpi = { totalEntradas: 0, totalSalidas: 0 };
        this.cdr.detectChanges();
      }
    );

    this.api.get<any>('/movimientos').then(
      (resp) => {
        const lista = (Array.isArray(resp) ? resp : resp?.movimientos) || [];
        const mapa = new Map<string, { nombre: string; sku: string; entradas: number; salidas: number }>();
        lista.forEach((m: any) => {
          const clave = m.producto || m.sku || `Movimiento #${m.id}`;
          const registro = mapa.get(clave) || {
            nombre: m.producto || m.sku || clave,
            sku: m.sku || '',
            entradas: 0,
            salidas: 0
          };
          if (m.tipo === 'ENTRADA') {
            registro.entradas += Number(m.cantidad);
          } else if (m.tipo === 'SALIDA') {
            registro.salidas += Number(m.cantidad);
          }
          mapa.set(clave, registro);
        });

        this.productosMovimiento = Array.from(mapa.values())
          .map((m) => ({ nombre: m.nombre, sku: m.sku, entradas: m.entradas, salidas: m.salidas, balance: m.entradas - m.salidas }))
          .filter((m) => m.entradas !== 0 || m.salidas !== 0)
          .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
          .slice(0, 10);
        this.cdr.detectChanges();
      },
      () => {
        this.productosMovimiento = [];
        this.cdr.detectChanges();
      }
    );
  }

  cargarBodegas(): void {
    this.api.get<BodegaBackend[]>('/bodegas').then(
      (bodegas) => {
        const listaBodegas: BodegaAgregada[] = (bodegas || []).map((b) => ({
          id: b.id,
          nombre: b.nombre,
          ubicacion: b.ciudad || '',
          estado: (b.activa ? 'Activa' : 'Inactiva') as 'Activa' | 'Inactiva',
          responsable: b.responsable || '',
          direccion: b.direccion || '',
          capacidad: b.capacidad,
          ocupado: Number(b.ocupado),
          cantidad: 0,
          valor: 0,
          top: []
        }));
        this.cdr.detectChanges();

        this.api.get<ProductoReporte[]>('/productos').then(
          (productos) => {
            const nombreAId = new Map<string, number>(listaBodegas.map((bg) => [bg.nombre, bg.id]));

            (productos || []).forEach((p) => {
              const idBodega = p.bodega ? nombreAId.get(p.bodega) ?? null : null;
              if (idBodega === null) return;
              const bg = listaBodegas.find((x) => x.id === idBodega);
              if (!bg) return;
              bg.cantidad += 1;
              const valor = Number(p.precio) * Number(p.stock);
              bg.valor += valor;
              bg.top.push({ nombre: p.nombre, stock: Number(p.stock), valor });
            });

            const totalGlobal = listaBodegas.reduce((acc, bg) => acc + bg.valor, 0);
            this.bodegas = listaBodegas.map((bg) => ({
              id: bg.id,
              nombre: bg.nombre,
              ubicacion: bg.ubicacion,
              estado: bg.estado,
              cantidadProductos: bg.cantidad,
              valorTotal: bg.valor,
              porcentajeValorTotal: totalGlobal > 0 ? Math.round((bg.valor / totalGlobal) * 1000) / 10 : 0,
              responsable: bg.responsable,
              direccion: bg.direccion,
              capacidadOcupada: bg.capacidad > 0 ? Math.round((bg.ocupado / bg.capacidad) * 100) : 0,
              topProductos: bg.top.sort((a, b) => b.stock - a.stock).slice(0, 3)
            }));
            this.cdr.detectChanges();
          },
          () => {
            this.bodegas = [];
            this.cdr.detectChanges();
          }
        );
      },
      () => {
        this.bodegas = [];
        this.cdr.detectChanges();
      }
    );
  }

  // --- LÓGICA DEL MODAL Y EXPORTACIÓN ---
  abrirModalConfirmacion(): void {
    this.mostrarModalConfirmacion = true;
  }

  cerrarModalConfirmacion(): void {
    this.mostrarModalConfirmacion = false;
  }

  confirmarYDescargarPDF(): void {
    this.cerrarModalConfirmacion();
    this.generarPDFReporte();
  }

  private generarPDFReporte(): void {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-ES');

    // Encabezado
    doc.setFillColor(19, 21, 39); // #131527
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('GESTOCK - Reporte de Inventario', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${fecha}`, 160, 18);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Reporte Activo: ${this.tabActiva.toUpperCase()}`, 14, 40);

    // Tabla de Bodegas / Contenido
    if (this.tabActiva === 'bodega') {
      const rows: (string | number)[][] = [];
      this.bodegas.forEach(b => {
        rows.push([
          b.nombre,
          b.ubicacion || 'N/A',
          b.responsable || 'N/A',
          `${b.cantidadProductos} unds`,
          `$${b.valorTotal.toLocaleString()}`,
          `${b.capacidadOcupada || 0}%`
        ]);
      });

      autoTable(doc, {
        startY: 48,
        head: [['Bodega', 'Ubicación', 'Responsable', 'Productos', 'Valor Total', 'Ocupación']],
        body: rows,
        headStyles: { fillColor: [58, 134, 255] },
        theme: 'grid'
      });
    } else if (this.tabActiva === 'inventarios') {
      const rows = this.categorias.map(c => [
        c.nombre,
        `${c.cantidadProductos} productos`,
        `$${c.totalValor.toLocaleString()}`,
        `${c.porcentaje}%`
      ]);

      autoTable(doc, {
        startY: 48,
        head: [['Categoría', 'Cantidad', 'Valor Total', 'Porcentaje']],
        body: rows,
        headStyles: { fillColor: [58, 134, 255] },
        theme: 'grid'
      });
    } else {
      const rows = this.productosMovimiento.map(p => [
        p.nombre,
        p.sku,
        p.entradas,
        p.salidas,
        p.balance
      ]);

      autoTable(doc, {
        startY: 48,
        head: [['Producto', 'SKU', 'Entradas', 'Salidas', 'Balance']],
        body: rows,
        headStyles: { fillColor: [58, 134, 255] },
        theme: 'grid'
      });
    }

    // Pie de página
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount} - Generado automáticamente por Gestock`, 14, 285);
    }

    doc.save(`Gestock_Reporte_${this.tabActiva}_${Date.now()}.pdf`);
  }
}