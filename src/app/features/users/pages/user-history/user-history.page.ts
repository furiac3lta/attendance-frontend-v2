import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { UsersService } from '../../../../core/services/users.service';
import { AuthService } from '../../../../core/services/auth.service';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatButtonModule,
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

  history: any | null = null;
  loading = false;

  attendanceColumns = ['date', 'course', 'status'];
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
    this.isUser = role === 'USER';
    this.proPlan = !!currentUser?.organizationProPlan;

    this.userId = fromRoute || currentUser?.id || null;
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    if (!param) {
      this.title = 'Mi panel';
    }

    if (this.proPlan) {
      this.loadHistory();
    }
  }

  loadHistory(): void {
    if (!this.userId) return;
    this.loading = true;
    this.usersSvc.getHistory(this.userId).subscribe({
      next: (res: any) => {
        this.history = res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
