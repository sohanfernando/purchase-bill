import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { API_BASE_URL, DEFAULT_REQUEST_TIMEOUT_MS } from '../../../core/http/api-base-url.token';
import { DashboardData } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  /** All three widgets come from one request, so the page has a single loading and error state. */
  getDashboard(): Observable<DashboardData> {
    return this.http
      .get<DashboardData>(`${this.apiBaseUrl}/dashboard`)
      .pipe(timeout(DEFAULT_REQUEST_TIMEOUT_MS));
  }
}
