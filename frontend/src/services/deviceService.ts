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
