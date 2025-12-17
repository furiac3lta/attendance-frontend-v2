import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const role = this.auth.getRole();

    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      return true;
    }

    Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: 'No tenés permisos para acceder al dashboard.',
      heightAuto: false
    });

    this.router.navigate(['/login']);
    return false;
  }
}
