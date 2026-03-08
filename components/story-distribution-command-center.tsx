"use client"

import { useState } from "react"
import { Plus, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface DistributionMove {
  id: string
  title: string
  clientName: string
  dueDate: string
  platform: "linkedin" | "instagram" | "twitter" | "facebook" | "tiktok" | "email" | "blog"
  status: "draft" | "scheduled" | "published" | "promoted"
}

interface StoryDistributionCommandCenterProps {
  moves: DistributionMove[]
  isLoading?: boolean
  onAddMove?: () => void
}

const platformColors = {
  linkedin: { label: "LinkedIn", border: "border-t-[#0A66C2]", bg: "bg-[#0A66C2]", light: "bg-[#F0F6FF]" },
  instagram: { label: "Instagram", border: "border-t-[#E1306C]", bg: "bg-[#E1306C]", light: "bg-[#FFF0F5]" },
  twitter: { label: "Twitter", border: "border-t-[#1DA1F2]", bg: "bg-[#1DA1F2]", light: "bg-[#F0F8FF]" },
  facebook: { label: "Facebook", border: "border-t-[#1877F2]", bg: "bg-[#1877F2]", light: "bg-[#F0F5FF]" },
  tiktok: { label: "TikTok", border: "border-t-[#000000]", bg: "bg-[#000000]", light: "bg-[#F5F5F5]" },
  email: { label: "Email", border: "border-t-[#7C3AED]", bg: "bg-[#7C3AED]", light: "bg-[#FAF5FF]" },
  blog: { label: "Blog", border: "border-t-[#059669]", bg: "bg-[#059669]", light: "bg-[#F0FDF4]" },
}

const statusConfig = {
  draft: { label: "Draft", color: "text-[#6B7280]" },
  scheduled: { label: "Scheduled", color: "text-[#007AFF]" },
  published: { label: "Published", color: "text-[#059669]" },
  promoted: { label: "Promoted", color: "text-[#F97316]" },
}

export function StoryDistributionCommandCenter({ moves, isLoading = false, onAddMove }: StoryDistributionCommandCenterProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)

  // Organize moves by status
  const columns = {
    draft: moves.filter(m => m.status === "draft"),
    scheduled: moves.filter(m => m.status === "scheduled"),
    published: moves.filter(m => m.status === "published"),
    promoted: moves.filter(m => m.status === "promoted"),
  }

  const promotedCount = columns.promoted.length
  const totalMoves = moves.length
  const completionPercent = totalMoves > 0 ? Math.round((promotedCount / totalMoves) * 100) : 0

  // Count by platform
  const platformCounts = Object.keys(platformColors).reduce((acc, platform) => {
    acc[platform] = moves.filter(m => m.platform === platform).length
    return acc
  }, {} as Record<string, number>)

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  if (isLoading) {
    return <div className="py-12 text-center text-[#86868B]">Loading Story Distribution data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Mission Panel */}
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Mission</h2>
        <div className="space-y-2">
          <p className="text-sm text-[#515154]">Distribute compelling content across social media platforms to build authority, engagement, and lead generation.</p>
          <div className="mt-4 pt-4 border-t border-[#E5E5E7]">
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Success Criteria</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[#059669] mt-1">✓</span>
                <span className="text-sm text-[#515154]">Content distributed to 5+ platforms consistently</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#059669] mt-1">✓</span>
                <span className="text-sm text-[#515154]">Weekly publishing schedule maintained</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#059669] mt-1">✓</span>
                <span className="text-sm text-[#515154]">Platform engagement and promotion metrics tracked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Completion Indicator */}
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Distribution Promotion</h3>
            <p className="text-2xl font-black text-[#1D1D1F] mt-1">{completionPercent}%</p>
          </div>
          <div className="text-right text-sm text-[#515154]">
            <p className="font-semibold text-[#1D1D1F]">{promotedCount} promoted</p>
            <p className="text-xs text-[#86868B]">of {totalMoves} total</p>
          </div>
        </div>
        <div className="w-full h-2 bg-[#E5E5E7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F97316] transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Platform Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(platformColors).map(([platform, config]) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(selectedPlatform === platform ? null : platform)}
            className={cn(
              "p-3 rounded-lg border-2 transition-all text-center",
              selectedPlatform === platform
                ? `${config.light} ${config.border}`
                : "bg-[#F9FAFB] border-[#E5E5E7] hover:bg-[#F5F5F7]"
            )}
          >
            <div className="text-xs font-semibold text-[#1D1D1F]">{config.label}</div>
            <div className="text-lg font-black text-[#1D1D1F] mt-1">{platformCounts[platform]}</div>
          </button>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Draft Column */}
        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E5E7]">
          <div className="border-t-2 border-t-[#6B7280] px-4 py-3">
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Draft</h3>
            <p className="text-2xl font-black text-[#1D1D1F] mt-2">{columns.draft.length}</p>
          </div>

          <div className="p-4 space-y-3 min-h-[400px]">
            {columns.draft.length > 0 ? (
              columns.draft.map((move) => {
                const platformConfig = platformColors[move.platform]
                return (
                  <div
                    key={move.id}
                    className={`p-3 rounded-lg border-l-4 ${platformConfig.border} bg-white border border-[#E5E5E7]`}
                  >
                    <p className="text-sm font-semibold text-[#1D1D1F] line-clamp-2">{move.title}</p>
                    <p className="text-xs text-[#86868B] mt-2">{move.clientName}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-medium text-[#515154]">{platformConfig.label}</span>
                      <span className="text-xs text-[#86868B]">{formatDueDate(move.dueDate)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-[#D1D1D6] mb-2" />
                <p className="text-xs text-[#86868B]">Create content pieces and save as drafts</p>
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Column */}
        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E5E7]">
          <div className="border-t-2 border-t-[#007AFF] px-4 py-3">
            <h3 className="text-xs font-semibold text-[#007AFF] uppercase tracking-widest">Scheduled</h3>
            <p className="text-2xl font-black text-[#1D1D1F] mt-2">{columns.scheduled.length}</p>
          </div>

          <div className="p-4 space-y-3 min-h-[400px]">
            {columns.scheduled.length > 0 ? (
              columns.scheduled.map((move) => {
                const platformConfig = platformColors[move.platform]
                const overdue = isOverdue(move.dueDate)
                return (
                  <div
                    key={move.id}
                    className={`p-3 rounded-lg border-l-4 ${platformConfig.border} bg-white border border-[#E5E5E7] ${overdue ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#1D1D1F] line-clamp-2 flex-1">{move.title}</p>
                      {overdue && (
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-xs text-[#86868B] mt-2">{move.clientName}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-medium text-[#515154]">{platformConfig.label}</span>
                      <span className={`text-xs ${overdue ? "text-red-600 font-semibold" : "text-[#86868B]"}`}>
                        {formatDueDate(move.dueDate)}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-[#D1D1D6] mb-2" />
                <p className="text-xs text-[#86868B]">Schedule content across platforms</p>
              </div>
            )}
          </div>
        </div>

        {/* Published Column */}
        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E5E7]">
          <div className="border-t-2 border-t-[#059669] px-4 py-3">
            <h3 className="text-xs font-semibold text-[#059669] uppercase tracking-widest">Published</h3>
            <p className="text-2xl font-black text-[#1D1D1F] mt-2">{columns.published.length}</p>
          </div>

          <div className="p-4 space-y-3 min-h-[400px]">
            {columns.published.length > 0 ? (
              columns.published.map((move) => {
                const platformConfig = platformColors[move.platform]
                return (
                  <div
                    key={move.id}
                    className={`p-3 rounded-lg border-l-4 ${platformConfig.border} bg-white border border-[#E5E5E7]`}
                  >
                    <p className="text-sm font-semibold text-[#1D1D1F] line-clamp-2">{move.title}</p>
                    <p className="text-xs text-[#86868B] mt-2">{move.clientName}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-medium text-[#515154]">{platformConfig.label}</span>
                      <span className="text-xs text-[#86868B]">{formatDueDate(move.dueDate)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-[#D1D1D6] mb-2" />
                <p className="text-xs text-[#86868B]">Content appears here when published</p>
              </div>
            )}
          </div>
        </div>

        {/* Promoted Column */}
        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E5E7]">
          <div className="border-t-2 border-t-[#F97316] px-4 py-3">
            <h3 className="text-xs font-semibold text-[#F97316] uppercase tracking-widest">Promoted</h3>
            <p className="text-2xl font-black text-[#1D1D1F] mt-2">{columns.promoted.length}</p>
          </div>

          <div className="p-4 space-y-3 min-h-[400px]">
            {columns.promoted.length > 0 ? (
              columns.promoted.map((move) => {
                const platformConfig = platformColors[move.platform]
                return (
                  <div
                    key={move.id}
                    className={`p-3 rounded-lg border-l-4 ${platformConfig.border} bg-white border border-[#E5E5E7]`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-2 py-0.5 bg-[#FFF4E6] text-[#F97316] text-[10px] font-semibold rounded">PROMOTED</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1D1D1F] line-clamp-2">{move.title}</p>
                    <p className="text-xs text-[#86868B] mt-2">{move.clientName}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-medium text-[#515154]">{platformConfig.label}</span>
                      <span className="text-xs text-[#86868B]">{formatDueDate(move.dueDate)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-[#D1D1D6] mb-2" />
                <p className="text-xs text-[#86868B]">Boost top performers with paid promotion</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Distribution Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
          <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4">Platform Cadence</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#515154]">LinkedIn</span>
              <span className="text-xs font-semibold text-[#6B7280]">2x per week</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#515154]">Instagram</span>
              <span className="text-xs font-semibold text-[#6B7280]">3x per week</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#515154]">Email</span>
              <span className="text-xs font-semibold text-[#6B7280]">Weekly newsletter</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#515154]">Blog</span>
              <span className="text-xs font-semibold text-[#6B7280]">Bi-weekly posts</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
          <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4">Content Mix</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#515154]">Educational</span>
              <span className="text-xs font-semibold text-[#6B7280]">50%</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#515154]">Promotional</span>
              <span className="text-xs font-semibold text-[#6B7280]">25%</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#515154]">Community</span>
              <span className="text-xs font-semibold text-[#6B7280]">15%</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[#515154]">Behind-the-scenes</span>
              <span className="text-xs font-semibold text-[#6B7280]">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
