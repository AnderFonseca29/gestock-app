import { Component, OnInit, inject, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth';
import { ApiService } from '../../services/api.service';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tiempo: string;
  leida: boolean;
}

interface NotificacionBackend {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  private api = inject(ApiService);

  usuarioActual: Usuario | null = null;
  mostrarMenuPerfil: boolean = false;
  mostrarNotificaciones: boolean = false;

  notificaciones: Notificacion[] = [];

  ngOnInit(): void {
    this.cargarUsuario();
    this.cargarNotificaciones();
  }

  cargarUsuario(): void {
    this.usuarioActual = this.authService.obtenerUsuarioActual();
  }

  obtenerIniciales(): string {
    if (!this.usuarioActual || !this.usuarioActual.nombre) {
      return 'AG';
    }
    const partes = this.usuarioActual.nombre.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return partes[0].slice(0, 2).toUpperCase();
  }

  toggleMenuPerfil(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.mostrarMenuPerfil = !this.mostrarMenuPerfil;
    if (this.mostrarMenuPerfil) {
      this.mostrarNotificaciones = false;
    }
    this.cdr.detectChanges();
  }

  toggleNotificaciones(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      this.mostrarMenuPerfil = false;
    }
    this.cdr.detectChanges();
  }

  cerrarMenus(): void {
    this.mostrarMenuPerfil = false;
    this.mostrarNotificaciones = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.cerrarMenus();
    }
  }

  cargarNotificaciones(): void {
    this.api.get<{ notificaciones: NotificacionBackend[]; sinLeer: number }>('/notificaciones').then(
      (res) => {
        this.notificaciones = (res?.notificaciones || []).map((n) => ({
          id: n.id,
          titulo: n.titulo,
          mensaje: n.mensaje,
          tiempo: this.formatearTiempo(n.fecha),
          leida: !!n.leida
        }));
        this.cdr.detectChanges();
      },
      () => {
        this.notificaciones = [];
        this.cdr.detectChanges();
      }
    );
  }

  private formatearTiempo(fecha: string): string {
    if (!fecha) return 'Recién ahora';
    const ms = Date.now() - new Date(fecha).getTime();
    if (Number.isNaN(ms) || ms < 0) return 'Recién ahora';
    const minutos = Math.floor(ms / 60000);
    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} min`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `Hace ${horas} h`;
    const dias = Math.floor(horas / 24);
    return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
  }

  marcarTodasComoLeidas(): void {
    this.notificaciones.forEach(n => n.leida = true);
    this.api.post<void>('/notificaciones/leidas').then(
      () => {},
      () => {
        // El interceptor muestra el toast de error automáticamente.
      }
    );
  }

  obtenerSinLeerCount(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  cerrarSesion(): void {
    this.cerrarMenus();
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  tienePermiso(codigo: string): boolean {
    return this.authService.tienePermiso(codigo);
  }
}