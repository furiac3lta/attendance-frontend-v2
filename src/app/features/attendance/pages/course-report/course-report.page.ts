import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Servicios
import { AttendanceService } from '../../../../core/services/attendance.service';
import { CoursesService } from '../../../../core/services/courses.service';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

// ❗ Necesario para Chips
import { MatChipsModule } from '@angular/material/chips';

// SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './course-report.page.html',
  styleUrls: ['./course-report.page.css'],
})
export class CourseReportPage implements OnInit {

  displayedColumns = ['studentName', 'present', 'absent', 'total', 'percent'];

  courseId!: number;
  month!: number;
  year!: number;
  courseName = '';

  stats: any[] = [];

  months = [
    { value: 1, label: 'Enero', short: 'Ene' },
    { value: 2, label: 'Febrero', short: 'Feb' },
    { value: 3, label: 'Marzo', short: 'Mar' },
    { value: 4, label: 'Abril', short: 'Abr' },
    { value: 5, label: 'Mayo', short: 'May' },
    { value: 6, label: 'Junio', short: 'Jun' },
    { value: 7, label: 'Julio', short: 'Jul' },
    { value: 8, label: 'Agosto', short: 'Ago' },
    { value: 9, label: 'Septiembre', short: 'Sep' },
    { value: 10, label: 'Octubre', short: 'Oct' },
    { value: 11, label: 'Noviembre', short: 'Nov' },
    { value: 12, label: 'Diciembre', short: 'Dic' },
  ];

  years: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private attendanceSvc: AttendanceService,
    private courseSvc: CoursesService
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));

    const today = new Date();
    this.month = today.getMonth() + 1;
    this.year = today.getFullYear();

    const currentYear = today.getFullYear();
    this.years = Array.from({ length: 6 }, (_, i) => currentYear - i);

    this.loadCourseInfo();
    this.loadReport();
  }

  // ===========================
  // 🔵 Métodos para CHIPS
  // ===========================
  setMonth(v: number) {
    this.month = v;
    this.loadReport();
  }

  setYear(v: number) {
    this.year = v;
    this.loadReport();
  }

  // ===========================
  // Datos del curso
  // ===========================
  loadCourseInfo() {
    this.courseSvc.getById(this.courseId).subscribe({
      next: (course: any) => this.courseName = course.name,
      error: () => {
        this.courseName = 'Curso desconocido';
        Swal.fire({
          icon: 'warning',
          title: 'Atención',
          text: 'No se pudo cargar el nombre del curso.',
          heightAuto: false
        });
      }
    });
  }

  // ===========================
  // Reporte mensual
  // ===========================
  loadReport() {
    this.attendanceSvc.getMonthlyReport(this.courseId, this.month, this.year).subscribe({
      next: res => {
        this.stats = res.map((s: any) => ({
          studentName: s.studentName,
          present: s.present ?? 0,
          total: s.totalClasses ?? s.total ?? 0,
          absent: (s.totalClasses ?? s.total ?? 0) - (s.present ?? 0),
          percent: s.percent ?? 0
        }));
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el reporte mensual.',
          heightAuto: false
        });
      }
    });
  }

  getMonthLabel(value: number): string {
    return this.months.find(m => m.value === value)?.label ?? '';
  }

  getColor(percent: number): string {
    if (percent >= 85) return 'limegreen';
    if (percent >= 60) return 'orange';
    return 'red';
  }
}
