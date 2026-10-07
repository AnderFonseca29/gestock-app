import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticasService, Empresa } from '../../../services/estadisticas.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class PanelComponent implements OnInit, OnDestroy {
  private estadisticasService = inject(EstadisticasService);
  private cdr = inject(ChangeDetectorRef);
  private sub$!: Subscription;

  empresaActual: Empresa | null = null;
  mostrarMenuInventario: boolean = false;

  ngOnInit(): void {
    // Carga las empresas y el resumen real del dashboard desde la API
    void this.estadisticasService.cargarDatos();

    this.sub$ = this.estadisticasService.empresaActual$.subscribe((empresa) => {
      if (empresa) {
        this.empresaActual = empresa;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub$) {
      this.sub$.unsubscribe();
    }
  }

  toggleMenuInventario(event: Event) {
    event.stopPropagation();
    this.mostrarMenuInventario = !this.mostrarMenuInventario;
  }

  cerrarMenu() {
    this.mostrarMenuInventario = false;
  }
}