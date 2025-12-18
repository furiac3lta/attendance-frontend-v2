import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface DecodedToken {
  sub: string;
  exp?: number;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {

  // =========================
  // UI STATE
  // =========================
  isLoggedIn = false;
  isDark = false;
  menuOpen = false; // ✅ EXISTE

  // =========================
  // USER DATA
  // =========================
  userName: string | null = null;
  userRole: string | null = null;
  organizationName: string | null = null;

  private subRole?: Subscription;
  private subLogin?: Subscription;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // =========================
  // ROLE GETTERS (🔥 ÚNICOS)
  // =========================
  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  get isSuperAdmin(): boolean {
    return this.userRole === 'SUPER_ADMIN';
  }

  get isInstructor(): boolean {
    return this.userRole === 'INSTRUCTOR';
  }

  // =========================
  // HOME ROUTE
  // =========================
  get homeRoute(): string {
    if (this.isSuperAdmin) return '/organizations';
    if (this.isAdmin) return '/dashboard/admin';
    return '/';
  }

  // =========================
  // LIFECYCLE
  // =========================
  ngOnInit(): void {

    this.isDark = localStorage.getItem('dark') === '1';
    document.body.classList.toggle('dark-mode', this.isDark);

    this.subLogin = this.auth.loginStatus$.subscribe(logged => {
      this.isLoggedIn = logged;
      this.loadUserInfo();
    });

    this.subRole = this.auth.role$.subscribe(role => {
      this.userRole = role;
      this.loadUserInfo();
    });

    this.loadUserInfo();
  }

  ngOnDestroy(): void {
    this.subRole?.unsubscribe();
    this.subLogin?.unsubscribe();
  }

  // =========================
  // ACTIONS
  // =========================
  toggleDark(): void {
    this.isDark = !this.isDark;
    document.body.classList.toggle('dark-mode', this.isDark);
    localStorage.setItem('dark', this.isDark ? '1' : '0');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // =========================
  // USER INFO
  // =========================
  private loadUserInfo(): void {

    this.userRole = this.auth.getRole() || null;

    const user = this.auth.getUser();

    if (user) {
      this.userName = user.fullName?.split(' ')[0] ?? 'Usuario';
      this.organizationName = user.organization?.name ?? null;
      return;
    }

    const token = this.auth.getToken();
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        this.userName = decoded.sub?.split('@')[0] ?? 'Usuario';
      } catch {
        this.userName = 'Usuario';
      }
    }
  }

  // =========================
  // PERMISSIONS
  // =========================
  canSee(link: string): boolean {

    const access: Record<string, string[]> = {
      SUPER_ADMIN: ['organizations', 'users', 'courses'],
      ADMIN:       ['users', 'courses', 'payments'],
      INSTRUCTOR:  ['courses'],
    };

    return access[this.userRole ?? '']?.includes(link) ?? false;
  }
}
