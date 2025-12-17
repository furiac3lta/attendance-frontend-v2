import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,

  ],
  templateUrl: './login.page.html',
})
export class LoginPage {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Completá todos los campos correctamente.',
        heightAuto: false
      });
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;

        // Guardamos token y rol
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('role', res.type);

        const role = res.type?.toUpperCase(); // ADMIN | SUPER_ADMIN | INSTRUCTOR | USER

        // 🚫 BLOQUEO EXTRA POR SEGURIDAD (USER)
        if (role === 'USER') {
          Swal.fire({
            icon: 'error',
            title: 'Acceso restringido',
            text: 'Tu cuenta no tiene permisos para ingresar al sistema.',
            heightAuto: false
          });
          sessionStorage.clear();
          return;
        }

        // ✅ Mensaje OK
        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: `Acceso concedido`,
          timer: 1200,
          showConfirmButton: false,
          heightAuto: false
        });

        // 🎯 REDIRECCIÓN POR ROL
        switch (role) {
          case 'SUPER_ADMIN':
            this.router.navigate(['/dashboard/admin']);
            break;
          case 'ADMIN':
            this.router.navigate(['/dashboard']);
            break;
          case 'INSTRUCTOR':
            this.router.navigate(['/courses']);
            break;
          default:
            this.router.navigate(['/']);
            break;
        }
      },

      error: (err) => {
        this.isLoading = false;

        console.error('❌ Error de login:', err);

        let message = '❌ Error de conexión con el servidor.';

        if (err.status === 401) {
          message = '⚠️ Usuario o contraseña incorrectos.';
        } else if (err.status === 403) {
          message = '⛔ Tu cuenta no tiene permisos para ingresar.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: message,
          heightAuto: false
        });
      }
    });
  }

}
