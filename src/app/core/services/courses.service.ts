import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../models/user.models'; // ← Ajustar ruta según tu proyecto
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CoursesService {

  private readonly apiUrl = `${environment.API_URL}/courses`;

  constructor(private http: HttpClient) {}

  // ✅ Listar todos los cursos
  findAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
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

  // ✅ Eliminar curso
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
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

}
