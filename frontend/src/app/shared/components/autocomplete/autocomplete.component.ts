import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Text input with a filtered suggestion list. Works as a form control (`formControlName`) and
 * supports the keyboard: arrow keys move through the suggestions, Enter selects, Escape closes.
 */
@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
})
export class AutocompleteComponent implements ControlValueAccessor {
  readonly options = input<readonly string[]>([]);
  readonly inputId = input.required<string>();
  readonly placeholder = input('');

  protected readonly query = signal('');
  protected readonly isOpen = signal(false);
  protected readonly activeIndex = signal(-1);
  protected readonly isDisabled = signal(false);
  protected readonly listboxId = computed(() => `${this.inputId()}-listbox`);

  protected readonly filteredOptions = computed(() => {
    const term = this.query().trim().toLowerCase();
    return term
      ? this.options().filter((option) => option.toLowerCase().includes(term))
      : this.options();
  });

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.query.set(value ?? '');
  }

  registerOnChange(onChange: (value: string) => void): void {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  protected optionId(index: number): string {
    return `${this.listboxId()}-${index}`;
  }

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.onChange(value);
    this.open();
  }

  protected onBlur(): void {
    this.close();
    this.onTouched();
  }

  protected onKeydown(event: KeyboardEvent): void {
    const options = this.filteredOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) {
          this.open();
        }
        this.activeIndex.update((index) => (options.length === 0 ? -1 : (index + 1) % options.length));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update((index) =>
          options.length === 0 ? -1 : index <= 0 ? options.length - 1 : index - 1,
        );
        break;
      case 'Enter': {
        const option = options[this.activeIndex()];
        if (this.isOpen() && option) {
          event.preventDefault();
          this.select(option);
        }
        break;
      }
      case 'Escape':
        this.close();
        break;
    }
  }

  protected select(option: string): void {
    this.query.set(option);
    this.onChange(option);
    this.close();
  }

  protected open(): void {
    if (!this.isDisabled()) {
      this.isOpen.set(true);
      this.activeIndex.set(-1);
    }
  }

  private close(): void {
    this.isOpen.set(false);
    this.activeIndex.set(-1);
  }
}
