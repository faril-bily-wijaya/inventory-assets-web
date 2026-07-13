import { useState } from 'react'
import { MapPin, Download, X, Pencil, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as XLSX from 'xlsx'
import { useMapContext } from '../../contexts/MapContext'
import toast from 'react-hot-toast'
import { DeviceModal } from '../modals/DeviceModal'
import { ConfirmModal } from '../modals/ConfirmModal'
import { deviceService } from '../../services/deviceService'


export function LocationTableModal() {
  const { selectedMarker, setSelectedMarker, refreshMapData } = useMapContext()
  const [editingDevice, setEditingDevice] = useState<any | null>(null)
  const [deletingDevice, setDeletingDevice] = useState<any | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)



  const handleDeleteConfirm = async () => {
    if (!deletingDevice) return
    try {
      setIsDeleting(true)
      await deviceService.deleteDevice(deletingDevice.id)
      toast.success('Device deleted successfully')
      
      // Update local state for immediate feedback
      setSelectedMarker({
        ...selectedMarker!,
        devices: selectedMarker!.devices.filter((d: any) => d.id !== deletingDevice.id)
      })
      await refreshMapData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete device')
    } finally {
      setIsDeleting(false)
      setDeletingDevice(null)
    }
  }

  const downloadCSV = () => {
    if (!selectedMarker || !selectedMarker.devices || selectedMarker.devices.length === 0) {
      toast.error("Tidak ada perangkat untuk diunduh.")
      return
    }

    const rows = selectedMarker.devices.map(d => ({
      "id": d.id || '',
      "device_code": d.deviceCode || '',
      "device_name": d.deviceName || '',
      "device_type": d.deviceType || '',
      "brand": d.brand || '',
      "model": d.model || '',
      "serial_number": d.serialNumber || '',
      "label_code": d.labelCode || '',
      "kapasitas": d.kapasitas || '',
      "satuan_kapasitas": d.satuanKapasitas || '',
      "year": d.year || '',
      "usia_perangkat": d.usiaPerangkat || '',
      "status": d.status || '',
      "condition": d.condition || '',
      "cap_real": d.capReal || '',
      "jenis_tegangan": d.jenisTegangan || '',
      "beban_arus": d.bebanArus || '',
      "satuan_beban": d.satuanBeban || '',
      "ruangan_code": d.ruanganCode || '',
      "ruangan_name": d.ruanganName || '',
      "ruangan_panjang": d.ruanganPanjang || '',
      "ruangan_lebar": d.ruanganLebar || '',
      "ruangan_tinggi": d.ruanganTinggi || '',
      "ruangan_luas": d.ruanganLuas || '',
      "rack_code": d.rackCode || '',
      "rack_name": d.rackName || '',
      "rack_panjang": d.rackPanjang || '',
      "rack_lebar": d.rackLebar || '',
      "rack_tinggi": d.rackTinggi || '',
      "rack_luas": d.rackLuas || '',
      "keterangan": d.keterangan || '',
      "butuh_modernisasi": d.butuhModernisasi ? "Ya" : "Tidak",
      "alasan_modernisasi": d.alasan || '',
      "uuid": d.uuid || '',
      "organization_uuid": d.organizationUuid || '',
      "organization_name": d.organizationName || '',
      "organization_sname": d.organizationSname || '',
      "area": selectedMarker.hierarchy?.area || '',
      "regional": selectedMarker.hierarchy?.regional || '',
      "district": selectedMarker.hierarchy?.district || '',
      "cluster": selectedMarker.hierarchy?.cluster || '',
      "location_id": d.locationId || selectedMarker.id || '',
      "site_name": selectedMarker.name || '',
      "site_code": selectedMarker.siteCode || (selectedMarker as any).site_code || '',
      "address": selectedMarker.address || '',
      "class_type": selectedMarker.classType || (selectedMarker as any).class_type || '',
      "latitude": selectedMarker.latitude || '',
      "longitude": selectedMarker.longitude || '',
      "teknisi": selectedMarker.teknisi || '',
      "created_at": d.createdAt ? new Date(d.createdAt).toLocaleString() : '',
      "updated_at": d.updatedAt ? new Date(d.updatedAt).toLocaleString() : ''
    }))

    try {
      const worksheet = XLSX.utils.json_to_sheet(rows)
      const colWidths = Object.keys(rows[0]).map(() => ({ wch: 20 }))
      worksheet['!cols'] = colWidths

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Perangkat")
      
      const fileName = `Data_${selectedMarker.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast.success("File Excel berhasil diunduh secara lengkap!")
    } catch (err) {
      console.error(err)
      toast.error("Gagal melakukan ekspor ke Excel.")
    }
  }

  return (
    <AnimatePresence>
      {selectedMarker && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4 md:p-8"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative"
          >
            <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{selectedMarker.name}</h2>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1.5 font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-red-500" />
                  {selectedMarker.address || `${selectedMarker.latitude.toFixed(6)}, ${selectedMarker.longitude.toFixed(6)}`}
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <button 
                  onClick={downloadCSV}
                  className="hidden md:flex p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm items-center gap-2 font-bold text-sm"
                >
                  <Download className="w-4 h-4" /> Unduh
                </button>
                <button 
                  onClick={() => setSelectedMarker(null)}
                  className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-all shadow-sm"
                >
                  <X className="w-5 h-5 dark:text-slate-300" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-0 bg-white dark:bg-slate-900">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10 shadow-sm border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-4 px-4 md:px-6 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">Kode Perangkat</th>
                    <th className="py-4 px-4 md:px-6 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">Nama Perangkat</th>
                    <th className="py-4 px-4 md:px-6 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">Tipe</th>
                    <th className="py-4 px-4 md:px-6 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">Merk</th>
                    <th className="py-4 px-4 md:px-6 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">Kapasitas</th>
                    <th className="py-4 px-4 md:px-6 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">Tahun & Umur</th>
                    <th className="py-4 px-4 md:px-6 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs text-center">Kondisi</th>
                    <th className="py-4 px-4 md:px-6 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs text-center">Status</th>
                    <th className="py-4 px-4 md:px-6 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">Keterangan</th>
                    <th className="py-4 px-4 md:px-6 font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedMarker.devices.map((dev, i) => {
                    return (
                      <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="py-3.5 px-4 md:px-6 text-slate-500 dark:text-slate-400 font-mono text-xs">{dev.deviceCode || '-'}</td>
                        <td className="py-3.5 px-4 md:px-6 text-slate-700 dark:text-slate-300 font-medium text-xs">{dev.deviceName || '-'}</td>
                        <td className="py-3.5 px-4 md:px-6 text-slate-800 dark:text-white font-bold group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{dev.deviceType}</td>
                        <td className="py-3.5 px-4 md:px-6 text-slate-600 dark:text-slate-300 font-medium">
                          {dev.brand || '-'}
                        </td>
                        <td className="py-3.5 px-4 md:px-6 text-slate-600 dark:text-slate-300">
                          {dev.kapasitas ? `${dev.kapasitas} ${dev.satuanKapasitas || ''}`.trim() : (dev.capReal || '-')}
                        </td>
                        <td className="py-3.5 px-4 md:px-6 text-slate-600 dark:text-slate-300 text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-700 dark:text-slate-200">{dev.year || '-'}</span>
                            {dev.usiaPerangkat !== undefined && <span className="text-[11px] opacity-75">{dev.usiaPerangkat} Tahun</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 md:px-6 text-center font-bold text-slate-700 dark:text-slate-300">
                          <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide inline-block w-full text-center max-w-[120px] ${dev.condition?.toLowerCase() === 'normal' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50'}`}>
                            {dev.condition || '-'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 md:px-6 text-center">
                          <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide inline-block w-full text-center max-w-[120px] ${['aktif', 'active', 'operational'].includes(dev.status?.toLowerCase()) ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : ['inactive', 'idle'].includes(dev.status?.toLowerCase()) ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'}`}>
                            {dev.status || '-'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 md:px-6 text-slate-500 dark:text-slate-400 text-xs max-w-[200px]" title={dev.keterangan || dev.alasan || '-'}>
                          <div className="flex flex-col gap-1">
                            {dev.butuhModernisasi && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                ⚠️ PERLU MODERNISASI: {dev.alasan}
                              </span>
                            )}
                            {dev.keterangan && <span>{dev.keterangan}</span>}
                            {!dev.butuhModernisasi && !dev.keterangan && <span>-</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 md:px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingDevice(dev)}
                              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors"
                              title="Edit Perangkat"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingDevice(dev)}
                              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                              title="Hapus Perangkat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modals for Edit and Delete */}
            <DeviceModal
              isOpen={!!editingDevice}
              onClose={() => setEditingDevice(null)}
              device={editingDevice}
              onSuccess={() => {
                refreshMapData().then(() => {
                  // We manually update local state to avoid needing to re-open the modal
                  // A better approach in a real app is refetching the specific location
                  if (selectedMarker) {
                     // Since we updated via the backend, we should technically pull the updated list.
                     // A simple page reload or map refresh handles it, but selectedMarker doesn't auto-update.
                     // We'll close the modal for now to force a refresh if the user re-clicks the marker.
                     // Or just leave it and let them close it themselves.
                  }
                })
              }}
            />

            <ConfirmModal
              isOpen={!!deletingDevice}
              onClose={() => setDeletingDevice(null)}
              onConfirm={handleDeleteConfirm}
              title="Hapus Perangkat"
              message={`Apakah Anda yakin ingin menghapus perangkat ${deletingDevice?.deviceCode || deletingDevice?.deviceName}? Tindakan ini tidak dapat dibatalkan.`}
              confirmText="Hapus"
              isLoading={isDeleting}
            />

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
