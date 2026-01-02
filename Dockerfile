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

# Create non-root user inside container
RUN useradd -m -u 10001 appuser

# Copy build output
COPY --from=build /app ./

USER appuser
EXPOSE 3000
CMD ["npm","run","start"]