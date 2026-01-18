import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      // 🔥 SOLO si realmente es sesión inválida
      const skipAutoLogout = req.url.includes('/api/classes/today/');

      if (error.status === 401 && !req.url.includes('/auth/login') && !skipAutoLogout) {
        Swal.fire({
          title: 'Sesión expirada',
          text: 'Volvé a iniciar sesión.',
          icon: 'warning',
          heightAuto: false
        }).then(() => {
          localStorage.clear();
          router.navigate(['/login']);
        });
      }

      return throwError(() => error);
    })
  );
};
