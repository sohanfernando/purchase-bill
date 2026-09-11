import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { toApiError } from './api-error';

describe('toApiError', () => {
  it('explains when the server cannot be reached', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(toApiError(error, 'fallback').message).toContain('Cannot reach the server');
  });

  it('uses the problem details message from the API', () => {
    const error = new HttpErrorResponse({
      status: 401,
      error: { title: 'Invalid credentials', detail: 'Invalid email or password.' },
    });

    expect(toApiError(error, 'fallback').message).toBe('Invalid email or password.');
  });

  it('maps validation errors to camelCase form fields', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        title: 'One or more validation errors occurred.',
        errors: { ItemName: ['Select an item from the list.'] },
      },
    });

    expect(toApiError(error, 'fallback')).toEqual({
      message: 'Please correct the highlighted fields.',
      fieldErrors: { itemName: 'Select an item from the list.' },
    });
  });

  it('does not blame the user for unexpected server errors', () => {
    const error = new HttpErrorResponse({ status: 500, error: { title: 'An error occurred.' } });

    expect(toApiError(error, 'Check your email and password.').message).toContain('Something went wrong');
  });

  it('reports timeouts', () => {
    expect(toApiError(new TimeoutError(), 'fallback').message).toContain('took too long');
  });
});
