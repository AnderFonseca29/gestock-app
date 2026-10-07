import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.estaAutenticado()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const rolesPermitidos = route.data['roles'] as Array<string>;

  if (rolesPermitidos && authService.tieneRol(rolesPermitidos)) {
    return true;
  }

  router.navigate(['/app/panel']);
  return false;
};