# Multi-stage Dockerfile for Next.js
# Base dependencies stage
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json ./
# Optional lockfiles – ignore if missing
# Copy lockfiles if they exist (Docker can't conditionally copy, so use separate stages not needed)
COPY package.json package-lock.json* ./
# Robust Install: Falls lock veraltet -> entferne lock und normal installieren
RUN (npm ci || (echo "Lockfile inkonsistent – fallback" && rm -f package-lock.json && npm install)) \
	&& npm cache clean --force

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN if [ ! -d node_modules/next ]; then echo 'next package fehlt – nachinstallieren'; npm install next@15.3.3; fi
RUN mkdir -p public
RUN npm run build

# Production runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
RUN mkdir -p public
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
EXPOSE 3000
CMD ["npm","start"]
