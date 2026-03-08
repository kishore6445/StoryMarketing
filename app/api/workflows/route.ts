import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserFromRequest } from "@/lib/auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch all workflows with their steps
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const scope = request.nextUrl.searchParams.get("scope")
    const clientId = request.nextUrl.searchParams.get("clientId")
    const status = request.nextUrl.searchParams.get("status") || "active"

    let query = supabase
      .from("workflows")
      .select(`
        *,
        workflow_steps (*)
      `)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (scope) {
      query = query.eq("scope", scope)
    }

    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    const { data: workflows, error } = await query

    if (error) {
      console.error("[v0] Error fetching workflows:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Sort steps by step_number
    const workflowsWithSortedSteps = (workflows || []).map(workflow => ({
      ...workflow,
      workflow_steps: (workflow.workflow_steps || []).sort((a: { step_number: number }, b: { step_number: number }) => a.step_number - b.step_number)
    }))

    return NextResponse.json({ workflows: workflowsWithSortedSteps })
  } catch (error) {
    console.error("[v0] Workflows fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch workflows" }, { status: 500 })
  }
}

// POST - Create a new workflow with steps
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      description,
      scope = "global",
      departmentId,
      clientId,
      triggerAction = "phase_submit",
      requireAllApprovals = true,
      parallelApprovals = false,
      allowBypass = false,
      bypassRoles = [],
      status = "active",
      steps = [],
    } = body

    if (!name) {
      return NextResponse.json({ error: "Workflow name is required" }, { status: 400 })
    }

    // Create workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .insert({
        name,
        description,
        scope,
        department_id: departmentId || null,
        client_id: clientId || null,
        trigger_action: triggerAction,
        require_all_approvals: requireAllApprovals,
        parallel_approvals: parallelApprovals,
        allow_bypass: allowBypass,
        bypass_roles: bypassRoles,
        status,
        created_by: user.id,
      })
      .select()
      .single()

    if (workflowError) {
      console.error("[v0] Error creating workflow:", workflowError)
      return NextResponse.json({ error: workflowError.message }, { status: 500 })
    }

    // Create steps if provided
    if (steps.length > 0) {
      const stepsToInsert = steps.map((step: {
        stepNumber: number
        title: string
        description?: string
        ownerRole: string
        ownerUserId?: string
        department?: string
        sopLink?: string
        timeoutDays?: number
        canReject?: boolean
        canDelegate?: boolean
        requiredComments?: boolean
        notifyOnApproval?: boolean
        notifyOnRejection?: boolean
      }, index: number) => ({
        workflow_id: workflow.id,
        step_number: step.stepNumber || index + 1,
        title: step.title,
        description: step.description,
        owner_role: step.ownerRole || "manager",
        owner_user_id: step.ownerUserId || null,
        department: step.department,
        sop_link: step.sopLink,
        timeout_days: step.timeoutDays || 2,
        can_reject: step.canReject !== false,
        can_delegate: step.canDelegate !== false,
        required_comments: step.requiredComments || false,
        notify_on_approval: step.notifyOnApproval !== false,
        notify_on_rejection: step.notifyOnRejection !== false,
      }))

      const { error: stepsError } = await supabase
        .from("workflow_steps")
        .insert(stepsToInsert)

      if (stepsError) {
        console.error("[v0] Error creating workflow steps:", stepsError)
        // Rollback workflow creation
        await supabase.from("workflows").delete().eq("id", workflow.id)
        return NextResponse.json({ error: stepsError.message }, { status: 500 })
      }
    }

    // Fetch workflow with steps
    const { data: createdWorkflow } = await supabase
      .from("workflows")
      .select(`*, workflow_steps (*)`)
      .eq("id", workflow.id)
      .single()

    // Create audit log entry
    await supabase
      .from("workflow_audit_logs")
      .insert({
        client_id: clientId || null,
        action: "workflow_created",
        entity: {
          type: "workflow",
          id: workflow.id,
          name: name,
        },
        changes: {
          from: { status: null },
          to: { status: status },
        },
        performed_by: user.email || user.id,
        metadata: {
          scope,
          trigger_action: triggerAction,
          steps_count: steps.length,
        },
      })

    return NextResponse.json({ 
      success: true, 
      workflow: createdWorkflow 
    }, { status: 201 })
  } catch (error) {
    console.error("[v0] Workflow creation error:", error)
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 })
  }
}
