# Builds the Angular app and serves it with nginx on Google Cloud Run.
# Works with either the repository root or the frontend folder as the build context:
#   docker build -t purchase-bill-web frontend
#   docker build -t purchase-bill-web -f frontend/Dockerfile .

FROM node:24-slim AS build
WORKDIR /src
COPY . .
RUN if [ -f frontend/package.json ]; then cd frontend; fi \
    && npm ci \
    && npm run build \
    && mkdir -p /out \
    && cp -r dist/frontend/browser /out/html \
    && cp nginx.conf /out/nginx.conf

# Unprivileged nginx runs as a non-root user and listens on port 8080, which Cloud Run expects.
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY --from=build /out/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /out/html /usr/share/nginx/html
EXPOSE 8080
