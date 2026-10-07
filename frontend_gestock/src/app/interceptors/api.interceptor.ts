import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const TOKEN_KEY = 'gestock_token';
export const SESION_KEY = 'gestock_usuario_sesion';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toast = inject(ToastService);

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err) => {
      const status = err?.status as number | undefined;
      const message = err?.error?.message || err?.message || 'Error de conexión con el servidor.';
      const esLogin = req.url.includes('/auth/login');

      if (status === 401 && !esLogin) {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(SESION_KEY);
        }
        toast.mostrar('Tu sesión ha expirado. Inicia sesión nuevamente.', 'error', 'Sesión expirada');
        router.navigate(['/auth/login']);
      } else if (status && status !== 401) {
        toast.mostrar(message, 'error', 'Error');
      }

      return throwError(() => err);
    })
  );
};