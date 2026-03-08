import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json({ error: "clientId required" }, { status: 400 })
    }

    // TODO: When database is added:
    // Query the posts table for posts where client_id = clientId
    // Order by created_at DESC
    // Include engagement metrics (likes, comments, shares)
    // Include status (published, scheduled, failed, draft)

    const mockPosts = [
      {
        id: "post-1",
        clientId,
        title: "5 AI Trends to Watch in 2026",
        content: "Exploring the most impactful AI trends...",
        platforms: ["linkedin"],
        status: "published",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        engagement: {
          likes: 42,
          comments: 8,
          shares: 5,
          reach: 1250,
        },
      },
      {
        id: "post-2",
        clientId,
        title: "Q1 Marketing Strategy",
        content: "Our strategic approach for Q1...",
        platforms: ["linkedin", "twitter"],
        status: "scheduled",
        scheduleTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    return NextResponse.json({ posts: mockPosts })
  } catch (error) {
    console.error("[v0] Fetch posts error:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
  }
}
