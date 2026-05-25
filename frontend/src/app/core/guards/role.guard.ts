import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data['roles'] ?? [];
  const userRole = auth.getRole();

  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    router.navigate(['/403']);
    return false;
  }

  return true;
};
