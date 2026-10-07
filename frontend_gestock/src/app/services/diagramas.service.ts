import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

export interface Diagrama {
  id: number;
  numero: number;
  nombre: string;
  titulo: string;
  categoria: string;
  descripcion: string;
  content_type: string;
  tamanio?: number;
  actualizado_en?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DiagramasService {
  private api = inject(ApiService);
  private http = inject(HttpClient);

  listar(): Promise<Diagrama[]> {
    return this.api.get<Diagrama[]>('/diagramas');
  }

  obtenerImagen(id: number): Promise<string> {
    return lastValueFrom(
      this.http.get(`${environment.apiUrl}/diagramas/${id}/imagen`, { responseType: 'blob' })
    ).then((blob) => URL.createObjectURL(blob));
  }

  revocarImagen(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
}