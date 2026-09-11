namespace EnhanzerProject.Models.DTOs.PurchaseBills;

public sealed record PurchaseBillItemResponse(
    int Id,
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
