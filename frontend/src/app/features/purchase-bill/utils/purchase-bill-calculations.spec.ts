import { calculateLineAmounts, roundCurrency, summarizeItems } from './purchase-bill-calculations';

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

describe('summarizeItems', () => {
  it('counts the rows and sums their quantities', () => {
    expect(summarizeItems([{ quantity: 10 }, { quantity: 5 }])).toEqual({ totalItems: 2, totalQuantity: 15 });
  });

  it('returns zeros for an empty table', () => {
    expect(summarizeItems([])).toEqual({ totalItems: 0, totalQuantity: 0 });
  });
});
