import { useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { locationService } from '../../services/locationService'
import toast from 'react-hot-toast'

export type HierarchyType = 'area' | 'regional' | 'district' | 'cluster'

const getTitle = (type: HierarchyType, isEditing: boolean) => {
  const base = isEditing ? 'Edit' : 'Tambah'
  switch (type) {
    case 'area': return `${base} Area`
    case 'regional': return `${base} Regional`
    case 'district': return `${base} District`
    case 'cluster': return `${base} Cluster`
  }
}

const getParentLabel = (type: HierarchyType) => {
  switch (type) {
    case 'regional': return 'Pilih Area Induk'
    case 'district': return 'Pilih Regional Induk'
    case 'cluster': return 'Pilih District Induk'
    default: return ''
  }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  type: HierarchyType
  initialData?: any
  parentOptions?: { id: string; name: string }[]
  onSuccess: () => void
}

export function HierarchyModal({ isOpen, onClose, type, initialData, parentOptions, onSuccess }: Props) {
  const isEditing = !!initialData

  // Define schema dynamically based on type
  const schema = z.object({
    name: z.string().min(1, 'Nama wajib diisi'),
    parentId: type === 'area' ? z.string().optional() : z.string().min(1, 'Induk wajib dipilih')
  })

  type FormValues = z.infer<typeof schema>

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', parentId: '' }
  })

  useEffect(() => {
    if (initialData) {
      let parentId = ''
      if (type === 'regional') parentId = initialData.area_id || initialData.areaId || ''
      if (type === 'district') parentId = initialData.regional_id || initialData.regionalId || ''
      if (type === 'cluster') parentId = initialData.district_id || initialData.districtId || ''
      
      reset({
        name: initialData.name || '',
        parentId
      })
    } else {
      reset({ name: '', parentId: '' })
    }
  }, [initialData, type, reset])

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing) {
        switch (type) {
          case 'area':
            await locationService.updateArea(initialData.id, data.name)
            break
          case 'regional':
            await locationService.updateRegional(initialData.id, data.name, data.parentId!)
            break
          case 'district':
            await locationService.updateDistrict(initialData.id, data.name, data.parentId!)
            break
          case 'cluster':
            await locationService.updateCluster(initialData.id, data.name, data.parentId!)
            break
        }
        toast.success(`${getTitle(type, true)} berhasil disimpan`)
      } else {
        switch (type) {
          case 'area':
            await locationService.createArea(data.name)
            break
          case 'regional':
            await locationService.createRegional(data.name, data.parentId!)
            break
          case 'district':
            await locationService.createDistrict(data.name, data.parentId!)
            break
          case 'cluster':
            await locationService.createCluster(data.name, data.parentId!)
            break
        }
        toast.success(`${getTitle(type, false)} berhasil ditambahkan`)
      }
      onSuccess()
      onClose()
      reset()
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Gagal menyimpan data ${type}`)
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
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden mx-4"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {getTitle(type, isEditing)}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {type !== 'area' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {getParentLabel(type)}
                  </label>
                  <select
                    {...register('parentId')}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.parentId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50`}
                  >
                    <option value="">-- Pilih Induk --</option>
                    {parentOptions?.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                  {errors.parentId && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                      {errors.parentId.message}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nama {type.charAt(0).toUpperCase() + type.slice(1)}
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder={`Contoh: ${type === 'area' ? 'SUMATERA' : type === 'regional' ? 'REGIONAL 2' : type === 'district' ? 'PALEMBANG' : 'CLUSTER PALEMBANG 1'}`}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1.5">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
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
                    isEditing ? 'Simpan Perubahan' : 'Tambah'
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
