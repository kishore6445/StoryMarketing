import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    console.log("[v0] /api/team/analytics - Fetching team members...")

    // Get all users (team members)
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, email")

    console.log("[v0] /api/team/analytics - Users fetched:", users?.length || 0, "error:", usersError)

    if (usersError) {
      console.error("[v0] Error fetching team members:", usersError)
      return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 })
    }

    if (!users || users.length === 0) {
      console.log("[v0] /api/team/analytics - No users found, returning empty array")
      return NextResponse.json({ teamMembers: [] })
    }

    // Get task data for each team member
    const teamAnalytics = await Promise.all(
      (users || []).map(async (user) => {
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("id, task_id, title, status, due_date, client_id")
          .eq("assigned_to", user.id)
          .order("due_date", { ascending: true })

        console.log(`[v0] /api/team/analytics - Tasks for ${user.full_name}:`, tasks?.length || 0, "error:", tasksError)

        if (tasksError) {
          console.error(`[v0] Error fetching tasks for ${user.id}:`, tasksError)
          return {
            id: user.id,
            full_name: user.full_name,
            email: user.email || "",
            tasksAssigned: [],
            taskStats: {
              total: 0,
              completed: 0,
              inProgress: 0,
              overdue: 0,
            },
            pkrPercentage: 0,
          }
        }

        const tasksArray = tasks || []
        const completed = tasksArray.filter((t) => t.status === "done").length
        const inProgress = tasksArray.filter((t) => t.status === "in_progress").length
        const overdue = tasksArray.filter((t) => {
          if (t.status === "done") return false
          if (!t.due_date) return false
          return new Date(t.due_date) < new Date()
        }).length

        const pkrPercentage = tasksArray.length > 0 ? Math.round((completed / tasksArray.length) * 100) : 0

        // Map tasks with fetched task_id
        const tasksWithIds = tasksArray.map((task) => ({
          id: task.id,
          title: task.title,
          status: task.status,
          due_date: task.due_date,
          task_id: task.task_id,
        }))

        return {
          id: user.id,
          full_name: user.full_name,
          email: user.email || "",
          tasksAssigned: tasksWithIds,
          taskStats: {
            total: tasksArray.length,
            completed,
            inProgress,
            overdue,
          },
          pkrPercentage,
        }
      })
    )

    console.log("[v0] /api/team/analytics - Returning data with", teamAnalytics.length, "team members")
    return NextResponse.json({ teamMembers: teamAnalytics })
  } catch (error) {
    console.error("[v0] Error fetching team analytics:", error)
    return NextResponse.json({ error: "Failed to fetch team analytics" }, { status: 500 })
  }
}
