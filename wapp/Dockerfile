# 1. Build the application
FROM node:24-slim AS builder
WORKDIR /app

# Copy source code
COPY . .
RUN npm ci

# Create database directory and set build environment
ENV BUILDING=true
ENV DATABASE_URL=/app/database/app.db
RUN mkdir -p /app/database

# Build the application
RUN npm run prebuild
RUN npm run build

# 2. Create the final production image
FROM node:24-slim AS runner
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy dependencies and build output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

# Create mount points for volumes
RUN mkdir -p /app/build/client/api/tfjs && \
    mkdir -p /app/build/client/api/fits && \
    mkdir -p /app/database

# Expose the port
EXPOSE 3000

# Start the app
CMD [ "node", "build" ]