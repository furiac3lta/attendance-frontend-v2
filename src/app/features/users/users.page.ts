import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { UsersService, User } from '../../core/services/users.service';
import { CoursesService } from '../../core/services/courses.service';
import { MaterialModule } from '../../material.module';
import { MatChipsModule } from '@angular/material/chips';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatChipsModule,
    MatTooltipModule,
    RouterLink
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
  private auth = inject(AuthService);
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
  showInactive = false;

  // =========================
  // PAGINACIÓN
  // =========================
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  loading = false;
  currentRole: string | null = null;
  editingUserId: number | null = null;
  proPlan = false;
  tableColumns: string[] = [];

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
    newPassword: [''],
    role: ['USER', Validators.required],
    organizationId: [null as number | null],
    courseIds: [[] as number[]],
    observations: [''],
    dni: [''],
    phone: [''],
    address: ['']
  });

  // =========================
  // 📥 IMPORTAR EXCEL
  // =========================
  @ViewChild('excelInput') excelInput?: ElementRef<HTMLInputElement>;
  selectedExcelFile: File | null = null;
  excelFileName = '';
  importingExcel = false;

  // =========================
  // INIT
  // =========================
  ngOnInit(): void {
    this.currentRole = this.normalizeRole(this.auth.getRole());
    this.proPlan = this.auth.isProPlan();
    this.tableColumns = this.proPlan
      ? ['fullName','email','role','organization','courses','paid','status','history','actions']
      : ['fullName','email','role','organization','courses','status','history','actions'];
    this.loadCourses();
    this.loadUsers();
    if (this.isSuperAdmin()) this.loadOrganizations();
  }

  isSuperAdmin(): boolean {
    return this.currentRole === 'SUPER_ADMIN';
  }

  private normalizeRole(role?: string | null): string | null {
    if (!role) return null;
    return role.replace(/^ROLE_/, '').toUpperCase();
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
    params.active = !this.showInactive;

    this.usersSvc.findAll(params).subscribe({
      next: (res) => {
        this.users = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;

        // 👉 Cargar estado de pagos SOLO si hay curso filtrado
        if (this.proPlan && this.filterCourse !== 'ALL') {
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
    courseIds: ids,
    observations: u.observations || '',
    dni: u.dni || '',
    phone: u.phone || '',
    address: u.address || '',
    newPassword: ''
  });

  if (u.id) {
    this.selectedCourses[u.id] = ids;
  }
}

// =========================
// ✅ ACTIVAR / DESACTIVAR USUARIO
// =========================
toggleUserActive(user: User): void {
  if (!user.id) return;

  const nextActive = !user.active;
  const action$ = nextActive
    ? this.usersSvc.activate(user.id)
    : this.usersSvc.deactivate(user.id);

  action$.subscribe({
    next: () => {
      user.active = nextActive;
      const shouldRemove =
        (!this.showInactive && !nextActive) || (this.showInactive && nextActive);
      if (shouldRemove) {
        this.users = this.users.filter(u => u.id !== user.id);
      }
    },
    error: () => {
      Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
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
  if (!this.proPlan) {
    this.paymentStatus = {};
    return;
  }
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
  // 📥 IMPORTAR EXCEL
  // =========================
  onExcelSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.clearExcelSelection();
      return;
    }

    this.selectedExcelFile = file;
    this.excelFileName = file.name;
  }

  clearExcelSelection(): void {
    this.selectedExcelFile = null;
    this.excelFileName = '';
    if (this.excelInput?.nativeElement) {
      this.excelInput.nativeElement.value = '';
    }
  }

  uploadExcel(): void {
    if (!this.proPlan) {
      Swal.fire('Plan PRO', 'Esta función está disponible solo para plan PRO.', 'info');
      return;
    }
    if (!this.selectedExcelFile) {
      Swal.fire('Atención', 'Selecciona un archivo para importar', 'warning');
      return;
    }

    this.importingExcel = true;

    this.usersSvc.importFromExcel(this.selectedExcelFile).subscribe({
      next: (res: any) => {
        const created = res?.created ?? 0;
        const skipped = res?.skipped ?? 0;
        const errors: string[] = Array.isArray(res?.errors) ? res.errors : [];

        if (created > 0 && errors.length === 0) {
          Swal.fire('Éxito', 'Usuarios importados correctamente', 'success');
        } else if (created > 0) {
          Swal.fire(
            'Importación parcial',
            `Creados: ${created}. Omitidos: ${skipped}.`,
            'warning'
          );
        } else {
          const message = errors.length > 0
            ? errors.join('<br>')
            : 'No se importaron usuarios.';
          Swal.fire({ title: 'Error', html: message, icon: 'error' });
        }

        this.clearExcelSelection();
        this.currentPage = 0;
        this.loadUsers();
        this.importingExcel = false;
      },
      error: () => {
        Swal.fire('Error', 'No se pudo importar el archivo', 'error');
        this.importingExcel = false;
      }
    });
  }

  // =========================
  // 💰 REGISTRAR PAGO
  // =========================
goToRegisterPayment(user: User): void {
  if (!this.proPlan) {
    Swal.fire('Plan PRO', 'Esta función está disponible solo para plan PRO.', 'info');
    return;
  }

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

  const userPayload: any = {
    fullName: dto.username,
    email: dto.email || `${dto.username}@dojo.com`,
    role: dto.role,
    organizationId: dto.organizationId ?? null,
    observations: this.proPlan ? (dto.observations || null) : null,
    dni: dto.dni || null,
    phone: dto.phone || null,
    address: dto.address || null
  };

  const courseIds: number[] = dto.courseIds || [];

  // =========================
  // ✏️ EDICIÓN
  // =========================
  if (this.editingUserId) {
    const newPassword = dto.newPassword?.trim();

    this.usersSvc.update(this.editingUserId, userPayload).subscribe({
      next: () => {

        // 🔥 SEGUNDA LLAMADA: asignar cursos
        this.usersSvc.assignCourses(this.editingUserId!, courseIds).subscribe({
          next: () => {
            if (newPassword) {
              this.usersSvc.updatePassword(this.editingUserId!, newPassword).subscribe({
                next: () => {
                  Swal.fire('Éxito', 'Usuario actualizado', 'success');
                  this.cancelEdit();
                  this.currentPage = 0;
                  this.loadUsers();
                },
                error: () => {
                  Swal.fire('Error', 'No se pudo actualizar la contraseña', 'error');
                }
              });
              return;
            }

            Swal.fire('Éxito', 'Usuario actualizado', 'success');
            this.cancelEdit();
            this.currentPage = 0;
            this.loadUsers();
          },
          error: () => {
            Swal.fire('Error', 'No se pudieron asignar los cursos', 'error');
          }
        });

      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
      }
    });

    return;
  }

  // =========================
  // 🆕 ALTA
  // =========================
  if (dto.password) {
    userPayload.password = dto.password;
  }

  this.usersSvc.create(userPayload).subscribe({
    next: (createdUser: any) => {

      if (courseIds.length === 0) {
        Swal.fire('Éxito', 'Usuario creado', 'success');
        this.loadUsers();
        return;
      }

      this.usersSvc.assignCourses(createdUser.id, courseIds).subscribe({
        next: () => {
          Swal.fire('Éxito', 'Usuario creado con cursos', 'success');
          this.loadUsers();
        }
      });

    },
    error: () => {
      Swal.fire('Error', 'No se pudo crear el usuario', 'error');
    }
  });
}


}
