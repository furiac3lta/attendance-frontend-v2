import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization } from '../../features/organizations/models/organization.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrganizationsService {
  private apiUrl = `${environment.API_URL}/organizations`;

  constructor(private http: HttpClient) {}

  /** 🔹 Obtener todas las organizaciones */
  findAll(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.apiUrl);
  }

  /** 🔹 Obtener una organización por ID */
  findById(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  /** 🔹 Crear nueva organización */
  create(org: Organization): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, org);
  }

  /** 🔹 Actualizar organización existente */
  update(id: number, org: Organization): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${id}`, org);
  }

  /** 🔹 Eliminar organización */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /** 🔹 Asignar un ADMIN a la organización */
  assignAdmin(orgId: number, userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orgId}/assign-admin/${userId}`, {});
  }
}
