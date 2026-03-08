import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// PATCH - Update a subtask
export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string; subtaskId: string } }
) {
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
    const { title, status, assignee_id, due_date } = body
    const taskId = params.taskId
    const subtaskId = params.subtaskId

    const supabase = getSupabaseAdminClient()

    // Get current subtask to check old status
    const { data: currentSubtask } = await supabase
      .from("task_subtasks")
      .select("status")
      .eq("id", subtaskId)
      .single()

    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (status !== undefined) {
      updateData.status = status
      if (status === "done" && currentSubtask?.status !== "done") {
        updateData.completed_at = new Date().toISOString()
        updateData.completed_by = session.id
      }
    }
    if (assignee_id !== undefined) updateData.assignee_id = assignee_id
    if (due_date !== undefined) updateData.due_date = due_date
    updateData.updated_at = new Date().toISOString()

    const { data: subtask, error } = await supabase
      .from("task_subtasks")
      .update(updateData)
      .eq("id", subtaskId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating subtask:", error)
      return NextResponse.json({ error: "Failed to update subtask" }, { status: 400 })
    }

    // Log activity for status changes
    if (status && status !== currentSubtask?.status) {
      await supabase.from("task_activity").insert({
        task_id: taskId,
        created_by: session.id,
        action_type: "subtask_updated",
        old_value: currentSubtask?.status,
        new_value: status,
        description: `Updated subtask status to ${status}`
      })
    }

    return NextResponse.json(subtask)
  } catch (error) {
    console.error("[v0] Error updating subtask:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a subtask
export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string; subtaskId: string } }
) {
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
    const subtaskId = params.subtaskId

    // Get subtask title for activity log
    const { data: subtask } = await supabase
      .from("task_subtasks")
      .select("title")
      .eq("id", subtaskId)
      .single()

    const { error } = await supabase
      .from("task_subtasks")
      .delete()
      .eq("id", subtaskId)

    if (error) {
      console.error("[v0] Error deleting subtask:", error)
      return NextResponse.json({ error: "Failed to delete subtask" }, { status: 400 })
    }

    // Log activity
    await supabase.from("task_activity").insert({
      task_id: taskId,
      created_by: session.id,
      action_type: "subtask_deleted",
      description: `Deleted subtask: ${subtask?.title}`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting subtask:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
