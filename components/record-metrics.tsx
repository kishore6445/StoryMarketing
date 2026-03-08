"use client"

import { useState } from "react"
import { BarChart3, Plus, X, TrendingUp, Calendar, Edit2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricEntry {
  id: string
  platform: string
  date: string
  metrics: {
    reach?: number
    views?: number
    impressions?: number
    openRate?: number
    clickRate?: number
    engagement?: number
    leads?: number
    conversions?: number
    [key: string]: number | undefined
  }
  notes?: string
  recordedBy?: string
  createdAt: string
}

const PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2" },
  { id: "email", name: "Email", color: "#EA4335" },
  { id: "youtube", name: "YouTube", color: "#FF0000" },
  { id: "instagram", name: "Instagram", color: "#E4405F" },
  { id: "facebook", name: "Facebook", color: "#1877F2" },
  { id: "twitter", name: "Twitter", color: "#1DA1F2" },
  { id: "tiktok", name: "TikTok", color: "#000000" },
  { id: "website", name: "Website", color: "#34C759" },
]

const METRIC_TYPES = [
  { id: "reach", name: "Reach", unit: "" },
  { id: "views", name: "Views", unit: "" },
  { id: "impressions", name: "Impressions", unit: "" },
  { id: "openRate", name: "Open Rate", unit: "%" },
  { id: "clickRate", name: "Click Rate", unit: "%" },
  { id: "engagement", name: "Engagement Rate", unit: "%" },
  { id: "leads", name: "Leads Generated", unit: "" },
  { id: "conversions", name: "Conversions", unit: "" },
]

