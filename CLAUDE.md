# 📋 SCRIPT REBUILD: Map Inventory Asset Management System
## Project TIF Indonesia - Complete Development Guide

---

## 🎯 TUJUAN

Membangun ulang sistem **Map Inventory Asset Management** dari nol dengan:
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: Supabase PostgreSQL
- **Deployment**: Docker + VPS

---

## 🔐 INFORMASI KONFIGURASI

### Supabase (Database)

| Item | Value |
|------|-------|
| **Project ID** | `epqmzlnhculyqflbbulq` |
| **Project Ref** | `epqmzlnhculyqflbbulq` |
| **Database Password** | `Inventoryassetsweb` |
| **Database URL** | `postgresql://postgres:Inventoryassetsweb@db.epqmzlnhculyqflbbulq.supabase.co:5432/postgres` |
| **Anon Public Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjkyNDgsImV4cCI6MjA5ODM0NTI0OH0.WIQHauPvG7sJswokpC_-wF8BtJrdXBr2qc5bbqRVkfo` |
| **Service Role Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjc2OTI0OCwiZXhwIjoyMDk4MzQ1MjQ4fQ.X-f5ScV_h8v6kvw8zFk_06K3GD7M4jTXNwgz2nG-C0w` |
| **JWT Secret** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjkyNDgsImV4cCI6MjA5ODM0NTI0OH0.WIQHauPvG7sJswokpC_-wF8BtJrdXBr2qc5bbqRVkfo` |
| **Secret API Key** | `sb_secret_BhA9rjB1XC6fK9rXRW81vQ_Tj-qqT89` |
| **Dashboard** | https://supabase.com/dashboard/project/epqmzlnhculyqflbbulq |

### VPS Server

| Item | Value |
|------|-------|
| **IP Private** | `124.156.204.209` |
| **SSH Password** | `zpv-c6V-iYp-Vxw` |
| **SSH Port** | 22 (default) |
| **Backend Port** | `8080` |
| **Application User** | `root` |

### GitHub Repository

| Item | Value |
|------|-------|
| **Repo URL** | `https://github.com/faril-bily-wijaya/inventory-assets-web.git` |

### Login Default (Admin)

| Item | Value |
|------|-------|
| **Username** | `admin` |
| **Password** | `admin123` |
| **Role** | `ADMIN` |

---

## 📊 DATABASE SCHEMA

### Tables (Sudah dibuat di Supabase)

| Table | Columns | Description |
|-------|---------|-------------|
| `users` | id, username, email, password, full_name, role, is_active, created_at, updated_at | User accounts |
| `regionals` | id, name, created_at, updated_at | Regional hierarchy (REGIONAL SUMBAGSEL) |
| `districts` | id, name, regional_id, created_at, updated_at | District level (JAMBI, PALEMBANG, LAMPUNG, dll) |
| `clusters` | id, name, district_id, created_at, updated_at | Cluster level |
| `locations` | id, name, latitude, longitude, cluster_id, class_type, address, created_at, updated_at | Site locations |
| `devices` | id, device_code, device_name, device_type, brand, model, serial_number, kapasitas, year, room, status, condition, cap_real, location_id, created_at, updated_at, deleted_at | Asset devices |

### Row Level Security (RLS)

RLS sudah **enabled** dengan policies:
- **users** - Public read, authenticated write
- **regionals/districts/clusters** - Public read, authenticated write
- **locations** - Public read, authenticated CRUD
- **devices** - Public read, authenticated CRUD

### Seed Data (Sudah diinsert)

- 1 Admin user
- 1 Regional (REGIONAL SUMBAGSEL)
- 5 Districts
- 6 Clusters
- 20 Sample Locations (Palembang, Jambi, Lampung, dll)
- 11 Sample Devices

---

## 📁 STRUKTUR PROJECT

```
inventory-assets-web/
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── map/           # Map components (MarkerLayer, HeatmapLayer, dll)
│   │   │   ├── sidebar/       # Sidebar components
│   │   │   ├── modals/        # Modal components
│   │   │   └── management/     # CRUD panels
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React Context
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # API clients
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── .env
│
├── backend/                     # Node.js + Express + Prisma
│   ├── src/
│   │   ├── routes/            # API Routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── locations.routes.ts
│   │   │   ├── devices.routes.ts
│   │   │   ├── hierarchy.routes.ts
│   │   │   └── users.routes.ts
│   │   ├── middleware/        # Middleware
│   │   │   ├── auth.ts
│   │   │   └── error-handler.ts
│   │   └── index.ts           # Entry point
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── docker-compose.yml
├── .env                        # Main environment
├── .env.production
└── README.md
```

