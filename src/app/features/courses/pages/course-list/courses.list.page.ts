import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 👈 AGREGAR
import { CoursesService } from '../../../../core/services/courses.service';
import { Course } from '../../models/course.model';
import { UsersService } from '../../../../core/services/users.service';
import { User } from '../../../../core/services/users.service';
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
  message = '';
  loading = true;
  instructors: any[] = [];


  constructor(
    private router: Router,
    private coursesSvc: CoursesService,
    private usersSvc: UsersService // ← agregar esto

  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadInstructors();

  }

  loadCourses(): void {
    this.coursesSvc.findAll().subscribe({
      next: (res: Course[]) => {
        this.loading = false;
        this.courses = res.map((c: any) => ({
        ...c,
        selectedInstructorId: c.instructorId ?? null
      }));
      },
      error: () => {
        this.message = '❌ Error al obtener los cursos';
        this.loading = false;
      },
    });
  }

  canTakeAttendance(): boolean {
    const role = sessionStorage.getItem('role')?.replace('ROLE_', '') ?? '';
    return ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'].includes(role.toUpperCase());
  }

  // ✅ Va a la pantalla de clases del curso (crear/seleccionar clase)
  goToAttendance(courseId: number) {
    this.router.navigate([`/attendance/class/${courseId}`]);
  }

  goToCreateCourse(): void {
    this.router.navigate(['/courses/new']);
  }
  loadInstructors(): void {
  this.usersSvc.getInstructors().subscribe({
  next: (res: User[]) => this.instructors = res ?? [],
  error: (err: any) => console.error(err)
  });
}
onAssignInstructor(courseId: number, event: any) {
  const instructorId = Number(event.target.value);
  this.coursesSvc.assignInstructor(courseId, instructorId).subscribe({
    next: () => {
     // console.log("✅ Instructor asignado");
      this.loadCourses();
    },
    error: (err) => console.error("❌ Error asignando instructor:", err)
  });
}

saveInstructor(courseId: number, instructorId: number | null): void {
  if (!instructorId) return;

  this.coursesSvc.assignInstructor(courseId, instructorId).subscribe({
    next: () => {
     // console.log("✅ Instructor asignado");
      this.loadCourses();
    },
    error: (err) => console.error("❌ Error asignando instructor", err),
  });
}
goToReport(courseId: number) {
  this.router.navigate(['/attendance/report', courseId]);
}


}