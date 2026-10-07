import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast.service';

export const permissionGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  await authService.refrescarSesion();

  if (!authService.estaAutenticado()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const permission = route.data['permission'] as string | undefined;
  const anyPermission = route.data['anyPermission'] as string[] | undefined;

  if (permission && authService.tienePermiso(permission)) {
    return true;
  }
  if (anyPermission && anyPermission.some((codigo) => authService.tienePermiso(codigo))) {
    return true;
  }

  if (permission || anyPermission) {
    toastService.mostrar('No tienes permiso para acceder a esta sección.', 'error', 'Acceso denegado');
    router.navigate([authService.obtenerRutaInicialPorRol()]);
    return false;
  }

  return true;
};