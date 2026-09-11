import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../http/api-base-url.token';
import { AuthService } from './auth.service';

/**
 * Adds the bearer token to API requests and signs the user out when the API rejects the token
 * (for example after it expires), sending them back to the login page.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = inject(API_BASE_URL);
  if (!request.url.startsWith(apiBaseUrl)) {
    return next(request);
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();
  const authorizedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (token && error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized) {
        authService.logout();
        void router.navigate(['/login'], { queryParams: { reason: 'session-expired' } });
      }
      return throwError(() => error);
    }),
  );
};
