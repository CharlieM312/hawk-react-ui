FROM node:16-bullseye AS build

COPY . /build
RUN cd /build && npm ci && npm run build

FROM nginx:alpine AS server

COPY --from=build /build/build /usr/share/nginx/html
