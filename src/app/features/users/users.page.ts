import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule, Validators } from '@angular/forms';
import { UsersService, User } from '../../core/services/users.service';
import { CoursesService } from '../../core/services/courses.service';
import { MaterialModule } from '../../material.module';
import { MatChipsModule } from '@angular/material/chips';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-users-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    MatChipsModule
  ],
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.css']
})
export class UsersPage implements OnInit {

  private fb = inject(FormBuilder);
  private usersSvc = inject(UsersService);
  private coursesSvc = inject(CoursesService);

  users: User[] = [];

  // Filtros
  searchTerm = '';
  filterRole: string = 'ALL';
  filterOrg: number | 'ALL' = 'ALL';
  filterCourse: number | 'ALL' = 'ALL';

  courses: any[] = [];
  organizations: any[] = [];
  selectedCourses: Record<number, number[]> = {};

  // PAGINACIÓN
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  loading = false;

  currentRole = sessionStorage.getItem('role');
  editingUserId: number | null = null;

  form = this.fb.group({
    username: ['', Validators.required],
    email: [''],
    password: [''],
    role: ['USER', Validators.required],
    organizationId: [null as number | null],
    courseIds: [[] as number[]]
  });

  ngOnInit() {
    this.loadCourses();
    this.loadUsers();
    if (this.isSuperAdmin()) this.loadOrganizations();
  }

  isSuperAdmin(): boolean {
    return this.currentRole === 'SUPER_ADMIN';
  }

  // ===========================================================
  // CARGA USERS (PAGINADO + FILTROS)
  // ===========================================================
  loadUsers() {
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
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', '❌ No se pudieron cargar los usuarios', 'error');
        this.loading = false;
      }
    });
  }

  applyFilter() {
    this.currentPage = 0;
    this.loadUsers();
  }

  // ===========================================================
  // PAGINADOR CUSTOM
  // ===========================================================

  minValue(a: number, b: number): number {
    return a < b ? a : b;
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadUsers();
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage() {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  // ===========================================================
  // CURSOS / ORGANIZACIONES
  // ===========================================================

  loadCourses() {
    this.coursesSvc.findAll().subscribe({
      next: (res) => this.courses = res,
      error: () => Swal.fire('Error', '❌ Error al cargar cursos', 'error')
    });
  }

  loadOrganizations() {
    this.usersSvc.getOrganizations().subscribe({
      next: (res) => this.organizations = res,
      error: () => Swal.fire('Error', '❌ Error al cargar organizaciones', 'error')
    });
  }

  // ===========================================================
  // CRUD USERS
  // ===========================================================

  saveUser() {
    if (this.form.invalid) {
      Swal.fire('Atención', 'Completa los campos requeridos', 'warning');
      return;
    }

    const dto = this.form.value;

    const payload: any = {
      fullName: dto.username!,
      email: dto.email || `${dto.username}@dojo.com`,
      password: dto.password ?? '',
      role: dto.role!,
      courseIds: dto.courseIds || []
    };

    if (this.isSuperAdmin() && dto.organizationId) {
      payload.organization = { id: dto.organizationId };
    }

    const req$ = this.editingUserId
      ? this.usersSvc.update(this.editingUserId, payload)
      : this.usersSvc.create(payload);

    req$.subscribe({
      next: () => {
        Swal.fire('Éxito', 'Usuario guardado correctamente', 'success');
        this.form.reset({ role: 'USER', courseIds: [] });
        this.editingUserId = null;
        this.loadUsers();
      },
      error: () => Swal.fire('Error', 'Error al guardar usuario', 'error')
    });
  }

  editUser(u: User) {
    this.editingUserId = u.id!;
    const ids = this.mapCourseNamesToIds(u.courses || []);

    this.form.patchValue({
      username: u.fullName,
      email: u.email,
      role: u.role,
      organizationId: u.organizationId || null,
      courseIds: ids
    });

    this.selectedCourses[u.id] = ids;
  }

  cancelEdit() {
    this.editingUserId = null;
    this.form.reset({ role: 'USER', courseIds: [] });
  }

  deleteUser(id: number) {
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
        error: () => Swal.fire('Error', 'Error al eliminar usuario', 'error')
      });
    });
  }

  // ===========================================================
  // ASIGNAR CURSOS
  // ===========================================================

  onCoursesChange(userId: number, event: any) {
    this.selectedCourses[userId] = event.value;

    if (this.editingUserId === userId) {
      this.form.patchValue({ courseIds: event.value });
    }
  }

  saveCourses(userId: number) {
    const ids = this.selectedCourses[userId] || [];

    this.usersSvc.assignCourses(userId, ids).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Cursos asignados correctamente', 'success');
        this.loadUsers();
      },
      error: () => Swal.fire('Error', '❌ Error al asignar cursos', 'error')
    });
  }

  mapCourseNamesToIds(names: string[]): number[] {
    return this.courses
      .filter(c => names.includes(c.name))
      .map(c => c.id);
  }
}
