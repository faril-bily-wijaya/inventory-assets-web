# Task 8 Brief: Frontend - Import Components

## Task Description

Create import tab components for the devices page.

## Components to Create

### 1. FileDropzone.tsx
- Drag & drop file upload area
- Click to select file
- Show selected file with size
- Client-side validation (extension, size)
- Clear file button

### 2. ModeSelector.tsx
- Two-option toggle: "Tambah Data" / "Ganti Semua"
- Visual distinction (green/red styling)
- Disabled state

### 3. ImportPreview.tsx
- Display preview stats from API
- Show: totalRows, devicesBaru, devicesUpdated, duplikatDalamFile
- Show hierarchy changes: regionalsBaru, districtsBaru, clustersBaru, locationsBaru
- Show parse errors if any
- Confirm and Cancel buttons

### 4. ConfirmModal.tsx
- Warning modal for Replace mode
- Required text input: type "HAPUS DATA"
- Only enable confirm when input matches exactly
- Red/danger styling

### 5. ImportTab.tsx
- Main container combining all components
- State management: selectedFile, mode, preview, loading
- Flow: select file → choose mode → preview → confirm
- Toast notifications for success/error

### 6. index.ts
- Export all components

## Design Guidelines

- Use existing UI components: Button, Modal, Input, Badge
- Use Tailwind CSS v4 classes
- Dark theme styling (slate colors)
- Cyan accent color for interactive elements
- Red for destructive actions

## File Locations

```
frontend/src/components/import/
├── FileDropzone.tsx
├── ModeSelector.tsx
├── ImportPreview.tsx
├── ConfirmModal.tsx
├── ImportTab.tsx
└── index.ts
```

## Dependencies

- Task 7 (importService and types)

## Work Directory

D:\project Coding\Inventory-assets-program\frontend
