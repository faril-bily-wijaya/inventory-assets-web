import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Activity, Zap } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { useMapContext } from '../../contexts/MapContext'
import { deviceService } from '../../services/deviceService'
import type { Device } from '../../types'
import toast from 'react-hot-toast'

interface QuickEditGensetModalProps {
  device: Device
  onClose: () => void
  onSuccess: () => void
}

export function QuickEditGensetModal({ device, onClose, onSuccess }: QuickEditGensetModalProps) {
  const { locations } = useMapContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    locationId: device.locationId,
    status: device.status,
    condition: device.condition || 'Bagus',
    keterangan: device.keterangan || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await deviceService.updateDevice(device.id, {
        locationId: formData.locationId,
        status: formData.status,
        condition: formData.condition,
        keterangan: formData.keterangan
      })
      toast.success('Informasi Genset berhasil diperbarui')
      onSuccess()
    } catch (error) {
      toast.error('Gagal memperbarui informasi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{device.deviceName}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{device.brand} {device.kapasitas} {device.satuanKapasitas}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[var(--text-muted)] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" /> Posisi Saat Ini (STO)
                </label>
                <Select
                  value={formData.locationId}
                  onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                  required
                  className="w-full"
                >
                  <option value="" disabled>Pilih STO tempat genset parkir</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </Select>
                <p className="text-[10px] text-[var(--text-muted)]">Ubah lokasi jika genset dipindah ke STO lain.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-500" /> Status Operasional
                </label>
                <Select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  required
                  className="w-full"
                >
                  <option value="IDLE">Idle (Standby)</option>
                  <option value="INTEGRASI">Integrasi (Dipakai)</option>
                  <option value="OPERATIONAL">Operational</option>
                  <option value="RUSAK">Rusak (Bermasalah)</option>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-primary)]">Kondisi Fisik</label>
                <Select
                  value={formData.condition}
                  onChange={e => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full"
                >
                  <option value="Bagus">Bagus</option>
                  <option value="Rusak">Rusak</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--text-primary)]">Keterangan / Catatan</label>
                <textarea
                  value={formData.keterangan}
                  onChange={e => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-sm text-[var(--text-primary)] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 text-sm"
                  rows={3}
                  placeholder="Contoh: Overhaule karna air radiator, perlu perbaikan..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-slate-200 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>

          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
