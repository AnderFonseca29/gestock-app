import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth';

export interface Empresa {
  id: string;
  nombre: string;
  email: string;
  moneda: string;
  formatoFecha: string;
  bodegasActivas: number;
  totalPrecios: number;
  valorInventario: number;
  alertasStock: number;
  activa?: boolean;
}

export interface ResumenDashboard {
  totalProductos: number;
  valorTotalInventario: number;
  alertasStock: number;
  totalBodegas?: number;
  totalUsuariosActivos?: number;
  totalEmpresasActivas?: number;
  incidenciasPendientes?: number;
  mantenimientosPendientes?: number;
  totalAuditorias?: number;
  ocurrencias?: { totalEntradas: number; totalSalidas: number };
}

export interface EmpresaBackend {
  id: number;
  nombre: string;
  nit: string;
  correo: string;
  telefono: string | null;
  direccion: string | null;
  estado: string;
  moneda: string;
  formato_fecha: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  private _empresas = new BehaviorSubject<Empresa[]>([]);
  empresas$ = this._empresas.asObservable();

  private _empresaActual = new BehaviorSubject<Empresa | null>(null);
  empresaActual$ = this._empresaActual.asObservable();

  private resumen: ResumenDashboard | null = null;
  private cargando = false;

  async cargarDatos(): Promise<void> {
    if (this.cargando) return;
    this.cargando = true;
    try {
      const puedeVerEmpresas = this.authService.tienePermiso('empresas.view');

      const [empresas, resumen] = await Promise.all([
        puedeVerEmpresas
          ? this.apiService.get<EmpresaBackend[]>('/empresas').catch(() => [] as EmpresaBackend[])
          : Promise.resolve([] as EmpresaBackend[]),
        this.apiService.get<ResumenDashboard>('/dashboard/resumen').catch(() => null),
      ]);

      this.resumen = resumen ?? null;
      const mapeadas = (empresas ?? []).map((e) => this.mapearEmpresa(e));
      this._empresas.next(mapeadas);

      const idGuardada =
        typeof localStorage !== 'undefined' ? localStorage.getItem('empresaIdSeleccionada') : null;
      const seleccionada =
        (idGuardada && mapeadas.find((e) => e.id === idGuardada)) || mapeadas[0] || null;

      this._empresaActual.next(
        seleccionada
          ? this.aplicarStats(seleccionada)
          : this.crearEmpresaDesdeResumen()
      );
    } catch {
      this.resumen = null;
      this._empresas.next([]);
      this._empresaActual.next(null);
    } finally {
      this.cargando = false;
    }
  }

  cambiarEmpresaActiva(empresa: Empresa): void {
    this._empresaActual.next(this.aplicarStats(empresa));
  }

  seleccionarEmpresaPorId(id: string): void {
    const encontrada = this._empresas.value.find((e) => e.id === id);
    if (encontrada) {
      this.cambiarEmpresaActiva(encontrada);
    } else {
      void this.cargarDatos();
    }
  }

  private mapearEmpresa(e: EmpresaBackend): Empresa {
    return {
      id: String(e.id),
      nombre: e.nombre,
      email: e.correo,
      moneda: e.moneda,
      formatoFecha: e.formato_fecha,
      bodegasActivas: 0,
      totalPrecios: 0,
      valorInventario: 0,
      alertasStock: 0,
      activa: e.estado === 'Activa'
    };
  }

  private aplicarStats(empresa: Empresa): Empresa {
    const r = this.resumen;
    if (!r) return empresa;
    return {
      ...empresa,
      bodegasActivas: Number(r.totalBodegas ?? 0),
      totalPrecios: Number(r.totalProductos ?? 0),
      valorInventario: Number(r.valorTotalInventario ?? 0),
      alertasStock: Number(r.alertasStock ?? 0)
    };
  }

  private crearEmpresaDesdeResumen(): Empresa | null {
    const r = this.resumen;
    return {
      id: 'sistema',
      nombre: 'GESTOCK',
      email: '',
      moneda: '',
      formatoFecha: '',
      bodegasActivas: Number(r?.totalBodegas ?? 0),
      totalPrecios: Number(r?.totalProductos ?? 0),
      valorInventario: Number(r?.valorTotalInventario ?? 0),
      alertasStock: Number(r?.alertasStock ?? 0)
    };
  }
}