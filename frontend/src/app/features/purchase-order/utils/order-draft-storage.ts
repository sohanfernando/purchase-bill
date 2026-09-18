import { OrderLineDraft } from '../models/purchase-order.models';

const DRAFT_KEY = 'purchase-order-draft';

/**
 * Keeps the lines of an unsaved order in sessionStorage, so an accidental refresh does not
 * throw away a half-built order. The draft belongs to the tab, like the session token, and is
 * cleared once the order is saved or the user signs out.
 */
export function readOrderDraft(): OrderLineDraft[] {
  try {
    const stored = sessionStorage.getItem(DRAFT_KEY);
    if (stored === null) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter(isOrderLineDraft) : [];
  } catch {
    // Unreadable or disabled storage is not worth an error: start with an empty order.
    return [];
  }
}

export function writeOrderDraft(lines: readonly OrderLineDraft[]): void {
  try {
    if (lines.length === 0) {
      sessionStorage.removeItem(DRAFT_KEY);
      return;
    }

    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(lines));
  } catch {
    // Storage can be full or blocked; the order is still in memory, so carry on.
  }
}

export function clearOrderDraft(): void {
  writeOrderDraft([]);
}

/** The stored text can be anything, so check the fields the table and the API rely on. */
function isOrderLineDraft(value: unknown): value is OrderLineDraft {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const line = value as Record<string, unknown>;
  const numbers: readonly (keyof OrderLineDraft)[] = [
    'tempId',
    'standardCost',
    'standardPrice',
    'quantity',
    'freeQuantity',
    'discountPercent',
    'margin',
    'totalCost',
    'totalSelling',
  ];

  return (
    typeof line['itemName'] === 'string' &&
    typeof line['batchLocationCode'] === 'string' &&
    typeof line['batchLocationName'] === 'string' &&
    numbers.every((field) => typeof line[field] === 'number' && Number.isFinite(line[field]))
  );
}
