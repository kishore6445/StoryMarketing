import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { getUserFromRequest } from "@/lib/auth"

// PUT /api/campaigns/[id] - Update campaign
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { client_id, name, description, start_date, end_date, status, content, campaign_type, platform } = body

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (client_id !== undefined) updates.client_id = client_id
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (start_date !== undefined) updates.start_date = start_date
    if (end_date !== undefined) updates.end_date = end_date
    if (status !== undefined) updates.status = status
    if (content !== undefined) updates.content = content
    if (campaign_type !== undefined) updates.campaign_type = campaign_type
    if (platform !== undefined) updates.platform = platform

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        clients (
          id,
          name
        )
      `)
      .single()

    if (error) {
      console.error("[v0] Error updating campaign:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error("[v0] Campaign update error:", error)
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 })
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[v0] Error deleting campaign:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Campaign deletion error:", error)
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 })
  }
}
