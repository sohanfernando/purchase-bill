import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-item-summary',
  imports: [DecimalPipe],
  templateUrl: './item-summary.component.html',
  styleUrl: './item-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemSummaryComponent {
  readonly totalItems = input.required<number>();
  readonly totalQuantity = input.required<number>();
}
