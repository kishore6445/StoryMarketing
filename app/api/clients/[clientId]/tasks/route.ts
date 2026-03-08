import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params

  try {
    // Validate session using the custom auth validation
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session || !clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Get all tasks for this client that are not done
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("id, title, description, status, due_date, client_id, section_id")
      .eq("client_id", clientId)
      .neq("status", "done")
      .order("due_date", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching tasks:", error)
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
    }

    // Transform to match frontend interface
    const formattedTasks = (tasks || []).map((task: any) => ({
      id: task.id,
      title: task.title,
      priority: "medium", // Default priority since tasks table doesn't have priority column
      phaseName: task.section_id || "General",
      dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : "Not set",
      completed: task.status === "done",
    }))

    return NextResponse.json({ tasks: formattedTasks })
  } catch (error) {
    console.error("[v0] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
