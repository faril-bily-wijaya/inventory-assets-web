export type Role = 'ADMIN' | 'USER'
export type DeviceStatus = 'active' | 'warning' | 'critical' | 'inactive'
export type ImportMode = 'upsert' | 'replace'

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

// Import Types
export interface ImportPreview {
  totalRows: number
  devicesBaru: number
  devicesUpdated: number
  duplikatDalamFile: number
  regionalsBaru: number
  districtsBaru: number
  clustersBaru: number
  locationsBaru: number
  errors: string[]
}

export interface ImportResultData {
  newDevices: number
  updatedDevices: number
  newLocations: number
  totalProcessed: number
  errors: string[]
}

export interface ImportResult {
  success: boolean
  result: ImportResultData
}

export interface DeviceWithModernization extends Device {
  butuhModernisasi: boolean
  alasan?: string
}

export interface LocationDevicesResponse {
  location: {
    id: string
    name: string
    latitude: number
    longitude: number
    address?: string
    classType?: string
    hierarchy: {
      regional?: string
      district?: string
      cluster?: string
    }
  }
  devices: {
    catuDaya: {
      total: number
      items: DeviceWithModernization[]
      hasMore: boolean
    }
    nonCatuDaya: {
      total: number
      items: DeviceWithModernization[]
      hasMore: boolean
    }
  }
}
