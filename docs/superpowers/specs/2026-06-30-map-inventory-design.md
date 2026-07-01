# Design Spec: Map Inventory Asset Management System

**Project**: TIF Indonesia - Map Inventory Asset Management  
**Date**: 2026-06-30  
**Status**: Approved  

---

## 1. Concept & Vision

Sistem monitoring dan pengelolaan aset inventaris berbasis peta interaktif untuk Tim TIF Indonesia. Aplikasi ini menggabungkan fungsionalitas CRUD dengan visualisasi geografis yang intuitif — memungkinkan pengguna melihat distribusi aset, status perangkat, dan hierarki regional secara real-time di atas peta.

Target audiens: Admin IT dan Manajer Aset yang membutuhkan visibilitas menyeluruh terhadap ribuan perangkat di berbagai lokasi Sumatra. Nuansa visual: **Professional Monitoring Dashboard** — terasa seperti pusat kendali yang serius namun nyaman untuk penggunaan jangka panjang.

---

## 2. Design Language

### Aesthetic Direction
**"Calm Command Center"** — Desain yang terinspirasi dari monitoring dashboard modern (seperti Grafana, Datadog) tapi dengan palette yang lebih warm dan approachable. Tidak terlalu "tech-cold", melainkan "tech-comfortable".

### Color Palette

#### Dark Mode (Default - Nyaman untuk penggunaan 24/7)
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0B1120` | Main background |
| `--bg-secondary` | `#151D2E` | Sidebar, panels |
| `--bg-card` | `#1C2938` | Cards, modals |
| `--bg-elevated` | `#243044` | Hover states, dropdowns |
| `--border` | `#2D3B4F` | Borders, dividers |
| `--border-focus` | `#3D4F66` | Focus rings |
| `--text-primary` | `#E8ECF2` | Main text |
| `--text-secondary` | `#B8C4D0` | Secondary text |
| `--text-muted` | `#6B7A8A` | Placeholders, hints |
| `--accent` | `#22D3EE` | Primary actions, active states (Cyan) |
| `--accent-hover` | `#06B6D4` | Hover on accent |
| `--accent-muted` | `rgba(34,211,238,0.15)` | Accent backgrounds |
| `--success` | `#34D399` | Success states, online |
| `--success-muted` | `rgba(52,211,153,0.15)` | Success backgrounds |
| `--warning` | `#FBBF24` | Warning states, maintenance |
| `--warning-muted` | `rgba(251,191,36,0.15)` | Warning backgrounds |
| `--danger` | `#F87171` | Error states, critical |
| `--danger-muted` | `rgba(248,113,113,0.15)` | Danger backgrounds |

#### Light Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#F5F7FA` | Main background |
| `--bg-secondary` | `#FFFFFF` | Sidebar, panels |
| `--bg-card` | `#FFFFFF` | Cards, modals |
| `--bg-elevated` | `#EEF2F7` | Hover states, dropdowns |
| `--border` | `#E2E8F0` | Borders, dividers |
| `--border-focus` | `#CBD5E1` | Focus rings |
| `--text-primary` | `#1E293B` | Main text |
| `--text-secondary` | `#475569` | Secondary text |
| `--text-muted` | `#94A3B8` | Placeholders, hints |
| `--accent` | `#0891B2` | Primary actions (Teal-600) |
| `--accent-hover` | `#0E7490` | Hover on accent |
| `--accent-muted` | `rgba(8,145,178,0.1)` | Accent backgrounds |
| `--success` | `#059669` | Success states |
| `--success-muted` | `rgba(5,150,105,0.1)` | Success backgrounds |
| `--warning` | `#D97706` | Warning states |
| `--warning-muted` | `rgba(217,119,6,0.1)` | Warning backgrounds |
| `--danger` | `#DC2626` | Error states |
| `--danger-muted` | `rgba(220,38,38,0.1)` | Danger backgrounds |

### Typography

**Font Family**: `Plus Jakarta Sans` (Google Fonts)
- Display/Heading: 700 weight
- Subheading: 600 weight
- Body: 400-500 weight
- **Monospace (data)**: `JetBrains Mono` untuk device codes, serial numbers

