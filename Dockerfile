FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:20-alpine AS production
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/dist ./dist
COPY seed_vehicles.json ./seed_vehicles.json

CMD ["sh", "-c", "npx typeorm migration:run -d dist/shared/database/data-source.js && node dist/shared/database/seed.js && node dist/main"]
# FROM node:20-alpine AS build
# WORKDIR /app
# RUN corepack enable

# COPY package.json pnpm-lock.yaml ./
# RUN pnpm install --frozen-lockfile

# COPY . .

# RUN pnpm build

# FROM node:20-alpine AS production
# WORKDIR /app
# RUN corepack enable

# COPY package.json pnpm-lock.yaml ./
# RUN pnpm install --prod --frozen-lockfile
# COPY --from=build /app/dist ./dist

# CMD ["node", "dist/main"]