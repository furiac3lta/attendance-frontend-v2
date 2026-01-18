import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap, Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user?: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private base = `${environment.API_URL}/auth`;

  private loginStatusSubject = new BehaviorSubject<boolean>(this.hasToken());
  loginStatus$ = this.loginStatusSubject.asObservable();

  private roleSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('role')
  );
  role$ = this.roleSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // =============================
  // 🔹 LOGIN
  // =============================
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, payload).pipe(
      tap({
        next: (res) => {
          if (!res?.token) {
            this.showError('No se recibió token');
            return;
          }

          const role = res.type?.replace(/^ROLE_/, '').toUpperCase();

          localStorage.setItem('token', res.token);
          localStorage.setItem('role', role ?? '');

          if (res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
          }

          this.loginStatusSubject.next(true);
          this.roleSubject.next(role ?? null);

          const proPlan = !!res.user?.organizationProPlan;

          switch (role) {
            case 'SUPER_ADMIN':
              this.router.navigate(['/organizations']);
              break;
            case 'ADMIN':
              this.router.navigate([proPlan ? '/dashboard/admin' : '/courses']);
              break;
            case 'INSTRUCTOR':
              this.router.navigate(['/attendance']);
              break;
            case 'USER':
              this.router.navigate(['/dashboard/student']);
              break;
            default:
              this.showError('Rol no reconocido');
              this.logout();
          }
        },
        error: (err) => {
          if (err.status === 401) {
            this.showWarning('Credenciales incorrectas');
          } else if (err.status === 403) {
            this.showError('No tenés permisos');
          } else {
            this.showError('Error de servidor');
          }
        }
      })
    );
  }

  // =============================
  // 🔹 REGISTER
  // =============================
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, payload);
  }

  // =============================
  // 🔹 LOGOUT
  // =============================
  logout(): void {
    localStorage.clear();
    this.loginStatusSubject.next(false);
    this.roleSubject.next(null);
    this.router.navigate(['/login']);

    Swal.fire({
      icon: 'info',
      title: 'Sesión cerrada',
      heightAuto: false
    });
  }

  // =============================
  // 🔹 HELPERS
  // =============================
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string {
    return localStorage.getItem('role') ?? '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser(): any | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isProPlan(): boolean {
    return !!this.getUser()?.organizationProPlan;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private showError(text: string) {
    Swal.fire({ icon: 'error', title: text, heightAuto: false });
  }

  private showWarning(text: string) {
    Swal.fire({ icon: 'warning', title: text, heightAuto: false });
  }
}
