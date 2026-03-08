// Analytics and insights generation utilities
// These will power the Report Card and Dashboard insights

interface ChannelAnalytics {
  channel: string
  reach: number
  engagement: number
  leads: number
  trend: "up" | "down" | "stable"
  previousMetrics?: {
    reach: number
    engagement: number
    leads: number
  }
}

interface ContentPerformance {
  title: string
  channel: string
  views: number
  engagement: number
  leads: number
  shareCount: number
}

interface ConsistencyScore {
  channel: string
  planned: number
  executed: number
  consistency: number
}

// Calculate trending direction
export function calculateTrend(
  current: number,
  previous: number
): "up" | "down" | "stable" {
  const percentChange = ((current - previous) / previous) * 100

  if (percentChange > 5) return "up"
  if (percentChange < -5) return "down"
  return "stable"
}

// Rank channels by performance metric
export function rankChannels(
  channels: ChannelAnalytics[],
  metric: "reach" | "engagement" | "leads" = "reach"
): ChannelAnalytics[] {
  return [...channels].sort((a, b) => b[metric] - a[metric])
}

// Calculate overall consistency score
export function calculateOverallConsistency(
  consistency: ConsistencyScore[]
): number {
  if (consistency.length === 0) return 0
  const total = consistency.reduce((sum, c) => sum + c.consistency, 0)
  return Math.round(total / consistency.length)
}

// Identify top performing content
export function identifyTopContent(
  content: ContentPerformance[],
  limit: number = 3
): ContentPerformance[] {
  return [...content]
    .sort((a, b) => {
      // Weighted scoring: views (40%) + engagement (40%) + leads (20%)
      const scoreA = a.views * 0.4 + a.engagement * 0.4 + a.leads * 0.2
      const scoreB = b.views * 0.4 + b.engagement * 0.4 + b.leads * 0.2
      return scoreB - scoreA
    })
    .slice(0, limit)
}

// Generate actionable insights
export function generateInsights(
  channels: ChannelAnalytics[],
  content: ContentPerformance[]
): {
  topPerformer: string
  underperformer: string
  recommendations: string[]
} {
  const ranked = rankChannels(channels, "engagement")
  const topPerformer = ranked[0]?.channel || "N/A"
  const underperformer = ranked[ranked.length - 1]?.channel || "N/A"

  const recommendations: string[] = []

  // Find channels with upward trends
  const growingChannels = channels.filter((c) => c.trend === "up")
  if (growingChannels.length > 0) {
    recommendations.push(
      `Increase content frequency on ${growingChannels.map((c) => c.channel).join(", ")} - these channels show growth`
    )
  }

  // Find content themes
  const topContentChannels = identifyTopContent(content)
    .map((c) => c.channel)
    .filter((v, i, a) => a.indexOf(v) === i)
  if (topContentChannels.length > 0) {
    recommendations.push(
      `Replicate top-performing content format/topics from ${topContentChannels.join(", ")}`
    )
  }

  // Consistency recommendations
  const lowConsistency = channels.filter((c) => {
    const consistency = ((c.leads) / (c.leads + 1)) * 100
    return consistency < 75
  })
  if (lowConsistency.length > 0) {
    recommendations.push(
      `Improve consistency on ${lowConsistency.map((c) => c.channel).join(", ")} to improve results`
    )
  }

  return {
    topPerformer,
    underperformer,
    recommendations,
  }
}

// Calculate engagement rate trend
export function calculateEngagementTrend(
  current: ChannelAnalytics,
  previousEngagement: number
): number {
  if (previousEngagement === 0) return 0
  return ((current.engagement - previousEngagement) / previousEngagement) * 100
}

// Get channel recommendations based on ROI
export function getChannelRecommendations(
  channels: ChannelAnalytics[]
): Array<{
  channel: string
  recommendation: "increase" | "maintain" | "decrease"
  reason: string
}> {
  return channels.map((c) => {
    if (c.engagement > 10 && c.leads > 5) {
      return {
        channel: c.channel,
        recommendation: "increase",
        reason: `High engagement (${c.engagement}%) and good lead conversion (${c.leads} leads)`,
      }
    }

    if (c.engagement < 2 || c.leads === 0) {
      return {
        channel: c.channel,
        recommendation: "decrease",
        reason: "Low engagement and minimal lead generation",
      }
    }

    return {
      channel: c.channel,
      recommendation: "maintain",
      reason: "Stable performance with moderate results",
    }
  })
}

// Calculate ROI by channel
export function calculateChannelROI(
  channel: ChannelAnalytics,
  costPerContent: number = 100
): {
  channel: string
  roi: number
  costPerLead: number
} {
  const costPerLead = channel.leads > 0 ? costPerContent / channel.leads : Infinity

  return {
    channel: channel.channel,
    roi: channel.leads > 0 ? ((channel.reach * channel.engagement) / 100 / costPerContent) * 100 : 0,
    costPerLead,
  }
}
