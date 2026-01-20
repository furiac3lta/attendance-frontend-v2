# Attendance App

Frontend web app for managing organizations, courses, classes, attendance, payments, and dashboards with role-based access.

## Highlights
- Multi-tenant organizations with plan gating (FREE/PRO).
- Roles: SUPER_ADMIN, ADMIN, INSTRUCTOR, USER (Alumno).
- Class sessions with QR attendance and manual attendance.
- Dashboards and reports for admins (monthly PDF print).
- Student panel with history, payments, and personal profile.
- Soft-deactivation for users, courses, and classes.

## Roles & Access
- SUPER_ADMIN: system-wide management (organizations, users, courses).
- ADMIN: manages users/courses in their organization, dashboards/reports (PRO).
- INSTRUCTOR: takes attendance, sees courses, can view user history.
- USER: student panel, QR attendance (PRO).

## Main Areas
- Organizations: create, edit, activate/deactivate.
- Users: create/edit, assign courses, personal data (dni/phone/address), history access.
- Courses: create/edit, assign instructor, activate/deactivate.
- Classes: create sessions, generate QR, take/view attendance, soft delete.
- Attendance: register marks, view per class, monthly reports.
- Payments: create payments and view status (PRO).
- Dashboards: admin KPIs and monthly printable report (PRO).

## Student Panel
- Personal data (read-only for Instructor/User; editable by Admin/SuperAdmin).
- Courses and attendance history (PRO for full history).
- Payments history (PRO).
- Change own password.

## Debtors (PRO)
- "Clientes que adeudan" view with quick access to user history.

## Tech Stack
- Angular (standalone components)
- Angular Material
- RxJS
- SweetAlert2

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run locally:
   ```bash
   ng serve
   ```
   App runs on `http://localhost:4200/`.

## Build
```bash
ng build
```
Artifacts go to `dist/`.

## Tests
```bash
ng test
```

## Environment
API base URL is configured in:
- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

## Backend Expectations
The frontend expects these backend capabilities:
- Auth: login/register and JWT.
- Users: CRUD, history, change password, import users.
- Courses: list, create/update, activate/deactivate, assign instructor.
- Classes: list by course, create, details, QR, activate/deactivate.
- Attendance: register, view by class, QR register, monthly reports.
- Payments: create, list by course/student, payment status.
- Dashboards: admin/system endpoints.

## Notes
- QR attendance is limited to class day and PRO plan.
- Certain sections are hidden for FREE plans.
- User history shows personal data for all roles and full attendance/payment history only with PRO.

## Paths (Quick Reference)
- `/dashboard/admin`: Admin dashboard (PRO)
- `/dashboard/student`: Student panel
- `/users`: User management
- `/users/:id`: User history/detail
- `/courses`: Courses
- `/attendance/class/:courseId`: Class sessions
- `/attendance/take/:classId`: Take attendance
- `/attendance/view/:classId`: View attendance
- `/attendance/report/:courseId`: Monthly report
- `/attendance/scan`: QR scan (USER)
