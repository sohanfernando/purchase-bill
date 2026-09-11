# Enhanzer Project – Backend

ASP.NET Core 8 Web API for the Enhanzer Full Stack Developer assignment. See the [root README](../README.md) for the complete setup guide.

## Run

```powershell
dotnet run --launch-profile http
```

Swagger: `http://localhost:5000/swagger`. Example requests are in [backend.http](backend.http).

## Configuration

| Setting                              | Purpose                                                                       |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| `ConnectionStrings:DefaultConnection`| SQL Server connection string (LocalDB by default)                             |
| `Jwt:Key`                            | Signing key, at least 32 bytes. Only set in `appsettings.Development.json`; use `Jwt__Key` elsewhere |
| `Jwt:ExpiryMinutes`                  | Access token lifetime (default 480)                                           |
| `ExternalLogin:*`                    | POS API endpoint, `API_Action`, `Device_Id`, timeout and retry settings       |
| `Cors:AllowedOrigins`                | Origins allowed to call the API (the Angular dev server)                      |
| `Database:EnsureCreatedOnStartup`    | Creates the database on startup when missing (enabled in Development)         |

## Structure

- `Controllers/` – thin HTTP endpoints; the signed-in user's company code comes from the JWT `email` claim.
- `Services/` – login against the POS API (`ExternalLoginService`), JWT creation, locations, purchase bill rules and `PurchaseBillCalculator`.
- `Repositories/` – EF Core queries, always filtered by company code.
- `Data/ApplicationDbContext.cs` – maps the entities to `Location_Details` and `Purchase_Bill_Items`.
- `Database/EnhanzerProjectDb.sql` – the database script.
- `Security/` – rate limiting policy name and claims helpers.

## Login flow

`POST /api/auth/login` sends this payload to the POS API:

```json
{
  "API_Action": "GetLoginData",
  "Device_Id": "D001",
  "Sync_Time": "",
  "Company_Code": "email@example.com",
  "API_Body": { "Username": "email@example.com", "Pw": "password" }
}
```

The POS API always answers HTTP 200 and reports the result in `Status_Code` (`401` for invalid credentials). On success, every `User_Locations` entry is upserted into `Location_Details` and the API returns an 8-hour JWT. Send it as `Authorization: Bearer <accessToken>` to call the protected endpoints.
