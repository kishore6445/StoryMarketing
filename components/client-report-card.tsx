"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Minus, Loader } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useClient } from "@/contexts/client-context"

interface ContentMetrics {
  id: string
  title: string
  channel: string
  type: string
  publishedDate: string
  metrics: {
    views: number
    engagement: number
    shares: number
    comments: number
    leads: number
  }
}

interface ConsistencyMetrics {
  platform: string
  planned: number
  executed: number
  consistency: number
}

interface ReportCardData {
  summary: {
    totalCampaigns: number
    activeCampaigns: number
    completedCampaigns: number
    totalPosts: number
    publishedPosts: number
    scheduledPostsCount: number
    failedPosts: number
    consistencyPercentage: number
  }
  metrics: {
    totalImpressions: number
    totalReach: number
    totalEngagement: number
    totalConversions: number
  }
  consistencyByPlatform: Record<string, { planned: number; executed: number; consistency: number }>
  postsByPlatform: Record<string, number>
  topContent: ContentMetrics[]
  campaigns: any[]
  recentPosts: any[]

  campaignMetrics: Array<{
  id: string
  campaign_id: string
  date: string
  impressions: number
  reach: number
  engagement: number
  conversions: number
  spend: number
}>
}

interface ReportCardProps {
  clientId?: string
}

