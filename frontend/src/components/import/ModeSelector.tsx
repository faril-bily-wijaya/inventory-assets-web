import { PlusCircle, RefreshCw } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { ImportMode } from '../../types'

interface ModeSelectorProps {
  value: ImportMode
  onChange: (mode: ImportMode) => void
  disabled?: boolean
}

export function ModeSelector({ value, onChange, disabled }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange('upsert')}
        disabled={disabled}
        className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
          value === 'upsert'
            ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
            : "border-[var(--border)] bg-slate-50 text-[var(--text-secondary)] hover:border-slate-400 dark:bg-slate-800/50 dark:hover:border-slate-600",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <PlusCircle className={cn("w-6 h-6", value === 'upsert' && "text-emerald-500 dark:text-emerald-400")} />
        <span className="text-sm font-medium">Tambah Data</span>
        <span className="text-xs text-[var(--text-muted)]">
          Menambah device baru
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange('replace')}
        disabled={disabled}
        className={cn(
          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
          value === 'replace'
            ? "border-red-500 bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
            : "border-[var(--border)] bg-slate-50 text-[var(--text-secondary)] hover:border-slate-400 dark:bg-slate-800/50 dark:hover:border-slate-600",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <RefreshCw className={cn("w-6 h-6", value === 'replace' && "text-red-500 dark:text-red-400")} />
        <span className="text-sm font-medium">Ganti Semua</span>
        <span className="text-xs text-[var(--text-muted)]">
          Hapus & import ulang
        </span>
      </button>
    </div>
  )
}
