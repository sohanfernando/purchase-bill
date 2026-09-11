using EnhanzerProject.Models.DTOs.Locations;
using EnhanzerProject.Models.ServiceResults;

namespace EnhanzerProject.Services;

public interface ILocationService
{
    Task<IReadOnlyCollection<LocationResponse>> GetLocationsAsync(string companyCode, CancellationToken cancellationToken);
    Task SaveLocationsAsync(string companyCode, IReadOnlyCollection<ExternalLocation> locations, CancellationToken cancellationToken);
}
