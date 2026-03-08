"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalyticsMetric {
  id: string
  title: string
  clientName: string
  value: number
  change: number
  platform: "linkedin" | "instagram" | "twitter" | "facebook" | "tiktok" | "email" | "blog"
  metric: "engagement" | "reach" | "impressions" | "clicks" | "conversions"
  status: "collected" | "analyzed" | "optimized" | "reporting"
}

interface StoryAnalyticsCommandCenterProps {
  metrics: AnalyticsMetric[]
  isLoading?: boolean
  onAddMetric?: () => void
}

const platformColors = {
  linkedin: { label: "LinkedIn", bg: "bg-[#0A66C2]", light: "bg-[#F0F6FF]", border: "border-[#0A66C2]" },
  instagram: { label: "Instagram", bg: "bg-[#E1306C]", light: "bg-[#FFF0F5]", border: "border-[#E1306C]" },
  twitter: { label: "Twitter", bg: "bg-[#1DA1F2]", light: "bg-[#F0F8FF]", border: "border-[#1DA1F2]" },
  facebook: { label: "Facebook", bg: "bg-[#1877F2]", light: "bg-[#F0F5FF]", border: "border-[#1877F2]" },
  tiktok: { label: "TikTok", bg: "bg-[#000000]", light: "bg-[#F5F5F5]", border: "border-[#000000]" },
  email: { label: "Email", bg: "bg-[#7C3AED]", light: "bg-[#FAF5FF]", border: "border-[#7C3AED]" },
  blog: { label: "Blog", bg: "bg-[#059669]", light: "bg-[#F0FDF4]", border: "border-[#059669]" },
}

const metricTypes = {
  engagement: { label: "Engagement", icon: "💬" },
  reach: { label: "Reach", icon: "👥" },
  impressions: { label: "Impressions", icon: "👁️" },
  clicks: { label: "Clicks", icon: "🖱️" },
  conversions: { label: "Conversions", icon: "✓" },
}

const statusConfig = {
  collected: { label: "Data Collected", color: "border-t-[#6B7280]", bgColor: "bg-[#6B7280]" },
  analyzed: { label: "Analyzed", color: "border-t-[#007AFF]", bgColor: "bg-[#007AFF]" },
  optimized: { label: "Optimized", color: "border-t-[#F97316]", bgColor: "bg-[#F97316]" },
  reporting: { label: "Reported", color: "border-t-[#059669]", bgColor: "bg-[#059669]" },
}

