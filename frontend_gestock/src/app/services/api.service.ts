import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  get<T = any>(ruta: string, params?: Record<string, any>): Promise<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== '') {
          httpParams = httpParams.set(clave, String(valor));
        }
      });
    }
    return lastValueFrom(this.http.get<any>(`${environment.apiUrl}${ruta}`, { params: httpParams }))
      .then((res) => (res && 'data' in res ? res.data : res) as T);
  }

  post<T = any>(ruta: string, cuerpo?: any): Promise<T> {
    return lastValueFrom(this.http.post<any>(`${environment.apiUrl}${ruta}`, cuerpo))
      .then((res) => (res && 'data' in res ? res.data : res) as T);
  }

  put<T = any>(ruta: string, cuerpo?: any): Promise<T> {
    return lastValueFrom(this.http.put<any>(`${environment.apiUrl}${ruta}`, cuerpo))
      .then((res) => (res && 'data' in res ? res.data : res) as T);
  }

  patch<T = any>(ruta: string, cuerpo?: any): Promise<T> {
    return lastValueFrom(this.http.patch<any>(`${environment.apiUrl}${ruta}`, cuerpo))
      .then((res) => (res && 'data' in res ? res.data : res) as T);
  }

  delete<T = any>(ruta: string): Promise<T> {
    return lastValueFrom(this.http.delete<any>(`${environment.apiUrl}${ruta}`))
      .then((res) => (res && 'data' in res ? res.data : res) as T);
  }
}