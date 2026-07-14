# Task Brief: Frontend - Integrate LocationFormModal into LocationsManagementPage

## Task
Modify `frontend/src/pages/LocationsManagementPage.tsx` to integrate LocationFormModal and enable CRUD for the Lokasi (STO/Site) tab.

## Requirements

### Step 1: Import LocationFormModal
Add after import of ConfirmModal:
```typescript
import { LocationFormModal } from '../components/modals/LocationFormModal'
```

### Step 2: Add state for LocationFormModal
After line with `const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)`:
```typescript
const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
```

### Step 3: Update handleAdd function
Replace the toast error for 'location' tab with opening the modal:
```typescript
if (activeTab === 'location') {
  setEditingItem(null)
  setIsLocationModalOpen(true)
  return
}
```

### Step 4: Update handleEdit function
Replace the toast error for 'location' tab with opening the modal with item data.

### Step 5: Update handleDeleteClick function
For 'location' tab: check if location has devices, if not show delete confirmation.

### Step 6: Update handleDeleteConfirm function
Add case for 'location':
```typescript
case 'location':
  await locationService.deleteLocation(deletingItem.id)
  break
```

### Step 7: Add LocationFormModal component
Add before ConfirmModal:
```typescript
<LocationFormModal
  isOpen={isLocationModalOpen}
  onClose={() => {
    setIsLocationModalOpen(false)
    setEditingItem(null)
  }}
  location={editingItem as Location}
  onSuccess={fetchData}
/>
```

### Step 8: Commit
```bash
git add frontend/src/pages/LocationsManagementPage.tsx
git commit -m "feat(ui): integrate LocationFormModal in LocationsManagementPage"
```

## Interfaces
- Consumes: `LocationFormModal` component from `../components/modals/LocationFormModal`
- Consumes: `Location` type
- Uses: `locationService.deleteLocation()`

## Report Contract
Write report to: `docs/superpowers/plans/task-3-report.md`
Report: status, commits, test_summary, concerns
