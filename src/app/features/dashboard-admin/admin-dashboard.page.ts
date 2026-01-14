import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AdminDashboard } from '../../core/models/admin-dashboard.model';
import { AuthService } from '../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { CoursesService } from '../../core/services/courses.service';
import { PaymentService } from '../../core/services/payment.service';
import { AttendanceService } from '../../core/services/attendance.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.css'],
})
export class AdminDashboardPage implements OnInit {

  data?: AdminDashboard;

  organizationName = '—';
  role = '—';
  isDownloading = false;

  constructor(
    private dashboardService: DashboardService,
    private auth: AuthService,
    private coursesSvc: CoursesService,
    private paymentSvc: PaymentService,
    private attendanceSvc: AttendanceService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getUser();

    // ✅ ORGANIZACIÓN DEL ADMIN LOGUEADO
    this.organizationName =
      user?.organizationName ??
      user?.organization?.name ??
      'Sin organización';

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

  downloadMonthlyReport(): void {
    if (this.isDownloading) return;

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    this.isDownloading = true;

    this.coursesSvc.findAll().subscribe({
      next: (courses: any[]) => {
        if (!courses || courses.length === 0) {
          this.isDownloading = false;
          Swal.fire('Atención', 'No hay cursos para generar el reporte.', 'info');
          return;
        }

        const requests = courses.map((course) =>
          forkJoin({
            students: this.coursesSvc.getStudentsByCourse(course.id).pipe(
              catchError(() => of([]))
            ),
            payments: this.paymentSvc.listByCourse(course.id, month, year).pipe(
              catchError(() => of([]))
            ),
            attendance: this.attendanceSvc.getMonthlyReport(course.id, month, year).pipe(
              catchError(() => of([]))
            )
          }).pipe(
            map((data) => ({
              course,
              ...data
            }))
          )
        );

        forkJoin(requests).subscribe({
          next: (reportData) => {
            this.isDownloading = false;
            this.openReportWindow(reportData, month, year);
          },
          error: () => {
            this.isDownloading = false;
            Swal.fire('Error', 'No se pudo generar el reporte.', 'error');
          }
        });
      },
      error: () => {
        this.isDownloading = false;
        Swal.fire('Error', 'No se pudieron cargar los cursos.', 'error');
      }
    });
  }

  private openReportWindow(reportData: any[], month: number, year: number): void {
    const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(
      new Date(year, month - 1, 1)
    );
    const lastDay = new Date(year, month, 0).getDate();
    const rangeLabel = `01/${String(month).padStart(2, '0')}/${year} al ${String(
      lastDay
    ).padStart(2, '0')}/${year}`;

    const escapeHtml = (value: any) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const formatAmount = (value: any) => {
      const num = Number(value ?? 0);
      if (Number.isNaN(num)) return '$0';
      return `$${new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(num)}`;
    };

    const methodLabel = (method: string) => {
      switch (method) {
        case 'CASH':
          return 'Efectivo';
        case 'TRANSFER':
          return 'Transferencia';
        case 'MERCADOPAGO':
          return 'MercadoPago';
        case 'OTHER':
          return 'Otro';
        default:
          return method ?? '—';
      }
    };

    const courseSections = reportData
      .map((item) => {
        const courseName = escapeHtml(item.course?.name ?? 'Curso');
        const students = item.students ?? [];
        const payments = (item.payments ?? []).filter((p: any) => p.status === 'PAID');
        const attendance = item.attendance ?? [];

        const paidStudentIds = new Set(payments.map((p: any) => p.studentId));
        const totalPaid = payments.reduce(
          (sum: number, p: any) => sum + Number(p.amount ?? 0),
          0
        );

        const paymentsRows =
          payments.length === 0
            ? `<tr><td colspan="4" class="muted">Sin pagos en el mes</td></tr>`
            : payments
                .map(
                  (p: any) => `
          <tr>
            <td>${escapeHtml(p.studentName)}</td>
            <td>${formatAmount(p.amount)}</td>
            <td>${escapeHtml(methodLabel(p.method))}</td>
            <td>${escapeHtml(p.paidAt ? new Date(p.paidAt).toLocaleDateString('es-ES') : '—')}</td>
          </tr>`
                )
                .join('');

        const attendanceRows =
          attendance.length === 0
            ? `<tr><td colspan="5" class="muted">Sin asistencia registrada</td></tr>`
            : attendance
                .map((s: any) => {
                  const present = Number(s.present ?? 0);
                  const total = Number(s.totalClasses ?? s.total ?? 0);
                  const absent = total - present;
                  const percent = Number(s.percent ?? 0);
                  return `
          <tr>
            <td>${escapeHtml(s.studentName)}</td>
            <td>${present}</td>
            <td>${absent}</td>
            <td>${total}</td>
            <td>${percent.toFixed(1)}%</td>
          </tr>`;
                })
                .join('');

        return `
      <section class="course-block">
        <h3>${courseName}</h3>
        <div class="course-meta">
          <div><strong>Alumnos:</strong> ${students.length}</div>
          <div><strong>Pagaron:</strong> ${paidStudentIds.size}</div>
          <div><strong>Total mensual:</strong> ${formatAmount(totalPaid)}</div>
        </div>

        <h4>Pagos del mes</h4>
        <table>
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Monto</th>
              <th>Método</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${paymentsRows}
          </tbody>
        </table>

        <h4>Asistencia por alumno</h4>
        <table>
          <thead>
            <tr>
              <th>Alumno</th>
              <th>Presentes</th>
              <th>Ausentes</th>
              <th>Total clases</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            ${attendanceRows}
          </tbody>
        </table>
      </section>
      `;
      })
      .join('');

    const html = `
      <!doctype html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Reporte mensual ${monthName} ${year}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              color: #1a1a1a;
              margin: 32px;
            }
            h1 { font-size: 22px; margin: 0 0 6px; }
            h2 { font-size: 14px; color: #555; margin: 0 0 24px; }
            h3 { font-size: 16px; margin: 24px 0 8px; }
            h4 { font-size: 14px; margin: 18px 0 8px; }
            .meta {
              display: flex;
              justify-content: space-between;
              gap: 12px;
              flex-wrap: wrap;
              margin-bottom: 12px;
            }
            .course-meta {
              display: flex;
              gap: 16px;
              flex-wrap: wrap;
              font-size: 13px;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 8px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 6px 8px;
              font-size: 12px;
              text-align: left;
            }
            th { background: #f5f5f5; }
            .muted { color: #777; text-align: center; }
            .course-block { page-break-inside: avoid; }
            @media print {
              body { margin: 16mm; }
              h1 { font-size: 18px; }
            }
          </style>
        </head>
        <body>
          <div class="meta">
            <div>
              <h1>Reporte mensual</h1>
              <h2>${escapeHtml(this.organizationName)} · ${escapeHtml(monthName)} ${year}</h2>
            </div>
            <div><strong>Periodo:</strong> ${escapeHtml(rangeLabel)}</div>
          </div>
          ${courseSections}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire('Error', 'El navegador bloqueó la ventana de impresión.', 'error');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

}
