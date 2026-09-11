namespace EnhanzerProject.Models.Entities;

public sealed class LocationDetail
{
    public int Id { get; set; }
    public string CompanyCode { get; set; } = string.Empty;
    public string LocationCode { get; set; } = string.Empty;
    public string LocationName { get; set; } = string.Empty;
}
