using System.Text.Json.Serialization;

namespace EnhanzerProject.Models.DTOs.Auth;

/// <summary>
/// Envelope returned by the external POS API. The API always answers HTTP 200 and reports the
/// outcome in <see cref="StatusCode"/> (for example 401 with a null body for invalid credentials).
/// </summary>
public sealed class ExternalLoginApiResponse
{
    [JsonPropertyName("Status_Code")]
    public int StatusCode { get; init; }

    [JsonPropertyName("Message")]
    public string? Message { get; init; }

    [JsonPropertyName("Response_Body")]
    public List<ExternalLoginUser>? ResponseBody { get; init; }
}

public sealed class ExternalLoginUser
{
    [JsonPropertyName("User_Locations")]
    public List<ExternalLoginLocation>? UserLocations { get; init; }

    /// <summary>Set instead of the user details when the login is rejected, e.g. "Invalid Login Details".</summary>
    [JsonPropertyName("Doc_Msg")]
    public string? DocMessage { get; init; }
}

public sealed class ExternalLoginLocation
{
    [JsonPropertyName("Location_Code")]
    public string? LocationCode { get; init; }

    [JsonPropertyName("Location_Name")]
    public string? LocationName { get; init; }
}
