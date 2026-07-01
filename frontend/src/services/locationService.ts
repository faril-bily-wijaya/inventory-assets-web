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
