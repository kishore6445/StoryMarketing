import { type NextRequest, NextResponse } from "next/server"

// API Route to fetch posts from a specific platform
// This will be called by a cron job or on-demand

export async function GET(request: NextRequest, { params }: { params: { platform: string } }) {
  const { platform } = params
  const clientId = request.nextUrl.searchParams.get("clientId")

  if (!clientId) {
    return NextResponse.json({ error: "Client ID required" }, { status: 400 })
  }

  try {
    // TODO: Fetch access token for this client's platform account from database
    // const account = await getClientSocialAccount(clientId, platform)

    let posts = []

    switch (platform) {
      case "facebook":
      case "instagram":
        posts = await fetchMetaPosts(clientId, platform)
        break
      case "linkedin":
        posts = await fetchLinkedInPosts(clientId)
        break
      case "twitter":
        posts = await fetchTwitterPosts(clientId)
        break
      case "tiktok":
        posts = await fetchTikTokPosts(clientId)
        break
      case "youtube":
        posts = await fetchYouTubePosts(clientId)
        break
      default:
        return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
    }

    // TODO: Store posts in database
    // await storePosts(posts)

    return NextResponse.json({ posts, count: posts.length })
  } catch (error) {
    console.error(`[v0] Error fetching ${platform} posts:`, error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}

// Meta (Facebook & Instagram) API Integration
async function fetchMetaPosts(clientId: string, platform: string) {
  // TODO: Replace with actual access token from database
  const accessToken = process.env.META_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error("Meta access token not configured")
  }

  const endpoint =
    platform === "instagram" ? "https://graph.facebook.com/v18.0/me/media" : "https://graph.facebook.com/v18.0/me/posts"

  const response = await fetch(
    `${endpoint}?fields=id,caption,media_type,media_url,permalink,timestamp,insights.metric(impressions,reach,engagement)&access_token=${accessToken}`,
  )

  if (!response.ok) {
    throw new Error(`Meta API error: ${response.statusText}`)
  }

  const data = await response.json()

  return (
    data.data?.map((post: any) => ({
      platform,
      postId: post.id,
      contentText: post.caption,
      mediaUrl: post.media_url,
      permalink: post.permalink,
      publishedAt: post.timestamp,
      postType: post.media_type?.toLowerCase(),
      metrics: {
        impressions: post.insights?.data?.find((m: any) => m.name === "impressions")?.values[0]?.value || 0,
        reach: post.insights?.data?.find((m: any) => m.name === "reach")?.values[0]?.value || 0,
        engagement: post.insights?.data?.find((m: any) => m.name === "engagement")?.values[0]?.value || 0,
      },
    })) || []
  )
}

// LinkedIn API Integration
async function fetchLinkedInPosts(clientId: string) {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error("LinkedIn access token not configured")
  }

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:person:PERSON_ID)", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
    },
  })

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.statusText}`)
  }

  const data = await response.json()

  // Transform LinkedIn data to our format
  return (
    data.elements?.map((post: any) => ({
      platform: "linkedin",
      postId: post.id,
      contentText: post.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary?.text,
      publishedAt: new Date(post.created?.time).toISOString(),
      // Note: LinkedIn metrics require separate API calls
    })) || []
  )
}

// Twitter/X API Integration
async function fetchTwitterPosts(clientId: string) {
  const bearerToken = process.env.TWITTER_BEARER_TOKEN

  if (!bearerToken) {
    throw new Error("Twitter bearer token not configured")
  }

  // Note: Twitter API v2 requires user ID
  const userId = "USER_ID" // TODO: Get from database

  const response = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,public_metrics&max_results=100`,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.statusText}`)
  }

  const data = await response.json()

  return (
    data.data?.map((tweet: any) => ({
      platform: "twitter",
      postId: tweet.id,
      contentText: tweet.text,
      publishedAt: tweet.created_at,
      postType: "text",
      metrics: {
        impressions: tweet.public_metrics?.impression_count || 0,
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0,
      },
    })) || []
  )
}

// TikTok API Integration
async function fetchTikTokPosts(clientId: string) {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN

  if (!accessToken) {
    throw new Error("TikTok access token not configured")
  }

  const response = await fetch(
    "https://open.tiktokapis.com/v2/video/list/?fields=id,create_time,cover_image_url,video_description,duration,like_count,comment_count,share_count,view_count",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ max_count: 100 }),
    },
  )

  if (!response.ok) {
    throw new Error(`TikTok API error: ${response.statusText}`)
  }

  const data = await response.json()

  return (
    data.data?.videos?.map((video: any) => ({
      platform: "tiktok",
      postId: video.id,
      contentText: video.video_description,
      mediaUrl: video.cover_image_url,
      publishedAt: new Date(video.create_time * 1000).toISOString(),
      postType: "video",
      metrics: {
        likes: video.like_count,
        comments: video.comment_count,
        shares: video.share_count,
        videoViews: video.view_count,
      },
    })) || []
  )
}

// YouTube API Integration
async function fetchYouTubePosts(clientId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    throw new Error("YouTube API key not configured")
  }

  // TODO: Get channel ID from database
  const channelId = "CHANNEL_ID"

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video&key=${apiKey}`,
  )

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`)
  }

  const data = await response.json()

  // Need separate call for video statistics
  const videoIds = data.items?.map((item: any) => item.id.videoId).join(",")

  const statsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`,
  )

  const stats = await statsResponse.json()

  return (
    data.items?.map((item: any, index: number) => ({
      platform: "youtube",
      postId: item.id.videoId,
      contentText: item.snippet.title + "\n" + item.snippet.description,
      mediaUrl: item.snippet.thumbnails.high.url,
      permalink: `https://youtube.com/watch?v=${item.id.videoId}`,
      publishedAt: item.snippet.publishedAt,
      postType: "video",
      metrics: {
        videoViews: Number.parseInt(stats.items?.[index]?.statistics?.viewCount || "0"),
        likes: Number.parseInt(stats.items?.[index]?.statistics?.likeCount || "0"),
        comments: Number.parseInt(stats.items?.[index]?.statistics?.commentCount || "0"),
      },
    })) || []
  )
}
