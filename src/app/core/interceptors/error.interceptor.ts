import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {

        // 🔐 AUTH → lo maneja jwtInterceptor
        if (err.status === 401 || err.status === 403) {
          return throwError(() => err);
        }

        let message = 'Error desconocido';
        let title = 'Error';

        if (err.status === 0) {
          title = 'Sin conexión';
          message = 'No se pudo conectar con el servidor.';
        }
        else if (err.status === 404) {
          title = 'Recurso no encontrado';
          message = 'El recurso solicitado no existe.';
        }
        else if (err.status >= 500) {
          title = 'Error interno';
          message = 'Ocurrió un error en el servidor.';
        }

        // 🟡 Solo errores reales de negocio
        Swal.fire({
          icon: 'error',
          title,
          text: message,
          confirmButtonText: 'Aceptar',
          heightAuto: false
        });

        return throwError(() => err);
      })
    );
  }
}
