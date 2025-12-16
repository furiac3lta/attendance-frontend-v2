import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { Footer } from './shared/footer/footer';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, LoaderComponent, Footer],
  template: `
    <app-loader></app-loader>

    <app-navbar></app-navbar>

    <router-outlet></router-outlet>

    <app-footer></app-footer>
  `,
})
export class AppComponent {}
