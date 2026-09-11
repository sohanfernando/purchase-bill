# Enhanzer Purchase Bill

A two-page web application built for the Enhanzer Full Stack Developer assignment: an **Angular 22** front end and an **ASP.NET Core 8 Web API** backed by **SQL Server**.

- **Login** authenticates against the Enhanzer POS API through the backend, saves the returned `User_Locations` to the `Location_Details` table and issues a JWT.
- **Purchase Bill** is only available after login. It has an item autocomplete, a batch dropdown filled from `Location_Details`, live Margin / Total Cost / Total Selling calculations, an items table and an item summary.

## Tech stack

| Layer    | Technology                                                                              |
| -------- | --------------------------------------------------------------------------------------- |
| Frontend | Angular 22 (standalone components, signals, zoneless), strict TypeScript, Reactive Forms, Vitest |
| Backend  | ASP.NET Core 8 Web API, EF Core 8, JWT bearer authentication, rate limiting            |
| Database | SQL Server (LocalDB, Express or full edition)                                           |

## Repository structure

```
backend/                      ASP.NET Core Web API
  Controllers/                HTTP endpoints (auth, locations, purchase bills)
  Services/                   Business logic, external login client, calculations
  Repositories/               EF Core data access
  Data/                       DbContext and table mappings
  Database/EnhanzerProjectDb.sql   SQL Server database script
frontend/                     Angular application
  src/app/core/               Auth (service, guards, interceptor), HTTP helpers, locations
  src/app/shared/             Reusable components (form field, autocomplete, spinner, alert) and validators
  src/app/features/           Login and Purchase Bill pages (with their own components, services and models)
```

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) `^22.22.3` or `^24.15.0` with npm
- SQL Server (LocalDB is installed with Visual Studio)

## Setup

### 1. Database

Run the script in SQL Server Management Studio, or from a terminal:

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -i backend/Database/EnhanzerProjectDb.sql
```

When the API runs in the Development environment it also creates the database automatically if it does not exist yet.

The connection string is `ConnectionStrings:DefaultConnection` in [backend/appsettings.json](backend/appsettings.json). Change it if you are not using LocalDB.

### 2. Backend

```powershell
cd backend
dotnet run --launch-profile http
```

The API listens on `http://localhost:5000` and Swagger is available at `http://localhost:5000/swagger`.

The Development environment uses the signing key in `appsettings.Development.json`. In any other environment set a key of at least 32 bytes through the `Jwt__Key` environment variable or user secrets.

### 3. Frontend

```powershell
cd frontend
npm install
npm start
```

Open `http://localhost:3000`. The API address is configured in [frontend/src/environments/environment.development.ts](frontend/src/environments/environment.development.ts).

### 4. Log in

Use the credentials supplied with the assignment.

## Running the tests

```powershell
cd frontend
npm test -- --watch=false
```

## API

| Method | Endpoint                             | Auth | Description                                                   |
| ------ | ------------------------------------ | ---- | ------------------------------------------------------------- |
| POST   | `/api/auth/login`                    | –    | Logs in through the POS API, saves locations, returns a JWT   |
| GET    | `/api/locations`                     | JWT  | Locations saved in `Location_Details` for the signed-in user  |
| GET    | `/api/purchase-bills/item-options`   | JWT  | Item names for the autocomplete                               |
| GET    | `/api/purchase-bills/items`          | JWT  | Purchase bill items of the signed-in user                     |
| GET    | `/api/purchase-bills/items/{id}`     | JWT  | A single purchase bill item                                   |
| POST   | `/api/purchase-bills/items`          | JWT  | Validates, calculates and saves a purchase bill item          |

Errors are returned as RFC 7807 problem details. Validation errors include an `errors` object keyed by field name, which the Angular form shows under the matching field.

## Design notes

- **Login flow.** The Angular app never calls the POS API directly. The backend sends the required `GetLoginData` payload (the email is used as both `Company_Code` and `Username`), treats `Status_Code` 401 as invalid credentials, upserts the returned locations and signs a JWT.
- **Session.** The JWT is kept in `sessionStorage`, so it is cleared when the tab closes and is not shared between tabs. Route guards protect the Purchase Bill page, the HTTP interceptor adds the bearer token, and a `401` from the API signs the user out. An HttpOnly cookie would also protect the token from XSS, but it needs CSRF protection; `sessionStorage` keeps this assignment simpler.
- **Data scoping.** Rows in `Location_Details` and `Purchase_Bill_Items` store the login email as `Company_Code`, so each account only sees its own locations and items.
- **Calculations.** `Total Cost = Standard Cost × Qty × (1 − Discount % / 100)`, `Total Selling = Standard Price × Qty` and `Margin = Standard Price − Standard Cost`. The form previews them live; the API recalculates and stores the final values.
- **Item Summary.** Total Items is the number of rows in the table and Total Qty is the sum of their Qty values.
- **Validation.** The same rules are enforced in the Angular form (with field-level messages) and in the API, which also checks that the item is in the list and that the batch belongs to the user.
- **Change detection.** The app is zoneless (the Angular 22 default). Component state is held in signals and every component uses `OnPush`.
- **Security.** Login attempts are rate limited to 10 per minute per IP address, and the production JWT key is read from configuration rather than source control.
