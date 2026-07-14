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

export interface Area {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  regionals?: Regional[]
}

export interface Regional {
  id: string
  name: string
  areaId?: string
  createdAt: string
  updatedAt: string
  area?: Area
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
  siteCode?: string
  latitude: number
  longitude: number
  clusterId?: string
  areaId?: string
  regionalId?: string
  districtId?: string
  address?: string
  teknisi?: string
  uuid?: string
  organizationUuid?: string
  organizationSname?: string
  createdAt: string
  updatedAt: string
  area?: Area
  regional?: Regional
  district?: District
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
  labelCode?: string
  kapasitas?: string
  satuanKapasitas?: string
  year?: number
  usiaPerangkat?: number
  ruanganCode?: string
  ruanganName?: string
  ruanganPanjang?: number
  ruanganLebar?: number
  ruanganTinggi?: number
  ruanganLuas?: number
  rackCode?: string
  rackName?: string
  rackPanjang?: number
  rackLebar?: number
  rackTinggi?: number
  rackLuas?: number
  status: DeviceStatus
  condition?: string
  capReal?: string
  jenisTegangan?: string
  bebanArus?: number
  satuanBeban?: string
  keterangan?: string
  uuid?: string
  organizationName?: string
  organizationUuid?: string
  organizationSname?: string
  locationId: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
  location?: Location
  butuhModernisasi?: boolean
  alasan?: string
}

export interface MapMarker {
  id: string
  name: string
  siteCode?: string
  latitude: number
  longitude: number
  address?: string
  classType?: string
  teknisi?: string
  deviceCount: number
  devices: Device[]
  hierarchy: { area?: string; regional: string; district: string; cluster: string }
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
  areas: Area[]
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
  byCategory?: {
    catuDaya: number
    nonCatuDaya: number
  }
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
  labelCode?: string
  kapasitas?: string
  satuanKapasitas?: string
  year?: number
  usiaPerangkat?: number
  status: DeviceStatus
  condition?: string
  capReal?: string
  jenisTegangan?: string
  bebanArus?: number
  satuanBeban?: string
  keterangan?: string
  ruanganCode?: string
  ruanganName?: string
  ruanganPanjang?: number
  ruanganLebar?: number
  ruanganTinggi?: number
  ruanganLuas?: number
  rackCode?: string
  rackName?: string
  rackPanjang?: number
  rackLebar?: number
  rackTinggi?: number
  rackLuas?: number
  uuid?: string
  organizationName?: string
  organizationUuid?: string
  organizationSname?: string
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
    siteCode?: string
    latitude: number
    longitude: number
    address?: string
    classType?: string
    teknisi?: string
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
