import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [

  // =========================
  // AUTH
  // =========================
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.page')
        .then(m => m.LoginPage)
  },

  // =========================
  // APP PROTEGIDA
  // =========================
  {
    path: '',
    children: [

      // =========================
      // ADMIN → DASHBOARD REAL
      // =========================
      {
        path: 'dashboard/admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/dashboard-admin/admin-dashboard.page')
            .then(m => m.AdminDashboardPage)
      },

      // =========================
      // SUPER_ADMIN → SISTEMA
      // =========================
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] },
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      // =========================
      // USUARIOS (ADMIN + SUPER_ADMIN)
      // =========================
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        loadComponent: () =>
          import('./features/users/users.page')
            .then(m => m.UsersPage)
      },

      // =========================
      // ORGANIZACIONES
      // =========================
      {
        path: 'organizations',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] },
        loadComponent: () =>
          import('./features/organizations/pages/organization-list/organization-list.page')
            .then(m => m.OrganizationListPage)
      },

      // =========================
      // CURSOS
      // =========================
      {
        path: 'courses',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/courses/pages/course-list/courses.list.page')
            .then(m => m.CourseListPage)
      },

      // =========================
      // PAGOS
      // =========================
      {
        path: 'payments/new',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/payments/pages/payment-create/payment-create')
            .then(m => m.PaymentCreatePage)
      },

      // =========================
      // REGISTRO
      // =========================
      {
        path: 'register',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        component: RegisterComponent
      }
    ]
  },

  // =========================
  // FALLBACK
  // =========================
  {
    path: '**',
    redirectTo: 'login'
  }
];
