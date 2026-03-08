import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// GET /api/campaigns - Fetch all campaigns
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: campaigns, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        clients (
          id,
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching campaigns:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("[v0] Campaigns fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

// POST /api/campaigns - Create new campaign
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { client_id, name, description, start_date, end_date, status, campaign_type, platform } = body

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 })
    }

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .insert({
        client_id: client_id || null,
        name,
        description: description || null,
        start_date: start_date || null,
        end_date: end_date || null,
        status: status || "planning",
        campaign_type: campaign_type || null,
        platform: platform || null,
        created_by: user.id,
      })
      .select(`
        *,
        clients (
          id,
          name
        )
      `)
      .single()

    if (error) {
      console.error("[v0] Error creating campaign:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error("[v0] Campaign creation error:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}
