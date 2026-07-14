import { api } from './api'
import type { ImportPreview, ImportResult, ImportMode, LocationDevicesResponse } from '../types'

export interface UploadOptions {
  file: File
  mode: ImportMode
  importType?: 'default' | 'genset'
}

export const importService = {
  async getPreview(options: UploadOptions): Promise<ImportPreview> {
    const formData = new FormData()
    formData.append('file', options.file)
    formData.append('mode', options.mode)
    if (options.importType) {
      formData.append('importType', options.importType)
    }

    const response = await api.post<ImportPreview>(
      '/devices/import/preview',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  async executeImport(options: UploadOptions): Promise<ImportResult> {
    const formData = new FormData()
    formData.append('file', options.file)
    formData.append('mode', options.mode)
    if (options.importType) {
      formData.append('importType', options.importType)
    }

    const response = await api.post<ImportResultData>(
      '/devices/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return {
      success: true,
      result: response.data,
    }
  },

  async downloadTemplate(importType?: 'default' | 'genset'): Promise<void> {
    const urlPath = importType === 'genset' 
      ? '/devices/import/template?type=genset' 
      : '/devices/import/template'
      
    const response = await api.get(urlPath, {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', importType === 'genset' ? 'genset_import_template.xlsx' : 'device_import_template.xlsx')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  async getLocationDevices(locationId: string): Promise<LocationDevicesResponse> {
    const response = await api.get<LocationDevicesResponse>(
      `/locations/${locationId}/devices`
    )
    return response.data
  },
}

type ImportResultData = {
  newDevices: number
  updatedDevices: number
  newLocations: number
  totalProcessed: number
  errors: string[]
}
