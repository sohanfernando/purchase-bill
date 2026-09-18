using EnhanzerProject.Models.DTOs.PurchaseOrders;
using EnhanzerProject.Models.ServiceResults;

namespace EnhanzerProject.Services;

public interface IPurchaseOrderService
{
    IReadOnlyCollection<string> GetItemOptions();

    Task<CreatePurchaseOrderResult> CreateOrderAsync(
        string companyCode,
        CreatePurchaseOrderRequest request,
        CancellationToken cancellationToken);

    Task<PurchaseOrderResponse?> GetOrderAsync(string companyCode, int id, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<PurchaseOrderSummaryResponse>> GetOrdersAsync(
        string companyCode,
        int count,
        CancellationToken cancellationToken);
}
