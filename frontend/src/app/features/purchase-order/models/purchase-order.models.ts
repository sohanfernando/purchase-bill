/** One line as the API expects it. */
export interface PurchaseOrderItemRequest {
  itemName: string;
  batchLocationCode: string;
  standardCost: number;
  standardPrice: number;
  quantity: number;
  freeQuantity: number;
  discountPercent: number;
}

/** A line the user has added but not saved yet. Amounts are a preview; the API recalculates them. */
export interface OrderLineDraft extends PurchaseOrderItemRequest {
  tempId: number;
  batchLocationName: string;
  margin: number;
  totalCost: number;
  totalSelling: number;
}

export interface CreatePurchaseOrderRequest {
  items: PurchaseOrderItemRequest[];
}

export interface PurchaseOrderItem extends PurchaseOrderItemRequest {
  id: number;
  purchaseOrderId: number;
  batchLocationName: string;
  margin: number;
  totalCost: number;
  totalSelling: number;
  createdAtUtc: string;
}

export interface PurchaseOrder {
  id: number;
  netAmount: number;
  itemCount: number;
  createdAtUtc: string;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderSummary {
  id: number;
  netAmount: number;
  itemCount: number;
  createdAtUtc: string;
}

/** Totals shown in the Item Summary panel while the order is being built. */
export interface OrderSummary {
  totalItems: number;
  totalQuantity: number;
  netAmount: number;
}
