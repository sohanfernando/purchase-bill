# Builds the Enhanzer Purchase Bill API into a small runtime image for Google Cloud Run.
# Works with either the repository root or the backend folder as the build context:
#   docker build -t purchase-bill-api backend
#   docker build -t purchase-bill-api -f backend/Dockerfile .

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN if [ -f backend/backend.csproj ]; then cd backend; fi \
    && dotnet publish backend.csproj --configuration Release --output /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app ./

# Cloud Run sends requests to port 8080, the .NET 8 image default. The app runs as the image's non-root user.
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
USER $APP_UID

ENTRYPOINT ["dotnet", "backend.dll"]
