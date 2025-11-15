import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';

export const canActivateAuth: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // 🔹 Obtener token y rol
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const rawRole = sessionStorage.getItem('role') || localStorage.getItem('role');

  // ❌ Si no existe token → redirige al login
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // 🔹 Normalizar formato de rol
  const role = rawRole?.replace(/^ROLE_/, '').toUpperCase() || '';

  // 🔹 Roles permitidos definidos en la ruta
  const allowedRoles = (route.data?.['roles'] || []).map((r: string) => r.toUpperCase());

  // ✔️ Si la ruta no tiene restricción → permitir
  if (allowedRoles.length === 0) return true;

  // ✔️ Si el rol tiene permisos → permitir
  if (allowedRoles.includes(role)) return true;

  // ❌ Si no tiene permiso → notificar sin cerrar sesión
  Swal.fire({
    title: '⛔ Acceso denegado',
    text: 'Tu rol no tiene permisos para acceder a esta sección.',
    icon: 'error',
    confirmButtonText: 'Entendido',
    heightAuto: false,
  });

  router.navigate(['/dashboard']);
  return false;
};
