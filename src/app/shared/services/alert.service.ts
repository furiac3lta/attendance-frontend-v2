import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {

  success(msg: string) {
    Swal.fire({
      icon: 'success',
      title: 'Éxito',
      text: msg,
      confirmButtonText: 'Aceptar',
      heightAuto: false,
    });
  }

  error(msg: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg,
      confirmButtonText: 'Aceptar',
      heightAuto: false,
    });
  }

  warning(msg: string) {
    Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: msg,
      confirmButtonText: 'Aceptar',
      heightAuto: false,
    });
  }

  info(msg: string) {
    Swal.fire({
      icon: 'info',
      title: 'Información',
      text: msg,
      confirmButtonText: 'Aceptar',
      heightAuto: false,
    });
  }

  confirm(msg: string): Promise<boolean> {
    return Swal.fire({
      icon: 'question',
      title: 'Confirmar',
      text: msg,
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      heightAuto: false,
    }).then(r => r.isConfirmed);
  }
}
