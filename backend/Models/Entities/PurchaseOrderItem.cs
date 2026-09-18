namespace EnhanzerProject.Models.Entities;

/// <summary>One line of a <see cref="PurchaseOrder"/>.</summary>
public sealed class PurchaseOrderItem
{
    public int Id { get; set; }

    /// <summary>Foreign key to the owning order.</summary>
    public int PurchaseOrderId { get; set; }
    public PurchaseOrder? PurchaseOrder { get; set; }

    public string CompanyCode { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public string BatchLocationCode { get; set; } = string.Empty;
    public LocationDetail? BatchLocation { get; set; }
    public decimal StandardCost { get; set; }
    public decimal StandardPrice { get; set; }
    public int Quantity { get; set; }
    public int FreeQuantity { get; set; }
    public decimal DiscountPercent { get; set; }
    public decimal TotalCost { get; set; }
    public decimal TotalSelling { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
