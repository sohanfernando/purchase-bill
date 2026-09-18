# Enhanzer Purchase Orders

A web application built for the Enhanzer Full Stack Developer assignment: an **Angular 22** front end and an **ASP.NET Core 8 Web API** backed by **SQL Server**.

- **Login** authenticates against the Enhanzer POS API through the backend, saves the returned `User_Locations` to the `Location_Details` table and issues a JWT.
- **Purchase Order** is only available after login. It has an item autocomplete, a batch dropdown filled from `Location_Details`, live Margin / Total Cost / Total Selling calculations, and an items table. Items are collected in the page and **Save order** stores the whole order in one request.
- **Dashboard** shows three widgets: the latest 5 purchase orders, the oldest 10 order items, and a donut chart of quantity by item.

**Live demo:** https://purchase-bill-web-143718592205.asia-southeast1.run.app. Log in with the credentials supplied with the assignment. The site sleeps when idle, so the first request after a quiet period can take a few seconds.

## Tech stack

| Layer    | Technology                                                                              |
| -------- | --------------------------------------------------------------------------------------- |
| Frontend | Angular 22 (standalone components, signals, zoneless), strict TypeScript, Reactive Forms, Vitest |
| Backend  | ASP.NET Core 8 Web API, EF Core 8, JWT bearer authentication, rate limiting            |
| Database | SQL Server (LocalDB, Express or full edition)                                           |

## Repository structure

```
backend/                      ASP.NET Core Web API
  Controllers/                HTTP endpoints (auth, locations, purchase orders, dashboard)
  Services/                   Business logic, external login client, calculations
  Repositories/               EF Core data access
  Data/                       DbContext and table mappings
  Database/EnhanzerProjectDb.sql   SQL Server database script
frontend/                     Angular application
  src/app/core/               Auth (service, guards, interceptor), HTTP helpers, locations
  src/app/shared/             Reusable components (form field, autocomplete, spinner, alert) and validators
  src/app/features/           Login, Purchase Order and Dashboard pages (each with its own components, services and models)
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
| GET    | `/api/purchase-orders/item-options`  | JWT  | Item names for the autocomplete                               |
| GET    | `/api/purchase-orders`               | JWT  | The signed-in user's recent orders (id, net amount, items)    |
| GET    | `/api/purchase-orders/{id}`          | JWT  | One order with all of its lines                               |
| POST   | `/api/purchase-orders`               | JWT  | Validates, calculates and saves an order and its lines        |
| GET    | `/api/dashboard`                     | JWT  | Data for all three dashboard widgets in one response          |

Errors are returned as RFC 7807 problem details. Validation errors include an `errors` object keyed by field name, which the Angular form shows under the matching field.

## Deployment

The live demo runs on Google Cloud in `asia-southeast1` (Singapore):

| Part     | Service                                                                                         |
| -------- | ----------------------------------------------------------------------------------------------- |
| Frontend | Cloud Run service `purchase-bill-web`: nginx serving the Angular build (`frontend/Dockerfile`, `frontend/nginx.conf`) |
| API      | Cloud Run service `purchase-bill-api` (`backend/Dockerfile`)                                    |
| Database | Cloud SQL for SQL Server 2022 Express, created with `backend/Database/EnhanzerProjectDb.sql`    |
| CI/CD    | Cloud Build triggers: every push to `main` rebuilds and redeploys both services                 |

The API's secrets are Cloud Run environment variables, never stored in the repository:

| Variable                               | Purpose                                         |
| -------------------------------------- | ----------------------------------------------- |
| `ConnectionStrings__DefaultConnection` | Cloud SQL connection string (encrypted connection) |
| `Jwt__Key`                             | Token signing key                               |
| `Cors__AllowedOrigins__0`              | The frontend URL allowed to call the API        |

Both images can also be built locally: `docker build -t purchase-bill-api backend` and `docker build -t purchase-bill-web frontend`.

## Design notes

- **Login flow.** The Angular app never calls the POS API directly. The backend sends the required `GetLoginData` payload (the email is used as both `Company_Code` and `Username`), treats `Status_Code` 401 (unknown account) or a `Doc_Msg` such as "Invalid Login Details" (wrong password) as invalid credentials, upserts the returned locations and signs a JWT.
- **Session.** The JWT is kept in `sessionStorage`, so it is cleared when the tab closes and is not shared between tabs. Route guards protect the Dashboard and Purchase Order pages, the HTTP interceptor adds the bearer token, and a `401` from the API signs the user out. An HttpOnly cookie would also protect the token from XSS, but it needs CSRF protection; `sessionStorage` keeps this assignment simpler.
- **Data scoping.** Rows in `Location_Details`, `Purchase_Orders` and `Purchase_Order_Items` store the login email as `Company_Code`, so each account only sees its own locations, orders and dashboard.
- **Calculations.** `Total Cost = Standard Cost × Qty × (1 − Discount % / 100)`, `Total Selling = Standard Price × Qty` and `Margin = Standard Price − Standard Cost`. The form previews them live; the API recalculates and stores the final values.
- **Item Summary.** Total Items is the number of rows in the table, Total Qty is the sum of their Qty values, and Net Amount is the sum of their Total Cost, which is what the API stores on the order.
- **Saving an order.** Lines are collected in the browser; **Save order** posts them together, and the API validates every line before writing the header and lines in one transaction, so a bad line saves nothing. The unsaved lines are kept in `sessionStorage`, so a refresh does not lose a half-built order, and they are cleared once the order is saved or the user signs out.
- **Dashboard.** One request (`GET /api/dashboard`) fills all three widgets, so the page has a single loading and error state. The queries project straight into response records, and the donut is hand-drawn SVG, so no chart library is needed.
- **Validation.** The same rules are enforced in the Angular form (with field-level messages) and in the API, which also checks that the item is in the list and that the batch belongs to the user.
- **Change detection.** The app is zoneless (the Angular 22 default). Component state is held in signals and every component uses `OnPush`.
- **Security.** Login attempts are rate limited to 10 per minute per IP address, and the production JWT key is read from configuration rather than source control.
