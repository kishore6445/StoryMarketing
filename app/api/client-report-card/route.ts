import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

  //  const clientId = request.nextUrl.searchParams.get("clientId")
    
    // if (!clientId) {
    //   return NextResponse.json({ error: "clientId is required" }, { status: 400 })
    // }

    // console.log("[v0] Fetching report card data for client:", clientId)




  //  let clientId = searchParams.get("clientId")



let clientIds: string[] = []

// For client role users, get all their associated client IDs
if (user.role === "client") {
  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", user.id)
  
  if (clientError || !clientData || clientData.length === 0) {
    return NextResponse.json({ 
      error: "No client accounts are associated with your user profile" 
    }, { status: 404 })
  }
  
  clientIds = clientData.map(c => c.id)
  console.log(`[v0] Client user has ${clientIds.length} associated clients`)
} else {
  // For admin/user roles, use the single clientId from query params
  const clientId = request.nextUrl.searchParams.get("clientId")
  if (!clientId) {
    return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
  }
  clientIds = [clientId]
}
  
     





    // Fetch campaigns for this client
    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("*")
      .in("client_id", clientIds)
      .order("created_at", { ascending: false })

    if (campaignsError) {
      console.error("[v0] Error fetching campaigns:", campaignsError)
    }

    // Fetch campaign metrics for these campaigns
    const campaignIds = campaigns?.map(c => c.id) || []
    let campaignMetrics = []
    if (campaignIds.length > 0) {
      const { data: metrics, error: metricsError } = await supabase
        .from("campaign_metrics")
        .select("*")
        .in("campaign_id", campaignIds)
        .order("date", { ascending: false })

      if (metricsError) {
        console.error("[v0] Error fetching campaign metrics:", metricsError)
      } else {
        campaignMetrics = metrics || []
      }
    }

    // Fetch scheduled posts for this client
    const { data: scheduledPosts, error: postsError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .in("client_id", clientIds)
      .order("scheduled_date", { ascending: false })
      // .limit(50)

    if (postsError) {
      console.error("[v0] Error fetching scheduled posts:", postsError)
    }

    // Calculate statistics
    const totalCampaigns = campaigns?.length || 0
    const activeCampaigns = campaigns?.filter(c => c.status === "active").length || 0
    const completedCampaigns = campaigns?.filter(c => c.status === "completed").length || 0
    
    // Calculate total metrics from campaign_metrics
    const totalImpressions = campaignMetrics.reduce((sum, m) => sum + (m.impressions || 0), 0)
    const totalReach = campaignMetrics.reduce((sum, m) => sum + (m.reach || 0), 0)
    const totalEngagement = campaignMetrics.reduce((sum, m) => sum + (m.engagement || 0), 0)
    const totalConversions = campaignMetrics.reduce((sum, m) => sum + (m.conversions || 0), 0)

    // Post statistics
    const totalPosts = scheduledPosts?.length || 0
    const publishedPosts = scheduledPosts?.filter(p => p.status === "published").length || 0
    const scheduledPostsCount = scheduledPosts?.filter(p => p.status === "scheduled").length || 0
    const failedPosts = scheduledPosts?.filter(p => p.status === "failed").length || 0

    // Group posts by platform
    const postsByPlatform: Record<string, number> = {}
    scheduledPosts?.forEach(post => {
      if (post.platforms && Array.isArray(post.platforms)) {
        post.platforms.forEach((platform: string) => {
          postsByPlatform[platform] = (postsByPlatform[platform] || 0) + 1
        })
      } else if (post.platform) {
        postsByPlatform[post.platform] = (postsByPlatform[post.platform] || 0) + 1
      }
    })

    // Calculate consistency (planned vs executed)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const postsThisMonth = scheduledPosts?.filter(p => {
      const postDate = new Date(p.scheduled_date)
      return postDate.getMonth() === currentMonth && postDate.getFullYear() === currentYear
    }) || []
    
    const plannedThisMonth = postsThisMonth.length
    const executedThisMonth = postsThisMonth.filter(p => p.status === "published").length
    const consistencyPercentage = plannedThisMonth > 0 ? Math.round((executedThisMonth / plannedThisMonth) * 100) : 0

    // Calculate platform-specific consistency
    const consistencyByPlatform: Record<string, { planned: number; executed: number; consistency: number }> = {}
    Object.keys(postsByPlatform).forEach(platform => {
      const platformPosts = postsThisMonth.filter(p => 
        (Array.isArray(p.platforms) && p.platforms.includes(platform)) || p.platform === platform
      )
      const planned = platformPosts.length
      const executed = platformPosts.filter(p => p.status === "published").length
      consistencyByPlatform[platform] = {
        planned,
        executed,
        consistency: planned > 0 ? Math.round((executed / planned) * 100) : 0
      }
    })

    // Top performing content - campaigns with highest conversions
    const topContent = campaigns
      ?.filter(c => c.status === "active" || c.status === "completed")
      ?.map(campaign => {
        // Get metrics for this campaign
        const metrics = campaignMetrics.filter(m => m.campaign_id === campaign.id)
        const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0)
        const totalImpressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0)
        const totalEngagement = metrics.reduce((sum, m) => sum + (m.engagement || 0), 0)
        const totalReach = metrics.reduce((sum, m) => sum + (m.reach || 0), 0)
        
        return {
          id: campaign.id,
          title: campaign.name,
          channel: campaign.platform || "multi-platform",
          type: "campaign",
          publishedDate: campaign.start_date,
          metrics: {
            views: totalImpressions,
            engagement: totalEngagement,
            shares: 0,
            comments: 0,
            leads: totalConversions,
          },
          conversions: totalConversions,
        }
      })
      ?.sort((a, b) => b.conversions - a.conversions)
      ?.slice(0, 5)
      ?.map(({ conversions, ...rest }) => rest) || []

    console.log("[v0] Report card summary:", {
      totalCampaigns,
      activeCampaigns,
      totalPosts,
      publishedPosts,
      consistencyPercentage
    })

    return NextResponse.json({
      summary: {
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        totalPosts,
        publishedPosts,
        scheduledPostsCount,
        failedPosts,
        consistencyPercentage,
      },
      metrics: {
        totalImpressions,
        totalReach,
        totalEngagement,
        totalConversions,
      },
      consistencyByPlatform,
      postsByPlatform,
      topContent,
      campaigns: campaigns || [],
      campaignMetrics: campaignMetrics,
      recentPosts: scheduledPosts?.slice(0, 10) || [],
    })

  } catch (error) {
    console.error("[v0] Report card fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch report card data" }, { status: 500 })
  }
}
