import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { SystemDashboard } from '../../core/models/system-dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  data?: SystemDashboard;
  role: string = '—';

  constructor(
    private dashboardService: DashboardService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.role = (this.auth.getRole() ?? '').toUpperCase();

    // ✅ Esta pantalla es SOLO SUPER_ADMIN
    if (this.role !== 'SUPER_ADMIN') {
      Swal.fire({
        icon: 'error',
        title: 'Sin permisos',
        text: 'Tu cuenta no puede acceder al dashboard del sistema.',
        heightAuto: false
      });
      this.auth.logout();
      return;
    }

    this.load();
  }

  private load(): void {
    this.dashboardService.getSystemDashboard().subscribe({
      next: (res) => this.data = res,
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el dashboard del sistema.',
          heightAuto: false
        });
      }
    });
  }
}
