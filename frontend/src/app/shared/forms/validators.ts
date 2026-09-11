import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Requires the value to match one of the options (case-insensitive). Empty values are left to
 * `Validators.required`, and nothing is rejected until the options have been loaded.
 */
export function oneOfValidator(getOptions: () => readonly string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim().toLowerCase() : '';
    const options = getOptions();
    if (!value || options.length === 0) {
      return null;
    }

    return options.some((option) => option.toLowerCase() === value) ? null : { oneOf: true };
  };
}

/** Requires a whole number. Empty values are left to `Validators.required`. */
export const integerValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  control.value === null || control.value === '' || Number.isInteger(control.value)
    ? null
    : { integer: true };
