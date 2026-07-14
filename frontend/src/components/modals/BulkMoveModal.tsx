import { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface ParentOption {
  id: string
  name: string
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newParentId: string) => Promise<void>
  itemsCount: number
  parentOptions: ParentOption[]
  parentLabel: string
}

export function BulkMoveModal({ isOpen, onClose, onConfirm, itemsCount, parentOptions, parentLabel }: Props) {
  const [selectedParentId, setSelectedParentId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedParentId) {
      toast.error(`Silakan pilih ${parentLabel} tujuan`)
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirm(selectedParentId)
    } finally {
      setIsSubmitting(false)
      setSelectedParentId('')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden mx-4"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-blue-500" />
                Pindah Induk Massal
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Anda akan memindahkan <strong className="text-slate-900 dark:text-white">{itemsCount} item</strong> yang dipilih ke Induk baru.
                </p>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Pilih {parentLabel} Tujuan <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                >
                  <option value="">-- Pilih {parentLabel} --</option>
                  {parentOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedParentId}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Pindahkan'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
