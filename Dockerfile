FROM node:24-bullseye AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS server

COPY --from=build /app/dist /usr/share/nginx/html
