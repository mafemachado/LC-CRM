"use client"

import { useRef, useState, useCallback } from "react"
import { Upload, Camera, X, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"

const MAX_SIZE_MB  = 10
const MAX_SIZE     = MAX_SIZE_MB * 1024 * 1024
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ACCEPT_EXT   = ".jpg,.jpeg,.png,.webp"

interface UploadFichaProps {
  onImageReady: (base64: string, mimeType: string, preview: string) => void
  disabled?:    boolean
}

export function UploadFicha({ onImageReady, disabled }: UploadFichaProps) {
  const [preview,   setPreview]   = useState<string | null>(null)
  const [error,     setError]     = useState<string | null>(null)
  const [dragging,  setDragging]  = useState(false)
  const fileRef   = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  function validate(file: File): string | null {
    if (file.size > MAX_SIZE) return `O arquivo deve ter no máximo ${MAX_SIZE_MB}MB.`
    if (!ACCEPT_TYPES.includes(file.type)) return "Use imagens JPG, PNG ou WEBP."
    return null
  }

  const processFile = useCallback((file: File) => {
    const err = validate(file)
    if (err) { setError(err); return }

    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      // dataUrl = "data:image/jpeg;base64,<data>"
      const [meta, b64] = dataUrl.split(",")
      const mimeMatch   = meta.match(/data:([^;]+)/)
      const mimeType    = mimeMatch?.[1] ?? "image/jpeg"
      setPreview(dataUrl)
      onImageReady(b64, mimeType, dataUrl)
    }
    reader.readAsDataURL(file)
  }, [onImageReady])

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    processFile(files[0])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }

  function clearImage() {
    setPreview(null)
    setError(null)
    if (fileRef.current)   fileRef.current.value   = ""
    if (cameraRef.current) cameraRef.current.value = ""
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "relative border-2 border-dashed rounded-2xl transition-all",
          dragging
            ? "border-brand-orange bg-orange-50"
            : preview
              ? "border-brand-blue bg-blue-50/30"
              : "border-border hover:border-brand-orange/60 bg-muted/30",
          disabled ? "opacity-60 pointer-events-none" : "cursor-pointer",
        ].join(" ")}
        onClick={() => !preview && !disabled && fileRef.current?.click()}
      >
        {preview ? (
          /* Image preview */
          <div className="relative">
            <img
              src={preview}
              alt="Preview da ficha"
              className="w-full max-h-96 object-contain rounded-2xl"
            />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearImage() }}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1.5 shadow-md transition-colors"
              title="Remover imagem"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
              <FileImage className="w-7 h-7 text-brand-orange" />
            </div>
            <div>
              <p className="font-sub font-semibold text-foreground">
                Arraste a ficha aqui
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                ou clique para selecionar um arquivo
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou WEBP — máximo {MAX_SIZE_MB}MB
            </p>
          </div>
        )}
      </div>

      {/* Buttons row */}
      {!preview && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white transition-colors"
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
          >
            <Upload className="w-4 h-4 mr-2" />
            Selecionar arquivo
          </Button>

          <Button
            type="button"
            variant="outline"
            className="flex-1 h-11 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
            onClick={() => cameraRef.current?.click()}
            disabled={disabled}
          >
            <Camera className="w-4 h-4 mr-2" />
            Abrir câmera
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1.5">
          <X className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}

      {/* Hidden inputs */}
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT_EXT}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {/* Camera input: capture="environment" opens rear camera on mobile */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
