using EnhanzerProject.Models.DTOs.PurchaseBills;

namespace EnhanzerProject.Models.ServiceResults;

public sealed record AddPurchaseBillItemResult(
    PurchaseBillItemResponse? Item,
    string? ErrorField,
    string? ErrorMessage)
{
    public static AddPurchaseBillItemResult Success(PurchaseBillItemResponse item) => new(item, null, null);

    public static AddPurchaseBillItemResult Invalid(string errorField, string errorMessage) => new(null, errorField, errorMessage);
}
