using EnhanzerProject.Models.DTOs.PurchaseBills;
using EnhanzerProject.Models.ServiceResults;

namespace EnhanzerProject.Services;

public interface IPurchaseBillService
{
    IReadOnlyCollection<string> GetItemOptions();
    Task<IReadOnlyCollection<PurchaseBillItemResponse>> GetItemsAsync(string companyCode, CancellationToken cancellationToken);
    Task<PurchaseBillItemResponse?> GetItemAsync(string companyCode, int id, CancellationToken cancellationToken);
    Task<AddPurchaseBillItemResult> AddItemAsync(
        string companyCode,
        CreatePurchaseBillItemRequest request,
        CancellationToken cancellationToken);
}
