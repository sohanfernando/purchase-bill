using EnhanzerProject.Models.Entities;

namespace EnhanzerProject.Repositories;

public interface ILocationRepository
{
    Task<IReadOnlyCollection<LocationDetail>> GetByCompanyAsync(string companyCode, CancellationToken cancellationToken);
    Task<LocationDetail?> FindAsync(string companyCode, string locationCode, CancellationToken cancellationToken);

    /// <summary>Inserts new locations for the company and renames the ones that already exist.</summary>
    Task UpsertAsync(string companyCode, IReadOnlyCollection<LocationDetail> locations, CancellationToken cancellationToken);
}
