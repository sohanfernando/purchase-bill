using EnhanzerProject.Models.DTOs.Dashboard;
using EnhanzerProject.Repositories;

namespace EnhanzerProject.Services.Impl;

public sealed class DashboardService(IPurchaseOrderRepository purchaseOrderRepository) : IDashboardService
{
    private const int LatestOrderCount = 5;
    private const int OldestItemCount = 10;

    /// <summary>
    /// Loads all three widgets. The queries are independent but share one DbContext,
    /// which is not thread safe, so they run one after another.
    /// </summary>
    public async Task<DashboardResponse> GetDashboardAsync(string companyCode, CancellationToken cancellationToken)
    {
        var latestOrders = await purchaseOrderRepository.GetLatestAsync(companyCode, LatestOrderCount, cancellationToken);
        var oldestItems = await purchaseOrderRepository.GetOldestItemsAsync(companyCode, OldestItemCount, cancellationToken);
        var itemQuantities = await purchaseOrderRepository.GetItemQuantitiesAsync(companyCode, cancellationToken);

        return new DashboardResponse(latestOrders, oldestItems, itemQuantities);
    }
}
