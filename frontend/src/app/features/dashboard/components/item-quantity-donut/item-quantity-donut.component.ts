import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DashboardItemQuantity } from '../../models/dashboard.models';

/** Distinct, readable colours for the slices; reused in order for the legend. */
const PALETTE = ['#2f80d1', '#00a0a8', '#f2a03d', '#7b61ff', '#d94f70', '#2e9d5b', '#7c8aa0'];

interface DonutSlice {
  itemName: string;
  quantity: number;
  percent: number;
  color: string;
  dashOffset: number;
}

/**
 * Widget 3: items grouped by name, drawn as a donut.
 *
 * The chart is plain SVG: one circle per slice with `pathLength="100"`, so the dash array can be
 * written directly in percentages, and each slice is offset by the ones before it.
 */
@Component({
  selector: 'app-item-quantity-donut',
  imports: [DecimalPipe],
  templateUrl: './item-quantity-donut.component.html',
  styleUrl: './item-quantity-donut.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemQuantityDonutComponent {
  readonly data = input.required<readonly DashboardItemQuantity[]>();

  protected readonly totalQuantity = computed(() =>
    this.data().reduce((total, row) => total + row.totalQuantity, 0),
  );

  protected readonly slices = computed<DonutSlice[]>(() => {
    const total = this.totalQuantity();
    let covered = 0;

    return this.data().map((row, index) => {
      const percent = total === 0 ? 0 : (row.totalQuantity / total) * 100;
      const slice: DonutSlice = {
        itemName: row.itemName,
        quantity: row.totalQuantity,
        percent,
        color: PALETTE[index % PALETTE.length],
        dashOffset: -covered,
      };
      covered += percent;
      return slice;
    });
  });

  protected readonly chartLabel = computed(() => {
    const parts = this.slices().map(
      (slice) => `${slice.itemName} ${slice.quantity} (${Math.round(slice.percent)}%)`,
    );
    return `Quantity by item: ${parts.join(', ')}`;
  });
}
