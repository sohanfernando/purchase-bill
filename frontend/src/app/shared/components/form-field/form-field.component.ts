import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl } from '@angular/forms';
import { of, startWith, switchMap } from 'rxjs';
import { getValidationMessage } from '../../forms/validation-messages';

/**
 * Wraps a projected form control with a label, the underlined field style and its validation
 * message. The message appears once the control is touched (on blur or when the form is submitted).
 *
 * Content slots: `[fieldIcon]` (shown before the label), the control itself, and `[fieldSuffix]`
 * (shown after the control, e.g. a show-password button).
 */
@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  readonly label = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly control = input<AbstractControl | null>(null);
  readonly required = input(false, { transform: booleanAttribute });

  // Form controls are not signals, so re-read the control whenever it emits a value, status or touched event.
  private readonly controlEvent = toSignal(
    toObservable(this.control).pipe(
      switchMap((control) => (control ? control.events.pipe(startWith(null)) : of(null))),
    ),
    { initialValue: null },
  );

  readonly errorMessage = computed(() => {
    this.controlEvent();
    const control = this.control();
    return control?.invalid && control.touched ? getValidationMessage(control.errors, this.label()) : null;
  });
}
