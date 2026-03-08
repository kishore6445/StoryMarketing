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

    const { actionItemId, completed } = await request.json()

    if (!actionItemId) {
      return NextResponse.json({ error: "Action item ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { error } = await supabase
      .from("meeting_action_items")
      .update({ completed, updated_at: new Date().toISOString() })
      .eq("id", actionItemId)

    if (error) {
      console.error("[v0] Error updating meeting action item:", error)
      return NextResponse.json({ error: "Failed to update action item" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error completing meeting action item:", error)
    return NextResponse.json({ error: "Failed to complete action item" }, { status: 500 })
  }
}
