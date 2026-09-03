FROM node:26.8.1-bullseye AS build
LABEL org.opencontainers.image.description="A React UI for managing Hawk instances"
WORKDIR /app
RUN npm i -g corepack && corepack enable

COPY . .
RUN yarn install --immutable

RUN yarn build
FROM nginx:alpine AS server
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
