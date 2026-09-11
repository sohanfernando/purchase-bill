using EnhanzerProject.Data;
using EnhanzerProject.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnhanzerProject.Repositories.Impl;

public sealed class PurchaseBillRepository(ApplicationDbContext dbContext) : IPurchaseBillRepository
{
    public async Task<IReadOnlyCollection<PurchaseBillItem>> GetByCompanyAsync(string companyCode, CancellationToken cancellationToken) =>
        await dbContext.PurchaseBillItems.AsNoTracking()
            .Include(item => item.BatchLocation)
            .Where(item => item.CompanyCode == companyCode)
            .OrderBy(item => item.Id)
            .ToListAsync(cancellationToken);

    public Task<PurchaseBillItem?> FindAsync(string companyCode, int id, CancellationToken cancellationToken) =>
        dbContext.PurchaseBillItems.AsNoTracking()
            .Include(item => item.BatchLocation)
            .FirstOrDefaultAsync(item => item.CompanyCode == companyCode && item.Id == id, cancellationToken);

    public async Task AddAsync(PurchaseBillItem item, CancellationToken cancellationToken)
    {
        dbContext.PurchaseBillItems.Add(item);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
