# ── Stage 1: Builder ─────────────────────────────────────────────────────────
# Install dependencies into an isolated directory so we can copy only
# what we need to the production image (keeps the final image small).
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build tools (needed for some native extensions)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker layer cache
COPY requirements.txt .

# Install into /install — we'll copy this path into the production image
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM python:3.11-slim AS production

# Security: create a non-root user to run the worker
RUN useradd -m -s /bin/sh worker

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY --chown=worker:worker . .

# Switch to non-root user
USER worker

# Health check: verify the Python interpreter is alive
# (A more robust check would hit a tiny HTTP health server, but
#  for a queue consumer a liveness probe via process existence is standard)
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD python -c "import redis; r = redis.from_url('${REDIS_URL:-redis://redis:6379}'); r.ping()" || exit 1

CMD ["python", "worker.py"]
