# syntax=docker/dockerfile:1

ARG NODE_VERSION=24.21.0

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS dev
ENV NODE_ENV=development
COPY . .
EXPOSE 3000 9229
CMD ["sh", "-c", "npm run db:migrate && npx nest start --watch --debug 0.0.0.0:9229"]

FROM deps AS build
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:${NODE_VERSION}-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/drizzle ./drizzle
COPY --chown=node:node docker-entrypoint.sh ./

USER node
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
