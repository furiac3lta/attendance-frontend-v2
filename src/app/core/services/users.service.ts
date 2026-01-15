// src/app/core/services/users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  fullName?: string;
  email?: string;
  role?: string;
  active?: boolean;
  observations?: string | null;
  courses?: string[];
  organizationId?: number | null;
  organizationName?: string | null;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role: string;
  organization?: { id: number };
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = `${environment.API_URL}/users`;

  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = sessionStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }

  /** ✔ Paginado + filtros */
  findAll(params: any) {
    return this.http.get<PageResponse<User>>(this.base, {
      params,
      ...this.authHeaders()
    });
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.base}/create`, dto, this.authHeaders());
  }

  update(id: number, data: any) {
    return this.http.put(`${this.base}/${id}`, data, this.authHeaders());
  }

  deactivate(id: number): Observable<string> {
    return this.http.put(
      `${this.base}/${id}/deactivate`,
      {},
      { ...this.authHeaders(), responseType: 'text' as const }
    );
  }

  activate(id: number): Observable<string> {
    return this.http.put(
      `${this.base}/${id}/activate`,
      {},
      { ...this.authHeaders(), responseType: 'text' as const }
    );
  }

  assignCourses(userId: number, courseIds: number[]): Observable<string> {
    return this.http.post(
      `${this.base}/${userId}/assign-courses`,
      courseIds,
      { ...this.authHeaders(), responseType: 'text' }
    );
  }

  getOrganizations(): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.API_URL}/organizations`,
      this.authHeaders()
    );
  }

  getInstructors(): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.base}/role/INSTRUCTOR`,
      this.authHeaders()
    );
  }

  getUsersByRole(role: string) {
    return this.http.get<any[]>(`${this.base}/role/${role}`);
  }

  getAllUsersNoPage(search: string = '') {
    return this.http.get<User[]>(`${this.base}/all`, {
      params: { search }
    });
  }

  importFromExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.base}/import`, formData, this.authHeaders());
  }
}
