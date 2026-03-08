import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserFromRequest } from "@/lib/auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientId = request.nextUrl.searchParams.get("clientId")
    const startDate = request.nextUrl.searchParams.get("startDate")
    const endDate = request.nextUrl.searchParams.get("endDate")

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate required" },
        { status: 400 }
      )
    }

    console.log("[v0] Fetching calendar posts:", { clientId, startDate, endDate })

    let query = supabase
      .from("scheduled_posts")
      .select("id, client_id, platforms, content, media_urls, scheduled_date, scheduled_time, status")
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate)
      .order("scheduled_date", { ascending: true })
      .order("scheduled_time", { ascending: true })

    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    const { data: posts, error } = await query

    if (error) {
      console.error("[v0] Error fetching calendar posts:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Calendar posts fetched:", posts?.length || 0)

    // Transform to match calendar component interface
    const transformedPosts = (posts || []).map((post) => {
      return {
        id: post.id,
        content: post.content,
        platforms: post.platforms || [],
        scheduled_date: post.scheduled_date,
        scheduled_time: post.scheduled_time,
        status: post.status,
        media_urls: post.media_urls || [],
      }
    })

    return NextResponse.json({ posts: transformedPosts })
  } catch (error) {
    console.error("[v0] Calendar fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch calendar posts" },
      { status: 500 }
    )
  }
}
