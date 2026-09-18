namespace EnhanzerProject.Models.Entities;

/// <summary>
/// A saved purchase order: the header row that owns one or more <see cref="PurchaseOrderItem"/> lines.
/// Net amount and item count are stored so dashboard widgets do not have to recalculate them.
/// </summary>
public sealed class PurchaseOrder
{
    public int Id { get; set; }
    public string CompanyCode { get; set; } = string.Empty;
    public decimal NetAmount { get; set; }
    public int ItemCount { get; set; }
    public DateTime CreatedAtUtc { get; set; }

    public List<PurchaseOrderItem> Items { get; set; } = [];
}