export function StoryAnalyticsCommandCenter({ metrics, isLoading = false, onAddMetric }: StoryAnalyticsCommandCenterProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  // Organize metrics by status
  const columns = {
    collected: metrics.filter(m => m.status === "collected"),
    analyzed: metrics.filter(m => m.status === "analyzed"),
    optimized: metrics.filter(m => m.status === "optimized"),
    reporting: metrics.filter(m => m.status === "reporting"),
  }

  // Calculate aggregate metrics
  const totalEngagement = metrics.filter(m => m.metric === "engagement").reduce((sum, m) => sum + m.value, 0)
  const totalReach = metrics.filter(m => m.metric === "reach").reduce((sum, m) => sum + m.value, 0)
  const totalConversions = metrics.filter(m => m.metric === "conversions").reduce((sum, m) => sum + m.value, 0)

  const avgChange = metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.change, 0) / metrics.length).toFixed(1) : "0"

  const reportedCount = columns.reporting.length
  const totalMetrics = metrics.length
  const completionPercent = totalMetrics > 0 ? Math.round((reportedCount / totalMetrics) * 100) : 0

  // Platform performance
  const platformPerformance = Object.keys(platformColors).map(platform => {
    const platformMetrics = metrics.filter(m => m.platform === platform)
    const avgValue = platformMetrics.length > 0 ? (platformMetrics.reduce((sum, m) => sum + m.value, 0) / platformMetrics.length).toFixed(0) : 0
    return { platform, count: platformMetrics.length, avg: avgValue }
  })

  if (isLoading) {
    return <div className="py-12 text-center text-[#86868B]">Loading Story Analytics data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Mission Panel */}
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Mission</h2>
        <div className="space-y-2">
          <p className="text-sm text-[#515154]">Measure story performance across platforms, analyze engagement patterns, and optimize content strategy for maximum impact.</p>
          <div className="mt-4 pt-4 border-t border-[#E5E5E7]">
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest mb-3">Success Criteria</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[#059669] mt-1">✓</span>
                <span className="text-sm text-[#515154]">Weekly analytics collection across all platforms</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#059669] mt-1">✓</span>
                <span className="text-sm text-[#515154]">Performance insights identified and documented</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#059669] mt-1">✓</span>
                <span className="text-sm text-[#515154]">Monthly reports generated and shared with team</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-4">
          <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Total Engagement</div>
          <div className="flex items-end justify-between mt-3">
            <div className="text-2xl font-black text-[#1D1D1F]">{totalEngagement.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[#059669]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">+{avgChange}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E5E7] p-4">
          <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Total Reach</div>
          <div className="flex items-end justify-between mt-3">
            <div className="text-2xl font-black text-[#1D1D1F]">{totalReach.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[#007AFF]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E5E7] p-4">
          <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Total Conversions</div>
          <div className="flex items-end justify-between mt-3">
            <div className="text-2xl font-black text-[#1D1D1F]">{totalConversions}</div>
            <div className="flex items-center gap-1 text-[#F97316]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">+12%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E5E7] p-4">
          <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Avg Change</div>
          <div className="flex items-end justify-between mt-3">
            <div className="text-2xl font-black text-[#1D1D1F]">{avgChange}%</div>
            <div className="flex items-center gap-1 text-[#059669]">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">Week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Completion Indicator */}
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Analysis to Reporting</h3>
            <p className="text-2xl font-black text-[#1D1D1F] mt-1">{completionPercent}%</p>
          </div>
          <div className="text-right text-sm text-[#515154]">
            <p className="font-semibold text-[#1D1D1F]">{reportedCount} reported</p>
            <p className="text-xs text-[#86868B]">of {totalMetrics} total</p>
          </div>
        </div>
        <div className="w-full h-2 bg-[#E5E5E7] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#059669] transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Platform Performance Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {platformPerformance.map(({ platform, count, avg }) => (
          <button
            key={platform}
            onClick={() => setSelectedMetric(selectedMetric === platform ? null : platform)}
            className={cn(
              "p-3 rounded-lg border-2 transition-all text-center",
              selectedMetric === platform
                ? `${platformColors[platform as keyof typeof platformColors].light} border-[${platformColors[platform as keyof typeof platformColors].bg}]`
                : "bg-[#F9FAFB] border-[#E5E5E7] hover:bg-[#F5F5F7]"
            )}
          >
            <div className="text-xs font-semibold text-[#1D1D1F]">{platformColors[platform as keyof typeof platformColors].label}</div>
            <div className="text-lg font-black text-[#1D1D1F] mt-1">{count}</div>
            <div className="text-[10px] text-[#86868B] mt-1">Avg: {avg}</div>
          </button>
        ))}
      </div>

      {/* Analytics Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Data Collected Column */}
        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E5E7]">
          <div className="border-t-2 border-t-[#6B7280] px-4 py-3">
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase tracking-widest">Data Collected</h3>
            <p className="text-2xl font-black text-[#1D1D1F] mt-2">{columns.collected.length}</p>
          </div>

          <div className="p-4 space-y-3 min-h-[400px]">
            {columns.collected.length > 0 ? (
              columns.collected.map((metric) => {
                const platformConfig = platformColors[metric.platform as keyof typeof platformColors]
                return (
                  <div key={metric.id} className="p-3 rounded-lg border border-[#E5E5E7] bg-white hover:bg-[#F9FAFB] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1D1D1F] line-clamp-2">{metric.title}</p>
                        <p className="text-xs text-[#86868B] mt-1">{metric.clientName}</p>
                      </div>
                      <div className={cn("px-2 py-1 rounded text-[10px] font-semibold text-white whitespace-nowrap", platformConfig.bg)}>
                        {metric.value}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5F5F7]">
                      <span className="text-[10px] text-[#86868B]">{platformConfig.label}</span>
                      <span className="text-[10px] font-semibold text-[#515154]">{metricTypes[metric.metric as keyof typeof metricTypes].label}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-[#D1D1D6] mb-2" />
                <p className="text-xs text-[#86868B]">Start collecting platform analytics data</p>
              </div>
            )}
          </div>
        </div>

        {/* Analyzed Column */}
        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E5E7]">
          <div className="border-t-2 border-t-[#007AFF] px-4 py-3">
            <h3 className="text-xs font-semibold text-[#007AFF] uppercase tracking-widest">Analyzed</h3>
            <p className="text-2xl font-black text-[#1D1D1F] mt-2">{columns.analyzed.length}</p>
          </div>

          <div className="p-4 space-y-3 min-h-[400px]">
            {columns.analyzed.length > 0 ? (
              columns.analyzed.map((metric) => {
                const platformConfig = platformColors[metric.platform as keyof typeof platformColors]
                const changeIsPositive = metric.change >= 0
                return (
                  <div key={metric.id} className="p-3 rounded-lg border border-[#E5E5E7] bg-white hover:bg-[#F9FAFB] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1D1D1F] line-clamp-2">{metric.title}</p>
                        <p className="text-xs text-[#86868B] mt-1">{metric.clientName}</p>
                      </div>
                      <div className={cn("flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold text-white whitespace-nowrap", changeIsPositive ? "bg-[#059669]" : "bg-[#E53935]")}>
                        {changeIsPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(metric.change)}%
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5F5F7]">
                      <span className="text-[10px] text-[#86868B]">{platformConfig.label}</span>
                      <span className="text-[10px] font-semibold text-[#007AFF]">Insights Pending</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-[#D1D1D6] mb-2" />
                <p className="text-xs text-[#86868B]">Analyze collected data for trends and patterns</p>
              </div>
            )}
          </div>
        </div>

        {/* Optimized Column */}
        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E5E7]">
          <div className="border-t-2 border-t-[#F97316] px-4 py-3">
            <h3 className="text-xs font-semibold text-[#F97316] uppercase tracking-widest">Optimized</h3>
            <p className="text-2xl font-black text-[#1D1D1F] mt-2">{columns.optimized.length}</p>
          </div>

          <div className="p-4 space-y-3 min-h-[400px]">
            {columns.optimized.length > 0 ? (
              columns.optimized.map((metric) => {
                const platformConfig = platformColors[metric.platform as keyof typeof platformColors]
                return (
                  <div key={metric.id} className="p-3 rounded-lg border border-[#E5E5E7] bg-white hover:bg-[#F9FAFB] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1D1D1F] line-clamp-2">{metric.title}</p>
                        <p className="text-xs text-[#86868B] mt-1">{metric.clientName}</p>
                      </div>
                      <div className="px-2 py-1 rounded bg-[#FFF4E6] text-[#F97316] text-[10px] font-semibold whitespace-nowrap">
                        Optimized
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5F5F7]">
                      <span className="text-[10px] text-[#86868B]">{platformConfig.label}</span>
                      <span className="text-[10px] font-semibold text-[#F97316]">Ready to Report</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-[#D1D1D6] mb-2" />
                <p className="text-xs text-[#86868B]">Document optimizations and next actions</p>
              </div>
            )}
          </div>
        </div>

        {/* Reported Column */}
        <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E5E7]">
          <div className="border-t-2 border-t-[#059669] px-4 py-3">
            <h3 className="text-xs font-semibold text-[#059669] uppercase tracking-widest">Reported</h3>
            <p className="text-2xl font-black text-[#1D1D1F] mt-2">{columns.reporting.length}</p>
          </div>

          <div className="p-4 space-y-3 min-h-[400px]">
            {columns.reporting.length > 0 ? (
              columns.reporting.map((metric) => {
                const platformConfig = platformColors[metric.platform as keyof typeof platformColors]
                return (
                  <div key={metric.id} className="p-3 rounded-lg border border-[#E5E5E7] bg-white hover:bg-[#F9FAFB] transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1D1D1F] line-clamp-2">{metric.title}</p>
                        <p className="text-xs text-[#86868B] mt-1">{metric.clientName}</p>
                      </div>
                      <div className="px-2 py-1 rounded bg-[#E8F5E9] text-[#2E7D32] text-[10px] font-semibold whitespace-nowrap">
                        ✓ Shared
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5F5F7]">
                      <span className="text-[10px] text-[#86868B]">{platformConfig.label}</span>
                      <span className="text-[10px] font-semibold text-[#059669]">Stakeholder Visible</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-[#D1D1D6] mb-2" />
                <p className="text-xs text-[#86868B]">Share reports and insights with stakeholders</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
          <h2 className="text-sm font-semibold text-[#1D1D1F] mb-4">Tracking Standards</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-[#007AFF] mt-0.5">•</span>
              <div>
                <p className="text-sm font-medium text-[#1D1D1F]">Weekly data collection</p>
                <p className="text-xs text-[#86868B]">Every Monday morning</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-[#007AFF] mt-0.5">•</span>
              <div>
                <p className="text-sm font-medium text-[#1D1D1F]">Key metrics tracked</p>
                <p className="text-xs text-[#86868B]">Engagement, reach, conversions, clicks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-[#007AFF] mt-0.5">•</span>
              <div>
                <p className="text-sm font-medium text-[#1D1D1F]">Monthly reports</p>
                <p className="text-xs text-[#86868B]">Shared by first day of following month</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E5E7] p-6">
          <h2 className="text-sm font-semibold text-[#1D1D1F] mb-4">Optimization Focus</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-[#F97316] mt-0.5">→</span>
              <div>
                <p className="text-sm font-medium text-[#1D1D1F]">High-performing content</p>
                <p className="text-xs text-[#86868B]">Replicate winning patterns</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-[#F97316] mt-0.5">→</span>
              <div>
                <p className="text-sm font-medium text-[#1D1D1F]">Best posting times</p>
                <p className="text-xs text-[#86868B]">Platform-specific cadence</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm font-semibold text-[#F97316] mt-0.5">→</span>
              <div>
                <p className="text-sm font-medium text-[#1D1D1F]">Audience insights</p>
                <p className="text-xs text-[#86868B]">Demographics and behavior patterns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
