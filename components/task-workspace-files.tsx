"use client"

import { useEffect, useState } from "react"
import { Upload, File, X, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileAttachment {
  id: string
  name: string
  url: string
  size: number
  uploadedAt: string
  uploadedBy: { name: string }
}

interface TaskWorkspaceFilesProps {
  taskId: string
}

export function TaskWorkspaceFiles({ taskId }: TaskWorkspaceFilesProps) {
  const [files, setFiles] = useState<FileAttachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const loadFiles = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("sessionToken")
        const response = await fetch(`/api/tasks/${taskId}/files`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Files loaded:", data)
          setFiles(data.map((f: any) => ({
            id: f.id,
            name: f.name,
            url: f.url,
            size: f.size,
            uploadedAt: f.uploaded_at,
            uploadedBy: { name: f.uploaded_by_user?.full_name || "Unknown" }
          })))
        }
      } catch (error) {
        console.error("[v0] Error loading files:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (taskId) {
      loadFiles()
    }
  }, [taskId])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    await uploadFiles(droppedFiles)
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.currentTarget.files ? Array.from(e.currentTarget.files) : []
    await uploadFiles(selectedFiles)
  }

  const uploadFiles = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return

    try {
      setIsUploading(true)
      const token = localStorage.getItem("sessionToken")

      for (const file of filesToUpload) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`/api/tasks/${taskId}/files`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        })

        if (response.ok) {
          const newFile = await response.json()
          console.log("[v0] File uploaded:", newFile)
          setFiles([...files, {
            id: newFile.id,
            name: newFile.name,
            url: newFile.url,
            size: newFile.size,
            uploadedAt: newFile.uploaded_at,
            uploadedBy: { name: newFile.uploaded_by_user?.full_name || "Unknown" }
          }])
        }
      }
    } catch (error) {
      console.error("[v0] Error uploading files:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${taskId}/files?fileId=${fileId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        console.log("[v0] File deleted:", fileId)
        setFiles(files.filter(f => f.id !== fileId))
      }
    } catch (error) {
      console.error("[v0] Error deleting file:", error)
    }
  }

  const handleDownload = async (file: FileAttachment) => {
    try {
      const token = localStorage.getItem("sessionToken")
      const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/files/download?fileId=${encodeURIComponent(file.id)}`, {
        headers: {
          "Authorization": token ? `Bearer ${token}` : ""
        }
      })

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Download failed with status ${response.status}: ${errorBody}`)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = objectUrl
      link.download = file.name || "download"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error("[v0] Download failed, opening file directly:", error)
      if (file.url) {
        window.open(file.url, "_blank", "noopener,noreferrer")
      }
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">Loading files...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          isDragging ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-gray-50"
        )}
      >
        <div className="flex flex-col items-center">
          <Upload className={cn(
            "w-10 h-10 mb-3",
            isDragging ? "text-blue-600" : "text-gray-400"
          )} />
          <p className="text-sm font-medium text-gray-900 mb-1">
            Drag files here or click to upload
          </p>
          <p className="text-xs text-gray-600 mb-4">
            PDF, JPG, DOCX up to 10MB
          </p>
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              disabled={isUploading}
              accept=".pdf,.jpg,.jpeg,.docx"
              className="hidden"
            />
            <span className={cn(
              "px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              isUploading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}>
              {isUploading ? "Uploading..." : "Choose File"}
            </span>
          </label>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Uploaded Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map(file => (
              <div
                key={file.id}
                onDoubleClick={() => {
                  if (!file.url) return
                  window.open(file.url, "_blank", "noopener,noreferrer")
                }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.uploadedBy.name} •{" "}
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && !isUploading && (
        <p className="text-center text-sm text-gray-500 py-8">
          No files attached yet
        </p>
      )}
    </div>
  )
}
