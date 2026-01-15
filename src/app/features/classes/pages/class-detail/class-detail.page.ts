import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ClassesService, ClassSessionDto } from '../../../../core/services/classes.service';
import { CoursesService } from '../../../../core/services/courses.service';
import { AttendanceService } from '../../../../core/services/attendance.service';

/* Material */
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-class-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [DatePipe],
  templateUrl: './class-detail.page.html',
  styleUrls: ['./class-detail.page.css']
})
export class ClassDetailPage implements OnInit {

  courseId!: number;
  selectedCourseName = '';
  currentDate = '';
  newClassObservations = '';

  classes: (ClassSessionDto & {
    attendanceTaken?: boolean;
    takenByName?: string;
    takenByRole?: string;
    takenAt?: string;
  })[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classesSvc: ClassesService,
    private coursesSvc: CoursesService,
    private attendanceSvc: AttendanceService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.courseId = Number(this.route.snapshot.paramMap.get('courseId'));
    if (!this.courseId) return;

    this.currentDate =
      this.datePipe.transform(
        new Date(),
        "EEEE d 'de' MMMM 'de' y, HH:mm 'hs'",
        'es-AR'
      ) ?? '';

    this.loadCourse();
    this.loadClasses();
  }

  loadCourse(): void {
    this.coursesSvc.findById(this.courseId).subscribe({
      next: res => this.selectedCourseName = res?.name ?? ''
    });
  }

  loadClasses(): void {
    this.classesSvc.getByCourseId(this.courseId).subscribe({
      next: classes => {
        this.classes = classes ?? [];

        this.classes.forEach(c => {
          // 🔥 USAR EL MÉTODO CORRECTO
          this.attendanceSvc.getByClassId(c.id).subscribe({
            next: (records: any[]) => {
              if (records.length > 0) {
                const first = records[0];
                c.attendanceTaken = true;
                c.takenByName = first.takenByName;
                c.takenByRole = first.takenByRole;
                c.takenAt = first.takenAt;
              } else {
                c.attendanceTaken = false;
              }
            },
            error: () => c.attendanceTaken = false
          });
        });
      }
    });
  }

  goToAttendance(classId: number): void {
    this.router.navigate(['/attendance/take', classId]);
  }

  viewAttendance(classId: number): void {
    this.router.navigate(['/attendance/view', classId]);
  }

  createClass(): void {
    // 👉 USÁ EL MÉTODO REAL QUE YA TENÉS
    this.classesSvc.createClass({
      name: 'Clase nueva',
      courseId: this.courseId,
      date: new Date().toISOString().split('T')[0],
      observations: this.newClassObservations?.trim() || null
    }).subscribe({
      next: (res: any) => {
        this.newClassObservations = '';
        this.goToAttendance(res.id);
      }
    });
  }

  goToReport(): void {
    this.router.navigate(['/attendance/report', this.courseId]);
  }
}
