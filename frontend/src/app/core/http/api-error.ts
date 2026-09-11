import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

export interface ApiError {
  message: string;
  /** Field-level validation messages keyed by the camelCase form control name. */
  fieldErrors: Record<string, string>;
}

/** Shape of the RFC 7807 problem details returned by the ASP.NET Core API. */
interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

const MESSAGES = {
  timeout: 'The server took too long to respond. Please try again.',
  unreachable: 'Cannot reach the server. Check that the API is running and try again.',
  validation: 'Please correct the highlighted fields.',
  tooManyRequests: 'Too many attempts. Please wait a moment and try again.',
  server: 'Something went wrong on the server. Please try again later.',
};

/** Converts any HTTP failure into a message that can be shown to the user. */
export function toApiError(error: unknown, fallbackMessage: string): ApiError {
  if (error instanceof TimeoutError) {
    return withoutFieldErrors(MESSAGES.timeout);
  }

  if (!(error instanceof HttpErrorResponse)) {
    return withoutFieldErrors(fallbackMessage);
  }

  if (error.status === 0) {
    return withoutFieldErrors(MESSAGES.unreachable);
  }

  const problem = readProblemDetails(error.error);
  const fieldErrors = toFieldErrors(problem.errors);

  if (problem.detail) {
    return { message: problem.detail, fieldErrors };
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { message: MESSAGES.validation, fieldErrors };
  }

  if (error.status === HttpStatusCode.TooManyRequests) {
    return withoutFieldErrors(MESSAGES.tooManyRequests);
  }

  return withoutFieldErrors(error.status >= 500 ? MESSAGES.server : fallbackMessage);
}

function withoutFieldErrors(message: string): ApiError {
  return { message, fieldErrors: {} };
}

function readProblemDetails(body: unknown): ProblemDetails {
  return typeof body === 'object' && body !== null ? (body as ProblemDetails) : {};
}

function toFieldErrors(errors: Record<string, string[]> | undefined): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const [key, messages] of Object.entries(errors ?? {})) {
    // ASP.NET Core uses the C# property name ("ItemName") or a JSON path ("$.itemName").
    const field = key.replace(/^\$\./, '');
    const message = messages[0];
    if (field && message) {
      fieldErrors[field.charAt(0).toLowerCase() + field.slice(1)] = message;
    }
  }

  return fieldErrors;
}
