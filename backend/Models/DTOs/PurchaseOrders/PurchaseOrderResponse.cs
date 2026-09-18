namespace EnhanzerProject.Models.DTOs.PurchaseOrders;

public sealed record PurchaseOrderResponse(
    int Id,
    decimal NetAmount,
    int ItemCount,
    DateTime CreatedAtUtc,
    IReadOnlyCollection<PurchaseOrderItemResponse> Items);

public sealed record PurchaseOrderItemResponse(
    int Id,
    int PurchaseOrderId,
    string ItemName,
    string BatchLocationCode,
    string BatchLocationName,
    decimal StandardCost,
    decimal StandardPrice,
    decimal Margin,
    int Quantity,
    int FreeQuantity,
    decimal DiscountPercent,
    decimal TotalCost,
    decimal TotalSelling,
    DateTime CreatedAtUtc);

/// <summary>An order without its lines, used for list views.</summary>
public sealed record PurchaseOrderSummaryResponse(
    int Id,
    decimal NetAmount,
    int ItemCount,
    DateTime CreatedAtUtc);
