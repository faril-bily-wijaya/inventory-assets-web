import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

const CONFIRM_TEXT = 'HAPUS DATA'

export function ConfirmModal({ isOpen, onClose, onConfirm, isLoading }: ConfirmModalProps) {
  const [inputValue, setInputValue] = useState('')
  const isConfirmed = inputValue === CONFIRM_TEXT

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm()
      setInputValue('')
    }
  }

  const handleClose = () => {
    setInputValue('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Konfirmasi Import">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-400 mb-1">
              Peringatan: Mode Replace
            </h4>
            <p className="text-sm text-slate-300">
              Semua device dan lokasi yang ada akan <strong>dihapus</strong> sebelum data baru di-import.
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-slate-300">
            Ketik <span className="font-mono font-bold text-red-400">{CONFIRM_TEXT}</span> untuk konfirmasi:
          </label>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={CONFIRM_TEXT}
            className="font-mono"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!isConfirmed || isLoading}
            isLoading={isLoading}
          >
            Ya, Hapus & Import
          </Button>
        </div>
      </div>
    </Modal>
  )
}
