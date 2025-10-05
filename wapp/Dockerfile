# 1. Install dependencies
FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build the application
FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Create the final production image
FROM node:24-slim AS runner
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy the pruned dependencies and build output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

# Create mount points for volumes so permissions are correct
# These directories will be replaced by volumes at runtime
RUN mkdir -p /app/static/api/tfjs && \
    mkdir -p /app/static/api/fits && \
    mkdir -p /app/database

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD [ "node", "build" ]