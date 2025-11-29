import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth'; // Asegúrate de que la ruta a tu AuthService sea correcta

export const notAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getUser();

  // Si el usuario existe Y es administrador
  if (user && user.es_admin) {
    // Lo redirigimos a su panel de control
    router.navigate(['/admin']);
    // Bloqueamos la navegación a la ruta de usuario normal
    return false;
  }
  
  // Si no es admin (o no está logueado, eso lo maneja el authGuard), puede pasar
  return true; 
};