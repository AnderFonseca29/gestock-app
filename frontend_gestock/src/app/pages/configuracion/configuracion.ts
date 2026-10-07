import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth';

function valorBooleano(valor: string | undefined, defecto: boolean): boolean {
  if (valor === undefined || valor === null || valor === '') return defecto;
  return valor === 'true' || valor === '1';
}

function valorNumero(valor: string | undefined, defecto: number): number {
  if (valor === undefined || valor === null || valor === '') return defecto;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : defecto;
}

export interface ConfiguracionGestock {
  notificacionesEmail: boolean;
  resumenSemanal: boolean;
  seguridadActiva: boolean;
  dosFactores: boolean;
  tiempoSesion: number;
  expiracionPassword: number;
  copiasSeguridad: boolean;
  backupAutomatico: boolean;
  frecuenciaBackup: 'diario' | 'semanal' | 'mensual' | 'anual';
}

export interface OpcionesExportacion {
  formato: 'json' | 'csv' | 'pdf';
  incluirNotificaciones: boolean;
  incluirSeguridad: boolean;
  incluirBackup: boolean;
}

// Estructura de datos para las incidencias y notificaciones
export interface NotificacionHistorial {
  id: string;
  tipo: 'incidencia' | 'envio' | 'stock' | 'resolved';
  titulo: string;
  descripcion: string;
  fecha: string;
  leida: boolean;
  icono: string;
}

// Estructura para las sesiones activas de seguridad
export interface SesionActiva {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  current: boolean;
  timestamp: string;
}

