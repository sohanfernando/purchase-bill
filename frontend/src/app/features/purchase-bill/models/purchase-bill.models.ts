export interface PurchaseBillItemRequest {
  itemName: string;
  batchLocationCode: string;
  standardCost: number;
  standardPrice: number;
  quantity: number;
  freeQuantity: number;
  discountPercent: number;
}

export interface PurchaseBillItem extends PurchaseBillItemRequest {
  id: number;
  batchLocationName: string;
  margin: number;
  totalCost: number;
  totalSelling: number;
  createdAtUtc: string;
}

export interface ItemSummary {
  totalItems: number;
  totalQuantity: number;
}
