import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
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
    const { workflowStepId, status } = body

    if (!workflowStepId || !status) {
      return NextResponse.json({ error: "Missing workflowStepId or status" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Get the workflow step to find its workflow_id
    const { data: stepData, error: stepError } = await supabase
      .from("workflow_steps")
      .select("workflow_id")
      .eq("id", workflowStepId)
      .single()

    if (stepError || !stepData) {
      return NextResponse.json({ error: "Workflow step not found" }, { status: 404 })
    }

    const workflowId = stepData.workflow_id

    // Find or create a workflow instance for this workflow
    const { data: instances, error: instanceError } = await supabase
      .from("workflow_instances")
      .select("id")
      .eq("workflow_id", workflowId)
      .eq("status", "in_progress")
      .limit(1)

    let instanceId: string

    if (instances && instances.length > 0) {
      instanceId = instances[0].id
    } else {
      // Create a new workflow instance
      const { data: newInstance, error: createError } = await supabase
        .from("workflow_instances")
        .insert({
          workflow_id: workflowId,
          entity_type: "task",
          entity_id: workflowId,
          status: "in_progress",
          created_by: session.userId,
        })
        .select()
        .single()

      if (createError || !newInstance) {
        return NextResponse.json({ error: "Failed to create workflow instance" }, { status: 500 })
      }

      instanceId = newInstance.id
    }

    // Get workflow step details for audit log
    const { data: stepDetails } = await supabase
      .from("workflow_steps")
      .select("title, workflow_id")
      .eq("id", workflowStepId)
      .single()

    // Get workflow details for client_id
    const { data: workflowDetails } = await supabase
      .from("workflows")
      .select("name, client_id")
      .eq("id", workflowId)
      .single()

    // Create workflow approval record
    const { data: approvals, error } = await supabase
      .from("workflow_approvals")
      .insert({
        instance_id: instanceId,
        step_id: workflowStepId,
        status: status,
        approver_id: session.userId,
        decided_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("[v0] Error creating workflow approval:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create audit log entry
    if (stepDetails && workflowDetails) {
      await supabase
        .from("workflow_audit_logs")
        .insert({
          client_id: workflowDetails.client_id || null,
          action: status === "approved" ? "approval_granted" : status === "rejected" ? "approval_rejected" : "approval_requested",
          entity: {
            type: "workflow_step",
            id: workflowStepId,
            name: stepDetails.title,
          },
          changes: {
            from: { status: "pending" },
            to: { status: status },
          },
          performed_by: session.userEmail || session.userId,
          metadata: {
            workflow_id: workflowId,
            workflow_name: workflowDetails.name,
            instance_id: instanceId,
          },
        })
    }

    const approval = approvals && approvals.length > 0 ? approvals[0] : null
    return NextResponse.json({ success: true, approval })
  } catch (error) {
    console.error("[v0] Error in workflow approval:", error)
    return NextResponse.json({ error: "Failed to approve workflow step" }, { status: 500 })
  }
}
