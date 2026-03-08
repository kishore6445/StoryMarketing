import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const campaignId = request.nextUrl.searchParams.get("campaign_id")

    let query = supabase
      .from("campaign_metrics")
      .select("*")
      .order("date", { ascending: false })

    if (campaignId) {
      query = query.eq("campaign_id", campaignId)
    }

    const { data: metrics, error } = await query

    if (error) {
      console.error("[v0] Error fetching campaign metrics:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error("[v0] Campaign metrics fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch campaign metrics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { campaign_id, date, impressions, reach, engagement, conversions, spend } = body

    if (!campaign_id || !date) {
      return NextResponse.json({ error: "campaign_id and date are required" }, { status: 400 })
    }

    const { data: metric, error } = await supabase
      .from("campaign_metrics")
      .insert({
        campaign_id,
        date,
        impressions: impressions || 0,
        reach: reach || 0,
        engagement: engagement || 0,
        conversions: conversions || 0,
        spend: spend || 0,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating campaign metric:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, metric }, { status: 201 })
  } catch (error) {
    console.error("[v0] Campaign metric creation error:", error)
    return NextResponse.json({ error: "Failed to create campaign metric" }, { status: 500 })
  }
}
