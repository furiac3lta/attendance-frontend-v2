import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { Footer } from './shared/footer/footer';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, LoaderComponent, Footer, MatButtonModule, MatIconModule],
  template: `
    <app-loader></app-loader>

    <app-navbar></app-navbar>

    <router-outlet></router-outlet>

    <button
      *ngIf="showBack"
      mat-fab
      class="floating-back"
      (click)="goBack()"
      aria-label="Volver">
      <mat-icon>arrow_back</mat-icon>
    </button>

    <app-footer></app-footer>
  `,
})
export class AppComponent {
  showBack = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.showBack = this.router.url !== '/login';
      });
  }

  goBack(): void {
    history.back();
  }
}
