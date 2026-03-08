import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// POST - Create an activity log entry
export async function POST(request: NextRequest, { params }: { params: { taskId: string } }) {
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

    const body = await request.json()
    const { action_type, old_value, new_value, description } = body
    const taskId = params.taskId

    if (!action_type) {
      return NextResponse.json({ error: "action_type is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    console.log("[v0] Logging activity for task:", taskId, "action:", action_type)

    const { data: activity, error } = await supabase
      .from("task_activity")
      .insert({
        task_id: taskId,
        created_by: session.id,
        action_type,
        old_value: old_value || null,
        new_value: new_value || null,
        description: description || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating activity log:", error)
      return NextResponse.json({ error: "Failed to create activity log", details: error.message }, { status: 400 })
    }

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error("[v0] Error in activity log POST:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
