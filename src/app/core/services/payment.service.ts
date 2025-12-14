import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private baseUrl = `${environment.API_URL}/payments`;

  constructor(private http: HttpClient) {}

  // 🔹 Estado de pago por curso (para asistencia y usuarios)
  getPaymentStatusByCourse(
    courseId: number,
    month: number,
    year: number
  ): Observable<Record<number, boolean>> {
    return this.http.get<Record<number, boolean>>(
      `${this.baseUrl}/status/course/${courseId}`,
      {
        params: {
          month,
          year
        }
      }
    );
  }

  // 🔹 Registrar pago
  createPayment(payload: any) {
    return this.http.post(`${this.baseUrl}`, payload);
  }
}
