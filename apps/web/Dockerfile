# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /workspace

# Copy shared types package
COPY packages/types ./packages/types

# Install web dependencies
COPY apps/web/package*.json ./apps/web/
RUN cd apps/web && npm install

# Copy web source
COPY apps/web ./apps/web

# Build
RUN cd apps/web && npm run build

# ── Stage 2: Production ────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache dumb-init

COPY --from=builder /workspace/apps/web/build ./build
COPY --from=builder /workspace/apps/web/node_modules ./node_modules
COPY --from=builder /workspace/apps/web/package.json ./

ENV HOST=0.0.0.0
ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "build"]
