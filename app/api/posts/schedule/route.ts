import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserFromRequest } from "@/lib/auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ScheduleRequest {
  clientId?: string
  platforms: string[]
  content: string
  scheduledDate: string
  scheduledTime: string
  media?: string[]
  status?: "draft" | "scheduled"
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: ScheduleRequest = await request.json()
    const { clientId, platforms, content, scheduledDate, scheduledTime, media, status } = body

    if (!platforms.length || !content.trim() || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: "Missing required fields: platforms, content, scheduledDate, scheduledTime" },
        { status: 400 }
      )
    }

    // Validate schedule time is in the future (only for scheduled posts)
    const scheduleDateTimeStr = `${scheduledDate}T${scheduledTime}`
    const scheduleDateTime = new Date(scheduleDateTimeStr)
    
    if (status !== "draft" && scheduleDateTime <= new Date()) {
      return NextResponse.json(
        { error: "Schedule time must be in the future" },
        { status: 400 }
      )
    }

    console.log("[v0] Scheduling post for:", scheduleDateTimeStr)

    // Combine date and time into scheduled_for timestamp
    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()

    // Insert into database - Note: schema supports single platform per post
    // For multiple platforms, create separate post records
    const platform = platforms[0] // Use first platform for now
    
    const { data: scheduledPost, error: insertError } = await supabase
      .from("scheduled_posts")
      .insert({
        client_id: clientId || null,
        social_account_id: null, // Will be set when social accounts are connected
        platforms: platforms,
        content: content,
        media_urls: media || [],
       // scheduled_time: scheduledFor,
       scheduled_date: scheduledDate,
       scheduled_time: scheduledTime,
        status: status || "scheduled",
        user_id: user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Error inserting scheduled post:", insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    console.log("[v0] Post scheduled successfully:", scheduledPost.id)

    // Trigger calendar refresh
    console.log("[v0] Post created, calendar should refresh automatically via SWR")

    return NextResponse.json(
      {
        success: true,
        postId: scheduledPost.id,
        message: `Post ${status === 'draft' ? 'saved as draft' : 'scheduled'} for ${scheduleDateTimeStr}`,
        post: scheduledPost,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[v0] Schedule error:", error)
    return NextResponse.json({ error: "Failed to schedule post" }, { status: 500 })
  }
}
