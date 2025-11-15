import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
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
  private roleSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('role'));

  private loginStatus = new BehaviorSubject<boolean>(this.hasToken());
  loginStatus$ = this.loginStatus.asObservable();
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  // ======================================================
  // 🔹 LOGIN con SweetAlert2
  // ======================================================
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, payload).pipe(
      tap({
        next: (res) => {
          if (res && res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', res.type);

            if (res.user) {
              localStorage.setItem('user', JSON.stringify(res.user));
            }

            this.loginStatus.next(true);

            const role = res.type?.replace(/^ROLE_/, '').toUpperCase();

            // 🔁 Redirección según rol
            switch (role) {
              case 'SUPER_ADMIN':
                this.router.navigate(['/organizations']);
                break;

              case 'ADMIN':
                this.router.navigate(['/users']);
                break;

              case 'INSTRUCTOR':
                this.router.navigate(['/attendance']);
                break;

              case 'USER':
                this.router.navigate(['/courses']);
                break;

              default:
                Swal.fire({
                  title: 'Error',
                  text: 'Rol no reconocido. Contactá al administrador.',
                  icon: 'error',
                  heightAuto: false
                });
                this.logout();
                break;
            }
          } else {
            Swal.fire({
              title: 'Error',
              text: 'No se recibió token desde el servidor.',
              icon: 'error',
              heightAuto: false
            });
          }
        },

        error: (err) => {
          if (err.status === 403) {
            Swal.fire({
              title: 'Acceso denegado',
              text: 'Tu cuenta no tiene permisos para ingresar.',
              icon: 'error',
              heightAuto: false
            });
          } else if (err.status === 401) {
            Swal.fire({
              title: 'Credenciales incorrectas',
              text: 'Revisá tu email y contraseña.',
              icon: 'warning',
              heightAuto: false
            });
          } else {
            Swal.fire({
              title: 'Error de servidor',
              text: 'No se pudo conectar. Intentá nuevamente.',
              icon: 'error',
              heightAuto: false
            });
          }
        },
      })
    );
  }

  // ======================================================
  // 🔹 REGISTRO
  // ======================================================
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/register`, payload);
  }

  // ======================================================
  // 🔹 LOGOUT
  // ======================================================
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.loginStatus.next(false);
    this.roleSubject.next(null);

    this.router.navigate(['/login']);

    Swal.fire({
      title: 'Sesión cerrada',
      text: 'Has salido correctamente.',
      icon: 'info',
      heightAuto: false
    });
  }

  // ======================================================
  // 🔹 TOKEN
  // ======================================================
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string {
    const role = localStorage.getItem('role');
    return role ? role.replace(/^ROLE_/, '').toUpperCase() : '';
  }

  // ======================================================
  // 🔹 OBTENER USUARIO
  // ======================================================
  getUser(): any | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }
}
