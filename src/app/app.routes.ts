import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { RegisterComponent } from './features/auth/register/register.component';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.page').then(m => m.LoginPage)
  },

  {
    path: '',
    children: [
// 🔥 ADMIN (ve dinero)
{
  path: 'dashboard/admin',
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] },
  loadComponent: () =>
    import('./features/dashboard-admin/admin-dashboard.page')
      .then(m => m.AdminDashboardPage)
},
// app.routes.ts (o donde tengas tus routes)

{
  // ✅ ADMIN (organización) - VE dinero/pagos reales
  path: 'dashboard/admin',
  canActivate: [roleGuard],
  data: { roles: ['ADMIN'] },
  loadComponent: () =>
    import('./features/dashboard-admin/admin-dashboard.page')
      .then(m => m.AdminDashboardPage)
},

{
  // ✅ SUPER_ADMIN (sistema) - NO VE dinero
  path: 'dashboard',
  canActivate: [roleGuard],
  data: { roles: ['SUPER_ADMIN'] },
  loadComponent: () =>
    import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
},


    {
  path: 'organizations',
  canActivate: [roleGuard],
  data: { roles: ['SUPER_ADMIN'] },
  loadComponent: () =>
    import('./features/organizations/pages/organization-list/organization-list.page')
      .then(m => m.OrganizationListPage)
},


      {
        path: 'courses',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'] },
        loadComponent: () =>
          import('./features/courses/pages/course-list/courses.list.page')
            .then(m => m.CourseListPage),
      },

     {
  path: 'organizations',
  canActivate: [roleGuard],
  data: { roles: ['SUPER_ADMIN'] },
  loadComponent: () =>
    import('./features/organizations/pages/organization-list/organization-list.page')
      .then(m => m.OrganizationListPage)
},


      {
        path: 'payments/new',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        loadComponent: () =>
          import('./features/payments/pages/payment-create/payment-create')
            .then(m => m.PaymentCreatePage)
      },

      {
        path: 'register',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ADMIN'] },
        component: RegisterComponent,
      },
    ]
  },

  // ✅ CAMBIO CLAVE
  { path: '**', redirectTo: 'login' }
];
