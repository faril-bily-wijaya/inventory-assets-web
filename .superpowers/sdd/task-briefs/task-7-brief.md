# Task 7 Brief: Frontend - Import Types and Service

## Task Description

Add import types and create import service for frontend.

## Types to Add (frontend/src/types/index.ts)

```typescript
export type ImportMode = 'upsert' | 'replace';

export interface ImportPreview {
  totalRows: number;
  devicesBaru: number;
  devicesUpdated: number;
  duplikatDalamFile: number;
  regionalsBaru: number;
  districtsBaru: number;
  clustersBaru: number;
  locationsBaru: number;
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  result: {
    newDevices: number;
    updatedDevices: number;
    newLocations: number;
    totalProcessed: number;
    errors: string[];
    parseErrors?: string[];
  };
}

export interface DeviceWithModernization extends Device {
  butuhModernisasi: boolean;
  alasanModernisasi?: string;
  isCatuDaya: boolean;
}

export interface LocationDevicesResponse {
  location: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
    classType?: string;
    hierarchy: {
      regional?: string;
      district?: string;
      cluster?: string;
    };
  };
  devices: {
    catuDaya: {
      total: number;
      items: DeviceWithModernization[];
      hasMore: boolean;
    };
    nonCatuDaya: {
      total: number;
      items: DeviceWithModernization[];
      hasMore: boolean;
    };
  };
}
```

## Service to Create (frontend/src/services/importService.ts)

```typescript
export interface UploadOptions {
  file: File;
  mode: 'upsert' | 'replace';
}

export const importService = {
  async getPreview(options: UploadOptions): Promise<ImportPreview>
  async executeImport(options: UploadOptions): Promise<ImportResult>
  async downloadTemplate(): Promise<void>
  async getLocationDevices(locationId: string): Promise<LocationDevicesResponse>
}
```

## Requirements

1. getPreview: POST /api/devices/import/preview with FormData
2. executeImport: POST /api/devices/import with FormData
3. downloadTemplate: GET /api/devices/import/template with blob response
4. getLocationDevices: GET /api/locations/:id/devices

## Dependencies

- Task 5 (API endpoints must exist)
- Existing api client in frontend/src/services/api.ts

## Work Directory

D:\project Coding\Inventory-assets-program\frontend
