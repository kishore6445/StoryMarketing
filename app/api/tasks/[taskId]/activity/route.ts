import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// GET - Fetch activity log for a task
export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    const sessionToken = authHeader?.replace("Bearer ", "") || request.cookies.get("session")?.value
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const taskId = params.taskId

    console.log("[v0] Fetching activity for task:", taskId)

    const { data: activities, error } = await supabase
      .from("task_activity")
      .select(`
        id,
        task_id,
        created_by,
        action_type,
        old_value,
        new_value,
        description,
        created_at
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching activities:", error)
      return NextResponse.json([])
    }

    // Enrich activities with user data
    let enrichedActivities = activities || []
    if (enrichedActivities.length > 0) {
      const userIds = [...new Set(enrichedActivities.map(a => a.created_by))]
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", userIds)

      enrichedActivities = enrichedActivities.map(activity => ({
        ...activity,
        actor: users?.find(u => u.id === activity.created_by) || { id: activity.created_by, full_name: "Unknown", email: "" }
      }))
    }

    return NextResponse.json(enrichedActivities)
  } catch (error) {
    console.error("[v0] Error in activities GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
