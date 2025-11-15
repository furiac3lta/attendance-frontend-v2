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
}

@Injectable({ providedIn: 'root' })
export class ClassesService {
  private readonly apiUrl = `${environment.API_URL}/classes`;

  constructor(private http: HttpClient) {}

  /** ✅ Crear clase (formato correcto) */
createClass(data: { name: string; date: string; courseId: number }): Observable<any> {
  return this.http.post<any>(this.apiUrl, data);
}


  /** ✅ Clases por curso */
  getByCourseId(courseId: number): Observable<ClassSessionDto[]> {
    return this.http.get<ClassSessionDto[]>(`${this.apiUrl}/course/${courseId}`);
  }

  /** ✅ Clase por ID */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /** ✅ Detalles */
  getDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/details`);
  }

  /** ✅ Alumnos */
  getStudentsForClass(classId: number): Observable<StudentDto[]> {
    return this.http.get<StudentDto[]>(`${this.apiUrl}/${classId}/students`);
  }
  
getClassDetails(classId: number) {
  return this.http.get<any>(`${environment.API_URL}/classes/${classId}/details`);
}


}
