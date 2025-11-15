import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CoursesService } from '../../../../core/services/courses.service';
import { Router } from '@angular/router';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-course-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './course-form.page.html',
  styleUrls: ['./course-form.page.css']
})
export class CourseFormPage {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private coursesSvc = inject(CoursesService);

  // Formulario con validaciones
  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    universityProgram: [''],
    instructorId: [1]
  });

  // Crear curso
  createCourse() {
    if (this.form.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completá los campos obligatorios.',
        heightAuto: false
      });
      return;
    }

    const dto = this.form.value;

    const payload = {
      name: dto.name ?? '',
      description: dto.description ?? '',
      universityProgram: dto.universityProgram ?? '',
      instructorId: dto.instructorId ?? 1
    };

    this.coursesSvc.create(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Curso creado',
          text: 'El curso fue creado correctamente.',
          heightAuto: false
        }).then(() => {
          this.router.navigate(['/courses']);
        });
      },
      error: (err) => {
        console.error('❌ Error al crear curso:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear el curso. Intentá nuevamente.',
          heightAuto: false
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/courses']);
  }
}
