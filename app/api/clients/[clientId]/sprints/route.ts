import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params

  try {
    // Validate session
    const authHeader = request.headers.get("authorization")
    const sessionToken = authHeader?.replace("Bearer ", "") || request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session || !clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getSupabaseAdminClient()

    // Fetch sprints for this client
    const { data: sprints, error } = await supabase
      .from("sprints")
      .select("id, name, start_date, end_date, status")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching sprints:", error)
      return NextResponse.json({ error: "Failed to fetch sprints" }, { status: 500 })
    }

    console.log("[v0] Fetched sprints:", { clientId, count: sprints?.length || 0, sprints })

    return NextResponse.json({
      success: true,
      sprints: sprints || []
    })
  } catch (error) {
    console.error("[v0] Error in GET /api/clients/[clientId]/sprints:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params

  try {
    const authHeader = request.headers.get("authorization")
    const sessionToken = authHeader?.replace("Bearer ", "") || request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session || !clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, start_date, end_date, status = "planning" } = await request.json()

    if (!name || !start_date || !end_date) {
      return NextResponse.json(
        { error: "Missing required fields: name, start_date, end_date" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()

    const { data: newSprint, error } = await supabase
      .from("sprints")
      .insert([
        {
          client_id: clientId,
          name,
          start_date,
          end_date,
          status
        }
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating sprint:", error)
      return NextResponse.json({ error: "Failed to create sprint" }, { status: 500 })
    }

    console.log("[v0] Sprint created:", newSprint)

    return NextResponse.json(newSprint)
  } catch (error) {
    console.error("[v0] Error in POST /api/clients/[clientId]/sprints:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
