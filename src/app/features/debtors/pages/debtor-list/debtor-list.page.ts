import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { DebtorService } from '../../services/debtor.service';
import { Debtor } from '../../models/debtor.model';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule, RouterLink],
  templateUrl: './debtor-list.page.html',
  styleUrl: './debtor-list.page.css'
})
export class DebtorListPage implements OnInit {

  displayedColumns = ['fullName', 'courseName', 'status', 'history', 'actions'];
  dataSource: Debtor[] = [];

  constructor(
    private debtorService: DebtorService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isProPlan()) {
      Swal.fire('Plan PRO', 'Esta función está disponible solo para plan PRO.', 'info');
      this.router.navigate(['/dashboard/admin']);
      return;
    }
    this.debtorService.getDebtors().subscribe({
      next: data => this.dataSource = data
    });
  }
}
