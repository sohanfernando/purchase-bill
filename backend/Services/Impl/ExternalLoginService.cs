using System.Net;
using System.Text;
using System.Text.Json;
using EnhanzerProject.Models.DTOs.Auth;
using EnhanzerProject.Models.ServiceResults;
using EnhanzerProject.Options;
using Microsoft.Extensions.Options;

namespace EnhanzerProject.Services.Impl;

public sealed class ExternalLoginService(
    HttpClient httpClient,
    IOptions<ExternalLoginOptions> options,
    ILogger<ExternalLoginService> logger) : IExternalLoginService
{
    private const string ServiceUnavailableMessage = "The authentication service is currently unavailable. Please try again later.";
    private const string InvalidResponseMessage = "The authentication service returned an unexpected response.";
    private const string InvalidCredentialsMessage = "Invalid email or password.";

    public async Task<ExternalLoginResult> AuthenticateAsync(string email, string password, CancellationToken cancellationToken)
    {
        var settings = options.Value;
        var requestBody = new ExternalLoginApiRequest
        {
            ApiAction = settings.ApiAction,
            DeviceId = settings.DeviceId,
            SyncTime = settings.SyncTime,
            CompanyCode = email,
            ApiBody = new ExternalLoginApiBody
            {
                Username = email,
                Password = password
            }
        };

        try
        {
            using var response = await PostWithRetryAsync(settings, requestBody, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("External login service returned HTTP {StatusCode}.", (int)response.StatusCode);
                return IsTransientFailure(response.StatusCode)
                    ? ExternalLoginResult.Failed(ExternalLoginFailureReason.ServiceUnavailable, ServiceUnavailableMessage)
                    : ExternalLoginResult.Failed(ExternalLoginFailureReason.InvalidResponse, InvalidResponseMessage);
            }

            var apiResponse = await response.Content.ReadFromJsonAsync<ExternalLoginApiResponse>(cancellationToken);
            return apiResponse is null
                ? ExternalLoginResult.Failed(ExternalLoginFailureReason.InvalidResponse, InvalidResponseMessage)
                : ToLoginResult(apiResponse);
        }
        catch (HttpRequestException exception)
        {
            logger.LogWarning(exception, "External login service could not be reached.");
            return ExternalLoginResult.Failed(ExternalLoginFailureReason.ServiceUnavailable, ServiceUnavailableMessage);
        }
        catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
        {
            logger.LogWarning(exception, "External login service timed out.");
            return ExternalLoginResult.Failed(
                ExternalLoginFailureReason.ServiceUnavailable,
                "The authentication service timed out. Please try again.");
        }
        catch (Exception exception) when (exception is JsonException or NotSupportedException)
        {
            logger.LogWarning(exception, "External login service returned a response that could not be read.");
            return ExternalLoginResult.Failed(ExternalLoginFailureReason.InvalidResponse, InvalidResponseMessage);
        }
    }

    private ExternalLoginResult ToLoginResult(ExternalLoginApiResponse apiResponse)
    {
        // The external API always answers HTTP 200 and reports the real outcome in Status_Code.
        if (apiResponse.StatusCode is (int)HttpStatusCode.Unauthorized or (int)HttpStatusCode.Forbidden)
        {
            return ExternalLoginResult.Failed(ExternalLoginFailureReason.InvalidCredentials, InvalidCredentialsMessage);
        }

        if (apiResponse.StatusCode != (int)HttpStatusCode.OK)
        {
            logger.LogWarning(
                "External login service returned status {StatusCode}: {Message}",
                apiResponse.StatusCode,
                apiResponse.Message);
            return apiResponse.StatusCode >= 500
                ? ExternalLoginResult.Failed(ExternalLoginFailureReason.ServiceUnavailable, ServiceUnavailableMessage)
                : ExternalLoginResult.Failed(ExternalLoginFailureReason.InvalidResponse, InvalidResponseMessage);
        }

        var users = apiResponse.ResponseBody ?? [];
        var locations = users
            .SelectMany(user => user.UserLocations ?? [])
            .Where(location => !string.IsNullOrWhiteSpace(location.LocationCode)
                && !string.IsNullOrWhiteSpace(location.LocationName))
            .Select(location => new ExternalLocation(location.LocationCode!.Trim(), location.LocationName!.Trim()))
            .DistinctBy(location => location.LocationCode, StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (locations.Count > 0)
        {
            return ExternalLoginResult.Succeeded(locations);
        }

        // For an existing account with a wrong password the API still answers Status_Code 200,
        // but the user entry only contains a Doc_Msg such as "Invalid Login Details".
        var rejectionMessage = users
            .Select(user => user.DocMessage)
            .FirstOrDefault(message => !string.IsNullOrWhiteSpace(message));
        if (rejectionMessage is not null)
        {
            logger.LogInformation("External login service rejected the login: {Reason}", rejectionMessage);
            return ExternalLoginResult.Failed(ExternalLoginFailureReason.InvalidCredentials, InvalidCredentialsMessage);
        }

        return ExternalLoginResult.Failed(
            ExternalLoginFailureReason.NoLocations,
            "Your account does not have any locations assigned.");
    }

    private async Task<HttpResponseMessage> PostWithRetryAsync(
        ExternalLoginOptions settings,
        ExternalLoginApiRequest requestBody,
        CancellationToken cancellationToken)
    {
        for (var attempt = 1; attempt < settings.MaxAttempts; attempt++)
        {
            var response = await PostAsync(settings.Endpoint, requestBody, cancellationToken);
            if (!IsTransientFailure(response.StatusCode))
            {
                return response;
            }

            logger.LogWarning(
                "External login service returned {StatusCode}; retrying (attempt {NextAttempt} of {MaxAttempts}).",
                (int)response.StatusCode,
                attempt + 1,
                settings.MaxAttempts);
            response.Dispose();
            await Task.Delay(TimeSpan.FromMilliseconds(settings.RetryDelayMilliseconds * attempt), cancellationToken);
        }

        // Final attempt: its response is returned whatever the status code.
        return await PostAsync(settings.Endpoint, requestBody, cancellationToken);
    }

    private async Task<HttpResponseMessage> PostAsync(
        string endpoint,
        ExternalLoginApiRequest requestBody,
        CancellationToken cancellationToken)
    {
        // The body is serialized up front so the request carries a Content-Length header.
        // The POS API ignores chunked request bodies (which PostAsJsonAsync sends) and answers Status_Code 0.
        using var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        return await httpClient.PostAsync(endpoint, content, cancellationToken);
    }

    private static bool IsTransientFailure(HttpStatusCode statusCode) =>
        (int)statusCode >= 500 || statusCode == HttpStatusCode.TooManyRequests;
}
