using EnhanzerProject.Models.DTOs.PurchaseOrders;

namespace EnhanzerProject.Models.DTOs.Dashboard;

/// <summary>Everything the dashboard needs, in one response so the page makes a single request.</summary>
public sealed record DashboardResponse(
    IReadOnlyCollection<PurchaseOrderSummaryResponse> LatestOrders,
    IReadOnlyCollection<DashboardOrderItemResponse> OldestItems,
    IReadOnlyCollection<DashboardItemQuantityResponse> ItemQuantities);

/// <summary>A line for the list widget.</summary>
public sealed record DashboardOrderItemResponse(int PurchaseOrderId, string ItemName, int Quantity);

/// <summary>A slice of the donut chart: one item name and its total quantity.</summary>
public sealed record DashboardItemQuantityResponse(string ItemName, int TotalQuantity);
