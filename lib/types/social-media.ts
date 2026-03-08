// Social Media Data Types

export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "twitter" | "tiktok" | "youtube"

export type PostType = "image" | "video" | "carousel" | "text" | "reel" | "story"

export interface SocialAccount {
  id: string
  clientId: string
  platform: SocialPlatform
  accountName: string
  accountId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SocialPost {
  id: string
  socialAccountId: string
  clientId: string
  platform: SocialPlatform
  postId: string
  postType: PostType
  contentText?: string
  mediaUrl?: string
  permalink?: string
  publishedAt: string
  metrics?: PostMetrics
}

export interface PostMetrics {
  impressions: number
  reach: number
  engagement: number
  likes: number
  comments: number
  shares: number
  saves: number
  clicks: number
  videoViews: number
  engagementRate: number
  fetchedAt: string
}

export interface ChannelPerformance {
  platform: SocialPlatform
  date: string
  totalPosts: number
  totalImpressions: number
  totalReach: number
  totalEngagement: number
  avgEngagementRate: number
  followersCount: number
  followersChange: number
  trend: "up" | "down" | "stable"
}

export interface SocialMediaConfig {
  clientId: string
  accounts: {
    platform: SocialPlatform
    credentials: {
      accessToken?: string
      refreshToken?: string
      appId?: string
      appSecret?: string
    }
  }[]
}
