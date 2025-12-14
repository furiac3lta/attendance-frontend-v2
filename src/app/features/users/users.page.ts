import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { UsersService, User } from '../../core/services/users.service';
import { CoursesService } from '../../core/services/courses.service';
import { MaterialModule } from '../../material.module';
import { MatChipsModule } from '@angular/material/chips';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaymentService } from '../../core/services/payment.service';

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.css']
})
export class UsersPage implements OnInit {

  // =========================
  // INYECCIONES
  // =========================
  private fb = inject(FormBuilder);
  private usersSvc = inject(UsersService);
  private coursesSvc = inject(CoursesService);
  private router = inject(Router);
private paymentSvc = inject(PaymentService);
  // =========================
  // DATA
  // =========================
  users: User[] = [];
  courses: any[] = [];
  organizations: any[] = [];
  selectedCourses: Record<number, number[]> = {};

  // =========================
  // FILTROS
  // =========================
  searchTerm = '';
  filterRole: string = 'ALL';
  filterOrg: number | 'ALL' = 'ALL';
  filterCourse: number | 'ALL' = 'ALL';

  // =========================
  // PAGINACIÓN
  // =========================
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  loading = false;
  currentRole = sessionStorage.getItem('role');
  editingUserId: number | null = null;

  // =========================
  // 💰 PAGOS
  // =========================
  paymentStatus: Record<number, boolean> = {};
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  // =========================
  // FORM
  // =========================
  form = this.fb.group({
    username: ['', Validators.required],
    email: [''],
    password: [''],
    role: ['USER', Validators.required],
    organizationId: [null as number | null],
    courseIds: [[] as number[]]
  });

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    this.loadCourses();
    this.loadUsers();
    if (this.isSuperAdmin()) this.loadOrganizations();
  }

  isSuperAdmin(): boolean {
    return this.currentRole === 'SUPER_ADMIN';
  }

  // =========================
  // USERS
  // =========================
  loadUsers(): void {
    this.loading = true;

    const params: any = {
      page: this.currentPage,
      size: this.pageSize
    };

    if (this.searchTerm) params.search = this.searchTerm;
    if (this.filterRole !== 'ALL') params.role = this.filterRole;
    if (this.filterOrg !== 'ALL') params.orgId = this.filterOrg;
    if (this.filterCourse !== 'ALL') params.courseId = this.filterCourse;

    this.usersSvc.findAll(params).subscribe({
      next: (res) => {
        this.users = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;

        // 👉 Cargar estado de pagos SOLO si hay curso filtrado
        if (this.filterCourse !== 'ALL') {
          this.loadPaymentStatus(this.filterCourse);
        } else {
          this.paymentStatus = {};
        }
      },
      error: () => {
        Swal.fire('Error', '❌ No se pudieron cargar los usuarios', 'error');
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 0;
    this.loadUsers();
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }
  // =========================
// ✏️ EDITAR USUARIO
// =========================
editUser(u: User): void {
  this.editingUserId = u.id ?? null;

  const ids = this.mapCourseNamesToIds(u.courses || []);

  this.form.patchValue({
    username: u.fullName,
    email: u.email,
    role: u.role,
    organizationId: u.organizationId || null,
    courseIds: ids
  });

  if (u.id) {
    this.selectedCourses[u.id] = ids;
  }
}

// =========================
// 🗑️ ELIMINAR USUARIO
// =========================
deleteUser(id: number): void {
  Swal.fire({
    title: '¿Eliminar este usuario?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (!result.isConfirmed) return;

    this.usersSvc.remove(id).subscribe({
      next: () => {
        Swal.fire('Eliminado', 'Usuario eliminado', 'success');
        this.loadUsers();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
      }
    });
  });
}
// =========================
// 🔁 MAPEAR NOMBRES DE CURSO A IDS
// =========================
mapCourseNamesToIds(names: string[]): number[] {
  if (!names || names.length === 0) return [];

  return this.courses
    .filter(c => names.includes(c.name))
    .map(c => c.id);
}


  // =========================
  // CURSOS / ORGS
  // =========================
  loadCourses(): void {
    this.coursesSvc.findAll().subscribe({
      next: (res) => this.courses = res,
      error: () => Swal.fire('Error', '❌ Error al cargar cursos', 'error')
    });
  }

  loadOrganizations(): void {
    this.usersSvc.getOrganizations().subscribe({
      next: (res) => this.organizations = res,
      error: () => Swal.fire('Error', '❌ Error al cargar organizaciones', 'error')
    });
  }

  // =========================
  // 💰 ESTADO DE PAGOS
  // =========================
loadPaymentStatus(courseId: number): void {
  this.paymentSvc
    .getPaymentStatusByCourse(courseId, this.currentMonth, this.currentYear)
    .subscribe({
      next: (res: Record<number, boolean>) => {
        this.paymentStatus = res;
      },
      error: () => {
        this.paymentStatus = {};
      }
    });
}
cancelEdit(): void {
  this.editingUserId = null;
  this.form.reset({ role: 'USER', courseIds: [] });
}

  // =========================
  // 💰 REGISTRAR PAGO
  // =========================
  goToRegisterPayment(user: User): void {

    if (!user.courses || user.courses.length === 0) {
      Swal.fire('Atención', 'El alumno no tiene cursos asignados', 'warning');
      return;
    }

    const courseName = user.courses[0];
    const course = this.courses.find(c => c.name === courseName);

    if (!course) {
      Swal.fire('Error', 'No se pudo identificar el curso', 'error');
      return;
    }

    this.router.navigate(['/payments/new'], {
      queryParams: {
        studentId: user.id,
        studentName: user.fullName,
        courseId: course.id,
        courseName: course.name
      }
    });
  }
  // =========================
// 💾 GUARDAR USUARIO (ALTA / EDICIÓN)
// =========================
saveUser(): void {

  if (this.form.invalid) {
    Swal.fire('Atención', 'Completa los campos requeridos', 'warning');
    return;
  }

  const dto = this.form.value;

  const payload: any = {
    fullName: dto.username,
    email: dto.email || `${dto.username}@dojo.com`,
    role: dto.role,
    courseIds: dto.courseIds || []
  };

  // Password solo en alta
  if (!this.editingUserId && dto.password) {
    payload.password = dto.password;
  }

  const request$ = this.editingUserId
    ? this.usersSvc.update(this.editingUserId, payload)
    : this.usersSvc.create(payload);

  request$.subscribe({
   next: () => {
  Swal.fire('Éxito', 'Usuario guardado correctamente', 'success');
  this.cancelEdit();

  this.currentPage = 0;   // 🔥 CLAVE
  this.loadUsers();
}
,
    error: () => {
      Swal.fire('Error', 'No se pudo guardar el usuario', 'error');
    }
  });
}

}
