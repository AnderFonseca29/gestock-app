import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);

  obtenerRolesBasicos(): Promise<any[]> {
    return lastValueFrom(
      this.http.get<any>(`${environment.apiUrl}/roles/basicos`)
    ).then((res) => res?.data ?? []);
  }

  crearUsuario(payload: {
    nombre: string;
    apellido?: string;
    email: string;
    telefono?: string;
    password: string;
    rolId: number;
    empresaId?: number;
  }): Promise<any> {
    return lastValueFrom(
      this.http.post<any>(`${environment.apiUrl}/usuarios`, payload)
    ).then((res) => res?.data);
  }
}