---

## 🔧 ENVIRONMENT VARIABLES

### 1. Root `.env` (Main)

```env
# ==============================================
# SUPABASE CONFIGURATION
# ==============================================
DATABASE_URL=postgresql://postgres:Inventoryassetsweb@db.epqmzlnhculyqflbbulq.supabase.co:5432/postgres
JWT_SECRET=CHANGE-THIS-TO-A-RANDOM-SECRET-STRING
SUPABASE_JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjkyNDgsImV4cCI6MjA5ODM0NTI0OH0.WIQHauPvG7sJswokpC_-wF8BtJrdXBr2qc5bbqRVkfo
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjkyNDgsImV4cCI6MjA5ODM0NTI0OH0.WIQHauPvG7sJswokpC_-wF8BtJrdXBr2qc5bbqRVkfo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjc2OTI0OCwiZXhwIjoyMDk4MzQ1MjQ4fQ.X-f5ScV_h8v6kvw8zFk_06K3GD7M4jTXNwgz2nG-C0w
SUPABASE_PROJECT_REF=epqmzlnhculyqflbbulq

# ==============================================
# SERVER CONFIGURATION
# ==============================================
PORT=8080
NODE_ENV=production

# ==============================================
# CORS CONFIGURATION
# ==============================================
FRONTEND_URL=http://124.156.204.209
```

### 2. Frontend `.env`

```env
VITE_USE_API=true
VITE_API_URL=/api
```

### 3. Backend `.env`

```env
DATABASE_URL=postgresql://postgres:Inventoryassetsweb@db.epqmzlnhculyqflbbulq.supabase.co:5432/postgres
JWT_SECRET=CHANGE-THIS-TO-A-RANDOM-SECRET-STRING
SUPABASE_JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjkyNDgsImV4cCI6MjA5ODM0NTI0OH0.WIQHauPvG7sJswokpC_-wF8BtJrdXBr2qc5bbqRVkfo
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjkyNDgsImV4cCI6MjA5ODM0NTI0OH0.WIQHauPvG7sJswokpC_-wF8BtJrdXBr2qc5bbqRVkfo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjc2OTI0OCwiZXhwIjoyMDk4MzQ1MjQ4fQ.X-f5ScV_h8v6kvw8zFk_06K3GD7M4jTXNwgz2nG-C0w
SUPABASE_PROJECT_REF=epqmzlnhculyqflbbulq
PORT=8080
NODE_ENV=production
FRONTEND_URL=http://124.156.204.209
```

---

## 🐳 DOCKER CONFIGURATION

### 1. docker-compose.yml

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

### 2. Backend Dockerfile

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

### 3. Frontend Dockerfile

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

### 4. nginx.conf

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

---

## 🛠️ TAHAPAN DEVELOPMENT

### TAHAP 1: Project Setup

1. **Frontend Setup**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install leaflet react-leaflet react-leaflet-cluster
npm install axios xlsx papaparse
npm install react-router-dom react-hook-form zod
npm install lucide-react clsx tailwind-merge framer-motion
npm install react-hot-toast
```

2. **Backend Setup**
```bash
mkdir backend && cd backend
npm init -y
npm install express cors helmet morgan dotenv
npm install jsonwebtoken bcryptjs zod multer
npm install @prisma/client papaparse xlsx
npm install -D typescript @types/node @types/express
npm install -D prisma tsx
npx prisma init
```

### TAHAP 2: Backend Development

1. **Setup Prisma Schema** (`backend/prisma/schema.prisma`)
2. **Create API Routes**:
   - `src/routes/auth.routes.ts` - Login, Register, Profile
   - `src/routes/locations.routes.ts` - CRUD Locations + Map Data
   - `src/routes/devices.routes.ts` - CRUD Devices + CSV Upload
   - `src/routes/hierarchy.routes.ts` - Regional/District/Cluster
   - `src/routes/users.routes.ts` - User Management
3. **Setup Middleware**:
   - `src/middleware/auth.ts` - JWT authentication
   - `src/middleware/error-handler.ts` - Error handling

### TAHAP 3: Frontend Development

1. **Setup Contexts**:
   - `AuthContext` - Authentication state
   - `FilterContext` - Filter state
   - `MapContext` - Map data state

2. **Create Components**:
   - Map Page dengan Leaflet
   - Sidebar dengan filters
   - Device CRUD panels
   - Upload CSV modal

3. **Integrate API**:
   - API client dengan axios interceptors
   - JWT token handling
   - Error handling

### TAHAP 4: Testing

1. **Test API Endpoints**
```bash
# Health check
curl http://localhost:8080/api/health

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

