import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import { jwtInterceptor } from './app/core/interceptors/jwt.interceptor';
import { LoaderInterceptor } from './app/core/interceptors/loader.interceptor';
import { ErrorInterceptor } from './app/core/interceptors/error.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

/* ============================= */
/* ✅ LOCALE ESPAÑOL ARGENTINA   */
/* ============================= */
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';

registerLocaleData(localeEsAr);
/* ============================= */

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers!,

    /* ✅ Locale global */
    { provide: LOCALE_ID, useValue: 'es-AR' },

    // 1️⃣ JWT Interceptor (TOKEN)
    provideHttpClient(withInterceptors([jwtInterceptor])),

    // 2️⃣ LoaderInterceptor clásico (spinner)
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },

    // 3️⃣ Nuevo Interceptor GLOBAL SweetAlert
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
}).catch(err => console.error(err));
