import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface StudentDto {
  id: number;
  fullName: string;
  email?: string;
}

export interface ClassSessionDto {
  id: number;
  name: string;
  date: string;
  attendanceTaken?: boolean;
  courseId: number;
  observations?: string | null;
  active?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ClassesService {
  private readonly apiUrl = `${environment.API_URL}/classes`;

  constructor(private http: HttpClient) {}

  /** ✅ Crear clase */
  createClass(data: { name: string; date: string; courseId: number; observations?: string | null }): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  /** ✅ Clases por curso */
  getByCourseId(courseId: number, active: boolean = true): Observable<ClassSessionDto[]> {
    return this.http.get<ClassSessionDto[]>(`${this.apiUrl}/course/${courseId}`, {
      params: { active }
    });
  }

  /** ✅ Obtener clase por ID */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /** ✅ Obtener detalles */
  getDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/details`);
  }

  /** ✅ Lista alumnos */
  getStudentsForClass(classId: number): Observable<StudentDto[]> {
    return this.http.get<StudentDto[]>(`${this.apiUrl}/${classId}/students`);
  }

  /** 🔥 Redundante pero permitido (tu app lo usa) */
  getClassDetails(classId: number) {
    return this.http.get<any>(`${this.apiUrl}/${classId}/details`);
  }

  generateQr(classId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${classId}/qr`, {});
  }

  createOrGetTodaySession(courseId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/today/${courseId}`);
  }

  deactivate(classId: number): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/${classId}/deactivate`,
      {},
      { responseType: 'text' as const }
    );
  }

  activate(classId: number): Observable<string> {
    return this.http.put(
      `${this.apiUrl}/${classId}/activate`,
      {},
      { responseType: 'text' as const }
    );
  }
}
