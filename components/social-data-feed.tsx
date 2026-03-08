"use client"

import { useState, useEffect } from "react"
import { FileText, TrendingUp, TrendingDown } from "lucide-react"
import type { SocialPost, ChannelPerformance } from "@/lib/types/social-media"

interface SocialDataFeedProps {
  clientId: string
  platform?: string
}

export function SocialDataFeed({ clientId, platform }: SocialDataFeedProps) {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [performance, setPerformance] = useState<ChannelPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadData()
  }, [clientId, platform])

  async function loadData() {
    setLoading(true)
    try {
      // TODO: Fetch from database instead of mock data
      // For now, using mock data
      setPosts(getMockPosts())
      setPerformance(getMockPerformance())
    } catch (error) {
      console.error("[v0] Error loading social data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function syncNow() {
    setSyncing(true)
    try {
      const response = await fetch("/api/social/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("[v0] Sync failed:", error)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-muted-foreground">Loading social data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sync Control */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Last synced: {new Date().toLocaleTimeString()}</p>
        <button
          onClick={syncNow}
          disabled={syncing}
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync now"}
        </button>
      </div>

      {/* Channel Performance Overview */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Channel Performance (Last 30 Days)</h3>
        <div className="space-y-2">
          {performance.map((channel) => (
            <div
              key={channel.platform}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium capitalize">{channel.platform}</div>
                  <div className="text-xs text-muted-foreground">
                    {channel.totalPosts.toLocaleString()} posts · {channel.avgEngagementRate}% avg engagement
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium">{channel.totalEngagement.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total engagement</div>
                </div>
                {channel.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : channel.trend === "down" ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : (
                  <div className="w-4 h-4" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Recent Posts ({posts.length})</h3>
        <div className="space-y-2">
          {posts.slice(0, 10).map((post) => (
            <div
              key={post.id}
              className="p-3 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium capitalize px-2 py-0.5 rounded bg-muted">{post.platform}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{post.contentText || "No caption"}</p>
                </div>
                {post.metrics && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div>
                      <div className="font-medium text-foreground">{post.metrics.engagement.toLocaleString()}</div>
                      <div>Engagement</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{post.metrics.reach.toLocaleString()}</div>
                      <div>Reach</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mock data for demonstration
function getMockPosts(): SocialPost[] {
  return [
    {
      id: "1",
      socialAccountId: "1",
      clientId: "client-1",
      platform: "instagram",
      postId: "ig-1",
      postType: "image",
      contentText: "Excited to share our latest product launch! 🚀",
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        impressions: 12500,
        reach: 9800,
        engagement: 1250,
        likes: 980,
        comments: 120,
        shares: 150,
        saves: 85,
        clicks: 320,
        videoViews: 0,
        engagementRate: 12.76,
        fetchedAt: new Date().toISOString(),
      },
    },
    {
      id: "2",
      socialAccountId: "2",
      clientId: "client-1",
      platform: "linkedin",
      postId: "li-1",
      postType: "text",
      contentText: "Thrilled to announce our partnership with industry leaders...",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        impressions: 8900,
        reach: 7200,
        engagement: 890,
        likes: 650,
        comments: 180,
        shares: 60,
        saves: 0,
        clicks: 280,
        videoViews: 0,
        engagementRate: 12.36,
        fetchedAt: new Date().toISOString(),
      },
    },
  ]
}

function getMockPerformance(): ChannelPerformance[] {
  return [
    {
      platform: "instagram",
      date: new Date().toISOString(),
      totalPosts: 24,
      totalImpressions: 156000,
      totalReach: 98000,
      totalEngagement: 18500,
      avgEngagementRate: 11.86,
      followersCount: 12400,
      followersChange: 320,
      trend: "up",
    },
    {
      platform: "linkedin",
      date: new Date().toISOString(),
      totalPosts: 18,
      totalImpressions: 89000,
      totalReach: 67000,
      totalEngagement: 9800,
      avgEngagementRate: 11.01,
      followersCount: 8900,
      followersChange: 180,
      trend: "up",
    },
    {
      platform: "facebook",
      date: new Date().toISOString(),
      totalPosts: 15,
      totalImpressions: 45000,
      totalReach: 32000,
      totalEngagement: 4200,
      avgEngagementRate: 9.33,
      followersCount: 15600,
      followersChange: -45,
      trend: "down",
    },
  ]
}
