import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

const PHASE_NAMES = [
  'Story Research',
  'Story Writing',
  'Story Design',
  'Story Website',
  'Story Distribution',
  'Story Analytics',
  'Story Learning',
]

// GET - Fetch all phase strategies for a client
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

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const phaseName = searchParams.get('phaseName')

    const supabase = getSupabaseAdminClient()

    if (clientId && phaseName) {
      // Get specific phase strategy for a client
      const { data: clientPhases, error: phasesError } = await supabase
        .from('client_phases')
        .select(`
          id,
          phase_name,
          phase_strategy (
            id,
            victory_target,
            power_moves
          )
        `)
        .eq('client_id', clientId)
        .eq('phase_name', phaseName)
        .maybeSingle()

      if (phasesError) {
        console.error("[v0] Error fetching phase strategy:", phasesError)
        return NextResponse.json({ error: "Failed to fetch phase strategy" }, { status: 500 })
      }

      return NextResponse.json({ 
        strategy: clientPhases?.phase_strategy?.[0] || null,
        phaseId: clientPhases?.id || null
      })
    } else if (clientId) {
      // Get all phase strategies for a specific client
      const { data: clientPhases, error: phasesError } = await supabase
        .from('client_phases')
        .select(`
          id,
          phase_name,
          phase_strategy (
            id,
            victory_target,
            power_moves
          )
        `)
        .eq('client_id', clientId)
        .order('phase_order')

      if (phasesError) {
        console.error("[v0] Error fetching client phases:", phasesError)
        return NextResponse.json({ error: "Failed to fetch phase strategies" }, { status: 500 })
      }

      return NextResponse.json({ phases: clientPhases })
    } else {
      // Get all clients with their phase strategies
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          client_phases (
            id,
            phase_name,
            phase_strategy (
              id,
              victory_target,
              power_moves
            )
          )
        `)
        .eq('is_active', true)
        .order('name')

      if (clientsError) {
        console.error("[v0] Error fetching clients:", clientsError)
        return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
      }

      return NextResponse.json({ clients })
    }
  } catch (error) {
    console.error("[v0] Error in GET /api/phase-strategy:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create or update phase strategy
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

    const { clientId, phaseName, victoryTarget, powerMoves } = await request.json()

    if (!clientId || !phaseName || !victoryTarget) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()

    // Get or create client_phase
    let { data: clientPhase, error: phaseError } = await supabase
      .from('client_phases')
      .select('id')
      .eq('client_id', clientId)
      .eq('phase_name', phaseName)
      .single()

    if (phaseError && phaseError.code !== 'PGRST116') {
      console.error("[v0] Error fetching client phase:", phaseError)
      return NextResponse.json({ error: "Failed to fetch client phase" }, { status: 500 })
    }

    if (!clientPhase) {
      // Create the client phase
      const phaseOrder = PHASE_NAMES.indexOf(phaseName)
      const { data: newPhase, error: createError } = await supabase
        .from('client_phases')
        .insert({
          client_id: clientId,
          phase_name: phaseName,
          phase_order: phaseOrder >= 0 ? phaseOrder : 99,
        })
        .select()
        .single()

      if (createError) {
        console.error("[v0] Error creating client phase:", createError)
        return NextResponse.json({ error: "Failed to create client phase" }, { status: 500 })
      }

      clientPhase = newPhase
    }

    // Check if strategy exists
    const { data: existingStrategy } = await supabase
      .from('phase_strategy')
      .select('id')
      .eq('client_phase_id', clientPhase.id)
      .maybeSingle()

    if (existingStrategy) {
      // Update existing strategy
      const { error: updateError } = await supabase
        .from('phase_strategy')
        .update({
          victory_target: victoryTarget,
          power_moves: powerMoves || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStrategy.id)

      if (updateError) {
        console.error("[v0] Error updating phase strategy:", updateError)
        return NextResponse.json({ error: "Failed to update phase strategy" }, { status: 500 })
      }
    } else {
      // Create new strategy
      const { error: insertError } = await supabase
        .from('phase_strategy')
        .insert({
          client_phase_id: clientPhase.id,
          victory_target: victoryTarget,
          power_moves: powerMoves || [],
        })

      if (insertError) {
        console.error("[v0] Error creating phase strategy:", insertError)
        return NextResponse.json({ error: "Failed to create phase strategy" }, { status: 500 })
      }
    }

    // Insert power moves into power_moves_tracking table
    if (powerMoves && Array.isArray(powerMoves) && powerMoves.length > 0) {
      const powerMovesToInsert = powerMoves.map((powerMove: string) => ({
        client_id: clientId,
        phase_id: clientPhase.id,
        power_move_text: powerMove,
        created_by: session.userId,
        completed: false,
      }))

      const { error: trackingError } = await supabase
        .from('power_moves_tracking')
        .insert(powerMovesToInsert)

      if (trackingError) {
        console.error("[v0] Error inserting power moves into tracking:", trackingError)
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error in POST /api/phase-strategy:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
