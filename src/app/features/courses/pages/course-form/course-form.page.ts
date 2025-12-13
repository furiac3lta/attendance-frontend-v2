import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursesService } from '../../../../core/services/courses.service';

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
export class CourseFormPage implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private coursesSvc = inject(CoursesService);

  // 🔹 Estado
  courseId: number | null = null;
  isEditMode = false;
  loading = false;

  // 🔹 Formulario
  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    universityProgram: [''],
    instructorId: [1]
  });

  // 🔹 Init
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.courseId = Number(idParam);
      this.isEditMode = true;
      this.loadCourse(this.courseId);
    }
  }

  // 🔹 Cargar curso para edición
  loadCourse(id: number): void {
    this.loading = true;

    this.coursesSvc.getById(id).subscribe({
      next: (course) => {
        this.form.patchValue({
          name: course.name,
          description: course.description,
          universityProgram: course.universityProgram,
          instructorId: course.instructorId ?? 1
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el curso.',
          heightAuto: false
        }).then(() => this.router.navigate(['/courses']));
      }
    });
  }

  // 🔹 Guardar (crear o editar)
  saveCourse(): void {
    if (this.form.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completá los campos obligatorios.',
        heightAuto: false
      });
      return;
    }

    const payload = {
      name: this.form.value.name ?? '',
      description: this.form.value.description ?? '',
      universityProgram: this.form.value.universityProgram ?? '',
      instructorId: this.form.value.instructorId ?? 1
    };

    const request$ =
      this.isEditMode && this.courseId
        ? this.coursesSvc.update(this.courseId, payload)
        : this.coursesSvc.create(payload);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Curso actualizado' : 'Curso creado',
          text: 'La operación se realizó correctamente.',
          heightAuto: false
        }).then(() => this.router.navigate(['/courses']));
      },
      error: (err) => {
        console.error('❌ Error guardando curso:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el curso.',
          heightAuto: false
        });
      }
    });
  }

  // 🔹 Cancelar
  cancel(): void {
    this.router.navigate(['/courses']);
  }
}
