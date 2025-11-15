import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AttendanceService } from '../../../../core/services/attendance.service';

// SweetAlert2
import Swal from 'sweetalert2';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

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
  records: any[] = [];

  displayedColumns = ['fullName', 'present'];

  constructor(
    private route: ActivatedRoute,
    private attendanceSvc: AttendanceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('classId'));

    this.attendanceSvc.getAttendance(this.classId).subscribe({
      next: (res: any[]) => {
        this.records = res.map(item => ({
          fullName: item.studentName,
          present: item.attended
        }));
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar la asistencia.',
          icon: 'error',
          heightAuto: false
        });
      }
    });
  }

  goBack() {
    window.history.back();
  }
}
