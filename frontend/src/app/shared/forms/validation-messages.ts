import { ValidationErrors } from '@angular/forms';

type MessageFactory = (label: string, error: unknown) => string;

const MESSAGES: Record<string, MessageFactory> = {
  required: (label) => `${label} is required.`,
  email: () => 'Enter a valid email address.',
  min: (label, error) => `${label} must be at least ${readValue(error, 'min')}.`,
  max: (label, error) => `${label} must not be more than ${readValue(error, 'max')}.`,
  maxlength: (label, error) => `${label} must be at most ${readValue(error, 'requiredLength')} characters.`,
  integer: (label) => `${label} must be a whole number.`,
  oneOf: (label) => `Select a valid ${label.toLowerCase()} from the list.`,
  // Messages returned by the API for a specific field.
  server: (label, error) => (typeof error === 'string' ? error : `${label} is invalid.`),
};

/** Returns a user-friendly message for the first validation error of a control. */
export function getValidationMessage(errors: ValidationErrors | null, label: string): string | null {
  const firstError = errors ? Object.entries(errors)[0] : undefined;
  if (!firstError) {
    return null;
  }

  const [key, error] = firstError;
  const createMessage = MESSAGES[key];
  return createMessage ? createMessage(label, error) : `${label} is invalid.`;
}

function readValue(error: unknown, key: string): string {
  return typeof error === 'object' && error !== null && key in error
    ? String((error as Record<string, unknown>)[key])
    : '';
}
