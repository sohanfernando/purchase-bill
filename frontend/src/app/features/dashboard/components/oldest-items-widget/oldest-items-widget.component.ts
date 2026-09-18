import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DashboardOrderItem } from '../../models/dashboard.models';

/** Widget 2: the oldest 10 purchase order items as a list. */
@Component({
  selector: 'app-oldest-items-widget',
  imports: [DecimalPipe],
  templateUrl: './oldest-items-widget.component.html',
  styleUrl: './oldest-items-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OldestItemsWidgetComponent {
  readonly items = input.required<readonly DashboardOrderItem[]>();
}
