import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from '../../../../services/api.service';

export interface UsuarioApi {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  rol_id: number;
  empresa_id: number | null;
  ultimo_acceso: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  rol_nombre?: string;
  empresa_nombre?: string;
}

export interface RolBasico {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
  fecha_creacion: string;
}

export interface RolConPermisos extends RolBasico {
  permiso_ids: number[];
  permiso_codigos: string[];
}

export interface Permiso {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  modulo: string;
}

export interface CrearUsuarioPayload {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  password: string;
  rolId: number;
  empresaId?: number;
}

export interface ActualizarUsuarioPayload {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string | null;
  rolId?: number;
  empresaId?: number | null;
  password?: string;
}

export interface CambiarPasswordPayload {
  nuevaPassword: string;
  confirmarPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolesUsuariosService {
  private api = inject(ApiService);

  // Signals reactivos para el manejo de estado en el cliente
  usuarios = signal<UsuarioApi[]>([]);
  roles = signal<RolBasico[]>([]);

  // ==================== OPERACIONES DE USUARIOS ====================

  /** Obtener lista de usuarios */
  obtenerUsuarios(): Promise<UsuarioApi[]> {
    return this.api.get<UsuarioApi[]>('/usuarios').then((lista) => {
      const datos = lista ?? [];
      this.usuarios.set(datos);
      return datos;
    });
  }

  /** Crear un nuevo usuario */
  crearUsuario(usuario: CrearUsuarioPayload): Promise<UsuarioApi> {
    return this.api.post<UsuarioApi>('/usuarios', usuario).then((nuevo) => {
      this.refrescarUsuarios();
      return nuevo;
    });
  }

  /** Actualizar un usuario existente */
  actualizarUsuario(id: number, usuario: ActualizarUsuarioPayload): Promise<UsuarioApi> {
    return this.api.put<UsuarioApi>(`/usuarios/${id}`, usuario).then((actualizado) => {
      this.usuarios.update((lista) => lista.map((u) => (u.id === id ? actualizado : u)));
      return actualizado;
    });
  }

  /** Eliminar un usuario */
  eliminarUsuario(id: number): Promise<unknown> {
    return this.api.delete<unknown>(`/usuarios/${id}`).then(() => {
      this.usuarios.update((lista) => lista.filter((u) => u.id !== id));
    });
  }

  /** Activar o desactivar un usuario */
  cambiarEstadoUsuario(id: number, estado: 'Activo' | 'Inactivo'): Promise<UsuarioApi> {
    return this.api.patch<UsuarioApi>(`/usuarios/${id}/estado`, { estado }).then((actualizado) => {
      this.usuarios.update((lista) => lista.map((u) => (u.id === id ? actualizado : u)));
      return actualizado;
    });
  }

  /** Cambiar el rol asignado a un usuario */
  cambiarRolUsuario(id: number, rolId: number): Promise<UsuarioApi> {
    return this.api.patch<UsuarioApi>(`/usuarios/${id}/rol`, { rolId }).then((actualizado) => {
      this.usuarios.update((lista) => lista.map((u) => (u.id === id ? actualizado : u)));
      return actualizado;
    });
  }

  /** Cambiar la contraseña de un usuario (solo admin/supervisor) */
  cambiarPasswordUsuario(id: number, payload: CambiarPasswordPayload): Promise<void> {
    return this.api.put<void>(`/usuarios/${id}/password`, payload);
  }

  // ==================== OPERACIONES DE ROLES ====================

  /** Obtener lista simple de roles disponibles */
  obtenerRoles(): Promise<RolBasico[]> {
    return this.api.get<RolBasico[]>('/roles/basicos').then((lista) => {
      const datos = lista ?? [];
      this.roles.set(datos);
      return datos;
    });
  }

  /** Obtener roles con sus permisos asignados (permiso_ids) */
  obtenerRolesConPermisos(): Promise<RolConPermisos[]> {
    return this.api.get<RolConPermisos[]>('/roles').then((lista) => lista ?? []);
  }

  /** Obtener el catálogo completo de permisos disponibles */
  obtenerPermisos(): Promise<{ permisos: Permiso[]; modulos: string[] }> {
    return this.api
      .get<{ permisos: Permiso[]; modulos: string[] }>('/permisos')
      .then((datos) => datos ?? { permisos: [], modulos: [] });
  }

  /** Asignar permisos a un rol */
  asignarPermisosRol(id: number, permisoIds: number[]): Promise<unknown> {
    return this.api.put<unknown>(`/roles/${id}/permisos`, { permisoIds });
  }

  private refrescarUsuarios(): Promise<void> {
    return this.api.get<UsuarioApi[]>('/usuarios').then((lista) => {
      this.usuarios.set(lista ?? []);
    });
  }
}