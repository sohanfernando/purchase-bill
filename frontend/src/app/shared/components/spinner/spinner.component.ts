import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Circular loading indicator that inherits the surrounding text colour. */
@Component({
  selector: 'app-spinner',
  template: `<span
    class="spinner"
    [class.spinner--small]="size() === 'small'"
    role="status"
    [attr.aria-label]="label()"
  ></span>`,
  styles: `
    :host {
      display: inline-flex;
    }

    .spinner {
      width: 22px;
      height: 22px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .spinner--small {
      width: 14px;
      height: 14px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation-duration: 1.6s;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {
  readonly size = input<'small' | 'medium'>('medium');
  readonly label = input('Loading');
}
