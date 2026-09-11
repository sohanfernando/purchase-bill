namespace EnhanzerProject.Models.Entities;

public sealed class PurchaseBillItem
{
    public int Id { get; set; }
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
