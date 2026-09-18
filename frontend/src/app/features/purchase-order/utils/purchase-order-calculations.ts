import { OrderLineDraft, OrderSummary } from '../models/purchase-order.models';

export interface LineAmountInput {
  standardCost: number | null;
  standardPrice: number | null;
  quantity: number | null;
  discountPercent: number | null;
}

export interface LineAmounts {
  margin: number;
  totalCost: number;
  totalSelling: number;
}

/**
 * Live preview of a line's amounts (the API recalculates and stores the final values):
 * - Total Cost    = Standard Cost × Qty − Discount %   (100 × 5 − 20% = 400)
 * - Total Selling = Standard Price × Qty               (150 × 5 = 750)
 * - Margin        = Standard Price − Standard Cost
 */
export function calculateLineAmounts(input: LineAmountInput): LineAmounts {
  const cost = input.standardCost ?? 0;
  const price = input.standardPrice ?? 0;
  const quantity = input.quantity ?? 0;
  const discountPercent = input.discountPercent ?? 0;

  return {
    margin: roundCurrency(price - cost),
    totalCost: roundCurrency(cost * quantity * (1 - discountPercent / 100)),
    totalSelling: roundCurrency(price * quantity),
  };
}

/**
 * Item Summary: Total Items is the number of lines, Total Qty is the sum of their Qty fields,
 * and Net Amount is the sum of their Total Cost, which is what the API stores on the order.
 */
export function summarizeLines(
  lines: readonly Pick<OrderLineDraft, 'quantity' | 'totalCost'>[],
): OrderSummary {
  return {
    totalItems: lines.length,
    totalQuantity: lines.reduce((total, line) => total + line.quantity, 0),
    netAmount: roundCurrency(lines.reduce((total, line) => total + line.totalCost, 0)),
  };
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
