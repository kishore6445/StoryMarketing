import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only clients can access this endpoint
    if (user.role !== "client") {
      return NextResponse.json({ error: "Forbidden - Client access only" }, { status: 403 })
    }

    const supabase = getSupabaseAdminClient()

    // Get ALL client records associated with this user
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("id, name")
      .eq("user_id", user.id)

    if (clientError) {
      console.error("[v0] Error fetching clients:", clientError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!clientData || clientData.length === 0) {
      console.error("[v0] No clients found for user:", user.id)
      return NextResponse.json({ error: "No client accounts found" }, { status: 404 })
    }

    // Get all client IDs
    const clientIds = clientData.map(c => c.id)
    console.log("[v0] Fetching portal data for", clientData.length, "clients for user:", user.fullName)

    // Fetch all data in parallel for ALL client IDs
    const [powerMovesResult, meetingsResult, workflowStepsResult] = await Promise.all([
      // Power moves for all clients
      supabase
        .from("power_moves_tracking")
        .select("id, phase_id, power_move_text, completed, due_date, created_at, client_phases(phase_name)")
        .in("client_id", clientIds)
        .order("due_date", { ascending: true }),
      
      // Meetings for all clients
      supabase
        .from("meetings")
        .select(`
          id,
          title,
          date,
          time,
          status,
          summary,
          key_decisions,
          notes,
          client_id
        `)
        .eq("client_id", user.id)
        .order("date", { ascending: false }),
      
      // Workflow steps owned by this user
      supabase
        .from("workflow_steps")
        .select("id, workflow_id, step_number, title, description, owner_user_id, department")
        .eq("owner_user_id", user.id)
    ])

    // Fetch action items from meetings
    let actionItems = []
    if (meetingsResult.data && meetingsResult.data.length > 0) {
      const meetingIds = meetingsResult.data.map(m => m.id)
      const { data: actionItemsData } = await supabase
        .from("meeting_action_items")
        .select(`
          id,
          meeting_id,
          description,
          assigned_to,
          due_date,
          completed,
          meetings (title, date),
          users (full_name)
        `)
        .in("meeting_id", meetingIds)
        .order("due_date", { ascending: true })

      actionItems = actionItemsData || []
    }

    // Process power moves
    const powerMoves = (powerMovesResult.data || []).map(pm => ({
      id: pm.id,
      phase: pm.client_phases?.phase_name || "Unknown Phase",
      description: pm.power_move_text,
      completed: pm.completed,
      dueDate: pm.due_date,
      createdAt: pm.created_at
    }))

    // Process meetings
    const meetings = (meetingsResult.data || []).map(m => ({
      id: m.id,
      title: m.title,
      date: m.date,
      time: m.time,
      status: m.status,
      summary: m.summary,
      keyDecisions: m.key_decisions,
      notes: m.notes
    }))

    // Process action items
    const processedActionItems = actionItems.map(item => ({
      id: item.id,
      meetingId: item.meeting_id,
      meetingTitle: item.meetings?.title || "Untitled Meeting",
      meetingDate: item.meetings?.date,
      description: item.description,
      assignedTo: item.users?.full_name || "Unassigned",
      dueDate: item.due_date,
      completed: item.completed
    }))

    const workflowSteps = workflowStepsResult.data || []

    // Get all workflow IDs from steps assigned to current user
    const workflowIdsFromSteps = [...new Set(workflowSteps.map((ws) => ws.workflow_id).filter(Boolean))]
    
    // Fetch ALL workflow steps in these workflows (not just ones owned by current user)
    let allWorkflowStepsInWorkflows: any[] = []
    if (workflowIdsFromSteps.length > 0) {
      const { data } = await supabase
        .from("workflow_steps")
        .select("id, workflow_id, step_number, title, description, owner_user_id, department")
        .in("workflow_id", workflowIdsFromSteps)
      allWorkflowStepsInWorkflows = data || []
    }

    // Fetch workflow approvals for ALL steps in these workflows
    const allWorkflowStepIds = allWorkflowStepsInWorkflows.map((ws) => ws.id)
    let workflowApprovals: any[] = []
    if (allWorkflowStepIds.length > 0) {
      const { data } = await supabase
        .from("workflow_approvals")
        .select("step_id, status")
        .in("step_id", allWorkflowStepIds)
      workflowApprovals = data || []
    }

    const approvalMap: Record<string, string> = {}
    for (const approval of workflowApprovals) {
      approvalMap[approval.step_id] = approval.status
    }

    // Group ALL workflow steps by workflow_id to check dependencies
    const stepsByWorkflow: Record<string, any[]> = {}
    for (const ws of allWorkflowStepsInWorkflows) {
      if (!stepsByWorkflow[ws.workflow_id]) {
        stepsByWorkflow[ws.workflow_id] = []
      }
      stepsByWorkflow[ws.workflow_id].push(ws)
    }

    // Sort steps by step_number within each workflow
    for (const workflowId in stepsByWorkflow) {
      stepsByWorkflow[workflowId].sort((a, b) => a.step_number - b.step_number)
    }

    // Filter only current user's workflow steps: show if step 1 or previous step is approved
    const visibleWorkflowSteps = workflowSteps.filter((ws) => {
      if (ws.step_number === 1) {
        return true // Always show step 1
      }
      // For steps > 1, check if previous step is approved
      const workflowStepsForWorkflow = stepsByWorkflow[ws.workflow_id] || []
      const previousStep = workflowStepsForWorkflow.find((s) => s.step_number === ws.step_number - 1)
      if (!previousStep) {
        return false // No previous step found, hide this step
      }
      // Show this step only if previous step has an approved approval
      const previousApprovalStatus = approvalMap[previousStep.id]
      return previousApprovalStatus === "approved"
    })

    // Get workflow names
    const workflowIds = [...new Set(workflowSteps.map((ws) => ws.workflow_id).filter(Boolean))]
    let workflowsData: any[] = []
    if (workflowIds.length > 0) {
      const { data } = await supabase
        .from("workflows")
        .select("id, name")
        .in("id", workflowIds)
      workflowsData = data || []
    }

    const workflowMap: Record<string, string> = {}
    for (const w of workflowsData) {
      workflowMap[w.id] = w.name
    }

    // Process workflows by grouping visible steps by workflow_id
    const workflowsById: Record<string, any> = {}
    for (const ws of visibleWorkflowSteps) {
      if (!workflowsById[ws.workflow_id]) {
        workflowsById[ws.workflow_id] = {
          id: ws.workflow_id,
          name: workflowMap[ws.workflow_id] || "Unknown Workflow",
          status: "active",
          currentStep: null,
          totalSteps: stepsByWorkflow[ws.workflow_id]?.length || 0,
          completedSteps: stepsByWorkflow[ws.workflow_id]?.filter((s: any) => approvalMap[s.id] === "approved").length || 0
        }
      }
      
      // Set the current step (first visible step for this workflow)
      if (!workflowsById[ws.workflow_id].currentStep) {
        const approval = approvalMap[ws.id]
        workflowsById[ws.workflow_id].currentStep = {
          id: ws.id,
          stepNumber: ws.step_number,
          title: ws.title,
          description: ws.description,
          status: approval || "pending",
          owner: ws.owner_user_id,
          department: ws.department
        }
      }
    }

    const workflows = Object.values(workflowsById)

    console.log("[v0] Portal data fetched:", {
      powerMoves: powerMoves.length,
      meetings: meetings.length,
      actionItems: processedActionItems.length,
      workflows: workflows.length
    })

    return NextResponse.json({
      client: {
        id: clientData[0].id,
        name: user.fullName
      },
      powerMoves,
      meetings,
      actionItems: processedActionItems,
      workflows
    })

  } catch (error) {
    console.error("[v0] Error fetching client portal data:", error)
    return NextResponse.json({ error: "Failed to fetch portal data" }, { status: 500 })
  }
}
