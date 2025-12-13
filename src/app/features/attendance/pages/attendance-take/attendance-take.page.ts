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
    RouterLink
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

    // ==========================================
    // 🔹 DETALLES DE LA CLASE
    // ==========================================
    this.classesSvc.getClassDetails(this.classId).subscribe({
      next: (res) => {
        this.className = res.className;
        this.date = res.date;
        this.courseName = res.courseName;
        this.courseId = res.courseId;
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los detalles de la clase.',
          icon: 'error',
          heightAuto: false
        });
      }
    });

    // ==========================================
    // 🔹 ALUMNOS + ASISTENCIA PREVIA
    // ==========================================
    this.classesSvc.getStudentsForClass(this.classId).subscribe(students => {
      this.students = students ?? [];

      this.attendanceSvc.getSessionAttendance(this.classId).subscribe(marks => {

        // -----------------------------
        // 🔹 NORMALIZAR SI ES UN OBJETO
        // -----------------------------
        if (!Array.isArray(marks)) {
          marks = Object.entries(marks).map(([id, present]) => ({
            userId: Number(id),
            present: Boolean(present)
          }));
        }

        // -----------------------------
        // 🔹 ASIGNAR ASISTENCIA
        // -----------------------------
        if (marks.length > 0) {
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

  cancel(): void {
    this.router.navigate(['/courses']);
  }
}
