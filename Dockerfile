# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS builder

ARG STEAM_ICON_URL
ARG STEAMGRIDDB_ICON_URL
ENV STEAM_ICON_URL=${STEAM_ICON_URL}
ENV STEAMGRIDDB_ICON_URL=${STEAMGRIDDB_ICON_URL}

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build:static

FROM nginx:alpine AS runtime

COPY --from=builder /app/dist-static/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
