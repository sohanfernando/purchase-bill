import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Base URL of the ASP.NET Core API, for example `http://localhost:5000/api`. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => environment.apiBaseUrl,
});

/** Requests that take longer than this are cancelled and reported as a timeout. */
export const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
