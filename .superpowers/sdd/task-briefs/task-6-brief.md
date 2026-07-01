# Task 6 Brief: Backend - Location Devices Endpoint

## Task Description

Add GET /api/locations/:id/devices endpoint with device categorization.

## Endpoint

```
GET /api/locations/:id/devices
```

## Response Format

```typescript
{
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

## Requirements

1. Get location with devices (excluding deleted)
2. Include hierarchy (cluster → district → regional)
3. Calculate butuhModernisasi on-the-fly using modernization utility
4. Categorize devices: Catu Daya vs Non-Catu Daya
5. Return max 5 items per section (preview)
6. Include hasMore flag if total > 5

## Catu Daya Types

```typescript
const CATU_DAYA_TYPES = [
  'GENSET', 'BATSTARTER', 'BATBASAH', 'BATKERING', 'RECTIFIER',
  'INVERTER', 'UPS', 'MDP', 'AVR', 'TANGKIBBM', 'DCPDB',
  'ACPDB', 'DCPDBSTANDING', 'ACPDBSTANDING', 'ELECTRICALPANEL',
  'TRAFO', 'ATS', 'AMF'
];
```

## Dependencies

- Task 3 (modernization utility)

## Work Directory

D:\project Coding\Inventory-assets-program\backend

## Notes

- Use authMiddleware for authentication
- Return 404 if location not found
