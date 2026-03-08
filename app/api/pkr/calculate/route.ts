import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"
import { calculateComprehensivePKR, calculateInternalPKR, calculateExternalPKR } from "@/lib/pkr-calculator"

/**
 * GET /api/pkr/calculate
 * Calculate PKR metrics for tasks
 * 
 * Query params:
 * - clientId: Calculate PKR for specific client
 * - sprintId: Calculate PKR for specific sprint
 * - userId: Calculate PKR for specific user
 * - type: 'comprehensive' | 'internal' | 'external' (default: 'comprehensive')
 */
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
    const clientId = url.searchParams.get('clientId')
    const sprintId = url.searchParams.get('sprintId')
    const userId = url.searchParams.get('userId')
    const type = url.searchParams.get('type') || 'comprehensive'

    const supabase = getSupabaseAdminClient()
    
    // Build query based on filters
    let query = supabase
      .from('tasks')
      .select('*')
    
    if (clientId) {
      query = query.eq('client_id', clientId)
    }
    
    if (sprintId) {
      query = query.eq('sprint_id', sprintId)
    }
    
    if (userId) {
      query = query.eq('assigned_to', userId)
    }

    const { data: tasks, error } = await query

    if (error) {
      console.error("[v0] Error fetching tasks for PKR:", error)
      return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
    }

    // Calculate PKR based on type
    let result: any
    
    switch (type) {
      case 'internal':
        result = calculateInternalPKR(tasks || [], userId || undefined)
        break
      case 'external':
        result = calculateExternalPKR(tasks || [], userId || undefined)
        break
      case 'comprehensive':
      default:
        result = calculateComprehensivePKR(tasks || [], userId || undefined)
        break
    }

    return NextResponse.json({
      pkr: result,
      tasks: tasks || [],
      taskCount: tasks?.length || 0,
      filters: {
        clientId,
        sprintId,
        userId,
        type
      }
    })
  } catch (error) {
    console.error("[v0] Error calculating PKR:", error)
    return NextResponse.json({ error: "Failed to calculate PKR" }, { status: 500 })
  }
}

/**
 * POST /api/pkr/calculate
 * Calculate PKR for a custom set of tasks
 */
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

    const { tasks, userId, type } = await request.json()

    if (!Array.isArray(tasks)) {
      return NextResponse.json({ error: "Tasks array is required" }, { status: 400 })
    }

    // Calculate PKR based on type
    let result: any
    
    switch (type) {
      case 'internal':
        result = calculateInternalPKR(tasks, userId)
        break
      case 'external':
        result = calculateExternalPKR(tasks, userId)
        break
      case 'comprehensive':
      default:
        result = calculateComprehensivePKR(tasks, userId)
        break
    }

    return NextResponse.json({
      pkr: result,
      taskCount: tasks.length
    })
  } catch (error) {
    console.error("[v0] Error calculating PKR:", error)
    return NextResponse.json({ error: "Failed to calculate PKR" }, { status: 500 })
  }
}