export function ClientReportCard({ clientId: propClientId }: ReportCardProps) {
  const { user } = useAuth()
  const { selectedClientId } = useClient()
  const [effectiveClientId, setEffectiveClientId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportCardData | null>(null)
  const [error, setError] = useState("")

  // Determine which client to show based on user role
  useEffect(() => {
    const determineClientId = async () => {
      if (!user) {
        setEffectiveClientId(null)
        return
      }

      console.log("[v0] User role:", user.role, "User ID:", user.id)
      
      // If user is admin or user, use the selected client from top nav
      if (user.role === "admin" || user.role === "user") {
        const clientToUse = propClientId || selectedClientId
        console.log("[v0] Admin/User - using client:", clientToUse)
        setEffectiveClientId(clientToUse)
      } 
      // If user is client, fetch their associated client
      else if (user.role === "client") {
        try {
          const token = localStorage.getItem('sessionToken')
          const response = await fetch('/api/clients', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            // Find client where user_id matches the logged in user's id
            const userClient = data.clients?.find((c: any) => c.user_id === user.id)
            
            if (userClient) {
              console.log("[v0] Client user - showing data for client:", userClient.id, userClient.name)
              setEffectiveClientId(userClient.id)
            } else {
              console.log("[v0] No client found for user:", user.id)
              setEffectiveClientId(null)
            }
          }
        } catch (err) {
          console.error("[v0] Error fetching client for user:", err)
          setEffectiveClientId(null)
        }
      }
    }

    determineClientId()
  }, [user, propClientId, selectedClientId])

  useEffect(() => {
    if (!effectiveClientId) {
      console.log("[v0] No effective client ID, skipping data fetch")
      setLoading(false)
      return
    }

    const fetchReportData = async () => {
      console.log("[v0] Fetching report card data for client:", effectiveClientId)
      try {
        setLoading(true)
        setError("")

        const token = localStorage.getItem('sessionToken')
        const response = await fetch(`/api/client-report-card?clientId=${effectiveClientId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch report card data')
        }

        const data = await response.json()
        console.log("[v0] Report card data received:", data)
        setReportData(data)

      } catch (err) {
        console.error("[v0] Report card fetch error:", err)
        setError("Failed to load report card data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [effectiveClientId])

  const getChannelName = (channelId: string) => {
    const names: Record<string, string> = {
      linkedin: "LinkedIn",
      email: "Email",
      youtube: "YouTube",
      instagram: "Instagram",
      facebook: "Facebook",
      twitter: "Twitter",
      blogs: "Blogs",
      linkedin_posts: "LinkedIn Posts",
      videos_reels: "Videos/Reels",
      emails: "Emails",
    }
    return names[channelId] || channelId
  }

  // Transform consistency data for display
  const consistencyMetrics: ConsistencyMetrics[] = reportData 
    ? Object.entries(reportData.consistencyByPlatform).map(([platform, data]) => ({
        platform,
        planned: data.planned,
        executed: data.executed,
        consistency: data.consistency
      }))
    : []

  // Transform platform metrics for "channel performance"
  const platformMetrics = reportData
    ? Object.entries(reportData.postsByPlatform).map(([platform, count]) => {
        const consistency = reportData.consistencyByPlatform[platform]
        return {
          channel: platform,
          reach: count,
          engagement: consistency?.executed || 0,
          leads: 0,
          trend: (consistency?.consistency || 0) >= 90 ? ("up" as const) : (consistency?.consistency || 0) >= 75 ? ("stable" as const) : ("down" as const),
        }
      })
    : []

  if (!effectiveClientId && !loading) {
    return (
      <div className="bg-[#F5F5F7] border border-[#E5E5E7] rounded-lg p-6">
        <p className="text-sm text-[#86868B] font-medium">
          {user?.role === "client" 
            ? "No client account is associated with your user profile." 
            : "Please select a client from the top navigation to view their report card."}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#FFF0F0] border border-[#FFD6D6] rounded-lg p-6">
        <p className="text-sm text-[#C41C1C] font-medium">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[#1D1D1F] tracking-tight">Client Visibility Report Card</h1>
        <p className="text-sm text-[#86868B]">A clear view of consistency, performance, and learning</p>
      </div>

      {/* SECTION 1: CHANNEL PERFORMANCE */}
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-8">
        <h2 className="text-lg font-semibold text-[#1D1D1F] mb-6">Platform Activity</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-[#007AFF]" />
          </div>
        ) : platformMetrics.length === 0 ? (
          <p className="text-sm text-[#86868B] text-center py-4">No platform activity yet.</p>
        ) : (
          <div className="space-y-4">
            {platformMetrics.map((channel, idx) => (
              <div
                key={idx}
                className="p-5 border border-[#E5E5E7] rounded-lg hover:border-[#D1D1D6] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F5F7] text-sm font-semibold text-[#1D1D1F]">
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-semibold text-[#1D1D1F]">{getChannelName(channel.channel)}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {channel.trend === "up" && <TrendingUp className="w-5 h-5 text-[#34C759]" />}
                    {channel.trend === "down" && <TrendingDown className="w-5 h-5 text-[#FF3B30]" />}
                    {channel.trend === "stable" && <Minus className="w-5 h-5 text-[#86868B]" />}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-[#86868B] mb-1">Total Posts</p>
                    <p className="text-lg font-semibold text-[#1D1D1F]">{channel.reach}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#86868B] mb-1">Published</p>
                    <p className="text-lg font-semibold text-[#1D1D1F]">{channel.engagement}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#86868B] mb-1">Status</p>
                    <p className="text-lg font-semibold text-[#1D1D1F]">
                      {channel.trend === "up" ? "Good" : channel.trend === "stable" ? "OK" : "Low"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: TOP PERFORMING CONTENT */}
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-8">
        <h2 className="text-lg font-semibold text-[#1D1D1F] mb-6">Top Performing Content</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-[#007AFF]" />
          </div>
        ) : !reportData?.topContent || reportData.topContent.length === 0 ? (
          <p className="text-sm text-[#86868B] text-center py-4">No campaigns with performance data yet.</p>
        ) : (
          <div className="space-y-6">
            {reportData.topContent.map((item, idx) => (
              <div key={item.id} className="pb-6 border-b border-[#F5F5F7] last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xs font-medium text-[#86868B] uppercase tracking-wide">
                    #{idx + 1} CAMPAIGN
                  </h3>
                  <span className="text-xs px-2 py-1 bg-[#F5F5F7] rounded text-[#1D1D1F]">
                    {getChannelName(item.channel)}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#1D1D1F] mb-2">{item.title}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-[#007AFF] font-medium">{item.metrics.views.toLocaleString()} impressions</span>
                  <span className="text-[#34C759] font-medium">{item.metrics.engagement.toLocaleString()} engagement</span>
                  <span className="text-[#FF9500] font-medium">{item.metrics.leads} conversions</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: SUMMARY STATS */}
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-8">
        <h2 className="text-lg font-semibold text-[#1D1D1F] mb-6">Campaign & Post Summary</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-[#007AFF]" />
          </div>
        ) : reportData ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-[#86868B] mb-1">Total Campaigns</p>
              <p className="text-2xl font-semibold text-[#1D1D1F]">{reportData.summary.totalCampaigns}</p>
              <p className="text-xs text-[#34C759] mt-1">{reportData.summary.activeCampaigns} active</p>
            </div>
            <div>
              <p className="text-xs text-[#86868B] mb-1">Total Posts</p>
              <p className="text-2xl font-semibold text-[#1D1D1F]">{reportData.summary.totalPosts}</p>
              <p className="text-xs text-[#007AFF] mt-1">{reportData.summary.scheduledPostsCount} scheduled</p>
            </div>
            <div>
              <p className="text-xs text-[#86868B] mb-1">Published Posts</p>
              <p className="text-2xl font-semibold text-[#1D1D1F]">{reportData.summary.publishedPosts}</p>
              <p className="text-xs text-[#34C759] mt-1">Live content</p>
            </div>
            <div>
              <p className="text-xs text-[#86868B] mb-1">Consistency</p>
              <p className="text-2xl font-semibold text-[#1D1D1F]">{reportData.summary.consistencyPercentage}%</p>
              <p className="text-xs text-[#86868B] mt-1">This month</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#86868B] text-center py-4">No summary data available.</p>
        )}
      </div>


            {/* SECTION 4: INDIVIDUAL CAMPAIGN METRICS */}
      <div className="bg-white rounded-xl border border-[#E5E5E7] p-8">
        <h2 className="text-lg font-semibold text-[#1D1D1F] mb-6">Individual Campaign Metrics</h2>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-[#007AFF]" />
          </div>
        ) : !reportData?.campaigns || reportData.campaigns.length === 0 ? (
          <p className="text-sm text-[#86868B] text-center py-4">No campaigns available.</p>
        ) : (
          <div className="space-y-6">
            {reportData.campaigns.map((campaign) => {
              // Get metrics for this specific campaign
              const metrics = reportData.campaignMetrics?.filter(m => m.campaign_id === campaign.id) || []
              const totalImpressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0)
              const totalReach = metrics.reduce((sum, m) => sum + (m.reach || 0), 0)
              const totalEngagement = metrics.reduce((sum, m) => sum + (m.engagement || 0), 0)
              const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0)
              const totalSpend = metrics.reduce((sum, m) => sum + (m.spend || 0), 0)
              
              return (
                <div key={campaign.id} className="border border-[#E5E5E7] rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#1D1D1F] mb-1">{campaign.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          campaign.status === 'active' ? 'bg-[#E8F5E9] text-[#34C759]' :
                          campaign.status === 'completed' ? 'bg-[#F5F5F7] text-[#86868B]' :
                          'bg-[#FFF3E0] text-[#FF9500]'
                        }`}>
                          {campaign.status}
                        </span>
                        <span className="text-xs text-[#86868B]">
                          {getChannelName(campaign.platform || "multi-platform")}
                        </span>
                      </div>
                    </div>
                    {totalSpend > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-[#86868B]">Budget Spent</p>
                        <p className="text-lg font-semibold text-[#1D1D1F]">${totalSpend.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#F5F5F7] rounded-lg p-4">
                      <p className="text-xs text-[#86868B] mb-1">Impressions</p>
                      <p className="text-xl font-semibold text-[#1D1D1F]">{totalImpressions.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#F5F5F7] rounded-lg p-4">
                      <p className="text-xs text-[#86868B] mb-1">Reach</p>
                      <p className="text-xl font-semibold text-[#1D1D1F]">{totalReach.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#F5F5F7] rounded-lg p-4">
                      <p className="text-xs text-[#86868B] mb-1">Engagement</p>
                      <p className="text-xl font-semibold text-[#1D1D1F]">{totalEngagement.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#F5F5F7] rounded-lg p-4">
                      <p className="text-xs text-[#86868B] mb-1">Conversions</p>
                      <p className="text-xl font-semibold text-[#1D1D1F]">{totalConversions.toLocaleString()}</p>
                    </div>
                  </div>

                  {metrics.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[#E5E5E7]">
                      <p className="text-xs text-[#86868B] mb-2">{metrics.length} metric entries recorded</p>
                      <div className="text-xs text-[#86868B]">
                        Latest update: {new Date(metrics[0].date).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      
    </div>
  )
}
