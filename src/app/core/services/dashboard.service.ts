import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrganizationDashboard } from '../models/organization-dashboard.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = `${environment.API_URL}/dashboard`;

  constructor(private http: HttpClient) {}

  getOrganizationDashboard(month: string): Observable<OrganizationDashboard> {
    return this.http.get<OrganizationDashboard>(
      `${this.apiUrl}/organization?month=${month}`
    );
  }
}
