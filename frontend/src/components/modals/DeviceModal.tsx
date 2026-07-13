import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { SearchableSelect } from '../ui/SearchableSelect'
import { deviceService } from '../../services/deviceService'
import { useMapContext } from '../../contexts/MapContext'
import type { Device, DeviceFormData } from '../../types'
import toast from 'react-hot-toast'

const optionalNumber = z.preprocess((val) => {
  if (val === '' || val === null || val === undefined || Number.isNaN(val)) return undefined;
  return Number(val);
}, z.number().optional());

const deviceSchema = z.object({
  deviceCode: z.string().min(1, 'Device code is required'),
  deviceName: z.string().min(1, 'Device name is required'),
  deviceType: z.string().min(1, 'Device type is required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  labelCode: z.string().optional(),
  kapasitas: z.string().optional(),
  satuanKapasitas: z.string().optional(),
  year: optionalNumber,
  usiaPerangkat: optionalNumber,
  ruanganName: z.string().optional(),
  rackName: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  condition: z.string().optional(),
  capReal: z.string().optional(),
  jenisTegangan: z.string().optional(),
  bebanArus: optionalNumber,
  satuanBeban: z.string().optional(),
  locationId: z.string().min(1, 'Location is required'),
  uuid: z.string().optional(),
  organizationName: z.string().optional(),
  organizationUuid: z.string().optional(),
  organizationSname: z.string().optional(),
})

type DeviceFormValues = z.infer<typeof deviceSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  device?: Device
  onSuccess?: () => void
}

export function DeviceModal({ isOpen, onClose, device, onSuccess }: Props) {
  const { locations } = useMapContext()
  const isEditing = !!device

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema) as any,
    defaultValues: device ? {
      deviceCode: device.deviceCode || '',
      deviceName: device.deviceName || '',
      deviceType: device.deviceType || '',
      brand: device.brand || '',
      model: device.model || '',
      serialNumber: device.serialNumber || '',
      labelCode: device.labelCode || '',
      kapasitas: device.kapasitas || '',
      satuanKapasitas: device.satuanKapasitas || '',
      year: device.year ?? undefined,
      usiaPerangkat: device.usiaPerangkat ?? undefined,
      ruanganName: device.ruanganName || '',
      rackName: device.rackName || '',
      status: device.status || 'OPERATIONAL',
      condition: device.condition || '',
      capReal: device.capReal || '',
      jenisTegangan: device.jenisTegangan || '',
      bebanArus: device.bebanArus ?? undefined,
      satuanBeban: device.satuanBeban || '',
      locationId: device.locationId || '',
      uuid: device.uuid || '',
      organizationName: device.organizationName || '',
      organizationUuid: device.organizationUuid || '',
      organizationSname: device.organizationSname || '',
    } : { status: 'OPERATIONAL' },
  })

  useEffect(() => {
    if (device) {
      reset({
        deviceCode: device.deviceCode || '',
        deviceName: device.deviceName || '',
        deviceType: device.deviceType || '',
        brand: device.brand || '',
        model: device.model || '',
        serialNumber: device.serialNumber || '',
        labelCode: device.labelCode || '',
        kapasitas: device.kapasitas || '',
        satuanKapasitas: device.satuanKapasitas || '',
        year: device.year ?? undefined,
        usiaPerangkat: device.usiaPerangkat ?? undefined,
        ruanganName: device.ruanganName || '',
        rackName: device.rackName || '',
        status: device.status || 'OPERATIONAL',
        condition: device.condition || '',
        capReal: device.capReal || '',
        jenisTegangan: device.jenisTegangan || '',
        bebanArus: device.bebanArus ?? undefined,
        satuanBeban: device.satuanBeban || '',
        locationId: device.locationId || '',
        uuid: device.uuid || '',
        organizationName: device.organizationName || '',
        organizationUuid: device.organizationUuid || '',
        organizationSname: device.organizationSname || '',
      })
    } else {
      reset({ status: 'OPERATIONAL' })
    }
  }, [device, reset])

  const onSubmit = async (data: DeviceFormValues) => {
    try {
      if (isEditing && device) {
        await deviceService.updateDevice(device.id, data as DeviceFormData)
        toast.success('Device updated successfully')
      } else {
        await deviceService.createDevice(data as DeviceFormData)
        toast.success('Device created successfully')
      }
      onSuccess?.()
      onClose()
      reset()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save device')
    }
  }

  const onError = () => {
    toast.error('Mohon lengkapi kolom yang wajib diisi (berwarna merah)')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Device' : 'Add New Device'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit as any, onError)} isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Device'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Device Code *"
            placeholder="DEV-001"
            error={errors.deviceCode?.message}
            {...register('deviceCode')}
          />
          <Input
            label="Device Name *"
            placeholder="Server Rack A1"
            error={errors.deviceName?.message}
            {...register('deviceName')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Device Type *"
            placeholder="Server, Router, Switch"
            error={errors.deviceType?.message}
            {...register('deviceType')}
          />
          <Select
            label="Status *"
            options={[
              { value: 'OPERATIONAL', label: 'Operational' },
              { value: 'MAINTENANCE', label: 'Maintenance' },
              { value: 'BROKEN', label: 'Broken' },
              { value: 'IDLE', label: 'Idle' },
              { value: 'INTEGRASI', label: 'Integrasi' },
              { value: 'RUSAK', label: 'Rusak' },
              { value: 'active', label: 'Active' },
              { value: 'warning', label: 'Warning' },
              { value: 'critical', label: 'Critical' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Kapasitas"
            placeholder="16GB"
            {...register('kapasitas')}
          />
          <Input
            label="Satuan Kapasitas"
            placeholder="RAM"
            {...register('satuanKapasitas')}
          />
          <Input
            label="Year"
            type="number"
            placeholder="2023"
            {...register('year', { valueAsNumber: true })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ruangan"
            placeholder="Server Room 1"
            {...register('ruanganName')}
          />
          <Input
            label="Rak"
            placeholder="Rack 1"
            {...register('rackName')}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Jenis Tegangan"
            placeholder="220V"
            {...register('jenisTegangan')}
          />
          <Input
            label="Beban Arus"
            type="number"
            placeholder="10"
            {...register('bebanArus', { valueAsNumber: true })}
          />
          <Input
            label="Satuan Beban"
            placeholder="A"
            {...register('satuanBeban')}
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Location *</label>
          <Controller
            name="locationId"
            control={control}
            render={({ field }) => (
              <SearchableSelect
                value={field.value}
                onChange={field.onChange}
                options={locations.map(l => ({ 
                  value: l.id, 
                  label: `${l.name} (${(l as any).cluster?.name || 'No Cluster'})` 
                }))}
                defaultLabel="Select location..."
                className={errors.locationId ? "border-red-500" : ""}
              />
            )}
          />
          {errors.locationId && (
            <p className="text-sm text-red-500">{errors.locationId.message}</p>
          )}
        </div>
        <div className="border-t border-[var(--border)] pt-4 mt-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Organization Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="UUID"
              placeholder="deab2cef-..."
              {...register('uuid')}
            />
            <Input
              label="Organization Short Name"
              placeholder="C_PKLP"
              {...register('organizationSname')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <Input
              label="Organization Name"
              placeholder="CLUSTER PANGKAL PINANG"
              {...register('organizationName')}
            />
            <Input
              label="Organization UUID"
              placeholder="549f33c7-..."
              {...register('organizationUuid')}
            />
          </div>
        </div>
      </form>
    </Modal>
  )
}
