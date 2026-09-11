using EnhanzerProject.Models.DTOs.Locations;
using EnhanzerProject.Security;
using EnhanzerProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnhanzerProject.Controllers;

[ApiController]
[Authorize]
[Route("api/locations")]
public sealed class LocationsController(ILocationService locationService) : ControllerBase
{
    /// <summary>Returns the signed-in company's locations saved in Location_Details.</summary>
    [HttpGet]
    [ProducesResponseType<IReadOnlyCollection<LocationResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<LocationResponse>>> GetLocations(CancellationToken cancellationToken)
    {
        return Ok(await locationService.GetLocationsAsync(User.GetCompanyCode(), cancellationToken));
    }
}
