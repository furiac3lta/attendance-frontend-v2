import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, RegisterRequest } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['ROLE_USER'] // valor por defecto
    });
  }

  onSubmit(): void {
    if (!this.registerForm.valid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Completá todos los campos obligatorios.',
        heightAuto: false
      });
      return;
    }

    const request: RegisterRequest = this.registerForm.value;

    this.authService.register(request).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Usuario registrado',
          text: 'El usuario fue creado correctamente.',
          heightAuto: false
        });
        this.registerForm.reset({ role: 'ROLE_USER' });
      },
      error: (err) => {
        console.error('❌ Error al registrar usuario:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: 'Hubo un problema al crear el usuario. Intentá nuevamente.',
          heightAuto: false
        });
      }
    });
  }
}
