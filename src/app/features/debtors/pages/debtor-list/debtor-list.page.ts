import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { DebtorService } from '../../services/debtor.service';
import { Debtor } from '../../models/debtor.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule],
  templateUrl: './debtor-list.page.html',
  styleUrl: './debtor-list.page.css'
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
