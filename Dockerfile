FROM node:18-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package.json files for dependency resolution
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared/ packages/shared/
COPY apps/web/ apps/web/

# Build shared package first, then web
RUN pnpm --filter @rcm/shared build
RUN pnpm --filter @rcm/web build

# Serve with lightweight static server
FROM node:18-alpine AS runner
RUN npm install -g serve
WORKDIR /app
COPY --from=builder /app/apps/web/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
