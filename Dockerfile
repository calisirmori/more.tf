# Multi-stage Dockerfile for more.tf
# Stage 1: Build frontend
FROM node:19-alpine AS frontend-build

WORKDIR /app/client

# Copy frontend package files first for better layer caching
COPY client/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY client/ ./

# Build frontend
RUN npm run build

# Stage 2: Dependencies with native modules
FROM node:19-alpine AS dependencies

WORKDIR /app

# Install build dependencies for canvas and other native modules
# These are needed both for building and runtime
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    cairo \
    jpeg \
    pango \
    giflib

# Copy package files first for better layer caching
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies needed for native builds)
RUN npm ci

# Copy parser-v2 source and build it
COPY parser-v2/ ./parser-v2/
RUN npx tsc -p parser-v2/tsconfig.json

# Stage 3: Final production image
FROM node:19-alpine

WORKDIR /app

# Install only runtime dependencies for native modules
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib

# Copy package files
COPY package*.json ./

# Copy node_modules from dependencies stage (already built with native modules)
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built parser-v2 from dependencies stage
COPY --from=dependencies /app/parser-v2/dist ./parser-v2/dist

# Copy backend source files (excluding items in .dockerignore)
COPY . ./

# Copy built frontend from stage 1
COPY --from=frontend-build /app/client/dist ./client/dist

# Expose port (configurable via env var)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/steam', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start the application
CMD ["node", "index.js"]
