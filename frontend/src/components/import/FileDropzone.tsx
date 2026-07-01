import { useState, useCallback } from 'react'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClear: () => void
  disabled?: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls']

export function FileDropzone({ onFileSelect, selectedFile, onClear, disabled }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback((file: File): boolean => {
    setError(null)

    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError(`Format file tidak valid. Gunakan ${ALLOWED_EXTENSIONS.join(', ')}`)
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Ukuran file maksimal 10MB')
      return false
    }

    return true
  }, [])

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileSelect(file)
    }
  }, [validateFile, onFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [disabled, handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (selectedFile) {
    return (
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <File className="w-8 h-8 text-cyan-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {selectedFile.name}
          </p>
          <p className="text-xs text-slate-400">
            {formatFileSize(selectedFile.size)}
          </p>
        </div>
        <button
          onClick={onClear}
          disabled={disabled}
          className={cn(
            "p-2 rounded-lg hover:bg-slate-700 transition-colors",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-cyan-400 bg-cyan-500/10"
            : "border-slate-700 hover:border-slate-600",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <Upload className={cn(
          "w-10 h-10 mx-auto mb-3",
          isDragging ? "text-cyan-400" : "text-slate-500"
        )} />
        <p className="text-sm text-slate-300 mb-1">
          Drag & drop file atau klik untuk pilih
        </p>
        <p className="text-xs text-slate-500">
          Format: CSV, XLSX, XLS (maksimal 10MB)
        </p>
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  )
}
