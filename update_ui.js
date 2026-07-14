const fs = require('fs')

const filePath = 'd:\\project Coding\\Inventory-assets-program\\frontend\\src\\pages\\LocationsManagementPage.tsx'
let content = fs.readFileSync(filePath, 'utf8')

// 1. Add imports
content = content.replace(
  "import { Plus, Pencil, Trash2, MapPin, Search } from 'lucide-react'",
  "import { Plus, Pencil, Trash2, MapPin, Search, CheckSquare, Square, ArrowRight } from 'lucide-react'"
)
content = content.replace(
  "import { LocationFormModal } from '../components/modals/LocationFormModal'",
  "import { LocationFormModal } from '../components/modals/LocationFormModal'\nimport { BulkMoveModal } from '../components/modals/BulkMoveModal'"
)

// 2. Add State
content = content.replace(
  "  const [searchQuery, setSearchQuery] = useState('')",
  `  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)`
)

// 3. Update useEffect
content = content.replace(
  /  useEffect\(\(\) => \{\n    fetchData\(\)\n  \}, \[\]\)/,
  `  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    setSelectedIds([])
  }, [activeTab, searchQuery])`
)

// 4. Add handlers
const handlers = `
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData().map(i => i.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const handleBulkDelete = async () => {
    // Check if any selected item has children
    const items = filteredData().filter(i => selectedIds.includes(i.id))
    const hasChildren = items.some(item => getChildCount(item) > 0)
    if (hasChildren) {
      toast.error('Tidak dapat menghapus item terpilih karena ada yang masih memiliki bawahan.')
      return
    }
    
    if (!window.confirm(\`Yakin ingin menghapus \${selectedIds.length} item secara permanen?\`)) return

    setIsBulkDeleting(true)
    try {
      await locationService.bulkDelete(activeTab, selectedIds)
      toast.success(\`\${selectedIds.length} item berhasil dihapus\`)
      setSelectedIds([])
      fetchData()
    } catch (error) {
      toast.error('Gagal menghapus beberapa item')
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleBulkMoveConfirm = async (newParentId: string) => {
    if (activeTab === 'area' || activeTab === 'location') return
    const items = filteredData().filter(i => selectedIds.includes(i.id)).map(i => ({ id: i.id, name: i.name }))
    
    try {
      await locationService.bulkMove(activeTab as any, items, newParentId)
      toast.success(\`\${selectedIds.length} item berhasil dipindahkan\`)
      setIsBulkMoveOpen(false)
      setSelectedIds([])
      fetchData()
    } catch (error) {
      toast.error('Gagal memindahkan beberapa item')
    }
  }
`

content = content.replace(
  "  const filteredData = () => {",
  handlers + "\n  const filteredData = () => {"
)

// 5. Add Bulk Action Bar
const bulkActionBar = `
        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/50 p-3 px-6 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
              <CheckSquare className="w-4 h-4" />
              {selectedIds.length} item terpilih
            </div>
            <div className="flex gap-2">
              {(activeTab === 'regional' || activeTab === 'district' || activeTab === 'cluster') && (
                <button
                  onClick={() => setIsBulkMoveOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Pindah Induk
                </button>
              )}
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 text-sm font-medium rounded-lg transition-colors"
              >
                {isBulkDeleting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Hapus Terpilih
              </button>
            </div>
          </div>
        )}
`

content = content.replace(
  "{/* Table */}",
  bulkActionBar + "\n        {/* Table */}"
)

// 6. Checkboxes in table
const theadOld = `                  <th className="py-3 px-6 font-semibold text-slate-600 dark:text-slate-300">Nama</th>`
const theadNew = `                  <th className="py-3 px-6 w-12">
                    <input
                      type="checkbox"
                      checked={filteredData().length > 0 && selectedIds.length === filteredData().length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    />
                  </th>
                  <th className="py-3 px-6 font-semibold text-slate-600 dark:text-slate-300">Nama</th>`
content = content.replace(theadOld, theadNew)

const tbodyOld = `                      <td className="py-3 px-6 font-medium text-slate-800 dark:text-slate-200">
                        {item.name}
                      </td>`
const tbodyNew = `                      <td className="py-3 px-6">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelectOne(item.id)}
                          className="w-4 h-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                      </td>
                      <td className="py-3 px-6 font-medium text-slate-800 dark:text-slate-200">
                        {item.name}
                      </td>`
content = content.replace(tbodyOld, tbodyNew)

// 7. Add BulkMoveModal to render
const modalOld = `        <HierarchyModal`
const modalNew = `        <BulkMoveModal
          isOpen={isBulkMoveOpen}
          onClose={() => setIsBulkMoveOpen(false)}
          onConfirm={handleBulkMoveConfirm}
          itemsCount={selectedIds.length}
          parentOptions={getParentOptions()}
          parentLabel={activeTab === 'regional' ? 'Area' : activeTab === 'district' ? 'Regional' : 'District'}
        />

        <HierarchyModal`
content = content.replace(modalOld, modalNew)

fs.writeFileSync(filePath, content)
console.log('Successfully updated LocationsManagementPage.tsx')
