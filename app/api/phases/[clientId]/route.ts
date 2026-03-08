import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

// GET - Fetch all phase data for a client
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
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

    const supabase = getSupabaseAdminClient()
    
    // Fetch client phases with sections, tasks, and documents
    const { data: phases, error: phasesError } = await supabase
      .from('client_phases')
      .select(`
        *,
        phase_sections (
          *,
          tasks (*),
          documents (*)
        ),
        phase_strategy (*)
      `)
      .eq('client_id', params.clientId)
      .order('phase_order', { ascending: true })

    if (phasesError) {
      console.error("[v0] Error fetching phases:", phasesError)
      return NextResponse.json({ error: "Failed to fetch phases" }, { status: 500 })
    }

    return NextResponse.json({ phases: phases || [] })
  } catch (error) {
    console.error("[v0] Error fetching phases:", error)
    return NextResponse.json({ error: "Failed to fetch phases" }, { status: 500 })
  }
}
