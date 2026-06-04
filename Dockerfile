# -------------------------
# Stage 1: Build
# -------------------------
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first (cache optimization)
COPY package*.json ./

# Install all dependencies (needed for build + prisma generate)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript -> dist/
RUN npm run build


# -------------------------
# Stage 2: Production
# -------------------------
FROM node:20-alpine

ENV NODE_ENV=production

WORKDIR /usr/src/app

# Copy only production assets
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts


# Optional: reduce image size
RUN npm prune --production

RUN mkdir -p /usr/src/app/public/uploads \
    /usr/src/app/public/events \
    /usr/src/app/public/speaker \
    /usr/src/app/public/member


# Security best practice
USER node

EXPOSE 3000


# IMPORTANT: your entry point is server.js
CMD ["node", "dist/server.js"]