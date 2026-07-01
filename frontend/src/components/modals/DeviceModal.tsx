import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { deviceService } from '../../services/deviceService'
import { useMapContext } from '../../contexts/MapContext'
import type { Device, DeviceFormData } from '../../types'
import toast from 'react-hot-toast'

const deviceSchema = z.object({
  deviceCode: z.string().min(1, 'Device code is required'),
  deviceName: z.string().min(1, 'Device name is required'),
  deviceType: z.string().min(1, 'Device type is required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  kapasitas: z.string().optional(),
  year: z.number().optional(),
  room: z.string().optional(),
  status: z.enum(['active', 'warning', 'critical', 'inactive']),
  condition: z.string().optional(),
  capReal: z.string().optional(),
  locationId: z.string().min(1, 'Location is required'),
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

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DeviceFormValues>({
    resolver: zodResolver(deviceSchema),
    defaultValues: device ? {
      deviceCode: device.deviceCode,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      brand: device.brand,
      model: device.model,
      serialNumber: device.serialNumber,
      kapasitas: device.kapasitas,
      year: device.year,
      room: device.room,
      status: device.status,
      condition: device.condition,
      capReal: device.capReal,
      locationId: device.locationId,
    } : { status: 'active' },
  })

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Device' : 'Add New Device'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>
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
              { value: 'active', label: 'Active' },
              { value: 'warning', label: 'Warning' },
              { value: 'critical', label: 'Critical' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Brand"
            placeholder="Cisco, Dell, HP"
            {...register('brand')}
          />
          <Input
            label="Model"
            placeholder="PowerEdge R740"
            {...register('model')}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Serial Number"
            placeholder="SN12345678"
            {...register('serialNumber')}
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
            label="Kapasitas"
            placeholder="16GB RAM"
            {...register('kapasitas')}
          />
          <Input
            label="Room"
            placeholder="Server Room 1"
            {...register('room')}
          />
        </div>
        <Select
          label="Location *"
          options={[
            { value: '', label: 'Select location...' },
            ...locations.map(l => ({ value: l.id, label: `${l.name} (${l.cluster?.name || 'No Cluster'})` })),
          ]}
          error={errors.locationId?.message}
          {...register('locationId')}
        />
      </form>
    </Modal>
  )
}
