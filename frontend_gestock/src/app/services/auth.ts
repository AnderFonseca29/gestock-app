import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { SESION_KEY, TOKEN_KEY } from '../interceptors/api.interceptor';

export type RolUsuario =
  | 'Administrador'
  | 'Supervisor'
  | 'Técnico de Mantenimiento'
  | 'Auditor'
  | 'Operario';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido?: string;
  email: string;
  rol?: string;
  rolId?: number;
  empresaId?: number;
  estado?: string;
  permisos?: string[];
}

export interface LoginResultado {
  ok: boolean;
  mensaje?: string;
  codigo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private refrescoEnCurso: Promise<boolean> | null = null;

  obtenerToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  }

  refrescarSesion(): Promise<boolean> {
    if (typeof localStorage === 'undefined' || !this.obtenerToken()) {
      return Promise.resolve(false);
    }
    if (this.refrescoEnCurso) {
      return this.refrescoEnCurso;
    }

    this.refrescoEnCurso = lastValueFrom(
      this.http.get<any>(`${environment.apiUrl}/auth/perfil`)
    )
      .then((res) => {
        this.refrescoEnCurso = null;
        const usuario = res?.data;
        if (usuario && usuario.email) {
          localStorage.setItem(SESION_KEY, JSON.stringify(usuario));
          localStorage.setItem('empresaIdSeleccionada', String(usuario.empresaId ?? ''));
        }
        return Boolean(usuario);
      })
      .catch(() => {
        this.refrescoEnCurso = null;
        return false;
      });
    return this.refrescoEnCurso;
  }

  async login(email: string, password: string): Promise<LoginResultado> {
    try {
      const res: any = await lastValueFrom(
        this.http.post(`${environment.apiUrl}/auth/login`, { email, password })
      );
      const data = res?.data;
      if (!data?.token) {
        return { ok: false, mensaje: 'El servidor no devolvió una sesión válida.' };
      }
      this.guardarEstadoSesion(data.token, data.usuario ?? {});
      return { ok: true };
    } catch (err: any) {
      const status = err?.status;
      const codigo = err?.error?.code || err?.statusCode;
      let mensaje = err?.error?.message || 'No se pudo iniciar sesión. Verifica tu conexión.';
      if (status === 400 || status === 401 || status === 422) {
        mensaje = 'Credenciales incorrectas. Verifica tu correo y contraseña.';
      } else if (status === 403) {
        mensaje = err?.error?.message || 'Tu cuenta está inactiva o bloqueada. Contacta al administrador.';
      } else if (status === 429) {
        mensaje = err?.error?.message || 'Demasiados intentos fallidos. Espera unos minutos para volver a intentar.';
      }
      return { ok: false, mensaje, codigo };
    }
  }

  guardarEstadoSesion(token: string, usuario: Usuario): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(SESION_KEY, JSON.stringify(usuario ?? {}));
    localStorage.setItem('empresaIdSeleccionada', String(usuario?.empresaId ?? ''));
  }

  usuarioActual(): Usuario | null {
    return this.obtenerUsuarioActual();
  }

  obtenerUsuarioActual(): Usuario | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const data = localStorage.getItem(SESION_KEY);
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data) as Usuario;
    } catch {
      return null;
    }
  }

  estaAutenticado(): boolean {
    return Boolean(this.obtenerToken() && this.obtenerUsuarioActual());
  }

  obtenerPermisos(): string[] {
    return this.obtenerUsuarioActual()?.permisos ?? [];
  }

  tienePermiso(codigo: string): boolean {
    return this.obtenerPermisos().includes(codigo);
  }

  tieneRol(rolesPermitidos: string[]): boolean {
    const usuario = this.obtenerUsuarioActual();
    return Boolean(usuario?.rol && rolesPermitidos.includes(usuario.rol));
  }

  limpiarSesion(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESION_KEY);
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
  }

  async logout(): Promise<void> {
    const token = this.obtenerToken();
    if (token) {
      try {
        await lastValueFrom(this.http.post(`${environment.apiUrl}/auth/logout`, {}));
      } catch {
        // El cierre local de sesión se realiza igualmente.
      }
    }
    this.limpiarSesion();
    this.router.navigate(['/auth/login']);
  }

  obtenerRutaInicialPorRol(): string {
    if (this.tienePermiso('dashboard.view')) {
      return '/app/panel';
    }
    if (this.tienePermiso('recepcion.view') || this.tienePermiso('recepcion.create')) {
      return '/app/recepcion/recepcion-mercancias';
    }
    if (this.tienePermiso('mantenimiento.view') || this.tienePermiso('mantenimiento.create')) {
      return '/app/programacion';
    }
    if (this.tienePermiso('productos.view') || this.tienePermiso('inventario.view')) {
      return '/app/gestion/inventario/lista-productos';
    }
    if (this.tienePermiso('incidencias.view') || this.tienePermiso('incidencias.create')) {
      return '/app/incidencias';
    }

    return '/app/panel';
  }
}