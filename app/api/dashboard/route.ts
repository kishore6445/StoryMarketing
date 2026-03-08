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

    const userId = session.userId
    const supabase = getSupabaseAdminClient()

    // Fetch all data in parallel
    const [
      clientsResult,
      tasksResult,
      workflowStepsResult,
      activityResult,
      phaseStrategyResult,
      teamResult,
    ] = await Promise.all([
      // 1. Clients
      supabase
        .from("clients")
        .select("id, name, description, brand_color, is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),

      // 2. Tasks assigned to current user
      supabase
        .from("tasks")
        .select("id, title, description, status, due_date, assigned_to, client_id, section_id")
        .eq("assigned_to", userId)
        .order("due_date", { ascending: true }),

      // 3. Workflow steps where current user is the owner
      supabase
        .from("workflow_steps")
        .select("id, workflow_id, step_number, title, description, owner_role, owner_user_id, department, sop_link, timeout_days")
        .eq("owner_user_id", userId),

      // 4. Recent activity
      supabase
        .from("activity_log")
        .select("id, client_id, user_id, action, entity_type, entity_id, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(10),

      // 5. Phase strategies (power moves from all 7 phases)
      supabase
        .from("phase_strategy")
        .select("id, client_phase_id, victory_target, power_moves, created_at"),

      // 6. Team members count
      supabase
        .from("users")
        .select("id")
        .eq("is_active", true),
    ])

    // Fetch client_phases for progress
    const clientIds = (clientsResult.data || []).map((c) => c.id)
    let phasesResult = { data: [] as any[], error: null }
    if (clientIds.length > 0) {
      phasesResult = await supabase
        .from("client_phases")
        .select("id, client_id, phase_name, phase_order, status")
        .in("client_id", clientIds)
        .order("phase_order", { ascending: true })
    }

    // Fetch users for activity log names
    const activityUserIds = [...new Set((activityResult.data || []).map((a) => a.user_id).filter(Boolean))]
    let activityUsersResult = { data: [] as any[], error: null }
    if (activityUserIds.length > 0) {
      activityUsersResult = await supabase
        .from("users")
        .select("id, full_name")
        .in("id", activityUserIds)
    }

    // Build user map for activity
    const userMap: Record<string, string> = {}
    for (const u of activityUsersResult.data || []) {
      userMap[u.id] = u.full_name || "Unknown"
    }

    // Build client map
    const clientMap: Record<string, string> = {}
    for (const c of clientsResult.data || []) {
      clientMap[c.id] = c.name
    }

    // Calculate tasks stats
    const allTasks = tasksResult.data || []
    const today = new Date().toISOString().split("T")[0]
    const tasksDueToday = allTasks.filter((t) => t.due_date === today && t.status !== "done")
    const overdueTasks = allTasks.filter((t) => t.due_date && t.due_date < today && t.status !== "done")
    const pendingTasks = allTasks.filter((t) => t.status !== "done")

    // Build phase progress per client
    const phases = phasesResult.data || []
    const clientPhaseProgress: Record<string, any[]> = {}
    for (const phase of phases) {
      if (!clientPhaseProgress[phase.client_id]) {
        clientPhaseProgress[phase.client_id] = []
      }
      clientPhaseProgress[phase.client_id].push({
        id: phase.id,
        name: phase.phase_name,
        order: phase.phase_order,
        status: phase.status,
      })
    }

    // Transform activity
    const activity = (activityResult.data || []).map((a) => ({
      id: a.id,
      actor: userMap[a.user_id] || "System",
      action: a.action.replace(/_/g, " "),
      target: a.entity_type || "",
      time: getRelativeTime(a.created_at),
      clientName: clientMap[a.client_id] || "",
    }))

    // Get power moves from all phases
    const powerMoves = (phaseStrategyResult.data || []).flatMap((ps) => {
      return (ps.power_moves || []).map((move: string) => ({
        id: ps.id,
        move,
        victoryTarget: ps.victory_target,
      }))
    })

    // Get workflow tasks for current user
    const workflowTasks = (workflowStepsResult.data || []).map((step) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      role: step.owner_role,
      department: step.department,
      sopLink: step.sop_link,
      workflowId: step.workflow_id,
      stepNumber: step.step_number,
    }))

    return NextResponse.json({
      clients: (clientsResult.data || []).map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        brandColor: c.brand_color || "#0071E3",
        is_active: c.is_active,
        phases: clientPhaseProgress[c.id] || [],
      })),
      tasks: {
        all: allTasks,
        dueToday: tasksDueToday,
        overdue: overdueTasks,
        pending: pendingTasks,
      },
      workflowTasks,
      activity,
      powerMoves,
      teamCount: (teamResult.data || []).length,
      phaseProgress: clientPhaseProgress,
    })
  } catch (error) {
    console.error("[v0] Dashboard fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

function getRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
