import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🔹 Validar token
  const token = authService.getToken();
  if (!token) {
    Swal.fire({
      title: 'Sesión expirada',
      text: 'Tu sesión ha expirado. Iniciá sesión nuevamente.',
      icon: 'warning',
      confirmButtonText: 'Ir al login',
      heightAuto: false
    });

    router.navigate(['/login']);
    return false;
  }

  // 🔹 Obtener rol del usuario (normalizado)
  const role = authService.getRole()?.replace(/^ROLE_/, '').toUpperCase() || '';

  // 🔹 Roles permitidos desde la ruta
  const allowedRoles = (route.data?.['roles'] || []).map((r: string) => r.toUpperCase());

  // ✔️ Sin restricción → permitir
  if (allowedRoles.length === 0) return true;

  // ✔️ Si coincide → permitir
  if (allowedRoles.includes(role)) return true;

  // ❌ Acceso denegado → SweetAlert2 elegante
  Swal.fire({
    title: '⛔ Acceso denegado',
    text: 'No tenés permiso para acceder a esta sección.',
    icon: 'error',
    confirmButtonText: 'Entendido',
    heightAuto: false
  });

  return false; // NO redirige, solo bloquea
};
