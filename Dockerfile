# Multi-stage Dockerfile for more.tf
# Stage 1: Build frontend
FROM node:19-alpine AS frontend-build

WORKDIR /app/client

# Copy frontend package files
COPY client/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY client/ ./

# Build frontend
RUN npm run build

# Stage 2: Build backend and final image
FROM node:19-alpine

WORKDIR /app

# Install build dependencies for canvas and other native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

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
