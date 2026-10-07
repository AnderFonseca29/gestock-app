import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth';

@Injectable({ providedIn: 'root' })
class HomeGuardService {
  private router = inject(Router);
  private authService = inject(AuthService);

  canActivate(): boolean {
    const ruta = this.authService.obtenerRutaInicialPorRol();
    this.router.navigate([ruta], { replaceUrl: true });
    return false;
  }
}

export const homeGuard: CanActivateFn = (_route: ActivatedRouteSnapshot) => {
  return inject(HomeGuardService).canActivate();
};