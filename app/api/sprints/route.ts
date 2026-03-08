import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserFromToken } from "@/lib/auth"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")

    let query = supabase
      .from('sprints')
      // .select('*')
      .select(`
        *,
        client_id,
        clients (
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (clientId && clientId !== 'all') {
      query = query.eq('client_id', clientId)
    }

    const { data: sprints, error } = await query

    if (error) {
      console.error("[v0] Error fetching sprints:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sprints: sprints || [] })
  } catch (error: any) {
    console.error("[v0] Error in sprints GET:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
