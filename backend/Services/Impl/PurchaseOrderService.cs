using EnhanzerProject.Models.DTOs.PurchaseOrders;
using EnhanzerProject.Models.Entities;
using EnhanzerProject.Models.ServiceResults;
using EnhanzerProject.Repositories;

namespace EnhanzerProject.Services.Impl;

public sealed class PurchaseOrderService(
    IPurchaseOrderRepository purchaseOrderRepository,
    ILocationRepository locationRepository) : IPurchaseOrderService
{
    private static readonly IReadOnlyList<string> ItemOptions =
        ["Mango", "Apple", "Banana", "Orange", "Grapes", "Kiwi", "Strawberry"];

    public IReadOnlyCollection<string> GetItemOptions() => ItemOptions;

    /// <summary>
    /// Validates every line first, so a bad line rejects the whole order and nothing is half saved.
    /// Totals are recalculated here: the values sent by the browser are only a preview.
    /// </summary>
    public async Task<CreatePurchaseOrderResult> CreateOrderAsync(
        string companyCode,
        CreatePurchaseOrderRequest request,
        CancellationToken cancellationToken)
    {
        var createdAtUtc = DateTime.UtcNow;
        var lines = new List<(PurchaseOrderItem Item, string LocationName)>(request.Items.Count);

        for (var index = 0; index < request.Items.Count; index++)
        {
            var line = request.Items[index];

            var itemName = ItemOptions.FirstOrDefault(option =>
                string.Equals(option, line.ItemName.Trim(), StringComparison.OrdinalIgnoreCase));
            if (itemName is null)
            {
                return CreatePurchaseOrderResult.Invalid(
                    $"Items[{index}].{nameof(line.ItemName)}",
                    "Select an item from the list.");
            }

            var location = await locationRepository.FindAsync(companyCode, line.BatchLocationCode.Trim(), cancellationToken);
            if (location is null)
            {
                return CreatePurchaseOrderResult.Invalid(
                    $"Items[{index}].{nameof(line.BatchLocationCode)}",
                    "Select a batch from your saved locations.");
            }

            lines.Add((new PurchaseOrderItem
            {
                CompanyCode = companyCode,
                ItemName = itemName,
                BatchLocationCode = location.LocationCode,
                StandardCost = line.StandardCost,
                StandardPrice = line.StandardPrice,
                Quantity = line.Quantity,
                FreeQuantity = line.FreeQuantity,
                DiscountPercent = line.DiscountPercent,
                TotalCost = PurchaseOrderCalculator.CalculateTotalCost(line.StandardCost, line.Quantity, line.DiscountPercent),
                TotalSelling = PurchaseOrderCalculator.CalculateTotalSelling(line.StandardPrice, line.Quantity),
                CreatedAtUtc = createdAtUtc
            }, location.LocationName));
        }

        var order = new PurchaseOrder
        {
            CompanyCode = companyCode,
            NetAmount = PurchaseOrderCalculator.CalculateNetAmount(lines.Select(line => line.Item.TotalCost)),
            ItemCount = lines.Count,
            CreatedAtUtc = createdAtUtc,
            Items = lines.Select(line => line.Item).ToList()
        };

        // One SaveChanges writes the header and every line inside a single transaction.
        await purchaseOrderRepository.AddAsync(order, cancellationToken);

        var locationNames = lines.ToDictionary(line => line.Item.Id, line => line.LocationName);
        return CreatePurchaseOrderResult.Success(ToResponse(order, locationNames));
    }

    public async Task<PurchaseOrderResponse?> GetOrderAsync(string companyCode, int id, CancellationToken cancellationToken)
    {
        var order = await purchaseOrderRepository.FindAsync(companyCode, id, cancellationToken);
        return order is null ? null : ToResponse(order, locationNames: null);
    }

    public Task<IReadOnlyCollection<PurchaseOrderSummaryResponse>> GetOrdersAsync(
        string companyCode,
        int count,
        CancellationToken cancellationToken) =>
        purchaseOrderRepository.GetLatestAsync(companyCode, count, cancellationToken);

    private static PurchaseOrderResponse ToResponse(PurchaseOrder order, IReadOnlyDictionary<int, string>? locationNames) => new(
        order.Id,
        order.NetAmount,
        order.ItemCount,
        order.CreatedAtUtc,
        order.Items.Select(item => ToResponse(item, ResolveLocationName(item, locationNames))).ToList());

    private static string ResolveLocationName(PurchaseOrderItem item, IReadOnlyDictionary<int, string>? locationNames)
    {
        if (locationNames is not null && locationNames.TryGetValue(item.Id, out var name))
        {
            return name;
        }

        // Orders read back from the database carry the location through the navigation property.
        return item.BatchLocation?.LocationName ?? item.BatchLocationCode;
    }

    private static PurchaseOrderItemResponse ToResponse(PurchaseOrderItem item, string locationName) => new(
        item.Id,
        item.PurchaseOrderId,
        item.ItemName,
        item.BatchLocationCode,
        locationName,
        item.StandardCost,
        item.StandardPrice,
        PurchaseOrderCalculator.CalculateMargin(item.StandardCost, item.StandardPrice),
        item.Quantity,
        item.FreeQuantity,
        item.DiscountPercent,
        item.TotalCost,
        item.TotalSelling,
        item.CreatedAtUtc);
}