// Estructura de sesión devuelta por el backend
export interface SesionBackend {
  id: number;
  usuario_id: number;
  ip: string | null;
  user_agent: string | null;
  dispositivo: string | null;
  navegador: string | null;
  fecha_inicio: string;
  fecha_cierre: string | null;
  ultimo_acceso: string;
  estado: string;
  es_actual: boolean;
  usuario_nombre?: string;
  usuario_email?: string;
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class ConfiguracionComponent implements OnInit {
  tabActiva: 'notificaciones' | 'seguridad' | 'backup' | 'sesiones' = 'notificaciones';

  private authService = inject(AuthService);

  puedeEditar(): boolean {
    return this.authService.tienePermiso('configuracion.edit');
  }

  private cdr = inject(ChangeDetectorRef);
  
  // Control del Modal de Guardado
  mostrarModalGuardar: boolean = false;
  guardadoExitoso: boolean = false;

  // Control del Modal de Exportación
  mostrarModalExportar: boolean = false;

  // Control del Estado de Backup Manual
  cargandoBackup: boolean = false;
  mostrarModalBackupExitoso: boolean = false;
  ultimoBackupFecha: string | null = null;

  opcionesExportar: OpcionesExportacion = {
    formato: 'json',
    incluirNotificaciones: true,
    incluirSeguridad: true,
    incluirBackup: true
  };

  config: ConfiguracionGestock = {
    notificacionesEmail: true,
    resumenSemanal: false,
    seguridadActiva: true,
    dosFactores: true,
    tiempoSesion: 30,
    expiracionPassword: 90,
    copiasSeguridad: true,
    backupAutomatico: true,
    frecuenciaBackup: 'diario'
  };

  // Historial de incidencias y alertas del sistema
  historialNotificaciones: NotificacionHistorial[] = [
    {
      id: '1',
      tipo: 'incidencia',
      titulo: 'Incidencia en Envío #ENV-8842',
      descripcion: 'Retraso reportado en la zona de transferencia de pista por condiciones climáticas en Yopal.',
      fecha: '21/08/2026 - 02:30 PM',
      leida: false,
      icono: 'fas fa-triangle-exclamation'
    },
    {
      id: '2',
      tipo: 'envio',
      titulo: 'Despegue Confirmado',
      descripcion: 'El paquete con guía #ENV-9011 ha completado la fase de recolección e inició tránsito.',
      fecha: '21/08/2026 - 11:15 AM',
      leida: false,
      icono: 'fas fa-truck'
    },
    {
      id: '3',
      tipo: 'stock',
      titulo: 'Alerta de Stock Mínimo',
      descripcion: 'El producto SKU-4029 alcanzó el umbral mínimo en la Bodega Central.',
      fecha: '20/08/2026 - 09:45 AM',
      leida: true,
      icono: 'fas fa-boxes-stacked'
    },
    {
      id: '4',
      tipo: 'resolved',
      titulo: 'Incidencia Resuelta',
      descripcion: 'Se autorizó la sustitución de mercancía averiada para el envío #ENV-8700.',
      fecha: '19/08/2026 - 04:20 PM',
      leida: true,
      icono: 'fas fa-circle-check'
    }
  ];

  // Lista ampliada de sesiones activas con múltiples dispositivos y ubicaciones simuladas
  activeSessions: SesionActiva[] = [];

  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  constructor() {
    this.cargarSesionesActivas();
  }

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cambiarTab(tab: 'notificaciones' | 'seguridad' | 'backup' | 'sesiones'): void {
    this.tabActiva = tab;
  }

  // --- CONFIGURACIÓN DESDE EL BACKEND ---
  cargarConfiguracion(): void {
    this.apiService
      .get<Record<string, string>>('/configuracion')
      .then((datos) => {
        this.config = {
          notificacionesEmail: valorBooleano(datos['notificacionesEmail'], this.config.notificacionesEmail),
          resumenSemanal: valorBooleano(datos['resumenSemanal'], this.config.resumenSemanal),
          seguridadActiva: valorBooleano(datos['seguridadActiva'], this.config.seguridadActiva),
          dosFactores: valorBooleano(datos['dosFactores'], this.config.dosFactores),
          tiempoSesion: valorNumero(datos['tiempoSesion'], this.config.tiempoSesion),
          expiracionPassword: valorNumero(datos['expiracionPassword'], this.config.expiracionPassword),
          copiasSeguridad: valorBooleano(datos['copiasSeguridad'], this.config.copiasSeguridad),
          backupAutomatico: valorBooleano(datos['backupAutomatico'], this.config.backupAutomatico),
          frecuenciaBackup: (datos['frecuenciaBackup'] as ConfiguracionGestock['frecuenciaBackup']) || this.config.frecuenciaBackup
        };
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.toastService.mostrar('No se pudo cargar la configuración del sistema.', 'error', 'Configuración');
      });
  }

  // --- MÉTODOS DE SESIONES ACTIVAS ---
  cargarSesionesActivas(): void {
    this.apiService
      .get<SesionBackend[]>('/sesiones')
      .then((sesiones) => {
        this.activeSessions = (sesiones ?? []).map((s) => ({
          id: String(s.id),
          device: s.dispositivo ?? 'Dispositivo desconocido',
          browser: s.navegador ?? 'Navegador desconocido',
          ip: s.ip ?? '-',
          location: '-',
          current: Boolean(s.es_actual),
          timestamp: this.formatearActividad(s.ultimo_acceso || s.fecha_inicio)
        }));
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.activeSessions = [];
        this.toastService.mostrar('No se pudieron cargar las sesiones activas.', 'error', 'Configuración');
        this.cdr.detectChanges();
      });
  }

  private formatearActividad(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) {
      return '-';
    }
    return `Conectado el ${fecha.toLocaleDateString()} a las ${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  async revocarSesion(id: string): Promise<void> {
    try {
      await this.apiService.delete(`/sesiones/${id}`);
      this.activeSessions = this.activeSessions.filter((s) => s.id !== id);
      this.toastService.mostrar('La sesión fue revocada correctamente.', 'success', 'Sesión revocada');
    } catch {
      this.toastService.mostrar('No se pudo revocar la sesión.', 'error', 'Sesión revocada');
    }
    this.cdr.detectChanges();
  }

  // Marcar notificación individual como leída
  marcarComoLeida(notificacion: NotificacionHistorial): void {
    notificacion.leida = true;
  }

  // Limpiar/marcar todas las alertas como leídas
  marcarTodasComoLeidas(): void {
    this.historialNotificaciones.forEach(item => item.leida = true);
  }

  // --- MÉTODOS MODAL GUARDAR ---
  abrirModalGuardar(): void {
    this.guardadoExitoso = false;
    this.mostrarModalGuardar = true;
  }

  cerrarModalGuardar(): void {
    this.mostrarModalGuardar = false;
    this.guardadoExitoso = false;
  }

  confirmarGuardado(): void {
    this.apiService
      .put('/configuracion', {
        notificacionesEmail: this.config.notificacionesEmail,
        resumenSemanal: this.config.resumenSemanal,
        seguridadActiva: this.config.seguridadActiva,
        dosFactores: this.config.dosFactores,
        tiempoSesion: this.config.tiempoSesion,
        expiracionPassword: this.config.expiracionPassword,
        copiasSeguridad: this.config.copiasSeguridad,
        backupAutomatico: this.config.backupAutomatico,
        frecuenciaBackup: this.config.frecuenciaBackup
      })
      .then(() => {
        this.guardadoExitoso = true;
        this.toastService.mostrar('La configuración fue guardada correctamente.', 'success', 'Configuración');
        this.cdr.detectChanges();
      })
      .catch(() => {
        this.toastService.mostrar('No se pudieron guardar los cambios de configuración.', 'error', 'Configuración');
        this.cdr.detectChanges();
      });
  }

  finalizarGuardado(): void {
    this.cerrarModalGuardar();
  }

  // --- MÉTODOS DE BACKUP MANUAL ---
  ejecutarBackupManual(): void {
    this.cargandoBackup = true;

    setTimeout(() => {
      const datosBackup = {
        sistema: 'GESTOCK',
        version: '1.0.0',
        fecha_creacion: new Date().toISOString(),
        tipo: 'backup_manual',
        configuraciones: this.config
      };

      const fechaStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(datosBackup, null, 2));

      this.dispararDescarga(dataStr, `gestock_backup_manual_${fechaStr}.json`);

      this.cargandoBackup = false;
      this.ultimoBackupFecha = new Date().toLocaleTimeString();
      this.mostrarModalBackupExitoso = true;
      this.cdr.detectChanges();
    }, 1800);
  }

  cerrarModalBackup(): void {
    this.mostrarModalBackupExitoso = false;
  }

  // --- MÉTODOS DE EXPORTACIÓN ---
  exportarConfiguracion(): void {
    this.mostrarModalExportar = true;
  }

  cerrarModalExportar(): void {
    this.mostrarModalExportar = false;
  }

descargarArchivoConfiguracion(): void {
    const payloadExportacion: Record<string, string | number | boolean> = {};

    if (this.opcionesExportar.incluirNotificaciones) {
      payloadExportacion['Notificaciones por Email'] = this.config.notificacionesEmail ? 'Activado' : 'Desactivado';
      payloadExportacion['Resumen Semanal'] = this.config.resumenSemanal ? 'Activado' : 'Desactivado';
      payloadExportacion['Incidencias Registradas'] = this.historialNotificaciones.length;
    }

    if (this.opcionesExportar.incluirSeguridad) {
      payloadExportacion['Seguridad Activa'] = this.config.seguridadActiva ? 'Activado' : 'Desactivado';
      payloadExportacion['Autenticación en Dos Pasos (2FA)'] = this.config.dosFactores ? 'Activado' : 'Desactivado';
      payloadExportacion['Tiempo de Sesión (min)'] = this.config.tiempoSesion;
      payloadExportacion['Expiración Contraseña (días)'] = this.config.expiracionPassword;
      payloadExportacion['Sesiones Activas Totales'] = this.activeSessions.length;
    }

    if (this.opcionesExportar.incluirBackup) {
      payloadExportacion['Copias de Seguridad'] = this.config.copiasSeguridad ? 'Activado' : 'Desactivado';
      payloadExportacion['Backup Automático'] = this.config.backupAutomatico ? 'Activado' : 'Desactivado';
      payloadExportacion['Frecuencia de Backup'] = this.config.frecuenciaBackup;
    }

    const fecha = new Date().toISOString().slice(0, 10);

    if (this.opcionesExportar.formato === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payloadExportacion, null, 2));
      this.dispararDescarga(dataStr, `gestock_config_${fecha}.json`);
    } 
    else if (this.opcionesExportar.formato === 'csv') {
      let contenidoCsv = 'Parametro,Valor\n';
      Object.entries(payloadExportacion).forEach(([clave, valor]) => {
        contenidoCsv += `"${clave}","${valor}"\n`;
      });

      const blob = new Blob(['\ufeff' + contenidoCsv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      this.dispararDescarga(url, `gestock_config_${fecha}.csv`);
      URL.revokeObjectURL(url);
    } 
    else if (this.opcionesExportar.formato === 'pdf') {
      this.generarPdfImpresion(payloadExportacion, fecha);
    }

    // CORREGIDO: Se llama correctamente a la función sin la letra extra
    this.cerrarModalExportar();
  }
  private dispararDescarga(uri: string, nombreArchivo: string): void {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', uri);
    anchor.setAttribute('download', nombreArchivo);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  private generarPdfImpresion(datos: Record<string, string | number | boolean>, fecha: string): void {
    const ventana = window.open('', '_blank');
    if (!ventana) return;

    let filasHtml = '';
    Object.entries(datos).forEach(([campo, valor]) => {
      filasHtml += `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155;">${campo}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #0f172a;">${valor}</td>
        </tr>`;
    });

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Gestock - Exportación de Configuración</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 25px; }
            h1 { color: #1e40af; margin: 0 0 5px 0; font-size: 24px; }
            p { color: #64748b; margin: 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background-color: #f1f5f9; text-align: left; padding: 12px; font-size: 14px; border-bottom: 2px solid #cbd5e1; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GESTOCK - Reporte de Configuración</h1>
            <p>Fecha de emisión: ${fecha}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Parámetro</th>
                <th>Valor Actual</th>
              </tr>
            </thead>
            <tbody>
              ${filasHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    ventana.document.close();
  }
}