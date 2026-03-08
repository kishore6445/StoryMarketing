"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FileText, ImageIcon, Video, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PostComposerProps {
  onSchedule: (post: ScheduledPost) => void
  onClose: () => void
}

interface ScheduledPost {
  content: string
  channels: string[]
  scheduledDate: string
  scheduledTime: string
  media?: File[]
  status: "draft" | "scheduled" | "published"
  clientId: string
}

export function PostComposer({ onSchedule, onClose }: PostComposerProps) {
  const [content, setContent] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [selectedClientId, setSelectedClientId] = useState("")
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [loadingClients, setLoadingClients] = useState(true)

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('sessionToken')
        const response = await fetch('/api/clients', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          setClients(data.clients || [])
          
          // Auto-select first client if available
          if (data.clients && data.clients.length > 0) {
            setSelectedClientId(data.clients[0].id)
          }
        }
      } catch (error) {
        console.error('[v0] Failed to fetch clients:', error)
      } finally {
        setLoadingClients(false)
      }
    }
    
    fetchClients()
  }, [])

  const channels = [
    { id: "linkedin", name: "LinkedIn", icon: "💼" },
    { id: "facebook", name: "Facebook", icon: "📘" },
    { id: "instagram", name: "Instagram", icon: "📸" },
    { id: "twitter", name: "Twitter/X", icon: "🐦" },
    { id: "tiktok", name: "TikTok", icon: "🎵" },
    { id: "youtube", name: "YouTube", icon: "▶️" },
  ]

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId],
    )
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files))
    }
  }

  const handleSchedule = async () => {
    if (!selectedClientId) {
      alert("Please select a client")
      return
    }
    
    const post: ScheduledPost = {
      content,
      channels: selectedChannels,
      scheduledDate,
      scheduledTime,
      media: mediaFiles,
      status: "scheduled",
      clientId: selectedClientId,
    }
    
    // Call parent handler for optimistic update
    onSchedule(post)
    
    // Close modal
    onClose()
  }

  const charCount = content.length
  const maxChars = 280 // Twitter limit as reference

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E5E5E7] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E5E5E7] px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1D1D1F]">Create Post</h2>
          <button onClick={onClose} className="text-[#86868B] hover:text-[#1D1D1F] transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#515154]">Client</label>
            {loadingClients ? (
              <div className="w-full p-3 border border-[#E5E5E7] rounded-lg text-[#86868B]">
                Loading clients...
              </div>
            ) : (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-3 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#007AFF] bg-white"
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#515154]">Post Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's your story?"
              className="w-full min-h-[180px] p-4 border border-[#E5E5E7] rounded-xl text-[#1D1D1F] placeholder:text-[#C7C7CC] focus:outline-none focus:ring-2 focus:ring-[#007AFF] resize-none"
            />
            <div className="flex items-center justify-between text-xs text-[#86868B]">
              <span>{charCount} characters</span>
              {charCount > maxChars && <span className="text-[#E53935]">Exceeds Twitter limit ({maxChars})</span>}
            </div>
          </div>

          {/* Media Upload */}
          {/* <div className="space-y-2">
            <label className="text-sm font-medium text-[#515154]">Media</label>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <input type="file" multiple accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
                <div className="flex items-center justify-center gap-2 py-3 px-4 border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] transition-colors">
                  <ImageIcon className="w-4 h-4 text-[#86868B]" />
                  <span className="text-sm text-[#515154]">Add Image</span>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input type="file" multiple accept="video/*" onChange={handleMediaUpload} className="hidden" />
                <div className="flex items-center justify-center gap-2 py-3 px-4 border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] transition-colors">
                  <Video className="w-4 h-4 text-[#86868B]" />
                  <span className="text-sm text-[#515154]">Add Video</span>
                </div>
              </label>
            </div>
            {mediaFiles.length > 0 && (
              <div className="text-xs text-[#515154] mt-2">{mediaFiles.length} file(s) selected</div>
            )}
          </div> */}

          {/* Channel Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#515154]">Publish to Channels</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelToggle(channel.id)}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-all ${
                    selectedChannels.includes(channel.id)
                      ? "border-[#007AFF] bg-[#007AFF]/5"
                      : "border-[#E5E5E7] hover:bg-[#F5F5F7]"
                  }`}
                >
                  <span className="text-xl">{channel.icon}</span>
                  <span
                    className={`text-sm font-medium ${
                      selectedChannels.includes(channel.id) ? "text-[#007AFF]" : "text-[#515154]"
                    }`}
                  >
                    {channel.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#515154]">Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-3 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#515154]">Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full p-3 border border-[#E5E5E7] rounded-lg text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E7]">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-[#E5E5E7] text-[#515154] hover:bg-[#F5F5F7] bg-transparent"
            >
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (!selectedClientId) {
                    alert("Please select a client")
                    return
                  }
                  const draft: ScheduledPost = {
                    content,
                    channels: selectedChannels,
                    scheduledDate,
                    scheduledTime,
                    media: mediaFiles,
                    status: "draft",
                    clientId: selectedClientId,
                  }
                  onSchedule(draft)
                }}
                variant="outline"
                className="border-[#E5E5E7] text-[#515154] hover:bg-[#F5F5F7] bg-transparent"
              >
                <FileText className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={!content || selectedChannels.length === 0 || !scheduledDate || !scheduledTime}
                className="bg-[#007AFF] text-white hover:bg-[#0051D5] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
