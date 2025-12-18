import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { AttendanceService } from '../../../../core/services/attendance.service';

// SweetAlert2
import Swal from 'sweetalert2';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

interface AttendanceRecord {
  studentId: number;
  fullName: string;
  present: boolean;
  paid?: boolean;
  takenByName?: string;
  takenByRole?: string;
  takenAt?: string;
}

@Component({
  selector: 'app-attendance-view',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule
  ],
  providers: [DatePipe], // ✅ IMPORTANTE
  templateUrl: './attendance-view.page.html',
  styleUrls: ['./attendance-view.page.css']
})
export class AttendanceViewPage implements OnInit {

  classId!: number;
  courseId!: number;

  // 🔹 encabezado
  classDate?: string;
  courseName?: string;
  titleLabel = '';
  takenByName?: string;
  takenByRole?: string;

  records: AttendanceRecord[] = [];
  loading = true;

  displayedColumns = ['fullName', 'paid', 'present', 'takenAt'];

  constructor(
    private route: ActivatedRoute,
    private attendanceSvc: AttendanceService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('classId');

    if (!param) {
      this.showError('Clase inválida');
      return;
    }

    this.classId = Number(param);
    this.loadAttendance();
  }

  private loadAttendance(): void {
    this.loading = true;

    this.attendanceSvc.getByClassId(this.classId).subscribe({
      next: (res: any[]) => {

        if (!res || res.length === 0) {
          this.loading = false;
          return;
        }

        // 🔹 datos del encabezado
        this.classDate = res[0].takenAt;
        this.courseName = res[0].courseName;
        this.courseId = res[0].courseId;
        this.takenByName = res[0].takenByName;
        this.takenByRole = res[0].takenByRole;

        // 🔹 título formateado y capitalizado
        const date = new Date(this.classDate!);
        const formatted = this.datePipe.transform(
          date,
          "EEEE dd/MM/yyyy",
          'es-AR'
        );

        this.titleLabel = formatted
          ? formatted.charAt(0).toUpperCase() + formatted.slice(1)
          : '';

        // 🔹 map asistencia
        this.records = res.map(item => ({
          studentId: item.studentId,
          fullName: item.studentName,
          present: item.attended,
          takenByName: item.takenByName,
          takenByRole: item.takenByRole,
          takenAt: item.takenAt,
          paid: false
        }));

        // 🔹 cargar pagos
        if (this.courseId) {
          this.attendanceSvc
            .getPaymentStatus(this.courseId)
            .subscribe((payments: Record<number, boolean>) => {
              this.records.forEach(r => {
                r.paid = payments[r.studentId] ?? false;
              });
              this.loading = false;
            });
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
        this.showError('No se pudo cargar la asistencia.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/attendance/take', this.classId]);
  }

  private showError(message: string): void {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      heightAuto: false
    });
  }
}
