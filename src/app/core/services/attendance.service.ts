import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface AttendanceMark {
  userId: number;
  present: boolean;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {

  private readonly apiUrl = `${environment.API_URL}/attendance`; // ✅ AHORA APUNTA A /attendance

  constructor(private http: HttpClient) {}

 /** Reporte mensual (backend OK) */
  getMonthlyReport(courseId: number, month: number, year: number) {
    return this.http.get<any[]>(
      `${this.apiUrl}/course/${courseId}/monthly`,
      { params: { month, year } }
    );
  }

  /** ✅ Asistencia existente por clase (DTO → AttendanceMark) */
 getSessionAttendance(classId: number): Observable<AttendanceMark[]> {
  return this.http.get<any[]>(`${this.apiUrl}/class/${classId}`).pipe(
    map((list: any[]) =>
      (list ?? []).map((a: any) => ({
        userId: a.studentId,
        present: !!a.attended
      }))
    )
  );
}


  /** ✅ Crear/actualizar asistencia para la clase (sessionId = classId) */
  registerAttendance(classId: number, marks: AttendanceMark[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${classId}/attendance`, marks);
  }


  /** ✅ Nuevo método estándar */
  getByClassId(classId: number): Observable<AttendanceMark[]> {
    return this.http.get<AttendanceMark[]>(`${this.apiUrl}/class/${classId}`);
  }

  getAttendance(classId: number) {
  return this.http.get<any[]>(`${this.apiUrl}/class/${classId}`);
}

getOrCreateSession(classId: number) {
  return this.http.post<any>(`${this.apiUrl}/${classId}/sessions`, {});
}


}
