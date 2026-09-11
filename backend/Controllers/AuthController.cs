using EnhanzerProject.Models.DTOs.Auth;
using EnhanzerProject.Models.ServiceResults;
using EnhanzerProject.Security;
using EnhanzerProject.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace EnhanzerProject.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IExternalLoginService externalLoginService,
    ILocationService locationService,
    ITokenService tokenService) : ControllerBase
{
    [HttpPost("login")]
    [EnableRateLimiting(RateLimitPolicies.Login)]
    [ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status429TooManyRequests)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status502BadGateway)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim();
        var externalResult = await externalLoginService.AuthenticateAsync(email, request.Password, cancellationToken);
        if (!externalResult.IsAuthenticated)
        {
            var (statusCode, title) = externalResult.FailureReason switch
            {
                ExternalLoginFailureReason.InvalidCredentials => (StatusCodes.Status401Unauthorized, "Invalid credentials"),
                ExternalLoginFailureReason.NoLocations => (StatusCodes.Status403Forbidden, "No locations assigned"),
                ExternalLoginFailureReason.ServiceUnavailable => (StatusCodes.Status503ServiceUnavailable, "Authentication service unavailable"),
                _ => (StatusCodes.Status502BadGateway, "Invalid authentication response")
            };

            return Problem(statusCode: statusCode, title: title, detail: externalResult.ErrorMessage);
        }

        var companyCode = email.ToLowerInvariant();
        await locationService.SaveLocationsAsync(companyCode, externalResult.Locations, cancellationToken);

        var token = tokenService.CreateAccessToken(companyCode);
        return Ok(new LoginResponse(token.AccessToken, token.ExpiresAtUtc, companyCode));
    }
}
