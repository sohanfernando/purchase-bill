namespace EnhanzerProject.Options;

public sealed class ExternalLoginOptions
{
    public const string SectionName = "ExternalLogin";

    public string Endpoint { get; set; } = string.Empty;
    public string ApiAction { get; set; } = "GetLoginData";
    public string DeviceId { get; set; } = "D001";
    public string SyncTime { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 15;
    public int MaxAttempts { get; set; } = 3;
    public int RetryDelayMilliseconds { get; set; } = 500;
}
