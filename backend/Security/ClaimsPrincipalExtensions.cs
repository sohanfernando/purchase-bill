using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace EnhanzerProject.Security;

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// The external login API identifies a company by the login email (it is sent as Company_Code),
    /// so the email claim is used to scope locations and purchase bill items to the signed-in company.
    /// </summary>
    public static string GetCompanyCode(this ClaimsPrincipal user) =>
        user.FindFirstValue(JwtRegisteredClaimNames.Email)
        ?? throw new InvalidOperationException("The access token does not contain an email claim.");
}
