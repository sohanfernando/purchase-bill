import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { OrderLineDraft } from '../../models/purchase-order.models';

@Component({
  selector: 'app-purchase-items-table',
  imports: [DecimalPipe],
  templateUrl: './purchase-items-table.component.html',
  styleUrl: './purchase-items-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseItemsTableComponent {
  /** Lines of the order being built. */
  readonly lines = input.required<readonly OrderLineDraft[]>();

  /** Emits the line's temporary id when its Remove button is pressed. */
  readonly remove = output<number>();
}