**Type Scale**:
```
h1: 32px / 40px line-height / -0.02em tracking
h2: 24px / 32px line-height / -0.01em tracking
h3: 20px / 28px line-height / 0 tracking
h4: 16px / 24px line-height / 0.01em tracking
body: 14px / 22px line-height / 0 tracking
caption: 12px / 18px line-height / 0.02em tracking
```

### Spatial System
- **Base unit**: 4px
- **Spacing scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px
- **Border radius**: 
  - Small (buttons, inputs): 6px
  - Medium (cards): 12px
  - Large (modals): 16px
  - Full (avatars, badges): 9999px

### Motion Philosophy
- **Theme switch**: 300ms ease transition on all color properties
- **Sidebar toggle**: 250ms ease-out transform
- **Card hover**: 150ms scale(1.01) + shadow elevation
- **Button interactions**: 100ms background transition
- **Modal**: 200ms fade + 150ms slide-up
- **Map markers**: CSS pulse animation hanya untuk status critical (1.5s infinite)
- **Reduced motion**: Respect `prefers-reduced-motion` media query

### Visual Assets
- **Icons**: Lucide React (consistent stroke width: 1.5px)
- **Map tiles**: CartoDB Voyager (light) / CartoDB Dark Matter (dark)
- **Status indicators**: Colored dots dengan subtle glow di dark mode

---

## 3. Layout & Structure