export function RecordMetrics() {
  const [isAddingMetric, setIsAddingMetric] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0])
  const [metrics, setMetrics] = useState<{ [key: string]: string }>({})
  const [notes, setNotes] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  // Mock historical data
  const [historicalData, setHistoricalData] = useState<MetricEntry[]>([
    {
      id: "1",
      platform: "linkedin",
      date: "2026-01-25",
      metrics: { reach: 15420, engagement: 4.2, leads: 23 },
      notes: "Post about industry trends performed well",
      recordedBy: "Sarah Chen",
      createdAt: "2026-01-25",
    },
    {
      id: "2",
      platform: "email",
      date: "2026-01-24",
      metrics: { reach: 8500, openRate: 28.5, clickRate: 12.3, conversions: 5 },
      notes: "Newsletter campaign - New segment performed better",
      recordedBy: "Marcus Johnson",
      createdAt: "2026-01-24",
    },
    {
      id: "3",
      platform: "youtube",
      date: "2026-01-23",
      metrics: { views: 2340, engagement: 8.1, leads: 12 },
      notes: "Tutorial video - High engagement",
      recordedBy: "Emily Davis",
      createdAt: "2026-01-23",
    },
  ])

  const handleAddMetric = () => {
    if (selectedPlatform && Object.keys(metrics).length > 0) {
      const newEntry: MetricEntry = {
        id: `metric-${Date.now()}`,
        platform: selectedPlatform,
        date: recordDate,
        metrics: Object.fromEntries(
          Object.entries(metrics).map(([key, value]) => [key, parseFloat(value) || 0]),
        ),
        notes: notes || undefined,
        recordedBy: "Current User",
        createdAt: new Date().toISOString(),
      }

      setHistoricalData([newEntry, ...historicalData])
      resetForm()
    }
  }

  const resetForm = () => {
    setSelectedPlatform("")
    setRecordDate(new Date().toISOString().split("T")[0])
    setMetrics({})
    setNotes("")
    setIsAddingMetric(false)
  }

  const handleDeleteEntry = (id: string) => {
    setHistoricalData(historicalData.filter((entry) => entry.id !== id))
  }

  const getPlatformName = (platformId: string) => {
    return PLATFORMS.find((p) => p.id === platformId)?.name || platformId
  }

  const getPlatformColor = (platformId: string) => {
    return PLATFORMS.find((p) => p.id === platformId)?.color || "#86868B"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-[#2E7D32]" />
          <h1 className="text-3xl font-semibold text-[#1D1D1F]">Record Platform Metrics</h1>
        </div>
        <p className="text-sm text-[#86868B]">
          Track and record performance metrics for each platform. Historical data helps identify trends and optimize strategy.
        </p>
      </div>

      {/* Add Metric Section */}
      {!isAddingMetric ? (
        <button
          onClick={() => setIsAddingMetric(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-[#E5E5E7] rounded-lg hover:border-[#2E7D32] hover:bg-[#F8FFF7] transition-colors"
        >
          <Plus className="w-5 h-5 text-[#2E7D32]" />
          <span className="text-sm font-medium text-[#1D1D1F]">Record New Metrics</span>
        </button>
      ) : (
        <div className="bg-[#F8F9FB] border border-[#E5E5E7] rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1D1D1F]">New Metrics Entry</h2>
            <button onClick={resetForm} className="text-[#86868B] hover:text-[#1D1D1F]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Select Platform</label>
            <div className="grid grid-cols-4 gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg border-2 transition-all text-xs font-medium",
                    selectedPlatform === platform.id
                      ? "border-[#2E7D32] bg-[#2E7D32] text-white"
                      : "border-[#E5E5E7] bg-white text-[#1D1D1F] hover:border-[#2E7D32]",
                  )}
                >
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Date</label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm"
            />
          </div>

          {/* Metrics Input */}
          <div>
            <label className="text-sm font-medium text-[#1D1D1F] block mb-3">Metrics</label>
            <div className="grid grid-cols-2 gap-3">
              {METRIC_TYPES.map((metric) => (
                <div key={metric.id}>
                  <label className="text-xs text-[#86868B] block mb-1">{metric.name}</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="0"
                      value={metrics[metric.id] || ""}
                      onChange={(e) =>
                        setMetrics({
                          ...metrics,
                          [metric.id]: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm"
                    />
                    {metric.unit && <span className="text-xs text-[#86868B]">{metric.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-[#1D1D1F] block mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add context or insights about this data..."
              className="w-full px-3 py-2 border border-[#E5E5E7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D32] text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleAddMetric}
              className="flex-1 px-4 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors font-medium text-sm"
            >
              Save Metrics
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] rounded-lg hover:bg-[#E5E5E7] transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Historical Data Section */}
      <div>
        <h2 className="text-lg font-semibold text-[#1D1D1F] mb-4">Historical Data</h2>

        {historicalData.length > 0 ? (
          <div className="space-y-3">
            {historicalData.map((entry) => (
              <div
                key={entry.id}
                className="bg-white border border-[#E5E5E7] rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getPlatformColor(entry.platform) }}
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-[#1D1D1F]">
                        {getPlatformName(entry.platform)}
                      </h3>
                      <p className="text-xs text-[#86868B]">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="p-2 text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FFF0F0] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {Object.entries(entry.metrics).map(([key, value]) => {
                    const metricType = METRIC_TYPES.find((m) => m.id === key)
                    return (
                      <div key={key} className="bg-[#F8F9FB] rounded-lg p-2">
                        <p className="text-xs text-[#86868B] mb-1">{metricType?.name || key}</p>
                        <p className="text-sm font-semibold text-[#1D1D1F]">
                          {value}
                          {metricType?.unit}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Notes and Metadata */}
                {entry.notes && (
                  <div className="mb-3 pb-3 border-t border-[#E5E5E7]">
                    <p className="text-xs text-[#86868B] mt-3">{entry.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-[#86868B] pt-3 border-t border-[#E5E5E7]">
                  <span>Recorded by {entry.recordedBy}</span>
                  <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#F8F9FB] border border-dashed border-[#E5E5E7] rounded-lg p-8 text-center">
            <BarChart3 className="w-12 h-12 text-[#D0D0D5] mx-auto mb-3" />
            <p className="text-sm text-[#86868B]">No metrics recorded yet. Start by adding your first entry!</p>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      {historicalData.length > 0 && (
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#1D1D1F] mb-3">Quick Stats</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-[#F8F9FB] rounded-lg p-3">
              <p className="text-xs text-[#86868B]">Total Entries</p>
              <p className="text-2xl font-bold text-[#1D1D1F]">{historicalData.length}</p>
            </div>
            <div className="bg-[#F8F9FB] rounded-lg p-3">
              <p className="text-xs text-[#86868B]">Platforms Tracked</p>
              <p className="text-2xl font-bold text-[#1D1D1F]">{new Set(historicalData.map((d) => d.platform)).size}</p>
            </div>
            <div className="bg-[#F8F9FB] rounded-lg p-3">
              <p className="text-xs text-[#86868B]">Total Leads</p>
              <p className="text-2xl font-bold text-[#1D1D1F]">
                {historicalData.reduce((sum, entry) => sum + (entry.metrics.leads || 0), 0)}
              </p>
            </div>
            <div className="bg-[#F8F9FB] rounded-lg p-3">
              <p className="text-xs text-[#86868B]">Total Conversions</p>
              <p className="text-2xl font-bold text-[#1D1D1F]">
                {historicalData.reduce((sum, entry) => sum + (entry.metrics.conversions || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
