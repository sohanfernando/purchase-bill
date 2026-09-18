using System.ComponentModel.DataAnnotations;

namespace EnhanzerProject.Models.DTOs.PurchaseOrders;

public sealed class CreatePurchaseOrderRequest
{
    [MinLength(1, ErrorMessage = "Add at least one item before saving the order.")]
    [MaxLength(200, ErrorMessage = "An order cannot hold more than 200 items.")]
    public List<CreatePurchaseOrderItemRequest> Items { get; set; } = [];
}

public sealed class CreatePurchaseOrderItemRequest
{
    [Required(ErrorMessage = "Item is required.")]
    [StringLength(100)]
    public string ItemName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Batch is required.")]
    [StringLength(50)]
    public string BatchLocationCode { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "9999999999999999",
        ParseLimitsInInvariantCulture = true, ConvertValueInInvariantCulture = true,
        ErrorMessage = "Standard cost must be greater than zero.")]
    public decimal StandardCost { get; set; }

    [Range(typeof(decimal), "0.01", "9999999999999999",
        ParseLimitsInInvariantCulture = true, ConvertValueInInvariantCulture = true,
        ErrorMessage = "Standard price must be greater than zero.")]
    public decimal StandardPrice { get; set; }

    [Range(1, 1_000_000, ErrorMessage = "Quantity must be between 1 and 1,000,000.")]
    public int Quantity { get; set; }

    [Range(0, 1_000_000, ErrorMessage = "Free quantity must be between 0 and 1,000,000.")]
    public int FreeQuantity { get; set; }

    [Range(typeof(decimal), "0", "100",
        ParseLimitsInInvariantCulture = true, ConvertValueInInvariantCulture = true,
        ErrorMessage = "Discount must be between 0 and 100.")]
    public decimal DiscountPercent { get; set; }
}
