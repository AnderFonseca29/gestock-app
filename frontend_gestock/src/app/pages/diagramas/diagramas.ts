import { Component, HostListener, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Diagrama, DiagramasService } from '../../services/diagramas.service';

interface GrupoDiagramas {
  categoria: string;
  diagramas: Diagrama[];
}

const ORDEN_CATEGORIAS = ['Generales', 'Controladores', 'Ciclo y Respuesta', 'Servidor y Acceso', 'Frontend'];

@Component({
  selector: 'app-diagramas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './diagramas.html',
  styleUrls: ['./diagramas.css']
})
export class DiagramasComponent implements OnInit {
  private diagramasService = inject(DiagramasService);

  cargando = signal(true);
  filtroBusqueda = '';
  diagramas = signal<Diagrama[]>([]);
  urls = signal<Record<number, string>>({});
  seleccionado = signal<Diagrama | null>(null);
  zoom = signal(1);

  grupos = computed<GrupoDiagramas[]>(() => {
    const lista = this.diagramas();
    const texto = this.filtroBusqueda.trim().toLowerCase();
    const filtrada = texto
      ? lista.filter(
          (d) =>
            d.titulo.toLowerCase().includes(texto) ||
            d.categoria.toLowerCase().includes(texto) ||
            d.descripcion.toLowerCase().includes(texto) ||
            String(d.numero).includes(texto)
        )
      : lista;

    const mapa = new Map<string, Diagrama[]>();
    for (const d of filtrada) {
      if (!mapa.has(d.categoria)) {
        mapa.set(d.categoria, []);
      }
      mapa.get(d.categoria)!.push(d);
    }

    return [...mapa.entries()]
      .sort((a, b) => {
        const ia = ORDEN_CATEGORIAS.indexOf(a[0]);
        const ib = ORDEN_CATEGORIAS.indexOf(b[0]);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
      .map(([categoria, diagramas]) => ({ categoria, diagramas }));
  });

  get indiceActual(): number {
    const sel = this.seleccionado();
    if (!sel) return 0;
    const i = this.diagramas().findIndex((d) => d.id === sel.id);
    return i === -1 ? 0 : i;
  }

  get totalDiagramas(): number {
    return this.diagramas().length;
  }

  get urlSeleccionado(): string | undefined {
    const sel = this.seleccionado();
    return sel ? this.urls()[sel.id] : undefined;
  }

  ngOnInit(): void {
    this.cargarDiagramas();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.seleccionado()) {
      this.cerrar();
    }
  }

  ngOnDestroy(): void {
    for (const url of Object.values(this.urls())) {
      this.diagramasService.revocarImagen(url);
    }
  }

  cargarDiagramas(): void {
    this.cargando.set(true);
    this.diagramasService
      .listar()
      .then((lista) => {
        const ordenados = [...(lista ?? [])].sort((a, b) => a.numero - b.numero);
        this.diagramas.set(ordenados);
        this.cargarImagenes(ordenados);
      })
      .catch(() => this.diagramas.set([]))
      .finally(() => this.cargando.set(false));
  }

  private cargarImagenes(lista: Diagrama[]): void {
    for (const d of lista) {
      if (this.urls()[d.id]) {
        continue;
      }
      this.diagramasService
        .obtenerImagen(d.id)
        .then((url) => this.urls.set({ ...this.urls(), [d.id]: url }))
        .catch(() => undefined);
    }
  }

  urlPara(id: number): string | undefined {
    return this.urls()[id];
  }

  abrir(d: Diagrama): void {
    this.seleccionado.set(d);
    this.zoom.set(1);
  }

  cerrar(): void {
    this.seleccionado.set(null);
    this.zoom.set(1);
  }

  irAnterior(): void {
    const sel = this.seleccionado();
    if (!sel) return;
    const lista = this.diagramas();
    const i = lista.findIndex((d) => d.id === sel.id);
    this.abrir(i <= 0 ? lista[lista.length - 1] : lista[i - 1]);
  }

  irSiguiente(): void {
    const sel = this.seleccionado();
    if (!sel) return;
    const lista = this.diagramas();
    const i = lista.findIndex((d) => d.id === sel.id);
    this.abrir(lista[(i + 1) % lista.length]);
  }

  aumentarZoom(): void {
    this.zoom.set(Math.min(3, this.zoom() + 0.25));
  }

  reducirZoom(): void {
    this.zoom.set(Math.max(0.4, this.zoom() - 0.25));
  }

  restablecerZoom(): void {
    this.zoom.set(1);
  }
}