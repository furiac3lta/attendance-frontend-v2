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
  number: number; // página actual (0-based)
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

  // ✅ Paginado
 findAll(page: number, size: number, search: string = '') {
  return this.http.get<PageResponse<User>>(
    `${this.base}?page=${page}&size=${size}&search=${search}`
  );
}


  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.base}/create`, dto, this.authHeaders());
  }

  update(id: number, data: any) {
    return this.http.put(`${this.base}/${id}`, data, this.authHeaders());
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.base}/${id}`, { ...this.authHeaders(), responseType: 'text' });
  }

  assignCourses(userId: number, courseIds: number[]): Observable<string> {
    return this.http.post(`${this.base}/${userId}/assign-courses`, courseIds, { ...this.authHeaders(), responseType: 'text' });
  }

  getInstructors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/role/INSTRUCTOR`, this.authHeaders());
  }

getOrganizations(): Observable<any[]> {
  return this.http.get<any[]>(`${environment.API_URL}/organizations`, this.authHeaders());
}


  getUsersByRole(role: string) {
  return this.http.get<any[]>(`${this.base}/role/${role}`);
}
getAllUsersNoPage(search: string = '') {
  return this.http.get<User[]>(`${this.base}/all`, { params: { search } });
}

}
