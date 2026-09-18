using EnhanzerProject.Models.DTOs.Dashboard;

namespace EnhanzerProject.Services;

public interface IDashboardService
{
    Task<DashboardResponse> GetDashboardAsync(string companyCode, CancellationToken cancellationToken);
}
