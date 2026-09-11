import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, tap, timeout } from 'rxjs';
import { API_BASE_URL } from '../http/api-base-url.token';
import { AuthSession, LoginRequest, LoginResponse } from './auth.models';

const SESSION_STORAGE_KEY = 'enhanzer.session';

/** The backend may retry the external login API, so login gets a longer timeout than other requests. */
const LOGIN_TIMEOUT_MS = 60_000;

/**
 * Owns the authenticated session. The session is kept in sessionStorage so it is cleared when the
 * tab is closed and is not shared with other tabs; the token expiry is checked on every access.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly session = signal<AuthSession | null>(readStoredSession());

  readonly currentUserEmail = computed(() => this.session()?.email ?? null);

  login(request: LoginRequest): Observable<void> {
    return this.http.post<LoginResponse>(`${this.apiBaseUrl}/auth/login`, request).pipe(
      timeout(LOGIN_TIMEOUT_MS),
      tap((response) => this.startSession(response)),
      map(() => undefined),
    );
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    this.session.set(null);
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  /** Returns the access token, or null (and clears the session) when it is missing or expired. */
  getAccessToken(): string | null {
    const session = this.session();
    if (!session) {
      return null;
    }

    if (isExpired(session)) {
      this.logout();
      return null;
    }

    return session.accessToken;
  }

  private startSession(response: LoginResponse): void {
    const session: AuthSession = {
      accessToken: response.accessToken,
      expiresAtUtc: response.expiresAtUtc,
      email: response.email,
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    this.session.set(session);
  }
}

function isExpired(session: AuthSession): boolean {
  const expiresAt = Date.parse(session.expiresAtUtc);
  return Number.isNaN(expiresAt) || expiresAt <= Date.now();
}

function readStoredSession(): AuthSession | null {
  try {
    const storedValue = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedValue) {
      return null;
    }

    const session = JSON.parse(storedValue) as Partial<AuthSession>;
    return typeof session.accessToken === 'string' &&
      typeof session.expiresAtUtc === 'string' &&
      typeof session.email === 'string'
      ? { accessToken: session.accessToken, expiresAtUtc: session.expiresAtUtc, email: session.email }
      : null;
  } catch {
    return null;
  }
}
