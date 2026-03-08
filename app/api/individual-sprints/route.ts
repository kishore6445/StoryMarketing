import { NextResponse } from "next/server"
import { validateSession } from "@/lib/auth"
import { getSupabaseAdminClient } from "@/lib/db"

// Get current user's individual sprint for this month (auto-create if needed)
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const session = await validateSession(token)
    if (!session?.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

    // Try to get existing individual sprint (don't use .single() to avoid 406 error on empty result)
    const { data: existingSprints, error: fetchError } = await supabase
      .from("individual_sprints")
      .select("*")
      .eq("user_id", session.userId)
      .eq("year_month", yearMonth)

    if (fetchError) {
      console.error("[v0] Error fetching individual sprint:", fetchError)
      return NextResponse.json({ error: "Failed to fetch sprint" }, { status: 500 })
    }

    // If exists, return it with associated tasks
    if (existingSprints && existingSprints.length > 0) {
      const existingSprint = existingSprints[0]
      const { data: tasks } = await supabase
        .from("individual_sprint_tasks")
        .select("task_id")
        .eq("individual_sprint_id", existingSprint.id)

      return NextResponse.json({
        ...existingSprint,
        tasks: tasks || [],
      })
    }

    // Auto-create new monthly sprint for this user
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const { data: newSprint, error: createError } = await supabase
      .from("individual_sprints")
      .insert({
        user_id: session.userId,
        year_month: yearMonth,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      })
      .select()
      .single()

    if (createError || !newSprint) {
      console.error("[v0] Error creating individual sprint:", createError)
      return NextResponse.json({ error: "Failed to create sprint" }, { status: 500 })
    }

    return NextResponse.json({
      ...newSprint,
      tasks: [],
    })
  } catch (err) {
    console.error("[v0] Error fetching individual sprint:", err)
    return NextResponse.json({ error: "Failed to fetch sprint" }, { status: 500 })
  }
}

// Add task to individual sprint
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const session = await validateSession(token)
    if (!session?.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { taskId } = await request.json()
    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

    // Get or create individual sprint
    let { data: sprint } = await supabase
      .from("individual_sprints")
      .select("id")
      .eq("user_id", session.userId)
      .eq("year_month", yearMonth)
      .single()

    if (!sprint) {
      const { data: newSprint } = await supabase
        .from("individual_sprints")
        .insert({
          user_id: session.userId,
          year_month: yearMonth,
          month_name: new Date(now.getFullYear(), now.getMonth()).toLocaleString("en-US", {
            month: "long",
            year: "numeric",
          }),
        })
        .select()
        .single()
      sprint = newSprint
    }

    // Add task to sprint
    const { data: taskLink, error } = await supabase
      .from("individual_sprint_tasks")
      .insert({
        individual_sprint_id: sprint.id,
        task_id: taskId,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding task to sprint:", error)
      return NextResponse.json({ error: "Failed to add task" }, { status: 500 })
    }

    return NextResponse.json(taskLink)
  } catch (err) {
    console.error("[v0] Error adding task to individual sprint:", err)
    return NextResponse.json({ error: "Failed to add task" }, { status: 500 })
  }
}

// Remove task from individual sprint
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const session = await validateSession(token)
    if (!session?.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { taskId } = await request.json()
    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

    // Get individual sprint
    const { data: sprint } = await supabase
      .from("individual_sprints")
      .select("id")
      .eq("user_id", session.userId)
      .eq("year_month", yearMonth)
      .single()

    if (!sprint) {
      return NextResponse.json({ error: "Sprint not found" }, { status: 404 })
    }

    // Remove task from sprint
    const { error } = await supabase
      .from("individual_sprint_tasks")
      .delete()
      .eq("individual_sprint_id", sprint.id)
      .eq("task_id", taskId)

    if (error) {
      console.error("[v0] Error removing task from sprint:", error)
      return NextResponse.json({ error: "Failed to remove task" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] Error removing task from individual sprint:", err)
    return NextResponse.json({ error: "Failed to remove task" }, { status: 500 })
  }
}
