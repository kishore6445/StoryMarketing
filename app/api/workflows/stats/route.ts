import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserFromRequest } from "@/lib/auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch workflow statistics
export async function GET(request: NextRequest) {
  try {
    console.log("[v0] /api/workflows/stats - Request received")
    const user = await getUserFromRequest(request)
    if (!user) {
      console.log("[v0] /api/workflows/stats - Unauthorized")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] /api/workflows/stats - User authenticated:", user.id)

    // Fetch all audit logs across all clients
    const { data: logs, error: logsError } = await supabase
      .from("workflow_audit_logs")
      .select("*")
      .order("timestamp", { ascending: false })

    if (logsError) {
      console.error("[v0] Error fetching audit logs:", logsError.message)
    }

    const auditLogs = logs || []
    console.log("[v0] /api/workflows/stats - Fetched audit logs count:", auditLogs.length)

    // Calculate stats
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const stats = {
      totalActions: auditLogs.length,
      tasksCompleted: auditLogs.filter((l) => l.action === "task_completed").length,
      approvalsAwaitingApproval: auditLogs.filter((l) => l.action === "approval_requested").length,
      phasesInReview: auditLogs.filter((l) => l.action === "phase_submit_review").length,
      blockedTasks: auditLogs.filter((l) => l.action === "task_blocked").length,
      activityLast24h: auditLogs.filter((l) => new Date(l.timestamp) > last24h).length,
      overdueApprovals: 0,
      escalatedApprovals: 0,
    }

    // Count overdue approvals from workflow_step_instances
    const { data: stepInstances } = await supabase
      .from("workflow_step_instances")
      .select("*")
      .eq("status", "pending")

    if (stepInstances) {
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
      stats.overdueApprovals = stepInstances.filter((step) => 
        step.started_at && new Date(step.started_at) < twoWeeksAgo
      ).length
    }

    console.log("[v0] /api/workflows/stats - Returning stats:", stats)
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("[v0] Workflow stats error:", error)
    return NextResponse.json({ error: "Failed to fetch workflow stats" }, { status: 500 })
  }
}
