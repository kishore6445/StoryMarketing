import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// GET - Fetch all subtasks for a task
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

    const { data: subtasks, error } = await supabase
      .from("task_subtasks")
      .select(`
        id,
        task_id,
        title,
        status,
        assignee_id,
        due_date,
        completed_at,
        created_by,
        completed_by,
        created_at,
        updated_at
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching subtasks:", error)
      return NextResponse.json([])
    }

    // Enrich with user data
    let enrichedSubtasks = subtasks || []
    if (enrichedSubtasks.length > 0) {
      const userIds = [...new Set(enrichedSubtasks.map(s => s.assignee_id).filter(Boolean))]
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from("users")
          .select("id, full_name, email")
          .in("id", userIds)

        enrichedSubtasks = enrichedSubtasks.map(subtask => ({
          ...subtask,
          assignee: users?.find(u => u.id === subtask.assignee_id) || null
        }))
      }
    }

    return NextResponse.json(enrichedSubtasks)
  } catch (error) {
    console.error("[v0] Error in subtasks GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a subtask
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
    const { title, assignee_id, due_date } = body
    const taskId = params.taskId

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Subtask title is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: subtask, error } = await supabase
      .from("task_subtasks")
      .insert({
        task_id: taskId,
        title: title.trim(),
        status: "pending",
        assignee_id: assignee_id || null,
        due_date: due_date || null,
        created_by: session.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating subtask:", error)
      return NextResponse.json({ error: "Failed to create subtask", details: error.message }, { status: 400 })
    }

    // Log activity
    await supabase.from("task_activity").insert({
      task_id: taskId,
      created_by: session.id,
      action_type: "subtask_created",
      description: `Created subtask: ${title.trim()}`
    })

    return NextResponse.json(subtask, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating subtask:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
