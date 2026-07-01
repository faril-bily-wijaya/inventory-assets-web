import { AlertTriangle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
          <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-400' : 'text-amber-400'}`} />
        </div>
        <p className="text-[var(--text-secondary)]">{message}</p>
      </div>
    </Modal>
  )
}
