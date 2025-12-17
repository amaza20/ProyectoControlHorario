import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const allowedRoles = route.data['roles'] as string[];
    
    if (this.authService.hasRole(allowedRoles)) {
      return true;
    }

    // Si no tiene permisos, redirigir al dashboard
    alert('⚠️ No tienes permisos para acceder a esta página');
    this.router.navigate(['/dashboard']);
    return false;
  }
}