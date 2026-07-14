import { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { locationService } from '../../services/locationService'
import type { Location } from '../../types'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  location?: Location
  onSuccess: () => void
}

const locationSchema = z.object({
  name: z.string().min(1, 'Nama Lokasi wajib diisi'),
  siteCode: z.string().optional(),
  latitude: z.string().min(1, 'Latitude wajib diisi').refine(val => !isNaN(parseFloat(val)), {
    message: 'Latitude harus berupa angka'
  }),
  longitude: z.string().min(1, 'Longitude wajib diisi').refine(val => !isNaN(parseFloat(val)), {
    message: 'Longitude harus berupa angka'
  }),
  clusterId: z.string().min(1, 'Cluster ID wajib diisi'),
  address: z.string().optional(),
  teknisi: z.string().optional(),
})

type FormValues = z.infer<typeof locationSchema>

export function LocationFormModal({ isOpen, onClose, location, onSuccess }: Props) {
  const isEditing = !!location

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      siteCode: '',
      latitude: '',
      longitude: '',
      clusterId: '',
      address: '',
      teknisi: '',
    }
  })

  useEffect(() => {
    if (location) {
      reset({
        name: location.name || '',
        siteCode: location.siteCode || '',
        latitude: location.latitude?.toString() || '',
        longitude: location.longitude?.toString() || '',
        clusterId: location.clusterId || '',
        address: location.address || '',
        teknisi: location.teknisi || '',
      })
    } else {
      reset({
        name: '',
        siteCode: '',
        latitude: '',
        longitude: '',
        clusterId: '',
        address: '',
        teknisi: '',
      })
    }
  }, [location, reset])

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        name: data.name,
        siteCode: data.siteCode || undefined,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        clusterId: data.clusterId || undefined,
        address: data.address || undefined,
        teknisi: data.teknisi || undefined,
      }

      if (isEditing && location) {
        await locationService.updateLocation(location.id, payload)
        toast.success('Lokasi berhasil diperbarui')
      } else {
        await locationService.createLocation(payload)
        toast.success('Lokasi berhasil ditambahkan')
      }

      onSuccess()
      onClose()
      reset()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Gagal menyimpan data lokasi')
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
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden mx-4 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {isEditing ? 'Edit Lokasi' : 'Tambah Lokasi'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto">
              {/* Nama Lokasi */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nama Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="Contoh: STO Palembang Centro"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Kode STO/Site */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Kode STO/Site
                </label>
                <input
                  type="text"
                  {...register('siteCode')}
                  placeholder="Contoh: PLB01"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.siteCode ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all`}
                />
                {errors.siteCode && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                    {errors.siteCode.message}
                  </p>
                )}
              </div>

              {/* Latitude & Longitude Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('latitude')}
                    placeholder="-3.123456"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.latitude ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all`}
                  />
                  {errors.latitude && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                      {errors.latitude.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('longitude')}
                    placeholder="104.789012"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.longitude ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all`}
                  />
                  {errors.longitude && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                      {errors.longitude.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Cluster ID Row */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Cluster ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('clusterId')}
                  placeholder="Contoh: cl-001"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.clusterId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all`}
                />
                {errors.clusterId && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                    {errors.clusterId.message}
                  </p>
                )}
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Alamat
                </label>
                <textarea
                  {...register('address')}
                  rows={3}
                  placeholder="Contoh: Jl. Sudirman No. 123, Palembang"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.address ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none`}
                />
                {errors.address && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Teknisi Row */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Teknisi
                </label>
                <input
                  type="text"
                  {...register('teknisi')}
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.teknisi ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all`}
                />
                {errors.teknisi && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                    {errors.teknisi.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
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
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    isEditing ? 'Simpan Perubahan' : 'Tambah Lokasi'
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
