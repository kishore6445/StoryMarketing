"use client"

import { useState } from "react"
import { Upload, FileText, Download, Share2, Trash2, Clock, Lock, Globe, Eye, MoreHorizontal, X } from "lucide-react"

interface DocumentVersion {
  id: string
  versionNumber: number
  uploadedBy: string
  uploadedAt: Date
  size: string
  changes?: string
}

interface Document {
  id: string
  name: string
  phase: string
  type: "document" | "spreadsheet" | "presentation" | "image" | "video"
  uploadedBy: string
  uploadedAt: Date
  size: string
  visibility: "public" | "private" | "team"
  versions: DocumentVersion[]
  isPrimary?: boolean
}

interface DocumentGalleryProps {
  phaseId: string
  phaseName: string
}

export function DocumentGallery({ phaseId, phaseName }: DocumentGalleryProps) {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Research Findings Summary",
      phase: phaseName,
      type: "document",
      uploadedBy: "Sarah Chen",
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      size: "2.4 MB",
      visibility: "public",
      versions: [
        { id: "v1", versionNumber: 3, uploadedBy: "Sarah Chen", uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), size: "2.4 MB", changes: "Updated with latest analysis" },
        { id: "v2", versionNumber: 2, uploadedBy: "Ravi Patel", uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), size: "2.1 MB" },
      ],
      isPrimary: true,
    },
    {
      id: "2",
      name: "Competitor Analysis",
      phase: phaseName,
      type: "spreadsheet",
      uploadedBy: "Ravi Patel",
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      size: "1.8 MB",
      visibility: "team",
      versions: [
        { id: "v1", versionNumber: 1, uploadedBy: "Ravi Patel", uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), size: "1.8 MB" },
      ],
    },
    {
      id: "3",
      name: "Customer Interview Notes",
      phase: phaseName,
      type: "document",
      uploadedBy: "Alex Rodriguez",
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      size: "1.2 MB",
      visibility: "private",
      versions: [
        { id: "v1", versionNumber: 1, uploadedBy: "Alex Rodriguez", uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), size: "1.2 MB" },
      ],
    },
  ])

  const [showUpload, setShowUpload] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState<string | null>(null)
  const [showSharing, setShowSharing] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return "📄"
      case "spreadsheet":
        return "📊"
      case "presentation":
        return "📽️"
      case "image":
        return "🖼️"
      case "video":
        return "🎥"
      default:
        return "📁"
    }
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public":
        return "bg-[#D1E3FF] text-[#007AFF]"
      case "team":
        return "bg-[#E8F5E9] text-[#2E7D32]"
      case "private":
        return "bg-[#FEE4E2] text-[#FF3B30]"
      default:
        return "bg-[#F3F3F6] text-[#86868B]"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-[#1D1D1F]">Documents</h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-[#1B5E20] transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Upload Area */}
      {showUpload && (
        <div className="mb-6 p-6 border-2 border-dashed border-[#2E7D32] rounded-lg bg-[#F8FFFF] text-center">
          <Upload className="w-8 h-8 text-[#2E7D32] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#1D1D1F] mb-1">Drop files here or click to upload</p>
          <p className="text-xs text-[#86868B] mb-4">Supports documents, spreadsheets, presentations, images, and videos</p>
          <input
            type="file"
            multiple
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-4 py-2 bg-white border border-[#2E7D32] text-[#2E7D32] rounded-lg text-sm font-medium hover:bg-[#F8F9FB] cursor-pointer transition-colors"
          >
            Select Files
          </label>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-start justify-between p-4 border border-[#E5E5E7] rounded-lg hover:bg-[#F8F9FB] transition-colors">
            {/* Left: File Info */}
            <div className="flex items-start gap-3 flex-1">
              <div className="text-2xl flex-shrink-0">{getFileIcon(doc.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium text-[#1D1D1F] truncate">{doc.name}</h3>
                  {doc.isPrimary && (
                    <span className="px-2 py-0.5 bg-[#FFB547]/20 text-[#9E5610] text-xs font-medium rounded">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#86868B]">
                  <span>{doc.uploadedBy}</span>
                  <span>•</span>
                  <span>{formatDate(doc.uploadedAt)}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded font-medium ${getVisibilityColor(doc.visibility)}`}>
                    {doc.visibility.charAt(0).toUpperCase() + doc.visibility.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowVersionHistory(showVersionHistory === doc.id ? null : doc.id)}
                title="Version history"
                className="p-2 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5E7] rounded transition-colors"
              >
                <Clock className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowSharing(showSharing === doc.id ? null : doc.id)}
                title="Share"
                className="p-2 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5E7] rounded transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                title="Download"
                className="p-2 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5E7] rounded transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                title="Delete"
                className="p-2 text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FEE4E2] rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                title="More"
                className="p-2 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E5E5E7] rounded transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Version History */}
      {showVersionHistory && (
        <VersionHistoryPanel
          document={documents.find((d) => d.id === showVersionHistory)!}
          onClose={() => setShowVersionHistory(null)}
        />
      )}

      {/* Sharing Settings */}
      {showSharing && (
        <SharingPanel
          document={documents.find((d) => d.id === showSharing)!}
          onClose={() => setShowSharing(null)}
        />
      )}
    </div>
  )
}

interface VersionHistoryPanelProps {
  document: Document
  onClose: () => void
}

function VersionHistoryPanel({ document, onClose }: VersionHistoryPanelProps) {
  return (
    <div className="mt-4 p-4 bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#1D1D1F]">Version History</h3>
        <button onClick={onClose} className="text-[#86868B] hover:text-[#1D1D1F]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        {document.versions.map((version) => (
          <div key={version.id} className="flex items-start justify-between p-3 bg-white border border-[#E5E5E7] rounded">
            <div>
              <p className="text-sm font-medium text-[#1D1D1F]">Version {version.versionNumber}</p>
              <p className="text-xs text-[#86868B] mt-1">
                {version.uploadedBy} • {version.uploadedAt.toLocaleDateString()} • {version.size}
              </p>
              {version.changes && (
                <p className="text-xs text-[#1D1D1F] mt-1 italic">{version.changes}</p>
              )}
            </div>
            <button className="text-[#007AFF] hover:text-[#0051C3] text-xs font-medium">
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

interface SharingPanelProps {
  document: Document
  onClose: () => void
}

function SharingPanel({ document, onClose }: SharingPanelProps) {
  const [visibility, setVisibility] = useState(document.visibility)

  return (
    <div className="mt-4 p-4 bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#1D1D1F]">Sharing Settings</h3>
        <button onClick={onClose} className="text-[#86868B] hover:text-[#1D1D1F]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 p-3 border border-[#E5E5E7] rounded-lg cursor-pointer hover:bg-white transition-colors">
          <input
            type="radio"
            name="visibility"
            value="public"
            checked={visibility === "public"}
            onChange={(e) => setVisibility(e.target.value as any)}
            className="w-4 h-4"
          />
          <div>
            <p className="text-sm font-medium text-[#1D1D1F] flex items-center gap-1">
              <Globe className="w-4 h-4 text-[#007AFF]" />
              Public
            </p>
            <p className="text-xs text-[#86868B]">Visible to everyone</p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 border border-[#E5E5E7] rounded-lg cursor-pointer hover:bg-white transition-colors">
          <input
            type="radio"
            name="visibility"
            value="team"
            checked={visibility === "team"}
            onChange={(e) => setVisibility(e.target.value as any)}
            className="w-4 h-4"
          />
          <div>
            <p className="text-sm font-medium text-[#1D1D1F] flex items-center gap-1">
              <Eye className="w-4 h-4 text-[#2E7D32]" />
              Team Only
            </p>
            <p className="text-xs text-[#86868B]">Visible to team members only</p>
          </div>
        </label>

        <label className="flex items-center gap-3 p-3 border border-[#E5E5E7] rounded-lg cursor-pointer hover:bg-white transition-colors">
          <input
            type="radio"
            name="visibility"
            value="private"
            checked={visibility === "private"}
            onChange={(e) => setVisibility(e.target.value as any)}
            className="w-4 h-4"
          />
          <div>
            <p className="text-sm font-medium text-[#1D1D1F] flex items-center gap-1">
              <Lock className="w-4 h-4 text-[#FF3B30]" />
              Private
            </p>
            <p className="text-xs text-[#86868B]">Only you can view</p>
          </div>
        </label>
      </div>

      <button className="w-full mt-4 px-4 py-2 bg-[#2E7D32] text-white rounded-lg text-sm font-medium hover:bg-[#1B5E20] transition-colors">
        Save Changes
      </button>
    </div>
  )
}
