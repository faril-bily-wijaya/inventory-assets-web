# Task 2: Update Import Service

**Plan:** Add UUID & Organization Fields to Devices
**Location:** docs/superpowers/plans/2026-07-03-add-uuid-organization-fields-plan.md

## Requirements

Update `mapDeviceData()` function in `backend/src/services/importService.ts` to include the 4 new fields.

## File to Modify

`backend/src/services/importService.ts` - function `mapDeviceData()` around line 87

## Exact Change

Find the `mapDeviceData` function and add these 4 fields after `rack_luas` (around line 118):

```typescript
uuid: normalise(row.uuid) || null,
organization_name: normalise(row.organization_name) || null,
organization_uuid: normalise(row.organization_uuid) || null,
organization_sname: normalise(row.organization_sname) || null,
```

## Acceptance Criteria

- [ ] 4 new fields added to mapDeviceData return object
- [ ] Code compiles successfully

## Context

Task 1 added the fields to the database schema. This task updates the import logic to populate those fields when importing CSV data. The fields `uuid`, `organization_name`, `organization_uuid`, `organization_sname` are already being parsed from CSV in fileParser.ts (ParsedRow interface).

**Location in Plan:** Phase 1, Task 2

## Files to Create
- `backend/package.json`
- `backend/tsconfig.json`
- `backend/.env`
- `backend/prisma/schema.prisma`
- `backend/src/index.ts`

## Supabase Configuration (from COMPLETE_REBUILD_SCRIPT.md)
- Project ID: `epqmzlnhculyqflbbulq`
- Database URL: `postgresql://postgres:Inventoryassetsweb@db.epqmzlnhculyqflbbulq.supabase.co:5432/postgres`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjkyNDgsImV4cCI6MjA5ODM0NTI0OH0.WIQHauPvG7sJswokpC_-wF8BtJrdXBr2qc5bbqRVkfo`
- Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjc2OTI0OCwiZXhwIjoyMDk4MzQ1MjQ4fQ.X-f5ScV_h8v6kvw8zFk_06K3GD7M4jTXNwgz2nG-C0w`

## Database Tables (Already Exist in Supabase)
The database schema is already created in Supabase with these tables:
- `users` (id, username, email, password, full_name, role, is_active, created_at, updated_at)
- `regionals` (id, name, created_at, updated_at)
- `districts` (id, name, regional_id, created_at, updated_at)
- `clusters` (id, name, district_id, created_at, updated_at)
- `locations` (id, name, latitude, longitude, cluster_id, class_type, address, created_at, updated_at)
- `devices` (id, device_code, device_name, device_type, brand, model, serial_number, kapasitas, year, room, status, condition, cap_real, location_id, created_at, updated_at, deleted_at)

## Prisma Schema
Create schema.prisma that matches the existing Supabase tables.

## Steps

### Step 1: Create backend directory and initialize
```bash
cd "D:/project Coding/Inventory-assets-program"
mkdir backend
cd backend
npm init -y
```

### Step 2: Install dependencies
```bash
npm install express cors helmet morgan dotenv
npm install jsonwebtoken bcryptjs zod multer
npm install @prisma/client papaparse xlsx
npm install -D typescript @types/node @types/express @types/cors @types/morgan
npm install -D @types/jsonwebtoken @types/bcryptjs @types/multer prisma tsx
npx prisma init
```

### Step 3: Configure TypeScript
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 4: Create .env file
```env
DATABASE_URL=postgresql://postgres:Inventoryassetsweb@db.epqmzlnhculyqflbbulq.supabase.co:5432/postgres
JWT_SECRET=CHANGE-THIS-TO-A-RANDOM-SECRET-STRING
SUPABASE_JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjkyNDgsImV4cCI6MjA5ODM0NTI0OH0.WIQHauPvG7sJswokpC_-wF8BtJrdXBr2qc5bbqRVkfo
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjkyNDgsImV4cCI6MjA5ODM0NTI0OH0.WIQHauPvG7sJswokpC_-wF8BtJrdXBr2qc5bbqRVkfo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcW16bG5oY3VseXFmbGJidWxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjc2OTI0OCwiZXhwIjoyMDk4MzQ1MjQ4fQ.X-f5ScV_h8v6kvw8zFk_06K3GD7M4jTXNwgz2nG-C0w
SUPABASE_PROJECT_REF=epqmzlnhculyqflbbulq
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 5: Create Prisma Schema
The prisma/schema.prisma should be created by npx prisma init. Update it to match the existing database:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String   @unique
  password  String
  fullName  String?
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Regional {
  id        String    @id @default(cuid())
  name      String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  districts District[]
}

model District {
  id         String     @id @default(cuid())
  name       String
  regionalId String
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  regional   Regional   @relation(fields: [regionalId], references: [id])
  clusters   Cluster[]
}

model Cluster {
  id         String     @id @default(cuid())
  name       String
  districtId String
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  district   District   @relation(fields: [districtId], references: [id])
  locations  Location[]
}

model Location {
  id         String   @id @default(cuid())
  name       String
  latitude   Float
  longitude  Float
  clusterId  String
  classType  String?
  address    String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  cluster    Cluster  @relation(fields: [clusterId], references: [id])
  devices    Device[]
}

model Device {
  id           String    @id @default(cuid())
  deviceCode   String    @unique
  deviceName   String
  deviceType   String
  brand        String?
  model        String?
  serialNumber String?
  kapasitas    String?
  year         Int?
  room         String?
  status       String    @default("active")
  condition    String?
  capReal      String?
  locationId   String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?
  location     Location  @relation(fields: [locationId], references: [id])
}

enum Role {
  ADMIN
  USER
}
```

### Step 6: Create basic Express server (src/index.ts)
```typescript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 8080

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handler placeholder
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export { prisma }
```

### Step 7: Update package.json scripts
Add to scripts section:
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

### Step 8: Generate Prisma client and test
```bash
npx prisma generate
```

## Notes
- This task creates the backend foundation only - routes will be added in Task 5-6
- The database tables already exist in Supabase, so we use `prisma generate` not `prisma migrate`
- JWT secret should be changed for production
