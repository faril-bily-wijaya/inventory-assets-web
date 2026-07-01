# Task 9 Brief: Frontend - Devices Page with Tabs

## Task Description

Update DevicesPage.tsx to add tabs for "Daftar" and "Import".

## Requirements

### Tab Navigation
- Two tabs: "Daftar" and "Import"
- Use List and Upload icons from lucide-react
- Active tab styling: cyan background
- Inactive tab styling: slate text

### Tab Content
- "Daftar" tab: existing device list component
- "Import" tab: ImportTab component (from Task 8)

## Component Structure

```typescript
type TabType = 'list' | 'import';

export function DevicesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('list');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg w-fit">
        <button onClick={() => setActiveTab('list')}>
          <List className="w-4 h-4 mr-2" />
          Daftar
        </button>
        <button onClick={() => setActiveTab('import')}>
          <Upload className="w-4 h-4 mr-2" />
          Import
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && <DevicesList />}
      {activeTab === 'import' && <ImportTab />}
    </div>
  );
}
```

## Dependencies

- Task 8 (ImportTab component)
- Existing DevicesList component

## File Location

`frontend/src/pages/DevicesPage.tsx`

## Work Directory

D:\project Coding\Inventory-assets-program\frontend
