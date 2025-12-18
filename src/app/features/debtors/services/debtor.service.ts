import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Debtor } from '../models/debtor.model';

@Injectable({ providedIn: 'root' })
export class DebtorService {

  private apiUrl = `${environment.API_URL}/dashboard/admin/debtors`;

  constructor(private http: HttpClient) {}

  getDebtors(): Observable<Debtor[]> {
    return this.http.get<Debtor[]>(this.apiUrl);
  }
}
