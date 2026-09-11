using EnhanzerProject.Models.ServiceResults;

namespace EnhanzerProject.Services;

public interface ITokenService
{
    TokenResult CreateAccessToken(string email);
}
