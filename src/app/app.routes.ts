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
      {
        path: 'dashboard/student',
        canActivate: [roleGuard],
        data: { roles: ['USER'] },
        loadComponent: () =>
          import('./features/users/pages/user-history/user-history.page')
            .then(m => m.UserHistoryPage)
      },
      {
        path: 'dashboard/morosos',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'SUPER_ADMIN'] },
        loadComponent: () =>
          import('./features/debtors/pages/debtor-list/debtor-list.page')
            .then(m => m.DebtorListPage)
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
      {
        path: 'users/:id',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR', 'USER'] },
        loadComponent: () =>
          import('./features/users/pages/user-history/user-history.page')
            .then(m => m.UserHistoryPage)
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
      {
        path: 'organizations/new',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN'] },
        loadComponent: () =>
          import('./features/organizations/pages/organization-form/organization-form.page')
            .then(m => m.OrganizationFormPage)
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
      {
        path: 'courses/new',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        loadComponent: () =>
          import('./features/courses/pages/course-form/course-form.page')
            .then(m => m.CourseFormPage)
      },
      {
        path: 'courses/edit/:id',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        loadComponent: () =>
          import('./features/courses/pages/course-form/course-form.page')
            .then(m => m.CourseFormPage)
      },

      // =========================
      // ASISTENCIAS
      // =========================
      {
        path: 'attendance',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/attendance/pages/attendance.page')
            .then(m => m.AttendancePage)
      },
      {
        path: 'attendance/class/:courseId',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/classes/pages/class-detail/class-detail.page')
            .then(m => m.ClassDetailPage)
      },
      {
        path: 'attendance/take/:classId',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/attendance/pages/attendance-take/attendance-take.page')
            .then(m => m.AttendanceTakePage)
      },
      {
        path: 'attendance/view/:classId',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/attendance/pages/attendance-view/attendance-view.page')
            .then(m => m.AttendanceViewPage)
      },
      {
        path: 'attendance/report/:courseId',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/attendance/pages/course-report/course-report.page')
            .then(m => m.CourseReportPage)
      },
      {
        path: 'attendance/scan',
        canActivate: [roleGuard],
        data: { roles: ['USER'] },
        loadComponent: () =>
          import('./features/attendance/pages/attendance-qr-scan/attendance-qr-scan.page')
            .then(m => m.AttendanceQrScanPage)
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
