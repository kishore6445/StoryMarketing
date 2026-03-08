"use client"

import React from "react"

import { useRef, useState } from "react"
import { Upload, X, FileText, ImageIcon, File } from "lucide-react"

interface FileUploadProps {
  onFileUploaded: (file: { url: string; filename: string; type: string }) => void
  clientId: string
  sectionId: string
  maxSize?: number // in MB
  acceptedTypes?: string[]
}

const DOCUMENT_TYPES: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  "application/pdf": { icon: <FileText className="w-4 h-4" />, label: "PDF", color: "text-red-600" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    icon: <FileText className="w-4 h-4" />,
    label: "Word",
    color: "text-blue-600",
  },
  "image/jpeg": { icon: <ImageIcon className="w-4 h-4" />, label: "JPEG", color: "text-green-600" },
  "image/png": { icon: <ImageIcon className="w-4 h-4" />, label: "PNG", color: "text-green-600" },
  "video/mp4": { icon: <FileText className="w-4 h-4" />, label: "MP4", color: "text-purple-600" },
}

export function FileUpload({
  onFileUploaded,
  clientId,
  sectionId,
  maxSize = 50,
  acceptedTypes = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".gif", ".mp4", ".mov"],
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setUploading(true)

    try {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File exceeds ${maxSize}MB limit`)
        setUploading(false)
        return
      }

      // Upload to API
      const formData = new FormData()
      formData.append("file", file)
      formData.append("clientId", clientId)
      formData.append("sectionId", sectionId)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Upload failed")
        setUploading(false)
        return
      }

      const uploadedFile = await response.json()
      onFileUploaded({
        url: uploadedFile.url,
        filename: uploadedFile.filename,
        type: uploadedFile.type,
      })

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      console.error("[v0] Upload error:", err)
      setError("Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[#D1D1D6] rounded-lg p-6 hover:border-[#0071E3] hover:bg-blue-50 transition-colors cursor-pointer text-center"
      >
        <Upload className="w-8 h-8 text-[#86868B] mx-auto mb-2" />
        <p className="text-sm font-medium text-[#1D1D1F]">
          {uploading ? "Uploading..." : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-[#86868B] mt-1">
          Supported formats: {acceptedTypes.join(", ")} (Max {maxSize}MB)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={acceptedTypes.join(",")}
        className="hidden"
        disabled={uploading}
      />

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  )
}
