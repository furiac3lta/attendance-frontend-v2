import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ClassesService, ClassSessionDto } from '../../../../core/services/classes.service';
import { CoursesService } from '../../../../core/services/courses.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';

/* Material */
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';

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
    MatInputModule,
    MatSlideToggleModule
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
  role = '';
  proPlan = false;
  showInactive = false;

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
    private datePipe: DatePipe,
    private auth: AuthService
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

    this.role = (this.auth.getRole() ?? '').replace(/^ROLE_/, '').toUpperCase();
    this.proPlan = !!this.auth.getUser()?.organizationProPlan;

    this.loadCourse();
    this.loadClasses();
  }

  loadCourse(): void {
    this.coursesSvc.findById(this.courseId).subscribe({
      next: res => this.selectedCourseName = res?.name ?? ''
    });
  }

  loadClasses(): void {
    this.classesSvc.getByCourseId(this.courseId, !this.showInactive).subscribe({
      next: classes => {
        this.classes = classes ?? [];

        this.classes.forEach(c => {
          // 🔥 USAR EL MÉTODO CORRECTO
          if (c.active === false) {
            c.attendanceTaken = false;
            return;
          }
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

  toggleInactiveView(): void {
    this.loadClasses();
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
      date: this.getLocalDateISO(),
      observations: this.newClassObservations?.trim() || null
    }).subscribe({
      next: (res: any) => {
        this.newClassObservations = '';
        this.goToAttendance(res.id);
      }
    });
  }

  createClassAndGenerateQr(): void {
    if (!this.proPlan) {
      Swal.fire('Plan PRO', 'Esta función está disponible solo para plan PRO.', 'info');
      return;
    }

    if (!['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(this.role)) {
      Swal.fire('Sin permisos', 'No tienes permisos para generar QR.', 'error');
      return;
    }

    this.classesSvc.createOrGetTodaySession(this.courseId).subscribe({
      next: (session: any) => {
        if (!session?.id) {
          Swal.fire('Error', 'No se pudo crear la clase.', 'error');
          return;
        }
        this.generateQr(session);
      },
      error: () => {
        this.classesSvc.createClass({
          name: 'Clase nueva',
          courseId: this.courseId,
          date: this.getLocalDateISO(),
          observations: this.newClassObservations?.trim() || null
        }).subscribe({
          next: (created: any) => {
            if (!created?.id) {
              Swal.fire('Error', 'No se pudo crear la clase.', 'error');
              return;
            }
            this.generateQr(created);
          },
          error: (err) => {
            const message = err?.error ?? 'No se pudo crear la clase.';
            Swal.fire('Error', message, 'error');
          }
        });
      }
    });
  }

  canUseQr(c: ClassSessionDto): boolean {
    if (!this.proPlan) return false;
    if (!['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(this.role)) return false;
    return !!c?.id;
  }

  generateQr(c: ClassSessionDto): void {
    if (!this.canUseQr(c)) {
      Swal.fire('Atención', 'No tienes permisos para generar el QR.', 'info');
      return;
    }

    this.classesSvc.generateQr(c.id).subscribe({
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

  canDeleteClass(): boolean {
    return this.role === 'SUPER_ADMIN';
  }

  toggleClassActive(c: ClassSessionDto, toggle: MatSlideToggleChange): void {
    if (!this.canDeleteClass() || !c?.id) {
      toggle.source.checked = c.active !== false;
      return;
    }

    const nextActive = toggle.checked;

    if (nextActive) {
      this.classesSvc.activate(c.id).subscribe({
        next: () => {
          c.active = true;
          if (this.showInactive) {
            this.classes = this.classes.filter(item => item.id !== c.id);
          }
        },
        error: () => {
          toggle.source.checked = c.active !== false;
          Swal.fire('Error', 'No se pudo activar la clase.', 'error');
        }
      });
      return;
    }

    Swal.fire({
      title: '¿Eliminar clase?',
      text: 'Esto realizará un borrado lógico de la clase.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      heightAuto: false
    }).then(result => {
      if (!result.isConfirmed) {
        toggle.source.checked = c.active !== false;
        return;
      }

      this.classesSvc.deactivate(c.id).subscribe({
        next: () => {
          c.active = false;
          if (!this.showInactive) {
            this.classes = this.classes.filter(item => item.id !== c.id);
          }
          Swal.fire('Clase eliminada', '', 'success');
        },
        error: () => {
          toggle.source.checked = c.active !== false;
          Swal.fire('Error', 'No se pudo eliminar la clase.', 'error');
        }
      });
    });
  }

  private getLocalDateISO(): string {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().split('T')[0];
  }

  goToReport(): void {
    if (!this.proPlan) {
      Swal.fire('Plan PRO', 'Esta función está disponible solo para plan PRO.', 'info');
      return;
    }
    this.router.navigate(['/attendance/report', this.courseId]);
  }
}
