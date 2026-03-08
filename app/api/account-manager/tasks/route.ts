import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/db'
import { verifyAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sprintId = searchParams.get('sprintId')
    const clientId = searchParams.get('clientId')

    const supabase = getSupabaseClient()
    
    // Query sprint_tasks table
    let sprintTasksQuery = supabase
      .from('sprint_tasks')
      .select('*, assigned_user:users(id, full_name, email)')
      .order('created_at', { ascending: false })

    if (sprintId === 'backlog') {
      sprintTasksQuery = sprintTasksQuery.is('sprint_id', null)
      if (clientId && clientId !== 'all') {
        sprintTasksQuery = sprintTasksQuery.eq('client_id', clientId)
      }
    } else if (sprintId && sprintId !== 'all') {
      sprintTasksQuery = sprintTasksQuery.eq('sprint_id', sprintId)
    } else if (clientId && clientId !== 'all') {
      sprintTasksQuery = sprintTasksQuery.eq('client_id', clientId)
    }

    // Query regular tasks table (for tasks created in My Tasks with sprint_id)
    let regularTasksQuery = supabase
      .from('tasks')
      .select('*, assigned_user:users(id, full_name, email)')
      .not('sprint_id', 'is', null) // Only get tasks that have a sprint_id
      .order('created_at', { ascending: false })

    if (sprintId === 'backlog') {
      regularTasksQuery = supabase
        .from('tasks')
        .select('*, assigned_user:users(id, full_name, email)')
        .is('sprint_id', null)
        .order('created_at', { ascending: false })
      if (clientId && clientId !== 'all') {
        regularTasksQuery = regularTasksQuery.eq('client_id', clientId)
      }
    } else if (sprintId && sprintId !== 'all') {
      regularTasksQuery = regularTasksQuery.eq('sprint_id', sprintId)
    } else if (clientId && clientId !== 'all') {
      regularTasksQuery = regularTasksQuery.eq('client_id', clientId)
    }

    // Execute both queries in parallel
    const [sprintTasksResult, regularTasksResult] = await Promise.all([
      sprintTasksQuery,
      regularTasksQuery
    ])

    if (sprintTasksResult.error) {
      console.error('[v0] Error fetching sprint_tasks:', sprintTasksResult.error)
    }

    if (regularTasksResult.error) {
      console.error('[v0] Error fetching regular tasks:', regularTasksResult.error)
    }

    // Merge tasks from both tables
    const sprintTasks = sprintTasksResult.data || []
    const regularTasks = regularTasksResult.data || []
    const allTasks = [...sprintTasks, ...regularTasks]

    return NextResponse.json({ success: true, tasks: allTasks })
  } catch (error) {
    console.error('[v0] Error in GET /api/account-manager/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sprintId, clientId, title, description, status, priority, assignedTo, dueDate, phase } = body

    if (!clientId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { data: task, error } = await supabase
      .from('sprint_tasks')
      .insert({
        sprint_id: sprintId || null,
        client_id: clientId,
        title,
        description: description || null,
        status: status || 'todo',
        priority: priority || 'medium',
        assigned_to: assignedTo || null,
        due_date: dueDate || null,
        phase: phase || null
      })
      .select('*, assigned_user:users(id, full_name, email)')
      .single()

    if (error) {
      console.error('[v0] Error creating task:', error)
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('[v0] Error in POST /api/account-manager/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, ...updates } = body

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    
    const updateData: any = {}
    if (updates.sprintId !== undefined) updateData.sprint_id = updates.sprintId
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
    if (updates.phase !== undefined) updateData.phase = updates.phase

    const { data: task, error } = await supabase
      .from('sprint_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select('*, assigned_user:users(id, full_name, email)')
      .single()

    if (error) {
      console.error('[v0] Error updating task:', error)
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('[v0] Error in PUT /api/account-manager/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from('sprint_tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('[v0] Error deleting task:', error)
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error in DELETE /api/account-manager/tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
