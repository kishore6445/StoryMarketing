import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// GET - Fetch a single task
export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
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

    const supabase: any = getSupabaseAdminClient()
    const { taskId: routeTaskId } = await params
    const taskId = decodeURIComponent(routeTaskId)
    
    console.log("[v0] Fetching task:", taskId)

    // First try UUID id lookup; if not found, fall back to business task_id.
    let { data: task, error }: { data: any; error: any } = await supabase
      .from("tasks")
      .select(`
        id,
        task_id,
        title,
        description,
        status,
        due_date,
        due_time,
        promised_date,
        promised_time,
        assigned_to,
        client_id,
        section_id,
        priority,
        phase,
        attachments,
        sprint_id,
        created_at,
        updated_at
      `)
      .eq("id", taskId)
      .maybeSingle()

    if (!task) {
      const fallbackResult = await supabase
        .from("tasks")
        .select(`
          id,
          task_id,
          title,
          description,
          status,
          due_date,
          due_time,
          promised_date,
          promised_time,
          assigned_to,
          client_id,
          section_id,
          priority,
          phase,
          attachments,
          sprint_id,
          created_at,
          updated_at
        `)
        .eq("task_id", taskId)
        .maybeSingle()

      task = fallbackResult.data
      error = fallbackResult.error
    }

    console.log("[v0] Task fetch result:", { task, error, taskId })

    if (error || !task) {
      console.log("[v0] Task not found error:", error)
      return NextResponse.json({ error: "Task not found_test", details: error?.message }, { status: 404 })
    }

    // Enrich task with assignee information
    let enrichedTask: any = task
    if (task.assigned_to) {
      const { data: assignee } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("id", task.assigned_to)
        .single()
      
      enrichedTask = {
        ...task,
        assignee: assignee || null
      }
    }

    return NextResponse.json(enrichedTask)
  } catch (error) {
    console.error("[v0] Error fetching task:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}

// PATCH - Update a task
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
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
    const supabase: any = getSupabaseAdminClient()
    const { taskId: routeTaskId } = await params
    const taskId = decodeURIComponent(routeTaskId)

    // Resolve route param to canonical UUID id (supports both id and task_id).
    let canonicalTaskId = taskId
    const { data: resolvedById }: { data: any } = await supabase
      .from("tasks")
      .select("id")
      .eq("id", taskId)
      .maybeSingle()

    if (resolvedById?.id) {
      canonicalTaskId = resolvedById.id
    } else {
      const { data: resolvedByBusinessId }: { data: any } = await supabase
        .from("tasks")
        .select("id")
        .eq("task_id", taskId)
        .maybeSingle()

      if (!resolvedByBusinessId?.id) {
        return NextResponse.json({ error: "Task not found", details: "No task exists for provided identifier" }, { status: 404 })
      }

      canonicalTaskId = resolvedByBusinessId.id
    }

    // Get current task to compare changes
    const { data: currentTask } = await supabase
      .from("tasks")
      .select("status, priority, phase, attachments")
      .eq("id", canonicalTaskId)
      .single()

    const normalizedIncomingAttachments = Array.isArray(body.attachments)
      ? body.attachments
          .filter((attachment: any) => Boolean(attachment?.url || attachment?.publicUrl || attachment?.fileUrl))
          .map((attachment: any) => ({
            name: attachment.name,
            url: attachment.url || attachment.publicUrl || attachment.fileUrl,
            size: attachment.size || 0,
            mimeType: attachment.mimeType || attachment.mime_type || null,
            uploadedAt: attachment.uploadedAt || new Date().toISOString(),
          }))
      : undefined

    const existingAttachments = Array.isArray(currentTask?.attachments) ? currentTask.attachments : []
    const mergedAttachments = normalizedIncomingAttachments
      ? [...existingAttachments, ...normalizedIncomingAttachments].filter((attachment, index, all) => {
          if (!attachment?.url) return false
          return all.findIndex((candidate) => candidate?.url === attachment.url) === index
        })
      : undefined

    const updatePayload = {
      ...body,
      ...(mergedAttachments ? { attachments: mergedAttachments } : {}),
      updated_at: new Date().toISOString(),
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .update(updatePayload)
      .eq("id", canonicalTaskId)
      .select()
      .single()

    if (error || !task) {
      return NextResponse.json({ error: "Failed to update task", details: error?.message }, { status: 400 })
    }

    // Log activity for significant changes
    if (currentTask) {
      if (currentTask.status !== body.status && body.status) {
        await supabase.from("task_activity").insert({
          task_id: canonicalTaskId,
          created_by: session.userId,
          action_type: "status_changed",
          old_value: currentTask.status,
          new_value: body.status,
          description: `Status changed from ${currentTask.status} to ${body.status}`
        })
      }
      if (currentTask.priority !== body.priority && body.priority) {
        await supabase.from("task_activity").insert({
          task_id: canonicalTaskId,
          created_by: session.userId,
          action_type: "priority_changed",
          old_value: currentTask.priority,
          new_value: body.priority,
          description: `Priority changed from ${currentTask.priority} to ${body.priority}`
        })
      }
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("[v0] Error updating task:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
