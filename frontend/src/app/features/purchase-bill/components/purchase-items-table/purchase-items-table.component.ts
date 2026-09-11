import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { PurchaseBillItem } from '../../models/purchase-bill.models';

@Component({
  selector: 'app-purchase-items-table',
  imports: [DecimalPipe, SpinnerComponent],
  templateUrl: './purchase-items-table.component.html',
  styleUrl: './purchase-items-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PurchaseItemsTableComponent {
  readonly items = input.required<readonly PurchaseBillItem[]>();
  readonly isLoading = input(false);
}
