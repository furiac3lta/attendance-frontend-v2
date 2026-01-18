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

  private readonly apiUrl = `${environment.API_URL}/attendance`;
  private readonly paymentsUrl = `${environment.API_URL}/payments`;

  constructor(private http: HttpClient) {}

  // =====================================================
  // 📊 REPORTES
  // =====================================================

  /** Reporte mensual por curso */
  getMonthlyReport(courseId: number, month: number, year: number) {
    return this.http.get<any[]>(
      `${this.apiUrl}/course/${courseId}/monthly`,
      { params: { month, year } }
    );
  }

  // =====================================================
  // ✅ ASISTENCIA
  // =====================================================

  /** Asistencia existente por clase (normalizada) */
  getSessionAttendance(classId: number): Observable<AttendanceMark[]> {
    return this.http.get<any[]>(`${this.apiUrl}/class/${classId}`).pipe(
      map((list: any[]) =>
        (list ?? []).map(a => ({
          userId: a.studentId,
          present: !!a.attended
        }))
      )
    );
  }

  /** Crear / actualizar asistencia */
  registerAttendance(
    classId: number,
    marks: AttendanceMark[]
  ): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/session/${classId}`,
      marks
    );
  }

  /** Registrar asistencia via QR */
  registerAttendanceViaQr(classId: number, token: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/class/${classId}/qr`,
      { token }
    );
  }

  /** Obtener asistencia completa (para vista detalle) */
  getAttendance(classId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/class/${classId}`);
  }

  // =====================================================
  // 💰 PAGOS (⬅️ ESTO ES LO QUE PEDÍAS)
  // =====================================================

  /**
   * Estado de pago por alumno del curso
   * Devuelve:
   * {
   *   12: true,
   *   18: false,
   *   25: true
   * }
   */
  getPaymentStatus(courseId: number): Observable<Record<number, boolean>> {
    return this.http.get<Record<number, boolean>>(
      `${this.paymentsUrl}/status/course/${courseId}`
    );
  }
/** Alias para compatibilidad con vistas */
getByClassId(classId: number) {
  return this.getAttendance(classId);
}

}
