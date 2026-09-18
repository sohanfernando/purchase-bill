import { calculateLineAmounts, roundCurrency, summarizeLines } from './purchase-order-calculations';

describe('calculateLineAmounts', () => {
  it('matches the example from the assignment', () => {
    expect(
      calculateLineAmounts({ standardCost: 100, standardPrice: 150, quantity: 5, discountPercent: 20 }),
    ).toEqual({ margin: 50, totalCost: 400, totalSelling: 750 });
  });

  it('treats empty fields as zero', () => {
    expect(
      calculateLineAmounts({ standardCost: null, standardPrice: null, quantity: null, discountPercent: null }),
    ).toEqual({ margin: 0, totalCost: 0, totalSelling: 0 });
  });

  it('rounds amounts to two decimal places', () => {
    expect(
      calculateLineAmounts({ standardCost: 33.333, standardPrice: 10.005, quantity: 1, discountPercent: 0 }),
    ).toEqual({ margin: -23.33, totalCost: 33.33, totalSelling: 10.01 });
    expect(roundCurrency(1.005)).toBe(1.01);
  });
});

describe('summarizeLines', () => {
  it('counts the lines, sums the quantities and sums the net amount', () => {
    expect(
      summarizeLines([
        { quantity: 10, totalCost: 400 },
        { quantity: 5, totalCost: 500.5 },
      ]),
    ).toEqual({ totalItems: 2, totalQuantity: 15, netAmount: 900.5 });
  });

  it('returns zeros for an empty order', () => {
    expect(summarizeLines([])).toEqual({ totalItems: 0, totalQuantity: 0, netAmount: 0 });
  });
});
