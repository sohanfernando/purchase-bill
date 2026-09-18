using EnhanzerProject.Models.DTOs.PurchaseOrders;

namespace EnhanzerProject.Models.ServiceResults;

/// <summary>
/// The outcome of saving an order: either the saved order, or which field of which line was wrong.
/// Returning a result instead of throwing keeps expected validation failures off the exception path.
/// </summary>
public sealed record CreatePurchaseOrderResult(
    PurchaseOrderResponse? Order,
    string? ErrorField,
    string? ErrorMessage)
{
    public static CreatePurchaseOrderResult Success(PurchaseOrderResponse order) => new(order, null, null);

    public static CreatePurchaseOrderResult Invalid(string errorField, string errorMessage) =>
        new(null, errorField, errorMessage);
}
