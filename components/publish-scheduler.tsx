"use client"

import { useState } from "react"
import { Send, Calendar, Clock, AlertCircle } from "lucide-react"

interface PublishScheduleProps {
  platforms: Array<{ id: string; name: string; connected: boolean }>
  onPublish: (data: { platforms: string[]; scheduleTime: string; content: string }) => void
  onSchedule: (data: { platforms: string[]; scheduleTime: string; content: string }) => void
}

export function PublishScheduler({ platforms, onPublish, onSchedule }: PublishScheduleProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(platforms.filter((p) => p.connected).map((p) => p.id))
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now")
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("09:00")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]
    )
  }

  const handlePublish = async () => {
    if (!content.trim()) {
      alert("Please enter content to publish")
      return
    }

    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform")
      return
    }

    setLoading(true)

    try {
      const publishData = {
        platforms: selectedPlatforms,
        scheduleTime: `${scheduleDate} ${scheduleTime}`,
        content,
      }

      if (scheduleType === "now") {
        await onPublish(publishData)
        // TODO: Call /api/posts/publish when database is added
      } else {
        await onSchedule(publishData)
        // TODO: Call /api/posts/schedule when database is added
      }

      // Reset form
      setContent("")
      setSelectedPlatforms(platforms.filter((p) => p.connected).map((p) => p.id))
    } catch (error) {
      console.error("[v0] Publish error:", error)
    } finally {
      setLoading(false)
    }
  }

  const connectedPlatforms = platforms.filter((p) => p.connected)

  return (
    <div className="bg-white border border-[#E5E5E7] rounded-lg p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#1D1D1F] mb-2">Publish or Schedule Post</h2>
        <p className="text-sm text-[#86868B]">Choose platforms, set timing, and publish your content</p>
      </div>

      {/* Platform Selection */}
      <div>
        <h3 className="text-sm font-medium text-[#1D1D1F] mb-3">Select Platforms</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {connectedPlatforms.map((platform) => (
            <label
              key={platform.id}
              className="flex items-center gap-2 p-3 border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(platform.id)}
                onChange={() => togglePlatform(platform.id)}
                className="w-4 h-4 rounded border-[#D1D1D6] text-[#007AFF]"
              />
              <span className="text-sm text-[#1D1D1F]">{platform.name}</span>
            </label>
          ))}
        </div>

        {connectedPlatforms.length === 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">No platforms connected</p>
              <p className="text-xs text-yellow-700">Connect social media accounts in Settings to publish</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-sm font-medium text-[#1D1D1F] mb-2">Post Content</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content here... (LinkedIn, Twitter, Facebook formats will be auto-adapted)"
          className="w-full h-32 p-3 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007AFF] resize-none"
        />
        <div className="text-xs text-[#86868B] mt-2">{content.length} characters</div>
      </div>

      {/* Schedule Options */}
      <div>
        <h3 className="text-sm font-medium text-[#1D1D1F] mb-3">Timing</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 p-3 border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] cursor-pointer">
            <input
              type="radio"
              checked={scheduleType === "now"}
              onChange={() => setScheduleType("now")}
              className="w-4 h-4"
            />
            <Send className="w-4 h-4 text-[#86868B]" />
            <span className="text-sm text-[#1D1D1F]">Publish Immediately</span>
          </label>

          <label className="flex items-center gap-2 p-3 border border-[#E5E5E7] rounded-lg hover:bg-[#F5F5F7] cursor-pointer">
            <input
              type="radio"
              checked={scheduleType === "later"}
              onChange={() => setScheduleType("later")}
              className="w-4 h-4"
            />
            <Calendar className="w-4 h-4 text-[#86868B]" />
            <span className="text-sm text-[#1D1D1F]">Schedule for Later</span>
          </label>
        </div>

        {scheduleType === "later" && (
          <div className="mt-3 p-4 bg-[#F5F5F7] rounded-lg space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1">Date</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full p-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1D1D1F] mb-1">Time</label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#86868B]" />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="flex-1 p-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-[#E5E5E7]">
        <button
          onClick={handlePublish}
          disabled={loading || selectedPlatforms.length === 0 || !content.trim()}
          className="flex-1 px-4 py-2 bg-[#007AFF] text-white text-sm font-medium rounded-lg hover:bg-[#0056CC] disabled:bg-[#D1D1D6] transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {scheduleType === "now" ? "Publishing..." : "Scheduling..."}
            </>
          ) : scheduleType === "now" ? (
            <>
              <Send className="w-4 h-4" />
              Publish Now
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              Schedule Post
            </>
          )}
        </button>
      </div>
    </div>
  )
}
