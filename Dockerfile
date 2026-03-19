# ---- deps ----
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- build ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- run ----
FROM node:20-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production

# Install Python + rembg FastAPI service
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    && python3 -m venv /opt/rembg-venv \
    && /opt/rembg-venv/bin/pip install --no-cache-dir "rembg[cpu]" fastapi uvicorn python-multipart \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV PATH="/opt/rembg-venv/bin:$PATH"

# Create non-root user inside container
RUN useradd -m -u 10001 appuser

# Copy build output
COPY --from=build /app ./

USER appuser
EXPOSE 3000 8000
CMD ["sh", "-c", "python scripts/remove_bg.py & npm run start"]
