import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-attendance-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.page.html',
})
export class AttendancePage implements OnInit {
  attendances: any[] = [];
  message = '';
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getAll();
  }

  /** 🔹 Cargar todas las asistencias */
  getAll(): void {
    this.http.get('http://localhost:8080/api/attendance').subscribe({
      next: (res: any) => {
        this.attendances = Array.isArray(res)
          ? res.map((a) => ({
              ...a,
              classDate: a.classDate
                ? new Date(a.classDate).toLocaleDateString('es-AR')
                : '—',
              instructorName: a.instructorName || '—',
            }))
          : [];
        //console.log('📋 Asistencias obtenidas:', this.attendances);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar asistencias:', err);
        this.loading = false;
      },
    });
  }
}
