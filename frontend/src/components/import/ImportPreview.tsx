import { FileText, AlertTriangle, CheckCircle2, AlertCircle, Database, MapPin } from 'lucide-react'
import { Button } from '../ui/Button'
import type { ImportPreview } from '../../types'
import { cn } from '../../utils/cn'

interface ImportPreviewProps {
  preview: ImportPreview
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  mode: 'upsert' | 'replace'
}

export function ImportPreview({ preview, onConfirm, onCancel, isLoading, mode }: ImportPreviewProps) {
  const hasErrors = preview.errors.length > 0

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-[var(--border)]">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-2">
            <FileText className="w-4 h-4" />
            <span className="text-xs uppercase">Total Rows</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{preview.totalRows}</p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-[var(--border)]">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs uppercase">Device Baru</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{preview.devicesBaru}</p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-[var(--border)]">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-2">
            <Database className="w-4 h-4" />
            <span className="text-xs uppercase">Device Update</span>
          </div>
          <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{preview.devicesUpdated}</p>
        </div>

        <div className={cn(
          "p-4 rounded-lg border",
          preview.duplikatDalamFile > 0
            ? "bg-amber-50 dark:bg-amber-500/10 border-amber-500/50"
            : "bg-slate-50 dark:bg-slate-800/50 border-[var(--border)]"
        )}>
          <div className={cn(
            "flex items-center gap-2 mb-2",
            preview.duplikatDalamFile > 0 ? "text-amber-600 dark:text-amber-400" : "text-[var(--text-secondary)]"
          )}>
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs uppercase">Duplikat</span>
          </div>
          <p className={cn(
            "text-2xl font-bold",
            preview.duplikatDalamFile > 0 ? "text-amber-600 dark:text-amber-400" : "text-[var(--text-primary)]"
          )}>
            {preview.duplikatDalamFile}
          </p>
        </div>
      </div>

      {/* Hierarchy Changes */}
      <div>
        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          Perubahan Hierarchy
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-[var(--border)]">
            <p className="text-xs text-[var(--text-secondary)] mb-1">Regional Baru</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{preview.regionalsBaru}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-[var(--border)]">
            <p className="text-xs text-[var(--text-secondary)] mb-1">District Baru</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{preview.districtsBaru}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-[var(--border)]">
            <p className="text-xs text-[var(--text-secondary)] mb-1">Cluster Baru</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{preview.clustersBaru}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-[var(--border)]">
            <p className="text-xs text-[var(--text-secondary)] mb-1">Lokasi Baru</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{preview.locationsBaru}</p>
          </div>
        </div>
      </div>

      {/* Errors */}
      {hasErrors && (
        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Error Parsing</span>
          </div>
          <ul className="space-y-1 max-h-32 overflow-y-auto">
            {preview.errors.slice(0, 10).map((error, index) => (
              <li key={index} className="text-xs text-red-300">
                {error}
              </li>
            ))}
            {preview.errors.length > 10 && (
              <li className="text-xs text-red-400 font-medium">
                ...dan {preview.errors.length - 10} error lainnya
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button
          variant={mode === 'replace' ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={isLoading || preview.totalRows === 0}
        >
          {isLoading ? 'Memproses...' : mode === 'replace' ? 'Import & Hapus Data' : 'Import Data'}
        </Button>
      </div>
    </div>
  )
}
