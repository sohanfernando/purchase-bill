namespace EnhanzerProject.Models.ServiceResults;

public enum ExternalLoginFailureReason
{
    None,
    InvalidCredentials,
    ServiceUnavailable,
    InvalidResponse,
    NoLocations
}

public sealed record ExternalLocation(string LocationCode, string LocationName);

public sealed record ExternalLoginResult(
    bool IsAuthenticated,
    ExternalLoginFailureReason FailureReason,
    string? ErrorMessage,
    IReadOnlyCollection<ExternalLocation> Locations)
{
    public static ExternalLoginResult Succeeded(IReadOnlyCollection<ExternalLocation> locations) =>
        new(true, ExternalLoginFailureReason.None, null, locations);

    public static ExternalLoginResult Failed(ExternalLoginFailureReason reason, string errorMessage) =>
        new(false, reason, errorMessage, []);
}
