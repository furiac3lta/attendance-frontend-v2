import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CoursesService } from '../../../../core/services/courses.service';
import { Course } from '../../models/course.model';
import { UsersService } from '../../../../core/services/users.service';
import { User } from '../../../../core/services/users.service';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-course-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatCard
  ],
  templateUrl: './course-list.page.html',
  styleUrls: ['./course-list.page.css'],
})
export class CourseListPage implements OnInit {

  courses: Course[] = [];
  instructors: User[] = [];

  loading = true;
  message = '';

  constructor(
    private router: Router,
    private coursesSvc: CoursesService,
    private usersSvc: UsersService
  ) { }

  // 🔹 INIT
  ngOnInit(): void {
    this.loadCourses();

    // 👉 SOLO ADMIN / SUPER_ADMIN
    if (this.canEdit()) {
      this.loadInstructors();
    }
  }

  // 🔹 Cargar cursos
  loadCourses(): void {
    this.loading = true;

    this.coursesSvc.findAll().subscribe({
      next: (res: Course[]) => {
        this.courses = res.map((c: any) => ({
          ...c,
          selectedInstructorId: c.instructorId ?? null
        }));
        this.loading = false;
      },
      error: () => {
        this.message = '❌ Error al obtener los cursos';
        this.loading = false;
      },
    });
  }

  // 🔹 Cargar instructores (solo ADMIN / SUPER_ADMIN)
  loadInstructors(): void {
    this.usersSvc.getInstructors().subscribe({
      next: (res: User[]) => this.instructors = res ?? [],
      error: (err) => console.error('❌ Error cargando instructores:', err)
    });
  }

  // 🔹 Permisos
  canEdit(): boolean {
    const role = sessionStorage.getItem('role');
    if (!role) return false;
    const normalized = role.replace('ROLE_', '').toUpperCase();
    return normalized === 'SUPER_ADMIN' || normalized === 'ADMIN';
  }


  canTakeAttendance(): boolean {
    const role = sessionStorage.getItem('role')?.replace('ROLE_', '') ?? '';
    return ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'].includes(role.toUpperCase());
  }

  // 🔹 Navegación
  goToCreateCourse(): void {
    this.router.navigate(['/courses/new']);
  }

  goToEdit(courseId: number): void {
    this.router.navigate(['/courses/edit', courseId]);
  }

  goToAttendance(courseId: number): void {
    this.router.navigate([`/attendance/class/${courseId}`]);
  }

  goToReport(courseId: number): void {
    this.router.navigate(['/attendance/report', courseId]);
  }

  // 🔹 Asignar instructor (solo ADMIN / SUPER_ADMIN)
  saveInstructor(courseId: number, instructorId: number | null): void {
    if (!this.canEdit() || !instructorId) return;

    this.coursesSvc.assignInstructor(courseId, instructorId).subscribe({
      next: () => this.loadCourses(),
      error: (err) =>
        console.error('❌ Error asignando instructor:', err),
    });
  }
}
