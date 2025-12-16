import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { MatIconModule } from '@angular/material/icon';
import { ChartData } from 'chart.js';

import { DashboardService } from '../../core/services/dashboard.service';
import { OrganizationDashboard } from '../../core/models/organization-dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    BaseChartDirective,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  // ================= DATA =================
  dashboard?: OrganizationDashboard;

  currentMonthLabel: string = '';
  currentYear: number = new Date().getFullYear();

  // ================= METRICS =================
  get ticketAverage(): number | null {
    if (!this.dashboard || !this.dashboard.totalActiveStudents) {
      return null;
    }
    return this.dashboard.totalRevenue / this.dashboard.totalActiveStudents;
  }

  // ================= CHARTS =================

  // 📊 Recaudación por curso
  revenueByCourseData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Recaudación'
      }
    ]
  };

  // 💳 Métodos de pago
  paymentMethodsData: ChartData<'pie'> = {
    labels: ['Efectivo', 'Transferencia', 'MercadoPago'],
    datasets: [
      {
        data: []
      }
    ]
  };

  constructor(private dashboardService: DashboardService) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.setCurrentMonthLabel();
    this.loadDashboard();
  }

  // ================= METHODS =================

  private setCurrentMonthLabel(): void {
    const now = new Date();

    let month = now.toLocaleDateString('es-AR', { month: 'long' });

    // Capitalizar (agosto → Agosto)
    this.currentMonthLabel =
      month.charAt(0).toUpperCase() + month.slice(1);
  }

  private loadDashboard(): void {
    // 🔹 mes actual en formato YYYY-MM
    const now = new Date();
    const month =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    this.dashboardService.getOrganizationDashboard(month).subscribe({
      next: (data) => {
        this.dashboard = data;

        // 📊 Recaudación por curso
        this.revenueByCourseData.labels =
          Object.keys(data.revenueByCourse);

        this.revenueByCourseData.datasets[0].data =
          Object.values(data.revenueByCourse);

        // 💳 Métodos de pago
        this.paymentMethodsData.datasets[0].data = [
          data.cashAmount,
          data.transferAmount,
          data.mercadoPagoAmount
        ];
      },
      error: (err) => {
        console.error('Error cargando dashboard', err);
      }
    });
  }

  // Utilidad para templates
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
