using EnhanzerProject.Models.DTOs.Dashboard;
using EnhanzerProject.Security;
using EnhanzerProject.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EnhanzerProject.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public sealed class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    /// <summary>Data for all three dashboard widgets in one request.</summary>
    [HttpGet]
    [ProducesResponseType<DashboardResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardResponse>> GetDashboard(CancellationToken cancellationToken)
    {
        return Ok(await dashboardService.GetDashboardAsync(User.GetCompanyCode(), cancellationToken));
    }
}
