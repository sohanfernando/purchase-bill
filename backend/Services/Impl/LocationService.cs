using EnhanzerProject.Models.DTOs.Locations;
using EnhanzerProject.Models.Entities;
using EnhanzerProject.Models.ServiceResults;
using EnhanzerProject.Repositories;

namespace EnhanzerProject.Services.Impl;

public sealed class LocationService(ILocationRepository locationRepository) : ILocationService
{
    public async Task<IReadOnlyCollection<LocationResponse>> GetLocationsAsync(string companyCode, CancellationToken cancellationToken)
    {
        var locations = await locationRepository.GetByCompanyAsync(companyCode, cancellationToken);
        return locations.Select(location => new LocationResponse(location.LocationCode, location.LocationName)).ToList();
    }

    public Task SaveLocationsAsync(string companyCode, IReadOnlyCollection<ExternalLocation> locations, CancellationToken cancellationToken) =>
        locationRepository.UpsertAsync(
            companyCode,
            locations.Select(location => new LocationDetail
            {
                CompanyCode = companyCode,
                LocationCode = location.LocationCode,
                LocationName = location.LocationName
            }).ToList(),
            cancellationToken);
}
