using EnhanzerProject.Data;
using EnhanzerProject.Models.DTOs.Dashboard;
using EnhanzerProject.Models.DTOs.PurchaseOrders;
using EnhanzerProject.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnhanzerProject.Repositories.Impl;

/// <summary>
/// The dashboard queries project straight into response records, so EF selects only the needed
/// columns and never materialises entities it would immediately throw away.
/// </summary>
public sealed class PurchaseOrderRepository(ApplicationDbContext dbContext) : IPurchaseOrderRepository
{
    public async Task AddAsync(PurchaseOrder order, CancellationToken cancellationToken)
    {
        dbContext.PurchaseOrders.Add(order);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task<PurchaseOrder?> FindAsync(string companyCode, int id, CancellationToken cancellationToken) =>
        dbContext.PurchaseOrders.AsNoTracking()
            .Include(order => order.Items)
                .ThenInclude(item => item.BatchLocation)
            .FirstOrDefaultAsync(order => order.CompanyCode == companyCode && order.Id == id, cancellationToken);

    public async Task<IReadOnlyCollection<PurchaseOrderSummaryResponse>> GetLatestAsync(
        string companyCode,
        int count,
        CancellationToken cancellationToken) =>
        await dbContext.PurchaseOrders.AsNoTracking()
            .Where(order => order.CompanyCode == companyCode)
            .OrderByDescending(order => order.CreatedAtUtc)
            .ThenByDescending(order => order.Id)
            .Take(count)
            .Select(order => new PurchaseOrderSummaryResponse(order.Id, order.NetAmount, order.ItemCount, order.CreatedAtUtc))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyCollection<DashboardOrderItemResponse>> GetOldestItemsAsync(
        string companyCode,
        int count,
        CancellationToken cancellationToken) =>
        await dbContext.PurchaseOrderItems.AsNoTracking()
            .Where(item => item.CompanyCode == companyCode)
            .OrderBy(item => item.CreatedAtUtc)
            .ThenBy(item => item.Id)
            .Take(count)
            .Select(item => new DashboardOrderItemResponse(item.PurchaseOrderId, item.ItemName, item.Quantity))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyCollection<DashboardItemQuantityResponse>> GetItemQuantitiesAsync(
        string companyCode,
        CancellationToken cancellationToken)
    {
        // EF Core cannot translate a GroupBy that projects into a record constructor,
        // so group into an anonymous type (translated to GROUP BY / SUM) and map afterwards.
        var totals = await dbContext.PurchaseOrderItems.AsNoTracking()
            .Where(item => item.CompanyCode == companyCode)
            .GroupBy(item => item.ItemName)
            .Select(group => new { ItemName = group.Key, TotalQuantity = group.Sum(item => item.Quantity) })
            .OrderByDescending(total => total.TotalQuantity)
            .ToListAsync(cancellationToken);

        return totals
            .Select(total => new DashboardItemQuantityResponse(total.ItemName, total.TotalQuantity))
            .ToList();
    }
}
