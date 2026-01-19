import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CoursesService } from '../../../../core/services/courses.service';
import { Course } from '../../models/course.model';
import { UsersService } from '../../../../core/services/users.service';
import { User } from '../../../../core/services/users.service';
import { InstructorDTO } from '../../../../core/models/instructorDTO';
import { AuthService } from '../../../../core/services/auth.service';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCard } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

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
    MatCard,
    MatSlideToggleModule

  ],
  templateUrl: './course-list.page.html',
  styleUrls: ['./course-list.page.css'],
})
export class CourseListPage implements OnInit {

  courses: Course[] = [];
  instructors: User[] = [];
  showInactive = false;


  /** 🔥 instructores disponibles por curso */
availableInstructors: Record<number, InstructorDTO[]> = {};

  loading = true;
  message = '';
  proPlan = false;
  role = '';

  constructor(
    private router: Router,
    private coursesSvc: CoursesService,
    private usersSvc: UsersService,
    private auth: AuthService
  ) { }

  // 🔹 INIT
  ngOnInit(): void {
    this.proPlan = this.auth.isProPlan();
    this.role = this.normalizeRole(this.auth.getRole());
    this.loadCourses();

    // 👉 SOLO ADMIN / SUPER_ADMIN
    if (this.canEdit()) {
      this.loadInstructors();
    }
  }

  // 🔹 Cargar cursos
  loadCourses(): void {
    this.loading = true;

    this.coursesSvc.findAll(!this.showInactive).subscribe({
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

  toggleInactiveView(): void {
    this.loadCourses();
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
    return this.role === 'SUPER_ADMIN' || this.role === 'ADMIN';
  }


  canTakeAttendance(): boolean {
    return ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'].includes(this.role);
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
    if (!this.proPlan) {
      return;
    }
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

  toggleCourseActive(course: Course): void {
    if (!course.id) return;

    const nextActive = !course.active;
    const action$ = nextActive
      ? this.coursesSvc.activate(course.id)
      : this.coursesSvc.deactivate(course.id);

    action$.subscribe({
      next: () => {
        course.active = nextActive;
        const shouldRemove =
          (!this.showInactive && !nextActive) || (this.showInactive && nextActive);
        if (shouldRemove) {
          this.courses = this.courses.filter(c => c.id !== course.id);
        }
      },
      error: (err) => console.error('❌ Error actualizando curso:', err)
    });
  }

  getAvailableInstructors(courseId?: number): InstructorDTO[] {
    if (!courseId) return [];
    return this.availableInstructors[courseId] ?? [];
  }
// 🔥 ESTE MÉTODO NO EXISTÍA → ERROR
 loadAvailableInstructors(courseId: number): void {
  this.coursesSvc.getAvailableInstructors(courseId).subscribe({
    next: (instructors) => {
      this.availableInstructors[courseId] = instructors;
    },
    error: (err) => {
      console.error('Error cargando instructores', err);
      this.availableInstructors[courseId] = [];
    }
  });
}

  private normalizeRole(role?: string | null): string {
    if (!role) return '';
    return role.replace('ROLE_', '').toUpperCase();
  }

  
}
