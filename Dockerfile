FROM node:26-bullseye AS build
LABEL org.opencontainers.image.description="A React UI for managing Hawk instances"
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS server
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
