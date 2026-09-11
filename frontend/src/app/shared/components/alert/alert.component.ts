import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Error message banner with an optional action button (for example "Retry"). */
@Component({
  selector: 'app-alert',
  template: `
    <div class="alert" role="alert">
      <span>{{ message() }}</span>
      @if (actionLabel(); as label) {
        <button type="button" class="alert__action" (click)="action.emit()">{{ label }}</button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .alert {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px;
      border-left: 3px solid var(--color-danger);
      border-radius: 4px;
      background: var(--color-danger-bg);
      color: var(--color-danger);
      font-size: 0.875rem;
    }

    .alert__action {
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font-weight: 600;
      text-decoration: underline;
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  readonly message = input.required<string>();
  readonly actionLabel = input<string>();
  readonly action = output<void>();
}
