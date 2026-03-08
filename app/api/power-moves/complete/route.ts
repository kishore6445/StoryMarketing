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
    const { powerMoveId, completed } = body

    if (!powerMoveId) {
      return NextResponse.json({ error: "Power move ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    const { data: powerMoves, error } = await supabase
      .from("power_moves_tracking")
      .update({
        completed: completed || false,
        completed_at: completed ? new Date().toISOString() : null,
        completed_by: completed ? session.userId : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", powerMoveId)
      .select()

    if (error) {
      console.error("[v0] Error updating power move:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const powerMove = powerMoves && powerMoves.length > 0 ? powerMoves[0] : null
    return NextResponse.json({ success: true, powerMove })
  } catch (error) {
    console.error("[v0] Error completing power move:", error)
    return NextResponse.json({ error: "Failed to complete power move" }, { status: 500 })
  }
}
