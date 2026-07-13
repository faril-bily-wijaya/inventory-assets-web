import { useState, useCallback } from 'react'
import { Download, AlertCircle, CheckCircle } from 'lucide-react'
import { FileDropzone } from './FileDropzone'
import { ModeSelector } from './ModeSelector'
import { ImportPreview } from './ImportPreview'
import { ConfirmModal } from './ConfirmModal'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { importService, type UploadOptions } from '../../services/importService'
import type { ImportMode, ImportPreview as ImportPreviewType } from '../../types'
import toast from 'react-hot-toast'

type ImportStep = 'select' | 'preview' | 'confirm'

interface ImportTabProps {
  importType?: 'default' | 'genset'
}

export function ImportTab({ importType = 'default' }: ImportTabProps) {
  const [step, setStep] = useState<ImportStep>('select')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [mode, setMode] = useState<ImportMode>('upsert')
  const [preview, setPreview] = useState<ImportPreviewType | null>(null)
  const [internalImportType, setInternalImportType] = useState<'default' | 'genset'>(importType)
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setStep('select')
    setPreview(null)
    setImportSuccess(false)
  }, [])

  const handleClear = useCallback(() => {
    setSelectedFile(null)
    setStep('select')
    setPreview(null)
    setImportSuccess(false)
  }, [])

  const handleGetPreview = useCallback(async () => {
    if (!selectedFile) return

    setIsLoading(true)
    try {
      const options: UploadOptions = {
        file: selectedFile,
        mode,
        importType: internalImportType,
      }
      const result = await importService.getPreview(options)
      setPreview(result)
      setStep('preview')
    } catch (error: any) {
      let message = 'Gagal memproses file'
      if (error.response?.data?.error) message = error.response.data.error
      else if (error.response?.data?.errors?.[0]) message = error.response.data.errors[0]
      else if (error.message) message = `Error: ${error.message}`
      
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [selectedFile, mode])

  const handleConfirm = useCallback(() => {
    if (mode === 'replace') {
      setShowConfirmModal(true)
    } else {
      executeImport()
    }
  }, [mode])

  const executeImport = useCallback(async () => {
    if (!selectedFile) return

    setIsImporting(true)
    setShowConfirmModal(false)

    try {
      const options: UploadOptions = {
        file: selectedFile,
        mode,
        importType: internalImportType,
      }
      await importService.executeImport(options)
      setImportSuccess(true)
      setStep('select')
      setSelectedFile(null)
      setPreview(null)
      toast.success(`Berhasil import ${preview?.totalRows || 0} data`)
    } catch (error: any) {
      let message = 'Gagal mengimpor data'
      if (error.response?.data?.error) message = error.response.data.error
      else if (error.message) message = `Error: ${error.message}`
      
      toast.error(message)
    } finally {
      setIsImporting(false)
    }
  }, [selectedFile, mode, preview])

  const handleDownloadTemplate = useCallback(async () => {
    try {
      await importService.downloadTemplate()
      toast.success('Template downloaded')
    } catch {
      toast.error('Gagal download template')
    }
  }, [])

  const handleBack = useCallback(() => {
    setStep('select')
    setPreview(null)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-200">Import Devices</h2>
          <p className="text-sm text-slate-400">Import data device dari file CSV atau Excel</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleDownloadTemplate}
        >
          Download Template
        </Button>
      </div>

      {/* Success Message */}
      {importSuccess && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/15 rounded-lg border border-emerald-500/30">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          <div>
            <p className="font-medium text-emerald-400">Import Berhasil</p>
            <p className="text-sm text-slate-300">Data telah berhasil diimpor</p>
          </div>
        </div>
      )}

      {/* Import Card */}
      <Card>
        <div className="space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">1. Pilih Format File</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="importType" 
                  value="default" 
                  checked={internalImportType === 'default'}
                  onChange={() => {
                    setInternalImportType('default')
                    handleClear()
                  }}
                  className="w-4 h-4 text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-500"
                />
                <span className="text-sm text-slate-300">Format Standar (Default)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="importType" 
                  value="genset" 
                  checked={internalImportType === 'genset'}
                  onChange={() => {
                    setInternalImportType('genset')
                    handleClear()
                  }}
                  className="w-4 h-4 text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-500"
                />
                <span className="text-sm text-slate-300">Format Genset Mobile</span>
              </label>
            </div>
          </div>

          {/* File Selection */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">2. Pilih File</h3>
            <FileDropzone
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClear={handleClear}
              disabled={isLoading || isImporting}
            />
          </div>

          {/* Mode Selection */}
          {selectedFile && (
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">3. Pilih Mode</h3>
              <ModeSelector
                value={mode}
                onChange={setMode}
                disabled={isLoading || isImporting}
              />
            </div>
          )}

          {/* Preview Button */}
          {selectedFile && step === 'select' && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleGetPreview}
                isLoading={isLoading}
              >
                Lihat Preview
              </Button>
            </div>
          )}

          {/* Preview */}
          {preview && step === 'preview' && (
            <>
              <div className="border-t border-slate-700 pt-6">
                <h3 className="text-sm font-medium text-slate-300 mb-3">4. Preview Data</h3>
                <ImportPreview
                  preview={preview}
                  onConfirm={handleConfirm}
                  onCancel={handleBack}
                  isLoading={isImporting}
                  mode={mode}
                />
              </div>
            </>
          )}

          {/* Error */}
          {selectedFile && !preview && step === 'select' && isLoading === false && (
            <div className="flex items-center gap-2 p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <p className="text-sm text-amber-300">
                Klik "Lihat Preview" untuk melihat detail import
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeImport}
        isLoading={isImporting}
      />
    </div>
  )
}
