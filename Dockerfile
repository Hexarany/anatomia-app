# Multi-stage build for Anatomia app
FROM node:20-alpine AS client-builder

# Set working directory for client build
WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci --legacy-peer-deps

# Copy client source
COPY client/ ./

# Build client
RUN npm run build

# Server stage
FROM node:20-alpine AS server-builder

# Set working directory for server build
WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./

# Install server dependencies
RUN npm ci --legacy-peer-deps

# Copy server source
COPY server/ ./

# Build server
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy server build and dependencies
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY --from=server-builder /app/server/package*.json ./server/

# Copy client build
COPY --from=client-builder /app/client/dist ./client/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start server
WORKDIR /app/server
CMD ["npm", "start"]
