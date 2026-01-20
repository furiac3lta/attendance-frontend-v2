import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UsersService } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink
  ],
  templateUrl: './user-history.page.html',
  styleUrls: ['./user-history.page.css']
})
export class UserHistoryPage implements OnInit {
  userId: number | null = null;
  title = 'Historial del alumno';
  isUser = false;
  proPlan = false;
  isOwnPanel = false;
  currentRole = '';
  canEditPersonal = false;

  history: any | null = null;
  loading = false;
  updatingPassword = false;
  updatingPersonal = false;

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  personalDni = '';
  personalPhone = '';
  personalAddress = '';

  attendanceColumns = ['date', 'course', 'observations', 'status'];
  paymentColumns = ['month', 'amount', 'status'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersSvc: UsersService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    const fromRoute = param ? Number(param) : null;
    const currentUser = this.auth.getUser();
    const role = (this.auth.getRole() ?? '').replace(/^ROLE_/, '').toUpperCase();
    this.currentRole = role;
    this.isUser = role === 'USER';
    this.proPlan = !!currentUser?.organizationProPlan;
    this.canEditPersonal = ['SUPER_ADMIN', 'ADMIN'].includes(role);

    this.userId = fromRoute || currentUser?.id || null;
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    if (!param) {
      this.title = 'Mi panel';
    }
    this.isOwnPanel = this.userId === currentUser?.id;

    this.loadHistory();
  }

  loadHistory(): void {
    if (!this.userId) return;
    this.loading = true;
    this.usersSvc.getHistory(this.userId).subscribe({
      next: (res: any) => {
        this.history = res;
        this.personalDni = res?.dni ?? '';
        this.personalPhone = res?.phone ?? '';
        this.personalAddress = res?.address ?? '';
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  updateOwnPassword(): void {
    if (this.updatingPassword) return;

    const current = this.currentPassword.trim();
    const next = this.newPassword.trim();
    const confirm = this.confirmPassword.trim();

    if (!current || !next || !confirm) {
      Swal.fire('Error', 'Completá todos los campos.', 'error');
      return;
    }
    if (next.length < 6) {
      Swal.fire('Error', 'La nueva contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }
    if (next !== confirm) {
      Swal.fire('Error', 'La confirmación no coincide.', 'error');
      return;
    }

    this.updatingPassword = true;
    this.usersSvc.changeOwnPassword(current, next).subscribe({
      next: () => {
        this.updatingPassword = false;
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        Swal.fire('Listo', 'Contraseña actualizada.', 'success');
      },
      error: (err) => {
        this.updatingPassword = false;
        const message = err?.error ?? 'No se pudo actualizar la contraseña.';
        Swal.fire('Error', message, 'error');
      }
    });
  }

  updatePersonalData(): void {
    if (!this.userId || !this.history || !this.canEditPersonal) return;
    if (this.updatingPersonal) return;

    this.updatingPersonal = true;

    const payload = {
      fullName: this.history.fullName,
      email: this.history.email,
      role: this.history.role,
      observations: this.history.observations ?? null,
      dni: this.personalDni || null,
      phone: this.personalPhone || null,
      address: this.personalAddress || null
    };

    this.usersSvc.update(this.userId, payload).subscribe({
      next: () => {
        this.updatingPersonal = false;
        Swal.fire('Listo', 'Datos personales actualizados.', 'success');
        this.loadHistory();
      },
      error: (err) => {
        this.updatingPersonal = false;
        const message = err?.error ?? 'No se pudieron guardar los datos.';
        Swal.fire('Error', message, 'error');
      }
    });
  }
}
