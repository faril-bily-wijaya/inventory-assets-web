import { api } from './api'
import type { Location, MapMarker, HierarchyResponse } from '../types'

export interface LocationFilters {
  areaId?: string[]
  clusterId?: string[]
  districtId?: string[]
  regionalId?: string[]
  locationId?: string[]
}

export const locationService = {
  async getLocations(filters: LocationFilters = {}): Promise<Location[]> {
    const response = await api.get<{ locations: Location[] }>('/locations', { params: filters })
    return response.data.locations
  },

  async getMapData(filters: LocationFilters = {}): Promise<MapMarker[]> {
    const response = await api.get<{ markers: MapMarker[] }>('/locations/map-data', { params: filters })
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

  async getAreas() {
    const response = await api.get('/hierarchy/areas')
    return response.data
  },

  async createArea(name: string) {
    const response = await api.post('/hierarchy/areas', { name })
    return response.data
  },

  async createRegional(name: string, areaId?: string) {
    const response = await api.post('/hierarchy/regionals', { name, areaId })
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

  async updateArea(id: string, name: string) {
    const response = await api.put(`/hierarchy/areas/${id}`, { name })
    return response.data
  },

  async deleteArea(id: string) {
    const response = await api.delete(`/hierarchy/areas/${id}`)
    return response.data
  },

  async updateRegional(id: string, name: string, areaId?: string) {
    const response = await api.put(`/hierarchy/regionals/${id}`, { name, areaId })
    return response.data
  },

  async deleteRegional(id: string) {
    const response = await api.delete(`/hierarchy/regionals/${id}`)
    return response.data
  },

  async updateDistrict(id: string, name: string, regionalId: string) {
    const response = await api.put(`/hierarchy/districts/${id}`, { name, regionalId })
    return response.data
  },

  async deleteDistrict(id: string) {
    const response = await api.delete(`/hierarchy/districts/${id}`)
    return response.data
  },

  async updateCluster(id: string, name: string, districtId: string) {
    const response = await api.put(`/hierarchy/clusters/${id}`, { name, districtId })
    return response.data
  },

  async deleteCluster(id: string) {
    const response = await api.delete(`/hierarchy/clusters/${id}`)
    return response.data
  },

  async bulkDelete(type: 'area' | 'regional' | 'district' | 'cluster' | 'location', ids: string[]) {
    switch (type) {
      case 'area': return Promise.all(ids.map(id => this.deleteArea(id)))
      case 'regional': return Promise.all(ids.map(id => this.deleteRegional(id)))
      case 'district': return Promise.all(ids.map(id => this.deleteDistrict(id)))
      case 'cluster': return Promise.all(ids.map(id => this.deleteCluster(id)))
      case 'location': return Promise.all(ids.map(id => this.deleteLocation(id)))
    }
  },

  async bulkMove(type: 'regional' | 'district' | 'cluster', items: { id: string, name: string }[], newParentId: string) {
    switch (type) {
      case 'regional': return Promise.all(items.map(i => this.updateRegional(i.id, i.name, newParentId)))
      case 'district': return Promise.all(items.map(i => this.updateDistrict(i.id, i.name, newParentId)))
      case 'cluster': return Promise.all(items.map(i => this.updateCluster(i.id, i.name, newParentId)))
    }
  },
}
