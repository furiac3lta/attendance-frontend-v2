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
import Swal from 'sweetalert2';

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
    MatIcon
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

  students: StudentDto[] = [];
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

    if (!this.classId || Number.isNaN(this.classId)) {
      Swal.fire({
        title: 'Clase inválida',
        text: 'No se pudo identificar la clase.',
        icon: 'error',
        heightAuto: false
      });
      this.router.navigate(['/courses']);
      return;
    }

    // ==================================================
    // 🔹 Cargar detalles de la clase
    // ==================================================
    this.classesSvc.getClassDetails(this.classId).subscribe({
      next: (res) => {
        this.className = res.className;
        this.date = res.date;
        this.courseName = res.courseName;
        this.courseId = res.courseId;

        if (!this.courseId) {
          Swal.fire({
            title: 'Error',
            text: 'No se recibió el courseId del backend.',
            icon: 'error',
            heightAuto: false
          });
        }
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar detalles de la clase.',
          icon: 'error',
          heightAuto: false
        });
      }
    });

    // ==================================================
    // 🔹 Cargar alumnos y asistencia previa
    // ==================================================
    this.classesSvc.getStudentsForClass(this.classId).subscribe(students => {
      this.students = students ?? [];

      this.attendanceSvc.getSessionAttendance(this.classId).subscribe(marks => {
        if (marks?.length > 0) {
          this.wasAlreadyTaken = true;
          this.attendanceMarks = marks;
        } else {
          this.attendanceMarks = this.students.map(s => ({
            userId: s.id,
            present: false
          }));
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
    else this.attendanceMarks.push({ userId, present });
  }

  // ==================================================
  // 🔹 Guardar asistencia
  // ==================================================
  save() {
    this.attendanceSvc.registerAttendance(this.classId, this.attendanceMarks).subscribe({
      next: () => {
        Swal.fire({
          title: this.wasAlreadyTaken ? 'Cambios guardados' : 'Asistencia registrada',
          icon: 'success',
          heightAuto: false
        });

        this.router.navigate(['/attendance/class', this.courseId]);
      },
      error: () =>
        Swal.fire({
          title: 'Error',
          text: 'No se pudo guardar la asistencia.',
          icon: 'error',
          heightAuto: false
        })
    });
  }

  // ==================================================
  // 🔹 Cancelar
  // ==================================================
  cancel(): void {
    this.router.navigate(['/courses']);
  }
}
