import { type NextRequest, NextResponse } from "next/server"

// Cron job endpoint to sync all social media data
// Call this endpoint every 15-30 minutes to keep data fresh

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json()

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 })
    }

    console.log("[v0] Starting social media sync for client:", clientId)

    // TODO: Fetch all active social accounts for this client from database
    const platforms: string[] = ["facebook", "instagram", "linkedin", "twitter", "tiktok", "youtube"]

    const results = await Promise.allSettled(
      platforms.map(async (platform) => {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/social/${platform}/posts?clientId=${clientId}`,
          { method: "GET" },
        )

        if (!response.ok) {
          throw new Error(`Failed to sync ${platform}`)
        }

        return await response.json()
      }),
    )

    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    console.log("[v0] Sync complete:", { successful, failed })

    return NextResponse.json({
      success: true,
      synced: successful,
      failed,
      results,
    })
  } catch (error) {
    console.error("[v0] Sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}

// GET endpoint for manual trigger from UI
export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("clientId")

  if (!clientId) {
    return NextResponse.json({ error: "Client ID required" }, { status: 400 })
  }

  return POST(request)
}
