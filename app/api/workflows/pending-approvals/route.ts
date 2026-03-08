import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserFromRequest } from "@/lib/auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch pending approvals
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientId = request.nextUrl.searchParams.get("clientId")

    // Fetch pending workflow step instances
    const { data: stepInstances, error } = await supabase
      .from("workflow_step_instances")
      .select(`
        *,
        workflow_steps!inner (
          title,
          owner_role
        ),
        workflow_instances!inner (
          entity_type,
          entity_id
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching pending approvals:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const now = new Date()
    const approvals = (stepInstances || []).map((instance: any) => {
      const createdAt = new Date(instance.created_at)
      const daysElapsed = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const timeoutDays = instance.timeout_days || 2
      const daysOverdue = Math.max(0, daysElapsed - timeoutDays)
      const isOverdue = daysElapsed > timeoutDays
      const escalationThreshold = timeoutDays + 1
      const isEscalating = daysElapsed >= escalationThreshold
      const daysUntilEscalation = Math.max(0, escalationThreshold - daysElapsed)

      return {
        id: instance.id,
        taskName: instance.workflow_steps?.title || "Unknown Task",
        submittedBy: instance.assigned_to || "Unknown",
        submittedAt: instance.created_at,
        daysOverdue,
        isOverdue,
        isEscalating,
        daysUntilEscalation,
        ownerRole: instance.workflow_steps?.owner_role || "",
        entityType: instance.workflow_instances?.entity_type || "",
        entityId: instance.workflow_instances?.entity_id || "",
      }
    })

    return NextResponse.json({ approvals })
  } catch (error) {
    console.error("[v0] Pending approvals fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch pending approvals" }, { status: 500 })
  }
}
