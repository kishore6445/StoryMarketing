import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserFromRequest } from "@/lib/auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch a single workflow with steps
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const { data: workflow, error } = await supabase
      .from("workflows")
      .select(`*, workflow_steps (*)`)
      .eq("id", id)
      .single()

    if (error) {
      console.error("[v0] Error fetching workflow:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    // Sort steps by step_number
    workflow.workflow_steps = (workflow.workflow_steps || []).sort(
      (a: { step_number: number }, b: { step_number: number }) => a.step_number - b.step_number
    )

    return NextResponse.json({ workflow })
  } catch (error) {
    console.error("[v0] Workflow fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch workflow" }, { status: 500 })
  }
}

// PATCH - Update a workflow and its steps
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      scope,
      departmentId,
      clientId,
      triggerAction,
      requireAllApprovals,
      parallelApprovals,
      allowBypass,
      bypassRoles,
      status,
      steps,
    } = body

    // Build update object
    const updates: Record<string, unknown> = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (scope !== undefined) updates.scope = scope
    if (departmentId !== undefined) updates.department_id = departmentId
    if (clientId !== undefined) updates.client_id = clientId
    if (triggerAction !== undefined) updates.trigger_action = triggerAction
    if (requireAllApprovals !== undefined) updates.require_all_approvals = requireAllApprovals
    if (parallelApprovals !== undefined) updates.parallel_approvals = parallelApprovals
    if (allowBypass !== undefined) updates.allow_bypass = allowBypass
    if (bypassRoles !== undefined) updates.bypass_roles = bypassRoles
    if (status !== undefined) updates.status = status

    // Update workflow
    const { error: workflowError } = await supabase
      .from("workflows")
      .update(updates)
      .eq("id", id)

    if (workflowError) {
      console.error("[v0] Error updating workflow:", workflowError)
      return NextResponse.json({ error: workflowError.message }, { status: 500 })
    }

    // Update steps if provided
    if (steps !== undefined) {
      // Delete existing steps
      await supabase.from("workflow_steps").delete().eq("workflow_id", id)

      // Insert new steps
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
          workflow_id: id,
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
          console.error("[v0] Error updating workflow steps:", stepsError)
          return NextResponse.json({ error: stepsError.message }, { status: 500 })
        }
      }
    }

    // Fetch updated workflow with steps
    const { data: updatedWorkflow } = await supabase
      .from("workflows")
      .select(`*, workflow_steps (*)`)
      .eq("id", id)
      .single()

    // Create audit log entry
    await supabase
      .from("workflow_audit_logs")
      .insert({
        client_id: clientId || updatedWorkflow?.client_id || null,
        action: "workflow_updated",
        entity: {
          type: "workflow",
          id: id,
          name: name || updatedWorkflow?.name,
        },
        changes: {
          from: { status: status === undefined ? updatedWorkflow?.status : "unknown" },
          to: { status: status || updatedWorkflow?.status },
        },
        performed_by: user.email || user.id,
        metadata: {
          updated_fields: Object.keys(updates),
          steps_updated: steps !== undefined,
        },
      })

    return NextResponse.json({ success: true, workflow: updatedWorkflow })
  } catch (error) {
    console.error("[v0] Workflow update error:", error)
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 })
  }
}

// DELETE - Delete a workflow
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get workflow details before deletion for audit log
    const { data: workflowToDelete } = await supabase
      .from("workflows")
      .select("name, client_id, status")
      .eq("id", id)
      .single()

    // Steps will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from("workflows")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[v0] Error deleting workflow:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create audit log entry
    if (workflowToDelete) {
      await supabase
        .from("workflow_audit_logs")
        .insert({
          client_id: workflowToDelete.client_id || null,
          action: "workflow_deleted",
          entity: {
            type: "workflow",
            id: id,
            name: workflowToDelete.name,
          },
          changes: {
            from: { status: workflowToDelete.status },
            to: { status: "deleted" },
          },
          performed_by: user.email || user.id,
          metadata: {},
        })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Workflow deletion error:", error)
    return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 })
  }
}
