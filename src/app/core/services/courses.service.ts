import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/user.models'; // ← Ajustar ruta según tu proyecto
import { Router } from '@angular/router';
import { InstructorDTO } from '../models/instructorDTO';

@Injectable({ providedIn: 'root' })
export class CoursesService {

  private readonly apiUrl = `${environment.API_URL}/courses`;
  
private authHeaders() {
  const token = sessionStorage.getItem('token') || '';
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
}

  constructor(private http: HttpClient) {}

  // ✅ Listar todos los cursos
  findAll(active: boolean = true): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      params: { active }
    });
  }

  // ✅ Obtener curso por ID
  findById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // ✅ Crear curso
  create(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  // ✅ Editar curso
  update(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  // ✅ Activar / desactivar curso
  deactivate(id: number): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/${id}/deactivate`,
      {},
      { responseType: 'text' as const }
    );
  }

  activate(id: number): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/${id}/activate`,
      {},
      { responseType: 'text' as const }
    );
  }
  assignInstructor(courseId: number, instructorId: number) {
  return this.http.patch(`${this.apiUrl}/${courseId}/assign-instructor/${instructorId}`, {});
}
getInstructors() {
  return this.http.get<User[]>(`${environment.API_URL}/users?role=INSTRUCTOR`);
}
  /** Obtener curso por ID */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
  getAvailableInstructors(courseId: number) {
  return this.http.get<InstructorDTO[]>(
    `${environment.API_URL}/courses/${courseId}/available-instructors`,
    this.authHeaders()
  );
}

  getStudentsByCourse(courseId: number) {
    return this.http.get<any[]>(
      `${environment.API_URL}/courses/${courseId}/students`
    );
  }
}
