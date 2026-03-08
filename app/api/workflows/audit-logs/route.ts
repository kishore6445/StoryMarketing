import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserFromRequest } from "@/lib/auth"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch workflow audit logs
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clientId = request.nextUrl.searchParams.get("clientId")
    const action = request.nextUrl.searchParams.get("action")
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50")

    let query = supabase
      .from("workflow_audit_logs")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    if (action) {
      query = query.eq("action", action)
    }

    const { data: logs, error } = await query

    if (error) {
      console.error("[v0] Error fetching audit logs:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ logs: logs || [] })
  } catch (error) {
    console.error("[v0] Audit logs fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
