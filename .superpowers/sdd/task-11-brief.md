# Task 11: Create Docker Configuration

**Location in Plan:** Phase 8, Task 11

## Context
All other tasks are complete. Task 11 creates Docker configuration for deployment.

## Files to Create
1. `docker-compose.yml`
2. `frontend/Dockerfile`
3. `frontend/nginx.conf`
4. `backend/Dockerfile`
5. `.env.example`
6. Update `backend/package.json` scripts

## docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: inventory-backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=8080
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_JWT_SECRET=${SUPABASE_JWT_SECRET}
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - SUPABASE_PROJECT_REF=${SUPABASE_PROJECT_REF}
      - FRONTEND_URL=${FRONTEND_URL}
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: inventory-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
```

## backend/Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 8080
CMD ["node", "dist/index.js"]
```

## frontend/Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN echo "VITE_API_URL=/api" > .env.production
RUN npm run build

FROM nginx:alpine AS production
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## frontend/nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://inventory-backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 50M;
    }
}
```

## .env.example
```env
# ==============================================
# SUPABASE CONFIGURATION
# ==============================================
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
JWT_SECRET=CHANGE-THIS-TO-A-RANDOM-SECRET-STRING
SUPABASE_JWT_SECRET=YOUR_SUPABASE_JWT_SECRET
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_REF=YOUR_PROJECT_REF

# ==============================================
# SERVER CONFIGURATION
# ==============================================
PORT=8080
NODE_ENV=production

# ==============================================
# CORS CONFIGURATION
# ==============================================
FRONTEND_URL=http://YOUR_DOMAIN_OR_IP
```

## Update backend/package.json scripts
Add these scripts:
```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate"
  }
}
```

## Deployment Instructions (for README)
Include deployment steps:
```bash
# 1. Clone the repository
git clone https://github.com/faril-bily-wijaya/inventory-assets-web.git
cd inventory-assets-web

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your values

# 3. Build and start containers
docker-compose build
docker-compose up -d

# 4. Verify
curl http://localhost:8080/api/health
```

## Commit
```bash
git add docker-compose.yml frontend/Dockerfile frontend/nginx.conf backend/Dockerfile .env.example
git commit -m "feat: add Docker configuration for deployment"
```
