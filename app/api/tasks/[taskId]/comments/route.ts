import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// GET - Fetch comments for a task
export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
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

    const supabase = getSupabaseAdminClient()
    const taskId = params.taskId

    console.log("[v0] Fetching comments for task:", taskId)

    const { data: comments, error } = await supabase
      .from("task_comments")
      .select(`
        id,
        task_id,
        created_by,
        text,
        mentions,
        created_at,
        updated_at
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching comments:", error)
      return NextResponse.json([])
    }

    // Enrich comments with user data
    let enrichedComments = comments || []
    if (enrichedComments.length > 0) {
      const userIds = [...new Set(enrichedComments.map(c => c.created_by))]
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", userIds)

      enrichedComments = enrichedComments.map(comment => ({
        ...comment,
        author: users?.find(u => u.id === comment.created_by) || { id: comment.created_by, full_name: "Unknown", email: "" }
      }))
    }

    return NextResponse.json(enrichedComments)
  } catch (error) {
    console.error("[v0] Error fetching comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Add a comment to a task
export async function POST(request: NextRequest, { params }: { params: { taskId: string } }) {
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
    const { text, mentions } = body
    const supabase = getSupabaseAdminClient()
    const taskId = params.taskId

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 })
    }

    console.log("[v0] Creating comment for task:", taskId, "by user:", session.id)

    const { data: comment, error } = await supabase
      .from("task_comments")
      .insert({
        task_id: taskId,
        text: text.trim(),
        created_by: session.id,
        mentions: mentions || [],
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating comment:", error)
      return NextResponse.json({ error: "Failed to create comment", details: error.message }, { status: 400 })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
