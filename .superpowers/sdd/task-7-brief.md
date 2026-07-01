# Task 7: Create API Service and TypeScript Types

**Location in Plan:** Phase 4, Task 7

## Context
Task 6 created backend API routes. Task 7 creates TypeScript types and frontend API services.

## Files to Create
1. `frontend/src/types/index.ts`
2. `frontend/src/services/api.ts`
3. `frontend/src/services/authService.ts`
4. `frontend/src/services/deviceService.ts`
5. `frontend/src/services/locationService.ts`

## TypeScript Types
```typescript
// src/types/index.ts
export type Role = 'ADMIN' | 'USER'
export type DeviceStatus = 'active' | 'warning' | 'critical' | 'inactive'

export interface User {
  id: string
  username: string
  email: string
  fullName?: string
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface Regional {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  districts?: District[]
}

export interface District {
  id: string
  name: string
  regionalId: string
  createdAt: string
  updatedAt: string
  regional?: Regional
  clusters?: Cluster[]
}

export interface Cluster {
  id: string
  name: string
  districtId: string
  createdAt: string
  updatedAt: string
  district?: District
  locations?: Location[]
  _count?: { locations: number }
}

export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  clusterId: string
  classType?: string
  address?: string
  createdAt: string
  updatedAt: string
  cluster?: Cluster
  devices?: Device[]
  _count?: { devices: number }
}

export interface Device {
  id: string
  deviceCode: string
  deviceName: string
  deviceType: string
  brand?: string
  model?: string
  serialNumber?: string
  kapasitas?: string
  year?: number
  room?: string
  status: DeviceStatus
  condition?: string
  capReal?: string
  locationId: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  location?: Location
}

export interface MapMarker {
  id: string
  name: string
  latitude: number
  longitude: number
  address?: string
  classType?: string
  deviceCount: number
  devices: Pick<Device, 'id' | 'deviceCode' | 'deviceName' | 'deviceType' | 'status' | 'condition'>[]
  hierarchy: { regional: string; district: string; cluster: string }
  worstStatus: DeviceStatus
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface DevicesResponse {
  devices: Device[]
  pagination: Pagination
}

export interface HierarchyResponse {
  regionals: Regional[]
  districts: District[]
  clusters: Cluster[]
}

export interface MapDataResponse {
  markers: MapMarker[]
}

export interface DeviceStats {
  total: number
  byStatus: Record<DeviceStatus, number>
  byType: Record<string, number>
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface DeviceFormData {
  deviceCode: string
  deviceName: string
  deviceType: string
  brand?: string
  model?: string
  serialNumber?: string
  kapasitas?: string
  year?: number
  room?: string
  status: DeviceStatus
  condition?: string
  capReal?: string
  locationId: string
}
```

## API Service
```typescript
// src/services/api.ts
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

## Auth Service
```typescript
// src/services/authService.ts
import { api } from './api'
import type { User, LoginRequest, LoginResponse } from '../types'

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  async register(data: LoginRequest & { email: string; fullName?: string }): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data)
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me')
    return response.data.user
  },
}
```

## Device Service
```typescript
// src/services/deviceService.ts
import { api } from './api'
import type { Device, DevicesResponse, DeviceStats, DeviceFormData } from '../types'

export interface DeviceFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  deviceType?: string
  locationId?: string
  clusterId?: string
  districtId?: string
  regionalId?: string
}

export const deviceService = {
  async getDevices(filters: DeviceFilters = {}): Promise<DevicesResponse> {
    const response = await api.get<DevicesResponse>('/devices', { params: filters })
    return response.data
  },

  async getDevice(id: string): Promise<Device> {
    const response = await api.get<{ device: Device }>(`/devices/${id}`)
    return response.data.device
  },

  async createDevice(data: DeviceFormData): Promise<Device> {
    const response = await api.post<{ device: Device }>('/devices', data)
    return response.data.device
  },

  async updateDevice(id: string, data: Partial<DeviceFormData>): Promise<Device> {
    const response = await api.put<{ device: Device }>(`/devices/${id}`, data)
    return response.data.device
  },

  async deleteDevice(id: string): Promise<void> {
    await api.delete(`/devices/${id}`)
  },

  async bulkDelete(ids: string[]): Promise<void> {
    await api.post('/devices/bulk-delete', { ids })
  },

  async getStats(): Promise<DeviceStats> {
    const response = await api.get<DeviceStats>('/devices/stats')
    return response.data
  },
}
```

## Location Service
```typescript
// src/services/locationService.ts
import { api } from './api'
import type { Location, MapMarker, HierarchyResponse } from '../types'

export interface LocationFilters {
  clusterId?: string
  districtId?: string
  regionalId?: string
}

export const locationService = {
  async getLocations(filters: LocationFilters = {}): Promise<Location[]> {
    const response = await api.get<{ locations: Location[] }>('/locations', { params: filters })
    return response.data.locations
  },

  async getMapData(): Promise<MapMarker[]> {
    const response = await api.get<{ markers: MapMarker[] }>('/locations/map-data')
    return response.data.markers
  },

  async getLocation(id: string): Promise<Location> {
    const response = await api.get<{ location: Location }>(`/locations/${id}`)
    return response.data.location
  },

  async createLocation(data: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location> {
    const response = await api.post<{ location: Location }>('/locations', data)
    return response.data.location
  },

  async updateLocation(id: string, data: Partial<Location>): Promise<Location> {
    const response = await api.put<{ location: Location }>(`/locations/${id}`, data)
    return response.data.location
  },

  async deleteLocation(id: string): Promise<void> {
    await api.delete(`/locations/${id}`)
  },

  async getHierarchy(): Promise<HierarchyResponse> {
    const response = await api.get<HierarchyResponse>('/hierarchy')
    return response.data
  },

  async createRegional(name: string) {
    const response = await api.post('/hierarchy/regionals', { name })
    return response.data
  },

  async createDistrict(name: string, regionalId: string) {
    const response = await api.post('/hierarchy/districts', { name, regionalId })
    return response.data
  },

  async createCluster(name: string, districtId: string) {
    const response = await api.post('/hierarchy/clusters', { name, districtId })
    return response.data
  },
}
```

## Verification
```bash
npm run dev
# Check for TypeScript errors
```

## Commit
```bash
git add src/types/ src/services/
git commit -m "feat: add TypeScript types and API services"
```
