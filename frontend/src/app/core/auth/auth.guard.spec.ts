import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('auth guards', () => {
  function runGuard(guard: CanActivateFn, isAuthenticated: boolean): boolean | string {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => isAuthenticated } },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, { url: '/purchase-bill' } as RouterStateSnapshot),
    );
    return result instanceof UrlTree ? TestBed.inject(Router).serializeUrl(result) : (result as boolean);
  }

  it('lets signed-in users open protected pages', () => {
    expect(runGuard(authGuard, true)).toBe(true);
  });

  it('sends anonymous users to the login page', () => {
    expect(runGuard(authGuard, false)).toBe('/login');
  });

  it('sends signed-in users from the login page to the purchase bill', () => {
    expect(runGuard(guestGuard, true)).toBe('/purchase-bill');
  });
});
