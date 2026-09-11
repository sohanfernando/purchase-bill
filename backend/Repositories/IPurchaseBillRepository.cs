using EnhanzerProject.Models.Entities;

namespace EnhanzerProject.Repositories;

public interface IPurchaseBillRepository
{
    Task<IReadOnlyCollection<PurchaseBillItem>> GetByCompanyAsync(string companyCode, CancellationToken cancellationToken);
    Task<PurchaseBillItem?> FindAsync(string companyCode, int id, CancellationToken cancellationToken);
    Task AddAsync(PurchaseBillItem item, CancellationToken cancellationToken);
}
