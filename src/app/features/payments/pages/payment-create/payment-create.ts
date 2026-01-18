import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../../../environments/environment';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-payment-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './payment-create.html',
  styleUrls: ['./payment-create.css']
})
export class PaymentCreatePage implements OnInit {

  form!: FormGroup;
  loading = false;

  studentId!: number;
  courseId!: number;

  studentName = '';
  courseName = '';

  paymentMethods = [
    { value: 'CASH', label: 'Efectivo' },
    { value: 'TRANSFER', label: 'Transferencia' },
    { value: 'MERCADOPAGO', label: 'MercadoPago' },
    { value: 'OTHER', label: 'Otro' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isProPlan()) {
      Swal.fire('Plan PRO', 'Esta función está disponible solo para plan PRO.', 'info');
      this.router.navigate(['/users']);
      return;
    }
    const qp = this.route.snapshot.queryParamMap;

    const studentIdParam = qp.get('studentId');
    const courseIdParam = qp.get('courseId');

    if (!studentIdParam || !courseIdParam) {
      Swal.fire('Error', 'Datos inválidos', 'error');
      this.router.navigate(['/users']);
      return;
    }

    this.studentId = Number(studentIdParam);
    this.courseId = Number(courseIdParam);

    // ✅ nombres vienen del router (no más llamados extra)
    this.studentName = qp.get('studentName') ?? 'Alumno';
    this.courseName = qp.get('courseName') ?? 'Curso';

    this.form = this.fb.group({
      studentId: [this.studentId, Validators.required],
      courseId: [this.courseId, Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      method: ['CASH', Validators.required],
      month: [new Date().getMonth() + 1, Validators.required],
      year: [new Date().getFullYear(), Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    // ✅ ACÁ ESTABA EL ERROR → ahora está BIEN
    this.http.post(
      `${environment.API_URL}/payments`,
      this.form.value
    ).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          title: 'Pago registrado',
          icon: 'success',
          heightAuto: false
        }).then(() => {
          this.router.navigate(['/users']);
        });
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        Swal.fire({
          title: 'Error',
          text: 'No se pudo registrar el pago',
          icon: 'error',
          heightAuto: false
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}
