# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first to leverage Docker layer cache
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies for potential build steps)
RUN npm ci --prefer-offline

# Copy source code
COPY . .

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:22-alpine AS production

# Security: set non-root user — Alpine ships with a built-in "node" user
USER node

WORKDIR /app

# Copy package files
COPY --chown=node:node package.json package-lock.json* ./

# Install only production dependencies
RUN npm install --only=production

# Copy application source (no node_modules from builder — we reinstalled above)
COPY --chown=node:node src/ ./src/

# Expose the API port
EXPOSE 5000

# Health check for Docker / k8s
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Run server
CMD ["node", "src/server.js"]
