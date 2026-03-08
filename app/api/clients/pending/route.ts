import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Validate session
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      console.error("[v0] /api/clients/pending - No session token provided")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      console.error("[v0] /api/clients/pending - Invalid session token")
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    console.log("[v0] /api/clients/pending - Session valid, fetching data")
    const supabase = getSupabaseAdminClient()
    
    // Get all clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (clientsError) {
      console.error("[v0] Error fetching clients:", clientsError)
      return NextResponse.json({ error: "Failed to fetch clients", details: clientsError }, { status: 500 })
    }

    console.log("[v0] /api/clients/pending - Fetched clients:", clients?.length || 0)

    // Get all tasks with their status and due dates
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')

    if (tasksError) {
      console.error("[v0] Error fetching tasks:", tasksError)
      return NextResponse.json({ error: "Failed to fetch tasks", details: tasksError }, { status: 500 })
    }

    console.log("[v0] /api/clients/pending - Fetched tasks:", tasks?.length || 0)

    // Get current phases for each client
    const { data: clientPhases, error: phasesError } = await supabase
      .from('client_phases')
      .select('client_id, phase_name, status')

    if (phasesError) {
      console.error("[v0] Error fetching phases:", phasesError)
      return NextResponse.json({ error: "Failed to fetch phases", details: phasesError }, { status: 500 })
    }

    console.log("[v0] /api/clients/pending - Fetched phases:", clientPhases?.length || 0)

    // Build client overview with pending tasks
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    console.log("[v0] Building client pending data, clients count:", clients?.length || 0)
    
    if (!Array.isArray(clients)) {
      console.error("[v0] Clients is not an array:", typeof clients)
      return NextResponse.json({ error: "Invalid clients data", clients: clients }, { status: 500 })
    }

    if (!Array.isArray(tasks)) {
      console.error("[v0] Tasks is not an array:", typeof tasks)
      return NextResponse.json({ error: "Invalid tasks data", tasks: tasks }, { status: 500 })
    }

    const clientPendingData = clients.map((client: any) => {
      try {
        console.log("[v0] Processing client:", client.id, client.name)
        
        if (!client.id) {
          console.error("[v0] Client missing id:", client)
          return {
            clientId: "unknown",
            clientName: client.name || "Unknown",
            pendingTaskCount: 0,
            overdueTasks: 0,
            tasksDueToday: 0,
            currentPhase: 'Not Started',
            lastActivity: new Date().toISOString(),
          }
        }

        // Get tasks for this client
        const clientTasks = tasks.filter((task: any) => task.client_id === client.id)
        console.log("[v0] Client", client.id, 'has', clientTasks.length, 'tasks')
        
        // Count pending tasks (not completed)
        const pendingTasks = clientTasks.filter((task: any) => !task.completed)
        const pendingTaskCount = pendingTasks.length

        // Count overdue tasks (due date is before today and not completed)
        const overdueTasks = pendingTasks.filter((task: any) => {
          if (!task.due_date) return false
          try {
            const dueDate = new Date(task.due_date)
            dueDate.setHours(0, 0, 0, 0)
            return dueDate < today && !task.completed
          } catch (e) {
            console.error("[v0] Error parsing due date:", task.due_date, e)
            return false
          }
        })
        const overdueTasks_count = overdueTasks.length

        // Count tasks due today
        const tasksDueToday = pendingTasks.filter((task: any) => {
          if (!task.due_date) return false
          try {
            const dueDate = new Date(task.due_date)
            dueDate.setHours(0, 0, 0, 0)
            return dueDate.getTime() === today.getTime()
          } catch (e) {
            console.error("[v0] Error parsing due date:", task.due_date, e)
            return false
          }
        }).length

        // Get current phase
        const phases = (Array.isArray(clientPhases) ? clientPhases : [])?.filter((p: any) => p && p.client_id === client.id) || []
        const currentPhase = phases?.find((p: any) => p?.status === 'in_progress')?.phase_name || 
                            phases?.[0]?.phase_name || 
                            'Not Started'

        return {
          clientId: client.id,
          clientName: client.name || 'Unnamed Client',
          pendingTaskCount,
          overdueTasks: overdueTasks_count,
          tasksDueToday,
          currentPhase,
          lastActivity: client.updated_at || client.created_at || new Date().toISOString(),
        }
      } catch (clientError) {
        console.error("[v0] Error processing client:", client, clientError instanceof Error ? clientError.message : String(clientError))
        return {
          clientId: client?.id || 'unknown',
          clientName: client?.name || 'Error Loading',
          pendingTaskCount: 0,
          overdueTasks: 0,
          tasksDueToday: 0,
          currentPhase: 'Not Started',
          lastActivity: new Date().toISOString(),
        }
      }
    })

    // Filter to only clients with pending work
    const clientsWithPendingWork = clientPendingData.filter(
      (client) => client.pendingTaskCount > 0 || client.overdueTasks > 0
    )

    return NextResponse.json({ 
      clients: clientsWithPendingWork.length > 0 ? clientsWithPendingWork : clientPendingData 
    })
  } catch (error) {
    console.error("[v0] Error in /api/clients/pending:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Failed to fetch client pending status", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
