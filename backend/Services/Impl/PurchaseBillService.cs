using EnhanzerProject.Models.DTOs.PurchaseBills;
using EnhanzerProject.Models.Entities;
using EnhanzerProject.Models.ServiceResults;
using EnhanzerProject.Repositories;

namespace EnhanzerProject.Services.Impl;

public sealed class PurchaseBillService(
    IPurchaseBillRepository purchaseBillRepository,
    ILocationRepository locationRepository) : IPurchaseBillService
{
    private static readonly IReadOnlyList<string> ItemOptions =
        ["Mango", "Apple", "Banana", "Orange", "Grapes", "Kiwi", "Strawberry"];

    public IReadOnlyCollection<string> GetItemOptions() => ItemOptions;

    public async Task<IReadOnlyCollection<PurchaseBillItemResponse>> GetItemsAsync(
        string companyCode,
        CancellationToken cancellationToken)
    {
        var items = await purchaseBillRepository.GetByCompanyAsync(companyCode, cancellationToken);
        return items.Select(item => ToResponse(item, item.BatchLocation?.LocationName)).ToList();
    }

    public async Task<PurchaseBillItemResponse?> GetItemAsync(string companyCode, int id, CancellationToken cancellationToken)
    {
        var item = await purchaseBillRepository.FindAsync(companyCode, id, cancellationToken);
        return item is null ? null : ToResponse(item, item.BatchLocation?.LocationName);
    }

    public async Task<AddPurchaseBillItemResult> AddItemAsync(
        string companyCode,
        CreatePurchaseBillItemRequest request,
        CancellationToken cancellationToken)
    {
        var itemName = ItemOptions.FirstOrDefault(option =>
            string.Equals(option, request.ItemName.Trim(), StringComparison.OrdinalIgnoreCase));
        if (itemName is null)
        {
            return AddPurchaseBillItemResult.Invalid(nameof(request.ItemName), "Select an item from the list.");
        }

        var location = await locationRepository.FindAsync(companyCode, request.BatchLocationCode.Trim(), cancellationToken);
        if (location is null)
        {
            return AddPurchaseBillItemResult.Invalid(nameof(request.BatchLocationCode), "Select a batch from your saved locations.");
        }

        var item = new PurchaseBillItem
        {
            CompanyCode = companyCode,
            ItemName = itemName,
            BatchLocationCode = location.LocationCode,
            StandardCost = request.StandardCost,
            StandardPrice = request.StandardPrice,
            Quantity = request.Quantity,
            FreeQuantity = request.FreeQuantity,
            DiscountPercent = request.DiscountPercent,
            TotalCost = PurchaseBillCalculator.CalculateTotalCost(request.StandardCost, request.Quantity, request.DiscountPercent),
            TotalSelling = PurchaseBillCalculator.CalculateTotalSelling(request.StandardPrice, request.Quantity),
            CreatedAtUtc = DateTime.UtcNow
        };

        await purchaseBillRepository.AddAsync(item, cancellationToken);
        return AddPurchaseBillItemResult.Success(ToResponse(item, location.LocationName));
    }

    private static PurchaseBillItemResponse ToResponse(PurchaseBillItem item, string? locationName) => new(
        item.Id,
        item.ItemName,
        item.BatchLocationCode,
        locationName ?? item.BatchLocationCode,
        item.StandardCost,
        item.StandardPrice,
        PurchaseBillCalculator.CalculateMargin(item.StandardCost, item.StandardPrice),
        item.Quantity,
        item.FreeQuantity,
        item.DiscountPercent,
        item.TotalCost,
        item.TotalSelling,
        item.CreatedAtUtc);
}
