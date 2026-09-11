namespace EnhanzerProject.Models.DTOs.Auth;

public sealed record LoginResponse(string AccessToken, DateTime ExpiresAtUtc, string Email);
