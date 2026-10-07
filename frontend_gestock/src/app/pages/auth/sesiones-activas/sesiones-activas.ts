import { Component, ElementRef, ViewChild, HostListener, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth';

interface Sesion {
  id: string;
  dispositivo: string;
  navegador: string;
  ubicacion: string;
  ip: string;
  ultimaActividad: string;
  esActual: boolean;
}

interface Alerta {
  id: string;
  mensaje: string;
  fecha: string;
  ubicacion: string;
  ip: string;
}

interface SesionBackend {
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
  selector: 'app-sesiones-activas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sesiones-activas.html',
  styleUrl: './sesiones-activas.css'
})
export class SesionesActivasComponent implements OnInit {
  @ViewChild('cardRef') cardRef!: ElementRef<HTMLDivElement>;

  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  // Restricción de acceso: solo administradores gestionan las sesiones
  esAdmin: boolean = false;

  sesiones: Sesion[] = [];

  // HU013: Notificaciones de inicio de sesión inusual
  alertas: Alerta[] = [
    {
      id: 'alt-01',
      mensaje: 'Acceso desde un dispositivo nuevo no reconocido',
      fecha: 'Ayer, 22:45',
      ubicacion: 'Medellín, Colombia',
      ip: '190.157.10.88'
    }
  ];

  ngOnInit(): void {
    this.esAdmin = this.authService.tieneRol(['Administrador']);
    void this.cargarSesiones();
  }

  private async cargarSesiones(): Promise<void> {
    try {
      const datos = await this.apiService.get<SesionBackend[]>('/sesiones');
      this.sesiones = (datos ?? []).map((s) => ({
        id: String(s.id),
        dispositivo: s.dispositivo ?? 'Dispositivo desconocido',
        navegador: s.navegador ?? 'Navegador desconocido',
        ubicacion: '-',
        ip: s.ip ?? '-',
        ultimaActividad: this.formatearActividad(s.ultimo_acceso || s.fecha_inicio),
        esActual: Boolean(s.es_actual)
      }));
      this.cdr.detectChanges();
    } catch {
      this.sesiones = [];
      this.toastService.mostrar('No se pudieron cargar las sesiones activas.', 'error', 'Sesiones');
      this.cdr.detectChanges();
    }
  }

  private formatearActividad(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) {
      return '-';
    }
    return `Conectado el ${fecha.toLocaleDateString()} a las ${fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Interacción 3D y seguimiento del cursor
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.cardRef) return;
    const card = this.cardRef.nativeElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }

  // HU012: Cierre de sesión individual
  async cerrarSesion(id: string): Promise<void> {
    try {
      await this.apiService.delete(`/sesiones/${id}`);
      this.sesiones = this.sesiones.filter((s) => s.id !== id);
      this.cdr.detectChanges();
      this.toastService.mostrar('La sesión fue finalizada correctamente.', 'success', 'Sesión cerrada');
    } catch {
      this.toastService.mostrar('No se pudo cerrar la sesión.', 'error', 'Sesión cerrada');
    }
  }

  // HU012: Cierre de todas las demás sesiones
  async cerrarTodasLasDemas(): Promise<void> {
    try {
      await this.apiService.post('/sesiones/cerrar-otras');
      this.sesiones = this.sesiones.filter((s) => s.esActual);
      this.cdr.detectChanges();
      this.toastService.mostrar('Se cerraron todas las sesiones remotas.', 'success', 'Sesiones');
    } catch {
      this.toastService.mostrar('No se pudieron cerrar las demás sesiones.', 'error', 'Sesiones');
    }
  }

  descartarAlerta(id: string): void {
    this.alertas = this.alertas.filter((a) => a.id !== id);
  }
}