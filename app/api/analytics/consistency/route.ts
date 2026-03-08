import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId")
    const channel = request.nextUrl.searchParams.get("channel")

    if (!clientId || !channel) {
      return NextResponse.json({ error: "clientId and channel required" }, { status: 400 })
    }

    // TODO: When database is added:
    // 1. Query published_posts table filtered by channel
    // 2. Calculate planned vs executed posts
    // 3. For each channel, get last 30 days data
    // 4. Calculate consistency percentage

    const mockConsistency = [
      {
        channel: "blogs",
        planned: 4,
        executed: 4,
        consistency: 100,
        targets: { daily: 0.13, weekly: 1, monthly: 4 },
      },
      {
        channel: "linkedin_posts",
        planned: 12,
        executed: 10,
        consistency: 83,
        targets: { daily: 0.4, weekly: 3, monthly: 12 },
      },
      {
        channel: "videos_reels",
        planned: 6,
        executed: 5,
        consistency: 83,
        targets: { daily: 0.2, weekly: 1.5, monthly: 6 },
      },
      {
        channel: "emails",
        planned: 2,
        executed: 2,
        consistency: 100,
        targets: { daily: 0.07, weekly: 0.5, monthly: 2 },
      },
      {
        channel: "whatsapp",
        planned: 4,
        executed: 3,
        consistency: 75,
        targets: { daily: 0.13, weekly: 1, monthly: 4 },
      },
    ]

    const filtered = channel ? mockConsistency.filter((c) => c.channel === channel) : mockConsistency

    return NextResponse.json({
      clientId,
      channel,
      consistency: filtered,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Consistency analytics error:", error)
    return NextResponse.json({ error: "Failed to fetch consistency metrics" }, { status: 500 })
  }
}
