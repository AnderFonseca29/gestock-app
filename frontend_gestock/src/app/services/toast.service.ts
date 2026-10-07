import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;

  mostrar(mensaje: string, tipo: Toast['tipo'] = 'success', titulo = ''): void {
    const toast: Toast = { id: ++this.nextId, titulo, mensaje, tipo };
    this._toasts.update((lista) => [...lista, toast]);
    setTimeout(() => this.cerrar(toast.id), 4500);
  }

  cerrar(id: number): void {
    this._toasts.update((lista) => lista.filter((t) => t.id !== id));
  }
}