### Overall Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (56px fixed)                                            │
│  [Logo] [Navigation Tabs] [Search] [Notifications] [User] [Theme]│
├────────────────┬────────────────────────────────────────────────┤
│                │                                                │
│   SIDEBAR      │              MAIN CONTENT                      │
│   (280px)      │                                                │
│                │   ┌─────────────────────────────────────────┐  │
│   • Logo area  │   │                                         │  │
│   • Hierarchy  │   │            MAP VIEW                     │  │
│     filters    │   │        (Leaflet + React-Leaflet)         │  │
│   • Status     │   │                                         │  │
│     filters    │   │   [Markers] [Clusters] [Heatmap]        │  │
│   • Search     │   │                                         │  │
│   • Quick      │   │                                         │  │
│     stats      │   └─────────────────────────────────────────┘  │
│                │                                                │
│                │   ┌─────────────────────────────────────────┐  │
│                │   │     BOTTOM PANEL (collapsible)         │  │
│                │   │  Device List / Details / Quick Stats   │  │
│                │   └─────────────────────────────────────────┘  │
└────────────────┴────────────────────────────────────────────────┘
```

### Page Structure

#### 1. Login Page
- Centered card layout
- Logo + app name
- Username + password fields
- Remember me checkbox
- Login button with loading state
- Error message display

#### 2. Dashboard/Map Page (Main)
- Full-width map hero (min-height: 70vh)
- Collapsible sidebar left
- Expandable bottom panel for device details
- Floating action buttons for quick actions

#### 3. Management Pages
- Header with title + breadcrumb
- Data table with sorting, filtering, pagination
- CRUD action buttons
- Slide-over panel for create/edit forms

### Responsive Breakpoints
```
Mobile:  < 640px   (sidebar as drawer, map fullscreen)
Tablet:  640-1024px (sidebar collapsible, condensed cards)
Desktop: > 1024px  (full layout)
```

---

## 4. Features & Interactions

### Authentication
- **Login**: Username + password → JWT token stored in localStorage
- **Session**: Token refresh on API calls, auto-logout on 401
- **Protected routes**: Redirect to login if no valid token

### Map Interactions
- **Pan/Zoom**: Standard Leaflet controls
- **Marker click**: Open popup with device summary
- **Cluster click**: Zoom in or show list of devices
- **Location click**: Show all devices at that location
- **Heatmap toggle**: Overlay heatmap based on device density

### Filtering
- **Hierarchical**: Regional → District → Cluster → Location (cascading)
- **Status**: Active, Warning, Critical, Inactive
- **Device type**: Filter by device category
- **Search**: Real-time search by device name/code

### Device Management
- **List view**: Paginated table with sortable columns
- **Detail view**: Slide-over panel with full info
- **Create/Edit**: Modal form with validation
- **Delete**: Confirmation dialog + soft delete
- **Bulk actions**: Multi-select + bulk delete/update

### Data Import
- **CSV Upload**: Drag & drop + file picker
- **Validation**: Show preview + error rows before import
- **Progress**: Upload progress bar

### Theme Toggle
- **Icon**: Sun (light) / Moon (dark)
- **Persistence**: Save preference in localStorage
- **System default**: Option to follow system preference

---

## 5. Component Inventory

### Buttons
| Variant | Dark Mode | Light Mode | States |
|---------|-----------|------------|--------|
| Primary | Cyan bg, white text | Teal bg, white text | hover: darker, disabled: opacity 50% |
| Secondary | Transparent, border | White bg, border | hover: bg-elevated |
| Ghost | Transparent, text only | Transparent, text | hover: bg-elevated |
| Danger | Red bg, white text | Red bg, white text | hover: darker |

### Form Inputs
- **Default**: Border, bg-card, placeholder muted
- **Focus**: Accent border + subtle glow
- **Error**: Danger border + error message below
- **Disabled**: Opacity 50%, cursor not-allowed

### Cards
- **Default**: bg-card, border, 12px radius, 16px padding
- **Hover**: Subtle shadow elevation, border-color accent
- **Selected**: Accent border, accent-muted background

### Modals
- **Backdrop**: Black 50% opacity with blur
- **Container**: bg-card, 16px radius, max-width 500px
- **Header**: Title + close button
- **Footer**: Cancel + Primary action buttons

### Sidebar
- **Container**: bg-secondary, full height, 280px width
- **Sections**: Divided by subtle borders
- **Collapse**: Transform translateX, icon-only mode on mobile

### Data Table
- **Header**: Sticky, bg-secondary, uppercase caption text
- **Rows**: Alternating subtle backgrounds, hover highlight
- **Pagination**: Page numbers + prev/next buttons
- **Empty state**: Illustration + "No data" message + action CTA

### Toast Notifications
- **Success**: Success-muted background, success icon
- **Error**: Danger-muted background, danger icon
- **Position**: Bottom-right, stacked
- **Auto-dismiss**: 5 seconds

### Status Badges
| Status | Color | Style |
|--------|-------|-------|
| Active | Success | Solid dot + text |
| Warning | Warning | Solid dot + text |
| Critical | Danger | Pulsing dot + text |
| Inactive | Muted | Outlined dot + text |

### Map Markers
- **Active**: Cyan marker dengan subtle glow
- **Warning**: Amber marker dengan glow
- **Critical**: Red marker dengan pulse animation
- **Cluster**: Circle dengan count, color berdasarkan worst status di cluster

---

## 6. Technical Approach

### Frontend Stack
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom theme config
- **Map**: Leaflet + React-Leaflet + react-leaflet-cluster
- **State**: React Context + useReducer for global state
- **Forms**: React Hook Form + Zod validation
- **HTTP**: Axios with interceptors
- **Icons**: Lucide React
- **Animations**: Framer Motion (minimal)
- **Toasts**: React Hot Toast

### Backend Stack
- **Runtime**: Node.js 20
- **Framework**: Express.js + TypeScript
- **ORM**: Prisma
- **Database**: Supabase PostgreSQL
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod
- **File handling**: Multer + papaparse + xlsx

### API Design
All endpoints prefixed with `/api`

**Authentication**
```
POST /api/auth/login     → { token, user }
POST /api/auth/register  → { token, user }
GET  /api/auth/me        → { user }
```

**Locations**
```
GET    /api/locations           → { locations[] }
GET    /api/locations/map-data  → { markers[], clusters[] }
POST   /api/locations           → { location }
PUT    /api/locations/:id       → { location }
DELETE /api/locations/:id       → { success }
```

**Devices**
```
GET    /api/devices             → { devices[], pagination }
GET    /api/devices/:id         → { device }
POST   /api/devices             → { device }
PUT    /api/devices/:id         → { device }
DELETE /api/devices/:id         → { success }
POST   /api/devices/bulk-delete → { success }
POST   /api/devices/upload-csv  → { imported, errors[] }
GET    /api/devices/stats       → { total, byStatus, byType }
```

**Hierarchy**
```
GET  /api/hierarchy             → { regionals[], districts[], clusters[] }
POST /api/hierarchy/regionals   → { regional }
POST /api/hierarchy/districts   → { district }
POST /api/hierarchy/clusters    → { cluster }
```

**Users**
```
GET    /api/users               → { users[] }
PUT    /api/users/:id/role      → { user }
PUT    /api/users/:id/active    → { user }
DELETE /api/users/:id            → { success }
```

### Data Model (Prisma Schema)
```prisma
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
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
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

