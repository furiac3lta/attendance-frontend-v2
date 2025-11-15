import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ClassesService, ClassSessionDto } from '../../../../core/services/classes.service';
import { CoursesService } from '../../../../core/services/courses.service';
import { AttendanceService } from '../../../../core/services/attendance.service';

/* Angular Material */
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // Material
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
  ],
  providers: [DatePipe],
  templateUrl: './class-detail.page.html',
  styleUrls: ['./class-detail.page.css'],
})
export class ClassDetailPage implements OnInit {

  /* ================================ */
  /* VARIABLES */
  /* ================================ */
  courseId!: number;
  selectedCourseName = '';
  classes: (ClassSessionDto & { attendanceTaken?: boolean })[] = [];
  message = '';
  currentDate = '';

  /* filtros */
  selectedMonth!: number;
  selectedYear!: number;

  months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
  ];

  years = [2023, 2024, 2025, 2026, 2027];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classesSvc: ClassesService,
    private coursesSvc: CoursesService,
    private attendanceSvc: AttendanceService,
    private datePipe: DatePipe
  ) {}

  /* ================================ */
  /* INIT */
  /* ================================ */
  ngOnInit(): void {
    this.currentDate =
      this.datePipe.transform(
        new Date(),
        "EEEE d 'de' MMMM 'de' y, HH:mm 'hs'",
        'es-AR'
      ) ?? '';

    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    if (!this.courseId) {
      this.message = 'Curso inválido';
      return;
    }

    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedYear = new Date().getFullYear();

    this.loadCourse(this.courseId);
    this.loadClasses(this.courseId);
  }

  /* ================================ */
  /* CARGAS */
  /* ================================ */
  loadCourse(courseId: number) {
    this.coursesSvc.findById(courseId).subscribe({
      next: (res) => (this.selectedCourseName = res?.name ?? 'Curso'),
      error: (err) => console.error('❌ Error cargando curso:', err),
    });
  }

  loadClasses(courseId: number) {
    this.classesSvc.getByCourseId(courseId).subscribe({
      next: (res) => {
        const list =
          (res ?? []) as (ClassSessionDto & { attendanceTaken?: boolean })[];
        this.classes = list;

        // ✔ Chequear si ya tiene asistencia
        this.classes.forEach((c) => {
          this.attendanceSvc.getSessionAttendance(c.id).subscribe((marks) => {
            c.attendanceTaken = (marks?.length ?? 0) > 0;
          });
        });
      },
      error: (err) =>
        console.error('❌ Error cargando clases del curso:', err),
    });
  }

  /* ================================ */
  /* ACCIONES */
  /* ================================ */
  createClass() {
    const payload = {
      name: `Clase del ${this.datePipe.transform(
        new Date(),
        'dd/MM/yyyy',
        'es-AR'
      )}`,
      date: new Date().toISOString().split('T')[0],
      courseId: this.courseId,
    };

    this.classesSvc.createClass(payload).subscribe({
      next: (res) => this.router.navigate(['/attendance/take', res.id]),
      error: (err) => {
        console.error('❌ Error al crear clase:', err);
        this.message = 'Error al crear clase';
      },
    });
  }

  reloadReport() {
    this.loadClasses(this.courseId);
  }

  goToAttendance(classId: number) {
    this.router.navigate(['/attendance/take', classId]);
  }

  viewAttendance(classId: number) {
    this.router.navigate(['/attendance/view', classId]);
  }

  goToReport() {
    this.router.navigate(['/attendance/report', this.courseId]);
  }
}
