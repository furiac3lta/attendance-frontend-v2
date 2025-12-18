import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { DebtorService } from '../../services/debtor.service';
import { Debtor } from '../../models/debtor.model';

@Component({
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './debtor-list.page.html',
  styleUrl: './debtor-list.page.scss'
})
export class DebtorListPage implements OnInit {

  displayedColumns = ['fullName', 'courseName', 'status', 'actions'];
  dataSource: Debtor[] = [];

  constructor(private debtorService: DebtorService) {}

  ngOnInit(): void {
    this.debtorService.getDebtors().subscribe({
      next: data => this.dataSource = data
    });
  }
}
