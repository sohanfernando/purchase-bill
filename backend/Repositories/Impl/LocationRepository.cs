using EnhanzerProject.Data;
using EnhanzerProject.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnhanzerProject.Repositories.Impl;

public sealed class LocationRepository(ApplicationDbContext dbContext) : ILocationRepository
{
    public async Task<IReadOnlyCollection<LocationDetail>> GetByCompanyAsync(string companyCode, CancellationToken cancellationToken) =>
        await dbContext.LocationDetails.AsNoTracking()
            .Where(location => location.CompanyCode == companyCode)
            .OrderBy(location => location.LocationName)
            .ToListAsync(cancellationToken);

    public Task<LocationDetail?> FindAsync(string companyCode, string locationCode, CancellationToken cancellationToken) =>
        dbContext.LocationDetails.AsNoTracking()
            .FirstOrDefaultAsync(
                location => location.CompanyCode == companyCode && location.LocationCode == locationCode,
                cancellationToken);

    public async Task UpsertAsync(string companyCode, IReadOnlyCollection<LocationDetail> locations, CancellationToken cancellationToken)
    {
        try
        {
            await ApplyUpsertAsync(companyCode, locations, cancellationToken);
        }
        catch (DbUpdateException)
        {
            // A concurrent login for the same company inserted one of these locations first.
            // Drop the failed inserts and apply the changes again; those rows are now updated instead.
            dbContext.ChangeTracker.Clear();
            await ApplyUpsertAsync(companyCode, locations, cancellationToken);
        }
    }

    private async Task ApplyUpsertAsync(
        string companyCode,
        IReadOnlyCollection<LocationDetail> locations,
        CancellationToken cancellationToken)
    {
        var savedLocations = await dbContext.LocationDetails
            .Where(location => location.CompanyCode == companyCode)
            .ToDictionaryAsync(location => location.LocationCode, StringComparer.OrdinalIgnoreCase, cancellationToken);

        foreach (var location in locations)
        {
            if (savedLocations.TryGetValue(location.LocationCode, out var savedLocation))
            {
                savedLocation.LocationName = location.LocationName;
            }
            else
            {
                dbContext.LocationDetails.Add(new LocationDetail
                {
                    CompanyCode = companyCode,
                    LocationCode = location.LocationCode,
                    LocationName = location.LocationName
                });
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
