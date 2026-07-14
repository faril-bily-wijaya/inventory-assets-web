# Task Brief: Frontend - Create LocationFormModal.tsx

## Task
Create `frontend/src/components/modals/LocationFormModal.tsx` for CRUD operations on STO/Site locations.

## Requirements

### Create LocationFormModal.tsx
Path: `frontend/src/components/modals/LocationFormModal.tsx`

Features:
- Modal with form fields for location data
- Support both Create and Edit modes (based on `location` prop)
- Form fields:
  1. Nama Lokasi (required)
  2. Kode STO/Site (optional)
  3. Latitude (required, number)
  4. Longitude (required, number)
  5. Cluster ID (required) - use text input for now
  6. Class Type (dropdown: BASIC, MEDIUM, PREMIUM)
  7. Alamat (textarea)
  8. Territori (text)
  9. Teknisi (text)
- Use react-hook-form + zod for validation
- Use framer-motion for animations
- Call `locationService.createLocation()` or `locationService.updateLocation()`
- Call `onSuccess()` after successful submit
- Follow styling patterns from existing `HierarchyModal.tsx`

### Commit
```bash
git add frontend/src/components/modals/LocationFormModal.tsx
git commit -m "feat(ui): add LocationFormModal for STO/Site CRUD"
```

## Interfaces
- Uses: `locationService.createLocation()`, `locationService.updateLocation()` from `../../services/locationService`
- Uses: `Location` type from `../../types`

## Props Interface
```typescript
interface Props {
  isOpen: boolean
  onClose: () => void
  location?: Location  // undefined = create mode, defined = edit mode
  onSuccess: () => void
}
```

## Report Contract
Write report to: `docs/superpowers/plans/task-2-report.md`
Report: status, commits, test_summary, concerns
