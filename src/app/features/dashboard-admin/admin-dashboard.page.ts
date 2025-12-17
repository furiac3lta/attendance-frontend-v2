import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { DashboardService } from '../../core/services/dashboard.service';
import { AdminDashboard } from '../../core/models/admin-dashboard.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.css'],
})
export class AdminDashboardPage implements OnInit {

  data?: AdminDashboard;

  organizationName = '—';
  role = '—';

  constructor(
    private dashboardService: DashboardService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();

    // ✅ ORGANIZACIÓN DEL ADMIN LOGUEADO
    this.organizationName =
      user?.organization?.name ?? 'Sin organización';

    this.role = (this.auth.getRole() ?? '').toUpperCase();

    // 🔐 Seguridad UX
    if (this.role !== 'ADMIN') {
      Swal.fire({
        icon: 'error',
        title: 'Sin permisos',
        text: 'Tu cuenta no puede acceder a este panel.',
        heightAuto: false
      });
      this.auth.logout();
      return;
    }

    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (res: AdminDashboard) => {
        this.data = res;
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el dashboard.',
          heightAuto: false
        });
      }
    });
  }

  get unpaidPercent(): number {
    if (!this.data || this.data.activeStudents === 0) return 0;
    return Math.round(
      (this.data.unpaidStudents / this.data.activeStudents) * 100
    );
  }
  get ticketAverage(): number | null {
  if (!this.data || this.data.activeStudents === 0) {
    return null;
  }

  return this.data.totalIncome / this.data.activeStudents;
}

}
