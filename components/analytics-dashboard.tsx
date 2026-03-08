"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface CampaignMetric {
  name: string
  value: number
  unit: string
  change: number
  trend: "up" | "down" | "stable"
}

interface PhaseMetric {
  phase: string
  daysToComplete: number
  tasksCompleted: number
  tasksTotal: number
  efficiency: number
}

interface ClientComparison {
  name: string
  campaignsRun: number
  avgCompletionTime: number
  engagementRate: number
  conversionRate: number
}

interface AnalyticsInsight {
  topChannel: string
  topChannelEngagement: number
  overallConsistency: number
  totalReach: number
  totalLeads: number
  keyRecommendations: string[]
}

interface AnalyticsDashboardProps {
  clientId?: string
}

export function AnalyticsDashboard({ clientId = "client-1" }: AnalyticsDashboardProps) {
  const [insights, setInsights] = useState<AnalyticsInsight | null>(null)
  const [loading, setLoading] = useState(true)

  const campaignMetrics: CampaignMetric[] = [
    { name: "Engagement Rate", value: 8.4, unit: "%", change: 12, trend: "up" },
    { name: "Reach", value: 245000, unit: "users", change: 28, trend: "up" },
    { name: "Conversion Rate", value: 3.2, unit: "%", change: -5, trend: "down" },
    { name: "Cost Per Conversion", value: 42, unit: "$", change: -15, trend: "down" },
    { name: "Video Completion Rate", value: 64, unit: "%", change: 8, trend: "up" },
    { name: "Share Rate", value: 2.1, unit: "%", change: 22, trend: "up" },
  ]

  const phaseMetrics: PhaseMetric[] = [
    { phase: "Story Research", daysToComplete: 15, tasksCompleted: 5, tasksTotal: 5, efficiency: 100 },
    { phase: "Story Writing", daysToComplete: 28, tasksCompleted: 13, tasksTotal: 20, efficiency: 65 },
    { phase: "Story Design & Video", daysToComplete: 0, tasksCompleted: 0, tasksTotal: 18, efficiency: 0 },
    { phase: "Distribution", daysToComplete: 0, tasksCompleted: 0, tasksTotal: 10, efficiency: 0 },
  ]

  const clientComparisons: ClientComparison[] = [
    { name: "ABC Manufacturing", campaignsRun: 3, avgCompletionTime: 105, engagementRate: 8.4, conversionRate: 3.2 },
    { name: "TechStartup XYZ", campaignsRun: 2, avgCompletionTime: 92, engagementRate: 7.2, conversionRate: 2.8 },
    { name: "Industry Average", campaignsRun: 0, avgCompletionTime: 120, engagementRate: 6.1, conversionRate: 2.1 },
  ]

  useEffect(() => {
    const fetchAndAnalyze = async () => {
      try {
        // Fetch analytics data
        const channelsRes = await fetch(`/api/analytics/channels?clientId=${clientId}`)
        const consistencyRes = await fetch(`/api/analytics/consistency?clientId=${clientId}`)
        const contentRes = await fetch(`/api/analytics/content?clientId=${clientId}`)

        if (!channelsRes.ok || !consistencyRes.ok || !contentRes.ok) {
          throw new Error("Failed to fetch analytics")
        }

        const channelsData = await channelsRes.json()
        const consistencyData = await consistencyRes.json()
        const contentData = await contentRes.json()

        // Generate insights
        const channels = channelsData.channels
        const topChannel = channels.reduce((max: any, ch: any) =>
          ch.engagement > max.engagement ? ch : max
        )

        const totalReach = channels.reduce((sum: number, ch: any) => sum + ch.reach, 0)
        const totalLeads = channels.reduce((sum: number, ch: any) => sum + ch.leads, 0)

        const avgConsistency =
          consistencyData.consistency.length > 0
            ? Math.round(
                consistencyData.consistency.reduce((sum: number, c: any) => sum + c.consistency, 0) /
                  consistencyData.consistency.length
              )
            : 0

        // Generate recommendations
        const recommendations: string[] = []

        if (topChannel) {
          recommendations.push(
            `Focus on ${topChannel.channel} - achieving ${topChannel.engagement}% engagement rate`
          )
        }

        if (channels.some((c: any) => c.trend === "up")) {
          const growingChannels = channels.filter((c: any) => c.trend === "up").map((c: any) => c.channel)
          recommendations.push(`Double down on ${growingChannels.join(", ")} - showing upward momentum`)
        }

        if (contentData.content.length > 0) {
          const topContent = contentData.content[0]
          recommendations.push(
            `Replicate success of "${topContent.title}" - achieved ${topContent.metrics.views} views and ${topContent.metrics.leads} leads`
          )
        }

        setInsights({
          topChannel: topChannel?.channel || "N/A",
          topChannelEngagement: topChannel?.engagement || 0,
          overallConsistency: avgConsistency,
          totalReach,
          totalLeads,
          keyRecommendations: recommendations,
        })
      } catch (error) {
        console.error("[v0] Analytics error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAndAnalyze()
  }, [clientId])

  if (loading || !insights) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-[#E5E5E7] rounded-lg p-4 animate-pulse">
            <div className="h-12 bg-[#F5F5F7] rounded mb-2" />
            <div className="h-4 bg-[#F5F5F7] rounded w-2/3" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Story Analytics</h1>
        <p className="text-sm text-[#86868B]">Campaign performance, metrics trends, and client comparisons</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <div className="text-xs text-[#86868B] uppercase tracking-wider font-medium mb-2">Total Reach</div>
          <div className="text-3xl font-bold text-[#1D1D1F] mb-1">
            {(insights.totalReach / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-[#86868B]">Across all channels</div>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <div className="text-xs text-[#86868B] uppercase tracking-wider font-medium mb-2">Total Leads</div>
          <div className="text-3xl font-bold text-[#1D1D1F] mb-1">{insights.totalLeads}</div>
          <div className="text-xs text-[#86868B]">Generated this period</div>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <div className="text-xs text-[#86868B] uppercase tracking-wider font-medium mb-2">Consistency</div>
          <div className="text-3xl font-bold text-[#1D1D1F] mb-1">{insights.overallConsistency}%</div>
          <div className="flex items-center gap-1 text-xs mt-2">
            {insights.overallConsistency >= 90 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                <span className="text-[#34C759]">Excellent</span>
              </>
            ) : insights.overallConsistency >= 75 ? (
              <>
                <AlertCircle className="w-4 h-4 text-[#FFB547]" />
                <span className="text-[#FFB547]">Good</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-[#FF3B30]" />
                <span className="text-[#FF3B30]">Needs work</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
          <div className="text-xs text-[#86868B] uppercase tracking-wider font-medium mb-2">Top Channel</div>
          <div className="text-lg font-bold text-[#1D1D1F] mb-1">{insights.topChannel}</div>
          <div className="flex items-center gap-1 text-xs">
            <TrendingUp className="w-3 h-3 text-[#34C759]" />
            <span className="text-[#34C759]">{insights.topChannelEngagement}% engagement</span>
          </div>
        </div>
      </div>

      {/* Campaign Performance Dashboard */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-6">Campaign Performance</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaignMetrics.map((metric) => (
            <div
              key={metric.name}
              className="p-4 border border-[#E5E5E7] rounded-lg hover:bg-[#F8F9FB] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs text-[#86868B] font-medium uppercase tracking-wide">{metric.name}</p>
                  <p className="text-2xl font-bold text-[#1D1D1F] mt-1">
                    {metric.value.toLocaleString()}
                    <span className="text-lg text-[#86868B] font-normal"> {metric.unit}</span>
                  </p>
                </div>
                {metric.trend === "up" ? (
                  <TrendingUp className="w-5 h-5 text-[#34C759]" />
                ) : metric.trend === "down" ? (
                  <TrendingDown className="w-5 h-5 text-[#FF3B30]" />
                ) : null}
              </div>

              <div className={`flex items-center gap-1 text-sm font-medium ${metric.trend === "up" ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                {metric.trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(metric.change)}% vs last period
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
          <h3 className="text-base font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Engagement Trend (Last 30 Days)
          </h3>

          <div className="space-y-3">
            {[
              { label: "Week 1", value: 6.2, max: 10 },
              { label: "Week 2", value: 7.1, max: 10 },
              { label: "Week 3", value: 7.8, max: 10 },
              { label: "Week 4", value: 8.4, max: 10 },
            ].map((week) => (
              <div key={week.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#1D1D1F] font-medium">{week.label}</span>
                  <span className="text-sm font-bold text-[#007AFF]">{week.value}%</span>
                </div>
                <div className="w-full h-2 bg-[#E5E5E7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#007AFF] rounded-full"
                    style={{ width: `${(week.value / week.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
          <h3 className="text-base font-semibold text-[#1D1D1F] mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Conversion Funnel
          </h3>

          <div className="space-y-3">
            {[
              { label: "Impressions", value: 245000, percentage: 100, color: "#007AFF" },
              { label: "Clicks", value: 42000, percentage: 17, color: "#0051C3" },
              { label: "Engagement", value: 20560, percentage: 49, color: "#34C759" },
              { label: "Conversions", value: 7859, percentage: 38, color: "#2E7D32" },
            ].map((stage) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#1D1D1F] font-medium">{stage.label}</span>
                  <span className="text-sm font-bold text-[#1D1D1F]">
                    {stage.value.toLocaleString()} ({stage.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-[#E5E5E7] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${stage.percentage}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Phase Completion Speed Tracking */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Phase Completion Speed</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E7]">
                <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F]">Phase</th>
                <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Days Taken</th>
                <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Tasks Done</th>
                <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Efficiency</th>
                <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Status</th>
              </tr>
            </thead>
            <tbody>
              {phaseMetrics.map((metric) => (
                <tr key={metric.phase} className="border-b border-[#E5E5E7] hover:bg-[#F8F9FB]">
                  <td className="py-3 px-4 text-[#1D1D1F] font-medium">{metric.phase}</td>
                  <td className="py-3 px-4 text-center text-[#1D1D1F]">{metric.daysToComplete}</td>
                  <td className="py-3 px-4 text-center text-[#1D1D1F]">
                    {metric.tasksCompleted} / {metric.tasksTotal}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="w-16 h-2 bg-[#E5E5E7] rounded-full overflow-hidden mx-auto">
                      <div
                        className={`h-full rounded-full ${metric.efficiency === 100 ? "bg-[#34C759]" : metric.efficiency > 50 ? "bg-[#FFB547]" : "bg-[#D1D1D6]"}`}
                        style={{ width: `${metric.efficiency}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        metric.efficiency === 100
                          ? "bg-[#E8F5E9] text-[#2E7D32]"
                          : metric.efficiency > 0
                            ? "bg-[#FFF3E0] text-[#9E5610]"
                            : "bg-[#F5F5F7] text-[#86868B]"
                      }`}
                    >
                      {metric.efficiency === 100 ? "Complete" : metric.efficiency > 0 ? "In Progress" : "Not Started"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Comparison Report */}
      <div className="bg-white rounded-lg border border-[#E5E5E7] p-6">
        <h2 className="text-base font-semibold text-[#1D1D1F] mb-4">Client Performance Comparison</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E7]">
                <th className="text-left py-3 px-4 font-semibold text-[#1D1D1F]">Client</th>
                <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Campaigns</th>
                <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Avg. Days</th>
                <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Engagement</th>
                <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Conversion</th>
                <th className="text-center py-3 px-4 font-semibold text-[#1D1D1F]">Performance</th>
              </tr>
            </thead>
            <tbody>
              {clientComparisons.map((client) => (
                <tr key={client.name} className="border-b border-[#E5E5E7] hover:bg-[#F8F9FB]">
                  <td className="py-3 px-4 text-[#1D1D1F] font-medium">{client.name}</td>
                  <td className="py-3 px-4 text-center text-[#1D1D1F]">{client.campaignsRun}</td>
                  <td className="py-3 px-4 text-center text-[#1D1D1F]">{client.avgCompletionTime} days</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[#007AFF] font-semibold">{client.engagementRate}%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[#34C759] font-semibold">{client.conversionRate}%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {client.engagementRate > 7 && <span className="text-lg">⭐</span>}
                      {client.conversionRate > 3 && <span className="text-lg">⭐</span>}
                      {client.avgCompletionTime < 100 && <span className="text-lg">⭐</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Recommendations */}
      <div className="bg-white border border-[#E5E5E7] rounded-lg p-6">
        <h3 className="text-base font-semibold text-[#1D1D1F] mb-4">Key Recommendations</h3>
        <div className="space-y-3">
          {insights.keyRecommendations.map((rec, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5 text-[#007AFF]" />
              </div>
              <p className="text-sm text-[#515154]">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
