namespace EnhanzerProject.Services;

/// <summary>
/// Purchase bill line calculations, e.g. cost 100, price 150, qty 5, discount 20%
/// gives a total cost of 400 and a total selling of 750.
/// </summary>
public static class PurchaseBillCalculator
{
    public static decimal CalculateTotalCost(decimal standardCost, int quantity, decimal discountPercent) =>
        RoundCurrency(standardCost * quantity * (1 - discountPercent / 100m));

    public static decimal CalculateTotalSelling(decimal standardPrice, int quantity) =>
        RoundCurrency(standardPrice * quantity);

    public static decimal CalculateMargin(decimal standardCost, decimal standardPrice) =>
        RoundCurrency(standardPrice - standardCost);

    private static decimal RoundCurrency(decimal value) => decimal.Round(value, 2, MidpointRounding.AwayFromZero);
}
