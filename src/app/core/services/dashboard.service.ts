// src/app/core/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrganizationDashboard } from '../models/organization-dashboard.model';
import { AdminDashboard } from '../models/admin-dashboard.model';
import { SystemDashboard } from '../models/system-dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private api = `${environment.API_URL}/dashboard`;

  constructor(private http: HttpClient) {}

  getOrganizationDashboard(month: string): Observable<OrganizationDashboard> {
    return this.http.get<OrganizationDashboard>(
      `${this.api}/organization?month=${month}`
    );
  }

  getAdminDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(
      `${this.api}/admin`
    );
    
  }

  // ✅ NUEVO (super admin, sin dinero)
  getSystemDashboard(): Observable<SystemDashboard> {
    return this.http.get<SystemDashboard>(
      `${environment.API_URL}/dashboard/system`
    );
  }
}
