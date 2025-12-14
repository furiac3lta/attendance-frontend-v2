import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AttendanceService, AttendanceMark } from '../../../../core/services/attendance.service';
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
    MatTooltipModule
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

  students: StudentWithPayment[] = [];
  attendanceMarks: AttendanceMark[] = [];
  wasAlreadyTaken = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classesSvc: ClassesService,
    private attendanceSvc: AttendanceService
  ) {}

  ngOnInit(): void {
    this.classId = Number(this.route.snapshot.paramMap.get('classId'));

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

        this.attendanceSvc.getPaymentStatus(this.courseId)
          .subscribe(payments => {
            this.students = this.students.map(s => ({
              ...s,
              paid: payments[s.id] === true
            }));
          });

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
    this.attendanceSvc.registerAttendance(this.classId, this.attendanceMarks).subscribe({
      next: () => {
        Swal.fire('Asistencia guardada', '', 'success');
        this.router.navigate(['/attendance/class', this.courseId]);
      },
      error: () => Swal.fire('Error', 'No se pudo guardar', 'error')
    });
  }

  cancel(): void {
    this.router.navigate(['/courses']);
  }
}
