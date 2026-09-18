using EnhanzerProject.Models.DTOs.Dashboard;
using EnhanzerProject.Models.DTOs.PurchaseOrders;
using EnhanzerProject.Models.Entities;

namespace EnhanzerProject.Repositories;

public interface IPurchaseOrderRepository
{
    /// <summary>Saves the order and its lines in one transaction.</summary>
    Task AddAsync(PurchaseOrder order, CancellationToken cancellationToken);

    Task<PurchaseOrder?> FindAsync(string companyCode, int id, CancellationToken cancellationToken);

    /// <summary>The company's newest orders, without their lines.</summary>
    Task<IReadOnlyCollection<PurchaseOrderSummaryResponse>> GetLatestAsync(string companyCode, int count, CancellationToken cancellationToken);

    /// <summary>The company's oldest order lines.</summary>
    Task<IReadOnlyCollection<DashboardOrderItemResponse>> GetOldestItemsAsync(string companyCode, int count, CancellationToken cancellationToken);

    /// <summary>Every line of the company grouped by item name, with quantities summed.</summary>
    Task<IReadOnlyCollection<DashboardItemQuantityResponse>> GetItemQuantitiesAsync(string companyCode, CancellationToken cancellationToken);
}
