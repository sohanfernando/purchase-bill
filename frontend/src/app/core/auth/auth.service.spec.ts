import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../http/api-base-url.token';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const apiBaseUrl = 'http://api.test';

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: apiBaseUrl },
      ],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('starts a session after a successful login', () => {
    const service = TestBed.inject(AuthService);

    service.login({ email: 'user@example.com', password: 'secret' }).subscribe();
    TestBed.inject(HttpTestingController)
      .expectOne(`${apiBaseUrl}/auth/login`)
      .flush({
        accessToken: 'token-123',
        expiresAtUtc: new Date(Date.now() + 60_000).toISOString(),
        email: 'user@example.com',
      });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.getAccessToken()).toBe('token-123');
    expect(service.currentUserEmail()).toBe('user@example.com');
  });

  it('does not start a session when the login is rejected', () => {
    const service = TestBed.inject(AuthService);

    service.login({ email: 'user@example.com', password: 'wrong' }).subscribe({ error: () => undefined });
    TestBed.inject(HttpTestingController)
      .expectOne(`${apiBaseUrl}/auth/login`)
      .flush({ detail: 'Invalid email or password.' }, { status: 401, statusText: 'Unauthorized' });

    expect(service.isAuthenticated()).toBe(false);
  });

  it('treats an expired session as logged out and clears it', () => {
    sessionStorage.setItem(
      'enhanzer.session',
      JSON.stringify({
        accessToken: 'expired-token',
        expiresAtUtc: new Date(Date.now() - 1_000).toISOString(),
        email: 'user@example.com',
      }),
    );
    const service = TestBed.inject(AuthService);

    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('enhanzer.session')).toBeNull();
  });
});
