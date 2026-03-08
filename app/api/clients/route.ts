import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Validate session
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
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("[v0] Error fetching clients:", error)
      return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
    }

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("[v0] Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

// Phase configuration with sections
const PHASE_STRUCTURE = [
  {
    name: 'Story Research',
    order: 1,
    sections: ['Story Foundation', 'Research Completion', 'Active Tasks']
  },
  {
    name: 'Story Writing',
    order: 2,
    sections: ['Audience Insight', 'Content Inventory', 'Execution Focus']
  },
  {
    name: 'Story Design',
    order: 3,
    sections: ['Brand Visual System', 'Creative Assets', 'Design Quality Gate', 'Additional Tasks']
  },
  {
    name: 'Story Website',
    order: 4,
    sections: ['Website Architecture', 'Conversion System']
  },
  {
    name: 'Story Distribution',
    order: 5,
    sections: ['Channel Overview']
  },
  {
    name: 'Story Analytics',
    order: 6,
    sections: ['Channel Performance', 'AI Insights']
  },
  {
    name: 'Story Learning',
    order: 7,
    sections: ['Learnings Log', 'Decisions Taken', 'System Updates', 'Next Cycle Plan']
  }
]

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || request.cookies.get('session')?.value
    
    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const session = await validateSession(sessionToken)
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { name, description, brandColor, userId } = await request.json()

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    
    // Create client
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name,
        description,
        brand_color: brandColor || '#0071E3',
        user_id: userId || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating client:", error)
      return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
    }

    // Initialize phases for the client
    for (const phase of PHASE_STRUCTURE) {
      const { data: clientPhase, error: phaseError } = await supabase
        .from('client_phases')
        .insert({
          client_id: client.id,
          phase_name: phase.name,
          phase_order: phase.order,
          status: 'not_started'
        })
        .select()
        .single()

      if (phaseError) {
        console.error(`[v0] Error creating phase ${phase.name}:`, phaseError)
        continue
      }

      // Create sections for this phase
      for (let i = 0; i < phase.sections.length; i++) {
        const { error: sectionError } = await supabase
          .from('phase_sections')
          .insert({
            client_phase_id: clientPhase.id,
            section_name: phase.sections[i],
            section_order: i + 1
          })

        if (sectionError) {
          console.error(`[v0] Error creating section ${phase.sections[i]}:`, sectionError)
        }
      }
    }

    return NextResponse.json({ client, success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
