import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceMark } from '../../../../core/services/attendance.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ClassesService, StudentDto } from '../../../../core/services/classes.service';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { switchMap } from 'rxjs/operators';

type StudentWithPayment = StudentDto & {
  paid: boolean;
};

@Component({
  selector: 'app-attendance-take',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIcon,
    RouterLink,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './attendance-take.page.html',
  styleUrls: ['./attendance-take.page.css'],
})
export class AttendanceTakePage implements OnInit {

  classId!: number;
  courseId!: number;

  className = '';
  courseName = '';
  date = '';
  classObservations = '';
  qrEnabled = false;
  proPlan = false;
  role = '';
  tableColumns: string[] = ['name', 'paid', 'present'];

  students: StudentWithPayment[] = [];
  attendanceMarks: AttendanceMark[] = [];
  wasAlreadyTaken = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classesSvc: ClassesService,
    private attendanceSvc: AttendanceService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('classId'));
    this.proPlan = this.auth.isProPlan();
    this.role = (this.auth.getRole() ?? '').replace(/^ROLE_/, '').toUpperCase();
    this.tableColumns = this.proPlan ? ['name', 'paid', 'present'] : ['name', 'present'];

    if (!this.classId) {
      Swal.fire('Clase inválida', '', 'error');
      this.router.navigate(['/courses']);
      return;
    }

    this.classesSvc.getClassDetails(this.classId).subscribe(res => {
      this.className = res.className;
      this.date = res.date;
      this.courseName = res.courseName;
      this.courseId = res.courseId;
      this.classObservations = res.observations || '';
      this.qrEnabled = !!res.qrEnabled;
    });

    this.classesSvc.getStudentsForClass(this.classId).subscribe(students => {

      this.students = (students ?? []).map(s => ({
        ...s,
        paid: false
      }));

      this.attendanceSvc.getSessionAttendance(this.classId).subscribe(marks => {

        if (!Array.isArray(marks)) {
          marks = Object.entries(marks).map(([id, present]) => ({
            userId: Number(id),
            present: Boolean(present)
          }));
        }

        this.attendanceMarks = marks.length
          ? marks
          : this.students.map(s => ({ userId: s.id, present: false }));

        if (this.proPlan) {
          this.attendanceSvc.getPaymentStatus(this.courseId)
            .subscribe(payments => {
              this.students = this.students.map(s => ({
                ...s,
                paid: payments[s.id] === true
              }));
            });
        }

      });
    });
  }

  getMark(userId: number): boolean {
    return this.attendanceMarks.find(a => a.userId === userId)?.present ?? false;
  }

  toggleAttendance(userId: number, present: boolean) {
    const mark = this.attendanceMarks.find(a => a.userId === userId);
    if (mark) mark.present = present;
  }

  save() {
    const observations = this.classObservations?.trim() || null;

    this.classesSvc.updateObservations(this.classId, observations).pipe(
      switchMap(() => this.attendanceSvc.registerAttendance(this.classId, this.attendanceMarks))
    ).subscribe({
      next: () => {
        Swal.fire('Asistencia guardada', '', 'success');
        this.router.navigate(['/attendance/class', this.courseId]);
      },
      error: () => Swal.fire('Error', 'No se pudo guardar', 'error')
    });
  }

  canGenerateQr(): boolean {
    return this.proPlan && ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(this.role);
  }

  generateQr(): void {
    if (!this.canGenerateQr()) {
      Swal.fire('Atención', 'No tienes permisos para generar el QR.', 'info');
      return;
    }

    this.classesSvc.generateQr(this.classId).subscribe({
      next: (res: any) => {
        Swal.fire({
          title: 'QR de asistencia',
          html: `<img src="${res.imageBase64}" alt="QR" style="width: 240px; max-width: 100%;" />`,
          showConfirmButton: true,
          confirmButtonText: 'Cerrar'
        });
      },
      error: (err) => {
        const message = err?.error ?? 'No se pudo generar el QR.';
        Swal.fire('Error', message, 'error');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/courses']);
  }
}
