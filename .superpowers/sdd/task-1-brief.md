# Task 1: Update Prisma Schema

**Plan:** Add UUID & Organization Fields to Devices
**Location:** docs/superpowers/plans/2026-07-03-add-uuid-organization-fields-plan.md

## Requirements

Add 4 new nullable fields to the `devices` model in `backend/prisma/schema.prisma`:
1. `uuid` - String?, @map("uuid") @db.Uuid
2. `organization_name` - String?, @map("organization_name") @db.VarChar(255)
3. `organization_uuid` - String?, @map("organization_uuid") @db.Uuid
4. `organization_sname` - String?, @map("organization_sname") @db.VarChar(50)

## Current schema location

File: `backend/prisma/schema.prisma`
Find the `devices` model (starts around line 102) and add these fields after `rack_luas` and before `location_id`.

## Exact fields to add

```prisma
uuid               String?   @map("uuid") @db.Uuid
organization_name  String?   @map("organization_name") @db.VarChar(255)
organization_uuid String?   @map("organization_uuid") @db.Uuid
organization_sname String?   @map("organization_sname") @db.VarChar(50)
```

## Commands to run after edit

1. Generate migration: `npx prisma migrate dev --name add_organization_fields_to_devices`
2. Generate client: `npx prisma generate`

## Acceptance Criteria

- [ ] 4 new fields added to devices model
- [ ] Migration created successfully
- [ ] Prisma client generated with new fields

## Context

This is part of adding UUID and organization fields to devices from the CSV import. The fields are needed for tracking devices and organization relationships.

**Location in Plan:** Phase 1, Task 1

## Files to Create
- `frontend/package.json`
- `frontend/vite.config.ts`
- `frontend/tsconfig.json`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/src/index.css`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/.env`

## Steps

### Step 1: Create frontend directory and initialize with Vite
```bash
cd "D:/project Coding/Inventory-assets-program"
mkdir frontend
cd frontend
npm create vite@latest . -- --template react-ts --force
npm install
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Configure tailwind.config.js with custom theme
Use this exact configuration:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#0B1120',
          secondary: '#151D2E',
          card: '#1C2938',
          elevated: '#243044',
          border: '#2D3B4F',
          'border-focus': '#3D4F66',
        },
        light: {
          primary: '#F5F7FA',
          secondary: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#EEF2F7',
          border: '#E2E8F0',
          'border-focus': '#CBD5E1',
        },
        accent: {
          DEFAULT: '#22D3EE',
          hover: '#06B6D4',
          muted: 'rgba(34,211,238,0.15)',
        },
        success: {
          DEFAULT: '#34D399',
          muted: 'rgba(52,211,153,0.15)',
        },
        warning: {
          DEFAULT: '#FBBF24',
          muted: 'rgba(251,191,36,0.15)',
        },
        danger: {
          DEFAULT: '#F87171',
          muted: 'rgba(248,113,113,0.15)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
```

### Step 3: Create index.css with Tailwind directives and CSS variables
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #F5F7FA;
    --bg-secondary: #FFFFFF;
    --bg-card: #FFFFFF;
    --bg-elevated: #EEF2F7;
    --border: #E2E8F0;
    --border-focus: #CBD5E1;
    --text-primary: #1E293B;
    --text-secondary: #475569;
    --text-muted: #94A3B8;
    --accent: #0891B2;
    --accent-hover: #0E7490;
    --accent-muted: rgba(8,145,178,0.1);
    --success: #059669;
    --success-muted: rgba(5,150,105,0.1);
    --warning: #D97706;
    --warning-muted: rgba(217,119,6,0.1);
    --danger: #DC2626;
    --danger-muted: rgba(220,38,38,0.1);
  }

  .dark {
    --bg-primary: #0B1120;
    --bg-secondary: #151D2E;
    --bg-card: #1C2938;
    --bg-elevated: #243044;
    --border: #2D3B4F;
    --border-focus: #3D4F66;
    --text-primary: #E8ECF2;
    --text-secondary: #B8C4D0;
    --text-muted: #6B7A8A;
    --accent: #22D3EE;
    --accent-hover: #06B6D4;
    --accent-muted: rgba(34,211,238,0.15);
    --success: #34D399;
    --success-muted: rgba(52,211,153,0.15);
    --warning: #FBBF24;
    --warning-muted: rgba(251,191,36,0.15);
    --danger: #F87171;
    --danger-muted: rgba(248,113,113,0.15);
  }

  body {
    @apply bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased;
    transition: background-color 300ms ease, color 300ms ease;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-accent text-white rounded-sm font-medium
           hover:bg-accent-hover transition-colors duration-150
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--text-primary)] rounded-sm font-medium
           hover:bg-[var(--bg-elevated)] transition-colors duration-150;
  }

  .btn-ghost {
    @apply px-4 py-2 bg-transparent text-[var(--text-primary)] rounded-sm font-medium
           hover:bg-[var(--bg-elevated)] transition-colors duration-150;
  }

  .btn-danger {
    @apply px-4 py-2 bg-danger text-white rounded-sm font-medium
           hover:opacity-90 transition-opacity duration-150;
  }

  .card {
    @apply bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4;
  }

  .card-hover {
    @apply card hover:border-accent/50 hover:shadow-lg transition-all duration-150;
  }

  .input {
    @apply w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm
           text-[var(--text-primary)] placeholder-[var(--text-muted)]
           focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
           transition-colors duration-150;
  }

  .input-error {
    @apply input border-danger focus:border-danger focus:ring-danger/30;
  }

  .badge {
    @apply inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium;
  }

  .badge-success {
    @apply badge bg-success-muted text-success;
  }

  .badge-warning {
    @apply badge bg-warning-muted text-warning;
  }

  .badge-danger {
    @apply badge bg-danger-muted text-danger;
  }

  .badge-muted {
    @apply badge bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)];
  }

  .marker-active {
    @apply bg-accent shadow-[0_0_12px_rgba(34,211,238,0.6)];
  }

  .marker-warning {
    @apply bg-warning shadow-[0_0_12px_rgba(251,191,36,0.6)];
  }

  .marker-critical {
    @apply bg-danger shadow-[0_0_12px_rgba(248,113,113,0.6)] animate-pulse;
  }
}
```

### Step 4: Install additional dependencies
```bash
npm install react-router-dom react-hook-form zod @hookform/resolvers
npm install axios lucide-react clsx tailwind-merge framer-motion react-hot-toast
npm install leaflet react-leaflet @react-leaflet/core react-leaflet-cluster
npm install @types/leaflet
```

### Step 5: Create .env file
```env
VITE_USE_API=true
VITE_API_URL=http://localhost:8080/api
```

### Step 6: Create main.tsx
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Step 7: Create App.tsx (basic skeleton - will be expanded later)
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/layout/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
```

### Step 8: Initialize git and commit
```bash
git init
git add frontend/
git commit -m "feat: setup frontend project with React + Vite + TypeScript + TailwindCSS"
```

## Notes
- Dark mode is default
- Use Tailwind CSS variables for theming
- The App.tsx imports contexts that will be created in Task 3 - use placeholder components for now or create stub files
- Design system: "Calm Command Center" with cyan/teal accent colors
