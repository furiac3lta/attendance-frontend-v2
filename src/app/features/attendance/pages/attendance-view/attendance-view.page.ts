import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../../core/services/attendance.service';

// SweetAlert2
import Swal from 'sweetalert2';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

interface AttendanceRecord {
  fullName: string;
  present: boolean;
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
    MatDividerModule
  ],
  templateUrl: './attendance-view.page.html',
  styleUrls: ['./attendance-view.page.css']
})
export class AttendanceViewPage implements OnInit {

  classId!: number;

  records: AttendanceRecord[] = [];
  loading = true;

  displayedColumns = ['fullName', 'present', 'takenBy', 'takenAt'];

  constructor(
    private route: ActivatedRoute,
    private attendanceSvc: AttendanceService,
    private router: Router
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
      this.records = res.map(item => ({
        fullName: item.studentName,
        present: item.attended,
        takenByName: item.takenByName,
        takenByRole: item.takenByRole,
        takenAt: item.takenAt
      }));
      this.loading = false;
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
