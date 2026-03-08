import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// Helper function to generate task_id for a task
async function generateTaskId(task: any, supabase: any) {
  if (!task.client_id) return null
  
  // Get client name
  const { data: clientData } = await supabase
    .from('clients')
    .select('name')
    .eq('id', task.client_id)
    .single()
  
  if (!clientData) return null
  
  const clientPrefix = clientData.name.substring(0, 3).toUpperCase()
  
  // Determine sprint number - default to 1 if no sprint
  let sprintNumber = '1'
  if (task.sprint_id) {
    // Extract number from sprint (or use 1 as default)
    sprintNumber = task.sprint_id.substring(0, 1)
  }
  
  // Count this task's position among tasks with same client and sprint
  let countQuery = supabase
    .from('tasks')
    .select('id', { count: 'exact' })
    .eq('client_id', task.client_id)
  
  // Use .is() for null checks instead of .eq()
  if (task.sprint_id) {
    countQuery = countQuery.eq('sprint_id', task.sprint_id)
  } else {
    countQuery = countQuery.is('sprint_id', null)
  }
  
  countQuery = countQuery.lt('created_at', task.created_at)
  const { count } = await countQuery
  
  const taskNumber = String((count || 0) + 1).padStart(3, '0')
  return `${clientPrefix}-SP${sprintNumber}-${taskNumber}`
}

