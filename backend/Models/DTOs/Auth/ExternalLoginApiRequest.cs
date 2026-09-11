using System.Text.Json.Serialization;

namespace EnhanzerProject.Models.DTOs.Auth;

public sealed class ExternalLoginApiRequest
{
    [JsonPropertyName("API_Action")]
    public string ApiAction { get; init; } = string.Empty;

    [JsonPropertyName("Device_Id")]
    public string DeviceId { get; init; } = string.Empty;

    [JsonPropertyName("Sync_Time")]
    public string SyncTime { get; init; } = string.Empty;

    [JsonPropertyName("Company_Code")]
    public string CompanyCode { get; init; } = string.Empty;

    [JsonPropertyName("API_Body")]
    public ExternalLoginApiBody ApiBody { get; init; } = new();
}

public sealed class ExternalLoginApiBody
{
    [JsonPropertyName("Username")]
    public string Username { get; init; } = string.Empty;

    [JsonPropertyName("Pw")]
    public string Password { get; init; } = string.Empty;
}
