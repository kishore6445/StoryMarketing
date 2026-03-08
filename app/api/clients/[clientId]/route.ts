import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/db"
import { validateSession } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { clientId: string } }) {
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

    const { name, description, brandColor, is_active } = await request.json()

    const supabase = getSupabaseAdminClient()
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (brandColor !== undefined) updateData.brand_color = brandColor
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: client, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', params.clientId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating client:", error)
      return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
    }

    return NextResponse.json({ client, success: true })
  } catch (error) {
    console.error("[v0] Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { clientId: string } }) {
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
    
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('clients')
      .update({ is_active: false })
      .eq('id', params.clientId)

    if (error) {
      console.error("[v0] Error deleting client:", error)
      return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
