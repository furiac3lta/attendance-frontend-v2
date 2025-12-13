import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2'; // ✅ ESTE ERA EL QUE FALTABA


export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      // 🔥 SOLO auth
      if (error.status === 401 || error.status === 403) {
        Swal.fire({
          title: 'Sesión inválida',
          text: 'Tu sesión expiró. Iniciá sesión nuevamente.',
          icon: 'error',
          heightAuto: false
        }).then(() => {
          localStorage.clear();
          sessionStorage.clear();
          router.navigate(['/login']);
        });
      }

      // ❌ NO mostrar alert para otros errores
      return throwError(() => error);
    })
  );
};