---

## 7. File Structure

```
inventory-assets-web/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Base UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── ...
│   │   │   ├── map/             # Map components
│   │   │   │   ├── MapView.tsx
│   │   │   │   ├── Markers.tsx
│   │   │   │   ├── Clusters.tsx
│   │   │   │   ├── Heatmap.tsx
│   │   │   │   └── Popup.tsx
│   │   │   ├── sidebar/          # Sidebar components
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── FilterPanel.tsx
│   │   │   │   └── QuickStats.tsx
│   │   │   ├── modals/           # Modal components
│   │   │   │   ├── DeviceModal.tsx
│   │   │   │   ├── LocationModal.tsx
│   │   │   │   ├── ConfirmModal.tsx
│   │   │   │   └── UploadModal.tsx
│   │   │   └── layout/           # Layout components
│   │   │       ├── Header.tsx
│   │   │       ├── BottomPanel.tsx
│   │   │       └── PageContainer.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DevicesPage.tsx
│   │   │   ├── LocationsPage.tsx
│   │   │   └── UsersPage.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   ├── FilterContext.tsx
│   │   │   └── MapContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useTheme.ts
│   │   │   ├── useFilters.ts
│   │   │   └── useMap.ts
│   │   ├── services/
│   │   │   ├── api.ts           # Axios instance
│   │   │   ├── authService.ts
│   │   │   ├── deviceService.ts
│   │   │   ├── locationService.ts
│   │   │   └── hierarchyService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── cn.ts            # Class name merger
│   │   │   ├── formatters.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css            # Tailwind + custom CSS
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── package.json
│   └── .env
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── devices.routes.ts
│   │   │   ├── locations.routes.ts
│   │   │   ├── hierarchy.routes.ts
│   │   │   └── users.routes.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── error-handler.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── device.service.ts
│   │   │   └── csv.service.ts
│   │   ├── utils/
│   │   │   └── validators.ts
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env
│
├── docker-compose.yml
├── .env
└── README.md
```

---

## 8. Implementation Priority

### Phase 1: Foundation
1. Project setup (Vite, Tailwind config, theme system)
2. Base UI components (Button, Input, Card, Modal)
3. Layout components (Header, Sidebar, PageContainer)
4. Theme context + dark/light mode toggle

### Phase 2: Backend Core
1. Express server setup
2. Prisma schema + database connection
3. Auth middleware + routes
4. Basic CRUD routes

### Phase 3: Authentication Flow
1. Login page
2. Auth context + protected routes
3. API integration with interceptors

### Phase 4: Map Feature
1. Leaflet map integration
2. Marker components with status styling
3. Cluster + popup components
4. Map data fetching

### Phase 5: Filtering & Search
1. Filter context
2. Sidebar filter panel
3. Cascade filtering
4. Search functionality

### Phase 6: Device Management
1. Device CRUD modals
2. Data table with pagination
3. Bulk actions
4. CSV upload

### Phase 7: Polish
1. Toast notifications
2. Loading states
3. Error handling
4. Responsive adjustments
5. Animations

---

*Design spec created based on approved design direction: "Calm Command Center" aesthetic with Plus Jakarta Sans typography and cyan/teal accent colors.*
