FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install deps
RUN npm ci --only=production --prefix backend && npm cache clean --force

# Copy source
COPY backend/ ./backend/

# Create logs dir
RUN mkdir -p backend/logs && chown -R node:node /app

USER node

WORKDIR /app/backend

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["npm", "start"]