// GET - Fetch tasks for a section
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const url = new URL(request.url)
    const sectionId = url.searchParams.get('sectionId')
    const clientId = url.searchParams.get('clientId')

    if (!sectionId && !clientId) {
      return NextResponse.json({ error: "Section ID or Client ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (sectionId) {
      query = query.eq('section_id', sectionId)
    } else if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error("[v0] Error fetching tasks:", error)
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
    }

    // Generate task_id for each task
    const tasksWithIds = await Promise.all(
      (tasks || []).map(async (task) => {
        const taskId = await generateTaskId(task, supabase)
        return { ...task, task_id: taskId }
      })
    )

    return NextResponse.json({ tasks: tasksWithIds || [] })
  } catch (error) {
    console.error("[v0] Error fetching tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    let body: any
    
    // Handle both JSON and FormData
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      body = {
        sectionId: formData.get('sectionId'),
        clientId: formData.get('clientId'),
        title: formData.get('title'),
        description: formData.get('description'),
        assignedTo: formData.get('assignedTo'),
        assigneeId: formData.get('assigneeId'),
        status: formData.get('status'),
        dueDate: formData.get('dueDate'),
        dueTime: formData.get('dueTime'),
        promisedDate: formData.get('promisedDate'),
        promisedTime: formData.get('promisedTime'),
        sprintId: formData.get('sprintId'),
        priority: formData.get('priority'),
        phaseId: formData.get('phaseId'),
        phase: formData.get('phase'),
      }
    } else {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    const { 
      sectionId, 
      clientId, 
      title, 
      description, 
      attachments,
      assignedTo, 
      assigneeId, 
      status, 
      dueDate, 
      dueTime, 
      promisedDate,
      promisedTime,
      sprintId, 
      priority, 
      phaseId, 
      phase 
    } = body

    if (!clientId || !title) {
      return NextResponse.json({ error: "Missing required fields (clientId and title)" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    
    // Get client name for task_id generation
    const { data: clientData } = await supabase
      .from('clients')
      .select('name')
      .eq('id', clientId)
      .single()
    
    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Generate task_id: CLIENT3-SP#-###
    const clientPrefix = clientData.name.substring(0, 3).toUpperCase()
    const sprintNumber = sprintId ? sprintId.substring(0, 1) : '1' // Simplified: use first char of sprint ID
    
    // Count existing tasks for this sprint to generate sequential number
    let countQuery = supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .eq('client_id', clientId)
    
    // Use .is() for null checks instead of .eq()
    if (sprintId) {
      countQuery = countQuery.eq('sprint_id', sprintId)
    } else {
      countQuery = countQuery.is('sprint_id', null)
    }
    
    const { count } = await countQuery
    
    const taskNumber = String((count || 0) + 1).padStart(3, '0')
    const taskId = `${clientPrefix}-SP${sprintNumber}-${taskNumber}`
    
    const safeAttachments = Array.isArray(attachments)
      ? attachments
          .filter((attachment: any) => Boolean(attachment?.url || attachment?.publicUrl || attachment?.fileUrl))
          .map((attachment: any) => ({
            name: attachment.name,
            url: attachment.url || attachment.publicUrl || attachment.fileUrl,
            size: attachment.size || 0,
            mimeType: attachment.mimeType || null,
          }))
      : []

    const insertData: any = {
      client_id: clientId,
      title,
      description: description || null,
      attachments: safeAttachments,
      assigned_to: assigneeId || assignedTo || null,
      status: status || 'todo',
      due_date: dueDate || null,
      due_time: dueTime || null,
      promised_date: promisedDate || null,
      promised_time: promisedTime || null,
      task_id: taskId, // Include the generated task_id
    }

    // Only add section_id if provided (for backwards compatibility)
    if (sectionId) {
      insertData.section_id = sectionId
    }
    
    if (sprintId) insertData.sprint_id = sprintId
    if (priority) insertData.priority = priority
    if (phase || phaseId) insertData.phase = phase || phaseId

    console.log("[v0] Inserting task with data:", JSON.stringify(insertData))

    // Try direct insert first (no RPC needed)
    const { data: task, error } = await supabase
      .from('tasks')
      .insert(insertData)
      .select('id, task_id, title, status, attachments')
      .single()

    if (error) {
      console.error("[v0] Supabase insert error:", error.code, error.message, error.details)
      return NextResponse.json({ error: "Failed to create task", details: error.message }, { status: 500 })
    }

    console.log("[v0] Task created successfully:", task?.id)

    return NextResponse.json({ task, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}

// PUT - Update a task
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { 
      taskId, 
      title, 
      description, 
      assigneeId,
      assignedTo, 
      status, 
      dueDate, 
      dueTime,
      promisedDate,
      promisedTime
    } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    
    // First, fetch the task to check if the user has permission to update it
    const { data: tasks, error: fetchError } = await supabase
      .from('tasks')
      .select('assigned_to, client_id')
      .eq('id', taskId)
      .single()

    if (fetchError || !tasks) {
      console.error("[v0] Error fetching task:", fetchError)
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user is the assignee, client contact, or an admin
    // For now, allow any logged-in user to update tasks assigned to them or their team
    const userRole = (session as any).role || 'user'
    const isAdmin = userRole === 'admin' || userRole === 'manager'
    const isAssignee = tasks.assigned_to === session.userId
    
    console.log("[v0] Task update permission check:", { userRole, isAdmin, isAssignee, taskAssignedTo: tasks.assigned_to, userId: session.userId })
    
    if (!isAdmin && !isAssignee) {
      return NextResponse.json({ error: "You don't have permission to update this task" }, { status: 403 })
    }

    const updateData: any = { updated_at: new Date().toISOString() }
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (assigneeId !== undefined) updateData.assigned_to = assigneeId
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo
    if (status !== undefined) updateData.status = status
    if (dueDate !== undefined) updateData.due_date = dueDate
    if (dueTime !== undefined) updateData.due_time = dueTime
    if (promisedDate !== undefined) updateData.promised_date = promisedDate
    if (promisedTime !== undefined) updateData.promised_time = promisedTime

    const { data: updatedTasks, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()

    if (error) {
      console.error("[v0] Error updating task:", error)
      return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
    }

    const task = updatedTasks && updatedTasks.length > 0 ? updatedTasks[0] : null

    return NextResponse.json({ task, success: true })
  } catch (error) {
    console.error("[v0] Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

// DELETE - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const url = new URL(request.url)
    const taskId = url.searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error("[v0] Error deleting task:", error)
      return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
