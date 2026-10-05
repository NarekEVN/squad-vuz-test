# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.21.0

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS dev
ENV PORT=80 BROWSER=none WATCHPACK_POLLING=true WDS_SOCKET_PORT=0
COPY . .
EXPOSE 80
CMD ["npm", "start"]

FROM deps AS build
ARG REACT_APP_API_URL=http://localhost:3000/api/v1
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
