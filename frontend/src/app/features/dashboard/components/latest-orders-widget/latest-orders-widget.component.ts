import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PurchaseOrderSummary } from '../../../purchase-order/models/purchase-order.models';

/** Widget 1: the latest 5 purchase orders as a table. */
@Component({
  selector: 'app-latest-orders-widget',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './latest-orders-widget.component.html',
  styleUrl: './latest-orders-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LatestOrdersWidgetComponent {
  readonly orders = input.required<readonly PurchaseOrderSummary[]>();
}
