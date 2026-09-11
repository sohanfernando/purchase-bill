using EnhanzerProject.Models.ServiceResults;

namespace EnhanzerProject.Services;

public interface IExternalLoginService
{
    Task<ExternalLoginResult> AuthenticateAsync(string email, string password, CancellationToken cancellationToken);
}
