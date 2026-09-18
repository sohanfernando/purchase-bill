import { PurchaseOrderSummary } from '../../purchase-order/models/purchase-order.models';

/** One line of the list widget. */
export interface DashboardOrderItem {
  purchaseOrderId: number;
  itemName: string;
  quantity: number;
}

/** One slice of the donut widget. */
export interface DashboardItemQuantity {
  itemName: string;
  totalQuantity: number;
}

/** Everything the dashboard needs, returned by GET /api/dashboard in one response. */
export interface DashboardData {
  latestOrders: PurchaseOrderSummary[];
  oldestItems: DashboardOrderItem[];
  itemQuantities: DashboardItemQuantity[];
}