2. **Test Frontend**
```bash
npm run dev
```

---

## 🚀 VPS DEPLOYMENT

### Langkah 1: Persiapan VPS

```bash
# SSH ke VPS
ssh root@124.156.204.209

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Nginx
apt install -y nginx

# Setup Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### Langkah 2: Clone & Setup

```bash
cd /opt
git clone https://github.com/faril-bily-wijaya/inventory-assets-web.git
cd inventory-assets-web

# Setup environment
cp .env.production backend/.env
nano backend/.env  # Update JWT_SECRET!

# Build & Start
docker-compose build
docker-compose up -d
```

### Langkah 3: Verify

```bash
# Check container status
docker-compose ps

# Check health
curl http://localhost:8080/api/health

# Check logs
docker-compose logs -f backend
```

---

## 📡 API ENDPOINTS

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/locations` | List all locations |
| GET | `/api/locations/map-data` | Get map data |
| GET | `/api/locations/:id` | Get location by ID |
| POST | `/api/locations` | Create location |
| PUT | `/api/locations/:id` | Update location |
| DELETE | `/api/locations/:id` | Delete location |

### Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices` | List all devices |
| GET | `/api/devices/:id` | Get device by ID |
| POST | `/api/devices` | Create device |
| PUT | `/api/devices/:id` | Update device |
| DELETE | `/api/devices/:id` | Soft delete device |
| POST | `/api/devices/bulk-delete` | Bulk delete |
| POST | `/api/devices/upload-csv` | Upload CSV |
| GET | `/api/devices/stats/summary` | Get stats |

### Hierarchy

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hierarchy` | Get all hierarchy |
| POST | `/api/hierarchy/regionals` | Create regional |
| POST | `/api/hierarchy/districts` | Create district |
| POST | `/api/hierarchy/clusters` | Create cluster |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| PUT | `/api/users/:id/role` | Update user role |
| PUT | `/api/users/:id/active` | Toggle active |
| DELETE | `/api/users/:id` | Deactivate user |

---

## ✅ CHECKLIST IMPLEMENTASI

### Backend
- [ ] Setup project structure
- [ ] Configure Prisma with Supabase
- [ ] Create database migrations
- [ ] Implement auth middleware
- [ ] Create auth routes
- [ ] Create locations routes
- [ ] Create devices routes
- [ ] Create hierarchy routes
- [ ] Create users routes
- [ ] Add CSV upload functionality
- [ ] Add error handling
- [ ] Write API tests
- [ ] Dockerize application

### Frontend
- [ ] Setup React + TypeScript + Vite
- [ ] Configure Tailwind CSS
- [ ] Create type definitions
- [ ] Setup API client
- [ ] Create AuthContext
- [ ] Create FilterContext
- [ ] Create MapContext
- [ ] Build Map page with Leaflet
- [ ] Build Sidebar with filters
- [ ] Build Device CRUD panel
- [ ] Build Upload CSV modal
- [ ] Build Login/Register pages
- [ ] Build Management page
- [ ] Add dark mode support
- [ ] Mobile responsive
- [ ] Dockerize frontend

### Database
- [x] Create users table
- [x] Create regionals table
- [x] Create districts table
- [x] Create clusters table
- [x] Create locations table
- [x] Create devices table
- [x] Enable RLS policies
- [x] Insert seed data
- [x] Insert admin user

### Deployment
- [ ] Push code to GitHub
- [ ] Setup VPS
- [ ] Clone repo to VPS
- [ ] Configure environment
- [ ] Build Docker images
- [ ] Start containers
- [ ] Verify deployment
- [ ] Setup SSL (optional)

---

## 🔒 SECURITY NOTES

1. **Ganti JWT_SECRET** di environment dengan random string
2. **Database password** sudah di-supabase vault
3. **RLS policies** sudah enabled
4. **Tidak expose** service_role key di frontend
5. **HTTPS** direkomendasikan untuk production

---

## 📞 SUPPORT

- **Supabase Dashboard**: https://supabase.com/dashboard/project/epqmzlnhculyqflbbulq
- **GitHub Repo**: https://github.com/faril-bily-wijaya/inventory-assets-web
- **VPS IP**: 124.156.204.209

---

*Script ini dibuat untuk pembangunan ulang sistem Map Inventory dari awal dengan arsitektur modern dan deployment-ready.*
