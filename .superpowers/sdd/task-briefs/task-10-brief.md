# Task 10 Brief: Frontend - Map Popup Enhancement

## Task Description

Enhance DevicePopup component with categorized sections and add new components.

## Components to Create/Modify

### 1. DeviceSection.tsx (NEW)
- Section header with icon and count badge
- Search input for filtering
- Type filter dropdown
- Status filter dropdown
- Device list with modernized indicator
- "View more" button (max 5 items shown)

### 2. DeviceListModal.tsx (NEW)
- Full device list modal
- Two sections: Catu Daya and Non-Catu Daya
- Each device shows: name, code, serial, type, brand, year, status
- Modernization badge when applicable
- Scrollable list per section

### 3. DevicePopup.tsx (MODIFY)
- Replace current implementation
- Fetch devices via importService.getLocationDevices()
- Display header with location info
- Two DeviceSection components (Catu Daya, Non-Catu Daya)
- Loading state
- Open DeviceListModal when "View All" clicked

## UI Structure

```
DevicePopup
├── Header (location name, address, badges)
├── DeviceSection (Catu Daya)
│   ├── Filters (search, type, status)
│   ├── Device Cards (max 5)
│   └── "View X more" button
├── DeviceSection (Non-Catu Daya)
│   ├── Filters
│   ├── Device Cards (max 5)
│   └── "View X more" button
└── "View All Devices" button
    └── DeviceListModal (on click)
```

## Filter Options

### Type Options
- Semua Jenis
- GENSET, BATTERY, RECTIFIER, INVERTER, UPS
- AC, OLT, SWITCH, ROUTER, DWDM, SERVER

### Status Options
- Semua Status
- AKTIF, IDLE, RUSAK

## Design Guidelines

- Cyan styling for Catu Daya section
- Teal styling for Non-Catu Daya section
- Warning badge for devices needing modernization
- Dark theme (slate backgrounds)

## Dependencies

- Task 7 (importService, types)

## File Locations

```
frontend/src/components/map/
├── DeviceSection.tsx (NEW)
├── DeviceListModal.tsx (NEW)
└── DevicePopup.tsx (MODIFY)
```

## Work Directory

D:\project Coding\Inventory-assets-program\frontend
