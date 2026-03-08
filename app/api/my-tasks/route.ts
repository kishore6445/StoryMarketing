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
    const userRole = (session as any).role || 'user'
    const isAdmin = userRole === 'admin' || userRole === 'manager'
    const supabase = getSupabaseAdminClient()

    try {
      // First, fetch user's phase assignments and resolve to actual client_phases UUIDs
      const { data: phaseAssignments, error: phaseAssignmentsError } = await supabase
        .from("user_phase_assignments")
        .select("client_id, phase_id")
        .eq("user_id", userId)
      
      if (phaseAssignmentsError) {
        console.error("[v0] Error fetching phase assignments:", phaseAssignmentsError)
        // Continue without phase assignments rather than failing completely
      }
      
      // Get the actual client_phases UUIDs that match the user's assignments
      let assignedPhaseUUIDs: string[] = []
      if (phaseAssignments && phaseAssignments.length > 0) {
        const clientIds = [...new Set(phaseAssignments.map(pa => pa.client_id))]
        const phaseNames = [...new Set(phaseAssignments.map(pa => pa.phase_id))]
        
        const { data: clientPhases, error: clientPhasesError } = await supabase
          .from("client_phases")
          .select("id, client_id, phase_name")
          .in("client_id", clientIds)
          .in("phase_name", phaseNames)
        
        if (clientPhasesError) {
          console.error("[v0] Error fetching client phases:", clientPhasesError)
        } else if (clientPhases) {
          // Create lookup for assigned combinations
          const assignedCombos = new Set(
            phaseAssignments.map(pa => `${pa.client_id}-${pa.phase_id}`)
          )
          
          // Filter client_phases to only those that match user assignments
          assignedPhaseUUIDs = clientPhases
            .filter(cp => assignedCombos.has(`${cp.client_id}-${cp.phase_name}`))
            .map(cp => cp.id)
        }
      }

      // Fetch tasks - admins/managers see all tasks, others see only assigned tasks.
      let tasksQuery = supabase
        .from("tasks")
        .select(`
          id,
          task_id,
          title,
          description,
          status,
          due_date,
          due_time,
          promised_date,
          promised_time,
          assigned_to,
          client_id,
          section_id,
          priority,
          phase,
          sprint_id
        `)
        .order("due_date", { ascending: true })

      if (!isAdmin) {
        tasksQuery = tasksQuery.eq("assigned_to", userId)
      }

      const tasksResult = await tasksQuery

      // Fetch other data in parallel
      const [powerMovesResult, workflowStepsResult, meetingActionItemsResult] = await Promise.all([
        // Power moves - admins see all, others see only assigned/created
        isAdmin
          ? supabase
              .from("power_moves_tracking")
              .select("id, client_id, phase_id, power_move_text, completed, assigned_to, created_by, due_date, created_at")
              .order("due_date", { ascending: true })
          : supabase
              .from("power_moves_tracking")
              .select("id, client_id, phase_id, power_move_text, completed, assigned_to, created_by, due_date, created_at")
              .or(`assigned_to.eq.${userId},created_by.eq.${userId}`)
              .order("due_date", { ascending: true }),
        
        // Workflow steps - admins see all, others see only owned
        isAdmin
          ? supabase
              .from("workflow_steps")
              .select("id, workflow_id, step_number, title, description, owner_user_id, department, sop_link, timeout_days")
          : supabase
              .from("workflow_steps")
              .select("id, workflow_id, step_number, title, description, owner_user_id, department, sop_link, timeout_days")
              .eq("owner_user_id", userId),

        // Fetch meeting action items - admins see all, others see only assigned
        isAdmin
          ? supabase
              .from("meeting_action_items")
              .select("id, meeting_id, description, assigned_to, due_date, completed, created_at")
              .order("due_date", { ascending: true })
          : supabase
              .from("meeting_action_items")
              .select("id, meeting_id, description, assigned_to, due_date, completed, created_at")
              .eq("assigned_to", userId)
              .order("due_date", { ascending: true }),
      ])

      if (tasksResult.error) {
        console.error("[v0] Error fetching tasks:", tasksResult.error)
        return NextResponse.json({ error: "Failed to fetch tasks", details: tasksResult.error.message }, { status: 500 })
      }

      if (powerMovesResult.error) {
        console.error("[v0] Error fetching power moves:", powerMovesResult.error)
      }

      if (workflowStepsResult.error) {
        console.error("[v0] Error fetching workflow steps:", workflowStepsResult.error)
      }

      if (meetingActionItemsResult.error) {
        console.error("[v0] Error fetching meeting action items:", meetingActionItemsResult.error)
      }

      // Filter power moves based on user's assigned phase UUIDs
      let filteredPowerMoves = powerMovesResult.data || []
      if (assignedPhaseUUIDs.length > 0) {
        // Only show power moves from assigned phase UUIDs
        const assignedPhaseSet = new Set(assignedPhaseUUIDs)
        filteredPowerMoves = filteredPowerMoves.filter(pm => assignedPhaseSet.has(pm.phase_id))
      }

      const allTasks = tasksResult.data || []
      const powerMoves = filteredPowerMoves
      const workflowSteps = workflowStepsResult.data || []
      const meetingActionItems = meetingActionItemsResult.data || []

      // Get all workflow IDs from steps assigned to current user
      const workflowIdsFromSteps = [...new Set(workflowSteps.map((ws) => ws.workflow_id).filter(Boolean))]
      
      // Fetch ALL workflow steps in these workflows (not just ones owned by current user)
      let allWorkflowStepsInWorkflows: any[] = []
      if (workflowIdsFromSteps.length > 0) {
        const { data, error } = await supabase
          .from("workflow_steps")
          .select("id, workflow_id, step_number, title, description, owner_user_id, department, sop_link, timeout_days")
          .in("workflow_id", workflowIdsFromSteps)
        
        if (error) {
          console.error("[v0] Error fetching all workflow steps:", error)
        } else {
          allWorkflowStepsInWorkflows = data || []
        }
      }

      // Fetch workflow approvals for ALL steps in these workflows
      const allWorkflowStepIds = allWorkflowStepsInWorkflows.map((ws) => ws.id)
      let workflowApprovals: any[] = []
      if (allWorkflowStepIds.length > 0) {
        const { data, error } = await supabase
          .from("workflow_approvals")
          .select("step_id, status")
          .in("step_id", allWorkflowStepIds)
        
        if (error) {
          console.error("[v0] Error fetching workflow approvals:", error)
        } else {
          workflowApprovals = data || []
        }
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

      // Get section IDs to look up phase info
      const sectionIds = [...new Set(allTasks.map((t) => t.section_id).filter(Boolean))]
      const clientIds = [...new Set(allTasks.map((t) => t.client_id).filter(Boolean))]

      // Fetch sections & phases in parallel with error handling
      const [sectionsResult, clientsResult, usersResult] = await Promise.all([
        sectionIds.length > 0
          ? supabase
              .from("phase_sections")
              .select("id, section_name, client_phase_id")
              .in("id", sectionIds)
          : { data: [], error: null },
        clientIds.length > 0
          ? supabase
              .from("clients")
              .select("id, name")
              .in("id", clientIds)
          : { data: [], error: null },
        supabase
          .from("users")
          .select("id, full_name")
          .eq("id", userId),
      ])

      if (sectionsResult.error) {
        console.error("[v0] Error fetching sections:", sectionsResult.error)
      }

      if (clientsResult.error) {
        console.error("[v0] Error fetching clients:", clientsResult.error)
      }

      if (usersResult.error) {
        console.error("[v0] Error fetching current user:", usersResult.error)
      }

      const sections = sectionsResult.data || []
      const clients = clientsResult.data || []
      const currentUser = usersResult.data?.[0]

      // Fetch phase info from sections
      const phaseIds = [...new Set(sections.map((s) => s.client_phase_id).filter(Boolean))]
      let phases: any[] = []
      if (phaseIds.length > 0) {
        const { data, error } = await supabase
          .from("client_phases")
          .select("id, phase_name")
          .in("id", phaseIds)
        
        if (error) {
          console.error("[v0] Error fetching phases:", error)
        } else {
          phases = data || []
        }
      }

      // Build lookup maps
      const sectionMap: Record<string, { name: string; phaseId: string }> = {}
      for (const s of sections) {
        sectionMap[s.id] = { name: s.section_name, phaseId: s.client_phase_id }
      }

      const phaseMap: Record<string, string> = {}
      for (const p of phases) {
        phaseMap[p.id] = p.phase_name
      }

      const clientMap: Record<string, string> = {}
      for (const c of clients) {
        clientMap[c.id] = c.name
      }

      // Get phase names for power moves
      const powerMovePhaseIds = [...new Set(powerMoves.map((pm) => pm.phase_id).filter(Boolean))]
      let powerMovePhases: any[] = []
      if (powerMovePhaseIds.length > 0) {
        const { data, error } = await supabase
          .from("client_phases")
          .select("id, phase_name")
          .in("id", powerMovePhaseIds)
        
        if (error) {
          console.error("[v0] Error fetching power move phases:", error)
        } else {
          powerMovePhases = data || []
        }
      }

      const powerMovePhaseMap: Record<string, string> = {}
      for (const p of powerMovePhases) {
        powerMovePhaseMap[p.id] = p.phase_name
      }

      // Get workflow names for workflow steps
      const workflowIds = [...new Set(workflowSteps.map((ws) => ws.workflow_id).filter(Boolean))]
      let workflows: any[] = []
      if (workflowIds.length > 0) {
        const { data, error } = await supabase
          .from("workflows")
          .select("id, name")
          .in("id", workflowIds)
        
        if (error) {
          console.error("[v0] Error fetching workflows:", error)
        } else {
          workflows = data || []
        }
      }

      const workflowMap: Record<string, string> = {}
      for (const w of workflows) {
        workflowMap[w.id] = w.name
      }

      // Transform tasks with enriched data
      const enrichedTasks = allTasks.map((task: any) => {
        const section = sectionMap[task.section_id] || { name: "Unknown", phaseId: "" }
        let phaseName = "Backlog" // Default to Backlog instead of Unknown Phase
        
        // Try to get phase from section first
        if (section.phaseId) {
          phaseName = phaseMap[section.phaseId] || "Backlog"
        }
        // If task has phase column (after migration), use that
        if (task.phase) {
          phaseName = task.phase
        }
        
        const clientName = clientMap[task.client_id] || "Unknown Client"

        return {
          id: task.id,
          taskId: task.task_id,
          title: task.title,
          description: task.description || "", // keep description so UI can show/edit it
          completed: task.status === "done",
          clientName,
          clientId: task.client_id,
          phaseName,
          phaseId: task.phase,
          sprintId: task.sprint_id,
          sectionName: section.name || "General",
          dueDate: task.due_date || "",
          dueTime: task.due_time || "",
          promisedDate: task.promised_date || "",
          promisedTime: task.promised_time || "",
          assignedTo: task.assigned_to || "",
          // Use actual priority from database, fallback to calculated priority
          priority: (task.priority as "low" | "medium" | "high") || determinePriority(task.due_date, task.status),
          owner: currentUser?.full_name || "Me",
          status: task.status,
          type: "task" as const,
        }
      })

      // Transform power moves
      const enrichedPowerMoves = powerMoves.map((pm) => ({
        id: pm.id,
        title: pm.power_move_text,
        completed: pm.completed || false,
        clientName: clientMap[pm.client_id] || "Unknown Client",
        phaseName: powerMovePhaseMap[pm.phase_id] || "Unknown Phase",
        sectionName: "Power Move",
        dueDate: pm.due_date || "",
        priority: determinePriority(pm.due_date, pm.completed ? "done" : "pending"),
        owner: currentUser?.full_name || "Me",
        status: pm.completed ? "done" : "pending",
        type: "power_move" as const,
      }))

      // Transform workflow steps
      const enrichedWorkflowSteps = visibleWorkflowSteps.map((ws) => {
        const approval = approvalMap[ws.id]
        const completed = approval === "approved"
        
        return {
          id: ws.id,
          title: ws.title,
          completed,
          clientName: "Workflow",
          phaseName: workflowMap[ws.workflow_id] || "Unknown Workflow",
          sectionName: `Step ${ws.step_number}`,
          dueDate: "",
          priority: "medium" as const,
          owner: currentUser?.full_name || "Me",
          status: approval || "pending",
          type: "workflow_step" as const,
          sopLink: ws.sop_link,
          department: ws.department,
        }
      })

      // Transform meeting action items
      const enrichedMeetingActionItems = meetingActionItems.map((item) => ({
        id: item.id,
        title: item.description,
        completed: item.completed || false,
        clientName: "Meeting",
        phaseName: "Action Item",
        sectionName: "From Meeting",
        dueDate: item.due_date || "",
        priority: determinePriority(item.due_date, item.completed ? "done" : "pending"),
        owner: currentUser?.full_name || "Me",
        status: item.completed ? "done" : "pending",
        type: "meeting_action_item" as const,
      }))

      // Combine all items
      const allItems = [...enrichedTasks, ...enrichedPowerMoves, ...enrichedWorkflowSteps, ...enrichedMeetingActionItems]

      return NextResponse.json({ tasks: allItems })
    } catch (supabaseError) {
      console.error("[v0] Supabase error:", supabaseError)
      return NextResponse.json({ error: "Database error", details: String(supabaseError) }, { status: 500 })
    }
  } catch (error) {
    console.error("[v0] Error fetching my tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks", details: String(error) }, { status: 500 })
  }
}

function determinePriority(dueDate: string | null, status: string): "low" | "medium" | "high" {
  if (!dueDate) return "low"
  const today = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000)

  if (status === "done") return "low"
  if (diffDays < 0) return "high" // overdue
  if (diffDays <= 2) return "high" // due very soon
  if (diffDays <= 7) return "medium"
  return "low"
}
