import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, timeout } from 'rxjs';
import { API_BASE_URL, DEFAULT_REQUEST_TIMEOUT_MS } from '../http/api-base-url.token';
import { UserLocation } from './location.model';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  /** Loads the signed-in company's locations from the Location_Details table. */
  getLocations(): Observable<UserLocation[]> {
    return this.http
      .get<UserLocation[]>(`${this.apiBaseUrl}/locations`)
      .pipe(timeout(DEFAULT_REQUEST_TIMEOUT_MS));
  }
}
